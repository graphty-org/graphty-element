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
                    setupFiles: ["./test/setup.ts"],
                    include: [
                        "test/**/*.test.ts",
                        "test/unit/**/*.test.ts",
                        "test/integration/**/*.test.ts",
                    ],
                    exclude: [
                        // These tests require DOM APIs and should run in browser environment
                        "test/managers/DataManager.test.ts",
                        "test/managers/LayoutManager.test.ts",
                        "test/managers/LifecycleManager.test.ts",
                        "test/mesh-testing/real-mesh-simple.test.ts",
                        // Edge tests require browser (hammerjs dependency)
                        "test/Edge.bezier.test.ts",
                        "test/edge-cases/**/*.test.ts",
                        "test/integration/Edge.integration.test.ts",
                        // Browser-only tests
                        "test/browser/**/*.test.ts",
                        // Performance tests need DOM and should run in browser
                        "test/performance/**/*.test.ts",
                        // Examples that need browser environment
                        "test/examples/**/*.test.ts",
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
                    setupFiles: ["./test/setup.ts"],
                    include: [
                        "test/browser/**/*.test.ts",
                        "test/managers/DataManager.test.ts",
                        "test/managers/LayoutManager.test.ts",
                        "test/managers/LifecycleManager.test.ts",
                        "test/mesh-testing/real-mesh-simple.test.ts",
                        "test/performance/**/*.test.ts",
                        "test/examples/**/*.test.ts",
                        // Edge tests require browser (hammerjs dependency)
                        "test/Edge.bezier.test.ts",
                        "test/edge-cases/**/*.test.ts",
                        "test/integration/Edge.integration.test.ts",
                    ],
                    exclude: [
                        // Tests using Node.js-only libraries (pngjs)
                        "test/browser/dash-spacing-measurement.test.ts",
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
                    storybookTest({
                        configDir: path.join(dirname, ".storybook"),
                        storybookUrl: "http://localhost:9025",
                    }),
                ],
                test: {
                    name: "storybook",
                    exclude: [
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
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: "playwright",
                        instances: [{browser: "chromium"}],
                    },
                    setupFiles: [".storybook/vitest.setup.ts"],
                    // Reduce parallelism to prevent browser resource contention
                    // Note: Use pool: 'forks' and poolOptions.forks.singleFork for sequential execution
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
