// Clickbait başlıkları ÜCRETSİZ (yapay zeka yok) temizler:
// - "SON DAKİKA | / FLAŞ / ÖZEL / CANLI" ekleri atılır
// - "BAŞLIK | soru soru" biçiminde ilk anlamlı parça alınır
// - TAMAMI BÜYÜK HARF başlık cümle düzenine (Türkçe-duyarlı) çevrilir
// - sondaki soru-yemi ("... mi oldu? nerede? kaç...?") kırpılır
// Not: gerçek yeniden-yazım/özet için AI gerekir; bu yalnızca temizliktir.

const BAIT = /\b(son\s*dakika|flas|flaş|özel|ozel|canli|canlı\s*yayin|canlı|video|izle|tıkla|tikla)\b/gi;

function shouty(s) {
  const letters = s.replace(/[^\p{L}]/gu, "");
  if (letters.length < 10) return false;
  const upper = (s.match(/\p{Lu}/gu) || []).length;
  return upper / letters.length > 0.6;
}

function toSentence(s) {
  const low = s.toLocaleLowerCase("tr");
  return low.replace(/(^|[.!?]\s+)(\p{L})/gu, (_, p, ch) => p + ch.toLocaleUpperCase("tr"));
}

export function cleanHeadline(title) {
  let t = (title || "").trim();
  if (!t) return title;

  // bait kelimelerini at, kalan ayraç/boşluğu topla
  t = t.replace(BAIT, " ").replace(/\s{2,}/g, " ").trim();
  t = t.replace(/^[\s:|!\-–—]+/, "").trim();

  // "BAŞLIK | bait" -> ilk parça
  if (t.includes("|")) {
    const first = t.split("|")[0].trim();
    if (first.length >= 15) t = first;
  }

  // sondaki üst üste soru-yemi: "..., nerede, kaç ...?" -> ilk cümleye kadar kırp
  // birden fazla '?' varsa ilk '?'den sonrasını at
  const q = t.indexOf("?");
  if (q !== -1 && t.length - q > 8 && (t.match(/\?/g) || []).length >= 1) {
    const head = t.slice(0, q + 1).trim();
    if (head.length >= 15) t = head;
  }

  if (shouty(t)) t = toSentence(t);

  t = t.replace(/\s{2,}/g, " ").replace(/[\s:|\-–—]+$/, "").trim();
  return t.length >= 10 ? t : title;
}

// Kartta gösterilecek { displayTitle, body } üretir.
// Özet (RSS açıklaması) düzgün prozadır; ilk cümlesini başlık yapar, kalanı gövde.
// Özet yoksa/kısa ise clickbait başlığı temizleyip kullanır.
export function summarizeCard(title, summary) {
  const s = (summary || "").trim();
  if (s.length >= 40) {
    const m = s.match(/^[\s\S]*?[.!?](\s|$)/);
    const first = (m ? m[0] : s).trim();
    const rest = (m ? s.slice(m[0].length) : "").trim();
    if (first.length >= 25 && first.length <= 180) {
      return { displayTitle: first, body: rest };
    }
  }
  return { displayTitle: cleanHeadline(title), body: s };
}
