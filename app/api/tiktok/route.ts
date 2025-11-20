import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getCachedVideo, saveVideoToCache } from "@/models/video";

export const runtime = "nodejs";

type TikTokPayload = {
  videoId: string;
  description: string;
  author: string;
  avatar?: string;
  cover?: string;
  music?: string;
  duration: number;
  resolution?: string;
  bitrateKbps?: number;
  sizeBytes?: number;
  publishedAt?: string;
  noWatermarkUrl: string;
  proxyDownload: string;
  platform: "tiktok";
};

export async function POST(request: Request) {
  const debugTag = randomBytes(3).toString("hex");
  try {
    const body = await request.json();
    const rawUrl = String(body?.url ?? "").trim();

    if (!rawUrl) {
      return NextResponse.json(
        { success: false, message: "Bạn chưa cung cấp link TikTok." },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = await getCachedVideo(rawUrl, "tiktok");
    if (cached) {
      console.info(`[TikTok:${debugTag}] Cache hit for ${rawUrl}`);
      return NextResponse.json({ success: true, data: cached, cached: true });
    }
    console.info(`[TikTok:${debugTag}] Cache miss, analyzing...`);

    // Extract video ID from TikTok URL
    const videoId = extractTikTokVideoId(rawUrl);
    if (!videoId) {
      return NextResponse.json(
        { success: false, message: "Không thể nhận diện video từ link TikTok này." },
        { status: 400 }
      );
    }

    console.info(`[TikTok:${debugTag}] Extracted video ID: ${videoId}`);

    // Use TikWM API for TikTok (same as Douyin fallback)
    const payload = await fetchViaTikwm(rawUrl, videoId, debugTag);

    // Save to cache
    await saveVideoToCache(rawUrl, "tiktok", payload);
    console.info(`[TikTok:${debugTag}] Saved to cache: ${videoId}`);

    return NextResponse.json({ success: true, data: payload, cached: false });
  } catch (error) {
    console.error(`[TikTok API][${debugTag}] error:`, error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể xử lý video TikTok. Thử lại sau nhé.",
      },
      { status: 500 }
    );
  }
}

function extractTikTokVideoId(url: string): string | null {
  // Handle various TikTok URL formats
  // https://www.tiktok.com/@username/video/1234567890
  // https://vm.tiktok.com/xxxxx/
  // https://tiktok.com/@username/video/1234567890

  // Direct video ID format
  const directMatch = url.match(/\/video\/(\d+)/);
  if (directMatch) {
    return directMatch[1];
  }

  // Short URL format - need to resolve first
  if (url.includes("vm.tiktok.com") || url.includes("vt.tiktok.com")) {
    // Return the short URL itself, will be resolved by TikWM
    return null;
  }

  return null;
}

async function fetchViaTikwm(
  sourceUrl: string,
  videoId: string | null,
  debugTag?: string
): Promise<TikTokPayload> {
  const tikwmUrl = `https://tikwm.com/api/?url=${encodeURIComponent(sourceUrl)}&hd=1`;
  
  console.info(`[TikTok:${debugTag}] Fetching from TikWM: ${tikwmUrl}`);

  const response = await fetch(tikwmUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`TikWM API returned ${response.status}`);
  }

  const data = await response.json();
  
  if (!data?.data) {
    throw new Error("TikWM không trả về dữ liệu video.");
  }

  return buildPayloadFromTikwm(data.data, videoId || data.data?.aweme_id || "unknown");
}

function buildPayloadFromTikwm(
  data: any,
  fallbackVideoId: string
): TikTokPayload {
  const videoUrl = data?.hdplay ?? data?.play;
  if (!videoUrl) {
    throw new Error("TikWM không trả về link video.");
  }

  const videoId = data?.aweme_id ?? fallbackVideoId;
  const duration = Number(data?.duration ?? 0);
  const bitrate = Number(data?.bitrate ?? 0);
  const sizeBytes =
    typeof data?.size === "number"
      ? data.size
      : typeof data?.size_mb === "number"
        ? data.size_mb * 1024 * 1024
        : undefined;
  const authorField = data?.author;
  const authorName =
    typeof authorField === "string"
      ? authorField
      : authorField?.nickname ?? "Không rõ";
  const authorAvatar =
    authorField && typeof authorField === "object"
      ? authorField.avatar
      : undefined;

  return {
    videoId,
    description: data?.title ?? "",
    author: authorName,
    avatar: authorAvatar,
    cover: data?.cover ?? data?.origin_cover,
    music: data?.music_info?.title ?? data?.music ?? "",
    duration: Number.isFinite(duration) ? duration : 0,
    resolution: data?.video_resolution ?? data?.ratio,
    bitrateKbps: Number.isFinite(bitrate) ? Math.round(bitrate / 1000) : undefined,
    sizeBytes,
    publishedAt: data?.create_time
      ? new Date(Number(data.create_time) * 1000).toISOString()
      : undefined,
    noWatermarkUrl: videoUrl,
    proxyDownload: `/api/tiktok/download?source=${encodeURIComponent(
      videoUrl
    )}&filename=${videoId}.mp4`,
    platform: "tiktok",
  };
}

