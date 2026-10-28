import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, serverTimestamp, set } from "firebase/database";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
export const firebaseAvailable = Boolean(config.apiKey && config.databaseURL && config.projectId && config.appId);
let database;

function getDatabaseInstance() {
  if (!firebaseAvailable) throw new Error("Firebase is not configured. Set the VITE_FIREBASE_* deployment variables.");
  if (!database) database = getDatabase(getApps().length ? getApp() : initializeApp(config));
  return database;
}
function readableError(error) {
  if (error?.code === "PERMISSION_DENIED" || error?.code === "database/permission-denied") {
    return "Firebase rejected access. Check Realtime Database rules for this board.";
  }
  return error?.message || "Unable to connect to Firebase.";
}

export function subscribeToBoard(boardId, { onSnapshot, onStatus, onError }) {
  if (!firebaseAvailable) {
    onStatus?.("Local canvas");
    return () => {};
  }
  try {
    const db = getDatabaseInstance();
    const boardRef = ref(db, `boards/${safeBoardId(boardId)}/savedDrawing`);
    onStatus?.("Connecting...");
    const stopConnection = onValue(ref(db, ".info/connected"), snapshot => {
      onStatus?.(snapshot.val() ? "Connected" : "Offline");
    }, error => {
      onStatus?.("Unable to connect");
      onError?.(readableError(error));
    });
    const stopSnapshot = onValue(boardRef, snapshot => {
      onSnapshot?.(snapshot.val());
    }, error => {
      onStatus?.("Unable to connect");
      onError?.(readableError(error));
    });
    return () => { stopConnection(); stopSnapshot(); };
  } catch (error) {
    onStatus?.("Unable to connect");
    onError?.(readableError(error));
    return () => {};
  }
}

function safeBoardId(boardId) {
  return String(boardId || "our-little-world").replaceAll(".", "-").replaceAll("#", "-").replaceAll("$", "-").replaceAll("[", "-").replaceAll("]", "-").replaceAll("/", "-");
}

export async function publishBoardSnapshot(boardId, snapshot) {
  await set(ref(getDatabaseInstance(), `boards/${safeBoardId(boardId)}/savedDrawing`), {
    ...snapshot,
    savedAt: serverTimestamp(),
  });
}


