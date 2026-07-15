// Firebase 설정
// https://console.firebase.google.com 에서 프로젝트 생성 후 여기에 붙여넣기

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "YOUR_DATABASE_URL"
};

// Firebase 초기화 (이미 firebase.js에서 했으면 생략 가능)
firebase.initializeApp(firebaseConfig);

// Realtime Database 참조
const database = firebase.database();
const memoRef = database.ref('shared-memo');

export { memoRef };
