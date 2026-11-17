# Sosyal akış girişi (X / Bluesky / Mastodon)

Bu klasöre bırakılan `*.json` dosyaları, haber akışına **sosyal gönderi** olarak
katılır. Dosyayı sen üretirsin — X'i kendi aracınla (çerez/`auth_token` yöntemi
dahil, **kendi sorumluluğunda**) çekip aşağıdaki biçimde buraya yazarsın.
Uygulama bu dosyayı okur, kategoriler ve API'ye/arayüze ekler.

> Not: Bu proje `auth_token`/çerez ile X'e bağlanan kodu **içermez**. Burası
> yalnızca senin ürettiğin JSON'u okuyan tarafsız bir giriştir. Aynı biçimi
> Bluesky veya Mastodon çıktısıyla da besleyebilirsin.

## Biçim

Bir nesne (`platform` + `posts`) ya da doğrudan bir gönderi dizisi olabilir.

```json
{
  "platform": "x",
  "posts": [
    {
      "id": "1790000000000000001",
      "author": "Örnek Gazeteci",
      "handle": "ornek_gazeteci",
      "text": "Gönderi metni buraya. Birden çok cümle olabilir.",
      "url": "https://x.com/ornek_gazeteci/status/1790000000000000001",
      "createdAt": "2026-11-14T09:30:00Z",
      "scope": "yerel",
      "topic": "siyaset"
    }
  ]
}
```

### Alanlar

| Alan | Zorunlu | Açıklama |
| --- | --- | --- |
| `id` | önerilir | Tekilleştirme için benzersiz kimlik (yoksa `url`/`text` kullanılır) |
| `text` | **evet** | Gönderi metni |
| `handle` | önerilir | Kullanıcı adı (`@` olmadan) — rozet ve kaynak adı için |
| `author` | hayır | Görünen ad |
| `url` | önerilir | Gönderinin bağlantısı (karta tıklanınca açılır) |
| `createdAt` | önerilir | ISO 8601 tarih; yoksa "zaman" boş kalır |
| `scope` | hayır | `yerel` / `genel` ipucu (yoksa metinden/varsayılandan bulunur) |
| `topic` | hayır | `genel`/`ekonomi`/`borsa`/`siyaset` ipucu |
| `platform` | hayır | `x` / `bluesky` / `mastodon` — arayüzdeki rozet için |

Kategorizasyon, haberlerle **aynı** anahtar kelime motorundan geçer; `scope`/`topic`
verirsen ipucu olarak kullanılır, vermezsen metinden çıkarılır.

Dosyayı güncelledikten sonra `npm run fetch` çalıştır (ya da `node fetch-news.js`).
