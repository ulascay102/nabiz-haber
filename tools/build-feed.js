// GitHub Actions'ta çalışır: tüm kaynakları çeker ve hazır besleme dosyalarını
// (_site/articles.json, live.json, markets.json) üretir. Bu dosyalar GitHub Pages
// (CDN) üzerinden yayınlanır; uygulama yalnızca bunları indirir, siteleri kendi çekmez.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = join(__dirname, "..", "_site");
await mkdir(SITE, { recursive: true });

// run() çıktısını _site'a yazması için veri klasörünü içe aktarmadan ÖNCE ayarla.
process.env.NABIZ_DATA_DIR = SITE;

const { run } = await import("../fetch-news.js");
await run({ quiet: false }); // _site/articles.json üretir

// Canlı yayınlar ve piyasa verisini de aynı klasöre yaz.
try {
  const { getLive } = await import("../lib/live.js");
  await writeFile(join(SITE, "live.json"), JSON.stringify(await getLive()), "utf8");
  console.log("live.json yazıldı");
} catch (e) { console.warn("live.json atlandı:", e.message); }

try {
  const { getMarkets } = await import("../lib/markets.js");
  await writeFile(join(SITE, "markets.json"), JSON.stringify(await getMarkets()), "utf8");
  console.log("markets.json yazıldı");
} catch (e) { console.warn("markets.json atlandı:", e.message); }

// Basit bir dizin sayfası (Pages kökü için).
await writeFile(
  join(SITE, "index.html"),
  "<!doctype html><meta charset=utf-8><title>Nabız Haber — besleme</title>" +
  "<h1>Nabız Haber besleme</h1><ul>" +
  "<li><a href=articles.json>articles.json</a></li>" +
  "<li><a href=live.json>live.json</a></li>" +
  "<li><a href=markets.json>markets.json</a></li></ul>",
  "utf8"
);
console.log("Besleme hazır:", SITE);
