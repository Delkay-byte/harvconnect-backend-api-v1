const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

const HTML_PAGES = [
  "index",
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "marketplace",
  "product-detail",
  "cart",
  "orders",
  "notifications",
  "profile",
  "farmer-products",
  "farmer-orders",
  "transport",
  "drivers",
  "get-transport",
  "faqs",
  "chat",
  "driver-profile",
  "tracking",
];

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>404 Not Found</h1>");
      return;
    }
    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split("?")[0];

  if (urlPath === "/") {
    urlPath = "/index.html";
  } else if (!path.extname(urlPath)) {
    const pageName = urlPath.replace(/^\//, "");
    if (HTML_PAGES.includes(pageName)) {
      urlPath = "/" + pageName + ".html";
    } else {
      urlPath = urlPath + ".html";
    }
  }

  const filePath = path.join(PUBLIC_DIR, urlPath);
  const resolved = path.resolve(filePath);

  if (!resolved.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  serveFile(res, resolved);
});

server.listen(PORT, () => {
  console.log("HarvConnect Frontend running at http://localhost:" + PORT);
});
