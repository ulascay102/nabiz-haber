import { topicKeywords, turkeyMarkers, foreignMarkers } from "../config/keywords.js";

// Türkçe-duyarlı sadeleştirme: eşleştirmeyi büyük/küçük harf ve aksandan bağımsız yapar.
export function normalize(text) {
  if (!text) return "";
  return text
    .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i")
    .replace(/Ğ/g, "g").replace(/ğ/g, "g")
    .replace(/Ş/g, "s").replace(/ş/g, "s")
    .replace(/Ö/g, "o").replace(/ö/g, "o")
    .replace(/Ü/g, "u").replace(/ü/g, "u")
    .replace(/Ç/g, "c").replace(/ç/g, "c")
    .toLowerCase();
}

// Metinden hızlı eşleştirme için bir bağlam üretir: kelime kümesi + boşlukla
// çevrelenmiş düz metin (ifade araması için).
function buildMatcher(normText) {
  const padded = " " + normText.replace(/[^a-z0-9&]+/g, " ").replace(/\s+/g, " ").trim() + " ";
  const tokens = new Set(padded.trim().split(" "));
  return { padded, tokens };
}

// Tek bir anahtar kelimeyi metinde arar.
//   "kelime*"  -> önek (token.startsWith)
//   "a b" / &  -> ifade (düz metinde sözcük sınırından itibaren)
//   "kelime"   -> tam sözcük
function matches(kw, ctx) {
  if (kw.includes(" ") || kw.includes("&")) return ctx.padded.includes(" " + kw);
  if (kw.endsWith("*")) {
    const stem = kw.slice(0, -1);
    for (const t of ctx.tokens) if (t.startsWith(stem)) return true;
    return false;
  }
  return ctx.tokens.has(kw);
}

function score(ctx, words) {
  let n = 0;
  for (const w of words) if (matches(w, ctx)) n++;
  return n;
}

// Kapsam (yerel/genel):
//  - Türkiye işareti varsa  -> YEREL (yabancı kaynak bile olsa).
//  - Yoksa ve yabancı ülke işareti varsa -> GENEL (yerel kaynak bile olsa).
//  - İkisi de yoksa -> kaynağın varsayılanı (tr gazeteleri yerel).
export function detectScope(ctx, source) {
  if (score(ctx, turkeyMarkers) > 0) return "yerel";
  if (score(ctx, foreignMarkers) > 0) return "genel";
  return source.scope;
}

// Konu tespiti: her konunun eşleşme sayısı puanıdır. Kaynak ipucu +1 ağırlık
// alır (tek başına değil, eşitlik bozucu). En yüksek puan kazanır; eşitlikte
// öncelik borsa > ekonomi > spor > savaş > siyaset. Hiç eşleşme yoksa ipucu, o
// da yoksa "gündem" (kaza, asayiş, hava, genel yerel haber).
const TOPIC_PRIORITY = ["borsa", "ekonomi", "spor", "savas", "siyaset", "magazin"];

export function detectTopic(ctx, source) {
  const s = {
    borsa: score(ctx, topicKeywords.borsa),
    ekonomi: score(ctx, topicKeywords.ekonomi),
    spor: score(ctx, topicKeywords.spor),
    savas: score(ctx, topicKeywords.savas),
    siyaset: score(ctx, topicKeywords.siyaset),
    magazin: score(ctx, topicKeywords.magazin),
  };
  if (source.topic && s[source.topic] !== undefined) s[source.topic] += 1;

  const max = Math.max(s.borsa, s.ekonomi, s.spor, s.savas, s.siyaset, s.magazin);
  if (max === 0) return source.topic || "gundem";
  for (const t of TOPIC_PRIORITY) if (s[t] === max) return t;
  return "gundem";
}

const CODE = {
  "yerel|gundem": "yg", "genel|gundem": "gg",
  "yerel|ekonomi": "ye", "genel|ekonomi": "ge",
  "yerel|borsa": "yb", "genel|borsa": "gb",
  "yerel|siyaset": "ys", "genel|siyaset": "gs",
  "yerel|spor": "ysp", "genel|spor": "gsp",
  "yerel|savas": "ysav", "genel|savas": "gsav",
  "yerel|magazin": "ymag", "genel|magazin": "gmag",
};

// Bir haberi sınıflandırır; { scope, topic, category } döner.
export function categorize(article, source) {
  const ctx = buildMatcher(normalize(`${article.title} ${article.summary || ""}`));
  const scope = detectScope(ctx, source);
  const topic = detectTopic(ctx, source);
  return { scope, topic, category: CODE[`${scope}|${topic}`] };
}

// Geliştirme/ayıklama yardımcısı: bir haberin kapsam + konu puanlarını açıklar.
export function explain(article, source) {
  const ctx = buildMatcher(normalize(`${article.title} ${article.summary || ""}`));
  const hit = (words) => words.filter((w) => matches(w, ctx));
  return {
    scope: detectScope(ctx, source),
    turkeyHits: hit(turkeyMarkers),
    foreignHits: hit(foreignMarkers),
    topic: detectTopic(ctx, source),
    borsa: hit(topicKeywords.borsa),
    ekonomi: hit(topicKeywords.ekonomi),
    spor: hit(topicKeywords.spor),
    savas: hit(topicKeywords.savas),
    siyaset: hit(topicKeywords.siyaset),
    magazin: hit(topicKeywords.magazin),
  };
}

export const categories = [
  { code: "yg",   scope: "yerel", topic: "gundem",  label: "Yerel Gündem" },
  { code: "gg",   scope: "genel", topic: "gundem",  label: "Genel Gündem" },
  { code: "ys",   scope: "yerel", topic: "siyaset", label: "Yerel Siyaset" },
  { code: "gs",   scope: "genel", topic: "siyaset", label: "Genel Siyaset" },
  { code: "ysav", scope: "yerel", topic: "savas",   label: "Yerel Savaş" },
  { code: "gsav", scope: "genel", topic: "savas",   label: "Genel Savaş" },
  { code: "ysp",  scope: "yerel", topic: "spor",    label: "Yerel Spor" },
  { code: "gsp",  scope: "genel", topic: "spor",    label: "Genel Spor" },
  { code: "ye",   scope: "yerel", topic: "ekonomi", label: "Yerel Ekonomi" },
  { code: "ge",   scope: "genel", topic: "ekonomi", label: "Genel Ekonomi" },
  { code: "yb",   scope: "yerel", topic: "borsa",   label: "Yerel Borsa" },
  { code: "gb",   scope: "genel", topic: "borsa",   label: "Genel Borsa" },
  { code: "ymag", scope: "yerel", topic: "magazin", label: "Yerel Magazin" },
  { code: "gmag", scope: "genel", topic: "magazin", label: "Genel Magazin" },
];
