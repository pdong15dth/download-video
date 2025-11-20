import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ALLOWED_SUFFIXES = [
  ".fbcdn.net",
  ".facebook.com",
  ".fb.com",
];

const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const sourceParam = searchParams.get("source");
  const filenameParam = searchParams.get("filename") ?? "facebook-video.mp4";

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
        Referer: "https://www.facebook.com/",
      },
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { success: false, message: "Không thể tải video từ Facebook." },
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
    console.error("[Facebook Download] error", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tải video." },
      { status: 500 }
    );
  }
}

function sanitizeFilename(input: string) {
  return input.replace(/[^a-zA-Z0-9-_\.]/g, "_");
}

