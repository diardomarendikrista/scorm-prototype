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
    // WAJIB reverse proxy ke CDN untuk content scorm (JANJIAN sama BE ya, mau pakai kata kunci apa, yang disini kita pake "/scorm-proxy")
    proxy: {
      "/scorm-proxy": {
        target: "https://dayavirtual-bucket.s3.ap-southeast-1.amazonaws.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/scorm-proxy/, ""), // Hapus '/scorm-proxy' dari path karena ini kata kunci untuk tentukan proxy
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
