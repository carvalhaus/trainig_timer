import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        react(),

        VitePWA({
            registerType: "autoUpdate",

            includeAssets: ["favicon.svg"],

            manifest: {
                name: "Training Timer",
                short_name: "Training Timer",
                description: "Timer para treinos intervalados",
                theme_color: "#191919",
                background_color: "#191919",
                display: "standalone",
                orientation: "portrait",

                icons: [
                    {
                        src: "/pwa-192x250.png",
                        sizes: "192x250",
                        type: "image/png"
                    },
                    {
                        src: "/pwa-512x666.png",
                        sizes: "512x666",
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
