// Nabız Haber — Electron masaüstü sarmalayıcı.
// Dahili Node sunucusunu (server.js) başlatır ve arayüzü kendi penceresinde açar.
const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const { pathToFileURL } = require("node:url");

const APP_ROOT = path.join(__dirname, "..");
const PORT = process.env.PORT || 4173;

function setup() {
  // Veri dosyası yazılabilir kullanıcı klasörüne yazılsın (uygulama klasörü salt-okunur olabilir)
  const dataDir = app.getPath("userData");
  process.env.NABIZ_DATA_DIR = dataDir;
  try { fs.mkdirSync(dataDir, { recursive: true }); } catch {}
  // İlk açılışta anında içerik için tohum veri kopyala
  try {
    const dst = path.join(dataDir, "articles.json");
    const seed = path.join(APP_ROOT, "public", "articles.json");
    if (!fs.existsSync(dst) && fs.existsSync(seed)) fs.copyFileSync(seed, dst);
  } catch {}
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: "Nabız Haber",
    autoHideMenuBar: true,
    backgroundColor: "#0f0f12",
    webPreferences: {
      webviewTag: true, // haber linkleri uygulama içi sekmede (webview) açılsın
    },
  });
  const load = () => win.loadURL(`http://localhost:${PORT}`);
  load();
  // Sunucu henüz hazır değilse yeniden dene
  win.webContents.on("did-fail-load", () => setTimeout(load, 700));

  // Ana pencerede window.open çağrısı: linki gerçek sistem tarayıcısında aç,
  // pencereyi açma (haberler zaten uygulama içi okuyucuda/webview'de gösterilir).
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith(`http://localhost:${PORT}`)) e.preventDefault();
  });
}

app.whenReady().then(async () => {
  setup();
  await import(pathToFileURL(path.join(APP_ROOT, "server.js")).href); // sunucuyu başlatır
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
