import {defineConfig} from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: "./test",
    fullyParallel: true,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 2 : 4,
    timeout: 20000, // 20 seconds per test - balanced for reliability
    globalSetup: './test/playwright/global-setup.ts',
    globalTeardown: './test/playwright/global-teardown.ts',

    reporter: process.env.CI ? [
        ["line"],
        ["junit", {outputFile: "junit.xml"}],
        ["html", {
            outputFolder: "playwright-report",
            host: process.env.PLAYWRIGHT_REPORT_HOST ?? "localhost",
            port: process.env.PLAYWRIGHT_REPORT_PORT ? parseInt(process.env.PLAYWRIGHT_REPORT_PORT) : undefined,
        }],
    ] : [
        ["list"],
        ["html", {
            outputFolder: "playwright-report",
            host: process.env.PLAYWRIGHT_REPORT_HOST ?? "localhost",
            port: process.env.PLAYWRIGHT_REPORT_PORT ? parseInt(process.env.PLAYWRIGHT_REPORT_PORT) : undefined,
        }],
    ],

    use: {
    // Consistent viewport for visual tests
        viewport: {width: 1280, height: 720},
        // Capture traces and videos on retry for debugging
        trace: "on-first-retry",
        video: "on-first-retry",
        // Device scale factor for consistent rendering
        deviceScaleFactor: 1,
        // Force headless mode for server environments
        headless: true,
    },

    // Multiple projects for different test scenarios
    projects: [
        {
            name: "visual",
            testMatch: "test/playwright/generated/**/*.visual.spec.ts",
            testIgnore: "**/*.fast.visual.spec.ts", // Exclude fast tests
            use: {
                browserName: "chromium",
                launchOptions: {
                    args: [
                        "--use-angle=default",
                        "--ignore-gpu-blacklist",
                        "--ignore-gpu-blocklist",
                        "--disable-web-security",
                        "--disable-features=IsolateOrigins",
                        "--disable-site-isolation-trials",
                        // Ultra-fast mode optimizations
                        "--disable-background-timer-throttling",
                        "--disable-renderer-backgrounding",
                        "--disable-features=TranslateUI",
                        "--disable-ipc-flooding-protection",
                        "--enable-unsafe-webgpu", // Faster WebGL
                        "--disable-blink-features=AutomationControlled",
                    ],
                },
                // Consistent screenshot settings
                screenshot: {
                    mode: "only-on-failure",
                    fullPage: false,
                },
            },
        },
        {
            name: "visual-fast",
            testMatch: "test/playwright/generated/**/*.fast.visual.spec.ts",
            use: {
                browserName: "chromium",
                launchOptions: {
                    args: [
                        "--use-angle=default",
                        "--ignore-gpu-blacklist",
                        "--ignore-gpu-blocklist",
                        "--disable-web-security",
                        "--disable-features=IsolateOrigins",
                        "--disable-site-isolation-trials",
                        // Ultra-fast mode optimizations
                        "--disable-background-timer-throttling",
                        "--disable-renderer-backgrounding",
                        "--disable-features=TranslateUI",
                        "--disable-ipc-flooding-protection",
                        "--enable-unsafe-webgpu",
                        "--disable-blink-features=AutomationControlled",
                    ],
                },
                screenshot: {
                    mode: "only-on-failure",
                    fullPage: false,
                },
            },
            // Run tests serially within files to ensure context sharing
            fullyParallel: false,
        },
        {
            name: "interaction",
            testMatch: "**/interaction/**/*.spec.ts",
            use: {
                browserName: "chromium",
                launchOptions: {
                    args: ["--use-angle=default"],
                },
            },
        },
        {
            name: "performance",
            testMatch: "**/performance/**/*.spec.ts",
            use: {
                browserName: "chromium",
                launchOptions: {
                    args: ["--use-angle=default"],
                },
            },
        },
    ],

    // Snapshot path configuration
    snapshotPathTemplate: "{testDir}/playwright/visual/screenshots-baseline/{projectName}/{testFileDir}/{testFileName}-{arg}{ext}",
});
