/** Server configuration from environment variables with defaults */

export interface ServerConfig {
  /** Host to bind to */
  host: string;
  /** Port to listen on */
  port: number;
  /** Token for ingest client authentication */
  bridgeToken: string;
  /** Optional password for browser bridge clients */
  bridgePassword: string | null;
  /** Directory to serve static files from (built UI) */
  staticDir: string;
  /** Last.fm API key for chart matching (optional, enables disco from chart hits) */
  lastfmApiKey: string | null;
}

export function loadConfig(): ServerConfig {
  return {
    host: process.env.BRIDGE_HOST ?? "0.0.0.0",
    port: parseInt(process.env.BRIDGE_PORT ?? "3420", 10),
    bridgeToken: process.env.BRIDGE_TOKEN ?? "",
    bridgePassword: process.env.BRIDGE_PASSWORD ?? null,
    staticDir: process.env.STATIC_DIR ?? "../bridge-ui/dist",
    lastfmApiKey: process.env.LASTFM_API_KEY ?? null,
  };
}
