import {UserConfig, defineConfig, loadEnv} from "vite";
import VitePluginCustomElementsManifest from "vite-plugin-cem";
import {readFileSync} from "fs";
import {resolve} from "path";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), "");
    const config: UserConfig = {
        plugins: [
            VitePluginCustomElementsManifest({
                files: ["./src/webcomponent.ts"],
            }),
        ],
        build: {
            lib: {
                // Could also be a dictionary or array of multiple entry points
                entry: "./index.ts",
                name: "Graphty",
                // the proper extensions will be added
                // fileName: "graphty",
            },
            rollupOptions: {
                external: [
                    "@babylonjs/core",
                    "@babylonjs/inspector",
                    "@babylonjs/loaders",
                ],
                output: {
                    globals: {
                        "@babylonjs/core": "BABYLON",
                        "@babylonjs/inspector": "BABYLON",
                        "@babylonjs/loaders": "BABYLON",
                    },
                },
            },
        },
        optimizeDeps: {
            exclude: [
                "@babylonjs/core",
                "@babylonjs/inspector",
                "@babylonjs/loaders",
            ],
        },
        resolve: {
            alias: {
                "babylon-forcegraph": resolve(__dirname, "./index.ts"),
            },
        },
        server: {
            host: true,
        },
    };

    if (env.HOST) {
        config.server!.host = env.HOST;
    }

    if (env.PORT) {
        config.server!.port = parseInt(env.PORT);
    }

    if (env.HTTPS_KEY_PATH && env.HTTPS_CERT_PATH) {
        config.server!.https = {
            key: readFileSync(env.HTTPS_KEY_PATH),
            cert: readFileSync(env.HTTPS_CERT_PATH),
        };
    }

    return config;
});

