import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, set, serverTimestamp } from "firebase/database";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
export const firebaseAvailable = Boolean(config.apiKey && config.databaseURL && config.projectId && config.appId);
let database;
function getBoardDatabase() {
  if (!firebaseAvailable) throw new Error("Firebase is not configured. Add the VITE_FIREBASE_* settings to a local .env file.");
  if (!database) database = getDatabase(getApps().length ? getApp() : initializeApp(config));
  return database;
}
export function subscribeToBoard(boardId, onBoard, onStatus = () => {}) {
  if (!firebaseAvailable) { onStatus("Local canvas"); return () => {}; }
  onStatus("Connecting...");
  const db = getBoardDatabase();
  const connectedRef = ref(db, ".info/connected");
  const stopConnection = onValue(connectedRef, snap => onStatus(snap.val() ? "Connected" : "Offline"), () => onStatus("Offline"));
  const stopBoard = onValue(ref(db, `boards/${boardId}`), snap => onBoard(snap.val()), error => onStatus(error.message || "Offline"));
  return () => { stopConnection(); stopBoard(); };
}
export async function saveBoard(boardId, strokes) {
  const db = getBoardDatabase();
  await set(ref(db, `boards/${boardId}`), { strokes, updatedAt: serverTimestamp() });
}
