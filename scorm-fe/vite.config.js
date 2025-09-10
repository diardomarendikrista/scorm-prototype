import { defineConfig } from "vite";
import dns from "dns";
import react from "@vitejs/plugin-react";
import jsconfigPaths from "vite-jsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), jsconfigPaths(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    open: true,
    // WAJIB reverse proxy ke S3 untuk content scorm
    proxy: {
      "/scorm-content": {
        target: "https://dayavirtual-bucket.s3.ap-southeast-1.amazonaws.com",
        changeOrigin: true, // Wajib ada untuk virtual hosted-style S3 buckets
        rewrite: (path) => path.replace(/^\/scorm-proxy/, ""), // Hapus '/scorm-proxy' dari path
      },
    },
  },
  resolve: {
    alias: {
      "./runtimeConfig": "./runtimeConfig.browser",
    },
  },
  optimizeDeps: {
    include: ["process"],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  ssr: {
    noExternal: ["react-helmet-async"],
  },
});
