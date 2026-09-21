// src/api.ts
// Use a relative `/api` base in development so Vite's dev server proxy can forward requests
// to the remote backend and avoid CORS errors. In production this should point to your
// real API host (or you can keep using absolute URLs in a production build config).
export const API_URL = 'https://api-central.wheelofnameset.com/api';
