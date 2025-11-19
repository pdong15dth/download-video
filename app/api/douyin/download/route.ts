import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ALLOWED_SUFFIXES = [
  ".snssdk.com",
  ".pstatp.com",
  ".bytecdn.cn",
  ".douyin.com",
  ".douyinvod.com",
  ".ixigua.com",
  ".zjcdn.com",
];

const DEFAULT_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Mobile/15E148 Safari/604.1";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sourceParam = searchParams.get("source");
  const filenameParam = searchParams.get("filename") ?? "douyin-video.mp4";

  if (!sourceParam) {
    return NextResponse.json(
      { success: false, message: "Thiếu link nguồn video." },
      { status: 400 }
    );
  }

  try {
    const decodedSource = decodeURIComponent(sourceParam);
    const parsed = new URL(decodedSource);
    const isAllowed = ALLOWED_SUFFIXES.some((suffix) =>
      parsed.hostname.endsWith(suffix.replace(/^\./, ""))
    );

    if (!isAllowed) {
      return NextResponse.json(
        { success: false, message: "Nguồn video không hợp lệ." },
        { status: 400 }
      );
    }

    const upstream = await fetch(parsed, {
      headers: {
        "User-Agent": DEFAULT_UA,
        Referer: "https://www.douyin.com/",
      },
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { success: false, message: "Không thể tải video từ Douyin." },
        { status: 502 }
      );
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      upstream.headers.get("content-type") ?? "video/mp4"
    );
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }
    headers.set(
      "Content-Disposition",
      `attachment; filename="${sanitizeFilename(filenameParam)}"`
    );
    headers.set("Cache-Control", "no-store");

    return new NextResponse(upstream.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[Douyin Download] error", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tải video." },
      { status: 500 }
    );
  }
}

function sanitizeFilename(input: string) {
  return input.replace(/[^a-zA-Z0-9-_\.]/g, "_");
}

