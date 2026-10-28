import { firebaseAvailable, publishBoardSnapshot, subscribeToBoard } from "./firebase";

export const BOARD_ID = import.meta.env.VITE_SHARED_BOARD_ID || "our-little-world";

export const drawingService = {
  firebaseAvailable,
  subscribe: handlers => subscribeToBoard(BOARD_ID, handlers),
  publishSnapshot: snapshot => publishBoardSnapshot(BOARD_ID, snapshot),
};
