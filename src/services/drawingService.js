import { firebaseAvailable, saveBoard, subscribeToBoard } from "./firebase";
export const BOARD_ID = import.meta.env.VITE_SHARED_BOARD_ID || "our-little-world";
export const drawingService = {
  firebaseAvailable,
  subscribe: (onBoard, onStatus) => subscribeToBoard(BOARD_ID, onBoard, onStatus),
  save: strokes => saveBoard(BOARD_ID, strokes),
};
