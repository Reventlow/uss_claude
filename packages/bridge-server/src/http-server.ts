import { createReadStream, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import { logger } from "./logger.js";

/** MIME type map for static file serving */
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/**
 * Creates a static file request handler.
 * Serves files from the given directory with proper MIME types.
 */
export function createStaticHandler(staticDir: string): (req: IncomingMessage, res: ServerResponse) => void {
  const root = resolve(staticDir);

  return (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "Content-Type": "text/plain" });
      res.end("Method Not Allowed");
      return;
    }

    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    let pathname = url.pathname;

    // Default to index.html for root
    if (pathname === "/") {
      pathname = "/index.html";
    }

    // Prevent directory traversal
    const filePath = join(root, pathname);
    if (!filePath.startsWith(root)) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Forbidden");
      return;
    }

    try {
      const stat = statSync(filePath);
      if (!stat.isFile()) {
        // If not a file, try serving index.html (SPA fallback)
        serveFile(join(root, "index.html"), res);
        return;
      }
      serveFile(filePath, res);
    } catch {
      // File not found — serve index.html for SPA routing
      try {
        serveFile(join(root, "index.html"), res);
      } catch {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
      }
    }
  };
}

function serveFile(filePath: string, res: ServerResponse): void {
  const ext = extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  try {
    const stat = statSync(filePath);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stat.size,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400",
    });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
}
