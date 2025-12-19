import type {StorybookConfig} from "@storybook/web-components-vite";

const config: StorybookConfig = {
    stories: [
        "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
        "../stories/**/*.mdx",
    ],
    addons: [
        "@chromatic-com/storybook",
        "@storybook/addon-vitest",
        "@storybook/addon-docs",
    ],
    framework: {
        name: "@storybook/web-components-vite",
        options: {},
    },
    core: {
        disableTelemetry: true,
    },
    async viteFinal(config, {configType}) {
        const fs = await import("fs");
        const path = await import("path");
        const os = await import("os");

        // SSL configuration via environment variables or default paths
        // Environment variables: SSL_KEY_PATH, SSL_CERT_PATH
        // Default paths: ~/ssl/atoms.key, ~/ssl/STAR_ato_ms.crt
        const sslDir = path.join(os.homedir(), "ssl");
        const sslKeyPath = process.env.SSL_KEY_PATH ?? path.join(sslDir, "atoms.key");
        const sslCertPath = process.env.SSL_CERT_PATH ?? path.join(sslDir, "STAR_ato_ms.crt");

        // Check if SSL files exist before trying to use them
        const sslKeyExists = fs.existsSync(sslKeyPath);
        const sslCertExists = fs.existsSync(sslCertPath);
        const useHttps = sslKeyExists && sslCertExists;

        const server: Record<string, unknown> = {
            host: true,
            allowedHosts: true,
        };

        if (useHttps) {
            server.https = {
                key: fs.readFileSync(sslKeyPath),
                cert: fs.readFileSync(sslCertPath),
            };
        }

        const {mergeConfig} = await import("vite");

        if (configType === "DEVELOPMENT") {
            // Your development configuration goes here
        }

        if (configType === "PRODUCTION") {
            // Your production configuration goes here.
        }

        const merged = mergeConfig(config, {
            // Your environment configuration here
            server,
            // Exclude @mlc-ai/web-llm from optimization - it's dynamically loaded at runtime
            optimizeDeps: {
                exclude: ["@mlc-ai/web-llm"],
            },
            resolve: {
                alias: {
                    // Alias @mlc-ai/web-llm to a virtual module that will be loaded from CDN at runtime
                    "@mlc-ai/web-llm": path.join(__dirname, "webllm-stub.js"),
                },
            },
            build: {
                rollupOptions: {
                    external: ["@mlc-ai/web-llm"], // Dynamically loaded at runtime for in-browser LLM
                },
            },
        });
        return merged;
    },
};
export default config;
