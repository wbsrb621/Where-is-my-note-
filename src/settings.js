const defaultSettings = {
  widgetEnabled: true,
  widgetAlwaysOnTop: false,
  widgetNoteHeight: 104,
  widgetPosition: "right",
  widgetDisplayId: null
};

let appData = {
  groups: [],
  notes: [],
  settings: { ...defaultSettings }
};

const els = {
  closeBtn: document.getElementById("settingsWindowCloseBtn"),
  widgetEnabledSetting: document.getElementById("widgetEnabledSetting"),
  widgetAlwaysOnTopSetting: document.getElementById("widgetAlwaysOnTopSetting"),
  widgetNoteHeightSetting: document.getElementById("widgetNoteHeightSetting"),
  widgetNoteHeightValue: document.getElementById("widgetNoteHeightValue"),
  widgetPositionRightSetting: document.getElementById("widgetPositionRightSetting"),
  widgetPositionLeftSetting: document.getElementById("widgetPositionLeftSetting"),
  widgetDisplaySetting: document.getElementById("widgetDisplaySetting"),
  exportDataBtn: document.getElementById("exportDataBtn"),
  importDataBtn: document.getElementById("importDataBtn"),
  dataStatusText: document.getElementById("dataStatusText"),
  appVersionText: document.getElementById("appVersionText"),
  updateAppBtn: document.getElementById("updateAppBtn"),
  updateStatusText: document.getElementById("updateStatusText"),
  importConfirmDialog: document.getElementById("importConfirmDialog"),
  importConfirmCloseBtn: document.getElementById("importConfirmCloseBtn"),
  importConfirmCancelBtn: document.getElementById("importConfirmCancelBtn"),
  importConfirmApplyBtn: document.getElementById("importConfirmApplyBtn")
};

function normalizeSettings(settings = {}) {
  return {
    ...defaultSettings,
    ...settings,
    widgetEnabled: settings.widgetEnabled !== false,
    widgetAlwaysOnTop: Boolean(settings.widgetAlwaysOnTop),
    widgetNoteHeight: Math.max(80, Math.min(220, Number(settings.widgetNoteHeight) || 104)),
    widgetPosition: settings.widgetPosition === "left" ? "left" : "right",
    widgetDisplayId: settings.widgetDisplayId ?? null
  };
}

function renderControls() {
  appData.settings = normalizeSettings(appData.settings);
  els.widgetEnabledSetting.checked = appData.settings.widgetEnabled;
  els.widgetAlwaysOnTopSetting.checked = appData.settings.widgetAlwaysOnTop;
  els.widgetNoteHeightSetting.value = String(appData.settings.widgetNoteHeight);
  els.widgetNoteHeightValue.textContent = `${appData.settings.widgetNoteHeight}px`;
  els.widgetPositionRightSetting.classList.toggle("active", appData.settings.widgetPosition === "right");
  els.widgetPositionLeftSetting.classList.toggle("active", appData.settings.widgetPosition === "left");

  [
    els.widgetAlwaysOnTopSetting,
    els.widgetNoteHeightSetting,
    els.widgetPositionRightSetting,
    els.widgetPositionLeftSetting,
    els.widgetDisplaySetting
  ].forEach((control) => {
    control.disabled = !appData.settings.widgetEnabled;
  });

  const displayValue = appData.settings.widgetDisplayId == null ? "" : String(appData.settings.widgetDisplayId);
  if ([...els.widgetDisplaySetting.options].some((option) => option.value === displayValue)) {
    els.widgetDisplaySetting.value = displayValue;
  }
}

async function renderDisplayOptions() {
  const displays = await window.wmn.getWidgetDisplays();
  els.widgetDisplaySetting.replaceChildren();

  displays.forEach((display, index) => {
    const option = document.createElement("option");
    const { x, y, width, height } = display.bounds;
    option.value = String(display.id);
    option.textContent = `${index + 1}. ${display.label || `디스플레이 ${index + 1}`} (${width}x${height}, ${x}, ${y})`;
    els.widgetDisplaySetting.append(option);
  });

  if (appData.settings.widgetDisplayId == null && displays[0]) {
    appData.settings.widgetDisplayId = displays[0].id;
  }
}

async function saveSettings() {
  appData.settings = normalizeSettings(appData.settings);
  await window.wmn.saveData(appData);
  await window.wmn.applyWidgetSettings(appData.settings);
  renderControls();
}

function setDataStatus(message = "", tone = "default") {
  if (!els.dataStatusText) return;
  els.dataStatusText.textContent = message;
  els.dataStatusText.dataset.tone = tone;
}

function setDataButtonsDisabled(disabled) {
  [els.exportDataBtn, els.importDataBtn].forEach((button) => {
    if (button) button.disabled = disabled;
  });
}

function renderUpdateStatus(status = {}) {
  if (els.appVersionText && status.currentVersion) {
    els.appVersionText.textContent = `ver.${status.currentVersion}`;
  }
  if (els.updateStatusText) {
    els.updateStatusText.textContent = status.message || "업데이트 확인 전입니다.";
  }
  if (els.updateAppBtn) {
    els.updateAppBtn.disabled = !status.canUpdate;
    els.updateAppBtn.textContent = status.status === "downloading"
      ? "다운로드 중"
      : "업데이트";
  }
}

function requestImportConfirmation() {
  return new Promise((resolve) => {
    if (!els.importConfirmDialog) {
      resolve(false);
      return;
    }

    const close = (confirmed) => {
      els.importConfirmDialog.classList.add("hidden");
      els.importConfirmApplyBtn.removeEventListener("click", confirm);
      els.importConfirmCancelBtn.removeEventListener("click", cancel);
      els.importConfirmCloseBtn.removeEventListener("click", cancel);
      els.importConfirmDialog.removeEventListener("mousedown", backdropCancel);
      document.removeEventListener("keydown", keyCancel);
      resolve(confirmed);
    };
    const confirm = () => close(true);
    const cancel = () => close(false);
    const backdropCancel = (event) => {
      if (event.target === els.importConfirmDialog) cancel();
    };
    const keyCancel = (event) => {
      if (event.key === "Escape") cancel();
    };

    els.importConfirmApplyBtn.addEventListener("click", confirm);
    els.importConfirmCancelBtn.addEventListener("click", cancel);
    els.importConfirmCloseBtn.addEventListener("click", cancel);
    els.importConfirmDialog.addEventListener("mousedown", backdropCancel);
    document.addEventListener("keydown", keyCancel);
    els.importConfirmDialog.classList.remove("hidden");
    els.importConfirmApplyBtn.focus();
  });
}

function bindEvents() {
  els.closeBtn.addEventListener("click", () => window.wmn.closeSettings());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") window.wmn.closeSettings();
  });

  els.widgetEnabledSetting.addEventListener("change", async () => {
    appData.settings.widgetEnabled = els.widgetEnabledSetting.checked;
    await saveSettings();
  });

  els.widgetAlwaysOnTopSetting.addEventListener("change", async () => {
    appData.settings.widgetAlwaysOnTop = els.widgetAlwaysOnTopSetting.checked;
    await saveSettings();
  });

  els.widgetNoteHeightSetting.addEventListener("input", () => {
    const nextHeight = Number(els.widgetNoteHeightSetting.value);
    appData.settings.widgetNoteHeight = Number.isFinite(nextHeight) ? nextHeight : 104;
    renderControls();
    window.wmn.applyWidgetSettings(appData.settings);
  });

  els.widgetNoteHeightSetting.addEventListener("change", async () => {
    const nextHeight = Number(els.widgetNoteHeightSetting.value);
    appData.settings.widgetNoteHeight = Number.isFinite(nextHeight) ? nextHeight : 104;
    await saveSettings();
  });

  [els.widgetPositionRightSetting, els.widgetPositionLeftSetting].forEach((button) => {
    button.addEventListener("click", async () => {
      appData.settings.widgetPosition = button.dataset.position === "left" ? "left" : "right";
      await saveSettings();
    });
  });

  els.widgetDisplaySetting.addEventListener("change", async () => {
    const selectedId = Number(els.widgetDisplaySetting.value);
    appData.settings.widgetDisplayId = Number.isFinite(selectedId) ? selectedId : null;
    await saveSettings();
  });

  els.exportDataBtn?.addEventListener("click", async () => {
    setDataButtonsDisabled(true);
    setDataStatus("데이터 저장 중...");
    try {
      const result = await window.wmn.exportData();
      if (result?.canceled) {
        setDataStatus("");
        return;
      }
      setDataStatus("데이터를 저장했습니다.", "success");
    } catch (error) {
      setDataStatus("데이터 저장에 실패했습니다.", "error");
    } finally {
      setDataButtonsDisabled(false);
    }
  });

  els.importDataBtn?.addEventListener("click", async () => {
    const shouldImport = await requestImportConfirmation();
    if (!shouldImport) return;

    setDataButtonsDisabled(true);
    setDataStatus("데이터 불러오는 중...");
    try {
      const result = await window.wmn.importData();
      if (result?.canceled) {
        setDataStatus("");
        return;
      }
      appData = result.data || await window.wmn.loadData();
      appData.settings = normalizeSettings(appData.settings);
      await renderDisplayOptions();
      renderControls();
      setDataStatus("데이터를 불러왔습니다.", "success");
    } catch (error) {
      setDataStatus("데이터 불러오기에 실패했습니다.", "error");
    } finally {
      setDataButtonsDisabled(false);
    }
  });

  els.updateAppBtn?.addEventListener("click", async () => {
    els.updateAppBtn.disabled = true;
    els.updateStatusText.textContent = "업데이트 준비 중...";
    await window.wmn.installUpdate();
  });
}

async function init() {
  appData = await window.wmn.loadData();
  appData.settings = normalizeSettings(appData.settings);
  await renderDisplayOptions();
  renderControls();
  bindEvents();
  renderUpdateStatus(await window.wmn.getUpdateStatus?.());
  window.wmn.onUpdateStatus?.(renderUpdateStatus);
  window.wmn.checkForUpdates?.();
  window.wmn.onDataChanged?.(async (nextData) => {
    appData = nextData;
    appData.settings = normalizeSettings(appData.settings);
    await renderDisplayOptions();
    renderControls();
  });
}

init();
