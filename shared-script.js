// Firebase 초기화
const firebaseConfig = {
  apiKey: "AIzaSyDJqgVk4L_mZ0PwejXe5oH3mAhfqM0y3_c",
  authDomain: "super-cool-memo.firebaseapp.com",
  databaseURL: "https://super-cool-memo-default-rtdb.firebaseio.com",
  projectId: "super-cool-memo",
  storageBucket: "super-cool-memo.firebasestorage.app",
  messagingSenderId: "372008441236",
  appId: "1:372008441236:web:f9769fce8a5a3a6a49eb81",
  measurementId: "G-L3T7LDXT1N"
};

// 만약 위 설정으로 안 되면, 당신의 Firebase 설정을 여기 붙여넣기

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const memoRef = database.ref('shared-memo');

// UI 요소
const memoInput = document.getElementById("memoInput");
const noteTitle = document.getElementById("noteTitle");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");
const deleteBtn = document.getElementById("deleteBtn");
const status = document.getElementById("status");
const connectionIndicator = document.getElementById("connectionIndicator");
const connectionText = document.getElementById("connectionText");

let isUpdatingFromServer = false;
let saveTimer = null;

function updateStatus(message) {
  status.textContent = message;
}

function updateConnectionStatus(connected) {
  if (connected) {
    connectionIndicator.classList.add("connected");
    connectionText.textContent = "연결됨";
  } else {
    connectionIndicator.classList.remove("connected");
    connectionText.textContent = "오프라인";
  }
}

// Firebase 연결 상태 감시
database.ref(".info/connected").on("value", (snap) => {
  if (snap.val() === true) {
    updateConnectionStatus(true);
    updateStatus("온라인 상태입니다");
  } else {
    updateConnectionStatus(false);
    updateStatus("오프라인입니다");
  }
});

// 공유 메모 실시간 동기화
memoRef.on("value", (snapshot) => {
  const data = snapshot.val();
  if (data) {
    isUpdatingFromServer = true;
    
    noteTitle.value = data.title || "";
    memoInput.value = data.content || "";
    
    isUpdatingFromServer = false;
    updateStatus("동기화 완료");
  }
});

// 메모 입력 감시
noteTitle.addEventListener("input", () => {
  if (!isUpdatingFromServer) {
    updateStatus("입력 중...");
    queueSave();
  }
});

memoInput.addEventListener("input", () => {
  if (!isUpdatingFromServer) {
    updateStatus("입력 중...");
    queueSave();
  }
});

function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveToFirebase();
  }, 500);
}

function saveToFirebase() {
  memoRef.set({
    title: noteTitle.value.trim(),
    content: memoInput.value,
    lastUpdated: new Date().toISOString()
  })
  .then(() => {
    updateStatus("저장됨!");
  })
  .catch((error) => {
    console.error("저장 실패:", error);
    updateStatus("저장 실패: " + error.message);
  });
}

saveBtn.addEventListener("click", () => {
  saveToFirebase();
});

clearBtn.addEventListener("click", () => {
  if (confirm("현재 메모를 비우시겠어요?")) {
    noteTitle.value = "";
    memoInput.value = "";
    saveToFirebase();
    updateStatus("메모를 비웠어요");
  }
});

deleteBtn.addEventListener("click", () => {
  if (confirm("정말 모든 내용을 지우시겠어요? (다른 사람들도 볼 수 없게 됩니다)")) {
    memoRef.remove()
      .then(() => {
        noteTitle.value = "";
        memoInput.value = "";
        updateStatus("모든 내용을 지웠어요");
      })
      .catch((error) => {
        console.error("삭제 실패:", error);
        updateStatus("삭제 실패: " + error.message);
      });
  }
});

// 페이지 로드 시 초기 메모 로드
memoRef.once("value", (snapshot) => {
  if (!snapshot.val()) {
    updateStatus("새로운 공유 메모판입니다");
  }
});
