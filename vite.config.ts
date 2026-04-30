import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/events": "http://127.0.0.1:4000",
      "/performance-metrics": "http://127.0.0.1:4000",
      "/error-logs": "http://127.0.0.1:4000",
      "/metrics": "http://127.0.0.1:4000",
      "/api": "http://127.0.0.1:4000",
      "/analytics": "http://127.0.0.1:4000",
      "/subscription": "http://127.0.0.1:4000",
      "/usage": "http://127.0.0.1:4000",
      "/properties": "http://127.0.0.1:4000",
      "/api-keys": "http://127.0.0.1:4000",
      "/dashboard-configs": "http://127.0.0.1:4000",
      "/alerts": "http://127.0.0.1:4000",
      "/team-members": "http://127.0.0.1:4000",
      "/ab-tests": "http://127.0.0.1:4000",
      "/marketing": "http://127.0.0.1:4000",
      "/recordings": "http://127.0.0.1:4000",
      "/exports": "http://127.0.0.1:4000",
      "/screenshots": "http://127.0.0.1:4000",
      "/ai": "http://127.0.0.1:4000",
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
