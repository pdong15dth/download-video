import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getCachedVideo, saveVideoToCache } from "@/models/video";

const DOUYIN_DETAIL_ENDPOINTS = [
  "https://www.iesdouyin.com/aweme/v1/web/aweme/detail/?aweme_id=",
  "https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id=",
];
const DEFAULT_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/604.1";
const CHROME_DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";

export const runtime = "nodejs";

type AwemeDetail = {
  aweme_id: string;
  desc?: string;
  create_time?: number;
  author?: {
    nickname?: string;
    avatar_thumb?: { url_list?: string[] };
  };
  music?: {
    title?: string;
  };
  video?: {
    duration?: number;
    bit_rate?: Array<{
      bit_rate?: number;
      gear_name?: string;
      play_addr?: {
        url_list?: string[];
        data_size?: number;
        width?: number;
        height?: number;
      };
    }>;
    play_addr?: {
      url_list?: string[];
      data_size?: number;
    };
    download_addr?: {
      url_list?: string[];
      data_size?: number;
    };
    cover?: { url_list?: string[] };
    origin_cover?: { url_list?: string[] };
    dynamic_cover?: { url_list?: string[] };
  };
};

type DouyinPayload = {
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
  platform: "douyin";
};

type TikwmResponse = {
  aweme_id?: string;
  title?: string;
  cover?: string;
  origin_cover?: string;
  duration?: number;
  bitrate?: number;
  size?: number;
  size_mb?: number;
  video_resolution?: string;
  ratio?: string;
  create_time?: number;
  hdplay?: string;
  play?: string;
  music?: string;
  music_info?: { title?: string };
  author?:
    | {
        nickname?: string;
        avatar?: string;
      }
    | string;
};

type PuppeteerBrowser = import("puppeteer").Browser;

export async function POST(request: Request) {
  const debugTag = randomBytes(3).toString("hex");
  try {
    const body = await request.json();
    const rawUrl = String(body?.url ?? "").trim();

    if (!rawUrl) {
      return NextResponse.json(
        { success: false, message: "Bạn chưa cung cấp link Douyin." },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeUrl(rawUrl);
    console.info(
      `[Douyin:${debugTag}] Received request`,
      rawUrl.slice(0, 120),
      "->",
      normalizedUrl
    );

    // Check cache first
    const cached = await getCachedVideo(normalizedUrl, "douyin");
    if (cached) {
      console.info(`[Douyin:${debugTag}] Cache hit for ${normalizedUrl}`);
      return NextResponse.json({ success: true, data: cached, cached: true });
    }
    console.info(`[Douyin:${debugTag}] Cache miss, analyzing...`);

    const { awemeId } = await resolveAwemeId(normalizedUrl, debugTag);
    console.info(`[Douyin:${debugTag}] Resolved awemeId`, awemeId);

    let payload: DouyinPayload | null = null;
    let officialError: unknown = null;

    try {
      const awemeDetail = await fetchAwemeDetail(awemeId, debugTag);
      payload = buildPayload(awemeDetail, awemeId);
      console.info(`[Douyin:${debugTag}] Official API success for`, awemeId);
    } catch (error) {
      officialError = error;
      console.warn(`[Douyin:${debugTag}] Official pipeline failed:`, error);
    }

    if (!payload) {
      const browserAweme = await fetchAwemeViaBrowser(
        normalizedUrl,
        awemeId,
        debugTag
      );
      if (browserAweme) {
        const resolvedId = browserAweme.aweme_id ?? awemeId;
        payload = buildPayload(browserAweme, resolvedId);
        console.info(`[Douyin:${debugTag}] Browser fallback success for`, awemeId);
      }
    }

    if (!payload) {
      payload = await fetchViaTikwm(normalizedUrl, awemeId, debugTag);
      console.info(`[Douyin:${debugTag}] Tikwm fallback success for`, awemeId);
    }

    if (!payload && officialError) {
      throw officialError instanceof Error
        ? officialError
        : new Error("Không thể xử lý video Douyin.");
    }

    if (!payload) {
      throw new Error("Không thể xử lý video Douyin.");
    }

    // Save to cache
    await saveVideoToCache(normalizedUrl, "douyin", payload);
    console.info(`[Douyin:${debugTag}] Saved to cache: ${awemeId}`);

    return NextResponse.json({ success: true, data: payload, cached: false });
  } catch (error) {
    console.error(`[Douyin API][${debugTag}] error:`, error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể xử lý link Douyin này.",
      },
      { status: 500 }
    );
  }
}

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  const match = trimmed.match(/https?:\/\/[^\s]+/i);
  const candidate = match ? match[0] : trimmed;

  if (!/^https?:\/\//i.test(candidate)) {
    return `https://${candidate}`;
  }
  return candidate.replace(/^http:\/\//i, "https://");
}

async function resolveAwemeId(inputUrl: string, debugTag?: string) {
  const visited = new Set<string>();
  let currentUrl = inputUrl;

  for (let i = 0; i < 5; i += 1) {
    if (visited.has(currentUrl)) {
      break;
    }
    visited.add(currentUrl);

    console.info(`[Douyin:${debugTag}] Resolve step ${i + 1} -> ${currentUrl}`);

    const response = await fetch(currentUrl, {
      headers: buildHeaders(),
      redirect: "follow",
      cache: "no-store",
    });

    const finalUrl = response.url;
    const html = await response.text();
    const awemeId =
      extractAwemeId(finalUrl) ||
      extractAwemeId(currentUrl) ||
      extractAwemeIdFromHtml(html);

    if (awemeId) {
      console.info(`[Douyin:${debugTag}] Found awemeId ${awemeId}`);
      return { awemeId, resolvedUrl: finalUrl };
    }

    const nextVideoLink = extractNextVideoLink(html);
    if (!nextVideoLink) {
      break;
    }
    currentUrl = nextVideoLink;
  }

  throw new Error(
    "Không thể nhận diện video từ link này. Hãy đảm bảo link Douyin hợp lệ."
  );
}

async function fetchAwemeDetail(awemeId: string, debugTag?: string) {
  let lastError: Error | null = null;
  const cookieHeader = await composeCookieHeader();

  for (const endpoint of DOUYIN_DETAIL_ENDPOINTS) {
    try {
      console.info(`[Douyin:${debugTag}] Call ${endpoint}`);
      const response = await fetch(`${endpoint}${awemeId}`, {
        headers: {
          ...buildHeaders(),
          Cookie: cookieHeader,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        console.warn(
          `[Douyin:${debugTag}] ${endpoint} -> HTTP ${response.status}`
        );
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      if (!text || text.trim().length === 0) {
        console.warn(`[Douyin:${debugTag}] ${endpoint} returned empty body`);
        throw new Error("Response body is empty");
      }

      let data: { aweme_detail?: AwemeDetail } | null = null;
      try {
        data = JSON.parse(text);
      } catch {
        console.warn(`[Douyin:${debugTag}] ${endpoint} invalid JSON: ${text.slice(0, 100)}`);
        throw new Error("Invalid JSON response");
      }

      if (!data?.aweme_detail) {
        console.warn(`[Douyin:${debugTag}] ${endpoint} missing aweme_detail`);
        throw new Error("Thiếu aweme_detail");
      }

      return data.aweme_detail as AwemeDetail;
    } catch (error) {
      console.warn(
        `[Douyin:${debugTag}] Error calling ${endpoint}:`,
        error
      );
      lastError =
        error instanceof Error
          ? error
          : new Error("Đã xảy ra lỗi không xác định.");
      continue;
    }
  }

  console.info(`[Douyin:${debugTag}] Attempt HTML fallback`);
  const htmlFallback = await fetchAwemeFromHtml(awemeId, cookieHeader, debugTag);
  if (htmlFallback) {
    console.info(`[Douyin:${debugTag}] HTML fallback success`);
    return htmlFallback;
  }

  console.info(`[Douyin:${debugTag}] Attempt legacy iteminfo fallback`);
  const legacyFallback = await fetchAwemeFromLegacyApi(
    awemeId,
    cookieHeader,
    debugTag
  );
  if (legacyFallback) {
    console.info(`[Douyin:${debugTag}] Legacy iteminfo success`);
    return legacyFallback;
  }

  throw new Error(
    lastError?.message === "Thiếu aweme_detail"
      ? "Không tìm thấy thông tin chi tiết video."
      : "Douyin tạm thời không phản hồi. Thử lại sau nhé."
  );
}

function buildPayload(aweme: AwemeDetail, awemeId: string): DouyinPayload {
  const video = aweme.video;
  if (!video) {
    throw new Error("Video không khả dụng hoặc đã bị xoá.");
  }

  const bitrates = Array.isArray(video.bit_rate) ? [...video.bit_rate] : [];
  const sorted = bitrates.sort(
    (a, b) => (b?.bit_rate ?? 0) - (a?.bit_rate ?? 0)
  );
  const best = sorted[0];

  const candidateUrl =
    best?.play_addr?.url_list?.[0] ??
    video.play_addr?.url_list?.[0] ??
    video.download_addr?.url_list?.[0];

  if (!candidateUrl) {
    throw new Error("Không lấy được link phát video.");
  }

  const sanitizedUrl = sanitizeVideoUrl(candidateUrl);

  return {
    videoId: awemeId,
    description: aweme.desc ?? "",
    author: aweme.author?.nickname ?? "Không rõ",
    avatar: aweme.author?.avatar_thumb?.url_list?.[0],
    cover:
      video.origin_cover?.url_list?.[0] ??
      video.cover?.url_list?.[0] ??
      video.dynamic_cover?.url_list?.[0],
    music: aweme.music?.title ?? "",
    duration: Math.round((video.duration ?? 0) / 1000),
    resolution:
      best?.play_addr?.width && best?.play_addr?.height
        ? `${best.play_addr.width}×${best.play_addr.height}`
        : undefined,
    bitrateKbps: best?.bit_rate ? Math.round(best.bit_rate / 1000) : undefined,
    sizeBytes:
      best?.play_addr?.data_size ??
      video.download_addr?.data_size ??
      video.play_addr?.data_size,
    publishedAt: aweme.create_time
      ? new Date(aweme.create_time * 1000).toISOString()
      : undefined,
    noWatermarkUrl: sanitizedUrl,
    proxyDownload: `/api/douyin/download?source=${encodeURIComponent(
      sanitizedUrl
    )}&filename=${awemeId}.mp4`,
    platform: "douyin",
  };
}

function sanitizeVideoUrl(url: string) {
  let finalUrl = url.replace("http://", "https://");
  if (finalUrl.includes("playwm")) {
    finalUrl = finalUrl.replace(/playwm/g, "play");
  }
  if (finalUrl.includes("watermark=")) {
    finalUrl = finalUrl.replace(/watermark=\d/g, "watermark=0");
  } else {
    finalUrl += `${finalUrl.includes("?") ? "&" : "?"}watermark=0`;
  }
  if (!/ratio=\d+p/.test(finalUrl)) {
    finalUrl += "&ratio=1080p";
  }

  return finalUrl;
}

async function fetchViaTikwm(
  sourceUrl: string,
  awemeId: string,
  debugTag?: string
): Promise<DouyinPayload> {
  console.info(`[Douyin:${debugTag}] Trying Tikwm fallback with`, sourceUrl);

  const params = new URLSearchParams();
  params.set("url", sourceUrl);
  params.set("hd", "1");

  const response = await fetch("https://www.tikwm.com/api/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent": DEFAULT_UA,
      Referer: "https://www.tikwm.com/",
    },
    body: params,
  });

  if (!response.ok) {
    throw new Error("Tikwm không phản hồi.");
  }

  const payload = await response.json();
  if (payload?.code !== 0 || !payload?.data) {
    throw new Error(payload?.msg ?? "Tikwm không thể xử lý link này.");
  }

  return buildPayloadFromTikwm(payload.data, awemeId);
}

function buildPayloadFromTikwm(
  data: TikwmResponse,
  fallbackAwemeId: string
): DouyinPayload {
  const videoUrl = data?.hdplay ?? data?.play;
  if (!videoUrl) {
    throw new Error("Tikwm không trả về link video.");
  }

  const awemeId = data?.aweme_id ?? fallbackAwemeId;
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
    videoId: awemeId,
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
    proxyDownload: `/api/douyin/download?source=${encodeURIComponent(
      videoUrl
    )}&filename=${awemeId}.mp4`,
    platform: "douyin",
  };
}

function extractAwemeId(url: string) {
  const match =
    url.match(/\/video\/(\d+)/) ||
    url.match(/aweme_id=(\d+)/) ||
    url.match(/\/share\/video\/(\d+)/);
  return match ? match[1] : null;
}

function extractAwemeIdFromHtml(html: string) {
  const match =
    html.match(/"awemeId":"(\d+)"/) ||
    html.match(/"aweme_id":"?(\d+)"?/) ||
    html.match(/"itemId":"(\d+)"/);
  return match ? match[1] : null;
}

function extractNextVideoLink(html: string) {
  const match = html.match(
    /(https:\/\/www\.douyin\.com\/video\/\d+[^\s"]*)/i
  );
  return match ? match[1] : null;
}

function buildHeaders() {
  return {
    "User-Agent": DEFAULT_UA,
    Referer: "https://www.douyin.com/",
    "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
  };
}

async function composeCookieHeader() {
  const msToken = randomBytes(16).toString("hex");
  const webId = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
  const ttwid = await fetchTtWid();

  return [
    `msToken=${msToken}`,
    `tt_webid=${webId}`,
    `tt_webid_v2=${webId}`,
    ttwid ? `ttwid=${ttwid}` : null,
  ]
    .filter(Boolean)
    .join("; ");
}

async function fetchTtWid() {
  try {
    const response = await fetch(
      "https://ttwid.bytedance.com/ttwid/union/register/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": DEFAULT_UA,
        },
        body: JSON.stringify({
          region: "en",
          aid: 1459,
          needFid: false,
          service: "www.douyin.com",
          migrate_info: { ticket: "", source: "node" },
          cbUrlProtocol: "https",
          union: true,
        }),
      }
    );

    const setCookie = response.headers.get("set-cookie");
    const match = setCookie?.match(/ttwid=([^;]+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.warn("[Douyin] Không lấy được ttwid:", error);
    return null;
  }
}

async function fetchAwemeFromHtml(
  awemeId: string,
  cookieHeader: string,
  debugTag?: string
) {
  try {
    console.info(`[Douyin:${debugTag}] Fetching HTML for ${awemeId}`);
    const response = await fetch(`https://www.douyin.com/video/${awemeId}`, {
      headers: {
        ...buildHeaders(),
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(
        `[Douyin:${debugTag}] HTML response ${response.status} for ${awemeId}`
      );
      return null;
    }

    const html = await response.text();
    
    // Try INIT_PROPS first
    let match = html.match(/window\.__INIT_PROPS__\s*=\s*({[\s\S]+?});<\/script>/);
    if (match) {
      let parsed: Record<string, unknown> | null = null;
      try {
        parsed = JSON.parse(match[1]);
      } catch {
        console.warn(`[Douyin:${debugTag}] Failed to parse INIT_PROPS JSON`);
      }
      if (parsed) {
        const detailObj = parsed.detail as { awemeDetail?: AwemeDetail } | undefined;
        const awemeObj = parsed.aweme as {
          detail?: { awemeDetail?: AwemeDetail };
        } | undefined;
        const videoObj = parsed["/video/:id"] as { awemeDetail?: AwemeDetail } | undefined;
        const detail =
          detailObj?.awemeDetail ||
          awemeObj?.detail?.awemeDetail ||
          videoObj?.awemeDetail ||
          null;
        if (detail) {
          return detail as AwemeDetail;
        }
      }
    }

    // Try SIGI_STATE
    match = html.match(/window\.SIGI_STATE\s*=\s*({[\s\S]+?});<\/script>/);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]) as Record<string, unknown>;
        const aweme = parsed?.Aweme as
          | {
              detail?:
                | {
                    itemList?: AwemeDetail[];
                  }
                | AwemeDetail;
              awemeDetail?: AwemeDetail;
              itemList?: AwemeDetail[];
            }
          | undefined;
        const detail =
          (aweme?.detail &&
            typeof aweme.detail === "object" &&
            "itemList" in aweme.detail
            ? aweme.detail.itemList?.[0]
            : null) ||
          (aweme?.detail &&
            typeof aweme.detail === "object" &&
            "aweme_id" in aweme.detail
            ? (aweme.detail as AwemeDetail)
            : null) ||
          aweme?.awemeDetail ||
          aweme?.itemList?.[0] ||
          null;
        if (detail) {
          return detail as AwemeDetail;
        }
      } catch {
        // Ignore
      }
    }

    // Try RENDER_DATA
    match = html.match(/<script[^>]*id=["']RENDER_DATA["'][^>]*>([\s\S]+?)<\/script>/);
    if (match) {
      try {
        const encoded = match[1].match(/decodeURIComponent\("([^"]+)"\)/)?.[1];
        if (encoded) {
          const decoded = decodeURIComponent(encoded);
          const parsed = JSON.parse(decoded) as Record<string, unknown>;
          const entry = parsed?.["/video/:id"] as {
            aweme?: {
              detail?: { awemeDetail?: AwemeDetail };
              awemeDetail?: AwemeDetail;
            };
          } | undefined;
          const detail =
            entry?.aweme?.detail?.awemeDetail ||
            entry?.aweme?.awemeDetail ||
            null;
          if (detail) {
            return detail as AwemeDetail;
          }
        }
      } catch {
        // Ignore
      }
    }

    // Last resort: try to extract video URL directly from HTML
    const videoUrlMatch = html.match(
      /"play_addr"\s*:\s*\{[^}]*"url_list"\s*:\s*\["([^"]+)"/i
    );
    const descMatch = html.match(/"desc"\s*:\s*"([^"]+)"/i);
    const authorMatch = html.match(/"nickname"\s*:\s*"([^"]+)"/i);
    
    if (videoUrlMatch && awemeId) {
      console.info(`[Douyin:${debugTag}] Extracted video URL directly from HTML`);
      return {
        aweme_id: awemeId,
        desc: descMatch?.[1] || "",
        author: authorMatch?.[1] ? { nickname: authorMatch[1] } : undefined,
        video: {
          play_addr: {
            url_list: [videoUrlMatch[1]],
          },
        },
      } as AwemeDetail;
    }

    console.warn(`[Douyin:${debugTag}] INIT_PROPS missing in HTML and no video URL found`);
    return null;
  } catch (error) {
    console.warn(`[Douyin:${debugTag}] HTML fallback failed:`, error);
    return null;
  }
}

async function fetchAwemeFromLegacyApi(
  awemeId: string,
  cookieHeader: string,
  debugTag?: string
) {
  try {
    const endpoint = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${awemeId}`;
    console.info(`[Douyin:${debugTag}] Fetching legacy API ${endpoint}`);
    const response = await fetch(endpoint, {
      headers: {
        ...buildHeaders(),
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(
        `[Douyin:${debugTag}] Legacy API HTTP ${response.status} for ${awemeId}`
      );
      return null;
    }

    const text = await response.text();
    if (!text || text.trim().length === 0) {
      console.warn(`[Douyin:${debugTag}] Legacy API returned empty body`);
      return null;
    }

    let payload: { item_list?: AwemeDetail[] } | null = null;
    try {
      payload = JSON.parse(text);
    } catch {
      console.warn(`[Douyin:${debugTag}] Legacy API invalid JSON`);
      return null;
    }

    const detail = payload?.item_list?.[0];

    if (!detail) {
      console.warn(`[Douyin:${debugTag}] Legacy API missing item_list`);
      return null;
    }

    return detail as AwemeDetail;
  } catch (error) {
    console.warn(`[Douyin:${debugTag}] Legacy API fallback failed:`, error);
    return null;
  }
}

async function fetchAwemeViaBrowser(
  targetUrl: string,
  awemeId: string,
  debugTag?: string
) {
  let browser: PuppeteerBrowser | null = null;
  try {
    console.info(`[Douyin:${debugTag}] Launching headless browser scrape`);
    const puppeteer = await import("puppeteer");
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-blink-features=AutomationControlled",
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(CHROME_DESKTOP_UA);
    await page.setViewport({ width: 1280, height: 720 });
    await page.setExtraHTTPHeaders({
      "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
    });
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      Object.defineProperty(navigator, "platform", { get: () => "MacIntel" });
      Object.defineProperty(navigator, "languages", {
        get: () => ["vi-VN", "vi"],
      });
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });
      (window as typeof window & { chrome?: unknown }).chrome = {
        runtime: {},
      };
    });

    // Intercept network requests to catch API responses
    let interceptedData: AwemeDetail | null = null;
    page.on("response", async (response) => {
      const url = response.url();
      if (
        (url.includes("/aweme/detail") ||
          url.includes("/aweme/iteminfo") ||
          url.includes("/aweme/v1/")) &&
        response.status() === 200
      ) {
        try {
          const buffer = await response.buffer();
          const text = buffer.toString("utf-8");
          if (text && text.trim().length > 0) {
            try {
              const data = JSON.parse(text) as {
                aweme_detail?: AwemeDetail;
                item_list?: AwemeDetail[];
              };
              if (data.aweme_detail && !interceptedData) {
                interceptedData = data.aweme_detail;
                console.info(`[Douyin:${debugTag}] Intercepted API response from ${url}`);
              } else if (data.item_list?.[0] && !interceptedData) {
                interceptedData = data.item_list[0];
                console.info(`[Douyin:${debugTag}] Intercepted iteminfo from ${url}`);
              }
            } catch {
              // Not JSON, ignore
            }
          }
        } catch {
          // Ignore errors silently
        }
      }
    });

    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 90000 });

    // Check multiple times for intercepted data (page might make multiple API calls)
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (interceptedData) {
        console.info(`[Douyin:${debugTag}] Using intercepted API data after ${i + 1}s`);
        return interceptedData;
      }
    }

    // If we got data from interception, return it
    if (interceptedData) {
      console.info(`[Douyin:${debugTag}] Using intercepted API data`);
      return interceptedData;
    }

    // Try multiple selectors and wait strategies
    try {
      await page.waitForFunction(
        () =>
          (window as typeof window & {
            __INIT_PROPS__?: Record<string, unknown>;
            SIGI_STATE?: Record<string, unknown>;
          }).__INIT_PROPS__ ||
          (window as typeof window & {
            __INIT_PROPS__?: Record<string, unknown>;
            SIGI_STATE?: Record<string, unknown>;
          }).SIGI_STATE ||
          document.querySelector("script[id='RENDER_DATA']") ||
          document.querySelector('script[type="application/json"]') ||
          document.body.innerText.includes("aweme_id"),
        { timeout: 45000 }
      );
    } catch {
      console.warn(`[Douyin:${debugTag}] Timeout waiting for page data, trying anyway`);
    }

    const detail = await page.evaluate(() => {
      // Try __INIT_PROPS__
      const initProps =
        (window as typeof window & {
          __INIT_PROPS__?: Record<string, unknown>;
        }).__INIT_PROPS__ ?? null;

      // Try SIGI_STATE
      const sigi =
        (window as typeof window & {
          SIGI_STATE?: Record<string, unknown>;
        }).SIGI_STATE ?? null;

      // Try RENDER_DATA script
      let renderDetail: unknown = null;
      const renderScript = document.getElementById("RENDER_DATA");
      if (renderScript?.textContent) {
        try {
          const match = renderScript.textContent.match(/decodeURIComponent\("([^"]+)"\)/);
          if (match?.[1]) {
            const decoded = decodeURIComponent(match[1]);
            const parsed = JSON.parse(decoded) as Record<string, unknown>;
            const entry = parsed?.["/video/:id"] as {
              aweme?: {
                detail?: { awemeDetail?: unknown };
                awemeDetail?: unknown;
              };
            } | undefined;
            renderDetail =
              entry?.aweme?.detail?.awemeDetail ??
              entry?.aweme?.awemeDetail ??
              null;
          }
        } catch {
          // Try direct JSON parse
          try {
            const parsed = JSON.parse(renderScript.textContent) as Record<string, unknown>;
            const entry = parsed?.["/video/:id"] as {
              aweme?: {
                detail?: { awemeDetail?: unknown };
                awemeDetail?: unknown;
              };
            } | undefined;
            renderDetail =
              entry?.aweme?.detail?.awemeDetail ??
              entry?.aweme?.awemeDetail ??
              null;
          } catch {
            renderDetail = null;
          }
        }
      }

      // Try all script tags with JSON
      let scriptDetail: unknown = null;
      const scripts = document.querySelectorAll('script[type="application/json"]');
      for (const script of Array.from(scripts)) {
        try {
          const parsed = JSON.parse(script.textContent || "{}") as Record<string, unknown>;
          const entry = parsed?.["/video/:id"] as {
            aweme?: {
              detail?: { awemeDetail?: unknown };
              awemeDetail?: unknown;
            };
          } | undefined;
          scriptDetail =
            entry?.aweme?.detail?.awemeDetail ??
            entry?.aweme?.awemeDetail ??
            scriptDetail;
          if (scriptDetail) break;
        } catch {
          continue;
        }
      }

      // Try extracting from page text/HTML
      let textDetail: unknown = null;
      try {
        const bodyText = document.body.innerText;
        const awemeIdMatch = bodyText.match(/"aweme_id"\s*:\s*"(\d+)"/);
        if (awemeIdMatch) {
          // Try to find video URL in page
          const videoUrlMatch = document.documentElement.innerHTML.match(
            /"play_addr"\s*:\s*\{[^}]*"url_list"\s*:\s*\["([^"]+)"/i
          );
          if (videoUrlMatch) {
            textDetail = {
              aweme_id: awemeIdMatch[1],
              video: {
                play_addr: {
                  url_list: [videoUrlMatch[1]],
                },
              },
            };
          }
        }
      } catch {
        textDetail = null;
      }

      const initPropsTyped = initProps as {
        "/video/:id"?: { awemeDetail?: unknown };
        detail?: { awemeDetail?: unknown };
      } | null;
      const sigiTyped = sigi as {
        Aweme?: {
          detail?:
            | {
                itemList?: unknown[];
              }
            | unknown;
          awemeDetail?: unknown;
          itemList?: unknown[];
        };
      } | null;

      return (
        initPropsTyped?.["/video/:id"]?.awemeDetail ??
        initPropsTyped?.detail?.awemeDetail ??
        (sigiTyped?.Aweme?.detail &&
          typeof sigiTyped.Aweme.detail === "object" &&
          "itemList" in sigiTyped.Aweme.detail
          ? (sigiTyped.Aweme.detail as { itemList?: unknown[] }).itemList?.[0]
          : null) ??
        (sigiTyped?.Aweme?.detail &&
          typeof sigiTyped.Aweme.detail === "object" &&
          "aweme_id" in sigiTyped.Aweme.detail
          ? sigiTyped.Aweme.detail
          : null) ??
        sigiTyped?.Aweme?.awemeDetail ??
        sigiTyped?.Aweme?.itemList?.[0] ??
        renderDetail ??
        scriptDetail ??
        textDetail ??
        null
      );
    });

    if (detail) {
      console.info(`[Douyin:${debugTag}] Browser scraping found detail for ${awemeId}`);
    } else {
      console.warn(`[Douyin:${debugTag}] Browser scraping returned no detail`);
    }

    return detail as AwemeDetail | null;
  } catch (error) {
    console.warn(`[Douyin:${debugTag}] Browser fallback failed:`, error);
    return null;
  } finally {
    await browser?.close();
  }
}

