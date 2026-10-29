import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  if (process.env.VERCEL) {
    const required = ["VITE_API_URL"];
    const invalid = required.filter((name) => {
      try {
        const url = new URL(env[name]?.trim());
        return url.protocol !== "https:"
          || /^(localhost|127\.0\.0\.1)$|\.example$/i.test(url.hostname)
          || url.pathname.replace(/\/$/, "") !== "/api/v1";
      } catch {
        return true;
      }
    });
    if (invalid.length) {
      throw new Error(`Set production URLs for ${invalid.join(", ")} before deploying the workspace`);
    }
  }

  return {
    plugins: [react()],
    server: {
      host: "localhost",
      port: 5173,
    },
  };
});
