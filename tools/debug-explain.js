// Geçici ayıklama aracı: verilen metinleri içeren haberlerin puanlarını yazdırır.
// Kullanım: node tools/debug-explain.js deprem Portekiz Stelco "guarantee of job"
import { sources } from "../config/sources.js";
import { parseFeed } from "../lib/rss.js";
import { explain } from "../lib/categorize.js";

const terms = process.argv.slice(2).map((t) => t.toLowerCase());
const UA = { "user-agent": "Mozilla/5.0 (NabizHaberDemo; +local)" };

const results = await Promise.all(
  sources.map(async (source) => {
    try {
      const r = await fetch(source.url, { headers: UA, signal: AbortSignal.timeout(15000) });
      return { source, items: parseFeed(await r.text()) };
    } catch {
      return { source, items: [] };
    }
  })
);

for (const { source, items } of results) {
  for (const it of items) {
    const hay = (it.title + " " + (it.summary || "")).toLowerCase();
    if (!terms.some((t) => hay.includes(t))) continue;
    const e = explain(it, source);
    console.log(`\n"${it.title.slice(0, 80)}" [${source.name}]`);
    console.log(`  -> kapsam=${e.scope} konu=${e.topic}`);
    console.log(`  TR: ${e.turkeyHits.join(", ") || "-"}`);
    console.log(`  borsa: ${e.borsa.join(", ") || "-"}`);
    console.log(`  ekonomi: ${e.ekonomi.join(", ") || "-"}`);
    console.log(`  siyaset: ${e.siyaset.join(", ") || "-"}`);
    console.log(`  savas: ${(e.savas || []).join(", ") || "-"}`);
    console.log(`  magazin: ${(e.magazin || []).join(", ") || "-"}`);
  }
}
