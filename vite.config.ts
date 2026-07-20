import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In dev, the Vite server proxies /api to the local backend (default :3000),
// so the frontend always talks to a relative /api and there is no CORS.
// Run both together with `npm run dev:all`.
const API_TARGET = process.env.API_TARGET || "http://localhost:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true },
    },
  },
  preview: { port: Number(process.env.PORT) || 3000, host: true },
});
