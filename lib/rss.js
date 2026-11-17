// Küçük, bağımlılıksız RSS/Atom ayrıştırıcı. Bilinen haber feed'leri için yeterli.
// Üretimde olgun bir kütüphane (ör. rss-parser) tercih edilebilir; demo için saf Node.

function decodeEntities(s) {
  if (!s) return "";
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&nbsp;/gi, " ")
    .replace(/&(?:rsquo|lsquo|#8217|#8216);/gi, "'")
    .replace(/&(?:rdquo|ldquo|#8220|#8221);/gi, '"')
    .replace(/&(?:ndash|mdash|#8211|#8212);/gi, "-")
    .replace(/&(?:hellip|#8230);/gi, "…")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&amp;/g, "&");
}

function stripTags(s) {
  return decodeEntities(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function tag(block, name) {
  // <name ...>içerik</name> — namespace'li adlar için nokta kaçışı
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name.split(":")[0]}[^>]*>`, "i");
  const m = block.match(re);
  return m ? m[1].trim() : "";
}

function attr(block, tagName, attrName) {
  const re = new RegExp(`<${tagName}[^>]*\\b${attrName}=["']([^"']+)["'][^>]*>`, "i");
  const m = block.match(re);
  return m ? m[1] : "";
}

function findImage(block) {
  const url =
    attr(block, "enclosure", "url") ||
    attr(block, "media:content", "url") ||
    attr(block, "media:thumbnail", "url") ||
    tag(block, "image") ||            // bazı feed'ler (AA) item içinde <image>URL</image> verir
    (block.match(/<img[^>]+src=["']([^"']+)["']/i) || [])[1] ||
    "";
  return decodeEntities(url).trim();
}

export function parseFeed(xml) {
  const items = [];
  const isAtom = /<entry[\s>]/.test(xml) && !/<item[\s>]/.test(xml);
  const blocks = xml.split(isAtom ? /<entry[\s>]/ : /<item[\s>]/).slice(1);

  for (const raw of blocks) {
    const block = "<x " + raw; // bölme sırasında kaybolan açılışı geri koy
    const title = stripTags(tag(block, "title"));
    if (!title) continue;

    let link = tag(block, "link");
    if (!link || /^\s*$/.test(link)) link = attr(block, "link", "href"); // Atom
    link = decodeEntities(link).trim();

    const rawSummary =
      tag(block, "description") ||
      tag(block, "summary") ||
      tag(block, "content:encoded") ||
      tag(block, "content");
    const summary = stripTags(rawSummary).slice(0, 220);

    const date =
      tag(block, "pubDate") ||
      tag(block, "published") ||
      tag(block, "updated") ||
      tag(block, "dc:date");

    const parsed = date ? new Date(date) : null;
    items.push({
      title,
      url: link,
      summary,
      image: findImage(block),
      publishedAt: parsed && !isNaN(parsed.getTime()) ? parsed.toISOString() : null,
    });
  }
  return items;
}
