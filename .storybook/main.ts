import type {StorybookConfig} from "@storybook/web-components-vite";

const config: StorybookConfig = {
    stories: [
        "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
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

        const sslDir = path.join(os.homedir(), "ssl");

        const server = {
            host: true,
            allowedHosts: true,
            https: {
                key: fs.readFileSync(path.join(sslDir, "atoms.key")),
                cert: fs.readFileSync(path.join(sslDir, "STAR_ato_ms.crt")),
            },
        };

        const {mergeConfig} = await import("vite");

        if (configType === "DEVELOPMENT") {
            // Your development configuration goes here
        }

        if (configType === "PRODUCTION") {
            // Your production configuration goes here.
        }

        // console.log("config", config);
        // console.log("server config", server);
        const merged = mergeConfig(config, {
            // Your environment configuration here
            server,
        });
        // console.log("merged config", merged);
        return merged;
    },
};
export default config;
