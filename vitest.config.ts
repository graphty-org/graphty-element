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
                        "test/managers/UpdateManager.test.ts",
                        "test/managers/SelectionManager.test.ts",
                        "test/mesh-testing/real-mesh-simple.test.ts",
                        // Edge tests require browser (hammerjs dependency)
                        "test/Edge.bezier.test.ts",
                        "test/edge-cases/**/*.test.ts",
                        "test/integration/Edge.integration.test.ts",
                        // Browser-only tests
                        "test/browser/**/*.test.ts",
                        // Interaction tests require browser environment
                        "test/interactions/**/*.test.ts",
                        // Performance tests need DOM and should run in browser
                        "test/performance/**/*.test.ts",
                        // Examples that need browser environment
                        "test/examples/**/*.test.ts",
                        // LLM regression tests run via dedicated project
                        "test/ai/llm-regression/**/*.test.ts",
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
                resolve: {
                    alias: {
                        // Mock @mlc-ai/web-llm in browser tests - the package is CDN-only
                        "@mlc-ai/web-llm": path.resolve(dirname, "test/helpers/webllm-mock.ts"),
                    },
                },
                test: {
                    name: "browser",
                    setupFiles: ["./test/setup.ts"],
                    include: [
                        "test/browser/**/*.test.ts",
                        "test/managers/DataManager.test.ts",
                        "test/managers/LayoutManager.test.ts",
                        "test/managers/LifecycleManager.test.ts",
                        "test/managers/UpdateManager.test.ts",
                        "test/managers/SelectionManager.test.ts",
                        "test/mesh-testing/real-mesh-simple.test.ts",
                        "test/performance/**/*.test.ts",
                        "test/examples/**/*.test.ts",
                        // Edge tests require browser (hammerjs dependency)
                        "test/Edge.bezier.test.ts",
                        "test/edge-cases/**/*.test.ts",
                        "test/integration/Edge.integration.test.ts",
                        // Interaction tests moved to dedicated 'interactions' project
                    ],
                    exclude: [
                        // Interaction tests have their own project
                        "test/interactions/**/*.test.ts",
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
                        // Disable file parallelism to prevent route.fulfill errors
                        // when browser contexts are garbage collected during parallel execution
                        fileParallelism: false,
                    },
                },
            },
            {
                test: {
                    name: "interactions",
                    setupFiles: ["./test/setup.ts"],
                    include: ["test/interactions/**/*.test.ts"],
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
                        // Disable file parallelism to prevent race conditions and flaky tests
                        fileParallelism: false,
                    },
                    // Interaction tests load complex scenes and may need longer timeout
                    testTimeout: 30000,
                },
            },
            {
                extends: "vite.config.ts",
                plugins: [
                    // The plugin will run tests for the stories defined in your Storybook config
                    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                    storybookTest({
                        configDir: path.join(dirname, ".storybook"),
                        storybookUrl: "http://dev.ato.ms:9026",
                    }),
                ],
                resolve: {
                    alias: {
                        // Mock @mlc-ai/web-llm in storybook tests - the package is CDN-only
                        "@mlc-ai/web-llm": path.resolve(dirname, "test/helpers/webllm-mock.ts"),
                    },
                },
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
                        // Disable file parallelism to prevent route.fulfill errors
                        // when browser contexts are garbage collected during parallel execution
                        fileParallelism: false,
                    },
                    setupFiles: [".storybook/vitest.setup.ts"],
                    // Storybook tests load complex 3D scenes and need longer timeout
                    testTimeout: 30000,
                },
            },
            // LLM Regression Tests - Tests real LLM API calls for tool calling verification
            {
                test: {
                    name: "llm-regression",
                    include: ["test/ai/llm-regression/**/*.test.ts"],
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
                    // LLM calls are slow - 60s timeout per test
                    testTimeout: 60000,
                    hookTimeout: 30000,
                    // Run tests sequentially to avoid rate limits
                    pool: "forks",
                    poolOptions: {
                        forks: {
                            singleFork: true,
                        },
                    },
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
