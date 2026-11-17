// Nabız Haber — gerçek JSON API + statik arayüz sunucusu (bağımlılıksız).
// Çalıştırma:  npm run serve   ->  http://localhost:4173
//
// API uç noktaları:
//   GET /api/health
//   GET /api/categories
//   GET /api/sources
//   GET /api/articles?scope=&topic=&category=&q=&source=&type=&limit=&offset=

import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize, extname } from "node:path";
import { sources } from "./config/sources.js";
import { categories } from "./lib/categorize.js";
import { getMarkets } from "./lib/markets.js"; // piyasa anlık (tek host: Yahoo) çekilir

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "public");
// Veri dosyası yazılabilir bir klasörde olmalı (paketlenmiş uygulamada public/ salt-okunur).
// Electron, NABIZ_DATA_DIR'i kullanıcı veri klasörüne ayarlar; yoksa public/ kullanılır.
const DATA = join(process.env.NABIZ_DATA_DIR || ROOT, "articles.json");
const PORT = process.env.PORT || 4173;
// Otomatik tazeleme aralığı (dakika). 0 veya negatif -> otomatik tazeleme kapalı.
const REFRESH_MINUTES = process.env.REFRESH_MINUTES !== undefined ? parseInt(process.env.REFRESH_MINUTES, 10) : 15;
// Haberler istemcide ÇEKİLMEZ: GitHub Actions'ın hazırlayıp GitHub Pages'te
// yayınladığı tek besleme indirilir. Böylece kullanıcının IP'si onlarca Cloudflare'li
// siteye istek atmaz; yalnızca tek bir CDN adresiyle konuşur (ban/yavaşlama çözümü).
const FEED_URL = (process.env.NABIZ_FEED_URL || "https://ulascay102.github.io/nabiz-haber").replace(/\/+$/, "");

// Canlı yayın listesini (live.json) kısa süre önbellekleyerek beslemeden indir.
const liveCache = { t: 0, v: null };
async function feedCached(name, cache, ttl, fallback) {
  if (cache.v && Date.now() - cache.t < ttl) return cache.v;
  try {
    const res = await fetch(`${FEED_URL}/${name}`, { headers: { "user-agent": "NabizHaber" }, signal: AbortSignal.timeout(15000) });
    if (res.ok) { cache.v = await res.json(); cache.t = Date.now(); }
  } catch {}
  return cache.v || fallback;
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
};

// --- Otomatik tazeleme ---
let refreshing = false;
let lastRefresh = null;

async function refresh() {
  if (refreshing) return null; // çakışmayı önle
  refreshing = true;
  try {
    // Hazır beslemeyi (tek dosya) GitHub Pages CDN'den indir.
    const res = await fetch(`${FEED_URL}/articles.json`, {
      headers: { "user-agent": "NabizHaber" },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();
    if (!payload || !Array.isArray(payload.articles)) throw new Error("geçersiz besleme");
    await writeFile(DATA, JSON.stringify(payload), "utf8");
    lastRefresh = payload.generatedAt;
    console.log(`[tazelendi] ${payload.total} haber @ ${lastRefresh}`);
    return { total: payload.total, generatedAt: payload.generatedAt };
  } catch (e) {
    console.warn(`[tazeleme hatası] ${e.message}`);
    return null;
  } finally {
    refreshing = false;
  }
}

async function loadData() {
  try {
    return JSON.parse(await readFile(DATA, "utf8"));
  } catch {
    return { generatedAt: null, total: 0, articles: [], categories };
  }
}

function sendJSON(res, obj, status = 200) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": "no-store",
  });
  res.end(body);
}

function num(v, def) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
}

async function handleApi(path, params, res) {
  const data = await loadData();

  if (path === "/api/health") {
    return sendJSON(res, {
      ok: true, total: data.total, generatedAt: data.generatedAt,
      refreshMinutes: REFRESH_MINUTES > 0 ? REFRESH_MINUTES : null, refreshing,
    });
  }

  if (path === "/api/refresh") {
    const r = await refresh();
    return sendJSON(res, r ? { ok: true, ...r } : { ok: false, busy: refreshing });
  }

  if (path === "/api/live") {
    return sendJSON(res, await feedCached("live.json", liveCache, 300000, []));
  }

  if (path === "/api/markets") {
    // Piyasa anlık: doğrudan Yahoo'dan (tek host, ~45 sn önbellekli) — ban riski yok.
    return sendJSON(res, await getMarkets());
  }

  if (path === "/api/categories") {
    const counts = {};
    for (const a of data.articles) counts[a.category] = (counts[a.category] || 0) + 1;
    return sendJSON(res, (data.categories || categories).map((c) => ({ ...c, count: counts[c.code] || 0 })));
  }

  if (path === "/api/sources") {
    return sendJSON(res, sources.map((s) => ({
      name: s.name, scope: s.scope, topic: s.topic, type: "news", lang: s.lang,
    })));
  }

  if (path === "/api/articles") {
    let list = data.articles;
    const { scope, topic, category, source, type, q } = params;
    if (scope) list = list.filter((a) => a.scope === scope);
    if (topic) list = list.filter((a) => a.topic === topic);
    if (category) list = list.filter((a) => a.category === category);
    if (source) list = list.filter((a) => (a.source || "").toLowerCase() === source.toLowerCase());
    if (type) list = list.filter((a) => a.type === type);
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter((a) => (a.title + " " + a.summary + " " + a.source).toLowerCase().includes(needle));
    }
    const total = list.length;
    const limit = Math.min(num(params.limit, 30), 200);
    const offset = Math.max(num(params.offset, 0), 0);
    return sendJSON(res, { total, count: Math.min(limit, Math.max(total - offset, 0)), limit, offset, articles: list.slice(offset, offset + limit) });
  }

  return sendJSON(res, { error: "not_found" }, 404);
}

async function handleStatic(path, res) {
  if (path === "/") path = "/index.html";
  const file = join(ROOT, normalize(path).replace(/^(\.\.[/\\])+/, ""));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end("Forbidden"); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": TYPES[extname(file)] || "application/octet-stream",
      "cache-control": "no-store", // tarayıcı eski sayfayı önbelleğe almasın
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Bulunamadı");
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = decodeURIComponent(url.pathname);
  if (path.startsWith("/api/")) {
    const params = Object.fromEntries(url.searchParams);
    return handleApi(path, params, res).catch(() => sendJSON(res, { error: "server" }, 500));
  }
  return handleStatic(path, res);
}).listen(PORT, async () => {
  console.log(`Nabız Haber: http://localhost:${PORT}`);
  console.log(`API:         http://localhost:${PORT}/api/articles`);

  // Açılışta en güncel beslemeyi indir (başarısız olursa tohum veri gösterilir).
  await refresh();
  if (REFRESH_MINUTES > 0) {
    console.log(`Otomatik tazeleme: her ${REFRESH_MINUTES} dakikada bir.`);
    setInterval(refresh, REFRESH_MINUTES * 60 * 1000);
  } else {
    console.log("Otomatik tazeleme kapalı (REFRESH_MINUTES=0).");
  }
});
