// Yakın-tekrar ayıklama: aynı olayın farklı kaynaklardan gelen (farklı başlık/
// URL) kopyalarını eler, ilk göreni tutar. Başlıklardaki anlamlı kelimelerin
// örtüşmesine (Jaccard benzerliği) bakar.

import { normalize } from "./categorize.js";

// Haber başlıklarında sık geçen, ayırt etmeyen kelimeler (elenir).
const STOP = new Set([
  "son", "dakika", "aciklama", "aciklandi", "icin", "ile", "olan", "oldu",
  "sonra", "karsi", "buyuk", "yeni", "haberi", "haberler", "nedir", "nasil",
  "kimdir", "canli", "izle", "video", "foto", "galeri", "gundem", "bugun",
  "yil", "gun", "saat", "sonrasi", "oldugu", "dair", "kadar", "daha", "cok",
]);

export function titleSig(title) {
  const toks = normalize(title)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4 && !STOP.has(w))
    .map((w) => w.slice(0, 5)); // köke yakın kısalt: Türkçe ekleri (fail/faili/failler) birleşsin
  return new Set(toks);
}

// Kapsama (containment): kısa başlığın kelimelerinin diğerinde geçme oranı.
// En az 3 ortak ayırt edici kelime şartıyla; yoksa alakasız kısa başlıklar birleşir.
function overlap(a, b) {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  if (inter < 3) return 0;
  return inter / Math.min(a.size, b.size);
}

// articles -> tekrarları ayıklanmış yeni dizi. threshold: 0..1 kapsama eşiği.
export function dedupe(articles, threshold = 0.55) {
  const kept = [];
  const sigs = [];
  const index = new Map(); // kelime -> tutulan haberlerin indeksleri (yalnızca aday daraltma)

  for (const art of articles) {
    const s = titleSig(art.title);
    if (s.size < 2) { kept.push(art); sigs.push(s); continue; } // başlık çok kısa: dokunma

    const cand = new Set();
    for (const tok of s) {
      const lst = index.get(tok);
      if (lst) for (const i of lst) cand.add(i);
    }
    let dup = false;
    for (const i of cand) {
      if (overlap(s, sigs[i]) >= threshold) { dup = true; break; }
    }
    if (dup) continue;

    const ki = kept.length;
    kept.push(art);
    sigs.push(s);
    for (const tok of s) {
      let lst = index.get(tok);
      if (!lst) index.set(tok, (lst = []));
      lst.push(ki);
    }
  }
  return kept;
}
