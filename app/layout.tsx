import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Douyin Supreme Downloader",
  description:
    "Website tải video Douyin không watermark với chất lượng cao nhất, UI cực hiện đại và tốc độ thần tốc.",
  metadataBase: new URL("https://douyin-supreme.local"),
  openGraph: {
    title: "Douyin Supreme Downloader",
    description:
      "Tải video Douyin chất lượng 1080p không watermark trong vài giây.",
    url: "https://douyin-supreme.local",
    siteName: "Douyin Supreme",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
