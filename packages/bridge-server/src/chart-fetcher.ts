import { TIMING } from "@uss-claude/shared";
import { logger } from "./logger.js";

interface TrendingTrack {
  artist: string;
  title: string;
}

/**
 * Songs that always trigger disco mode, regardless of chart status.
 * Matched with the same fuzzy logic as chart tracks.
 */
const ALWAYS_DISCO: TrendingTrack[] = [
  // KPop Demon Hunters (Netflix) — full soundtrack
  { artist: "HUNTR/X", title: "Golden" },
  { artist: "HUNTR/X", title: "How It's Done" },
  { artist: "HUNTR/X", title: "Takedown" },
  { artist: "HUNTR/X", title: "What It Sounds Like" },
  { artist: "HUNTR/X", title: "Free" },
  { artist: "HUNTR/X", title: "Prologue" },
  { artist: "TWICE", title: "Takedown" },
  { artist: "TWICE", title: "Strategy" },
  { artist: "Saja Boys", title: "Soda Pop" },
  { artist: "Saja Boys", title: "Your Idol" },
  { artist: "MeloMance", title: "Love, Maybe" },
  { artist: "Jokers", title: "Path" },
  { artist: "KPop Demon Hunters", title: "" },  // any track with this artist tag

  // Classics that deserve disco
  { artist: "Katy Perry", title: "I Kissed a Girl" },
  { artist: "Katy Perry", title: "Firework" },
  { artist: "Shakira", title: "Waka Waka" },
  { artist: "Shakira", title: "La La La" },
  { artist: "Shakira", title: "Hips Don't Lie" },
];

let trendingCache: TrendingTrack[] = [];
let lastFetch = 0;

/** Normalize a string for fuzzy matching (lowercase, strip punctuation) */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

/** Check if two strings match via bidirectional substring */
function fuzzyMatch(a: string, b: string): boolean {
  if (a === "" || b === "") return true;  // empty = wildcard
  return a.includes(b) || b.includes(a);
}

/** Fetch top tracks from Last.fm chart API */
async function fetchTrending(): Promise<TrendingTrack[]> {
  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) {
    logger.warn("chart", "LASTFM_API_KEY not set — chart matching disabled, using allowlist only");
    return [];
  }

  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${apiKey}&format=json&limit=50`;
    const res = await fetch(url);
    if (!res.ok) {
      logger.warn("chart", `Last.fm returned ${res.status}`);
      return [];
    }
    const data = await res.json() as {
      tracks?: {
        track?: Array<{ name?: string; artist?: { name?: string } }>;
      };
    };
    if (!data.tracks?.track || !Array.isArray(data.tracks.track)) {
      logger.warn("chart", "Last.fm response missing tracks array");
      return [];
    }

    return data.tracks.track
      .filter((t): t is { name: string; artist: { name: string } } =>
        typeof t.name === "string" && typeof t.artist?.name === "string")
      .map((t) => ({ artist: t.artist.name, title: t.name }));
  } catch (err) {
    logger.warn("chart", "Failed to fetch Last.fm chart", { error: String(err) });
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
    logger.info("chart", `Last.fm chart refreshed: ${tracks.length} tracks`);
  }
}

/** Check if a track is on the trending chart or in the allowlist */
export async function isTrackTrending(artist: string, title: string): Promise<boolean> {
  const normArtist = normalize(artist);
  const normTitle = normalize(title);

  // Check allowlist first (no network needed)
  const allowlistMatch = ALWAYS_DISCO.some((track) => {
    const ta = normalize(track.artist);
    const tt = normalize(track.title);
    return fuzzyMatch(ta, normArtist) && fuzzyMatch(tt, normTitle);
  });

  if (allowlistMatch) {
    logger.info("chart", "Allowlist MATCH!", { artist, title });
    return true;
  }

  // Check live chart
  await ensureFresh();
  if (trendingCache.length === 0) {
    logger.info("chart", "No chart data — no match", { artist, title });
    return false;
  }

  const chartMatch = trendingCache.some((track) => {
    const ta = normalize(track.artist);
    const tt = normalize(track.title);
    return fuzzyMatch(ta, normArtist) && fuzzyMatch(tt, normTitle);
  });

  logger.info("chart", chartMatch ? "Chart MATCH!" : "No match", {
    artist, title, cacheSize: trendingCache.length,
  });
  return chartMatch;
}
