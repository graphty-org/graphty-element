import {readFileSync} from "fs";
import {resolve} from "path";
import {defineConfig, loadEnv, UserConfig} from "vite";
import VitePluginCustomElementsManifest from "vite-plugin-cem";
// import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), "");
    const config: UserConfig = {
        plugins: [
            // eslint(),
            VitePluginCustomElementsManifest({
                files: ["./src/graphty-element.ts"],
                lit: true,
            }),
        ],
        define: {
            // Disable Lit dev mode warning
            "process.env.NODE_ENV": JSON.stringify(mode === "development" ? "production" : mode),
        },
        build: {
            lib: {
                entry: "./index.ts",
                name: "Graphty",
                fileName: "graphty",
                formats: ["es", "umd"],
            },
            minify: mode === "production",
            sourcemap: true,
            rollupOptions: {
                // For now, keep the original externalization
                external: [
                    "@babylonjs/core",
                    "@babylonjs/inspector",
                    "lit",
                    "lit/decorators.js",
                    "lit/directives/class-map.js",
                    "lit/directives/style-map.js",
                ],
                output: {
                    globals: {
                        "@babylonjs/core": "BABYLON",
                        "@babylonjs/inspector": "BABYLON",
                        "lit": "Lit",
                        "lit/decorators.js": "Lit",
                        "lit/directives/class-map.js": "Lit",
                        "lit/directives/style-map.js": "Lit",
                    },
                    chunkFileNames: "[name]-[hash].js",
                },
                treeshake: {
                    moduleSideEffects: true,
                },
            },
        },
        optimizeDeps: {
            exclude: [
                "@babylonjs/core",
                "@babylonjs/inspector",
            ],
        },
        resolve: {
            alias: {
                graphty: resolve(__dirname, "./index.ts"),
            },
        },
        server: {
            host: true,
            allowedHosts: true,
        },
    };

    if (env.HOST && config.server) {
        config.server.host = env.HOST;
    }

    if (env.PORT && config.server) {
        config.server.port = parseInt(env.PORT);
    }

    if (env.HTTPS_KEY_PATH && env.HTTPS_CERT_PATH && config.server) {
        config.server.https = {
            key: readFileSync(env.HTTPS_KEY_PATH),
            cert: readFileSync(env.HTTPS_CERT_PATH),
        };
    }

    return config;
});

