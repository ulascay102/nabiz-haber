// Canlı piyasa verileri (ücretsiz, anahtarsız) — Yahoo Finance chart uçları.
// USD/TRY, EUR/TRY, GBP/TRY, BIST 100, Ons Altın; Gram Altın hesaplanır.
// Sonuç ~45 sn önbelleğe alınır.

const UA = { "user-agent": "Mozilla/5.0" };
const TTL = 45 * 1000;
let cache = null;
let cacheAt = 0;

async function yq(sym) {
  const u = "https://query1.finance.yahoo.com/v8/finance/chart/" + encodeURIComponent(sym);
  try {
    const j = await fetch(u, { headers: UA, signal: AbortSignal.timeout(12000) }).then((r) => r.json());
    const m = j && j.chart && j.chart.result && j.chart.result[0] && j.chart.result[0].meta;
    if (!m || typeof m.regularMarketPrice !== "number") return null;
    return { price: m.regularMarketPrice, prev: m.chartPreviousClose ?? m.previousClose ?? m.regularMarketPrice };
  } catch {
    return null;
  }
}

const pct = (r) => (r && r.prev ? ((r.price - r.prev) / r.prev) * 100 : 0);

export async function getMarkets() {
  if (cache && Date.now() - cacheAt < TTL) return cache;

  const [usd, eur, gbp, bist, ons] = await Promise.all([
    yq("USDTRY=X"), yq("EURTRY=X"), yq("GBPTRY=X"), yq("XU100.IS"), yq("GC=F"),
  ]);

  const out = [];
  const add = (label, r, dec, unit) => { if (r) out.push({ label, price: r.price, change: pct(r), dec, unit }); };

  add("USD/TRY", usd, 2, "₺");
  add("EUR/TRY", eur, 2, "₺");
  add("GBP/TRY", gbp, 2, "₺");
  if (usd && ons) {
    const gram = (ons.price / 31.1035) * usd.price; // ons USD -> gram TRY
    out.push({ label: "Gram Altın", price: gram, change: pct(ons) + pct(usd), dec: 0, unit: "₺" });
  }
  add("Ons Altın", ons, 0, "$");
  add("BIST 100", bist, 0, "");

  if (out.length) { cache = out; cacheAt = Date.now(); }
  return out;
}
