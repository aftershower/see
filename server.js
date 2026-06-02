import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { generateCompanionReply } from "./src/companion-core.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml"
};
const browserHardeningHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "content-security-policy": "default-src 'self'; connect-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; manifest-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
};
const publicPaths = new Set([
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.webmanifest",
  "/src/companion-core.js",
  "/src/local-data.js"
]);

export function createServer() {
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", "http://localhost");

      if (url.pathname === "/health") {
        return sendJson(response, 200, { ok: true });
      }

      if (url.pathname === "/api/chat") {
        if (request.method !== "POST") {
          return sendJson(response, 405, { error: "method_not_allowed" }, { allow: "POST" });
        }
        if (!isJsonRequest(request)) {
          return sendJson(response, 415, { error: "unsupported_media_type" });
        }
        const body = await readJson(request);
        return sendJson(response, 200, generateCompanionReply({
          text: body.text || "",
          memories: Array.isArray(body.memories) ? body.memories : [],
          locale: body.locale || "zh-CN"
        }));
      }

      if (url.pathname.startsWith("/api/")) {
        return sendJson(response, 404, { error: "not_found" });
      }

      return serveStatic(url.pathname, response);
    } catch (error) {
      return sendJson(response, error.statusCode || 500, {
        error: error.publicMessage || "server_error"
      });
    }
  });
}

async function serveStatic(pathname, response) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  let decoded;
  try {
    decoded = decodeURIComponent(requested);
  } catch {
    return sendText(response, 400, "Bad request", "text/plain; charset=utf-8");
  }
  if (!publicPaths.has(pathname)) {
    return sendText(response, 404, "Not found", "text/plain; charset=utf-8");
  }
  const fullPath = normalize(join(root, decoded));
  const relation = relative(root, fullPath);

  if (relation.startsWith("..") || relation === "..") {
    return sendText(response, 403, "Forbidden", "text/plain; charset=utf-8");
  }

  try {
    const file = await readFile(fullPath);
    const type = contentTypes[extname(fullPath)] || "application/octet-stream";
    response.writeHead(200, withHeaders({ "content-type": type }));
    response.end(file);
  } catch {
    sendText(response, 404, "Not found", "text/plain; charset=utf-8");
  }
}

function isJsonRequest(request) {
  const contentType = request.headers["content-type"] || "";
  return String(contentType).toLowerCase().split(";")[0].trim() === "application/json";
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) {
      const error = new Error("Payload too large");
      error.statusCode = 413;
      error.publicMessage = "payload_too_large";
      throw error;
    }
  }
  try {
    return body ? JSON.parse(body) : {};
  } catch {
    const error = new Error("Invalid JSON");
    error.statusCode = 400;
    error.publicMessage = "invalid_json";
    throw error;
  }
}

function sendJson(response, status, payload, headers = {}) {
  response.writeHead(status, withHeaders({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...headers
  }));
  response.end(JSON.stringify(payload));
}

function sendText(response, status, text, type) {
  response.writeHead(status, withHeaders({ "content-type": type }));
  response.end(text);
}

function withHeaders(headers = {}) {
  return {
    ...browserHardeningHeaders,
    ...headers
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 5173);
  const host = process.env.HOST || "127.0.0.1";
  createServer().listen(port, host, () => {
    console.log(`See is running at http://${host}:${port}`);
  });
}
