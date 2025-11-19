"use client";

import { useMemo, useState, useEffect } from "react";

type DouyinPayload = {
  awemeId: string;
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
};

type FetchState = "idle" | "loading" | "success" | "error";

const SAMPLE_LINKS = [
  "https://v.douyin.com/iJXuhx32/",
  "https://www.douyin.com/video/7324619803034739973",
  "https://v.douyin.com/J2tL9JE/",
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
  const [status, setStatus] = useState<FetchState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<DouyinPayload | null>(null);
  const [processedAt, setProcessedAt] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

    setStatus("loading");
    setMessage("Đang phân tích và bóc watermark...");
    setResult(null);

    try {
      const response = await fetch("/api/douyin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: extracted }),
      });

      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message ?? "Đã có lỗi không xác định.");
      }

      setResult(payload.data as DouyinPayload);
      setProcessedAt(new Date().toISOString());
      setStatus("success");
      setMessage("Tìm thấy video chất lượng cao, không watermark!");
      setIsDrawerOpen(true);
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

  const handleSampleFill = (sample: string) => {
    setLink(sample);
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

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-fuchsia-600/30 blur-[150px]" />
        <div className="absolute bottom-0 left-0 h-[28rem] w-[28rem] rounded-full bg-teal-500/20 blur-[160px]" />
        <div className="absolute right-0 top-1/3 h-[22rem] w-[22rem] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 sm:px-10 lg:px-14">
        <header className="flex flex-col gap-6 text-center lg:text-left">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm text-white/80 backdrop-blur lg:mx-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Douyin Supreme Downloader · Không watermark · Free forever
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl lg:text-6xl">
              Tải video Douyin{" "}
              <span className={`bg-gradient-to-r ${ACCENT_GRADIENT} bg-clip-text text-transparent`}>
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
              </div>

              {message && (
                <p className="mt-4 text-sm text-white/70">{message}</p>
              )}

              <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
                <label className="text-sm font-medium text-white/70">
                  Link video Douyin
                </label>
                <div className="relative rounded-2xl border border-white/15 bg-white/5 shadow-lg shadow-black/30">
                  <input
                    type="text"
                    inputMode="url"
                    placeholder="https://v.douyin.com/..."
                    value={link}
                    onChange={(event) => setLink(event.target.value)}
                    className="w-full rounded-2xl border border-transparent bg-transparent px-5 py-4 text-base text-white placeholder:text-white/40 focus:outline-none"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-white/40">
                    Không watermark
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-white/60">
                  {SAMPLE_LINKS.map((sample) => (
                    <button
                      type="button"
                      key={sample}
                      onClick={() => handleSampleFill(sample)}
                      className="rounded-full border border-white/15 px-4 py-2 text-white/80 transition hover:border-white/30 hover:text-white"
                    >
                      Link mẫu #{sample.slice(-4)}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className={`group relative mt-4 inline-flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r ${ACCENT_GRADIENT} px-8 py-4 text-lg font-semibold text-slate-950 shadow-[0_20px_80px_-30px_rgba(236,72,153,0.9)] transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-70`}
                >
                  <span className="flex items-center gap-3">
                    {status === "loading" ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        Tải ngay
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5 transition group-hover:translate-x-1"
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
            <div className="rounded-[22px] border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6 text-sm text-white/80 shadow-[0_20px_80px_-40px_rgba(15,23,42,1)] backdrop-blur">
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


        <footer className="pb-6 text-center text-sm text-white/60">
          Made with ❤️ · Không thu thập dữ liệu người dùng · 100% miễn phí
        </footer>
      </main>

      {/* Floating button to reopen drawer */}
      {result && !isDrawerOpen && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-3 rounded-full border border-white/20 bg-gradient-to-r from-fuchsia-500/90 to-rose-500/90 px-5 py-3 text-white shadow-lg backdrop-blur transition-all hover:scale-105 hover:shadow-xl active:scale-95"
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
    <div className="relative overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-fuchsia-500/20 via-indigo-600/10 to-black/90 p-8 shadow-[0_25px_100px_-40px_rgba(13,148,136,1)]">
      <div className="absolute inset-x-10 top-10 h-52 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="relative mx-auto flex max-w-md flex-col gap-6">
        <div className="mx-auto h-80 w-44 rounded-[38px] border border-white/20 bg-black/60 p-3 text-white/80 backdrop-blur">
          <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-white/20" />
          <div className="space-y-3">
            <div className="h-32 rounded-2xl bg-gradient-to-br from-slate-500 via-white/20 to-slate-900" />
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
  result: DouyinPayload;
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
      setIsMounted(true);
      document.body.style.overflow = "hidden";
      // Force reflow để animation chạy mượt
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      document.body.style.overflow = "";
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
        className={`fixed right-0 top-0 z-50 h-screen w-full max-w-2xl transform flex flex-col border-l border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-black shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex-shrink-0 flex items-center justify-between border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur">
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
            className="flex-shrink-0 rounded-full border border-white/20 bg-white/5 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
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
          <div className={`flex-shrink-0 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-500 delay-150 ${
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
          <div className={`flex-shrink-0 space-y-2 transition-all duration-500 delay-300 ${
            isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <a
              href={result.noWatermarkUrl}
              download={`douyin-${result.awemeId}.mp4`}
              target="_blank"
              rel="noopener noreferrer"
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
