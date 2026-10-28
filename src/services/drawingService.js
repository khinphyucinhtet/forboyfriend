import { firebaseAvailable, publishBoardOperation, subscribeToBoard } from "./firebase";

export const BOARD_ID = import.meta.env.VITE_SHARED_BOARD_ID || "our-little-world";

export const drawingService = {
  firebaseAvailable,
  subscribe: handlers => subscribeToBoard(BOARD_ID, handlers),
  publish: operation => publishBoardOperation(BOARD_ID, operation),
};
