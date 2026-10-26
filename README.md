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
