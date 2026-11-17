// Canlı yayın kanalları (YouTube). Sunucu her birinin o anki canlı video
// kimliğini bulur (lib/live.js). Kanal eklemek için bir satır yeterli.
export const channels = [
  { name: "TRT Haber", scope: "yerel", handle: "trthaber", badge: "CANLI" },
  { name: "A Haber", scope: "yerel", handle: "ahaber", badge: "CANLI" },
  { name: "CNN Türk", scope: "yerel", handle: "cnnturk", badge: "CANLI" },
  { name: "Habertürk", scope: "yerel", handle: "haberturk", badge: "CANLI" },
  { name: "Al Jazeera", scope: "genel", handle: "aljazeeraenglish", badge: "LIVE" },
  { name: "DW News", scope: "genel", handle: "dwnews", badge: "LIVE" },
  { name: "France 24", scope: "genel", handle: "France24_en", badge: "LIVE" },
  { name: "Sky News", scope: "genel", handle: "SkyNews", badge: "LIVE" },
];
