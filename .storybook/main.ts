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
        const path = await import("path");
        const {mergeConfig} = await import("vite");

        if (configType === "DEVELOPMENT") {
            // Your development configuration goes here
        }

        if (configType === "PRODUCTION") {
            // Your production configuration goes here.
        }

        const merged = mergeConfig(config, {
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
