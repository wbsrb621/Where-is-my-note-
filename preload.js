const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("wmn", {
  loadData: () => ipcRenderer.invoke("data:load"),
  saveData: (data) => ipcRenderer.invoke("data:save", data),
  exportData: () => ipcRenderer.invoke("data:export"),
  importData: () => ipcRenderer.invoke("data:import"),
  getUpdateStatus: () => ipcRenderer.invoke("update:get-status"),
  checkForUpdates: () => ipcRenderer.invoke("update:check"),
  installUpdate: () => ipcRenderer.invoke("update:install"),
  minimize: () => ipcRenderer.invoke("window:minimize"),
  maximize: () => ipcRenderer.invoke("window:maximize"),
  close: () => ipcRenderer.invoke("window:close"),
  quit: () => ipcRenderer.invoke("app:quit"),
  confirmQuit: () => ipcRenderer.invoke("app:confirm-quit"),
  openMain: () => ipcRenderer.invoke("window:open-main"),
  openSettings: () => ipcRenderer.invoke("window:open-settings"),
  closeSettings: () => ipcRenderer.invoke("settings:close"),
  getWidgetBounds: () => ipcRenderer.invoke("widget:get-bounds"),
  getWidgetDisplays: () => ipcRenderer.invoke("widget:get-displays"),
  moveWidgetToY: (y, metrics) => ipcRenderer.invoke("widget:move-to-y", y, metrics),
  setWidgetAlwaysOnTop: (value) => ipcRenderer.invoke("widget:set-always-on-top", value),
  setWidgetIgnoreMouseEvents: (value) => ipcRenderer.invoke("widget:set-ignore-mouse-events", value),
  applyWidgetSettings: (settings) => ipcRenderer.invoke("widget:apply-settings", settings),
  onPinnedNotes: (callback) => {
    ipcRenderer.on("pinned-notes", (_event, notes) => callback(notes));
  },
  onDataChanged: (callback) => {
    ipcRenderer.on("data:changed", (_event, data) => callback(data));
  },
  onWidgetSettings: (callback) => {
    ipcRenderer.on("widget-settings", (_event, settings) => callback(settings));
  },
  onOpenSettings: (callback) => {
    ipcRenderer.on("settings:open", callback);
  },
  onUpdateStatus: (callback) => {
    ipcRenderer.on("update:status", (_event, status) => callback(status));
  }
});
