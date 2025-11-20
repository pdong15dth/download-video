"use client";

import { useMemo, useState, useEffect } from "react";
import { Dialog } from "@/app/components/Dialog";

type VideoPlatform = "douyin" | "tiktok" | "facebook";

type VideoHistoryItem = {
  _id?: string;
  url: string;
  normalizedUrl: string;
  videoId: string;
  platform: VideoPlatform;
  result: VideoPayload;
  createdAt: string;
  updatedAt: string;
  accessedAt: string;
  accessCount: number;
};


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

type VideoPayload = {
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

type FetchState = "idle" | "loading" | "success" | "error";

const SAMPLE_LINKS = [
  { url: "https://v.douyin.com/iJXuhx32/", platform: "douyin" as VideoPlatform },
  { url: "https://www.douyin.com/video/7324619803034739973", platform: "douyin" as VideoPlatform },
  { url: "https://vm.tiktok.com/ZMexample/", platform: "tiktok" as VideoPlatform },
  { url: "https://www.facebook.com/watch/?v=example", platform: "facebook" as VideoPlatform },
];

const GUIDE_STEPS = [
  {
    title: "1. Mở Douyin",
    detail: "Nhấn vào nút Chia sẻ (biểu tượng mũi tên) ở video bạn thích.",
  },
  {
    title: "2. Copy Link",
    detail: "Chọn Copy Link/复制链接 để sao chép URL video.",
  },
  {
    title: "3. Dán vào ô tải",
    detail: "Dán link vào ô bên trên rồi bấm Tải ngay.",
  },
];

const ACCENT_GRADIENT =
  "from-fuchsia-400 via-rose-500 to-amber-300 dark:from-fuchsia-400/90";

const SHARE_URL_REGEX = /https?:\/\/[^\s]+/i;

export default function Home() {
  const [link, setLink] = useState("");
  const [platform, setPlatform] = useState<VideoPlatform | null>(null);
  const [status, setStatus] = useState<FetchState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<VideoPayload | null>(null);
  const [processedAt, setProcessedAt] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // History sidebar state
  const [history, setHistory] = useState<VideoHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedHistoryVideo, setSelectedHistoryVideo] = useState<VideoHistoryItem | null>(null);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    item: VideoHistoryItem | null;
  }>({ isOpen: false, item: null });
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: "" });

  const sizeLabel = useMemo(() => {
    if (!result?.sizeBytes) return "Không rõ";
    const mb = result.sizeBytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  }, [result]);

  const durationLabel = useMemo(() => {
    if (!result?.duration) return "—";
    const minutes = Math.floor(result.duration / 60);
    const seconds = result.duration % 60;
    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  }, [result]);

  const statusBadge = {
    idle: "Sẵn sàng tải",
    loading: "Đang phân tích...",
    success: "Đã sẵn sàng tải về",
    error: "Có lỗi xảy ra",
  }[status];

  function detectPlatform(url: string): VideoPlatform | null {
    if (/douyin\.com|v\.douyin\.com/i.test(url)) return "douyin";
    if (/tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com/i.test(url)) return "tiktok";
    if (/facebook\.com|fb\.com|fb\.watch/i.test(url)) return "facebook";
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = link.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Vui lòng dán link Douyin trước khi tải.");
      return;
    }

    const extracted = extractShareUrl(trimmed);
    if (!extracted) {
      setStatus("error");
      setMessage("Không tìm thấy URL trong đoạn bạn dán. Thử lại nhé!");
      return;
    }

    const detectedPlatform = detectPlatform(extracted);
    if (!detectedPlatform) {
      setStatus("error");
      setMessage("Chỉ hỗ trợ link từ Douyin, TikTok hoặc Facebook.");
      return;
    }

    setPlatform(detectedPlatform);
    setStatus("loading");
    const platformName = detectedPlatform === "douyin" ? "Douyin" : detectedPlatform === "tiktok" ? "TikTok" : "Facebook";
    setMessage(`Đang phân tích ${platformName}...`);
    setResult(null);

    try {
      const apiEndpoint = `/api/${detectedPlatform}`;
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: extracted }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message ?? "Đã có lỗi không xác định.");
      }

      // Add platform to payload
      const videoData = { ...payload.data, platform: detectedPlatform };
      setResult(videoData as VideoPayload);
      setProcessedAt(new Date().toISOString());
      setStatus("success");
      setMessage("Tìm thấy video chất lượng cao, không watermark!");
      setIsDrawerOpen(true);
      
      // Reload history after successful analysis
      await loadHistory();
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Không thể xử lý link này, thử lại sau nhé."
      );
    }
  }

  const handleSampleFill = (sample: { url: string; platform: VideoPlatform }) => {
    setLink(sample.url);
    setPlatform(sample.platform);
    setStatus("idle");
    setMessage("Dán link mẫu rồi, bấm Tải ngay nhé!");
    setProcessedAt(null);
    setResult(null);
  };

  const processedLabel = useMemo(() => {
    if (!processedAt) return null;
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(processedAt));
  }, [processedAt]);

  // Load history
  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      const response = await fetch("/api/history?limit=50");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Không thể tải lịch sử");
      }

      setHistory(data.data.history || []);
    } catch (err) {
      console.error("Error loading history:", err);
      setHistoryError(
        err instanceof Error ? err.message : "Không thể tải lịch sử video"
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("vi-VN", {
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

  function handleHistoryDeleteClick(item: VideoHistoryItem, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, item });
  }

  async function handleHistoryDelete() {
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

      if (selectedHistoryVideo?._id === item._id) {
        setIsHistoryDrawerOpen(false);
        setTimeout(() => setSelectedHistoryVideo(null), 500);
      }

      await loadHistory();
    } catch (err) {
      console.error("Error deleting video:", err);
      setAlertDialog({
        isOpen: true,
        message: err instanceof Error ? err.message : "Không thể xóa video",
      });
    }
  }

  return (
    <div className="relative isolate h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-40 left-1/2 h-128 w-lg -translate-x-1/2 rounded-full bg-fuchsia-600/30 blur-[150px]" />
        <div className="absolute bottom-0 left-0 h-112 w-md rounded-full bg-teal-500/20 blur-[160px]" />
        <div className="absolute right-0 top-1/3 h-88 w-88 rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 grid h-full grid-cols-10">
        {/* Main Content - 7 columns */}
        <main className="relative col-span-7 flex flex-col gap-12 overflow-y-auto px-4 py-16 sm:px-10 lg:px-14">
        <header className="flex flex-col gap-6 text-center lg:text-left">
          <div className="flex items-center justify-between">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm text-white/80 backdrop-blur lg:mx-0">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Douyin Supreme Downloader · Không watermark · Free forever
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl lg:text-6xl">
              Tải video Douyin{" "}
              <span className={`bg-linear-to-r ${ACCENT_GRADIENT} bg-clip-text text-transparent`}>
                chất lượng tối đa
              </span>{" "}
              trong vài giây.
            </h1>
            <p className="text-lg text-slate-200 sm:text-xl">
              Chỉ cần dán link Douyin (short URL cũng được), hệ thống sẽ tự động
              gỡ watermark, chọn bitrate cao nhất và trả về file MP4 siêu nét cho
              bạn.
            </p>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[3fr,2fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-1">
            <div className="h-full rounded-[22px] border border-white/10 bg-black/50 p-8 shadow-2xl backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm uppercase tracking-[0.3em] text-white/60">
                  Trạng thái
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1 text-sm ${
                      status === "success"
                        ? "text-emerald-300"
                        : status === "error"
                          ? "text-rose-300"
                          : "text-white/80"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        status === "success"
                          ? "bg-emerald-400"
                          : status === "error"
                            ? "bg-rose-400"
                            : "bg-amber-300"
                      } animate-pulse`}
                    />
                    {statusBadge}
                  </span>
                  {platform && (
                    <span className="rounded-full bg-white/10 border border-white/20 px-2 py-1 text-xs uppercase text-white/80">
                      {platform}
                    </span>
                  )}
                </div>
              </div>

              {message && (
                <p className="mt-4 text-sm text-white/70">{message}</p>
              )}

              <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
                <label className="text-sm font-medium text-white/70">
                  Link video (Douyin / TikTok / Facebook)
                </label>
                <div className="relative rounded-2xl border border-white/15 bg-white/5 shadow-lg shadow-black/30">
                  <input
                    type="text"
                    inputMode="url"
                    placeholder="https://v.douyin.com/... hoặc tiktok.com/... hoặc facebook.com/..."
                    value={link}
                    onChange={(event) => {
                      setLink(event.target.value);
                      const detected = detectPlatform(event.target.value);
                      if (detected) setPlatform(detected);
                    }}
                    className="w-full rounded-2xl border border-transparent bg-transparent px-5 py-4 text-base text-white placeholder:text-white/40 focus:outline-none"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center gap-2 text-sm text-white/40">
                    <span>Không watermark</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-white/60">
                  {SAMPLE_LINKS.map((sample, idx) => (
                    <button
                      type="button"
                      key={`${sample.platform}-${idx}`}
                      onClick={() => handleSampleFill(sample)}
                      className="rounded-full border border-white/15 px-4 py-2 text-white/80 transition hover:border-white/30 hover:text-white"
                    >
                      {sample.platform === "douyin" ? "Douyin" : sample.platform === "tiktok" ? "TikTok" : "Facebook"} mẫu
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className={`group relative mt-4 inline-flex items-center justify-center overflow-hidden rounded-2xl bg-linear-to-r ${ACCENT_GRADIENT} px-8 py-4 text-lg font-semibold text-white shadow-[0_20px_80px_-30px_rgba(236,72,153,0.9)] transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <span className="flex items-center gap-3">
                    {status === "loading" ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent text-white" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        Tải ngay
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5 transition group-hover:translate-x-1 text-white"
                        >
                          <path d="M12 3v12.586l3.293-3.293 1.414 1.414L12 18.414l-4.707-4.707 1.414-1.414L11 15.586V3h2z" />
                          <path d="M5 20h14v2H5z" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-1">
            <div className="rounded-[22px] border border-white/10 bg-linear-to-br from-white/10 to-transparent p-6 text-sm text-white/80 shadow-[0_20px_80px_-40px_rgba(15,23,42,1)] backdrop-blur">
              <h3 className="text-base font-semibold text-white">
                Vì sao Douyin Supreme khác biệt?
              </h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  Gỡ watermark trực tiếp từ nguồn chính thức Douyin, chọn bitrate
                  cao nhất (lên tới 1080p/4K tuỳ video).
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                  Tự nhận diện link rút gọn v.douyin.com và link app nội địa,
                  không cần cài thêm gì.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-rose-400" />
                  UI chuẩn &ldquo;neo-brutalist&rdquo; hiện đại, tối ưu cho desktop & mobile.
                </li>
              </ul>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/60 p-6 text-sm text-white/80 backdrop-blur">
              <h3 className="text-base font-semibold text-white">
                Tips để tải siêu nhanh
              </h3>
              <div className="mt-4 space-y-3">
                <p>• Copy link chia sẻ trong Douyin & dán vào ô phía trái.</p>
                <p>• Ưu tiên Wi-Fi để tải các video trên 200MB.</p>
                <p>• Bookmark trang này để không bao giờ lo watermark nữa.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 rounded-3xl border border-white/10 bg-white/5 p-1">
          <div className="rounded-[26px] border border-white/10 bg-black/70 p-8 backdrop-blur">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="order-2 space-y-6 text-white/80 lg:order-1">
                <h2 className="text-3xl font-semibold text-white">
                  Hướng dẫn lấy link Douyin cực nhanh
                </h2>
                <p>
                  Video nào cũng có thể tải, chỉ cần làm đúng 3 bước này trong app
                  Douyin. Mất chưa tới 5 giây!
                </p>
                <ol className="space-y-4">
                  {GUIDE_STEPS.map((step) => (
                    <li
                      key={step.title}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <p className="text-sm font-semibold text-white">
                        {step.title}
                      </p>
                      <p className="text-white/70">{step.detail}</p>
                    </li>
                  ))}
                </ol>
                <p className="text-sm text-white/60">
                  Mẹo: Nếu link quá dài, bạn có thể dùng link rút gọn v.douyin.com,
                  hệ thống vẫn nhận diện chính xác.
                </p>
              </div>

              <div className="order-1 lg:order-2">
                <LinkGuideCanvas />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* History Sidebar - 3 columns */}
      <aside className="relative col-span-3 border-l border-white/10 bg-black/30 backdrop-blur">
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="shrink-0 border-b border-white/10 bg-black/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">
              Lịch sử{" "}
              <span className={`bg-linear-to-r ${ACCENT_GRADIENT} bg-clip-text text-transparent`}>
                Video
              </span>
            </h2>
            <p className="mt-1 text-xs text-white/60">
              {history.length} video đã phân tích
            </p>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-4">
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <span className="ml-3 text-sm text-white/70">Đang tải...</span>
              </div>
            ) : historyError ? (
              <div className="py-12 text-center">
                <p className="text-sm text-rose-400">{historyError}</p>
                <button
                  onClick={loadHistory}
                  className="mt-4 rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10"
                >
                  Thử lại
                </button>
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-white/60">Chưa có video nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <HistorySidebarCard
                    key={item._id || item.videoId}
                    item={item}
                    onSelect={() => {
                      setSelectedHistoryVideo(item);
                      setIsHistoryDrawerOpen(true);
                    }}
                    onDelete={(e: React.MouseEvent) => handleHistoryDeleteClick(item, e)}
                    formatDate={formatDate}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
      </div>

      {/* Floating button to reopen drawer */}
      {result && !isDrawerOpen && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-3 rounded-full border border-white/20 bg-linear-to-r from-fuchsia-500/90 to-rose-500/90 px-5 py-3 text-white shadow-lg backdrop-blur transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          aria-label="Xem kết quả phân tích"
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
            <path d="M21 9l-9-9-9 9" />
            <path d="M21 15l-9 9-9-9" />
            <path d="M12 3v18" />
          </svg>
          <span className="text-sm font-medium">Kết quả phân tích</span>
        </button>
      )}

      {/* Drawer for Analysis Results */}
      {result && (
        <AnalysisDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          result={result}
          durationLabel={durationLabel}
          sizeLabel={sizeLabel}
          processedLabel={processedLabel}
        />
      )}

      {/* History Video Drawer */}
      {selectedHistoryVideo && (
        <HistoryVideoDrawer
          item={selectedHistoryVideo}
          isOpen={isHistoryDrawerOpen}
          onClose={() => {
            setIsHistoryDrawerOpen(false);
            setTimeout(() => setSelectedHistoryVideo(null), 500);
          }}
          onDelete={() => {
            if (selectedHistoryVideo) {
              setDeleteDialog({ isOpen: true, item: selectedHistoryVideo });
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
        onConfirm={handleHistoryDelete}
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

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-white/80">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-white truncate">{value}</p>
    </div>
  );
}

function extractShareUrl(value: string) {
  const match = value.match(SHARE_URL_REGEX);
  return match ? match[0] : null;
}

function LinkGuideCanvas() {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-linear-to-br from-fuchsia-500/20 via-indigo-600/10 to-black/90 p-8 shadow-[0_25px_100px_-40px_rgba(13,148,136,1)]">
      <div className="absolute inset-x-10 top-10 h-52 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="relative mx-auto flex max-w-md flex-col gap-6">
        <div className="mx-auto h-80 w-44 rounded-[38px] border border-white/20 bg-black/60 p-3 text-white/80 backdrop-blur">
          <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-white/20" />
          <div className="space-y-3">
            <div className="h-32 rounded-2xl bg-linear-to-br from-slate-500 via-white/20 to-slate-900" />
            <div className="space-y-2">
              <div className="h-3 w-32 rounded-full bg-white/20" />
              <div className="h-3 w-28 rounded-full bg-white/10" />
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-white/70">Chia sẻ</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-300">
                  Copy Link
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/15" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center">
            <div className="h-1 w-16 rounded-full bg-white/15" />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/80">
          Minh hoạ thao tác: mở video → nhấn Chia sẻ → Copy Link.
        </div>
      </div>
    </div>
  );
}

type AnalysisDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  result: VideoPayload;
  durationLabel: string;
  sizeLabel: string;
  processedLabel: string | null;
};

function AnalysisDrawer({
  isOpen,
  onClose,
  result,
  durationLabel,
  sizeLabel,
  processedLabel,
}: AnalysisDrawerProps) {
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
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

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
        className={`fixed right-0 top-0 z-50 h-screen w-full max-w-2xl transform flex flex-col border-l border-white/10 bg-linear-to-br from-slate-950 via-slate-900 to-black shadow-2xl transition-transform duration-500 ease-in-out
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="shrink-0 flex items-center justify-between border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur">
          <div className="min-w-0 flex-1 pr-4">
            <p className="text-sm uppercase tracking-[0.3em] text-white/60 truncate">
              Kết quả phân tích
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white truncate">
              {result.description || "Video Douyin không watermark"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/20 bg-white/5 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Đóng drawer"
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

        <div className={`flex-1 flex flex-col min-h-0 p-6 gap-4 overflow-hidden transition-opacity duration-500 delay-100 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}>
          {/* Video Info */}
          <div className={`shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-500 delay-150 ${
            isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <p className="text-xs text-white/70 mb-3 truncate">
              Tác giả: <span className="text-white font-medium">{result.author}</span> · Nhạc:{" "}
              <span className="text-white font-medium">{result.music ?? "Không xác định"}</span>
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Metric label="Độ phân giải" value={result.resolution ?? "—"} />
              <Metric label="Thời lượng" value={durationLabel} />
              <Metric
                label="Bitrate"
                value={
                  result.bitrateKbps
                    ? `${Math.round(result.bitrateKbps)} kbps`
                    : "—"
                }
              />
              <Metric label="Dung lượng" value={sizeLabel} />
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
          <div className={`shrink-0 space-y-2 transition-all duration-500 delay-300 ${
            isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <a
              href={result.proxyDownload}
              download={`${result.platform}-${result.videoId}.mp4`}
              className={`inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-linear-to-r ${ACCENT_GRADIENT} px-5 py-3 text-base font-semibold text-slate-900 transition hover:opacity-90 shadow-lg`}
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
            
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
              Đã xử lý: {processedLabel ?? "—"}. Link tải chỉ sử dụng nguồn
              chính thức từ Douyin, an toàn và riêng tư.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

type HistorySidebarCardProps = {
  item: VideoHistoryItem;
  onSelect: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  formatDate: (date: string) => string;
  formatDuration: (duration: number) => string;
};

function HistorySidebarCard({
  item,
  onSelect,
  onDelete,
  formatDate,
  formatDuration,
}: HistorySidebarCardProps) {
  const { result, accessedAt } = item;

  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-white/20 hover:bg-white/10"
    >
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10">
          {result.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
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
                className="h-6 w-6 text-white/30"
              >
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute bottom-0.5 right-0.5">
            <span
              className={`rounded border px-1 py-0.5 text-[9px] font-medium ${PLATFORM_COLORS[result.platform]}`}
            >
              {PLATFORM_LABELS[result.platform][0]}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white">
            {result.description || "Video"}
          </h3>
          <p className="mt-0.5 text-xs text-white/60 truncate">
            {result.author}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[10px] text-white/50">
              <span>{formatDuration(result.duration)}</span>
              <span>•</span>
              <span>{formatDate(accessedAt)}</span>
            </div>
            {onDelete && (
              <button
                onClick={onDelete}
                className="shrink-0 rounded-lg border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-300 transition hover:bg-rose-500/20"
                title="Xóa"
                aria-label="Xóa video"
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
    </div>
  );
}

type HistoryVideoDrawerProps = {
  item: VideoHistoryItem;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  formatSize: (size?: number) => string;
  formatDuration: (duration: number) => string;
};

function HistoryVideoDrawer({
  item,
  isOpen,
  onClose,
  onDelete,
  formatSize,
  formatDuration,
}: HistoryVideoDrawerProps) {
  const { result } = item;
  const [isMounted, setIsMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setIsMounted(true);
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      requestAnimationFrame(() => {
        setIsAnimating(false);
        document.body.style.overflow = "";
      });
      const timer = setTimeout(() => setIsMounted(false), 500);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-out ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed right-0 top-0 z-50 h-screen w-full max-w-2xl transform flex flex-col border-l border-white/10 bg-linear-to-br from-slate-950 via-slate-900 to-black shadow-2xl transition-transform duration-500 ease-in-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="shrink-0 flex items-center justify-between border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur">
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
              className="shrink-0 rounded-full border border-white/20 bg-white/5 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Đóng drawer"
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

          <div className={`flex-1 flex flex-col min-h-0 p-6 gap-4 overflow-hidden transition-opacity duration-500 delay-100 ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}>
            <div className={`shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-500 delay-150 ${
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
                  const target = e.target as HTMLVideoElement;
                  if (target.src !== result.proxyDownload) {
                    target.src = result.proxyDownload;
                  }
                }}
              />
            </div>

            <div className={`shrink-0 space-y-2 transition-all duration-500 delay-300 ${
              isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <a
                href={result.proxyDownload}
                download={`${result.platform}-${result.videoId}.mp4`}
                className={`inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-linear-to-r ${ACCENT_GRADIENT} px-5 py-3 text-base font-semibold text-slate-900 transition hover:opacity-90 shadow-lg`}
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
