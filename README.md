# Nabız Haber

Türkiye odaklı haber okuyucu. Bilinen medya kaynaklarından RSS ile haber çeker,
yerel/genel × gündem/siyaset/savaş/spor/ekonomi/borsa/magazin olarak kategorilere ayırır;
canlı piyasa bandı, canlı YouTube yayınları ve son dakika bildirimleri içerir.
Bağımsız bir masaüstü uygulaması (Electron) olarak paketlenebilir.

## Özellikler

- 40+ RSS kaynağından otomatik haber çekme (15 dk'da bir + elle "Yenile")
- Anahtar kelime tabanlı kategori ayrımı (yapay zeka gerektirmez)
- Yakın-tekrar (aynı olay, farklı kaynak) ayıklama
- Clickbait yerine özet başlıklar
- Canlı piyasa bandı (USD/EUR/altın/BIST)
- Sağ panelde canlı YouTube yayınları
- Son dakika için sağ alttan açılan bildirim (pop-up)
- Masaüstü uygulamasında haber linkleri uygulama içi sekmeli okuyucuda açılır

## Çalıştırma (geliştirme)

Node.js 18+ gerekir. Çalışma zamanı bağımlılığı yoktur; yalnızca paketleme için dev araçları.

```bash
npm install        # yalnızca paketleme/Electron için
npm start          # haberleri çeker ve http://localhost:4173 sunar
```

Sadece sunucu (var olan veriyle): `npm run serve`
Sadece haber çekme: `npm run fetch`

## Masaüstü uygulaması

```bash
npm run app        # Electron penceresinde çalıştır
```

Paketlenmiş `.exe` üretmek için `@electron/packager` kullanılır
(ayrıntı için proje geçmişine bakın).

## Yapı

- `config/` — kaynaklar, anahtar kelimeler, kanallar
- `lib/` — RSS ayrıştırma, kategori, tekrar ayıklama, başlık özeti, canlı yayın, piyasa
- `fetch-news.js` — tüm kaynakları çeker, `articles.json` üretir
- `server.js` — JSON API + statik arayüz sunucusu
- `public/` — tek sayfalık arayüz (SPA)
- `electron/` — masaüstü sarmalayıcı

## Not

Haberler kaynaklara link verilerek gösterilir; tam metin kopyalanmaz.
Görsel ve özetler ilgili kaynaklara aittir.
