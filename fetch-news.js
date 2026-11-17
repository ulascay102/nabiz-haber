// Tüm kaynakları çeker, ayrıştırır, kategoriler ve public/articles.json üretir.
// Çalıştırma:  npm run fetch   (veya: node fetch-news.js)

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { sources } from "./config/sources.js";
import { parseFeed } from "./lib/rss.js";
import { loadSocial } from "./lib/social.js";
import { categorize, categories } from "./lib/categorize.js";
import { dedupe } from "./lib/dedup.js";
import { summarizeCard } from "./lib/headline.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Paketlenmiş uygulamada public/ salt-okunur olur; yazılabilir klasör için NABIZ_DATA_DIR.
const OUT_DIR = process.env.NABIZ_DATA_DIR || join(__dirname, "public");
const OUT_FILE = join(OUT_DIR, "articles.json");

const UA = { "user-agent": "Mozilla/5.0 (NabizHaberDemo; +local)" };

async function fetchOne(source) {
  try {
    const res = await fetch(source.url, { headers: UA, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return { source, items: [], error: `HTTP ${res.status}` };
    const xml = await res.text();
    const items = parseFeed(xml);
    return { source, items };
  } catch (e) {
    return { source, items: [], error: e.message };
  }
}

function relativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  if (isNaN(diff)) return "";
  const dk = Math.round(diff / 60000);
  if (dk < 1) return "az önce";
  if (dk < 60) return `${dk} dk`;
  const sa = Math.round(dk / 60);
  if (sa < 24) return `${sa} sa`;
  return `${Math.round(sa / 24)} gün`;
}

// Tüm kaynakları çekip public/articles.json üretir. server.js bunu periyodik
// olarak da çağırır. quiet=true iken ayrıntılı log basmaz, tek satır özet döner.
export async function run({ quiet = false } = {}) {
  const log = quiet ? () => {} : (...a) => console.log(...a);
  log(`${sources.length} kaynak çekiliyor...`);
  const results = await Promise.all(sources.map(fetchOne));

  // Sosyal gönderiler (data/social/*.json) — kullanıcının ürettiği JSON
  const social = await loadSocial();
  if (social.length) log(`  (sosyal: ${social.length} gönderi)`);

  const seen = new Set();
  const articles = [];

  for (const { source, items, error } of [...results, ...social]) {
    if (error && !quiet) console.warn(`  ! ${source.name}: ${error}`);
    else log(`  + ${source.name}: ${items.length} haber`);

    for (const it of items) {
      const key = (it._id || it.url || it.title).trim();
      if (seen.has(key)) continue;
      seen.add(key);

      const { scope, topic, category } = categorize(it, source);
      const { displayTitle, body } = summarizeCard(it.title, it.summary);
      articles.push({
        title: it.title,
        displayTitle,
        summary: body,
        url: it.url,
        image: it.image || null,
        source: source.name,
        lang: source.lang,
        type: source.type === "social" ? "social" : "news",
        platform: source.platform || null,
        publishedAt: it.publishedAt,
        time: relativeTime(it.publishedAt),
        scope,
        topic,
        category,
      });
    }
  }

  // En yeni önce (tarihi olmayanlar sona)
  articles.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));

  // Yakın-tekrarları ayıkla (aynı olay, farklı kaynak) — en yenisini tutar
  const before = articles.length;
  const finalArticles = dedupe(articles);
  log(`\nTekrarlar ayıklandı: ${before - finalArticles.length} (${before} -> ${finalArticles.length})`);

  // Kategori dağılımı özeti
  const counts = {};
  for (const a of finalArticles) counts[a.category] = (counts[a.category] || 0) + 1;
  if (!quiet) {
    log("\nKategori dağılımı:");
    for (const c of categories) log(`  ${c.label.padEnd(16)} ${counts[c.code] || 0}`);
  }

  const generatedAt = new Date().toISOString();
  const payload = { generatedAt, total: finalArticles.length, categories, articles: finalArticles };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(payload, null, 2), "utf8");
  log(`\nToplam ${finalArticles.length} haber -> public/articles.json`);
  return { total: finalArticles.length, generatedAt };
}

// Doğrudan çalıştırıldığında (node fetch-news.js) bir kez çek.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
