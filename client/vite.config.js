import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: {
          "localhost": "localhost",
        },
        configure: (proxy, _options) => {
          proxy.on("proxyRes", (proxyRes, req, res) => {
            // Forward cookies from backend to client
            const cookies = proxyRes.headers["set-cookie"];
            if (cookies) {
              res.setHeader("set-cookie", cookies.map(cookie => 
                cookie.replace(/Domain=localhost/gi, "Domain=localhost")
              ));
            }
          });
        },
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});