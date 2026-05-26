const { app, BrowserWindow, ipcMain, screen, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");
const fs = require("fs/promises");

let mainWindow;
let widgetWindow;
let settingsWindow;
let quitConfirmWindow;
let updateCheckPromise = null;

const appIconPath = path.join(__dirname, "assets", "app-icon.ico");

const updateState = {
  currentVersion: app.getVersion(),
  status: "idle",
  updateAvailable: false,
  canUpdate: false,
  latestVersion: null,
  message: "업데이트 확인 전입니다.",
  progress: null
};

function getDataDir() {
  return app.isPackaged ? app.getPath("userData") : path.join(__dirname, "data");
}

function getDataPath() {
  return path.join(getDataDir(), "notesData.json");
}

const defaultData = {
  groups: [
    {
      id: "group_todo",
      name: "할일",
      createdAt: new Date().toISOString()
    },
    {
      id: "group_memo_1",
      name: "메모 1",
      createdAt: new Date().toISOString()
    },
    {
      id: "group_memo_2",
      name: "메모 2",
      createdAt: new Date().toISOString()
    }
  ],
  notes: [],
  settings: {
    widgetEnabled: true,
    widgetAlwaysOnTop: false,
    widgetNoteHeight: 104,
    widgetPosition: "right",
    widgetDisplayId: null,
    theme: "light"
  }
};

function normalizeSettings(settings = {}) {
  return {
    ...defaultData.settings,
    ...settings,
    widgetEnabled: settings.widgetEnabled !== false,
    widgetAlwaysOnTop: Boolean(settings.widgetAlwaysOnTop),
    widgetNoteHeight: Math.max(80, Math.min(220, Number(settings.widgetNoteHeight) || 104)),
    widgetPosition: settings.widgetPosition === "left" ? "left" : "right",
    widgetDisplayId: settings.widgetDisplayId ?? null
  };
}

function normalizeData(data = {}) {
  return {
    groups: Array.isArray(data.groups) ? data.groups : [],
    notes: Array.isArray(data.notes) ? data.notes : [],
    settings: normalizeSettings(data.settings)
  };
}

async function ensureDataFile() {
  const dataDir = getDataDir();
  const dataPath = getDataPath();
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dataPath);
  } catch {
    await fs.writeFile(dataPath, JSON.stringify(defaultData, null, 2), "utf8");
  }
}

async function readData() {
  await ensureDataFile();
  const raw = await fs.readFile(getDataPath(), "utf8");
  const data = JSON.parse(raw);
  return normalizeData(data);
}

async function writeData(data) {
  const nextData = normalizeData(data);
  await fs.mkdir(getDataDir(), { recursive: true });
  await fs.writeFile(getDataPath(), JSON.stringify(nextData, null, 2), "utf8");
  notifyWidget(nextData.notes || []);
  applyWidgetSettings(nextData.settings);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("data:changed", nextData);
  }
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.webContents.send("data:changed", nextData);
  }
  return nextData;
}

function getBackupFileName() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `WMN-backup-${stamp}.wmn.json`;
}

async function exportData() {
  const owner = settingsWindow && !settingsWindow.isDestroyed()
    ? settingsWindow
    : mainWindow;
  const result = await dialog.showSaveDialog(owner, {
    title: "데이터 저장",
    defaultPath: getBackupFileName(),
    filters: [
      { name: "WMN 데이터", extensions: ["json"] },
      { name: "JSON 파일", extensions: ["json"] }
    ]
  });

  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }

  const data = await readData();
  await fs.writeFile(result.filePath, JSON.stringify(data, null, 2), "utf8");
  return { canceled: false, filePath: result.filePath };
}

async function importData() {
  const owner = settingsWindow && !settingsWindow.isDestroyed()
    ? settingsWindow
    : mainWindow;
  const result = await dialog.showOpenDialog(owner, {
    title: "데이터 불러오기",
    properties: ["openFile"],
    filters: [
      { name: "WMN 데이터", extensions: ["json"] },
      { name: "JSON 파일", extensions: ["json"] }
    ]
  });

  if (result.canceled || !result.filePaths?.[0]) {
    return { canceled: true };
  }

  const raw = await fs.readFile(result.filePaths[0], "utf8");
  const imported = JSON.parse(raw);
  if (!imported || typeof imported !== "object") {
    throw new Error("올바른 데이터 파일이 아닙니다.");
  }

  const nextData = normalizeData(imported);
  const savedData = await writeData(nextData);
  return { canceled: false, filePath: result.filePaths[0], data: savedData };
}

function sendToWindow(windowRef, channel, payload) {
  if (windowRef && !windowRef.isDestroyed()) {
    windowRef.webContents.send(channel, payload);
  }
}

function broadcastUpdateState() {
  sendToWindow(mainWindow, "update:status", updateState);
  sendToWindow(settingsWindow, "update:status", updateState);
}

function setUpdateState(nextState) {
  Object.assign(updateState, nextState, { currentVersion: app.getVersion() });
  broadcastUpdateState();
  return updateState;
}

function getUpdateState() {
  return { ...updateState };
}

async function checkForUpdates() {
  if (!app.isPackaged) {
    return setUpdateState({
      status: "latest",
      updateAvailable: false,
      canUpdate: false,
      latestVersion: app.getVersion(),
      message: "설치된 앱에서 업데이트를 확인할 수 있습니다.",
      progress: null
    });
  }

  if (updateCheckPromise) return updateCheckPromise;

  setUpdateState({
    status: "checking",
    updateAvailable: false,
    canUpdate: false,
    message: "업데이트 확인 중...",
    progress: null
  });

  updateCheckPromise = autoUpdater.checkForUpdates()
    .catch((error) => {
      setUpdateState({
        status: "error",
        updateAvailable: false,
        canUpdate: false,
        message: error?.message || "업데이트 확인에 실패했습니다.",
        progress: null
      });
    })
    .finally(() => {
      updateCheckPromise = null;
    });

  await updateCheckPromise;
  return getUpdateState();
}

async function installAvailableUpdate() {
  if (!app.isPackaged) return getUpdateState();
  if (!updateState.updateAvailable) return getUpdateState();

  if (updateState.status === "downloaded") {
    autoUpdater.quitAndInstall(true, true);
    return setUpdateState({ status: "installing", message: "업데이트 설치를 시작합니다." });
  }

  if (updateState.status === "downloading") return getUpdateState();

  setUpdateState({
    status: "downloading",
    canUpdate: false,
    message: "업데이트 다운로드 중...",
    progress: 0
  });

  await autoUpdater.downloadUpdate();
  return getUpdateState();
}

function configureAutoUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    setUpdateState({
      status: "checking",
      updateAvailable: false,
      canUpdate: false,
      message: "업데이트 확인 중...",
      progress: null
    });
  });

  autoUpdater.on("update-available", (info) => {
    setUpdateState({
      status: "available",
      updateAvailable: true,
      canUpdate: true,
      latestVersion: info?.version || null,
      message: `${info?.version || "새 버전"} 업데이트가 있습니다.`,
      progress: null
    });
  });

  autoUpdater.on("update-not-available", (info) => {
    setUpdateState({
      status: "latest",
      updateAvailable: false,
      canUpdate: false,
      latestVersion: info?.version || app.getVersion(),
      message: "최신 버전입니다.",
      progress: null
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    setUpdateState({
      status: "downloading",
      updateAvailable: true,
      canUpdate: false,
      message: `업데이트 다운로드 중... ${Math.round(progress.percent || 0)}%`,
      progress: Math.round(progress.percent || 0)
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    setUpdateState({
      status: "downloaded",
      updateAvailable: true,
      canUpdate: false,
      latestVersion: info?.version || updateState.latestVersion,
      message: "다운로드 완료. 업데이트를 설치합니다.",
      progress: 100
    });
    setTimeout(() => autoUpdater.quitAndInstall(true, true), 500);
  });

  autoUpdater.on("error", (error) => {
    setUpdateState({
      status: "error",
      updateAvailable: false,
      canUpdate: false,
      message: error?.message || "업데이트 처리 중 오류가 발생했습니다.",
      progress: null
    });
  });
}

function notifyWidget(notes) {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.webContents.send("pinned-notes", notes.filter((note) => note.pinned));
  }
}

function getSerializableDisplays() {
  return screen.getAllDisplays().map((display, index) => ({
    id: display.id,
    label: display.label || `디스플레이 ${index + 1}`,
    bounds: display.bounds,
    workArea: display.workArea,
    scaleFactor: display.scaleFactor
  }));
}

function getWidgetDisplay(settings = {}) {
  const displays = screen.getAllDisplays();
  const requestedId = Number(settings.widgetDisplayId);
  return displays.find((display) => display.id === requestedId) || screen.getPrimaryDisplay();
}

function getWidgetBoundsForSettings(settings = {}) {
  const display = getWidgetDisplay(settings);
  const workArea = display.workArea;
  const width = 332;
  const height = workArea.height;
  const x = settings.widgetPosition === "left"
    ? workArea.x
    : workArea.x + workArea.width - width;
  const y = workArea.y;

  return { x, y, width, height };
}

function applyWidgetSettings(settings = {}) {
  if (!widgetWindow || widgetWindow.isDestroyed()) return;

  const normalized = normalizeSettings(settings);
  widgetWindow.webContents.send("widget-settings", normalized);
  if (!normalized.widgetEnabled) {
    widgetWindow.hide();
    return;
  }

  widgetWindow.setAlwaysOnTop(normalized.widgetAlwaysOnTop);
  widgetWindow.setBounds(getWidgetBoundsForSettings(normalized));
  widgetWindow.showInactive();
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1020,
    height: 680,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    icon: appIconPath,
    backgroundColor: "#f5f5f5",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "src", "index.html"));
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createWidgetWindow() {
  const settings = normalizeSettings(defaultData.settings);
  const bounds = getWidgetBoundsForSettings(settings);

  widgetWindow = new BrowserWindow({
    ...bounds,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: settings.widgetAlwaysOnTop,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  widgetWindow.loadFile(path.join(__dirname, "src", "widget.html"));
  widgetWindow.once("ready-to-show", async () => {
    const data = await readData();
    applyWidgetSettings(data.settings);
    notifyWidget(data.notes || []);
    widgetWindow.showInactive();
  });
}

function createSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  const display = screen.getPrimaryDisplay();
  const { x, y, width, height } = display.workArea;
  const windowWidth = Math.min(720, width - 48);
  const windowHeight = Math.min(520, height - 48);

  settingsWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 520,
    minHeight: 420,
    x: Math.round(x + (width - windowWidth) / 2),
    y: Math.round(y + (height - windowHeight) / 2),
    frame: false,
    icon: appIconPath,
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  settingsWindow.loadFile(path.join(__dirname, "src", "settings.html"));
  settingsWindow.on("closed", () => {
    settingsWindow = null;
  });
}

function showQuitConfirmWindow() {
  if (quitConfirmWindow && !quitConfirmWindow.isDestroyed()) {
    quitConfirmWindow.focus();
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const display = screen.getPrimaryDisplay();
    const { x, y, width, height } = display.workArea;
    const windowWidth = 320;
    const windowHeight = 140;
    let settled = false;

    const settle = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
      if (quitConfirmWindow && !quitConfirmWindow.isDestroyed()) {
        quitConfirmWindow.close();
      }
    };

    quitConfirmWindow = new BrowserWindow({
      width: windowWidth,
      height: windowHeight,
      x: Math.round(x + (width - windowWidth) / 2),
      y: Math.round(y + (height - windowHeight) / 2),
      frame: false,
      resizable: false,
      minimizable: false,
      maximizable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      backgroundColor: "#ffffff",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    const html = `
      <!doctype html>
      <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              width: 100vw;
              height: 100vh;
              display: grid;
              place-items: center;
              background: rgba(255, 255, 255, 0.98);
              font-family: "Pretendard", "Segoe UI", "Malgun Gothic", Arial, sans-serif;
              color: #333333;
            }
            .dialog {
              width: 100%;
              height: 100%;
              padding: 14px 18px 10px;
              border: 1px solid #d8d8d5;
              border-radius: 8px;
              box-shadow: 0 12px 34px rgba(0, 0, 0, 0.18);
            }
            .dialog-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
              margin-bottom: 12px;
            }
            h3 {
              margin: 0;
              color: #333333;
              font-size: 15px;
              font-weight: 700;
              line-height: 1.2;
              text-align: left;
            }
            p {
              margin: 0 0 14px;
              font-size: 13px;
              font-weight: 500;
              line-height: 1.45;
              text-align: left;
            }
            .actions {
              display: flex;
              justify-content: center;
              gap: 8px;
            }
            button {
              height: 32px;
              border: 1px solid #d8d8d5;
              border-radius: 6px;
              background: #ffffff;
              color: #333333;
              font-size: 13px;
              font-weight: 600;
              line-height: 1;
            }
            .actions button {
              width: 82px;
            }
            .close-button {
              flex: 0 0 24px;
              width: 24px;
              height: 24px;
              border: 0;
              border-radius: 50%;
              background: transparent;
              color: #555856;
              font-size: 18px;
              line-height: 1;
              padding: 0;
            }
            .close-button:hover {
              background: #f0f0ee;
              filter: none;
            }
            #confirmBtn {
              border-color: #3d3d3b;
              background: #3d3d3b;
              color: #ffffff;
            }
            button:hover { filter: brightness(0.96); }
          </style>
        </head>
        <body>
          <div class="dialog">
            <div class="dialog-header">
              <h3>프로그램 종료</h3>
              <button id="closeBtn" class="close-button" type="button" title="닫기">×</button>
            </div>
            <p>프로그램을 종료하시겠습니까?</p>
            <div class="actions">
              <button id="confirmBtn" type="button">확인</button>
              <button id="cancelBtn" type="button">취소</button>
            </div>
          </div>
          <script>
            const { ipcRenderer } = require("electron");
            document.getElementById("confirmBtn").addEventListener("click", () => ipcRenderer.send("quit-confirm-result", true));
            document.getElementById("cancelBtn").addEventListener("click", () => ipcRenderer.send("quit-confirm-result", false));
            document.getElementById("closeBtn").addEventListener("click", () => ipcRenderer.send("quit-confirm-result", false));
            document.addEventListener("keydown", (event) => {
              if (event.key === "Escape") ipcRenderer.send("quit-confirm-result", false);
            });
          </script>
        </body>
      </html>
    `;

    ipcMain.once("quit-confirm-result", (_event, value) => settle(Boolean(value)));
    quitConfirmWindow.on("closed", () => {
      quitConfirmWindow = null;
      settle(false);
    });
    quitConfirmWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  });
}

app.whenReady().then(async () => {
  app.setAppUserModelId("com.jglim.wimn");
  configureAutoUpdater();
  await ensureDataFile();
  createMainWindow();
  createWidgetWindow();
  setTimeout(() => checkForUpdates(), 3000);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
      createWidgetWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("data:load", readData);
ipcMain.handle("data:save", (_event, data) => writeData(data));
ipcMain.handle("data:export", exportData);
ipcMain.handle("data:import", importData);
ipcMain.handle("update:get-status", getUpdateState);
ipcMain.handle("update:check", checkForUpdates);
ipcMain.handle("update:install", installAvailableUpdate);

ipcMain.handle("window:minimize", () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle("window:maximize", () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle("window:close", () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle("app:quit", () => {
  app.quit();
});

ipcMain.handle("app:confirm-quit", async () => {
  return showQuitConfirmWindow();
});

ipcMain.handle("window:open-main", () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
});

ipcMain.handle("window:open-settings", async () => {
  createSettingsWindow();
});

ipcMain.handle("settings:close", () => {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.close();
  }
});

ipcMain.handle("widget:set-always-on-top", (_event, value) => {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.setAlwaysOnTop(Boolean(value));
  }
});

ipcMain.handle("widget:set-ignore-mouse-events", (_event, value) => {
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.setIgnoreMouseEvents(Boolean(value), { forward: true });
  }
});

ipcMain.handle("widget:get-displays", () => getSerializableDisplays());

ipcMain.handle("widget:apply-settings", (_event, settings) => {
  applyWidgetSettings(settings);
});

ipcMain.handle("widget:get-bounds", () => {
  if (!widgetWindow || widgetWindow.isDestroyed()) return null;
  const bounds = widgetWindow.getBounds();
  const display = screen.getDisplayMatching(bounds);
  return { ...bounds, workArea: display.workArea };
});

ipcMain.handle("widget:move-to-y", (_event, value, metrics = {}) => {
  if (!widgetWindow || widgetWindow.isDestroyed()) return null;

  const bounds = widgetWindow.getBounds();
  const display = screen.getDisplayMatching(bounds);
  const margin = Number.isFinite(metrics.margin) ? metrics.margin : 10;
  const topOffset = Number.isFinite(metrics.topOffset) ? metrics.topOffset : 0;
  const bottomOffset = Number.isFinite(metrics.bottomOffset) ? metrics.bottomOffset : bounds.height;
  const minY = display.workArea.y + margin - topOffset;
  const maxY = Math.max(
    minY,
    display.workArea.y + display.workArea.height - margin - bottomOffset
  );
  const nextY = Math.max(minY, Math.min(maxY, Math.round(Number(value) || bounds.y)));
  widgetWindow.setBounds({ x: bounds.x, y: nextY, width: bounds.width, height: bounds.height });
  return {
    ...widgetWindow.getBounds(),
    minY,
    maxY,
    workArea: display.workArea
  };
});
