// Anahtar kelime listeleri. Hepsi "normalize" biçiminde yazılır:
// küçük harf + Türkçe karakterler sadeleştirilmiş (ç->c, ğ->g, ı/İ->i, ö->o, ş->s, ü->u).
//
// Eşleştirme biçimi (bkz. lib/categorize.js):
//   "kelime*"      -> ÖNEK eşleşmesi. "hisseler*" -> hisseler, hisseleri...
//                     Türkçe ekleri ve İngilizce çoğulları yakalar.
//   "iki kelime"   -> İFADE (boşluk/& içeren) -> metinde o sırayla aranır.
//   "kelime"       -> TAM sözcük eşleşmesi. Yanıltıcı/çarpışan kelimeler için
//                     (örn. "hisse" önek olursa "hissedildi"yi yakalar -> tam eşleşme).
//
// Yeni kelime eklemek/çıkarmak için kodu değiştirmeye gerek yok.

export const topicKeywords = {
  // Borsa: ekonominin en özel alt kümesi. Puanlamada eşitlikte önceliklidir.
  borsa: [
    "bist*", "borsa*", "hisse", "hisseler*", "hissesi", "hisse senedi",
    "endeks*", "viop", "tahvil*", "halka arz", "temettu*", "kripto*",
    "bitcoin", "ethereum", "gram altin", "ons altin", "nasdaq", "dow jones",
    "s&p", "ftse", "dax", "nikkei", "wall street", "stock", "stocks",
    "stock market", "shares", "shareholder*", "equity", "equities",
    "bond yields", "ipo", "bourse",
  ],
  ekonomi: [
    "enflasyon*", "faiz*", "dolar*", "euro", "doviz*", "tcmb", "merkez bankasi",
    "ihracat*", "ithalat*", "buyume*", "butce*", "issizlik*", "asgari ucret",
    "ekonomi*", "gsyh", "cari acik", "resesyon*", "vergi*", "istihdam*", "tuik",
    "zam", "ekonomik kriz", "inflation*", "interest rate", "economy",
    "economic*", "gdp", "export*", "exports", "imports", "unemployment", "fed",
    "ecb", "recession*", "tariff*", "budget*", "cost of living",
  ],
  // Spor: güçlü ve ayırt edici kelimeler (zayıf/çarpışanlar — transfer, puan,
  // kadro — bilerek dışarıda bırakıldı; yanlış spor eşleşmesi yapmasınlar diye).
  spor: [
    "mac", "maclar*", "gol*", "lig", "ligi", "ligde", "ligler*", "ligin",
    "teknik direktor", "sampiyon*",
    "super lig", "futbol*", "basketbol*", "voleybol*", "milli takim", "derbi*",
    "penalti*", "hakem*", "antrenor*", "fikstur*", "galibiyet*", "maglubiyet*",
    "deplasman*", "uefa", "sampiyonlar ligi", "euroleague", "nba", "olimpiyat*",
    "galatasaray*", "fenerbahce*", "besiktas*", "trabzonspor*", "football",
    "soccer", "champions league", "world cup", "olympic*",
  ],
  siyaset: [
    "meclis*", "tbmm", "bakan*", "cumhurbaskan*", "secim*", "parti*", "chp",
    "akp", "mhp", "iyi parti", "koalisyon*", "hukumet*", "muhalefet*",
    "anayasa*", "kabine*", "milletvekil*", "yaptirim*", "zirve*", "diplomasi*",
    "buyukelci*", "kinama*", "guvenlik konseyi", "birlesmis milletler", "nato",
    "kremlin", "election*", "parliament*", "minister*", "president*", "party",
    "parties", "government*", "sanction*", "summit*", "senate", "congress*",
    "white house", "diplomacy", "diplomatic", "vote*", "coalition*",
    "referendum*", "cabinet", "united nations", "ambassador*",
  ],
  // Savaş/çatışma: savaşa ÖZGÜ eylem kelimeleri. Ülke adları bilerek yok,
  // yoksa o ülkenin siyaset/ekonomi haberi de savaşa düşerdi.
  savas: [
    "savas*", "catisma*", "cephe*", "bombardiman*", "bombalama*", "ateskes*",
    "isgal*", "muhimmat*", "fuze*", "roket*", "iha", "siha*", "tank*",
    "hava saldiri*", "kara harekat*", "askeri operasyon", "savas ucagi",
    "silahli kuvvetler", "asker*", "sehit*", "saldiri*", "war", "warfare",
    "ceasefire", "airstrike*", "shelling", "offensive", "invasion",
    "frontline", "troops", "missile*", "military operation", "combat", "bombing",
  ],
  // Magazin / dizi: ünlüler, diziler, müzik, ilişki olayları. Ayrı sayfaya düşsün.
  magazin: [
    "magazin*", "dizi", "dizisi", "diziler*", "dizinin", "oyuncu*", "sarkici*",
    "sanatci*", "unluler", "konser", "konserler*", "klip", "album", "albumu", "paparazzi",
    "kirmizi hali", "survivor*", "yarismaci*", "fenomen*", "sevgili*", "bosan*",
    "nisanlan*", "dugun*", "ask hayati", "manken*", "guzellik yarismasi",
    "celebrity", "celebrities", "actor", "actress", "singer", "hollywood",
    "red carpet", "gossip",
  ],
};

// Türkiye işaretleri: metinde geçerse haber "yerel" kabul edilir.
export const turkeyMarkers = [
  "turkiye", "turkey", "turk*", "erdogan*", "tbmm", "bist*", "tcmb", "lira*",
  "tl", "anadolu*",
  // iller
  "istanbul*", "ankara*", "izmir*", "bursa", "antalya*", "adana", "konya",
  "gaziantep*", "trabzon*", "diyarbakir*", "malatya*", "kayseri*", "mersin*",
  "samsun*", "eskisehir*", "sanliurfa*", "kocaeli*", "denizli*", "sakarya*",
  "van", "aydin*", "mugla*", "manisa*", "kahramanmaras*", "sivas*", "balikesir*",
  "elazig*", "erzurum*", "ordu", "hatay*", "tekirdag*",
  // kurumlar / takımlar
  "valilik*", "belediye*", "kaymakam*", "bakanlik*", "cumhurbaskanligi", "afad",
  "osym", "yargitay*", "danistay*", "emniyet*", "jandarma*", "galatasaray*",
  "fenerbahce*", "besiktas*", "trabzonspor*", "akp", "chp", "mhp",
];

// Yabancı ülke/şehir işaretleri: Türkiye işareti YOKken bunlardan biri geçerse,
// yerel kaynaklı bir haber bile "genel" (dünya) kabul edilir.
export const foreignMarkers = [
  "abd", "amerika*", "washington*", "ingiltere*", "londra*", "almanya*",
  "berlin*", "fransa*", "paris*", "italya*", "roma", "ispanya*", "portekiz*",
  "hollanda*", "belcika*", "brüksel", "bruksel", "isvec*", "norvec*",
  "yunanistan*", "rusya*", "moskova*", "ukrayna*", "kiev*", "cin", "pekin*",
  "japonya*", "tokyo*", "hindistan*", "pakistan*", "iran*", "tahran*", "irak*",
  "suriye*", "israil*", "gazze", "filistin*", "lubnan*", "misir*", "libya*",
  "kanada*", "brezilya*", "arjantin*", "meksika*", "avustralya*",
];
