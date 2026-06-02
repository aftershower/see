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

export function createServer() {
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", "http://localhost");

      if (url.pathname === "/health") {
        return sendJson(response, 200, { ok: true });
      }

      if (url.pathname === "/api/chat" && request.method === "POST") {
        const body = await readJson(request);
        return sendJson(response, 200, generateCompanionReply({
          text: body.text || "",
          memories: Array.isArray(body.memories) ? body.memories : []
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
  const decoded = decodeURIComponent(requested);
  const fullPath = normalize(join(root, decoded));
  const relation = relative(root, fullPath);

  if (relation.startsWith("..") || relation.includes("..")) {
    return sendText(response, 403, "Forbidden", "text/plain; charset=utf-8");
  }

  try {
    const file = await readFile(fullPath);
    const type = contentTypes[extname(fullPath)] || "application/octet-stream";
    response.writeHead(200, { "content-type": type });
    response.end(file);
  } catch {
    sendText(response, 404, "Not found", "text/plain; charset=utf-8");
  }
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

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function sendText(response, status, text, type) {
  response.writeHead(status, { "content-type": type });
  response.end(text);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 5173);
  createServer().listen(port, () => {
    console.log(`See is running at http://localhost:${port}`);
  });
}
