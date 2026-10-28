# ForBoyfriend

A React + Vite drawing app with a local shared-canvas experience, responsive drawing controls, saved PNG previews, and in-app phone/widget previews.

## Run locally

```sh
npm install
npm run dev
```

## Firebase status

Firebase Realtime Database is not configured in this checkout. Until it is configured, drawing operations and preferences are saved in the current browser's localStorage and the app displays **Local canvas**. That does not synchronize with another browser or device.

To prepare Firebase settings, copy `.env.example` to `.env.local` and fill the `VITE_FIREBASE_*` values from the Firebase web app settings. Set `VITE_SHARED_BOARD_ID` to the same board ID for both people. Restart Vite after changing environment variables. The Firebase service boundary is in `src/services/firebase.js`; the current screen remains local-only until Firebase data subscription and conflict-safe operation merging are integrated.

Do not use unrestricted public Realtime Database rules for a private two-person board. A public unauthenticated URL cannot enforce a two-person access boundary by itself; use an authenticated or server-mediated design before enabling remote writes.

For live sync, set the `.env.example` values in the Vercel project (all environments that build the app) and redeploy. The same `VITE_SHARED_BOARD_ID` must be used by both devices. The client writes immutable stroke, remove/restore, and clear operations under `boards/<board-id>/operations`; concurrent strokes are appended instead of replacing the full board. Existing local strokes are copied to an empty remote board on the first configured connection. Firebase Realtime Database rules must grant access to that exact board path. Do not use a database-wide public read/write rule; the app surfaces permission failures as a sync error. A public share URL remains accessible to anyone who obtains it.

