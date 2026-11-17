// Sosyal adapter: data/social/*.json dosyalarını okur ve haber hattına
// katılabilecek { source, items } yapıları üretir. Platformdan bağımsızdır —
// X, Bluesky veya Mastodon çıktısı aynı biçimde beslenebilir (bkz. README).
//
// Bu modül HİÇBİR sosyal ağa bağlanmaz, kimlik bilgisi (auth_token/çerez)
// işlemez. Yalnızca kullanıcının ürettiği yerel JSON'u okur.

import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOCIAL_DIR = join(__dirname, "..", "data", "social");

function oneLine(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

// Bir sosyal gönderiyi haber (article) biçimine çevirir.
function toItem(post) {
  const text = oneLine(post.text);
  if (!text) return null;
  const title = text.length > 140 ? text.slice(0, 139) + "…" : text;
  return {
    title,
    url: post.url || "",
    summary: text.slice(0, 220),
    image: post.image || null,
    publishedAt: post.createdAt ? new Date(post.createdAt).toISOString() : null,
    _id: post.id || post.url || text,
  };
}

// Tüm sosyal JSON dosyalarını okuyup kaynak+haber listeleri döndürür.
export async function loadSocial() {
  let files = [];
  try {
    files = (await readdir(SOCIAL_DIR)).filter((f) => f.endsWith(".json"));
  } catch {
    return []; // klasör yoksa sorun değil
  }

  const groups = [];
  for (const f of files) {
    let data;
    try {
      data = JSON.parse(await readFile(join(SOCIAL_DIR, f), "utf8"));
    } catch (e) {
      console.warn(`  ! sosyal ${f}: okunamadı (${e.message})`);
      continue;
    }
    const platform = data.platform || "social";
    const posts = Array.isArray(data) ? data : data.posts || [];

    for (const post of posts) {
      const item = toItem(post);
      if (!item) continue;
      const handle = post.handle ? post.handle.replace(/^@/, "") : "";
      const name = post.author || (handle ? "@" + handle : platform);
      groups.push({
        source: {
          name,
          handle,
          lang: "tr",
          scope: post.scope || "yerel", // kendi takip akışın -> varsayılan yerel
          topic: post.topic || null,
          type: "social",
          platform,
        },
        items: [item],
      });
    }
  }
  return groups;
}
