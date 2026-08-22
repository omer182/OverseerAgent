import axios from 'axios';
import { OVERSEERR_URL, OVERSEERR_API_KEY, profileMap } from '../config/index.js';
import { MediaIntent } from './mediaIntentService.js'; // Assuming MediaIntent will be used here

export interface OverseerrSearchResult {
  id: number;
  mediaType?: string;
  mediaInfo?: {
    status?: number;
    seasons?: { seasonNumber: number; status?: number }[];
  };
}

const overseerrHeaders = {
  "X-Api-Key": OVERSEERR_API_KEY!,
  "Content-Type": "application/json",
};

export async function searchOverseerr(title: string): Promise<OverseerrSearchResult[]> {
  try {
    console.log("🔍 Searching Overseerr for:", title);
    const res = await axios.get(`${OVERSEERR_URL}/api/v1/search`, {
      params: { query: encodeURIComponent(title) },
      headers: overseerrHeaders,
    });
    return res.data.results as OverseerrSearchResult[];
  } catch (err: unknown) {
    console.error("❌ Error searching Overseerr:", err instanceof Error ? err.message : String(err));
    throw new Error("Failed to search Overseerr");
  }
}

export async function requestMedia(intent: MediaIntent, mediaId: number): Promise<unknown> {
  const { mediaType, profile } = intent;

  interface RequestPayload {
    mediaType: string;
    mediaId: number;
    profileId: number;
    tvdbId?: number;
    seasons?: "all" | number[];
  }

  const payload: RequestPayload = {
    mediaType,
    mediaId,
    // If the intent specifies a numeric profile use it, otherwise fall back to the
    // configured default profile for the media type (movies vs tv) from profileMap.
    profileId: profile ?? ((): number => {
      const mapKey = mediaType === 'movie' ? 'movies' : 'tv';
      const defaultProfile = profileMap[mapKey]?.default ?? profileMap['movies']?.default ?? 0;
      return defaultProfile;
    })()
  };

  if (mediaType === 'tv') {
    payload.tvdbId = mediaId;
    if (intent.seasons === 'all') {
      payload.seasons = 'all';
    } else if (Array.isArray(intent.seasons)) {
      payload.seasons = intent.seasons;
    } else {
      payload.seasons = [1]; // Default to season 1 if not specified
    }
  }
  console.log("📦 Requesting media with payload:", payload);
  try {
    const res = await axios.post(
      `${OVERSEERR_URL}/api/v1/request`,
      payload,
      { headers: overseerrHeaders }
    );
    if (!res.data) {
      throw new Error("Invalid response from Overseerr API");
    }
    return res.data;
  } catch (err: unknown) {
    console.error("❌ Error requesting media:", err instanceof Error ? err.message : String(err));
    throw new Error("Failed to request media");
  }
} 