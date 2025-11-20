import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export type VideoPlatform = "douyin" | "tiktok" | "facebook";

export type VideoAnalysisResult = {
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

export type VideoCacheDocument = {
  _id?: string | ObjectId;
  url: string; // Original URL
  normalizedUrl: string; // Normalized URL for lookup
  videoId: string;
  platform: VideoPlatform;
  result: VideoAnalysisResult;
  createdAt: Date;
  updatedAt: Date;
  accessedAt: Date; // Last time this cache was accessed
  accessCount: number; // How many times this video was requested
};

/**
 * Get cached video analysis result by URL
 */
export async function getCachedVideo(
  url: string,
  platform: VideoPlatform
): Promise<VideoAnalysisResult | null> {
  try {
    const db = await getDb();
    const collection = db.collection<VideoCacheDocument>("videos");

    // Normalize URL for lookup
    const normalizedUrl = normalizeUrlForCache(url);

    const cached = await collection.findOne({
      normalizedUrl,
      platform,
    });

    if (cached) {
      // Update access time and count
      await collection.updateOne(
        { _id: cached._id },
        {
          $set: { accessedAt: new Date() },
          $inc: { accessCount: 1 },
        }
      );

      return cached.result;
    }

    return null;
  } catch (error) {
    console.error("[Video Cache] Error getting cached video:", error);
    return null;
  }
}

/**
 * Save video analysis result to cache
 */
export async function saveVideoToCache(
  url: string,
  platform: VideoPlatform,
  result: VideoAnalysisResult
): Promise<void> {
  try {
    const db = await getDb();
    const collection = db.collection<VideoCacheDocument>("videos");

    const normalizedUrl = normalizeUrlForCache(url);
    const now = new Date();

    // Check if document exists
    const existing = await collection.findOne({
      normalizedUrl,
      platform,
      videoId: result.videoId,
    });

    if (existing) {
      // Update existing document
      await collection.updateOne(
        {
          normalizedUrl,
          platform,
          videoId: result.videoId,
        },
        {
          $set: {
            url,
            normalizedUrl,
            videoId: result.videoId,
            platform,
            result,
            updatedAt: now,
            accessedAt: now,
          },
          $inc: { accessCount: 1 },
        }
      );
    } else {
      // Insert new document
      await collection.insertOne({
        url,
        normalizedUrl,
        videoId: result.videoId,
        platform,
        result,
        createdAt: now,
        updatedAt: now,
        accessedAt: now,
        accessCount: 1,
      });
    }
  } catch (error) {
    console.error("[Video Cache] Error saving video to cache:", error);
    // Don't throw - caching is not critical
  }
}

/**
 * Normalize URL for cache lookup
 * Removes query params, fragments, and normalizes the URL
 */
function normalizeUrlForCache(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove query params and fragments
    urlObj.search = "";
    urlObj.hash = "";
    // Normalize protocol
    urlObj.protocol = "https:";
    // Remove trailing slash
    let normalized = urlObj.toString();
    if (normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    // If URL parsing fails, return cleaned version
    return url
      .replace(/[?#].*$/, "")
      .replace(/\/$/, "")
      .toLowerCase();
  }
}

/**
 * Get video history (recently accessed videos)
 */
export async function getVideoHistory(
  limit: number = 50
): Promise<VideoCacheDocument[]> {
  try {
    const db = await getDb();
    const collection = db.collection<VideoCacheDocument>("videos");

    return await collection
      .find({})
      .sort({ accessedAt: -1 })
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error("[Video Cache] Error getting video history:", error);
    return [];
  }
}

/**
 * Delete video from cache by ID
 */
export async function deleteVideoFromCache(
  videoId: string
): Promise<boolean> {
  try {
    const db = await getDb();
    const collection = db.collection<VideoCacheDocument>("videos");

    // Try to delete by _id (ObjectId or string)
    let result;
    try {
      // Try as ObjectId first
      if (ObjectId.isValid(videoId)) {
        const objectId = new ObjectId(videoId);
        result = await collection.deleteOne({ _id: objectId });
      } else {
        result = await collection.deleteOne({ _id: videoId });
      }
    } catch {
      // If not valid ObjectId, try as string
      result = await collection.deleteOne({ _id: videoId });
    }

    // Also try deleting by videoId field as fallback
    if (result.deletedCount === 0) {
      result = await collection.deleteOne({ videoId });
    }

    return result.deletedCount > 0;
  } catch (error) {
    console.error("[Video Cache] Error deleting video:", error);
    return false;
  }
}

/**
 * Get statistics about cached videos
 */
export async function getCacheStats(): Promise<{
  totalVideos: number;
  totalAccesses: number;
  mostAccessed: VideoCacheDocument[];
}> {
  try {
    const db = await getDb();
    const collection = db.collection<VideoCacheDocument>("videos");

    const totalVideos = await collection.countDocuments();
    const totalAccesses = await collection
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$accessCount" },
          },
        },
      ])
      .toArray();

    const mostAccessed = await collection
      .find({})
      .sort({ accessCount: -1 })
      .limit(10)
      .toArray();

    return {
      totalVideos,
      totalAccesses: totalAccesses[0]?.total || 0,
      mostAccessed,
    };
  } catch (error) {
    console.error("[Video Cache] Error getting cache stats:", error);
    return {
      totalVideos: 0,
      totalAccesses: 0,
      mostAccessed: [],
    };
  }
}

