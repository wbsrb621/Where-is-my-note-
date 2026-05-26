const widgetList = document.getElementById("widgetList");
const widgetPager = document.getElementById("widgetPager");
const widgetPrevPageBtn = document.getElementById("widgetPrevPageBtn");
const widgetNextPageBtn = document.getElementById("widgetNextPageBtn");
const openMainBtn = document.getElementById("openMainBtn");
const widgetCommandDrawer = document.querySelector(".widget-command-drawer");
const widgetDrawerTrigger = document.querySelector(".widget-drawer-trigger");
const widgetSettingsBtn = document.getElementById("widgetSettingsBtn");
const widgetQuitBtn = document.getElementById("widgetQuitBtn");
const widgetQuitMenu = document.getElementById("widgetQuitMenu");
const hideWidgetBtn = document.getElementById("hideWidgetBtn");
const quitAppFromWidgetBtn = document.getElementById("quitAppFromWidgetBtn");
const importanceColors = ["#b8b8b8", "#9ad86f", "#e8d83d", "#f0a33d", "#ef7734", "#e6453d"];

let appData = {
  groups: [],
  notes: [],
  settings: {}
};

const defaultSettings = {
  widgetNoteHeight: 104,
  widgetPosition: "right"
};

let editingNoteId = null;
let draggedNoteId = null;
let widgetDragState = null;
let commandCloseTimer = null;
let widgetMouseIgnoring = false;
let currentWidgetPage = 0;
let currentPinnedNotes = [];
let dragPageTimer = null;
let dragPageDirection = 0;

const dropGuide = document.createElement("div");
dropGuide.className = "drop-guide";

let widgetSelectionRange = null;

function normalizeWidgetSettings(settings = {}) {
  return {
    ...defaultSettings,
    ...settings,
    widgetNoteHeight: Math.max(80, Math.min(220, Number(settings.widgetNoteHeight) || 104)),
    widgetPosition: settings.widgetPosition === "left" ? "left" : "right"
  };
}

function applyWidgetVisualSettings(settings = {}) {
  const normalized = normalizeWidgetSettings(settings);
  const contentLines = Math.max(2, Math.floor((normalized.widgetNoteHeight - 46) / 14.5));
  document.documentElement.style.setProperty("--widget-note-height", `${normalized.widgetNoteHeight}px`);
  document.documentElement.style.setProperty("--widget-content-lines", String(contentLines));
  document.body.classList.toggle("widget-position-left", normalized.widgetPosition === "left");
}

function getWidgetPageSize() {
  const noteHeight = normalizeWidgetSettings(appData.settings).widgetNoteHeight;
  const noteGap = 10;
  const listPadding = 8;
  const pagerHeight = currentPinnedNotes.length > 0 ? 36 : 0;
  const commandHeight = 34;
  const availableHeight = Math.max(80, window.innerHeight - pagerHeight - commandHeight - listPadding);
  return Math.max(1, Math.floor((availableHeight + noteGap) / (noteHeight + noteGap)));
}

function getWidgetPageCount(notes = currentPinnedNotes) {
  return Math.max(1, Math.ceil(notes.length / getWidgetPageSize()));
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function clampWidgetPage(notes = currentPinnedNotes) {
  const pageCount = getWidgetPageCount(notes);
  currentWidgetPage = Math.max(0, Math.min(currentWidgetPage, pageCount - 1));
  return pageCount;
}

function setWidgetMouseIgnoring(shouldIgnore) {
  if (widgetMouseIgnoring === shouldIgnore) return;
  widgetMouseIgnoring = shouldIgnore;
  window.wmn.setWidgetIgnoreMouseEvents?.(shouldIgnore);
}

function isWidgetInteractiveTarget(target) {
  return Boolean(target?.closest?.(
    ".widget-note, .widget-pager, .widget-add-note-button, .widget-command-drawer, .widget-command-panel, .widget-quit-menu, .widget-font-size-menu"
  ));
}

function updateWidgetMousePassthrough(event) {
  if (widgetDragState || draggedNoteId) {
    setWidgetMouseIgnoring(false);
    return;
  }

  const target = document.elementFromPoint(event.clientX, event.clientY);
  setWidgetMouseIgnoring(!isWidgetInteractiveTarget(target));
}

function plainTextToHtml(value = "") {
  const wrapper = document.createElement("div");
  wrapper.textContent = value;
  return wrapper.innerHTML.replace(/\n/g, "<br>");
}

function sanitizeMemoHtml(value = "") {
  const template = document.createElement("template");
  template.innerHTML = value;
  const allowedTags = new Set(["B", "STRONG", "I", "EM", "U", "S", "STRIKE", "DEL", "SPAN", "BR", "UL", "OL", "LI", "IMG"]);
  const allowedStyles = new Set(["font-weight", "font-style", "text-decoration", "font-size"]);

  template.content.querySelectorAll("*").forEach((node) => {
    if (!allowedTags.has(node.tagName)) {
      node.replaceWith(...node.childNodes);
      return;
    }

    [...node.attributes].forEach((attr) => {
      if (node.tagName === "IMG" && ["src", "alt"].includes(attr.name)) return;
      if (attr.name === "style") {
        const kept = attr.value
          .split(";")
          .map((item) => item.trim())
          .filter((item) => allowedStyles.has(item.split(":")[0]?.trim().toLowerCase()))
          .join("; ");
        if (kept) node.setAttribute("style", kept);
        else node.removeAttribute("style");
        return;
      }
      node.removeAttribute(attr.name);
    });
  });

  return template.innerHTML;
}

function normalizeWidgetHtml(html = "") {
  return sanitizeMemoHtml(html)
    .replace(/<\/div>\s*<div>/gi, "")
    .replace(/<\/p>\s*<p>/gi, "")
    .replace(/<div>/gi, "")
    .replace(/<\/div>/gi, "")
    .replace(/<p>/gi, "")
    .replace(/<\/p>/gi, "");
}

function formatWidgetCreatedTime(value) {
  const created = new Date(value);
  if (Number.isNaN(created.getTime())) return "";

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

function formatWidgetPeriod(note) {
  const startDate = note?.startDate || "";
  const endDate = note?.endDate || "";
  if (!startDate && !endDate) return "";
  if (startDate && endDate) return `${startDate} ~ ${endDate}`;
  return startDate || endDate;
}

function setWidgetPinButtonIcon(button, pinned) {
  button.textContent = "";
  button.classList.add("widget-pin-icon-button");
  button.classList.toggle("pin-icon-on", Boolean(pinned));
  button.classList.toggle("pin-icon-off", !pinned);
}

function setWidgetFavoriteButtonIcon(button, favorite) {
  button.textContent = "";
  button.classList.add("widget-favorite-icon-button");
  button.classList.toggle("favorite-icon-on", Boolean(favorite));
  button.classList.toggle("favorite-icon-off", !favorite);
}

function setWidgetContent(content, note) {
  content.innerHTML = note.contentHtml
    ? normalizeWidgetHtml(note.contentHtml)
    : plainTextToHtml(note.content || "");
}

function saveWidgetSelection() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const content = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
    ? range.commonAncestorContainer.closest?.(".editable-content")
    : range.commonAncestorContainer.parentElement?.closest?.(".editable-content");
  if (!content) return;

  widgetSelectionRange = range.cloneRange();
}

function restoreWidgetSelection(content) {
  const selection = window.getSelection();
  if (!selection) return;

  content.focus();
  selection.removeAllRanges();
  if (
    widgetSelectionRange
    && content.contains(widgetSelectionRange.startContainer)
    && content.contains(widgetSelectionRange.endContainer)
  ) {
    selection.addRange(widgetSelectionRange);
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(content);
  range.collapse(false);
  selection.addRange(range);
  widgetSelectionRange = range.cloneRange();
}

function execWidgetFormat(content, command, value = null) {
  restoreWidgetSelection(content);
  document.execCommand("styleWithCSS", false, true);
  document.execCommand(command, false, value);
  saveWidgetSelection();
}

function applyWidgetFontSize(content, size) {
  restoreWidgetSelection(content);
  document.execCommand("fontSize", false, "7");
  content.querySelectorAll("font[size='7']").forEach((font) => {
    const span = document.createElement("span");
    span.style.fontSize = `${size}px`;
    span.innerHTML = font.innerHTML;
    font.replaceWith(span);
  });
  saveWidgetSelection();
}

function closeWidgetFontMenus() {
  document.querySelectorAll(".widget-font-size-menu:not(.hidden)").forEach((menu) => {
    menu.classList.add("hidden");
  });
}

function createWidgetToolbar(content) {
  const toolbar = document.createElement("div");
  toolbar.className = "widget-format-toolbar";

  const sizeWrap = document.createElement("div");
  sizeWrap.className = "widget-font-size-control";
  const sizeButton = document.createElement("button");
  sizeButton.type = "button";
  sizeButton.textContent = "T";
  sizeButton.title = "글자 크기";
  sizeButton.addEventListener("mousedown", (event) => {
    saveWidgetSelection();
    event.preventDefault();
  });
  sizeButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const menu = sizeWrap.querySelector(".widget-font-size-menu");
    const willOpen = menu.classList.contains("hidden");
    closeWidgetFontMenus();
    menu.classList.toggle("hidden", !willOpen);
  });

  const sizeMenu = document.createElement("div");
  sizeMenu.className = "widget-font-size-menu hidden";
  for (let size = 4; size <= 72; size += 1) {
    const item = document.createElement("button");
    item.type = "button";
    item.textContent = String(size);
    item.addEventListener("mousedown", (event) => event.preventDefault());
    item.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      applyWidgetFontSize(content, size);
      sizeMenu.classList.add("hidden");
    });
    sizeMenu.append(item);
  }
  sizeWrap.append(sizeButton, sizeMenu);
  toolbar.append(sizeWrap);

  [
    ["B", "굵게", "bold", "bold"],
    ["I", "기울임", "italic", "italic"],
    ["U", "밑줄", "underline", "underline"],
    ["ab", "취소선", "strikeThrough", "strike"],
    ["≡", "목록", "insertUnorderedList", ""]
  ].forEach(([label, title, command, className]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.title = title;
    if (className) button.classList.add(className);
    button.addEventListener("mousedown", (event) => {
      saveWidgetSelection();
      event.preventDefault();
    });
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeWidgetFontMenus();
      execWidgetFormat(content, command);
    });
    toolbar.append(button);
  });

  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageInput.className = "widget-image-input";
  const imageButton = document.createElement("button");
  imageButton.type = "button";
  imageButton.textContent = "▧";
  imageButton.title = "이미지";
  imageButton.addEventListener("mousedown", (event) => event.preventDefault());
  imageButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    imageInput.click();
  });
  imageInput.addEventListener("change", () => {
    const file = imageInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      execWidgetFormat(content, "insertImage", reader.result);
      imageInput.value = "";
    });
    reader.readAsDataURL(file);
  });
  toolbar.append(imageButton, imageInput);

  return toolbar;
}

function renderPinnedNotes(notes) {
  currentPinnedNotes = [...notes];
  const pageSize = getWidgetPageSize();
  const pageCount = clampWidgetPage(currentPinnedNotes);
  const pageStart = currentWidgetPage * pageSize;
  const visibleNotes = currentPinnedNotes.slice(pageStart, pageStart + pageSize);

  widgetList.innerHTML = "";
  widgetPager.classList.toggle("hidden", pageCount <= 1);
  widgetPrevPageBtn.disabled = currentWidgetPage === 0;
  widgetNextPageBtn.disabled = currentWidgetPage >= pageCount - 1;

  const addButton = document.createElement("button");
  addButton.id = "widgetAddNoteBtn";
  addButton.className = "widget-add-note-button";
  addButton.type = "button";
  addButton.title = "새 메모 추가";
  addButton.textContent = "+";
  addButton.addEventListener("click", async (event) => {
    event.preventDefault();
    await addBlankWidgetNote();
  });
  widgetList.append(addButton);

  visibleNotes.forEach((note) => {
    const card = document.createElement("article");
    card.className = "widget-note";
    card.dataset.noteId = note.id;
    card.draggable = editingNoteId !== note.id;
    card.style.background = note.memoColor || "rgba(255, 255, 255, 0.94)";
    card.style.color = note.textColor || "#333333";
    card.style.setProperty("--importance-color", importanceColors[note.importance || 0]);
    card.classList.toggle("editing", editingNoteId === note.id);

    bindDragEvents(card);

    const actions = document.createElement("div");
    actions.className = "widget-actions";

    const favoriteButton = document.createElement("button");
    favoriteButton.type = "button";
    favoriteButton.title = "Favorite";
    setWidgetFavoriteButtonIcon(favoriteButton, note.favorite);
    favoriteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      updateNote(note.id, { favorite: !note.favorite });
    });

    const pinButton = document.createElement("button");
    pinButton.type = "button";
    pinButton.title = "Pin";
    setWidgetPinButtonIcon(pinButton, note.pinned);
    pinButton.addEventListener("click", (event) => {
      event.stopPropagation();
      updateNote(note.id, { pinned: !note.pinned });
    });

    const title = document.createElement("h3");
    title.className = "editable-title";
    title.textContent = note.title || "Untitled";
    title.addEventListener("click", () => startEditing(card, title));
    title.addEventListener("mousedown", (event) => {
      if (editingNoteId === note.id) event.stopPropagation();
    });
    title.addEventListener("keydown", (event) => handleEditableKeydown(event, note.id, card));

    const content = document.createElement("div");
    content.className = "editable-content";
    setWidgetContent(content, note);
    content.addEventListener("click", () => startEditing(card, content));
    content.addEventListener("mousedown", (event) => {
      if (editingNoteId === note.id) event.stopPropagation();
    });
    content.addEventListener("keydown", (event) => handleEditableKeydown(event, note.id, card));
    content.addEventListener("keyup", saveWidgetSelection);
    content.addEventListener("mouseup", saveWidgetSelection);
    content.addEventListener("input", saveWidgetSelection);

    const dates = document.createElement("div");
    dates.className = "widget-note-dates";
    const periodText = formatWidgetPeriod(note);
    if (periodText) {
      const period = document.createElement("span");
      period.className = "widget-note-period";
      period.textContent = periodText;
      dates.append(period);
    }
    const createdTime = document.createElement("span");
    createdTime.className = "widget-note-created-time";
    createdTime.textContent = formatWidgetCreatedTime(note.createdAt || note.updatedAt);
    dates.append(createdTime);

    const toolbar = createWidgetToolbar(content);

    actions.append(favoriteButton, pinButton);
    card.append(actions, title, content, dates, toolbar);
    widgetList.append(card);
  });
}

async function addBlankWidgetNote() {
  finishCurrentEditing();

  const now = new Date().toISOString();
  const group = appData.groups[0] || null;
  const note = {
    id: uid("note"),
    groupId: group?.id || null,
    title: "",
    content: "",
    contentHtml: "",
    importance: 0,
    favorite: false,
    pinned: true,
    textColor: "#333333",
    memoColor: "#ffffff",
    startDate: "",
    endDate: "",
    createdAt: now,
    updatedAt: now
  };

  appData.notes.push(note);
  await window.wmn.saveData(appData);
  const pinnedNotes = appData.notes.filter((item) => item.pinned);
  currentWidgetPage = getWidgetPageCount(pinnedNotes) - 1;
  renderPinnedNotes(pinnedNotes);
}

function bindDragEvents(card) {
  card.addEventListener("dragstart", (event) => {
    if (editingNoteId || event.target.closest(".widget-actions, .editable-title, .editable-content")) {
      event.preventDefault();
      return;
    }

    draggedNoteId = card.dataset.noteId;
    card.classList.add("dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", draggedNoteId);
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    draggedNoteId = null;
    clearDragPageTimer();
    dropGuide.remove();
  });
}

widgetList.addEventListener("dragover", (event) => {
  if (!draggedNoteId) return;
  event.preventDefault();

  const afterElement = getDragAfterElement(event.clientY);
  if (afterElement) {
    widgetList.insertBefore(dropGuide, afterElement);
  } else {
    widgetList.append(dropGuide);
  }
});

widgetList.addEventListener("drop", async (event) => {
  if (!draggedNoteId) return;
  event.preventDefault();

  const nextCard = dropGuide.nextElementSibling?.classList.contains("widget-note")
    ? dropGuide.nextElementSibling
    : null;
  const pageSize = getWidgetPageSize();
  const visibleCount = widgetList.querySelectorAll(".widget-note").length;
  const nextPageNote = currentPinnedNotes[currentWidgetPage * pageSize + visibleCount] || null;
  const beforeNoteId = nextCard?.dataset.noteId || nextPageNote?.id || null;
  dropGuide.remove();

  await reorderPinnedNotes(draggedNoteId, beforeNoteId);
  draggedNoteId = null;
  clearDragPageTimer();
});

function finishCurrentEditing() {
  if (!editingNoteId) return;

  const editingCard = widgetList.querySelector(`.widget-note[data-note-id="${editingNoteId}"]`);
  if (!editingCard) return;

  finishEditing(editingNoteId, editingCard);
}

document.addEventListener("mousedown", (event) => {
  if (!widgetQuitMenu.classList.contains("hidden") && !widgetQuitMenu.contains(event.target) && event.target !== widgetQuitBtn) {
    hideWidgetQuitMenu();
  }

  if (!editingNoteId) return;

  const editingCard = widgetList.querySelector(`.widget-note[data-note-id="${editingNoteId}"]`);
  if (!editingCard || editingCard.contains(event.target)) return;

  finishCurrentEditing();
});

window.addEventListener("blur", finishCurrentEditing);

function getDragAfterElement(pointerY) {
  const cards = [...widgetList.querySelectorAll(".widget-note:not(.dragging)")];

  return cards.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = pointerY - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null }
  ).element;
}

async function reorderPinnedNotes(noteId, beforeNoteId) {
  const pinnedNotes = appData.notes.filter((note) => note.pinned);
  const movingNote = pinnedNotes.find((note) => note.id === noteId);
  if (!movingNote) return;

  const orderedPinned = pinnedNotes.filter((note) => note.id !== noteId);
  const insertIndex = beforeNoteId
    ? orderedPinned.findIndex((note) => note.id === beforeNoteId)
    : orderedPinned.length;

  orderedPinned.splice(insertIndex < 0 ? orderedPinned.length : insertIndex, 0, movingNote);

  let pinnedIndex = 0;
  appData.notes = appData.notes.map((note) => {
    if (!note.pinned) return note;
    return orderedPinned[pinnedIndex++];
  });

  await window.wmn.saveData(appData);
  renderPinnedNotes(appData.notes.filter((note) => note.pinned));
}

function goToWidgetPage(delta) {
  const pageCount = clampWidgetPage();
  const nextPage = Math.max(0, Math.min(pageCount - 1, currentWidgetPage + delta));
  if (nextPage === currentWidgetPage) return;
  currentWidgetPage = nextPage;
  editingNoteId = null;
  renderPinnedNotes(currentPinnedNotes);
}

function clearDragPageTimer() {
  clearTimeout(dragPageTimer);
  dragPageTimer = null;
  dragPageDirection = 0;
}

function showDropGuideOnCurrentPage(edge = "end") {
  const cards = widgetList.querySelectorAll(".widget-note:not(.dragging)");
  if (edge === "start" && cards[0]) {
    widgetList.insertBefore(dropGuide, cards[0]);
    return;
  }
  widgetList.append(dropGuide);
}

function scheduleDragPageTurn(direction) {
  if (!draggedNoteId) return;
  const pageCount = clampWidgetPage();
  const nextPage = currentWidgetPage + direction;
  if (nextPage < 0 || nextPage >= pageCount) return;
  if (dragPageTimer && dragPageDirection === direction) return;

  clearDragPageTimer();
  dragPageDirection = direction;
  dragPageTimer = setTimeout(() => {
    if (!draggedNoteId) return;
    currentWidgetPage = nextPage;
    renderPinnedNotes(currentPinnedNotes);
    showDropGuideOnCurrentPage(direction > 0 ? "start" : "end");
    clearDragPageTimer();
  }, 500);
}

function startEditing(card, target) {
  setWidgetMouseIgnoring(false);
  if (editingNoteId === card.dataset.noteId && target.isContentEditable) {
    saveWidgetSelection();
    return;
  }

  editingNoteId = card.dataset.noteId;
  card.draggable = false;
  card.classList.add("editing");
  target.contentEditable = "true";
  target.spellcheck = false;
  target.focus();
  closeWidgetFontMenus();

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(target);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
  widgetSelectionRange = range.cloneRange();
}

function handleEditableKeydown(event, noteId, card) {
  if (event.key === "Escape") {
    event.preventDefault();
    editingNoteId = null;
    renderPinnedNotes(appData.notes.filter((note) => note.pinned));
    return;
  }

  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    finishEditing(noteId, card);
  }
}

async function finishEditing(noteId, card) {
  if (editingNoteId !== noteId) return;

  const title = card.querySelector(".editable-title");
  const content = card.querySelector(".editable-content");
  title.contentEditable = "false";
  content.contentEditable = "false";
  editingNoteId = null;
  widgetSelectionRange = null;

  await updateNote(noteId, {
    title: title.textContent.trim() || "Untitled",
    content: content.textContent.trim(),
    contentHtml: normalizeWidgetHtml(content.innerHTML)
  });
}

async function updateNote(noteId, patch) {
  const now = new Date().toISOString();
  appData.notes = appData.notes.map((note) => {
    if (note.id !== noteId) return note;
    return { ...note, ...patch, updatedAt: now };
  });

  await window.wmn.saveData(appData);

  if (patch.pinned === false) {
    editingNoteId = null;
  }

  renderPinnedNotes(appData.notes.filter((note) => note.pinned));
}

window.wmn.onPinnedNotes((notes) => {
  appData.notes = appData.notes.map((note) => {
    const changed = notes.find((item) => item.id === note.id);
    return changed || note;
  });

  if (editingNoteId && !notes.some((note) => note.id === editingNoteId)) {
    editingNoteId = null;
  }

  renderPinnedNotes(notes);
});

window.wmn.onWidgetSettings?.((settings) => {
  appData.settings = normalizeWidgetSettings(settings);
  applyWidgetVisualSettings(appData.settings);
  renderPinnedNotes(currentPinnedNotes);
});

window.wmn.loadData().then((data) => {
  appData = {
    groups: data.groups || [],
    notes: data.notes || [],
    settings: normalizeWidgetSettings(data.settings)
  };
  applyWidgetVisualSettings(appData.settings);
  renderPinnedNotes(appData.notes.filter((note) => note.pinned));
  setWidgetMouseIgnoring(true);
});

function updateWidgetCommandDirection(bounds = null) {
  if (!widgetCommandDrawer || !widgetDrawerTrigger) return;

  const rect = widgetCommandDrawer.getBoundingClientRect();
  const expandedHeight = 142;
  const workArea = bounds?.workArea;
  const screenBottom = bounds && workArea
    ? bounds.y + rect.top + expandedHeight
    : rect.top + expandedHeight;
  const bottomLimit = workArea
    ? workArea.y + workArea.height - 10
    : window.innerHeight - 8;
  const shouldOpenLeft = screenBottom > bottomLimit;
  widgetCommandDrawer.classList.toggle("open-left", shouldOpenLeft);
  widgetDrawerTrigger.textContent = shouldOpenLeft ? "◂" : "▾";
}

async function refreshWidgetCommandDirection() {
  const bounds = await window.wmn.getWidgetBounds();
  updateWidgetCommandDirection(bounds);
}

function getWidgetMoveMetrics() {
  const firstNote = widgetList.querySelector(".widget-note");
  const topTarget = firstNote || widgetCommandDrawer;
  const bottomTarget = widgetDrawerTrigger || widgetCommandDrawer;
  const topOffset = topTarget?.getBoundingClientRect().top ?? 0;
  const bottomOffset = bottomTarget?.getBoundingClientRect().bottom ?? window.innerHeight;

  return {
    topOffset,
    bottomOffset,
    margin: 10
  };
}

function openWidgetCommandDrawer() {
  if (!widgetCommandDrawer) return;
  clearTimeout(commandCloseTimer);
  commandCloseTimer = null;
  widgetCommandDrawer.classList.add("menu-open");
  refreshWidgetCommandDirection();
}

function scheduleCloseWidgetCommandDrawer() {
  if (!widgetCommandDrawer) return;
  clearTimeout(commandCloseTimer);
  commandCloseTimer = setTimeout(() => {
    widgetCommandDrawer.classList.remove("menu-open");
    commandCloseTimer = null;
  }, 800);
}

function hideWidgetQuitMenu() {
  widgetQuitMenu.classList.add("hidden");
}

function toggleWidgetQuitMenu() {
  widgetQuitMenu.classList.toggle("hidden");
  setWidgetMouseIgnoring(false);
}

openMainBtn.addEventListener("click", () => {
  window.wmn.openMain();
});

widgetCommandDrawer.addEventListener("mouseenter", openWidgetCommandDrawer);
widgetCommandDrawer.addEventListener("mouseleave", scheduleCloseWidgetCommandDrawer);
widgetCommandDrawer.addEventListener("focusin", openWidgetCommandDrawer);
widgetCommandDrawer.addEventListener("focusout", () => {
  requestAnimationFrame(() => {
    if (!widgetCommandDrawer.contains(document.activeElement)) {
      scheduleCloseWidgetCommandDrawer();
    }
  });
});
window.addEventListener("resize", refreshWidgetCommandDirection);
window.addEventListener("resize", () => renderPinnedNotes(currentPinnedNotes));
window.addEventListener("mousemove", updateWidgetMousePassthrough);
window.addEventListener("mouseleave", () => setWidgetMouseIgnoring(true));
window.addEventListener("blur", () => setWidgetMouseIgnoring(true));
window.addEventListener("dragend", clearDragPageTimer);
requestAnimationFrame(refreshWidgetCommandDirection);

widgetPrevPageBtn.addEventListener("click", () => goToWidgetPage(-1));
widgetNextPageBtn.addEventListener("click", () => goToWidgetPage(1));
widgetPrevPageBtn.addEventListener("dragover", (event) => {
  if (!draggedNoteId) return;
  event.preventDefault();
  scheduleDragPageTurn(-1);
});
widgetNextPageBtn.addEventListener("dragover", (event) => {
  if (!draggedNoteId) return;
  event.preventDefault();
  scheduleDragPageTurn(1);
});
widgetPager.addEventListener("dragleave", (event) => {
  if (widgetPager.contains(event.relatedTarget)) return;
  clearDragPageTimer();
});

widgetDrawerTrigger.addEventListener("pointerdown", async (event) => {
  event.preventDefault();
  event.stopPropagation();

  const bounds = await window.wmn.getWidgetBounds();
  if (!bounds) return;

  widgetDragState = {
    pointerId: event.pointerId,
    startScreenY: event.screenY,
    startY: bounds.y,
    metrics: getWidgetMoveMetrics()
  };
  setWidgetMouseIgnoring(false);
  widgetDrawerTrigger.setPointerCapture(event.pointerId);
  document.body.classList.add("widget-position-dragging");
  openWidgetCommandDrawer();
  updateWidgetCommandDirection(bounds);
});

widgetDrawerTrigger.addEventListener("pointermove", (event) => {
  if (!widgetDragState || widgetDragState.pointerId !== event.pointerId) return;

  const deltaY = event.screenY - widgetDragState.startScreenY;
  window.wmn.moveWidgetToY(widgetDragState.startY + deltaY, widgetDragState.metrics)
    .then((bounds) => {
      if (!bounds) return;
      updateWidgetCommandDirection(bounds);
    });
});

function stopWidgetPositionDrag(event) {
  if (!widgetDragState) return;
  if (event?.pointerId !== undefined && widgetDragState.pointerId !== event.pointerId) return;

  if (event?.pointerId !== undefined && widgetDrawerTrigger.hasPointerCapture(event.pointerId)) {
    widgetDrawerTrigger.releasePointerCapture(event.pointerId);
  }
  widgetDragState = null;
  document.body.classList.remove("widget-position-dragging");
  refreshWidgetCommandDirection();
  setWidgetMouseIgnoring(false);
}

widgetDrawerTrigger.addEventListener("pointerup", stopWidgetPositionDrag);
widgetDrawerTrigger.addEventListener("pointercancel", stopWidgetPositionDrag);

widgetSettingsBtn.addEventListener("click", () => {
  window.wmn.openSettings();
});

widgetQuitBtn.addEventListener("click", async () => {
  toggleWidgetQuitMenu();
});

hideWidgetBtn.addEventListener("click", async () => {
  appData.settings = {
    ...appData.settings,
    widgetEnabled: false
  };
  hideWidgetQuitMenu();
  await window.wmn.saveData(appData);
  await window.wmn.applyWidgetSettings(appData.settings);
});

quitAppFromWidgetBtn.addEventListener("click", async () => {
  hideWidgetQuitMenu();
  const shouldQuit = await window.wmn.confirmQuit();
  if (shouldQuit) {
    window.wmn.quit();
  }
});
