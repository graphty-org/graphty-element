import path from "node:path";
import {fileURLToPath} from "node:url";

import {storybookTest} from "@storybook/addon-vitest/vitest-plugin";
import {defineConfig} from "vitest/config";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    test: {
        projects: [
            {
                test: {
                    name: "default",
                    exclude: [
                        // These tests require DOM APIs and should run in browser environment
                        "test/managers/DataManager.test.ts",
                        "test/managers/LayoutManager.test.ts",
                        "test/managers/LifecycleManager.test.ts",
                        "test/mesh-testing/real-mesh-simple.test.ts",
                        // Exclude experimental/temporary folders ending with ~
                        "**/*~/**",
                        "**/*~",
                        // Standard vitest excludes
                        "**/node_modules/**",
                        "**/dist/**",
                        "**/cypress/**",
                        "**/.{idea,git,cache,output,temp}/**",
                        "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
                    ],
                },
            },
            {
                test: {
                    name: "browser",
                    exclude: [
                        // Exclude experimental/temporary folders ending with ~
                        "**/*~/**",
                        "**/*~",
                    ],
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: "playwright",
                        instances: [{browser: "chromium"}],
                    },
                },
            },
            {
                extends: "vite.config.ts",
                plugins: [
                    // The plugin will run tests for the stories defined in your Storybook config
                    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                    storybookTest({configDir: path.join(dirname, ".storybook")}),
                ],
                test: {
                    name: "storybook",
                    exclude: [
                        // Exclude experimental/temporary folders ending with ~
                        "**/*~/**",
                        "**/*~",
                    ],
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: "playwright",
                        instances: [{browser: "chromium"}],
                    },
                    setupFiles: [".storybook/vitest.setup.ts"],
                },
            },
        ],
        coverage: {
            all: true,
            reporter: ["text", "json-summary", "json", "lcov"],
        },
        // dangerouslyIgnoreUnhandledErrors: true,
        slowTestThreshold: 60000,
    },
});
