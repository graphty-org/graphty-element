import type {StorybookConfig} from "@storybook/web-components-vite";
import {loadEnv} from "vite";
// eslint-disable-next-line no-duplicate-imports
import type {UserConfig} from "vite";

const config: StorybookConfig = {
    stories: [
        "../stories/**/*.mdx",
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
        const server: UserConfig["server"] = {
            host: true,
            allowedHosts: true,
        };

        let env: Record<string, string>;
        if (configType) {
            env = loadEnv(configType, process.cwd(), "");
        } else {
            env = {};
        }

        const {mergeConfig} = await import("vite");

        // if (env.HOST && config.server) {
        //     console.log("storybook vite: setting server:", env.HOST);
        //     server.host = env.HOST;
        // }

        // if (env.PORT && config.server) {
        //     config.server.port = parseInt(env.PORT);
        // }

        // if (env.HTTPS_KEY_PATH && env.HTTPS_CERT_PATH && config.server) {
        //     console.log("storybook vite: setting https");
        //     server.https = {
        //         key: readFileSync(env.HTTPS_KEY_PATH),
        //         cert: readFileSync(env.HTTPS_CERT_PATH),
        //     };
        // }

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
