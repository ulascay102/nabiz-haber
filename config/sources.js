// Haber kaynakları. Her kaynağın bir "scope" (yerel = Türkiye / genel = dünya)
// ve isteğe bağlı bir "topic" ipucu vardır. Bu ipuçları kategorizasyonda
// başlangıç noktasıdır; anahtar kelime kuralları (lib/categorize.js) gerektiğinde
// konuyu değiştirir. Yeni kaynak eklemek için bu listeye bir satır eklemek yeterli.

export const sources = [
  // --- Türkiye (yerel) ---
  { name: "Hürriyet", lang: "tr", scope: "yerel", topic: null,      url: "https://www.hurriyet.com.tr/rss/gundem" },
  { name: "Hürriyet Ekonomi", lang: "tr", scope: "yerel", topic: "ekonomi", url: "https://www.hurriyet.com.tr/rss/ekonomi" },
  { name: "Milliyet", lang: "tr", scope: "yerel", topic: null,      url: "https://www.milliyet.com.tr/rss/rssnew/gundemrss.xml" },
  { name: "Milliyet Ekonomi", lang: "tr", scope: "yerel", topic: "ekonomi", url: "https://www.milliyet.com.tr/rss/rssnew/ekonomirss.xml" },
  { name: "Cumhuriyet", lang: "tr", scope: "yerel", topic: null,    url: "https://www.cumhuriyet.com.tr/rss/son_dakika.xml" },
  { name: "TRT Haber", lang: "tr", scope: "yerel", topic: null,     url: "https://www.trthaber.com/manset_articles.rss" },
  { name: "Anadolu Ajansı", lang: "tr", scope: "yerel", topic: null, url: "https://www.aa.com.tr/tr/rss/default?cat=guncel" },
  { name: "NTV Ekonomi", lang: "tr", scope: "yerel", topic: "ekonomi", url: "https://www.ntv.com.tr/ekonomi.rss" },
  { name: "Dünya", lang: "tr", scope: "yerel", topic: "ekonomi",    url: "https://www.dunya.com/rss" },
  { name: "Hürriyet Spor", lang: "tr", scope: "yerel", topic: "spor", url: "https://www.hurriyet.com.tr/rss/spor" },
  { name: "Cumhuriyet Spor", lang: "tr", scope: "yerel", topic: "spor", url: "https://www.cumhuriyet.com.tr/rss/spor.xml" },
  { name: "AA Spor", lang: "tr", scope: "yerel", topic: "spor",     url: "https://www.aa.com.tr/tr/rss/default?cat=spor" },
  { name: "Habertürk", lang: "tr", scope: "yerel", topic: null,     url: "https://www.haberturk.com/rss" },
  { name: "Habertürk Ekonomi", lang: "tr", scope: "yerel", topic: "ekonomi", url: "https://www.haberturk.com/rss/ekonomi.xml" },
  { name: "Habertürk Spor", lang: "tr", scope: "yerel", topic: "spor", url: "https://www.haberturk.com/rss/spor.xml" },
  { name: "Sözcü", lang: "tr", scope: "yerel", topic: null,         url: "https://www.sozcu.com.tr/rss/" },
  { name: "CNN Türk", lang: "tr", scope: "yerel", topic: null,      url: "https://www.cnnturk.com/feed/rss/all/news" },
  { name: "CNN Türk Ekonomi", lang: "tr", scope: "yerel", topic: "ekonomi", url: "https://www.cnnturk.com/feed/rss/ekonomi/news" },
  { name: "Gazete Duvar", lang: "tr", scope: "yerel", topic: null,  url: "https://www.gazeteduvar.com.tr/export/rss" },
  { name: "Sabah", lang: "tr", scope: "yerel", topic: null,         url: "https://www.sabah.com.tr/rss/anasayfa.xml" },
  { name: "Fotomaç", lang: "tr", scope: "yerel", topic: "spor",     url: "https://www.fotomac.com.tr/rss/anasayfa.xml" },
  { name: "TRT Ekonomi", lang: "tr", scope: "yerel", topic: "ekonomi", url: "https://www.trthaber.com/ekonomi_articles.rss" },

  // --- Türkçe dünya (genel, Türkiye işareti varsa yerel'e döner) ---
  { name: "Euronews Türkçe", lang: "tr", scope: "genel", topic: null, url: "https://tr.euronews.com/rss" },
  { name: "DW Türkçe", lang: "tr", scope: "genel", topic: null,     url: "https://rss.dw.com/rdf/rss-tur-all" },
  { name: "Independent Türkçe", lang: "tr", scope: "genel", topic: null, url: "https://www.indyturk.com/rss.xml" },

  // --- Dünya (genel) ---
  { name: "BBC Türkçe", lang: "tr", scope: "genel", topic: null,    url: "https://feeds.bbci.co.uk/turkce/rss.xml" },
  { name: "BBC World", lang: "en", scope: "genel", topic: null,     url: "https://feeds.bbci.co.uk/news/world/europe/rss.xml" },
  { name: "Al Jazeera", lang: "en", scope: "genel", topic: null,    url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { name: "BBC Business", lang: "en", scope: "genel", topic: "ekonomi", url: "https://feeds.bbci.co.uk/news/business/rss.xml" },
  { name: "BBC Politics", lang: "en", scope: "genel", topic: "siyaset", url: "https://feeds.bbci.co.uk/news/politics/rss.xml" },
  { name: "Fox Business", lang: "en", scope: "genel", topic: "borsa", url: "https://moxie.foxbusiness.com/google-publisher/markets.xml" },
  { name: "Investing.com", lang: "en", scope: "genel", topic: "ekonomi", url: "https://www.investing.com/rss/news.rss" },
  { name: "BBC Sport", lang: "en", scope: "genel", topic: "spor",   url: "https://feeds.bbci.co.uk/sport/rss.xml" },
  { name: "The Guardian", lang: "en", scope: "genel", topic: null,  url: "https://www.theguardian.com/world/rss" },
  { name: "Guardian Business", lang: "en", scope: "genel", topic: "ekonomi", url: "https://www.theguardian.com/business/rss" },
  { name: "Guardian Politics", lang: "en", scope: "genel", topic: "siyaset", url: "https://www.theguardian.com/politics/rss" },
  { name: "Guardian Football", lang: "en", scope: "genel", topic: "spor", url: "https://www.theguardian.com/football/rss" },
  { name: "NYT World", lang: "en", scope: "genel", topic: null,     url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml" },
  { name: "NYT Business", lang: "en", scope: "genel", topic: "ekonomi", url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml" },
  { name: "DW", lang: "en", scope: "genel", topic: null,            url: "https://rss.dw.com/rdf/rss-en-all" },
  { name: "France 24", lang: "en", scope: "genel", topic: null,     url: "https://www.france24.com/en/rss" },
  { name: "CNBC Markets", lang: "en", scope: "genel", topic: "borsa", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258" },
  { name: "Fox Business Ekonomi", lang: "en", scope: "genel", topic: "ekonomi", url: "https://moxie.foxbusiness.com/google-publisher/economy.xml" },
];
