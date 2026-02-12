import { TIMING } from "@uss-claude/shared";
import { logger } from "./logger.js";

interface TrendingTrack {
  artist: string;
  title: string;
}

let trendingCache: TrendingTrack[] = [];
let lastFetch = 0;

/** Normalize a string for fuzzy matching (lowercase, strip punctuation) */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

/** Fetch trending singles from TheAudioDB */
async function fetchTrending(): Promise<TrendingTrack[]> {
  try {
    const url = "https://www.theaudiodb.com/api/v1/json/2/trending.php?country=us&type=itunes&format=singles";
    const res = await fetch(url);
    if (!res.ok) {
      logger.warn("chart", `TheAudioDB returned ${res.status}`);
      return [];
    }
    const data = await res.json() as { trending?: Array<{ strArtist?: string; strTrack?: string }> };
    if (!data.trending || !Array.isArray(data.trending)) return [];

    return data.trending
      .filter((t): t is { strArtist: string; strTrack: string } =>
        typeof t.strArtist === "string" && typeof t.strTrack === "string")
      .map((t) => ({ artist: t.strArtist, title: t.strTrack }));
  } catch (err) {
    logger.warn("chart", "Failed to fetch trending chart", { error: String(err) });
    return [];
  }
}

/** Refresh the trending cache if stale */
async function ensureFresh(): Promise<void> {
  const now = Date.now();
  if (now - lastFetch < TIMING.DISCO_CHART_REFRESH && trendingCache.length > 0) return;

  const tracks = await fetchTrending();
  if (tracks.length > 0) {
    trendingCache = tracks;
    lastFetch = now;
    logger.info("chart", `Trending chart refreshed: ${tracks.length} tracks`);
  }
}

/** Check if a track is on the trending chart */
export async function isTrackTrending(artist: string, title: string): Promise<boolean> {
  await ensureFresh();
  if (trendingCache.length === 0) return false;

  const normArtist = normalize(artist);
  const normTitle = normalize(title);

  return trendingCache.some((track) => {
    const ta = normalize(track.artist);
    const tt = normalize(track.title);
    // Match if both artist and title are substrings (either direction)
    return (ta.includes(normArtist) || normArtist.includes(ta)) &&
           (tt.includes(normTitle) || normTitle.includes(tt));
  });
}
