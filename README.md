# 🎬 Download Video - Douyin, TikTok & Facebook Downloader

<div align="center">

**Download watermark-free videos from Douyin, TikTok, and Facebook in the highest quality**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📖 Introduction

**Download Video** is a modern web application that helps you download watermark-free videos from popular platforms like Douyin (抖音), TikTok, and Facebook. The application automatically detects the platform, removes watermarks, selects the highest bitrate available (up to 1080p/4K), and returns high-quality MP4 files.

### ✨ Key Features

- 🎯 **Automatic Platform Detection** - Supports Douyin, TikTok, and Facebook
- 🚫 **No Watermark** - Videos are downloaded completely watermark-free
- 🎥 **Maximum Quality** - Automatically selects the highest available bitrate (1080p/4K)
- 💾 **MongoDB Cache** - Stores history and caches results, no need to re-analyze
- 🎨 **Neo-brutalist UI** - Modern dark theme interface with gradient accents
- 📱 **Responsive Design** - Optimized for both desktop and mobile
- ⚡ **Fast Processing** - Processes videos in seconds

---

## 🖼️ Interface

### Layout 7-3

The application uses a layout that divides the screen into 2 parts:
- **70% left side**: Main interface for entering links and downloading videos
- **30% right side**: Sidebar displaying analyzed video history

### UI Features

- **Dark Theme**: Dark interface with gradient accent colors (purple, orange, green)
- **Custom Scrollbar**: Thin, transparent scrollbar that blends with the background
- **Smooth Animations**: Drawer and Dialog with smooth animations
- **Platform Badges**: Color-coded badges to distinguish each platform (Douyin: pink, TikTok: cyan, Facebook: blue)
- **Status Indicators**: Clear status display (Ready to download, Processing, Success, Error)

---

## 🚀 Detailed Features

### 1. Watermark-free Video Download

- Supports 3 platforms: **Douyin**, **TikTok**, **Facebook**
- Automatically detects platform from URL
- Supports both short URLs and full URLs
- Automatically removes watermarks from videos

### 2. High Quality

- Automatically selects the highest available bitrate
- Supports resolutions up to **1080p/4K**
- Returns super sharp **MP4** files
- Displays detailed information: resolution, bitrate, size, duration

### 3. MongoDB Cache & History

- **Smart Cache**: Stores analysis results in MongoDB
- **No Re-analysis**: If a video has already been analyzed, retrieves from cache instantly
- **Video History**: View all downloaded videos
- **Statistics**: Track the number of analyzed videos
- **Delete History**: Easily delete videos from history

### 4. Proxy Download

- Uses server-side proxy to download videos
- Forces download instead of opening video player
- Handles CORS and cross-origin issues
- Automatically sets safe filenames

### 5. Video Player & Preview

- Integrated video player in drawer
- Preview videos before downloading
- Displays thumbnail, cover, avatar
- Detailed information: author, description, duration, resolution

---

## 🛠️ Technology Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **React 19** - UI library

### Backend

- **Next.js API Routes** - Server-side API endpoints
- **MongoDB** - NoSQL database for cache and history
- **Puppeteer** - Headless browser for fallback scraping

### Key Libraries

```json
{
  "next": "16.0.3",
  "react": "19.2.0",
  "typescript": "5",
  "mongodb": "7.0.0",
  "puppeteer": "24.30.0",
  "tailwindcss": "4"
}
```

---

## 📦 Installation

### 1. Clone repository

```bash
git clone <repository-url>
cd download-video
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure MongoDB

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection String
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017

# Or MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Optional: Database name (default is "download-video")
MONGODB_DB_NAME=download-video
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**MongoDB Atlas:**
- Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get the connection string and add it to `.env.local`

### 5. Run the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 6. Usage

1. **Copy video link** from Douyin/TikTok/Facebook
2. **Paste link** into the input field
3. **Click "Download Now"** - System automatically analyzes
4. **Preview** in drawer and download the video

---

## 🎯 Use Cases

### Download Douyin Video

```
1. Open Douyin app/website
2. Select the video you want to download
3. Click "Share" button → "Copy Link"
4. Paste link into the application
5. Click "Download Now"
```

### Download TikTok Video

```
1. Open TikTok app/website
2. Select the video you want to download
3. Click "Share" button → "Copy Link"
4. Paste link into the application
5. Click "Download Now"
```

### Download Facebook Video

```
1. Open Facebook app/website
2. Select the video you want to download
3. Click "Share" button → "Copy Link"
4. Paste link into the application
5. Click "Download Now"
```

---

## 📁 Project Structure

```
download-video/
├── app/
│   ├── api/
│   │   ├── douyin/
│   │   │   ├── download/route.ts    # Proxy download endpoint
│   │   │   └── route.ts             # Douyin analysis API
│   │   ├── tiktok/
│   │   │   ├── download/route.ts   # Proxy download endpoint
│   │   │   └── route.ts             # TikTok analysis API
│   │   ├── facebook/
│   │   │   ├── download/route.ts   # Proxy download endpoint
│   │   │   └── route.ts             # Facebook analysis API
│   │   └── history/
│   │       └── route.ts             # History API (GET, DELETE)
│   ├── components/
│   │   └── Dialog.tsx               # Dialog component
│   ├── page.tsx                     # Home page with 7-3 layout
│   └── globals.css                  # Global styles
├── lib/
│   └── mongodb.ts                   # MongoDB connection
├── models/
│   └── video.ts                     # Video cache models & functions
└── package.json
```

---

## 🔌 API Endpoints

### POST `/api/douyin`
Analyze and retrieve Douyin video information.

**Request:**
```json
{
  "url": "https://v.douyin.com/..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "1234567890",
    "description": "Video description",
    "author": "Author name",
    "duration": 30,
    "resolution": "1080×1920",
    "noWatermarkUrl": "https://...",
    "proxyDownload": "/api/douyin/download?...",
    "platform": "douyin"
  },
  "cached": false
}
```

### POST `/api/tiktok`
Analyze and retrieve TikTok video information.

### POST `/api/facebook`
Analyze and retrieve Facebook video information.

### GET `/api/history`
Get analyzed video history.

**Query Parameters:**
- `limit` (optional): Number of videos (default: 50)
- `stats` (optional): Include statistics (true/false)

### DELETE `/api/history`
Delete video from history.

**Query Parameters:**
- `id`: Video ID or MongoDB _id

---

## 💾 Database Schema

### Collection: `videos`

```typescript
{
  _id: ObjectId,
  url: string,                    // Original URL
  normalizedUrl: string,          // Normalized URL for lookup
  videoId: string,                // Video ID
  platform: "douyin" | "tiktok" | "facebook",
  result: {
    videoId: string,
    description: string,
    author: string,
    duration: number,
    resolution: string,
    noWatermarkUrl: string,
    proxyDownload: string,
    // ... more fields
  },
  createdAt: Date,
  updatedAt: Date,
  accessedAt: Date,               // Last access time
  accessCount: number             // Access count
}
```

---

## 🎨 UI Components

### 1. Main Download Interface

- **Input Field**: Enter video link with placeholder suggestions
- **Sample Buttons**: Sample buttons for quick testing
- **Status Card**: Display current status
- **Download Button**: Gradient button with animation
- **Platform Badge**: Badge displaying detected platform

### 2. History Sidebar

- **Header**: "Video History" with video count
- **Video Cards**: 
  - Thumbnail with platform badge
  - Title and author
  - Duration and date
  - Delete button on the same line as duration
- **Scrollable**: Auto-scroll when there are many videos

### 3. Video Detail Drawer

- **Header**: Title and close button
- **Video Player**: Preview video with fallback
- **Info Section**: 
  - Author with avatar
  - Description
  - Metadata (duration, resolution, size)
- **Action Buttons**: Download and Delete

### 4. Custom Dialog

- **Confirm Dialog**: Confirm video deletion
- **Alert Dialog**: Display notifications
- **Animations**: Fade and scale effects
- **Keyboard Support**: ESC to close

---

## 🔒 Security & Privacy

- ✅ **Server-side Proxy**: All requests go through the server
- ✅ **URL Validation**: Validates domain before downloading
- ✅ **Filename Sanitization**: Filenames are sanitized to prevent path traversal
- ✅ **No Data Storage**: Videos are not stored on the server, only metadata is cached
- ✅ **CORS Handling**: Handles CORS issues with proxy

---

## 🚀 Performance

- ⚡ **MongoDB Cache**: Reduces analysis time from seconds to <100ms
- ⚡ **Lazy Loading**: Components are loaded when needed
- ⚡ **Optimized Images**: Thumbnails are optimized
- ⚡ **Efficient Queries**: MongoDB queries are optimized with indexes

---

## 🚀 Build & Deploy

### Build for production

```bash
npm run build
```

### Run production

```bash
npm start
```

### Deploy to Vercel

1. Push code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables:
   - `MONGODB_URI`
   - `MONGODB_DB_NAME` (optional)

---

## 📝 Development

### Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint
```

---

## 🎯 Roadmap

- [ ] Add YouTube support
- [ ] Add Instagram support
- [ ] Batch download (download multiple videos at once)
- [ ] Export history to CSV/JSON
- [ ] User authentication
- [ ] Favorite videos
- [ ] Video quality selection
- [ ] Download progress indicator

---

## 📝 Notes

- Videos are cached in MongoDB to avoid re-analysis
- Proxy download endpoint is used to force download instead of opening video player
- Puppeteer is used as fallback when official API is not working
- History sidebar automatically refreshes after analyzing a new video

---

## 🤝 Contributing

This is a private project. If you want to contribute, please contact the maintainer.

---

## 📄 License

Private project - All rights reserved

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database solution
- Tailwind CSS for the styling system
- All contributors and users

---

<div align="center">

**Made with ❤️ for video lovers**

[⬆ Back to Top](#-download-video---douyin-tiktok--facebook-downloader)

</div>
