import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getCachedVideo, saveVideoToCache } from "@/models/video";

export const runtime = "nodejs";

type FacebookPayload = {
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
  platform: "facebook";
};

export async function POST(request: Request) {
  const debugTag = randomBytes(3).toString("hex");
  try {
    const body = await request.json();
    const rawUrl = String(body?.url ?? "").trim();

    if (!rawUrl) {
      return NextResponse.json(
        { success: false, message: "Bạn chưa cung cấp link Facebook." },
        { status: 400 }
      );
    }

    // Check cache first (before resolving share links to avoid unnecessary work)
    const cached = await getCachedVideo(rawUrl, "facebook");
    if (cached) {
      console.info(`[Facebook:${debugTag}] Cache hit for ${rawUrl}`);
      return NextResponse.json({ success: true, data: cached, cached: true });
    }
    console.info(`[Facebook:${debugTag}] Cache miss, analyzing...`);

    // Resolve share links first
    let resolvedUrl = rawUrl;
    if (rawUrl.includes("/share/r/") || rawUrl.includes("/share/v/")) {
      console.info(`[Facebook:${debugTag}] Detected share link, resolving...`);
      try {
        const resolved = await resolveShareLink(rawUrl, debugTag);
        if (resolved) {
          resolvedUrl = resolved;
          console.info(`[Facebook:${debugTag}] Resolved to: ${resolvedUrl}`);
        }
      } catch (error) {
        console.warn(`[Facebook:${debugTag}] Failed to resolve share link:`, error);
        // Continue with original URL
      }
    }

    // Extract video ID from Facebook URL
    let videoId = extractFacebookVideoId(resolvedUrl);
    
    // If we can't extract video ID, try to use a generic ID or proceed with scraping
    if (!videoId) {
      // For share links, we might not have a video ID in URL, but we can still scrape
      if (resolvedUrl.includes("/share/r/") || resolvedUrl.includes("/share/v/") || resolvedUrl.includes("facebook.com")) {
        // Generate a temporary ID based on URL hash or use resolved URL as identifier
        videoId = resolvedUrl.split("/").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "unknown";
        console.info(`[Facebook:${debugTag}] Using generated video ID: ${videoId}`);
      } else {
        return NextResponse.json(
          { success: false, message: "Không thể nhận diện video từ link Facebook này. Vui lòng dùng link video trực tiếp." },
          { status: 400 }
        );
      }
    } else {
      console.info(`[Facebook:${debugTag}] Extracted video ID: ${videoId}`);
    }

    // Fetch video info
    const payload = await fetchFacebookVideo(resolvedUrl, videoId, debugTag);

    // Save to cache (use original URL for cache key)
    await saveVideoToCache(rawUrl, "facebook", payload);
    console.info(`[Facebook:${debugTag}] Saved to cache: ${videoId}`);

    return NextResponse.json({ success: true, data: payload, cached: false });
  } catch (error) {
    console.error(`[Facebook API][${debugTag}] error:`, error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể xử lý video Facebook. Thử lại sau nhé.",
      },
      { status: 500 }
    );
  }
}

async function resolveShareLink(shareUrl: string, debugTag?: string): Promise<string | null> {
  try {
    // Follow redirect from share link
    const response = await fetch(shareUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (response.ok) {
      const finalUrl = response.url;
      console.info(`[Facebook:${debugTag}] Share link resolved to: ${finalUrl}`);
      
      // Also try to extract from HTML if URL doesn't contain video ID
      if (!extractFacebookVideoId(finalUrl)) {
        const html = await response.text();
        
        // Try to find video URL in HTML
        const videoUrlPatterns = [
          /"video_src":"([^"]+)"/,
          /"hd_src":"([^"]+)"/,
          /"sd_src":"([^"]+)"/,
          /video_src_no_ratelimit":"([^"]+)"/,
          /"playable_url":"([^"]+)"/,
        ];
        
        for (const pattern of videoUrlPatterns) {
          const match = html.match(pattern);
          if (match && match[1]) {
            console.info(`[Facebook:${debugTag}] Found video URL in HTML, confirmed video page`);
            // Return the original resolved URL, we'll use it for scraping
            return finalUrl;
          }
        }
      }
      
      return finalUrl;
    }
  } catch (error) {
    console.warn(`[Facebook:${debugTag}] Error resolving share link:`, error);
  }
  return null;
}

function extractFacebookVideoId(url: string): string | null {
  // Handle various Facebook URL formats
  // https://www.facebook.com/watch/?v=VIDEO_ID
  // https://www.facebook.com/username/videos/VIDEO_ID
  // https://www.facebook.com/reel/VIDEO_ID (Reel)
  // https://www.facebook.com/username/reels/VIDEO_ID (Reel)
  // https://fb.watch/VIDEO_ID
  // https://m.facebook.com/watch/?v=VIDEO_ID
  // https://m.facebook.com/reel/VIDEO_ID

  const patterns = [
    // Reel formats (check first)
    /facebook\.com\/reel\/([a-zA-Z0-9_-]+)/,
    /facebook\.com\/[^\/]+\/reels\/([a-zA-Z0-9_-]+)/,
    // Watch formats
    /(?:facebook\.com\/watch\/\?v=|facebook\.com\/.*\/videos\/)([0-9]+)/,
    /facebook\.com\/.*[?&]v=([0-9]+)/,
    // Short URL formats
    /fb\.watch\/([a-zA-Z0-9_-]+)/,
    // Mobile formats
    /m\.facebook\.com\/reel\/([a-zA-Z0-9_-]+)/,
    /m\.facebook\.com\/watch\/\?v=([0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

async function fetchFacebookVideo(
  originalUrl: string,
  videoId: string,
  debugTag?: string
): Promise<FacebookPayload> {
  // Use Facebook Graph API or scraping service
  // Try multiple services for reliability
  
  // Skip external services if they're not accessible, go straight to direct scraping
  // const services = [
  //   `https://api.savefrom.net/api/info?url=${encodeURIComponent(originalUrl)}`,
  //   `https://www.getfvid.com/api/info?url=${encodeURIComponent(originalUrl)}`,
  // ];
  
  const services: string[] = []; // Disable external services for now

  let videoData: {
    url?: string;
    download_url?: string;
    video_url?: string;
    formats?: unknown[];
    title?: string;
    description?: string;
    duration?: number;
    thumbnail?: string;
    avatar?: string;
    cover?: string;
    author?: string;
    uploader?: string;
    resolution?: string;
    video_resolution?: string;
    bitrate?: number;
    filesize?: number;
    size?: number;
    upload_date?: string;
  } | null = null;
  let lastError: Error | null = null;

  // Try multiple services (if any)
  for (let i = 0; i < services.length; i++) {
    try {
      console.info(`[Facebook:${debugTag}] Trying service ${i + 1}: ${services[i]}`);
      const response = await fetch(services[i], {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        
        // Handle different response formats
        if (data?.url || data?.download_url || data?.video_url || data?.formats) {
          videoData = data;
          console.info(`[Facebook:${debugTag}] Service ${i + 1} success`);
          break;
        }
        
        // Handle savefrom format
        if (data?.status === "success" && data?.data) {
          const videoInfo = Array.isArray(data.data) ? data.data[0] : data.data;
          if (videoInfo?.url) {
            videoData = {
              url: videoInfo.url,
              title: videoInfo.title || "",
              duration: videoInfo.duration || 0,
              thumbnail: videoInfo.thumbnail,
              author: videoInfo.author || "",
            };
            console.info(`[Facebook:${debugTag}] SaveFrom service success`);
            break;
          }
        }
      }
    } catch (error) {
      console.warn(`[Facebook:${debugTag}] Service ${i + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error(`Service ${i + 1} failed`);
      continue;
    }
  }

  // Fallback: Try scraping Facebook page directly
  if (!videoData) {
    console.info(`[Facebook:${debugTag}] Attempting direct page scrape from: ${originalUrl}`);
    try {
      const pageResponse = await fetch(originalUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1",
        },
        cache: "no-store",
        redirect: "follow",
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (pageResponse.ok) {
        const html = await pageResponse.text();
        console.info(`[Facebook:${debugTag}] HTML length: ${html.length} chars`);
        
        // Try multiple patterns to extract video URL (with more comprehensive patterns)
        const videoUrlPatterns = [
          // Standard patterns
          /"video_src":"([^"]+)"/,
          /"hd_src":"([^"]+)"/,
          /"sd_src":"([^"]+)"/,
          /video_src_no_ratelimit":"([^"]+)"/,
          /"playable_url":"([^"]+)"/,
          /"playable_url_quality_hd":"([^"]+)"/,
          /"browser_native_hd_url":"([^"]+)"/,
          /"browser_native_sd_url":"([^"]+)"/,
          // Additional patterns for newer Facebook structure
          /"video":\s*\{[^}]*"url":\s*"([^"]+)"/,
          /"source":\s*"([^"]+\.mp4[^"]*)"/,
          /"videoUrl":\s*"([^"]+)"/,
          /"contentUrl":\s*"([^"]+\.mp4[^"]*)"/,
          // Meta tags
          /<meta\s+property="og:video:url"\s+content="([^"]+)"/,
          /<meta\s+property="og:video"\s+content="([^"]+)"/,
          // JSON-LD patterns
          /"@type":\s*"VideoObject"[^}]*"contentUrl":\s*"([^"]+)"/,
        ];
        
        let videoUrl: string | null = null;
        let matchedPattern: string | null = null;
        for (const pattern of videoUrlPatterns) {
          const match = html.match(pattern);
          if (match && match[1]) {
            videoUrl = match[1];
            matchedPattern = pattern.toString();
            console.info(`[Facebook:${debugTag}] Found video URL with pattern: ${matchedPattern.substring(0, 50)}...`);
            break;
          }
        }
        
        if (videoUrl) {
          // Decode URL (handle various escape sequences)
          let decodedUrl = videoUrl
            .replace(/\\u002F/g, "/")
            .replace(/\\u003D/g, "=")
            .replace(/\\u0026/g, "&")
            .replace(/\\\//g, "/")
            .replace(/\\"/g, '"')
            .replace(/&amp;/g, "&");
          
          // Additional URL cleanup
          if (decodedUrl.startsWith("\\")) {
            decodedUrl = decodedUrl.substring(1);
          }
          
          console.info(`[Facebook:${debugTag}] Decoded video URL: ${decodedUrl.substring(0, 100)}...`);
          
          const titleMatch = html.match(/<title>([^<]+)<\/title>/) || 
                            html.match(/"name":"([^"]+)"/) ||
                            html.match(/"content":"([^"]+)"\s+property="og:title"/) ||
                            html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/);
          const title = titleMatch ? titleMatch[1].trim() : "";
          
          // Try to extract author
          const authorMatch = html.match(/"author":"([^"]+)"/) ||
                             html.match(/"ownerName":"([^"]+)"/) ||
                             html.match(/<meta\s+property="article:author"\s+content="([^"]+)"/) ||
                             html.match(/<meta\s+property="og:site_name"\s+content="([^"]+)"/);
          const author = authorMatch ? authorMatch[1] : "";
          
          // Try to extract thumbnail
          const thumbnailMatch = html.match(/"thumbnail":"([^"]+)"/) ||
                                html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
          const thumbnail = thumbnailMatch ? thumbnailMatch[1].replace(/\\\//g, "/") : undefined;
          
          videoData = {
            url: decodedUrl,
            title: title,
            duration: 0,
            thumbnail: thumbnail,
            author: author,
          };
          console.info(`[Facebook:${debugTag}] Direct scrape success - Title: ${title.substring(0, 50)}...`);
        } else {
          // Log a sample of HTML for debugging
          const sampleHtml = html.substring(0, 2000);
          console.warn(`[Facebook:${debugTag}] No video URL found in HTML. Sample: ${sampleHtml.substring(0, 500)}...`);
          console.warn(`[Facebook:${debugTag}] This might be a private video or Facebook has changed their HTML structure.`);
        }
      } else {
        console.warn(`[Facebook:${debugTag}] Page response not OK: ${pageResponse.status} ${pageResponse.statusText}`);
      }
    } catch (error) {
      console.warn(`[Facebook:${debugTag}] Direct scrape failed:`, error);
    }
  }

  // Process video data
  if (videoData) {
    const videoUrl = videoData.url || videoData.download_url || videoData.video_url;
    
    if (!videoUrl) {
      throw new Error("Không tìm thấy link video từ Facebook.");
    }

    return {
      videoId,
      description: videoData.title || videoData.description || "",
      author: videoData.author || videoData.uploader || "Unknown",
      avatar: videoData.avatar || videoData.thumbnail,
      cover: videoData.thumbnail || videoData.cover,
      music: "",
      duration: Math.round(videoData.duration || 0),
      resolution: videoData.resolution || videoData.video_resolution,
      bitrateKbps: videoData.bitrate ? Math.round(videoData.bitrate / 1000) : undefined,
      sizeBytes: videoData.filesize || videoData.size,
      publishedAt: videoData.upload_date 
        ? new Date(videoData.upload_date).toISOString()
        : undefined,
      noWatermarkUrl: videoUrl,
      proxyDownload: `/api/facebook/download?source=${encodeURIComponent(
        videoUrl
      )}&filename=${videoId}.mp4`,
      platform: "facebook",
    };
  }

  // If all else fails
  if (lastError) {
    throw lastError;
  }
  
  throw new Error("Không thể lấy thông tin video từ Facebook. Video có thể là riêng tư hoặc yêu cầu đăng nhập. Vui lòng thử với link video công khai hoặc thử lại sau.");
}

