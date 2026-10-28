# ForBoyfriend

A React + Vite drawing app with a local shared-canvas experience, responsive drawing controls, saved PNG previews, and in-app phone/widget previews.

## Run locally

```sh
npm install
npm run dev
```

## Firebase and Save-to-share behavior

Firebase Realtime Database is not configured in this checkout. Until it is configured, the app saves drawings and preferences in this browser's localStorage and displays **Local canvas**. It cannot share drawings between devices in this mode.

To configure Firebase, copy `.env.example` to `.env.local` and fill the `VITE_FIREBASE_*` values from the Firebase web app settings. Set `VITE_SHARED_BOARD_ID` to the same board ID for both people. Restart Vite after changing environment variables and set the same values in Vercel's project environment before deploying.

The canvas is private to the current browser while someone draws. Pressing **Save** stores a PNG locally and, when Firebase is connected, publishes the complete vector snapshot to `boards/<board-id>/savedDrawing`. Other connected devices receive that saved snapshot; individual pen, eraser, undo, redo, and clear actions are not sent as they happen. A clear affects the shared view only after saving the blank canvas. The save dialog reports local-only versus shared success accurately.

Realtime Database rules must allow the intended clients to read and write only the selected board. Never use database-wide public read/write rules for a private two-person board. A public unauthenticated URL cannot enforce a two-person access boundary by itself; use authentication or a server-mediated design before enabling remote writes. A public share URL can be used by anyone who obtains it.

The **Add to Home Screen** control installs a web app shortcut where supported. Native iOS/Android lock-screen widgets cannot be installed by a React + Vite website; the lock-screen screen in the gallery is an in-app preview only.

