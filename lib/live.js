// Her kanalın o anki canlı YouTube video kimliğini ve gömülebilir olup
// olmadığını çözer. Sonucu birkaç dakika önbelleğe alır (video değişince yenilenir).

import { channels } from "../config/channels.js";

const UA = { "user-agent": "Mozilla/5.0 (NabizHaberDemo; +local)" };
const TTL = 8 * 60 * 1000; // 8 dakika
let cache = null;
let cacheAt = 0;

async function resolveOne(ch) {
  const url = `https://www.youtube.com/@${ch.handle}/live`;
  try {
    const t = await fetch(url, { headers: UA, signal: AbortSignal.timeout(15000) }).then((r) => r.text());
    const videoId = (t.match(/"videoId":"([\w-]{11})"/) || [])[1] || null;
    const playable = /"playableInEmbed":true/.test(t);
    return { name: ch.name, scope: ch.scope, badge: ch.badge, handle: ch.handle, url, videoId, embeddable: !!(playable && videoId) };
  } catch {
    return { name: ch.name, scope: ch.scope, badge: ch.badge, handle: ch.handle, url, videoId: null, embeddable: false };
  }
}

export async function getLive() {
  if (cache && Date.now() - cacheAt < TTL) return cache;
  cache = await Promise.all(channels.map(resolveOne));
  cacheAt = Date.now();
  return cache;
}
