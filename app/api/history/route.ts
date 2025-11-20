import { NextResponse } from "next/server";
import { getVideoHistory, getCacheStats, deleteVideoFromCache } from "@/models/video";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const includeStats = searchParams.get("stats") === "true";

    const history = await getVideoHistory(limit);
    
    let stats = null;
    if (includeStats) {
      stats = await getCacheStats();
    }

    return NextResponse.json({
      success: true,
      data: {
        history,
        stats,
      },
    });
  } catch (error) {
    console.error("[History API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Không thể lấy lịch sử video.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("id");

    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu ID video.",
        },
        { status: 400 }
      );
    }

    const deleted = await deleteVideoFromCache(videoId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: "Không tìm thấy video để xóa.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa video khỏi lịch sử.",
    });
  } catch (error) {
    console.error("[History API] Error deleting:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Không thể xóa video.",
      },
      { status: 500 }
    );
  }
}

