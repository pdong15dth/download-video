"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Dialog } from "@/app/components/Dialog";

type VideoPlatform = "douyin" | "tiktok" | "facebook";

type VideoAnalysisResult = {
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
  platform: VideoPlatform;
};

type VideoHistoryItem = {
  _id?: string;
  url: string;
  normalizedUrl: string;
  videoId: string;
  platform: VideoPlatform;
  result: VideoAnalysisResult;
  createdAt: string;
  updatedAt: string;
  accessedAt: string;
  accessCount: number;
};

type CacheStats = {
  totalVideos: number;
  totalAccesses: number;
  mostAccessed: VideoHistoryItem[];
};

const ACCENT_GRADIENT =
  "from-fuchsia-400 via-rose-500 to-amber-300 dark:from-fuchsia-400/90";

const PLATFORM_LABELS: Record<VideoPlatform, string> = {
  douyin: "Douyin",
  tiktok: "TikTok",
  facebook: "Facebook",
};

const PLATFORM_COLORS: Record<VideoPlatform, string> = {
  douyin: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  tiktok: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  facebook: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

export default function HistoryPage() {
  const [history, setHistory] = useState<VideoHistoryItem[]>([]);
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoHistoryItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    item: VideoHistoryItem | null;
  }>({ isOpen: false, item: null });
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: "" });

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/history?limit=100&stats=true");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Không thể tải lịch sử");
      }

      setHistory(data.data.history || []);
      setStats(data.data.stats || null);
    } catch (err) {
      console.error("Error loading history:", err);
      setError(
        err instanceof Error ? err.message : "Không thể tải lịch sử video"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteClick(item: VideoHistoryItem, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, item });
  }

  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return dateString;
    }
  }

  function formatSize(sizeBytes?: number): string {
    if (!sizeBytes) return "—";
    const mb = sizeBytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  }

  function formatDuration(duration: number): string {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  }

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-fuchsia-600/30 blur-[150px]" />
        <div className="absolute bottom-0 left-0 h-[28rem] w-[28rem] rounded-full bg-teal-500/20 blur-[160px]" />
        <div className="absolute right-0 top-1/3 h-[22rem] w-[22rem] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 sm:px-10 lg:px-14">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-50 sm:text-4xl">
              Lịch sử{" "}
              <span className={`bg-gradient-to-r ${ACCENT_GRADIENT} bg-clip-text text-transparent`}>
                Video đã tải
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Xem lại các video bạn đã phân tích và tải về
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Về trang chủ
          </Link>
        </header>

        {/* Stats */}
        {stats && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-white/50">
                Tổng video
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {stats.totalVideos}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-white/50">
                Tổng lượt truy cập
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {stats.totalAccesses}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-white/50">
                Video phổ biến
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {stats.mostAccessed.length}
              </p>
            </div>
          </div>
        )}

        {/* History List */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-1">
          <div className="rounded-[22px] border border-white/10 bg-black/50 p-6 backdrop-blur">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <span className="ml-3 text-white/70">Đang tải lịch sử...</span>
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p className="text-rose-400">{error}</p>
                <button
                  onClick={loadHistory}
                  className="mt-4 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
                >
                  Thử lại
                </button>
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-white/60">Chưa có video nào trong lịch sử</p>
                <Link
                  href="/"
                  className="mt-4 inline-block rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
                >
                  Tải video đầu tiên
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <VideoHistoryCard
                    key={item._id || item.videoId}
                    item={item}
                    onSelect={() => {
                      setSelectedVideo(item);
                      setIsDrawerOpen(true);
                    }}
                    onDelete={(e) => handleDeleteClick(item, e)}
                    formatDate={formatDate}
                    formatSize={formatSize}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Video Detail Drawer */}
      {selectedVideo && (
        <VideoDetailDrawer
          item={selectedVideo}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            // Delay unmount để animation đóng hoàn thành
            setTimeout(() => setSelectedVideo(null), 500);
          }}
          onDelete={() => {
            if (selectedVideo) {
              setDeleteDialog({ isOpen: true, item: selectedVideo });
            }
          }}
          formatSize={formatSize}
          formatDuration={formatDuration}
        />
      )}

      {/* Delete Confirm Dialog */}
      <Dialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null })}
        title="Xóa video khỏi lịch sử"
        message={
          deleteDialog.item
            ? `Bạn có chắc muốn xóa video "${deleteDialog.item.result.description || deleteDialog.item.result.videoId}" khỏi lịch sử?`
            : ""
        }
        type="confirm"
        onConfirm={async () => {
          if (!deleteDialog.item) return;

          const item = deleteDialog.item;
          setDeleteDialog({ isOpen: false, item: null });

          try {
            const videoId = item._id || item.videoId;
            const response = await fetch(`/api/history?id=${encodeURIComponent(videoId)}`, {
              method: "DELETE",
            });

            const data = await response.json();

            if (!data.success) {
              throw new Error(data.message || "Không thể xóa video");
            }

            // Close drawer if deleting the selected video
            if (selectedVideo?._id === item._id) {
              setIsDrawerOpen(false);
              setTimeout(() => setSelectedVideo(null), 500);
            }

            // Reload history
            await loadHistory();
          } catch (err) {
            console.error("Error deleting video:", err);
            setAlertDialog({
              isOpen: true,
              message: err instanceof Error ? err.message : "Không thể xóa video",
            });
          }
        }}
        confirmText="Xóa"
        cancelText="Hủy"
      />

      {/* Alert Dialog */}
      <Dialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ isOpen: false, message: "" })}
        title="Thông báo"
        message={alertDialog.message}
        type="alert"
        confirmText="Đóng"
      />
    </div>
  );
}

type VideoHistoryCardProps = {
  item: VideoHistoryItem;
  onSelect: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  formatDate: (date: string) => string;
  formatSize: (size?: number) => string;
  formatDuration: (duration: number) => string;
};

function VideoHistoryCard({
  item,
  onSelect,
  onDelete,
  formatDate,
  formatSize,
  formatDuration,
}: VideoHistoryCardProps) {
  const { result, accessedAt, accessCount } = item;

  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-white/10">
          {result.cover ? (
            <img
              src={result.cover}
              alt={result.description}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-8 w-8 text-white/30"
              >
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute bottom-1 right-1">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${PLATFORM_COLORS[result.platform]}`}
            >
              {PLATFORM_LABELS[result.platform]}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-white">
            {result.description || "Video không có mô tả"}
          </h3>
          <p className="mt-1 text-sm text-white/60">
            {result.author} • {formatDuration(result.duration)}
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/50">
            <span>{result.resolution || "—"}</span>
            <span>•</span>
            <span>{formatSize(result.sizeBytes)}</span>
            <span>•</span>
            <span>Truy cập {accessCount} lần</span>
            <span>•</span>
            <span>{formatDate(accessedAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <a
            href={result.proxyDownload}
            download={`${result.platform}-${result.videoId}.mp4`}
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10"
          >
            Tải lại
          </a>
          {onDelete && (
            <button
              onClick={onDelete}
              className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300 transition hover:bg-rose-500/20"
              title="Xóa khỏi lịch sử"
              aria-label="Xóa video khỏi lịch sử"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
              >
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

type VideoDetailDrawerProps = {
  item: VideoHistoryItem;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  formatSize: (size?: number) => string;
  formatDuration: (duration: number) => string;
};

function VideoDetailDrawer({
  item,
  isOpen,
  onClose,
  onDelete,
  formatSize,
  formatDuration,
}: VideoDetailDrawerProps) {
  const { result } = item;
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setIsMounted(true);
        document.body.style.overflow = "hidden";
        // Force reflow để animation chạy mượt
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      // Trigger close animation
      requestAnimationFrame(() => {
        setIsAnimating(false);
        document.body.style.overflow = "";
      });
      // Delay unmount để animation close hoàn thành
      const timer = setTimeout(() => setIsMounted(false), 500);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!item) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [item, onClose]);

  if (!isMounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-out ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-screen w-full max-w-2xl transform flex flex-col border-l border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-black shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur">
            <div className="min-w-0 flex-1 pr-4">
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">
                Chi tiết video
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white truncate">
                {result.description || "Video không có mô tả"}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Đóng drawer"
              className="flex-shrink-0 rounded-full border border-white/20 bg-white/5 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className={`flex-1 flex flex-col min-h-0 p-6 gap-4 overflow-hidden transition-opacity duration-500 delay-100 ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}>
            {/* Video Info */}
            <div className={`flex-shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-500 delay-150 ${
              isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <h3 className="mb-3 text-sm font-semibold text-white">
                Thông tin video
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-white/50">Tác giả</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {result.author}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Nền tảng</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {PLATFORM_LABELS[result.platform]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Độ phân giải</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {result.resolution || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Thời lượng</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {formatDuration(result.duration)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Dung lượng</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {formatSize(result.sizeBytes)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Bitrate</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {result.bitrateKbps
                      ? `${Math.round(result.bitrateKbps)} kbps`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Video Player */}
            <div className={`flex-1 min-h-0 rounded-2xl border border-white/10 bg-black/60 p-3 transition-all duration-500 delay-200 ${
              isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <video
                className="w-full h-full rounded-xl border border-white/10 object-contain"
                controls
                poster={result.cover || undefined}
                src={result.noWatermarkUrl}
                crossOrigin="anonymous"
                onError={(e) => {
                  // Fallback to proxy if direct URL fails (CORS issue)
                  const target = e.target as HTMLVideoElement;
                  if (target.src !== result.proxyDownload) {
                    target.src = result.proxyDownload;
                  }
                }}
              />
            </div>

            {/* Download Button */}
            <div className={`flex-shrink-0 space-y-2 transition-all duration-500 delay-300 ${
              isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <a
                href={result.proxyDownload}
                download={`${result.platform}-${result.videoId}.mp4`}
                className={`inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-gradient-to-r ${ACCENT_GRADIENT} px-5 py-3 text-base font-semibold text-slate-900 transition hover:opacity-90 shadow-lg`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="mr-2 h-4 w-4"
                >
                  <path d="M12 3v12.586l3.293-3.293 1.414 1.414L12 18.414l-4.707-4.707 1.414-1.414L11 15.586V3h2z" />
                  <path d="M5 20h14v2H5z" />
                </svg>
                Tải file MP4 không watermark
              </a>
              
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Xóa khỏi lịch sử
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

