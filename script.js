const memoInput = document.getElementById("memoInput");
const noteTitle = document.getElementById("noteTitle");
const saveBtn = document.getElementById("saveBtn");
const deleteBtn = document.getElementById("deleteBtn");
const clearBtn = document.getElementById("clearBtn");
const newNoteBtn = document.getElementById("newNoteBtn");
const noteList = document.getElementById("noteList");
const status = document.getElementById("status");

const STORAGE_KEY = "hip-memo-notes";
let notes = [];
let currentNoteId = null;
let saveTimer = null;

function updateStatus(message) {
  status.textContent = message;
}

function getSafeStorage() {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getNoteById(id) {
  return notes.find((note) => note.id === id);
}

function generateTitle(content) {
  const firstLine = content.split(/\r?\n/)[0].trim();
  return firstLine || "새 메모";
}

function saveNotesToStorage() {
  const storage = getSafeStorage();
  if (!storage) {
    updateStatus("저장소를 사용할 수 없어요");
    return false;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(notes));
  return true;
}

function saveCurrentNote() {
  if (!currentNoteId) return;

  const note = getNoteById(currentNoteId);
  if (!note) return;

  note.title = noteTitle.value.trim() || generateTitle(memoInput.value);
  note.content = memoInput.value;
  note.updatedAt = new Date().toISOString();

  if (saveNotesToStorage()) {
    renderNoteList();
    updateStatus("저장 완료!");
  }
}

function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveCurrentNote();
  }, 400);
}

function renderNoteList() {
  if (!notes.length) {
    noteList.innerHTML = '<li class="empty-state">저장된 메모가 없어요</li>';
    return;
  }

  const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  noteList.innerHTML = "";

  sortedNotes.forEach((note) => {
    const item = document.createElement("li");
    item.className = `note-item ${note.id === currentNoteId ? "active" : ""}`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "note-button";
    button.innerHTML = `<strong>${escapeHtml(note.title || "새 메모")}</strong><span>${escapeHtml(formatTime(note.updatedAt))}</span>`;
    button.addEventListener("click", () => selectNote(note.id));

    item.appendChild(button);
    noteList.appendChild(item);
  });
}

function selectNote(id) {
  const note = getNoteById(id);
  if (!note) return;

  currentNoteId = id;
  noteTitle.value = note.title || "";
  memoInput.value = note.content || "";
  renderNoteList();
  updateStatus("메모를 불러왔어요");
}

function createNewNote() {
  if (currentNoteId) {
    saveCurrentNote();
  }

  const note = {
    id: createId(),
    title: "새 메모",
    content: "",
    updatedAt: new Date().toISOString(),
  };

  notes.unshift(note);
  currentNoteId = note.id;

  if (saveNotesToStorage()) {
    renderNoteList();
    selectNote(note.id);
    updateStatus("새 메모를 만들었어요");
  }
}

function deleteCurrentNote() {
  if (!currentNoteId) return;

  const targetIndex = notes.findIndex((note) => note.id === currentNoteId);
  if (targetIndex === -1) return;

  notes.splice(targetIndex, 1);

  if (!notes.length) {
    currentNoteId = null;
    noteTitle.value = "";
    memoInput.value = "";
    saveNotesToStorage();
    renderNoteList();
    updateStatus("모든 메모를 삭제했어요");
    return;
  }

  currentNoteId = notes[0].id;
  saveNotesToStorage();
  renderNoteList();
  selectNote(currentNoteId);
  updateStatus("메모를 삭제했어요");
}

function loadNotes() {
  const storage = getSafeStorage();
  const saved = storage ? storage.getItem(STORAGE_KEY) : null;

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        notes = parsed;
      }
    } catch (error) {
      notes = [];
    }
  }

  if (!notes.length) {
    createNewNote();
    return;
  }

  selectNote(notes[0].id);
}

noteTitle.addEventListener("input", () => {
  updateStatus("입력 중...");
  queueSave();
});

memoInput.addEventListener("input", () => {
  updateStatus("입력 중...");
  queueSave();
});

saveBtn.addEventListener("click", () => {
  saveCurrentNote();
});

deleteBtn.addEventListener("click", () => {
  deleteCurrentNote();
});

newNoteBtn.addEventListener("click", () => {
  createNewNote();
});

clearBtn.addEventListener("click", () => {
  if (!currentNoteId) return;

  const note = getNoteById(currentNoteId);
  if (!note) return;

  note.title = "새 메모";
  note.content = "";
  note.updatedAt = new Date().toISOString();

  noteTitle.value = "";
  memoInput.value = "";

  if (saveNotesToStorage()) {
    renderNoteList();
    updateStatus("현재 메모를 비웠어요");
  }
});

loadNotes();
