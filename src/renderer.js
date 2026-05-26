const defaultColorPalette = [
  "#ffffff",
  "#222222",
  "#f1e5d0",
  "#ffd0a6",
  "#ffbd7a",
  "#ffd2c8",
  "#ffc0a8",
  "#ffaaa0",
  "#fff1bd",
  "#d8eee8",
  "#d9ead7",
  "#d7ecff",
  "#bde4fa",
  "#dfc6ff"
];

const importanceColors = ["#b8b8b8", "#9ad86f", "#e8d83d", "#f0a33d", "#ef7734", "#e6453d"];
const untitledMemoTitle = "(제목 없음)";
const defaultSettings = {
  widgetEnabled: true,
  widgetAlwaysOnTop: false,
  widgetNoteHeight: 104,
  widgetPosition: "right",
  widgetDisplayId: null
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

function normalizeColor(color) {
  return String(color || "").trim().toLowerCase();
}

function paletteSettingKey(colorKey) {
  return colorKey === "memoColor" ? "memoColorPalette" : "textColorPalette";
}

function getColorPalette(colorKey) {
  const settingKey = paletteSettingKey(colorKey);
  if (!Array.isArray(appState.settings[settingKey])) {
    appState.settings[settingKey] = Array.isArray(appState.settings.colorPalette)
      ? [...appState.settings.colorPalette]
      : [...defaultColorPalette];
  }
  return appState.settings[settingKey];
}

function setColorPalette(colorKey, colors) {
  const seen = new Set();
  appState.settings[paletteSettingKey(colorKey)] = colors
    .map(normalizeColor)
    .filter((color) => /^#[0-9a-f]{6}$/.test(color))
    .filter((color) => {
      if (seen.has(color)) return false;
      seen.add(color);
      return true;
    });
}

const appState = {
  groups: [],
  notes: [],
  settings: {},
  selectedGroupId: null,
  selectedNoteId: null,
  panelOpen: false,
  panelMode: "create",
  searchKeyword: "",
  sortMode: "created",
  sortDirection: "asc",
  titleSortStep: 0,
  filterMode: "all",
  formDirty: false,
  pendingClose: false,
  inlineEditingNoteId: null,
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(),
  calendarSelectedDate: null,
  collapsedGroupIds: new Set()
};

const els = {
  groupsContainer: document.getElementById("groupsContainer"),
  newGroupBtn: document.getElementById("newGroupBtn"),
  currentViewLabel: document.getElementById("currentViewLabel"),
  cardSizeSlider: document.getElementById("cardSizeSlider"),
  allViewBtn: document.getElementById("allViewBtn"),
  groupViewBtn: document.getElementById("groupViewBtn"),
  calendarViewBtn: document.getElementById("calendarViewBtn"),
  trashViewBtn: document.getElementById("trashViewBtn"),
  createdSortBtn: document.getElementById("createdSortBtn"),
  titleSortBtn: document.getElementById("titleSortBtn"),
  titleSortMark: document.getElementById("titleSortMark"),
  importanceSortBtn: document.getElementById("importanceSortBtn"),
  searchInput: document.getElementById("searchInput"),
  panelTitle: document.getElementById("panelTitle"),
  panelCloseBtn: document.getElementById("panelCloseBtn"),
  panelResizeHandle: document.getElementById("panelResizeHandle"),
  memoForm: document.getElementById("memoForm"),
  groupPicker: document.getElementById("groupPicker"),
  groupPickerButton: document.getElementById("groupPickerButton"),
  groupPickerLabel: document.getElementById("groupPickerLabel"),
  groupPickerMenu: document.getElementById("groupPickerMenu"),
  groupSelect: document.getElementById("groupSelect"),
  importanceControl: document.getElementById("importanceControl"),
  favoriteBtn: document.getElementById("favoriteBtn"),
  startDateInput: document.getElementById("startDateInput"),
  endDateInput: document.getElementById("endDateInput"),
  titleInput: document.getElementById("titleInput"),
  contentInput: document.getElementById("contentInput"),
  textPalette: document.getElementById("textPalette"),
  memoPalette: document.getElementById("memoPalette"),
  submitBtn: document.getElementById("submitBtn"),
  confirmDialog: document.getElementById("confirmDialog"),
  confirmDialogCloseBtn: document.getElementById("confirmDialogCloseBtn"),
  cancelCloseBtn: document.getElementById("cancelCloseBtn"),
  confirmCloseBtn: document.getElementById("confirmCloseBtn"),
  quitDialog: document.getElementById("quitDialog"),
  quitDialogCloseBtn: document.getElementById("quitDialogCloseBtn"),
  closeMainOnlyBtn: document.getElementById("closeMainOnlyBtn"),
  quitAppBtn: document.getElementById("quitAppBtn"),
  deleteGroupDialog: document.getElementById("deleteGroupDialog"),
  deleteGroupDialogCloseBtn: document.getElementById("deleteGroupDialogCloseBtn"),
  cancelDeleteGroupBtn: document.getElementById("cancelDeleteGroupBtn"),
  confirmDeleteGroupBtn: document.getElementById("confirmDeleteGroupBtn"),
  deleteNoteDialog: document.getElementById("deleteNoteDialog"),
  deleteNoteDialogCloseBtn: document.getElementById("deleteNoteDialogCloseBtn"),
  cancelDeleteNoteBtn: document.getElementById("cancelDeleteNoteBtn"),
  confirmDeleteNoteBtn: document.getElementById("confirmDeleteNoteBtn"),
  emptyTrashDialog: document.getElementById("emptyTrashDialog"),
  emptyTrashDialogCloseBtn: document.getElementById("emptyTrashDialogCloseBtn"),
  cancelEmptyTrashBtn: document.getElementById("cancelEmptyTrashBtn"),
  confirmEmptyTrashBtn: document.getElementById("confirmEmptyTrashBtn"),
  emptyTrashNoticeDialog: document.getElementById("emptyTrashNoticeDialog"),
  emptyTrashNoticeCloseBtn: document.getElementById("emptyTrashNoticeCloseBtn"),
  emptyTrashNoticeOkBtn: document.getElementById("emptyTrashNoticeOkBtn"),
  addGroupDialog: document.getElementById("addGroupDialog"),
  addGroupForm: document.getElementById("addGroupForm"),
  addGroupNameInput: document.getElementById("addGroupNameInput"),
  addGroupDialogCloseBtn: document.getElementById("addGroupDialogCloseBtn"),
  cancelAddGroupBtn: document.getElementById("cancelAddGroupBtn"),
  settingsDialog: document.getElementById("settingsDialog"),
  settingsDialogCloseBtn: document.getElementById("settingsDialogCloseBtn"),
  settingsBtn: document.getElementById("settingsBtn"),
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
  importConfirmApplyBtn: document.getElementById("importConfirmApplyBtn"),
  minimizeBtn: document.getElementById("minimizeBtn"),
  maximizeBtn: document.getElementById("maximizeBtn"),
  closeWindowBtn: document.getElementById("closeWindowBtn")
};

Object.assign(els, {
  editMemoPanel: document.getElementById("editMemoPanel"),
  editPanelCloseBtn: document.getElementById("editPanelCloseBtn"),
  editMemoForm: document.getElementById("editMemoForm"),
  editGroupPicker: document.getElementById("editGroupPicker"),
  editGroupPickerButton: document.getElementById("editGroupPickerButton"),
  editGroupPickerLabel: document.getElementById("editGroupPickerLabel"),
  editGroupPickerMenu: document.getElementById("editGroupPickerMenu"),
  editGroupSelect: document.getElementById("editGroupSelect"),
  editImportanceControl: document.getElementById("editImportanceControl"),
  editFavoriteBtn: document.getElementById("editFavoriteBtn"),
  editStartDateInput: document.getElementById("editStartDateInput"),
  editEndDateInput: document.getElementById("editEndDateInput"),
  editTitleInput: document.getElementById("editTitleInput"),
  editContentInput: document.getElementById("editContentInput"),
  contentFormatToolbar: document.getElementById("contentFormatToolbar"),
  editContentFormatToolbar: document.getElementById("editContentFormatToolbar"),
  editTextPalette: document.getElementById("editTextPalette"),
  editMemoPalette: document.getElementById("editMemoPalette")
});

let formState = {
  importance: 0,
  favorite: false,
  textColor: "#333333",
  memoColor: "#ffffff"
};

let editFormState = {
  importance: 0,
  favorite: false,
  textColor: "#333333",
  memoColor: "#ffffff"
};

let lastSyncedEditNoteId = null;
let editFormUserTouched = false;
let pendingDeleteGroupId = null;
let pendingDeleteNoteId = null;
let pendingPermanentDeleteNote = false;
let pendingCreateGroupId = null;
let pendingCreateGroupName = null;
let inlineSelectionRange = null;
let memoContextMenu = null;
let contextMenuContent = null;
let createPanelToken = 0;

const panelResize = {
  minPanelWidth: 370,
  defaultPanelWidth: 400,
  minListWidth: 360,
  active: false
};

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatCreatedTime(value) {
  const created = new Date(value);
  if (Number.isNaN(created.getTime())) return "";

  const now = new Date();
  const diffMs = now - created;
  const hourMs = 60 * 60 * 1000;
  const dayMs = 24 * hourMs;

  if (diffMs >= 0 && diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs);
    if (hours >= 1) return `${hours}시간 전`;

    const minutes = Math.floor(diffMs / (60 * 1000));
    if (minutes >= 1) return `${minutes}분 전`;

    return "방금 전";
  }

  const date = created.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const time = created.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  return `${date} ${time}`;
}

function formatNotePeriod(note) {
  const startDate = note?.startDate || "";
  const endDate = note?.endDate || "";
  if (!startDate && !endDate) return "";
  if (startDate && endDate) return `기간 : ${startDate} ~ ${endDate}`;
  return `기간 : ${startDate || endDate}`;
}

function plainTextToHtml(value) {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML.replace(/\n/g, "<br>");
}

function sanitizeMemoHtml(value) {
  const template = document.createElement("template");
  template.innerHTML = value || "";
  const allowedTags = new Set(["B", "STRONG", "I", "EM", "U", "S", "STRIKE", "UL", "OL", "LI", "BR", "DIV", "P", "SPAN", "IMG"]);
  const allowedStyles = new Set(["font-weight", "font-style", "text-decoration", "font-size"]);

  [...template.content.querySelectorAll("*")].forEach((node) => {
    if (!allowedTags.has(node.tagName)) {
      node.replaceWith(...node.childNodes);
      return;
    }

    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (node.tagName === "IMG" && name === "src" && attr.value.startsWith("data:image/")) return;
      if (node.tagName === "IMG" && name === "alt") return;
      if (name === "style") {
        const kept = attr.value
          .split(";")
          .map((item) => item.trim())
          .filter((item) => allowedStyles.has(item.split(":")[0]?.trim().toLowerCase()))
          .join("; ");
        if (kept) {
          node.setAttribute("style", kept);
        } else {
          node.removeAttribute("style");
        }
        return;
      }
      node.removeAttribute(attr.name);
    });
  });

  return template.innerHTML;
}

function getEditorText(editor) {
  return (editor?.textContent || "").trim();
}

function getEditorHtml(editor) {
  return normalizeEditorHtml(editor?.innerHTML || "", {
    preserveLineBreaks: (editor?.textContent || "").includes("\n")
  });
}

function normalizeEditorHtml(html = "", options = {}) {
  const preserveLineBreaks = Boolean(options.preserveLineBreaks);
  let normalized = sanitizeMemoHtml(html)
    .replace(/<\/div>\s*<div>/gi, preserveLineBreaks ? "<br>" : "")
    .replace(/<\/p>\s*<p>/gi, preserveLineBreaks ? "<br>" : "")
    .replace(/<div>/gi, "")
    .replace(/<\/div>/gi, preserveLineBreaks ? "<br>" : "")
    .replace(/<p>/gi, "")
    .replace(/<\/p>/gi, preserveLineBreaks ? "<br>" : "");

  if (!preserveLineBreaks) {
    normalized = normalized.replace(/<br\s*\/?>/gi, "");
  }
  return normalized;
}

function setEditorContent(editor, text = "", html = "") {
  if (!editor) return;
  editor.innerHTML = html
    ? normalizeEditorHtml(html, { preserveLineBreaks: String(text || "").includes("\n") })
    : plainTextToHtml(text || "");
}

function getPlainTextFromHtml(html = "") {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = sanitizeMemoHtml(html);
  return wrapper.textContent.trim();
}

function normalizeStoredNoteContent() {
  let changed = false;

  appState.notes.forEach((note) => {
    if (!note.contentHtml) return;

    const normalized = normalizeEditorHtml(note.contentHtml, {
      preserveLineBreaks: String(note.content || "").includes("\n")
    });

    if (normalized !== note.contentHtml) {
      note.contentHtml = normalized;
      note.content = getPlainTextFromHtml(normalized);
      changed = true;
    }
  });

  return changed;
}

function syncCollapsedGroupsFromSettings() {
  const collapsibleIds = new Set(["favorites", ...appState.groups.map((group) => group.id)]);
  appState.collapsedGroupIds = new Set((Array.isArray(appState.settings.collapsedGroupIds)
    ? appState.settings.collapsedGroupIds
    : []).filter((groupId) => collapsibleIds.has(groupId)));
}

function syncCollapsedGroupsToSettings() {
  appState.settings.collapsedGroupIds = [...appState.collapsedGroupIds];
}

async function saveState() {
  appState.settings = normalizeSettings(appState.settings);
  syncCollapsedGroupsToSettings();
  await window.wmn.saveData({
    groups: appState.groups,
    notes: appState.notes,
    settings: appState.settings
  });
}

function render() {
  renderGroupSelect();
  renderGroups();
  renderSortButtons();
  renderViewToggle();
  renderSettingsControls();
}

function renderSettingsControls() {
  appState.settings = normalizeSettings(appState.settings);

  if (els.widgetAlwaysOnTopSetting) {
    els.widgetAlwaysOnTopSetting.checked = appState.settings.widgetAlwaysOnTop;
  }

  if (els.widgetEnabledSetting) {
    els.widgetEnabledSetting.checked = appState.settings.widgetEnabled;
  }

  if (els.widgetNoteHeightSetting) {
    els.widgetNoteHeightSetting.value = String(appState.settings.widgetNoteHeight);
  }
  if (els.widgetNoteHeightValue) {
    els.widgetNoteHeightValue.textContent = `${appState.settings.widgetNoteHeight}px`;
  }

  els.widgetPositionRightSetting?.classList.toggle("active", appState.settings.widgetPosition === "right");
  els.widgetPositionLeftSetting?.classList.toggle("active", appState.settings.widgetPosition === "left");

  [
    els.widgetAlwaysOnTopSetting,
    els.widgetNoteHeightSetting,
    els.widgetPositionRightSetting,
    els.widgetPositionLeftSetting,
    els.widgetDisplaySetting
  ].forEach((control) => {
    if (control) control.disabled = !appState.settings.widgetEnabled;
  });

  if (els.widgetDisplaySetting) {
    const value = appState.settings.widgetDisplayId == null ? "" : String(appState.settings.widgetDisplayId);
    if ([...els.widgetDisplaySetting.options].some((option) => option.value === value)) {
      els.widgetDisplaySetting.value = value;
    }
  }
}

async function renderWidgetDisplayOptions() {
  if (!els.widgetDisplaySetting || !window.wmn.getWidgetDisplays) return;

  const displays = await window.wmn.getWidgetDisplays();
  els.widgetDisplaySetting.replaceChildren();
  displays.forEach((display, index) => {
    const option = document.createElement("option");
    option.value = String(display.id);
    const { x, y, width, height } = display.bounds;
    option.textContent = `${index + 1}. ${display.label || `디스플레이 ${index + 1}`} (${width}x${height}, ${x}, ${y})`;
    els.widgetDisplaySetting.append(option);
  });

  const selectedId = appState.settings.widgetDisplayId == null
    ? displays[0]?.id
    : appState.settings.widgetDisplayId;
  if (selectedId != null) {
    appState.settings.widgetDisplayId = selectedId;
    els.widgetDisplaySetting.value = String(selectedId);
  }
}

async function saveSettingsAndApplyWidget() {
  appState.settings = normalizeSettings(appState.settings);
  await saveState();
  await window.wmn.applyWidgetSettings?.(appState.settings);
  renderSettingsControls();
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

function requestImportConfirmation() {
  return new Promise((resolve) => {
    if (!els.importConfirmDialog) {
      resolve(false);
      return;
    }

    const close = (confirmed) => {
      els.importConfirmDialog.classList.add("hidden");
      els.importConfirmApplyBtn?.removeEventListener("click", confirm);
      els.importConfirmCancelBtn?.removeEventListener("click", cancel);
      els.importConfirmCloseBtn?.removeEventListener("click", cancel);
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

    els.importConfirmApplyBtn?.addEventListener("click", confirm);
    els.importConfirmCancelBtn?.addEventListener("click", cancel);
    els.importConfirmCloseBtn?.addEventListener("click", cancel);
    els.importConfirmDialog.addEventListener("mousedown", backdropCancel);
    document.addEventListener("keydown", keyCancel);
    els.importConfirmDialog.classList.remove("hidden");
    els.importConfirmApplyBtn?.focus();
  });
}

async function exportDataFromSettings() {
  setDataButtonsDisabled(true);
  setDataStatus("데이터 저장 중...");
  try {
    const result = await window.wmn.exportData?.();
    if (result?.canceled) {
      setDataStatus("");
      return;
    }
    setDataStatus("데이터를 저장했습니다.", "success");
  } catch {
    setDataStatus("데이터 저장에 실패했습니다.", "error");
  } finally {
    setDataButtonsDisabled(false);
  }
}

async function importDataFromSettings() {
  const shouldImport = await requestImportConfirmation();
  if (!shouldImport) return;

  setDataButtonsDisabled(true);
  setDataStatus("데이터 불러오는 중...");
  try {
    const result = await window.wmn.importData?.();
    if (result?.canceled) {
      setDataStatus("");
      return;
    }
    const nextData = result.data || await window.wmn.loadData();
    appState.groups = nextData.groups || [];
    appState.notes = nextData.notes || [];
    appState.settings = normalizeSettings(nextData.settings);
    normalizeStoredNoteContent();
    syncCollapsedGroupsFromSettings();
    await renderWidgetDisplayOptions();
    render();
    setDataStatus("데이터를 불러왔습니다.", "success");
  } catch {
    setDataStatus("데이터 불러오기에 실패했습니다.", "error");
  } finally {
    setDataButtonsDisabled(false);
  }
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

async function loadUpdateStatus() {
  const status = await window.wmn.getUpdateStatus?.();
  renderUpdateStatus(status);
}

async function installUpdateFromSettings() {
  if (els.updateAppBtn) els.updateAppBtn.disabled = true;
  if (els.updateStatusText) els.updateStatusText.textContent = "업데이트 준비 중...";
  await window.wmn.installUpdate?.();
}

function renderGroupSelect(preferredCreateGroupId = null) {
  els.groupSelect.innerHTML = "";
  els.editGroupSelect.innerHTML = "";
  els.groupPickerMenu.innerHTML = "";
  els.editGroupPickerMenu.innerHTML = "";

  const selectedCreateGroupId = getCreateGroupId(preferredCreateGroupId || pendingCreateGroupId || appState.selectedGroupId, pendingCreateGroupName);
  appState.groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = group.name;
    option.selected = group.id === selectedCreateGroupId;
    els.groupSelect.append(option);
  });

  renderGroupPicker(selectedCreateGroupId);

  appState.groups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = group.name;
    els.editGroupSelect.append(option);
  });
  renderEditGroupPicker(els.editGroupSelect.value || appState.selectedGroupId);

  if (document.body.classList.contains("create-panel-open")) {
    setCreateGroupSelection(selectedCreateGroupId);
  }
}

function renderGroupPicker(selectedGroupId = null) {
  const effectiveSelectedGroupId = document.body.classList.contains("create-panel-open") && pendingCreateGroupId
    ? pendingCreateGroupId
    : selectedGroupId;
  const currentGroup = appState.groups.find((group) => group.id === effectiveSelectedGroupId) || appState.groups[0];
  els.groupPickerLabel.textContent = currentGroup?.name || "";
  els.groupPickerButton.dataset.groupId = currentGroup?.id || "";
  els.groupPickerButton.querySelector(".custom-select-arrow").textContent = els.groupPicker.classList.contains("open") ? "▴" : "▾";
  els.groupPickerMenu.innerHTML = "";

  appState.groups.forEach((group) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "custom-select-option";
    item.textContent = group.name;
    item.dataset.groupId = group.id;
    item.classList.toggle("active", group.id === currentGroup?.id);
    item.addEventListener("click", () => {
      setCreateGroupSelection(group.id, group.name);
      closeGroupPicker();
      appState.formDirty = true;
    });
    els.groupPickerMenu.append(item);
  });
}

function forceCreateGroupSelection(group) {
  if (!group) return;

  pendingCreateGroupId = group.id;
  pendingCreateGroupName = group.name;
  appState.selectedGroupId = group.id;

  let optionIndex = [...els.groupSelect.options].findIndex((option) => option.value === group.id);
  if (optionIndex < 0) {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = group.name;
    els.groupSelect.prepend(option);
    optionIndex = 0;
  }

  if (optionIndex >= 0) {
    els.groupSelect.selectedIndex = optionIndex;
  }
  els.groupSelect.value = group.id;
  els.groupSelect.dispatchEvent(new Event("change", { bubbles: true }));
  els.groupPickerLabel.textContent = group.name;
  els.groupPickerButton.dataset.groupId = group.id;

  [...els.groupPickerMenu.querySelectorAll(".custom-select-option")].forEach((item) => {
    item.classList.toggle("active", item.dataset.groupId === group.id);
  });
}

function openGroupPicker() {
  els.groupPicker.classList.add("open");
  els.groupPickerMenu.classList.remove("hidden");
  els.groupPickerButton.querySelector(".custom-select-arrow").textContent = "▴";
}

function closeGroupPicker() {
  els.groupPicker.classList.remove("open");
  els.groupPickerMenu.classList.add("hidden");
  els.groupPickerButton.querySelector(".custom-select-arrow").textContent = "▾";
}

function toggleGroupPicker() {
  if (els.groupPicker.classList.contains("open")) {
    closeGroupPicker();
  } else {
    openGroupPicker();
  }
}

function setEditGroupSelection(groupId = null) {
  const nextGroupId = appState.groups.some((group) => group.id === groupId)
    ? groupId
    : appState.groups[0]?.id || "";
  els.editGroupSelect.value = nextGroupId;
  renderEditGroupPicker(nextGroupId);
  return nextGroupId;
}

function renderEditGroupPicker(selectedGroupId = null) {
  const currentGroup = appState.groups.find((group) => group.id === selectedGroupId)
    || appState.groups.find((group) => group.id === els.editGroupSelect.value)
    || appState.groups[0];
  els.editGroupPickerLabel.textContent = currentGroup?.name || "";
  els.editGroupPickerButton.dataset.groupId = currentGroup?.id || "";
  els.editGroupPickerButton.querySelector(".custom-select-arrow").textContent = els.editGroupPicker.classList.contains("open") ? "▴" : "▾";
  els.editGroupPickerMenu.innerHTML = "";

  appState.groups.forEach((group) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "custom-select-option";
    item.textContent = group.name;
    item.dataset.groupId = group.id;
    item.classList.toggle("active", group.id === currentGroup?.id);
    item.addEventListener("click", () => {
      setEditGroupSelection(group.id);
      closeEditGroupPicker();
      editFormUserTouched = true;
      appState.formDirty = true;
    });
    els.editGroupPickerMenu.append(item);
  });
}

function openEditGroupPicker() {
  els.editGroupPicker.classList.add("open");
  els.editGroupPickerMenu.classList.remove("hidden");
  els.editGroupPickerButton.querySelector(".custom-select-arrow").textContent = "▴";
}

function closeEditGroupPicker() {
  els.editGroupPicker.classList.remove("open");
  els.editGroupPickerMenu.classList.add("hidden");
  els.editGroupPickerButton.querySelector(".custom-select-arrow").textContent = "▾";
}

function toggleEditGroupPicker() {
  if (els.editGroupPicker.classList.contains("open")) {
    closeEditGroupPicker();
  } else {
    openEditGroupPicker();
  }
}

function isCollapsibleGroup(group) {
  return group.id === "favorites" || appState.groups.some((item) => item.id === group.id);
}

function visibleNotesForGroup(group) {
  const keyword = appState.searchKeyword.trim().toLowerCase();
  let notes = appState.notes.filter((note) => {
    if (group.id === "trash") return Boolean(note.deletedAt);
    if (note.deletedAt) return false;
    if (group.id === "favorites") return note.favorite;
    if (group.id === "all") return true;
    return note.groupId === group.id;
  });

  if (keyword) {
    notes = notes.filter((note) => {
      const noteGroup = appState.groups.find((item) => item.id === note.groupId);
      return [note.title, note.content, group.name, noteGroup?.name].some((value) => String(value || "").toLowerCase().includes(keyword));
    });
  }

  return notes.sort((a, b) => {
    if (appState.sortMode === "title") {
      const titleSteps = [
        { locale: "ko", direction: "asc" },
        { locale: "ko", direction: "desc" },
        { locale: "en", direction: "asc" },
        { locale: "en", direction: "desc" }
      ];
      const step = titleSteps[appState.titleSortStep] || titleSteps[0];
      const result = String(a.title || "").localeCompare(String(b.title || ""), step.locale, {
        numeric: true,
        sensitivity: "base"
      });
      return step.direction === "asc" ? result : -result;
    }

    if (appState.sortMode === "importance") {
      const result = (a.importance || 0) - (b.importance || 0);
      return appState.sortDirection === "asc" ? result : -result;
    }

    const result = new Date(a.createdAt || a.updatedAt || 0) - new Date(b.createdAt || b.updatedAt || 0);
    return appState.sortDirection === "asc" ? result : -result;
  });
}

function getLocalDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getNoteCalendarDateKeys(note) {
  const hasPeriod = note.startDate || note.endDate;
  if (!hasPeriod) {
    const fallbackKey = getLocalDateKey(note.createdAt || note.updatedAt);
    return fallbackKey ? [fallbackKey] : [];
  }

  const startKey = note.startDate || note.endDate;
  const endKey = note.endDate || note.startDate;
  const startDate = new Date(`${startKey}T00:00:00`);
  const endDate = new Date(`${endKey}T00:00:00`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return [];

  const from = startDate <= endDate ? startDate : endDate;
  const to = startDate <= endDate ? endDate : startDate;
  const keys = [];
  for (const date = new Date(from); date <= to; date.setDate(date.getDate() + 1)) {
    keys.push(getLocalDateKey(date));
  }
  return keys;
}

function getChineseCalendarParts(date) {
  const parts = new Intl.DateTimeFormat("en-US-u-ca-chinese", {
    month: "numeric",
    day: "numeric"
  }).formatToParts(date);
  const relatedYear = new Intl.DateTimeFormat("en-US-u-ca-chinese", {
    relatedYear: "numeric"
  }).formatToParts(date).find((part) => part.type === "relatedYear")?.value;

  return {
    relatedYear: Number(relatedYear),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value)
  };
}

function getBaseKoreanHolidayName(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const fixedHolidays = new Map([
    ["1-1", "신정"],
    ["3-1", "삼일절"],
    ["5-5", "어린이날"],
    ["6-6", "현충일"],
    ["8-15", "광복절"],
    ["10-3", "개천절"],
    ["10-9", "한글날"],
    ["12-25", "성탄절"]
  ]);
  const fixedName = fixedHolidays.get(`${month}-${day}`);
  if (fixedName) return fixedName;

  const lunar = getChineseCalendarParts(date);
  if (lunar.month === 1 && [1, 2].includes(lunar.day)) return "설날";
  if (lunar.month === 12 && lunar.day >= 29) {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    const nextLunar = getChineseCalendarParts(nextDay);
    if (nextLunar.month === 1 && nextLunar.day === 1) return "설날";
  }
  if (lunar.month === 4 && lunar.day === 8) return "부처님오신날";
  if (lunar.month === 8 && [14, 15, 16].includes(lunar.day)) return "추석";

  return "";
}

function getKoreanHolidayMap(year) {
  const holidays = new Map();
  const substituteTargets = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);

  for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const name = getBaseKoreanHolidayName(date);
    if (!name) continue;
    const key = getLocalDateKey(date);
    holidays.set(key, name);
    if (["삼일절", "어린이날", "광복절", "개천절", "한글날", "부처님오신날", "성탄절"].includes(name)
      || (["설날", "추석"].includes(name) && date.getDay() === 0)) {
      if (date.getDay() === 0 || date.getDay() === 6) {
        substituteTargets.push({
          name,
          date: new Date(date)
        });
      }
    }
  }

  substituteTargets.forEach(({ name, date }) => {
    const substitute = new Date(date);
    substitute.setDate(substitute.getDate() + 1);
    while (substitute <= end) {
      const key = getLocalDateKey(substitute);
      const day = substitute.getDay();
      if (day !== 0 && day !== 6 && !holidays.has(key)) {
        holidays.set(key, `${name} 대체공휴일`);
        break;
      }
      substitute.setDate(substitute.getDate() + 1);
    }
  });

  return holidays;
}

function getCalendarNotes() {
  const keyword = appState.searchKeyword.trim().toLowerCase();
  return appState.notes.filter((note) => {
    if (note.deletedAt) return false;
    if (!keyword) return true;
    const noteGroup = appState.groups.find((item) => item.id === note.groupId);
    return [note.title, note.content, noteGroup?.name].some((value) => String(value || "").toLowerCase().includes(keyword));
  });
}

function renderCalendarView() {
  const todayKey = getLocalDateKey();
  if (!appState.calendarSelectedDate) appState.calendarSelectedDate = todayKey;
  const searching = Boolean(appState.searchKeyword.trim());

  const monthStart = new Date(appState.calendarYear, appState.calendarMonth, 1);
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(1 - monthStart.getDay());
  const holidayMap = new Map([
    ...getKoreanHolidayMap(appState.calendarYear - 1),
    ...getKoreanHolidayMap(appState.calendarYear),
    ...getKoreanHolidayMap(appState.calendarYear + 1)
  ]);

  const notesByDate = new Map();
  getCalendarNotes().forEach((note) => {
    getNoteCalendarDateKeys(note).forEach((dateKey) => {
      if (!dateKey) return;
      if (!notesByDate.has(dateKey)) notesByDate.set(dateKey, []);
      notesByDate.get(dateKey).push(note);
    });
  });

  const wrapper = document.createElement("section");
  wrapper.className = "calendar-view";

  const header = document.createElement("div");
  header.className = "calendar-header";

  const titleWrap = document.createElement("div");
  titleWrap.className = "calendar-title-wrap";

  const title = document.createElement("button");
  title.type = "button";
  title.className = "calendar-title-button";
  title.textContent = monthStart.toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
  title.addEventListener("click", () => {
    monthPicker.classList.toggle("hidden");
  });

  const prev = actionButton("‹", "이전 달", () => {
    const next = new Date(appState.calendarYear, appState.calendarMonth - 1, 1);
    appState.calendarYear = next.getFullYear();
    appState.calendarMonth = next.getMonth();
    appState.calendarSelectedDate = getLocalDateKey(next);
    render();
  });
  const today = actionButton("오늘", "오늘 날짜 보기", () => {
    const now = new Date();
    appState.calendarYear = now.getFullYear();
    appState.calendarMonth = now.getMonth();
    appState.calendarSelectedDate = todayKey;
    render();
  });
  today.className = "calendar-today-button";
  const next = actionButton("›", "다음 달", () => {
    const nextMonth = new Date(appState.calendarYear, appState.calendarMonth + 1, 1);
    appState.calendarYear = nextMonth.getFullYear();
    appState.calendarMonth = nextMonth.getMonth();
    appState.calendarSelectedDate = getLocalDateKey(nextMonth);
    render();
  });
  titleWrap.append(prev, title, next, today);

  const monthPicker = document.createElement("div");
  monthPicker.className = "calendar-month-picker hidden";
  const yearSelect = document.createElement("select");
  const currentYear = new Date().getFullYear();
  for (let year = currentYear - 10; year <= currentYear + 10; year += 1) {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = `${year}년`;
    option.selected = year === appState.calendarYear;
    yearSelect.append(option);
  }
  const monthSelect = document.createElement("select");
  for (let month = 0; month < 12; month += 1) {
    const option = document.createElement("option");
    option.value = String(month);
    option.textContent = `${month + 1}월`;
    option.selected = month === appState.calendarMonth;
    monthSelect.append(option);
  }
  const applyMonth = () => {
    appState.calendarYear = Number(yearSelect.value);
    appState.calendarMonth = Number(monthSelect.value);
    appState.calendarSelectedDate = getLocalDateKey(new Date(appState.calendarYear, appState.calendarMonth, 1));
    render();
  };
  yearSelect.addEventListener("change", applyMonth);
  monthSelect.addEventListener("change", applyMonth);
  monthPicker.append(yearSelect, monthSelect);
  titleWrap.append(monthPicker);

  const addCalendarMemo = actionButton("+", "새 메모 추가", () => {
    const targetDate = appState.calendarSelectedDate || todayKey;
    openCreatePanel(appState.groups[0]?.id || null);
    requestAnimationFrame(() => {
      els.startDateInput.value = targetDate;
      els.endDateInput.value = targetDate;
      appState.formDirty = true;
    });
  });
  addCalendarMemo.className = "calendar-add-button";

  header.append(titleWrap, addCalendarMemo);

  const grid = document.createElement("div");
  grid.className = "calendar-grid";
  ["일", "월", "화", "수", "목", "금", "토"].forEach((day) => {
    const item = document.createElement("div");
    item.className = "calendar-weekday";
    item.textContent = day;
    grid.append(item);
  });

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    const dateKey = getLocalDateKey(date);
    const notes = notesByDate.get(dateKey) || [];

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "calendar-cell";
    cell.classList.toggle("outside-month", date.getMonth() !== appState.calendarMonth);
    cell.classList.toggle("sunday", date.getDay() === 0);
    cell.classList.toggle("saturday", date.getDay() === 6);
    cell.classList.toggle("holiday", holidayMap.has(dateKey));
    cell.classList.toggle("today", dateKey === todayKey);
    cell.classList.toggle("selected", dateKey === appState.calendarSelectedDate);
    cell.classList.toggle("has-notes", notes.length > 0);
    cell.classList.toggle("search-match", searching && notes.length > 0);
    cell.addEventListener("click", () => {
      appState.calendarSelectedDate = dateKey;
      appState.calendarYear = date.getFullYear();
      appState.calendarMonth = date.getMonth();
      render();
    });

    const dateNumber = document.createElement("span");
    dateNumber.className = "calendar-date-number";
    dateNumber.textContent = String(date.getDate());
    cell.append(dateNumber);

    if (notes.length > 0) {
      const count = document.createElement("span");
      count.className = "calendar-note-count";
      const icon = document.createElement("span");
      icon.className = "calendar-note-count-icon";
      const number = document.createElement("span");
      number.textContent = String(notes.length);
      count.append(icon, number);
      cell.append(count);
    }

    grid.append(cell);
  }

  const selectedNotes = [...(notesByDate.get(appState.calendarSelectedDate) || [])].sort((a, b) => {
    return new Date(a.createdAt || a.updatedAt || 0) - new Date(b.createdAt || b.updatedAt || 0);
  });
  const searchDateEntries = [...notesByDate.entries()]
    .filter(([, notes]) => notes.length > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  const selected = document.createElement("section");
  selected.className = "calendar-selected-notes";

  const selectedHeader = document.createElement("div");
  selectedHeader.className = "calendar-selected-header";
  const selectedTitle = document.createElement("h3");
  selectedTitle.textContent = searching ? "검색된 메모" : `${appState.calendarSelectedDate || todayKey} 메모`;
  const selectedCount = document.createElement("span");
  selectedCount.textContent = searching
    ? `${searchDateEntries.reduce((sum, [, notes]) => sum + notes.length, 0)}개`
    : `${selectedNotes.length}개`;
  selectedHeader.append(selectedTitle, selectedCount);

  const noteList = document.createElement("div");
  noteList.className = searching ? "calendar-search-results" : "calendar-note-list";
  if (searching && searchDateEntries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "calendar-empty";
    empty.textContent = "검색된 메모가 없습니다.";
    noteList.append(empty);
  } else if (searching) {
    searchDateEntries.forEach(([dateKey, notes]) => {
      const group = document.createElement("section");
      group.className = "calendar-date-result";
      const title = document.createElement("h4");
      title.textContent = `${dateKey} (${notes.length}개)`;
      const cards = document.createElement("div");
      cards.className = "calendar-note-list";
      notes
        .sort((a, b) => new Date(a.createdAt || a.updatedAt || 0) - new Date(b.createdAt || b.updatedAt || 0))
        .forEach((note) => cards.append(createNoteCard(note)));
      group.append(title, cards);
      noteList.append(group);
    });
  } else if (selectedNotes.length === 0) {
    const empty = document.createElement("p");
    empty.className = "calendar-empty";
    empty.textContent = "이 날짜에 등록된 메모가 없습니다.";
    noteList.append(empty);
  } else {
    selectedNotes.forEach((note) => noteList.append(createNoteCard(note)));
  }

  selected.append(selectedHeader, noteList);
  wrapper.append(header, grid, selected);
  els.groupsContainer.append(wrapper);
}

function renderGroups() {
  els.groupsContainer.innerHTML = "";
  const viewMode = ["all", "trash", "calendar"].includes(appState.settings.viewMode) ? appState.settings.viewMode : "group";
  const searching = Boolean(appState.searchKeyword.trim());

  if (viewMode === "calendar") {
    renderCalendarView();
    return;
  }

  const appendGroupBlock = (group) => {
    const notes = visibleNotesForGroup(group);
    if (searching && notes.length === 0) return;
    els.groupsContainer.append(createGroupBlock(group, notes));
  };

  if (viewMode === "trash") {
    appendGroupBlock({
      id: "trash",
      name: "휴지통",
      readonly: true,
      trash: true
    });
    return;
  }

  const favoriteGroup = {
    id: "favorites",
    name: "즐겨찾기",
    readonly: true,
    pinned: Boolean(appState.settings.favoriteGroupPinned)
  };

  appendGroupBlock(favoriteGroup);
  if (viewMode === "all") {
    appendGroupBlock({
      id: "all",
      name: "전체보기",
      allView: true,
      defaultGroupId: appState.groups[0]?.id || null
    });
    return;
  }

  appState.groups.forEach((group) => {
    appendGroupBlock(group);
  });
}

function createGroupBlock(group, notes = visibleNotesForGroup(group)) {
  const block = document.createElement("section");
  block.className = "group-block";
  block.dataset.groupId = group.id || "";
  block.dataset.groupName = group.name || "";
  block.dataset.groupIndex = String(appState.groups.findIndex((item) => item.id === group.id));
  block.classList.toggle("readonly-group", Boolean(group.readonly));
  block.classList.toggle("favorite-group", group.id === "favorites");
  block.classList.toggle("is-pinned", group.id === "favorites" && Boolean(group.pinned));
  const collapsible = isCollapsibleGroup(group);
  const collapsed = collapsible && appState.collapsedGroupIds.has(group.id) && !appState.searchKeyword.trim();
  block.classList.toggle("is-collapsed", collapsed);

  const titleRow = document.createElement("div");
  titleRow.className = "group-title-row";

  const left = document.createElement("div");
  left.className = "group-title-left";

  const title = document.createElement("h2");
  title.textContent = group.name;
  if (collapsible) {
    title.title = collapsed ? "그룹 펼치기" : "그룹 접기";
    title.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleGroupCollapsed(group.id);
    });
  }

  left.append(title);

  if (!group.readonly) {
    const editButton = actionButton("✎", "그룹명 수정", (event) => {
      event.stopPropagation();
      startGroupRename(group.id, title);
    });
    editButton.className = "group-edit-button";
    left.append(editButton);
  }

  const controls = document.createElement("div");
  controls.className = "group-order-controls";

  if (group.id === "favorites") {
    const pinButton = actionButton("", "즐겨찾기 그룹 상단 고정", async (event) => {
      event.stopPropagation();
      appState.settings.favoriteGroupPinned = !appState.settings.favoriteGroupPinned;
      await saveState();
      render();
    });
    pinButton.className = "group-icon-button group-pin-button";
    pinButton.classList.toggle("active", Boolean(group.pinned));
    setPinButtonIcon(pinButton, group.pinned);
    controls.append(pinButton);
  } else if (group.id === "trash") {
    const emptyButton = actionButton("휴지통 비우기", "휴지통 비우기", async (event) => {
      event.stopPropagation();
      openEmptyTrashDialog();
    });
    emptyButton.className = "empty-trash-button trash-text-button";
    controls.append(emptyButton);
  } else if (!group.readonly) {
    const index = appState.groups.findIndex((item) => item.id === group.id);
    const upButton = actionButton("↑", "그룹 위로 이동", (event) => {
      event.stopPropagation();
      moveGroup(group.id, -1);
    });
    const downButton = actionButton("↓", "그룹 아래로 이동", (event) => {
      event.stopPropagation();
      moveGroup(group.id, 1);
    });

    upButton.className = "group-icon-button";
    downButton.className = "group-icon-button";
    upButton.disabled = index <= 0;
    downButton.disabled = index === appState.groups.length - 1;
    const deleteButton = actionButton("×", "그룹 삭제", (event) => {
      event.stopPropagation();
      openDeleteGroupDialog(group.id);
    });
    deleteButton.className = "group-icon-button group-delete-button";
    controls.append(upButton, downButton, deleteButton);
  }

  const grid = document.createElement("div");
  grid.className = "cards-grid";

  notes.forEach((note) => grid.append(createNoteCard(note)));
  if (!group.readonly) {
    const addTargetGroupId = group.defaultGroupId || group.id;
    const addTargetGroup = appState.groups.find((item) => item.id === addTargetGroupId) || group;
    grid.append(createAddCard(addTargetGroup, appState.groups.findIndex((item) => item.id === addTargetGroup.id)));
  }

  titleRow.append(left, controls);
  block.append(titleRow);
  if (!collapsed) {
    block.append(grid);
  }
  return block;
}

async function toggleGroupCollapsed(groupId) {
  if (appState.collapsedGroupIds.has(groupId)) {
    appState.collapsedGroupIds.delete(groupId);
  } else {
    appState.collapsedGroupIds.add(groupId);
  }
  await saveState();
  renderGroups();
}

function startGroupRename(groupId, title) {
  const group = appState.groups.find((item) => item.id === groupId);
  if (!group) return;

  const input = document.createElement("input");
  input.className = "group-name-input";
  input.value = group.name;
  input.maxLength = 40;

  title.replaceWith(input);
  input.focus();
  input.select();

  let saved = false;
  const save = async () => {
    if (saved) return;
    saved = true;

    const nextName = input.value.trim();
    if (nextName) {
      group.name = nextName;
      await saveState();
    }

    render();
  };

  input.addEventListener("click", (event) => event.stopPropagation());
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      save();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      saved = true;
      render();
    }
  });
  input.addEventListener("blur", save);
}

async function moveGroup(groupId, direction) {
  const index = appState.groups.findIndex((group) => group.id === groupId);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= appState.groups.length) return;

  const [group] = appState.groups.splice(index, 1);
  appState.groups.splice(nextIndex, 0, group);
  await saveState();
  render();
}

function openDeleteGroupDialog(groupId) {
  pendingDeleteGroupId = groupId;
  els.deleteGroupDialog.classList.remove("hidden");
}

function closeDeleteGroupDialog() {
  pendingDeleteGroupId = null;
  els.deleteGroupDialog.classList.add("hidden");
}

async function confirmDeleteGroup() {
  const groupId = pendingDeleteGroupId;
  if (!groupId) return;
  const now = new Date().toISOString();
  const selectedNoteWasInDeletedGroup = appState.notes.some((note) => note.id === appState.selectedNoteId && note.groupId === groupId);

  appState.groups = appState.groups.filter((group) => group.id !== groupId);
  appState.notes = appState.notes.map((note) => {
    if (note.groupId !== groupId) return note;
    return {
      ...note,
      pinned: false,
      deletedAt: now,
      updatedAt: now
    };
  });

  if (appState.selectedGroupId === groupId) {
    appState.selectedGroupId = appState.groups[0]?.id || null;
  }
  appState.collapsedGroupIds.delete(groupId);
  if (selectedNoteWasInDeletedGroup) {
    closePanel(true);
  }

  closeDeleteGroupDialog();
  await saveState();
  render();
}

async function emptyTrash() {
  appState.notes = appState.notes.filter((note) => !note.deletedAt);
  await saveState();
  render();
}

function openEmptyTrashDialog() {
  if (!appState.notes.some((note) => note.deletedAt)) {
    openEmptyTrashNoticeDialog();
    return;
  }

  els.emptyTrashDialog.classList.remove("hidden");
}

function closeEmptyTrashDialog() {
  els.emptyTrashDialog.classList.add("hidden");
}

async function confirmEmptyTrash() {
  closeEmptyTrashDialog();
  await emptyTrash();
}

function openEmptyTrashNoticeDialog() {
  els.emptyTrashNoticeDialog.classList.remove("hidden");
}

function closeEmptyTrashNoticeDialog() {
  els.emptyTrashNoticeDialog.classList.add("hidden");
}

async function openSettingsDialog() {
  await renderWidgetDisplayOptions();
  renderSettingsControls();
  await loadUpdateStatus();
  window.wmn.checkForUpdates?.();
  els.settingsDialog.classList.remove("hidden");
}

function closeSettingsDialog() {
  els.settingsDialog.classList.add("hidden");
}

function openDeleteNoteDialog(noteId) {
  const note = appState.notes.find((item) => item.id === noteId);
  pendingDeleteNoteId = noteId;
  pendingPermanentDeleteNote = Boolean(note?.deletedAt);

  const title = els.deleteNoteDialog.querySelector(".dialog-header h3");
  const message = els.deleteNoteDialog.querySelector("p");
  if (pendingPermanentDeleteNote) {
    title.textContent = "메모 영구 삭제";
    message.innerHTML = "해당 메모를 영구 삭제 하겠습니까?<br />삭제한 메모는 복구가 불가능 합니다.";
  } else {
    title.textContent = "메모 삭제";
    message.innerHTML = "해당 메모를 삭제하겠습니까?<br />삭제한 메모는 휴지통으로 갑니다.";
  }

  els.deleteNoteDialog.classList.remove("hidden");
}

function closeDeleteNoteDialog() {
  pendingDeleteNoteId = null;
  pendingPermanentDeleteNote = false;
  els.deleteNoteDialog.classList.add("hidden");
}

async function confirmDeleteNote() {
  const note = appState.notes.find((item) => item.id === pendingDeleteNoteId);
  if (!note) {
    closeDeleteNoteDialog();
    return;
  }

  if (pendingPermanentDeleteNote || note.deletedAt) {
    appState.notes = appState.notes.filter((item) => item.id !== note.id);
  } else {
    note.deletedAt = new Date().toISOString();
    note.pinned = false;
    note.updatedAt = note.deletedAt;
  }

  if (appState.selectedNoteId === note.id) {
    closePanel(true);
  }

  closeDeleteNoteDialog();
  await saveState();
  render();
}

function createNoteCard(note) {
  const card = document.createElement("article");
  card.className = "note-card";
  card.dataset.noteId = note.id;
  card.style.background = note.memoColor || "#ffffff";
  card.style.color = note.textColor || "#333333";
  card.style.setProperty("--importance-color", importanceColors[note.importance || 0]);
  card.classList.toggle("editing", appState.inlineEditingNoteId === note.id);

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const pin = actionButton("", "핀 고정", (event) => {
    event.stopPropagation();
    note.pinned = !note.pinned;
    note.updatedAt = new Date().toISOString();
    saveState().then(render);
  });
  pin.classList.add("note-pin-button");
  pin.classList.toggle("is-pinned", Boolean(note.pinned));
  setPinButtonIcon(pin, note.pinned);

  const star = actionButton("", "즐겨찾기", (event) => {
    event.stopPropagation();
    note.favorite = !note.favorite;
    note.updatedAt = new Date().toISOString();
    saveState().then(render);
  });
  setFavoriteButtonIcon(star, note.favorite);

  const del = actionButton("", note.deletedAt ? "영구 삭제" : "삭제", (event) => {
    event.stopPropagation();
    openDeleteNoteDialog(note.id);
  });
  del.className = "delete-note-button trash-icon-button";

  const title = document.createElement("h3");
  title.className = "note-title";
  title.textContent = note.title || untitledMemoTitle;

  const content = document.createElement("div");
  content.className = "note-content";
  if (note.contentHtml) {
    content.innerHTML = normalizeEditorHtml(note.contentHtml, {
      preserveLineBreaks: String(note.content || "").includes("\n")
    });
  } else {
    content.innerHTML = plainTextToHtml(note.content || "");
  }

  const dates = document.createElement("div");
  dates.className = "note-dates";
  const periodText = formatNotePeriod(note);
  if (periodText) {
    const period = document.createElement("span");
    period.className = "note-period";
    period.textContent = periodText;
    dates.append(period);
  }

  const createdTime = document.createElement("span");
  createdTime.className = "note-created-time";
  createdTime.textContent = formatCreatedTime(note.createdAt || note.updatedAt);
  dates.append(createdTime);

  const inlineToolbar = createInlineFormatToolbar(content);

  const openThisNote = (event) => {
    if (event.target.closest(".card-actions, .inline-format-toolbar")) return;
  };

  card.addEventListener("pointerdown", openThisNote, true);
  title.addEventListener("pointerdown", openThisNote, true);
  content.addEventListener("pointerdown", openThisNote, true);
  card.addEventListener("click", (event) => {
    if (event.target.closest(".card-actions, .inline-format-toolbar")) return;
    openNoteForPanelAndInlineEdit(card, event.target);
  });
  card.addEventListener("contextmenu", (event) => {
    if (event.target.closest(".card-actions, .inline-format-toolbar")) return;
    showMemoContextMenu(event, card);
  });
  card.addEventListener("mouseup", (event) => {
    if (event.button !== 2 || event.target.closest(".card-actions, .inline-format-toolbar")) return;
    showMemoContextMenu(event, card);
  });

  if (note.deletedAt) {
    actions.append(del);
  } else {
    actions.append(star, pin, del);
  }
  card.append(actions, title, content, dates, inlineToolbar);
  return card;
}

function openEditPanelForNote(noteId) {
  const note = appState.notes.find((item) => item.id === noteId);
  if (!note || note.deletedAt) return;

  resetPanelWidthForOpen();
  appState.panelOpen = true;
  appState.panelMode = "edit";
  appState.selectedGroupId = note.groupId;
  appState.selectedNoteId = note.id;
  appState.formDirty = false;
  editFormUserTouched = false;
  lastSyncedEditNoteId = null;

  document.body.classList.add("panel-open");
  document.body.classList.remove("create-panel-open");
  document.body.classList.add("edit-panel-open");
  els.memoPanel.setAttribute("aria-hidden", "true");
  els.editMemoPanel.setAttribute("aria-hidden", "false");
  els.panelTitle.textContent = "硫붾え ?섏젙";
  els.submitBtn.textContent = "硫붾え ?섏젙";
  syncEditFormFromSelectedNote(true);
  scheduleEditControlsRender();
  setTimeout(() => syncEditFormFromSelectedNote(true), 0);
  setTimeout(() => syncEditFormFromSelectedNote(true), 60);
  setTimeout(() => syncEditFormFromSelectedNote(false), 180);
  requestAnimationFrame(() => syncEditFormFromSelectedNote(true));
  appState.formDirty = false;
}

function syncEditFormFromSelectedNote(force = false) {
  if (!document.body.classList.contains("edit-panel-open")) return;
  if (!appState.selectedNoteId) return;
  if (!force && editFormUserTouched) return;

  const note = appState.notes.find((item) => item.id === appState.selectedNoteId);
  if (!note) return;

  const titleMissing = Boolean(note.title) && els.editTitleInput.value !== note.title;
  const contentMissing = Boolean(note.content) && getEditorText(els.editContentInput) !== note.content;
  const groupMissing = Boolean(note.groupId) && els.editGroupSelect.value !== note.groupId;
  const dateMissing =
    Boolean(note.startDate) && els.editStartDateInput.value !== note.startDate ||
    Boolean(note.endDate) && els.editEndDateInput.value !== note.endDate;

  if (force || lastSyncedEditNoteId !== note.id || titleMissing || contentMissing || groupMissing || dateMissing) {
    fillEditForm(note);
    lastSyncedEditNoteId = note.id;
  }
}

function fillEditForm(note) {
  const title = note.title || "";
  const content = note.content || "";
  const startDate = note.startDate || "";
  const endDate = note.endDate || "";

  setEditGroupSelection(note.groupId || "");
  els.editTitleInput.value = title;
  els.editTitleInput.setAttribute("value", title);
  els.editTitleInput.defaultValue = title;
  setEditorContent(els.editContentInput, content, note.contentHtml);
  els.editStartDateInput.value = startDate;
  els.editStartDateInput.setAttribute("value", startDate);
  els.editStartDateInput.defaultValue = startDate;
  els.editEndDateInput.value = endDate;
  els.editEndDateInput.setAttribute("value", endDate);
  els.editEndDateInput.defaultValue = endDate;
  editFormState = {
    importance: note.importance ?? 0,
    favorite: Boolean(note.favorite),
    textColor: note.textColor || "#333333",
    memoColor: note.memoColor || "#ffffff"
  };
  renderEditFormControls();
}

function renderEditFormControls() {
  setFavoriteButtonIcon(els.editFavoriteBtn, editFormState.favorite);
  renderImportanceInto(els.editImportanceControl, editFormState, renderEditFormControls);
  renderPaletteInto(els.editTextPalette, "textColor", editFormState, renderEditFormControls);
  renderPaletteInto(els.editMemoPalette, "memoColor", editFormState, renderEditFormControls);
}

function scheduleEditControlsRender() {
  renderEditFormControls();
  requestAnimationFrame(() => {
    renderEditFormControls();
    ensureEditControlsRendered();
    setTimeout(() => {
      renderEditFormControls();
      ensureEditControlsRendered();
    }, 40);
    setTimeout(ensureEditControlsRendered, 120);
  });
}

function ensureEditControlsRendered() {
  if (!document.body.classList.contains("edit-panel-open")) return;

  const importanceMissing = els.editImportanceControl.children.length < importanceColors.length;
  const textPaletteMissing = els.editTextPalette.children.length < getColorPalette("textColor").length + 1;
  const memoPaletteMissing = els.editMemoPalette.children.length < getColorPalette("memoColor").length + 1;

  if (importanceMissing || textPaletteMissing || memoPaletteMissing) {
    renderEditFormControls();
  }
}

function renderEditImportance() {
  els.editImportanceControl.innerHTML = "";
  importanceColors.forEach((color, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = index;
    button.style.color = color;
    button.style.setProperty("--importance-color", color);
    button.classList.toggle("active", editFormState.importance === index);
    button.addEventListener("click", () => {
      editFormState.importance = index;
      renderEditImportance();
    });
    els.editImportanceControl.append(button);
  });
}

async function submitEditMemo(event) {
  event.preventDefault();
  const note = appState.notes.find((item) => item.id === appState.selectedNoteId);
  if (!note) return;

  Object.assign(note, {
    groupId: els.editGroupSelect.value,
    title: els.editTitleInput.value.trim() || untitledMemoTitle,
    content: getEditorText(els.editContentInput),
    contentHtml: getEditorHtml(els.editContentInput),
    importance: editFormState.importance,
    favorite: editFormState.favorite,
    startDate: els.editStartDateInput.value,
    endDate: els.editEndDateInput.value,
    textColor: editFormState.textColor,
    memoColor: editFormState.memoColor,
    updatedAt: new Date().toISOString()
  });

  await saveState();
  render();
  closePanel(true);
}

function handleNoteCardSelection(event) {
  const card = event.target.closest(".note-card");
  if (!card || event.target.closest(".card-actions, .inline-format-toolbar")) return false;
  if (event.type !== "click") return false;

  const noteId = card.dataset.noteId;
  if (!noteId) return false;

  openNoteForPanelAndInlineEdit(card, event.target);

  return true;
}

function openNoteForPanelAndInlineEdit(card, target) {
  const noteId = card?.dataset?.noteId;
  if (!noteId) return;

  const note = appState.notes.find((item) => item.id === noteId);
  if (!note || note.deletedAt) return;

  const focusContent = Boolean(target.closest(".note-content"));
  startInlineNoteEdit(card, focusContent ? card.querySelector(".note-content") : card.querySelector(".note-title"), { focus: false });
  openEditPanelForNote(noteId);
  ensureInlineNoteEdit(noteId, focusContent);
}

function ensureInlineNoteEdit(noteId, focusContent = false) {
  const apply = () => {
    if (appState.panelMode !== "edit" || appState.selectedNoteId !== noteId) return;
    const card = document.querySelector(`.note-card[data-note-id="${noteId}"]`);
    if (!card) return;

    startInlineNoteEdit(
      card,
      focusContent ? card.querySelector(".note-content") : card.querySelector(".note-title")
    );
  };

  apply();
  requestAnimationFrame(apply);
  setTimeout(apply, 0);
}

function saveInlineSelection() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const editingCard = document.querySelector(".note-card.editing");
  const richEditor = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
    ? range.commonAncestorContainer.closest?.(".form-rich-editor")
    : range.commonAncestorContainer.parentElement?.closest?.(".form-rich-editor");
  if (!editingCard?.contains(range.commonAncestorContainer) && !richEditor) return;

  inlineSelectionRange = range.cloneRange();
}

function restoreInlineSelection(content) {
  const selection = window.getSelection();
  if (!selection) return;

  content.focus();
  selection.removeAllRanges();

  if (
    inlineSelectionRange
    && content.contains(inlineSelectionRange.startContainer)
    && content.contains(inlineSelectionRange.endContainer)
  ) {
    try {
      selection.addRange(inlineSelectionRange);
      return;
    } catch {
      inlineSelectionRange = null;
    }
  }

  const range = document.createRange();
  range.selectNodeContents(content);
  range.collapse(false);
  selection.addRange(range);
  inlineSelectionRange = range.cloneRange();
}

function execInlineCommand(content, command, value = null) {
  restoreInlineSelection(content);
  document.execCommand("styleWithCSS", false, true);
  document.execCommand(command, false, value);
  saveInlineSelection();
  handleRichEditorFormatted(content);
}

function handleRichEditorFormatted(content) {
  if (!content?.classList?.contains("form-rich-editor")) return;

  appState.formDirty = true;
  if (content === els.editContentInput) {
    editFormUserTouched = true;
    syncSelectedNotePreviewFromEditForm();
  }
}

function toggleFormEditorBold(content) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  if (!content.contains(range.commonAncestorContainer)) return;

  if (range.collapsed) {
    document.execCommand("bold", false, null);
    return;
  }

  const anchorNode = selection.anchorNode;
  const anchorElement = anchorNode?.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode?.parentElement;
  const style = anchorElement ? window.getComputedStyle(anchorElement) : null;
  const isBold = (Number(style?.fontWeight) || 400) >= 600 || Boolean(anchorElement?.closest?.("b, strong"));
  const fragment = range.extractContents();
  if (isBold) {
    fragment.querySelectorAll?.("b, strong").forEach((element) => {
      const span = document.createElement("span");
      span.replaceChildren(...element.childNodes);
      element.replaceWith(span);
    });
    fragment.querySelectorAll?.("[style]").forEach((element) => {
      element.style.fontWeight = "";
      if (!element.getAttribute("style")) element.removeAttribute("style");
    });
  }

  const wrapper = document.createElement("span");
  wrapper.style.fontWeight = isBold ? "400" : "700";
  wrapper.append(fragment);
  range.insertNode(wrapper);

  const nextRange = document.createRange();
  nextRange.selectNodeContents(wrapper);
  selection.removeAllRanges();
  selection.addRange(nextRange);
  inlineSelectionRange = nextRange.cloneRange();
}

function applyInlineFontSize(content, size) {
  restoreInlineSelection(content);
  document.execCommand("fontSize", false, "7");
  content.querySelectorAll("font[size='7']").forEach((font) => {
    const span = document.createElement("span");
    span.style.fontSize = `${size}px`;
    span.innerHTML = font.innerHTML;
    font.replaceWith(span);
  });
  saveInlineSelection();
  handleRichEditorFormatted(content);
}

function closeInlineFontSizeMenus() {
  document.querySelectorAll(".font-size-menu:not(.hidden)").forEach((menu) => {
    menu.classList.add("hidden");
  });
}

function getSelectedFontSize(content) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!content.contains(range.commonAncestorContainer) && !content.contains(range.startContainer)) {
    return null;
  }

  const selectedNode = range.startContainer.nodeType === Node.ELEMENT_NODE
    ? range.startContainer
    : range.startContainer.parentElement;
  const selectedElement = selectedNode?.closest?.("*");
  if (!selectedElement || !content.contains(selectedElement)) return null;

  const fontSize = Number.parseFloat(window.getComputedStyle(selectedElement).fontSize);
  if (!Number.isFinite(fontSize)) return null;

  return Math.max(4, Math.min(72, Math.round(fontSize)));
}

function updateFontSizeMenuState(menu, content) {
  if (!menu || !content) return;

  restoreInlineSelection(content);
  const selectedFontSize = getSelectedFontSize(content);
  let activeButton = null;

  menu.querySelectorAll("[data-size]").forEach((button) => {
    const isActive = selectedFontSize !== null && Number(button.dataset.size) === selectedFontSize;
    button.classList.toggle("active", isActive);
    if (isActive) activeButton = button;
  });

  if (activeButton) {
    activeButton.scrollIntoView({ block: "nearest" });
  }
}

function updateFormatToolbarState(toolbar, content) {
  if (!toolbar || !content) return;
  const selection = window.getSelection();
  const hasSelectionInContent = selection
    && selection.rangeCount > 0
    && content.contains(selection.getRangeAt(0).commonAncestorContainer);

  if (!hasSelectionInContent || selection.isCollapsed || document.activeElement !== content) {
    toolbar.querySelectorAll("[data-command]").forEach((button) => button.classList.remove("active"));
    return;
  }

  const anchorNode = selection?.anchorNode;
  const anchorElement = anchorNode?.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode?.parentElement;
  const style = anchorElement ? window.getComputedStyle(anchorElement) : null;
  const textDecoration = style?.textDecorationLine || "";
  const fontWeight = Number(style?.fontWeight) || 400;

  const states = {
    bold: fontWeight >= 600 || Boolean(anchorElement?.closest?.("b, strong")),
    italic: style?.fontStyle === "italic" || Boolean(anchorElement?.closest?.("i, em")),
    underline: textDecoration.includes("underline") || Boolean(anchorElement?.closest?.("u")),
    strikeThrough: textDecoration.includes("line-through") || Boolean(anchorElement?.closest?.("s, strike, del"))
  };

  Object.entries(states).forEach(([command, active]) => {
    toolbar.querySelector(`[data-command="${command}"]`)?.classList.toggle("active", active);
  });

  const listButton = toolbar.querySelector('[data-command="insertUnorderedList"]');
  if (listButton) {
    listButton.classList.toggle("active", Boolean(anchorElement?.closest?.("ul")));
  }
}

function updateAllFormatToolbarStates() {
  document.querySelectorAll(".inline-format-toolbar").forEach((toolbar) => {
    const cardContent = toolbar.closest(".note-card")?.querySelector(".note-content");
    const formContent = toolbar.closest(".rich-editor-wrap")?.querySelector(".form-rich-editor");
    updateFormatToolbarState(toolbar, cardContent || formContent);
  });
}

function createInlineFormatToolbar(content) {
  const toolbar = document.createElement("div");
  toolbar.className = "inline-format-toolbar";

  const fontSizeWrap = document.createElement("div");
  fontSizeWrap.className = "font-size-control";
  const fontSizeButton = document.createElement("button");
  fontSizeButton.type = "button";
  fontSizeButton.className = "font-size-button";
  fontSizeButton.title = "글자 크기";
  fontSizeButton.textContent = "T";
  fontSizeButton.addEventListener("mousedown", (event) => {
    saveInlineSelection();
    event.preventDefault();
  });
  fontSizeButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    saveInlineSelection();
    const menu = fontSizeWrap.querySelector(".font-size-menu");
    const willOpen = menu.classList.contains("hidden");
    closeInlineFontSizeMenus();
    if (willOpen) updateFontSizeMenuState(menu, content);
    menu.classList.toggle("hidden", !willOpen);
  });

  const fontSizeMenu = document.createElement("div");
  fontSizeMenu.className = "font-size-menu hidden";
  for (let size = 4; size <= 72; size += 1) {
    const item = document.createElement("button");
    item.type = "button";
    item.textContent = String(size);
    item.dataset.size = String(size);
    item.addEventListener("mousedown", (event) => {
      saveInlineSelection();
      event.preventDefault();
    });
    item.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      applyInlineFontSize(content, size);
      fontSizeMenu.classList.add("hidden");
      updateFormatToolbarState(toolbar, content);
    });
    fontSizeMenu.append(item);
  }
  fontSizeWrap.append(fontSizeButton, fontSizeMenu);
  toolbar.append(fontSizeWrap);

  const addFormatButton = (label, title, command, className = "") => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.dataset.command = command;
    button.textContent = label;
    button.title = title;
    button.addEventListener("mousedown", (event) => {
      saveInlineSelection();
      event.preventDefault();
    });
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeInlineFontSizeMenus();
      execInlineCommand(content, command);
      updateFormatToolbarState(toolbar, content);
      requestAnimationFrame(() => updateFormatToolbarState(toolbar, content));
    });
    toolbar.append(button);
  };

  addFormatButton("B", "굵게", "bold", "bold-button");
  addFormatButton("I", "기울임", "italic", "italic-button");
  addFormatButton("U", "밑줄", "underline", "underline-button");
  addFormatButton("ab", "취소선", "strikeThrough", "strike-button");
  addFormatButton("≡", "목록", "insertUnorderedList");

  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageInput.className = "inline-image-input";
  imageInput.addEventListener("click", (event) => event.stopPropagation());
  imageInput.addEventListener("change", () => {
    const file = imageInput.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      execInlineCommand(content, "insertImage", reader.result);
      imageInput.value = "";
    });
    reader.readAsDataURL(file);
  });

  const imageButton = document.createElement("button");
  imageButton.type = "button";
  imageButton.textContent = "▧";
  imageButton.title = "이미지 추가";
  imageButton.addEventListener("mousedown", (event) => event.preventDefault());
  imageButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    imageInput.click();
  });

  toolbar.append(imageButton, imageInput);
  return toolbar;
}

function renderFormFormatToolbars() {
  if (els.contentFormatToolbar && els.contentFormatToolbar.childElementCount === 0) {
    const toolbar = createInlineFormatToolbar(els.contentInput);
    toolbar.classList.add("static-format-toolbar");
    els.contentFormatToolbar.append(toolbar);
  }
  if (els.editContentFormatToolbar && els.editContentFormatToolbar.childElementCount === 0) {
    const toolbar = createInlineFormatToolbar(els.editContentInput);
    toolbar.classList.add("static-format-toolbar");
    els.editContentFormatToolbar.append(toolbar);
  }
}

function bindRichEditor(editor) {
  if (!editor) return;

  editor.addEventListener("mousedown", () => {
    closeInlineFontSizeMenus();
    inlineSelectionRange = null;
  });
  editor.addEventListener("click", () => {
    editor.focus();
    saveInlineSelection();
    updateAllFormatToolbarStates();
  });
  editor.addEventListener("input", () => {
    appState.formDirty = true;
    if (editor === els.editContentInput) editFormUserTouched = true;
    if (editor === els.editContentInput) syncSelectedNotePreviewFromEditForm();
    saveInlineSelection();
    updateAllFormatToolbarStates();
  });
  editor.addEventListener("keyup", updateAllFormatToolbarStates);
  editor.addEventListener("mouseup", updateAllFormatToolbarStates);
}

function syncSelectedNotePreviewFromEditForm() {
  if (appState.panelMode !== "edit" || !appState.selectedNoteId) return;

  const card = document.querySelector(`.note-card[data-note-id="${appState.selectedNoteId}"]`);
  if (!card) return;

  const title = els.editTitleInput.value.trim() || untitledMemoTitle;
  const contentHtml = getEditorHtml(els.editContentInput);
  const titleElement = card.querySelector(".note-title");
  const contentElement = card.querySelector(".note-content");
  if (titleElement) titleElement.textContent = title;
  if (contentElement) contentElement.innerHTML = contentHtml;
}

function getEditingContent() {
  return contextMenuContent || document.querySelector(".note-card.editing .note-content") || document.activeElement?.closest?.(".form-rich-editor");
}

function selectionIsInsideContent(content) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;
  const range = selection.getRangeAt(0);
  return content.contains(range.commonAncestorContainer) || content.contains(range.startContainer) || content.contains(range.endContainer);
}

async function runMemoContextAction(action) {
  const content = getEditingContent();
  if (!content) return;

  if (action === "paste") {
    restoreInlineSelection(content);
    try {
      const text = await navigator.clipboard.readText();
      document.execCommand("insertText", false, text);
      saveInlineSelection();
    } catch {
      document.execCommand("paste", false, null);
    }
    return;
  }

  execInlineCommand(content, action);
}

function createMemoContextMenu() {
  if (memoContextMenu) return memoContextMenu;

  memoContextMenu = document.createElement("div");
  memoContextMenu.className = "memo-context-menu hidden";
  memoContextMenu.innerHTML = `
    <button type="button" data-action="copy"><span class="menu-icon">□</span><span>복사</span></button>
    <button type="button" data-action="cut"><span class="menu-icon">✂</span><span>잘라내기</span></button>
    <button type="button" data-action="paste"><span class="menu-icon">▣</span><span>붙여넣기</span></button>
    <div class="memo-context-divider"></div>
    <button type="button" data-action="undo"><span class="menu-icon">↶</span><span>실행 취소</span></button>
    <button type="button" data-action="redo"><span class="menu-icon">↷</span><span>다시 실행</span></button>
  `;
  memoContextMenu.addEventListener("mousedown", (event) => event.preventDefault());
  memoContextMenu.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();
    await runMemoContextAction(button.dataset.action);
    hideMemoContextMenu();
  });
  document.body.append(memoContextMenu);
  return memoContextMenu;
}

function updateMemoContextMenuState(menu, content) {
  const hasSelection = selectionIsInsideContent(content);
  restoreInlineSelection(content);
  menu.querySelector('[data-action="copy"]').disabled = !hasSelection;
  menu.querySelector('[data-action="cut"]').disabled = !hasSelection;
  menu.querySelector('[data-action="paste"]').disabled = false;
  menu.querySelector('[data-action="undo"]').disabled = !document.queryCommandEnabled("undo");
  menu.querySelector('[data-action="redo"]').disabled = !document.queryCommandEnabled("redo");
}

function showEditorContextMenu(event, content, options = {}) {
  if (!content) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
  contextMenuContent = content;
  saveInlineSelection();

  const menu = createMemoContextMenu();
  updateMemoContextMenuState(menu, content);
  menu.classList.remove("hidden");
  const width = menu.offsetWidth || 132;
  const height = menu.offsetHeight || 174;
  const x = Math.min(options.x ?? event.clientX, window.innerWidth - width - 8);
  const y = Math.min(options.y ?? event.clientY, window.innerHeight - height - 8);
  menu.style.left = `${Math.max(8, x)}px`;
  menu.style.top = `${Math.max(8, y)}px`;
}

function showMemoContextMenu(event, card, options = {}) {
  const noteId = card?.dataset?.noteId;
  if (!noteId) return;
  const note = appState.notes.find((item) => item.id === noteId);
  if (!note || note.deletedAt) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();

  if (!card.classList.contains("editing")) {
    openNoteForPanelAndInlineEdit(card, event.target);
  }
  saveInlineSelection();

  const content = card.querySelector(".note-content");
  if (!content) return;
  showEditorContextMenu(event, content, options);
}

function hideMemoContextMenu() {
  contextMenuContent = null;
  memoContextMenu?.classList.add("hidden");
}

function startInlineNoteEdit(card, target, options = {}) {
  const noteId = card.dataset.noteId;
  if (appState.panelMode === "create") return;
  if (appState.inlineEditingNoteId && appState.inlineEditingNoteId !== noteId) {
    const previousCard = document.querySelector(`.note-card[data-note-id="${appState.inlineEditingNoteId}"]`);
    if (previousCard) finishInlineNoteEdit(previousCard);
  }

  appState.selectedNoteId = noteId;
  appState.inlineEditingNoteId = noteId;
  card.classList.add("editing");

  const title = card.querySelector(".note-title");
  const content = card.querySelector(".note-content");
  const focusTarget = target || content || title;
  title.contentEditable = "true";
  content.contentEditable = "true";
  title.spellcheck = false;
  content.spellcheck = false;

  if (options.focus === false) return;

  focusTarget.focus();
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(focusTarget);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
  saveInlineSelection();
}

async function finishInlineNoteEdit(card, options = {}) {
  const noteId = card?.dataset?.noteId;
  if (!noteId || appState.inlineEditingNoteId !== noteId) return;

  const note = appState.notes.find((item) => item.id === noteId);
  if (!note) return;

  const title = card.querySelector(".note-title").textContent.trim() || untitledMemoTitle;
  const contentElement = card.querySelector(".note-content");
  const content = contentElement.textContent.trim();
  const contentHtml = normalizeEditorHtml(contentElement.innerHTML, {
    preserveLineBreaks: content.includes("\n")
  });
  appState.inlineEditingNoteId = null;
  card.classList.remove("editing");
  card.querySelector(".note-title").contentEditable = "false";
  contentElement.contentEditable = "false";

  if (!options.cancel) {
    note.title = title;
    note.content = content;
    note.contentHtml = contentHtml;
    note.updatedAt = new Date().toISOString();
    await saveState();

    if (appState.panelMode === "edit" && appState.selectedNoteId === noteId) {
      els.editTitleInput.value = note.title;
      setEditorContent(els.editContentInput, note.content, note.contentHtml);
      appState.formDirty = false;
    }
  }

  if (!options.noRender) {
    render();
  }
}

function handleInlineNoteKeydown(event) {
  const card = event.target.closest(".note-card.editing");
  if (!card) return false;

  if (event.key === "Escape") {
    event.preventDefault();
    finishInlineNoteEdit(card, { cancel: true });
    return true;
  }

  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    finishInlineNoteEdit(card);
    return true;
  }

  return false;
}

function actionButton(text, title, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.title = title;
  button.addEventListener("click", onClick);
  return button;
}

function setPinButtonIcon(button, pinned) {
  button.textContent = "";
  button.classList.add("pin-icon-button");
  button.classList.toggle("pin-icon-on", Boolean(pinned));
  button.classList.toggle("pin-icon-off", !pinned);
}

function setFavoriteButtonIcon(button, favorite) {
  button.textContent = "";
  button.classList.add("favorite-icon-button");
  button.classList.toggle("favorite-icon-on", Boolean(favorite));
  button.classList.toggle("favorite-icon-off", !favorite);
}

function createAddCard(group, groupIndex = -1) {
  const button = document.createElement("button");
  button.className = "add-card";
  button.type = "button";
  button.textContent = "+";
  button.dataset.groupId = group?.id || "";
  button.dataset.groupName = group?.name || "";
  button.dataset.groupIndex = String(groupIndex);
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (!group) return;
    pendingCreateGroupId = group.id;
    pendingCreateGroupName = group.name;
    openCreatePanel(group.id, group.name);
    forceCreateGroupSelection(group);
    requestAnimationFrame(() => forceCreateGroupSelection(group));
    setTimeout(() => forceCreateGroupSelection(group), 80);
    setTimeout(() => forceCreateGroupSelection(group), 220);
  });
  return button;
}

function openCreatePanelFromAddButton(button) {
  const group = resolveCreateGroupFromAddButton(button);
  openCreatePanel(group?.id, group?.name);
  forceCreateGroupSelection(group);
  requestAnimationFrame(() => forceCreateGroupSelection(group));
  setTimeout(() => forceCreateGroupSelection(group), 80);
  setTimeout(() => forceCreateGroupSelection(group), 220);
}

function resolveCreateGroupFromAddButton(button) {
  const block = button.closest(".group-block");
  const blockGroupId = block?.dataset.groupId || "";
  const blockGroupName = block?.dataset.groupName || block?.querySelector(".group-title-row h2")?.textContent.trim() || "";
  const buttonGroupId = button.dataset.groupId || "";
  const buttonGroupName = button.dataset.groupName || "";
  const buttonGroupIndex = Number(button.dataset.groupIndex);
  const group = (Number.isInteger(buttonGroupIndex) ? appState.groups[buttonGroupIndex] : null)
    || appState.groups.find((item) => item.id === buttonGroupId)
    || appState.groups.find((item) => item.name === buttonGroupName)
    || appState.groups.find((item) => item.id === blockGroupId)
    || appState.groups.find((item) => item.name === blockGroupName);

  return group || null;
}

function rememberCreateGroupFromAddButton(button) {
  const block = button.closest(".group-block");
  const blockGroupId = block?.dataset.groupId || "";
  const blockGroupName = block?.dataset.groupName || block?.querySelector(".group-title-row h2")?.textContent.trim() || "";
  const buttonGroupId = button.dataset.groupId || "";
  const buttonGroupName = button.dataset.groupName || "";
  const buttonGroupIndex = Number(button.dataset.groupIndex);
  const group = (Number.isInteger(buttonGroupIndex) ? appState.groups[buttonGroupIndex] : null)
    || appState.groups.find((item) => item.id === buttonGroupId)
    || appState.groups.find((item) => item.name === buttonGroupName)
    || appState.groups.find((item) => item.id === blockGroupId)
    || appState.groups.find((item) => item.name === blockGroupName);

  pendingCreateGroupId = group?.id || buttonGroupId || blockGroupId || null;
  pendingCreateGroupName = group?.name || buttonGroupName || blockGroupName || null;
}

function getCreateGroupId(groupId = null, groupName = null) {
  if (groupId && appState.groups.some((group) => group.id === groupId)) {
    return groupId;
  }
  const matchedByName = appState.groups.find((group) => group.name === groupName);
  if (matchedByName) {
    return matchedByName.id;
  }
  return appState.groups[0]?.id || "";
}

function setCreateGroupSelection(groupId = null, groupName = null) {
  const nextGroupId = getCreateGroupId(groupId, groupName);
  appState.selectedGroupId = nextGroupId || null;
  pendingCreateGroupId = nextGroupId || null;
  pendingCreateGroupName = appState.groups.find((group) => group.id === nextGroupId)?.name || groupName || null;

  const options = [...els.groupSelect.options];
  const optionIndex = options.findIndex((option) => option.value === nextGroupId);
  options.forEach((option, index) => {
    option.selected = index === optionIndex;
  });

  if (optionIndex >= 0) {
    els.groupSelect.selectedIndex = optionIndex;
  }
  els.groupSelect.value = nextGroupId;
  renderGroupPicker(nextGroupId);

  return nextGroupId;
}

function lockCreateGroupSelection(groupId, groupName = null) {
  const targetGroupId = setCreateGroupSelection(groupId, groupName);
  requestAnimationFrame(() => setCreateGroupSelection(targetGroupId));
  setTimeout(() => setCreateGroupSelection(targetGroupId), 0);
  setTimeout(() => setCreateGroupSelection(targetGroupId), 60);
  setTimeout(() => setCreateGroupSelection(targetGroupId), 180);
}

function renderSortButtons() {
  const buttons = [els.createdSortBtn, els.titleSortBtn, els.importanceSortBtn];
  buttons.forEach((button) => button.classList.remove("active", "asc", "desc"));

  els.createdSortBtn.classList.toggle("active", appState.sortMode === "created");
  els.titleSortBtn.classList.toggle("active", appState.sortMode === "title");
  els.importanceSortBtn.classList.toggle("active", appState.sortMode === "importance");

  els.createdSortBtn.classList.add(appState.sortMode === "created" ? appState.sortDirection : "desc");
  els.importanceSortBtn.classList.add(appState.sortMode === "importance" ? appState.sortDirection : "desc");

  const titleMarks = ["ㄱㄴ↓", "ㄱㄴ↑", "ABC↓", "ABC↑"];
  els.titleSortMark.textContent = titleMarks[appState.titleSortStep] || titleMarks[0];
}

function renderViewToggle() {
  const viewMode = ["all", "trash", "calendar"].includes(appState.settings.viewMode) ? appState.settings.viewMode : "group";
  const labels = {
    group: "그룹보기",
    calendar: "달력보기",
    all: "전체보기",
    trash: "휴지통"
  };
  els.currentViewLabel.textContent = labels[viewMode] || labels.group;
  els.allViewBtn.classList.toggle("active", viewMode === "all");
  els.groupViewBtn.classList.toggle("active", viewMode === "group");
  els.calendarViewBtn.classList.toggle("active", viewMode === "calendar");
  els.trashViewBtn.classList.toggle("active", viewMode === "trash");
}

function setPanelWidth(width) {
  const appBody = document.querySelector(".app-body");
  const maxWidth = Math.max(panelResize.minPanelWidth, appBody.clientWidth - panelResize.minListWidth - 14);
  const nextWidth = Math.min(Math.max(width, panelResize.minPanelWidth), maxWidth);
  document.documentElement.style.setProperty("--memo-panel-width", `${nextWidth}px`);
  localStorage.setItem("wmnMemoPanelWidth", String(nextWidth));
}

function resetPanelWidthForOpen() {
  setPanelWidth(panelResize.defaultPanelWidth);
}

function initPanelResize() {
  const savedWidth = Number(localStorage.getItem("wmnMemoPanelWidth"));
  if (Number.isFinite(savedWidth) && savedWidth > 0) {
    setPanelWidth(savedWidth);
  }

  els.panelResizeHandle.addEventListener("mousedown", (event) => {
    if (!appState.panelOpen) return;
    event.preventDefault();
    event.stopPropagation();
    panelResize.active = true;
    document.body.classList.add("resizing-panels");
  });

  document.addEventListener("mousemove", (event) => {
    if (!panelResize.active) return;

    const appBody = document.querySelector(".app-body");
    const rect = appBody.getBoundingClientRect();
    setPanelWidth(rect.right - event.clientX - 14);
  });

  document.addEventListener("mouseup", () => {
    if (!panelResize.active) return;
    panelResize.active = false;
    document.body.classList.remove("resizing-panels");
  });
}

function setCardSize(size) {
  const minSize = Number(els.cardSizeSlider.min) || 100;
  const maxSize = Number(els.cardSizeSlider.max) || 420;
  const nextSize = Math.min(Math.max(Number(size) || maxSize, minSize), maxSize);
  const nextHeight = Math.round(nextSize * 0.98);
  const dateFontSize = Math.round((8 + ((nextSize - minSize) / (maxSize - minSize)) * 5) * 10) / 10;
  document.documentElement.style.setProperty("--card-min-width", `${nextSize}px`);
  document.documentElement.style.setProperty("--card-height", `${nextHeight}px`);
  document.documentElement.style.setProperty("--note-date-font-size", `${dateFontSize}px`);
  els.cardSizeSlider.value = String(nextSize);
  localStorage.setItem("wmnCardSize", String(nextSize));
}

function initCardSizeControl() {
  const maxSize = Number(els.cardSizeSlider.max) || 420;
  const savedSize = Number(localStorage.getItem("wmnCardSize"));
  const nextSize = Number.isFinite(savedSize) && savedSize > 0
    ? savedSize
    : maxSize;
  setCardSize(nextSize >= 180 ? maxSize : nextSize);
  els.cardSizeSlider.addEventListener("input", () => {
    setCardSize(els.cardSizeSlider.value);
  });

  const memoList = document.querySelector(".memo-list");
  memoList?.addEventListener("wheel", (event) => {
    if (!event.ctrlKey) return;

    event.preventDefault();
    const currentSize = Number(els.cardSizeSlider.value) || maxSize;
    const direction = event.deltaY < 0 ? 1 : -1;
    setCardSize(currentSize + direction * 6);
  }, { passive: false });
}

function clearCreateInputs() {
  els.titleInput.value = "";
  els.titleInput.defaultValue = "";
  setEditorContent(els.contentInput, "");
  inlineSelectionRange = null;
}

function scheduleCreateInputClear(token) {
  const clearIfStillFresh = () => {
    if (createPanelToken !== token) return;
    if (appState.panelMode !== "create" || !document.body.classList.contains("create-panel-open")) return;
    if (appState.formDirty) return;
    clearCreateInputs();
  };

  clearIfStillFresh();
  requestAnimationFrame(clearIfStillFresh);
  setTimeout(clearIfStillFresh, 0);
  setTimeout(clearIfStillFresh, 80);
  setTimeout(clearIfStillFresh, 220);
}

function openCreatePanel(groupId = null, groupName = null) {
  const token = ++createPanelToken;
  const editingCard = appState.inlineEditingNoteId
    ? document.querySelector(`.note-card[data-note-id="${appState.inlineEditingNoteId}"]`)
    : null;
  if (editingCard) {
    finishInlineNoteEdit(editingCard, { noRender: true });
  }
  appState.inlineEditingNoteId = null;

  const targetGroupId = getCreateGroupId(groupId || pendingCreateGroupId, groupName || pendingCreateGroupName);
  pendingCreateGroupId = targetGroupId || null;
  pendingCreateGroupName = appState.groups.find((group) => group.id === targetGroupId)?.name || groupName || pendingCreateGroupName || null;
  appState.panelOpen = true;
  appState.panelMode = "create";
  appState.selectedGroupId = targetGroupId || null;
  appState.selectedNoteId = null;
  appState.formDirty = false;

  resetPanelWidthForOpen();
  document.body.classList.add("panel-open");
  document.body.classList.add("create-panel-open");
  document.body.classList.remove("edit-panel-open");
  els.memoPanel.setAttribute("aria-hidden", "false");
  els.editMemoPanel.setAttribute("aria-hidden", "true");
  renderGroupSelect(targetGroupId);
  resetCreateForm(targetGroupId);
  scheduleCreateInputClear(token);
  lockCreateGroupSelection(targetGroupId, groupName);
  els.panelTitle.textContent = "??硫붾え 異붽?";
  els.submitBtn.textContent = "硫붾え 異붽?";
  scheduleCreateControlsRender();
  appState.formDirty = false;
}

function resetCreateForm(groupId = null) {
  setCreateGroupSelection(groupId || pendingCreateGroupId);
  clearCreateInputs();
  els.startDateInput.value = "";
  els.startDateInput.defaultValue = "";
  els.endDateInput.value = "";
  els.endDateInput.defaultValue = "";
  formState = {
    importance: 0,
    favorite: false,
    textColor: "#333333",
    memoColor: "#ffffff"
  };
  renderFormControls();
}

function scheduleCreateControlsRender() {
  renderFormControls();
  requestAnimationFrame(() => {
    renderFormControls();
    ensureCreateControlsRendered();
    setTimeout(() => {
      renderFormControls();
      ensureCreateControlsRendered();
    }, 40);
    setTimeout(ensureCreateControlsRendered, 120);
  });
}

function openPanel(mode, groupId = null, noteId = null, options = {}) {
  if (mode === "create") {
    openCreatePanel(groupId);
    if (options.focusPanel !== false) {
      setTimeout(() => els.titleInput.focus(), 80);
    }
    return;
  }

  appState.panelOpen = true;
  appState.panelMode = mode;
  appState.selectedGroupId = groupId || appState.groups[0]?.id || null;
  appState.selectedNoteId = noteId;
  appState.formDirty = false;

  document.body.classList.add("panel-open");
  document.body.classList.toggle("edit-panel-open", mode === "edit");
  document.body.classList.toggle("create-panel-open", mode !== "edit");
  els.memoPanel.setAttribute("aria-hidden", "false");
  fillForm();
  if (mode === "edit") {
    els.panelTitle.textContent = "硫붾え ?섏젙";
    els.submitBtn.textContent = "硫붾え ?섏젙";
  }
  setTimeout(() => {
    if (options.focusPanel !== false) {
      els.titleInput.focus();
    }
    appState.formDirty = false;
  }, 80);
}

function closePanel(force = false) {
  appState.panelOpen = false;
  appState.selectedNoteId = null;
  pendingCreateGroupId = null;
  pendingCreateGroupName = null;
  appState.formDirty = false;
  appState.pendingClose = false;
  editFormUserTouched = false;
  lastSyncedEditNoteId = null;
  document.body.classList.remove("panel-open");
  document.body.classList.remove("create-panel-open");
  document.body.classList.remove("edit-panel-open");
  els.memoPanel.setAttribute("aria-hidden", "true");
  els.editMemoPanel.setAttribute("aria-hidden", "true");
}

function openQuitDialog() {
  els.quitDialog.classList.remove("hidden");
}

function closeQuitDialog() {
  els.quitDialog.classList.add("hidden");
}

function resetFormForCreate(groupId = null) {
  appState.panelMode = "create";
  appState.selectedNoteId = null;
  appState.selectedGroupId = getCreateGroupId(groupId) || null;
  fillForm();
}

function fillForm() {
  const editing = appState.panelMode === "edit";
  const note = editing ? appState.notes.find((item) => item.id === appState.selectedNoteId) : null;
  const defaultGroup = getCreateGroupId(appState.selectedGroupId);

  els.panelTitle.textContent = editing ? "硫붾え ?섏젙" : "??硫붾え 異붽?";
  els.submitBtn.textContent = editing ? "硫붾え ?섏젙" : "硫붾え 異붽?";
  els.groupSelect.value = note?.groupId || defaultGroup;
  els.titleInput.value = note?.title || "";
  setEditorContent(els.contentInput, note?.content || "", note?.contentHtml || "");
  els.startDateInput.value = note?.startDate || today();
  els.endDateInput.value = note?.endDate || today();
  formState = {
    importance: note?.importance ?? 0,
    favorite: Boolean(note?.favorite),
    textColor: note?.textColor || "#333333",
    memoColor: note?.memoColor || "#ffffff"
  };

  renderFormControls();
}

function renderFormControls() {
  setFavoriteButtonIcon(els.favoriteBtn, formState.favorite);
  renderImportanceInto(els.importanceControl, formState, () => {
    appState.formDirty = true;
    renderFormControls();
  });
  renderPaletteInto(els.textPalette, "textColor", formState, renderFormControls);
  renderPaletteInto(els.memoPalette, "memoColor", formState, renderFormControls);
}

function ensureCreateControlsRendered() {
  if (!document.body.classList.contains("create-panel-open")) return;

  if (pendingCreateGroupId) {
    const group = appState.groups.find((item) => item.id === pendingCreateGroupId);
    if (group) {
      forceCreateGroupSelection(group);
    }
  }

  const importanceMissing = els.importanceControl.children.length < importanceColors.length;
  const textPaletteMissing = els.textPalette.children.length < getColorPalette("textColor").length + 1;
  const memoPaletteMissing = els.memoPalette.children.length < getColorPalette("memoColor").length + 1;

  if (importanceMissing || textPaletteMissing || memoPaletteMissing) {
    renderFormControls();
  }
}

function renderImportance() {
  renderImportanceInto(els.importanceControl, formState, () => {
    appState.formDirty = true;
    renderImportance();
  });
}

function renderImportanceInto(container, state, rerender) {
  container.replaceChildren();

  const setImportanceFromPointer = (event, rect) => {
    const relativeX = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const stepWidth = rect.width / importanceColors.length;
    const index = Math.min(importanceColors.length - 1, Math.max(0, Math.floor(relativeX / stepWidth)));
    if (state.importance === index) return;

    state.importance = index;
    rerender();
  };

  container.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const rect = container.getBoundingClientRect();
    container.setPointerCapture?.(event.pointerId);

    const handlePointerMove = (moveEvent) => {
      setImportanceFromPointer(moveEvent, rect);
    };
    const handlePointerUp = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp, { once: true });
  });

  importanceColors.forEach((color, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = index;
    button.style.color = color;
    button.style.setProperty("--importance-color", color);
    button.classList.toggle("active", state.importance === index);
    container.append(button);
  });
}

function renderPaletteInto(container, key, state = formState, rerender = renderFormControls) {
  container.replaceChildren();

  getColorPalette(key).forEach((color) => {
    const item = document.createElement("div");
    item.className = "swatch-item";

    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "swatch";
    swatch.style.background = color;
    swatch.classList.toggle("active", state[key] === color);
    swatch.addEventListener("click", () => {
      state[key] = color;
      rerender();
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "swatch-remove";
    remove.textContent = "\u00d7";
    remove.title = "컬러 삭제";
    remove.addEventListener("click", async (event) => {
      event.stopPropagation();
      await removePaletteColor(key, color);
      if (!getColorPalette(key).includes(state[key])) {
        state[key] = getColorPalette(key)[0] || "#ffffff";
      }
      rerender();
      renderSiblingPaletteControls();
    });

    item.append(swatch, remove);
    container.append(item);
  });

  const addItem = document.createElement("label");
  addItem.className = "swatch add-swatch";
  addItem.title = "커스텀 컬러 추가";

  const picker = document.createElement("input");
  picker.type = "color";
  picker.value = /^#[0-9a-f]{6}$/i.test(state[key]) ? state[key] : "#ffffff";
  picker.className = "palette-color-picker";
  picker.addEventListener("change", async () => {
    const color = normalizeColor(picker.value);
    const palette = getColorPalette(key);
    if (!palette.includes(color)) {
      setColorPalette(key, [...palette, color]);
      await saveState();
    }
    state[key] = color;
    rerender();
    renderSiblingPaletteControls();
  });

  addItem.append(picker);
  container.append(addItem);

}

function openCustomColorPicker(key, state, rerender) {
  const picker = document.createElement("input");
  picker.type = "color";
  picker.value = /^#[0-9a-f]{6}$/i.test(state[key]) ? state[key] : "#ffffff";
  picker.className = "hidden-color-picker";
  document.body.append(picker);
  picker.addEventListener("change", async () => {
    const color = normalizeColor(picker.value);
    const palette = getColorPalette(key);
    if (!palette.includes(color)) {
      setColorPalette(key, [...palette, color]);
      await saveState();
    }
    state[key] = color;
    rerender();
    renderSiblingPaletteControls();
  }, { once: true });
  picker.addEventListener("blur", () => picker.remove(), { once: true });
  picker.click();
}

async function removePaletteColor(key, color) {
  const fallback = getColorPalette(key).find((item) => item !== color) || "#ffffff";
  setColorPalette(key, getColorPalette(key).filter((item) => item !== color));
  if (key === "textColor") {
    if (!getColorPalette(key).includes(formState.textColor)) formState.textColor = fallback;
    if (!getColorPalette(key).includes(editFormState.textColor)) editFormState.textColor = fallback;
  } else {
    if (!getColorPalette(key).includes(formState.memoColor)) formState.memoColor = fallback;
    if (!getColorPalette(key).includes(editFormState.memoColor)) editFormState.memoColor = fallback;
  }
  await saveState();
}

function renderSiblingPaletteControls() {
  if (document.body.classList.contains("create-panel-open")) {
    renderFormControls();
  }
  if (document.body.classList.contains("edit-panel-open")) {
    renderEditFormControls();
  }
}

async function submitMemo(event) {
  event.preventDefault();

  const now = new Date().toISOString();
  const createGroupId = appState.panelMode === "create" && pendingCreateGroupId
    ? pendingCreateGroupId
    : els.groupSelect.value;
  const payload = {
    groupId: createGroupId,
    title: els.titleInput.value.trim() || untitledMemoTitle,
    content: getEditorText(els.contentInput),
    contentHtml: getEditorHtml(els.contentInput),
    importance: formState.importance,
    favorite: formState.favorite,
    startDate: els.startDateInput.value,
    endDate: els.endDateInput.value,
    textColor: formState.textColor,
    memoColor: formState.memoColor,
    updatedAt: now
  };

  if (appState.panelMode === "edit") {
    appState.notes = appState.notes.map((note) => {
      if (note.id !== appState.selectedNoteId) return note;
      return { ...note, ...payload };
    });
  } else {
    appState.notes.push({
      id: uid("note"),
      pinned: false,
      createdAt: now,
      ...payload
    });
  }

  await saveState();
  render();
  closePanel(true);
}

function uniqueGroupName(name) {
  const baseName = name.trim() || "새 그룹";
  let index = 1;
  let candidate = baseName;

  while (appState.groups.some((group) => group.name === candidate)) {
    index += 1;
    candidate = `${baseName} ${index}`;
  }

  return candidate;
}

function openAddGroupDialog() {
  els.addGroupNameInput.value = "";
  els.addGroupDialog.classList.remove("hidden");
  requestAnimationFrame(() => els.addGroupNameInput.focus());
}

function closeAddGroupDialog() {
  els.addGroupDialog.classList.add("hidden");
  els.addGroupNameInput.value = "";
}

function scrollGroupsToBottom() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      els.groupsContainer.scrollTop = els.groupsContainer.scrollHeight;
    });
  });
}

async function addGroup(name) {
  appState.groups.push({
    id: uid("group"),
    name: uniqueGroupName(name),
    createdAt: new Date().toISOString()
  });
  appState.settings.viewMode = "group";

  await saveState();
  render();
  scrollGroupsToBottom();
}

async function submitAddGroup(event) {
  event.preventDefault();
  await addGroup(els.addGroupNameInput.value);
  closeAddGroupDialog();
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    hideMemoContextMenu();
    if (!event.target.closest(".font-size-control")) {
      closeInlineFontSizeMenus();
    }

    if (event.target.closest(".add-card")) return;

    const card = event.target.closest(".note-card");
    if (!card || event.target.closest(".card-actions, .inline-format-toolbar")) return;

    const noteId = card.dataset.noteId;
    if (!noteId) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    openNoteForPanelAndInlineEdit(card, event.target);
  }, true);

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest(".add-card");
    if (!addButton) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openCreatePanelFromAddButton(addButton);
  }, true);

  els.newGroupBtn.addEventListener("click", openAddGroupDialog);
  els.allViewBtn.addEventListener("click", async () => {
    appState.settings.viewMode = "all";
    await saveState();
    render();
  });
  els.groupViewBtn.addEventListener("click", async () => {
    appState.settings.viewMode = "group";
    await saveState();
    render();
  });
  els.calendarViewBtn.addEventListener("click", async () => {
    appState.settings.viewMode = "calendar";
    await saveState();
    render();
  });
  els.trashViewBtn.addEventListener("click", async () => {
    appState.settings.viewMode = appState.settings.viewMode === "trash" ? "group" : "trash";
    await saveState();
    render();
  });
  els.createdSortBtn.addEventListener("click", () => {
    if (appState.sortMode === "created") {
      appState.sortDirection = appState.sortDirection === "asc" ? "desc" : "asc";
    } else {
      appState.sortMode = "created";
      appState.sortDirection = "asc";
    }
    render();
  });
  els.titleSortBtn.addEventListener("click", () => {
    if (appState.sortMode === "title") {
      appState.titleSortStep = (appState.titleSortStep + 1) % 4;
    } else {
      appState.sortMode = "title";
      appState.titleSortStep = 0;
    }
    render();
  });
  els.importanceSortBtn.addEventListener("click", () => {
    if (appState.sortMode === "importance") {
      appState.sortDirection = appState.sortDirection === "asc" ? "desc" : "asc";
    } else {
      appState.sortMode = "importance";
      appState.sortDirection = "asc";
    }
    render();
  });
  els.searchInput.addEventListener("input", () => {
    appState.searchKeyword = els.searchInput.value;
    renderGroups();
  });
  els.cardSizeSlider.addEventListener("mousedown", (event) => event.stopPropagation());
  els.panelCloseBtn.addEventListener("click", () => closePanel(false));
  els.editPanelCloseBtn.addEventListener("click", () => closePanel(false));
  els.memoForm.addEventListener("submit", submitMemo);
  els.editMemoForm.addEventListener("submit", submitEditMemo);
  els.memoForm.addEventListener("input", () => {
    appState.formDirty = true;
  });
  els.groupPickerButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleGroupPicker();
  });
  els.groupSelect.addEventListener("change", () => {
    appState.selectedGroupId = els.groupSelect.value || null;
    appState.formDirty = true;
    renderGroupPicker(els.groupSelect.value);
  });
  els.editGroupPickerButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleEditGroupPicker();
  });
  els.editGroupSelect.addEventListener("change", () => {
    renderEditGroupPicker(els.editGroupSelect.value);
    editFormUserTouched = true;
    appState.formDirty = true;
  });
  els.editMemoForm.addEventListener("input", () => {
    editFormUserTouched = true;
    appState.formDirty = true;
    syncSelectedNotePreviewFromEditForm();
  });
  els.favoriteBtn.addEventListener("click", () => {
    formState.favorite = !formState.favorite;
    appState.formDirty = true;
    renderFormControls();
  });
  els.editFavoriteBtn.addEventListener("click", () => {
    editFormState.favorite = !editFormState.favorite;
    renderEditFormControls();
  });
  els.cancelCloseBtn.addEventListener("click", () => {
    els.confirmDialog.classList.add("hidden");
    appState.pendingClose = false;
  });
  els.confirmDialogCloseBtn.addEventListener("click", () => {
    els.confirmDialog.classList.add("hidden");
    appState.pendingClose = false;
  });
  els.confirmCloseBtn.addEventListener("click", () => {
    els.confirmDialog.classList.add("hidden");
    closePanel(true);
  });
  els.quitDialog.addEventListener("mousedown", (event) => {
    if (event.target === els.quitDialog) closeQuitDialog();
  });
  els.quitDialogCloseBtn.addEventListener("click", closeQuitDialog);
  els.closeMainOnlyBtn.addEventListener("click", () => {
    closeQuitDialog();
    window.wmn.close();
  });
  els.quitAppBtn.addEventListener("click", () => {
    closeQuitDialog();
    window.wmn.quit();
  });
  els.deleteGroupDialog.addEventListener("mousedown", (event) => {
    if (event.target === els.deleteGroupDialog) closeDeleteGroupDialog();
  });
  els.deleteGroupDialogCloseBtn.addEventListener("click", closeDeleteGroupDialog);
  els.cancelDeleteGroupBtn.addEventListener("click", closeDeleteGroupDialog);
  els.confirmDeleteGroupBtn.addEventListener("click", confirmDeleteGroup);
  els.deleteNoteDialog.addEventListener("mousedown", (event) => {
    if (event.target === els.deleteNoteDialog) closeDeleteNoteDialog();
  });
  els.deleteNoteDialogCloseBtn.addEventListener("click", closeDeleteNoteDialog);
  els.cancelDeleteNoteBtn.addEventListener("click", closeDeleteNoteDialog);
  els.confirmDeleteNoteBtn.addEventListener("click", confirmDeleteNote);
  els.emptyTrashDialog.addEventListener("mousedown", (event) => {
    if (event.target === els.emptyTrashDialog) closeEmptyTrashDialog();
  });
  els.emptyTrashDialogCloseBtn.addEventListener("click", closeEmptyTrashDialog);
  els.cancelEmptyTrashBtn.addEventListener("click", closeEmptyTrashDialog);
  els.confirmEmptyTrashBtn.addEventListener("click", confirmEmptyTrash);
  els.emptyTrashNoticeDialog.addEventListener("mousedown", (event) => {
    if (event.target === els.emptyTrashNoticeDialog) closeEmptyTrashNoticeDialog();
  });
  els.emptyTrashNoticeCloseBtn.addEventListener("click", closeEmptyTrashNoticeDialog);
  els.emptyTrashNoticeOkBtn.addEventListener("click", closeEmptyTrashNoticeDialog);
  els.addGroupDialog.addEventListener("mousedown", (event) => {
    if (event.target === els.addGroupDialog) closeAddGroupDialog();
  });
  els.addGroupForm.addEventListener("submit", submitAddGroup);
  els.addGroupDialogCloseBtn.addEventListener("click", closeAddGroupDialog);
  els.cancelAddGroupBtn.addEventListener("click", closeAddGroupDialog);
  els.settingsDialog.addEventListener("mousedown", (event) => {
    if (event.target === els.settingsDialog) closeSettingsDialog();
  });
  els.settingsDialogCloseBtn.addEventListener("click", closeSettingsDialog);
  els.widgetEnabledSetting?.addEventListener("change", async () => {
    appState.settings.widgetEnabled = els.widgetEnabledSetting.checked;
    await saveSettingsAndApplyWidget();
  });
  els.widgetAlwaysOnTopSetting?.addEventListener("change", async () => {
    appState.settings.widgetAlwaysOnTop = els.widgetAlwaysOnTopSetting.checked;
    await saveSettingsAndApplyWidget();
  });
  els.widgetNoteHeightSetting?.addEventListener("input", () => {
    const nextHeight = Number(els.widgetNoteHeightSetting.value);
    appState.settings.widgetNoteHeight = Number.isFinite(nextHeight) ? nextHeight : 104;
    renderSettingsControls();
    window.wmn.applyWidgetSettings?.(appState.settings);
  });
  els.widgetNoteHeightSetting?.addEventListener("change", async () => {
    const nextHeight = Number(els.widgetNoteHeightSetting.value);
    appState.settings.widgetNoteHeight = Number.isFinite(nextHeight) ? nextHeight : 104;
    await saveSettingsAndApplyWidget();
  });
  [els.widgetPositionRightSetting, els.widgetPositionLeftSetting].forEach((button) => {
    button?.addEventListener("click", async () => {
      appState.settings.widgetPosition = button.dataset.position === "left" ? "left" : "right";
      await saveSettingsAndApplyWidget();
    });
  });
  els.widgetDisplaySetting?.addEventListener("change", async () => {
    const selectedId = Number(els.widgetDisplaySetting.value);
    appState.settings.widgetDisplayId = Number.isFinite(selectedId) ? selectedId : null;
    await saveSettingsAndApplyWidget();
  });
  els.exportDataBtn?.addEventListener("click", exportDataFromSettings);
  els.importDataBtn?.addEventListener("click", importDataFromSettings);
  els.updateAppBtn?.addEventListener("click", installUpdateFromSettings);
  els.minimizeBtn.addEventListener("click", window.wmn.minimize);
  els.maximizeBtn.addEventListener("click", window.wmn.maximize);
  els.closeWindowBtn.addEventListener("click", openQuitDialog);
  els.settingsBtn.addEventListener("click", openSettingsDialog);

  document.addEventListener("keydown", (event) => {
    if (handleInlineNoteKeydown(event)) return;
    if (event.key === "Escape" && !els.quitDialog.classList.contains("hidden")) {
      closeQuitDialog();
      return;
    }
    if (event.key === "Escape" && !els.deleteGroupDialog.classList.contains("hidden")) {
      closeDeleteGroupDialog();
      return;
    }
    if (event.key === "Escape" && !els.deleteNoteDialog.classList.contains("hidden")) {
      closeDeleteNoteDialog();
      return;
    }
    if (event.key === "Escape" && !els.emptyTrashDialog.classList.contains("hidden")) {
      closeEmptyTrashDialog();
      return;
    }
    if (event.key === "Escape" && !els.emptyTrashNoticeDialog.classList.contains("hidden")) {
      closeEmptyTrashNoticeDialog();
      return;
    }
    if (event.key === "Escape" && !els.addGroupDialog.classList.contains("hidden")) {
      closeAddGroupDialog();
      return;
    }
    if (event.key === "Escape" && els.importConfirmDialog && !els.importConfirmDialog.classList.contains("hidden")) {
      return;
    }
    if (event.key === "Escape" && !els.settingsDialog.classList.contains("hidden")) {
      closeSettingsDialog();
      return;
    }
    if (event.key === "Escape" && els.groupPicker.classList.contains("open")) {
      closeGroupPicker();
      return;
    }
    if (event.key === "Escape" && els.editGroupPicker.classList.contains("open")) {
      closeEditGroupPicker();
      return;
    }
    if (event.key === "Escape" && appState.panelOpen) closePanel(false);
    if (event.ctrlKey && event.key.toLowerCase() === "n") {
      event.preventDefault();
      openCreatePanel(appState.groups[0]?.id);
    }
  });

  els.groupsContainer.addEventListener("pointerdown", (event) => {
    handleNoteCardSelection(event);
  }, true);

  els.groupsContainer.addEventListener("click", (event) => {
    handleNoteCardSelection(event);
  });

  document.addEventListener("mousedown", (event) => {
    if (event.target.closest(".memo-context-menu")) return;
    hideMemoContextMenu();

    if (!els.groupPicker.contains(event.target)) {
      closeGroupPicker();
    }
    if (!els.editGroupPicker.contains(event.target)) {
      closeEditGroupPicker();
    }

    const editingCard = appState.inlineEditingNoteId
      ? document.querySelector(`.note-card[data-note-id="${appState.inlineEditingNoteId}"]`)
      : null;
    if (editingCard && !editingCard.contains(event.target)) {
      finishInlineNoteEdit(editingCard, { noRender: Boolean(event.target.closest(".note-card")) });
    }

  });

  document.addEventListener("contextmenu", (event) => {
    const richEditor = event.target.closest(".form-rich-editor");
    if (richEditor) {
      showEditorContextMenu(event, richEditor);
      return;
    }

    const card = event.target.closest(".note-card");
    if (!card || event.target.closest(".card-actions, .inline-format-toolbar")) return;
    showMemoContextMenu(event, card);
  }, true);

  document.addEventListener("mouseup", (event) => {
    if (event.button !== 2) return;
    const richEditor = event.target.closest(".form-rich-editor");
    if (richEditor) {
      showEditorContextMenu(event, richEditor);
      return;
    }

    const card = event.target.closest(".note-card");
    if (!card || event.target.closest(".card-actions, .inline-format-toolbar")) return;
    showMemoContextMenu(event, card);
  }, true);

  document.addEventListener("selectionchange", saveInlineSelection);
  document.addEventListener("selectionchange", updateAllFormatToolbarStates);
  document.addEventListener("keyup", () => {
    saveInlineSelection();
    updateAllFormatToolbarStates();
  });
  document.addEventListener("mouseup", () => {
    saveInlineSelection();
    updateAllFormatToolbarStates();
  });
}

async function init() {
  const data = await window.wmn.loadData();
  appState.groups = data.groups || [];
  appState.notes = data.notes || [];
  appState.settings = normalizeSettings(data.settings);
  const noteContentWasNormalized = normalizeStoredNoteContent();
  syncCollapsedGroupsFromSettings();
  window.wmn.onDataChanged((nextData) => {
    appState.groups = nextData.groups || [];
    appState.notes = nextData.notes || [];
    appState.settings = normalizeSettings(nextData.settings);
    normalizeStoredNoteContent();
    syncCollapsedGroupsFromSettings();
    render();
  });
  window.wmn.onOpenSettings?.(() => openSettingsDialog());
  window.wmn.onUpdateStatus?.(renderUpdateStatus);
  bindEvents();
  initPanelResize();
  initCardSizeControl();
  renderFormFormatToolbars();
  bindRichEditor(els.contentInput);
  bindRichEditor(els.editContentInput);
  await renderWidgetDisplayOptions();
  await loadUpdateStatus();
  render();
  if (noteContentWasNormalized) saveState();
  setInterval(ensureCreateControlsRendered, 250);
  setInterval(ensureEditControlsRendered, 250);
  setInterval(() => syncEditFormFromSelectedNote(false), 250);
}

init();
