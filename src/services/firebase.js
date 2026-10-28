import { getApp, getApps, initializeApp } from "firebase/app";
import { get, getDatabase, onChildAdded, onValue, push, ref, serverTimestamp, set } from "firebase/database";

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
function operationsRef(boardId) {
  const safeId = String(boardId || "our-little-world").replaceAll(".", "-").replaceAll("#", "-").replaceAll("$", "-").replaceAll("[", "-").replaceAll("]", "-").replaceAll("/", "-");
  return ref(getDatabaseInstance(), `boards/${safeId}/operations`);
}
function readableError(error) {
  if (error?.code === "PERMISSION_DENIED" || error?.code === "database/permission-denied") {
    return "Firebase rejected access. Check Realtime Database rules for this board.";
  }
  return error?.message || "Unable to connect to Firebase.";
}

export function subscribeToBoard(boardId, { onOperation, onStatus, onError, onReady }) {
  if (!firebaseAvailable) {
    onStatus?.("Local canvas");
    return () => {};
  }
  try {
    const db = getDatabaseInstance();
    const boardRef = operationsRef(boardId);
    onStatus?.("Connecting...");
    const stopConnection = onValue(ref(db, ".info/connected"), snapshot => {
      onStatus?.(snapshot.val() ? "Connected" : "Offline");
    }, error => {
      onStatus?.("Unable to connect");
      onError?.(readableError(error));
    });
    const stopOperations = onChildAdded(boardRef, snapshot => {
      onOperation?.(snapshot.val(), snapshot.key);
    }, error => {
      onStatus?.("Unable to connect");
      onError?.(readableError(error));
    });
    get(boardRef)
      .then(snapshot => onReady?.(!snapshot.exists()))
      .catch(error => onError?.(readableError(error)));
    return () => { stopConnection(); stopOperations(); };
  } catch (error) {
    onStatus?.("Unable to connect");
    onError?.(readableError(error));
    return () => {};
  }
}

export async function publishBoardOperation(boardId, operation) {
  const operationRef = push(operationsRef(boardId));
  await set(operationRef, { ...operation, createdAt: serverTimestamp() });
  return operationRef.key;
}


