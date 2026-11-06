import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        react(),

        VitePWA({
            registerType: "autoUpdate",

            includeAssets: ["favicon.png"],

            manifest: {
                id: "/",
                name: "Training Timer",
                short_name: "Training Timer",
                description: "Timer para treinos intervalados",
                theme_color: "#191919",
                background_color: "#191919",
                display: "standalone",
                orientation: "portrait",

                icons: [
                    {
                        src: "/pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png"
                    },
                    {
                        src: "/pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png"
                    }
                ]
            },

            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"]
            }
        })
    ]
});
