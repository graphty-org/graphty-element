/**
 * Vitest Configuration for Mesh Testing
 *
 * Specialized configuration for running mesh tests with Babylon.js NullEngine
 * in a Node.js environment with proper polyfills.
 */

import {resolve} from "path";
import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        name: "mesh-testing",
        root: resolve(__dirname, "../.."),
        environment: "node",

        // Global setup for NullEngine and polyfills
        setupFiles: [
            resolve(__dirname, "test-setup.ts"),
        ],

        // Test file patterns
        include: [
            "test/mesh-testing/**/*.test.ts",
        ],

        // Exclude patterns
        exclude: [
            "test/mesh-testing/tracking-mocks.ts",
            "test/mesh-testing/property-discovery.ts",
            "test/mesh-testing/test-utilities.ts",
            "test/mesh-testing/test-setup.ts",
        ],

        // Reporter configuration
        reporters: ["verbose", "json"],
        outputFile: {
            json: "test-results/mesh-tests.json",
        },

        // Coverage configuration
        coverage: {
            enabled: true,
            provider: "v8",
            reporter: ["text", "json", "html"],
            reportsDirectory: "coverage/mesh-testing",
            include: [
                "src/meshes/**/*.ts",
            ],
            exclude: [
                "src/**/*.test.ts",
                "src/**/*.d.ts",
                "test/**/*",
            ],
        },

        // Timeout settings for mesh operations
        testTimeout: 10000,
        hookTimeout: 5000,

        // Performance settings
        maxConcurrency: 4,

        // Enable globals
        globals: true,
    },

    // Resolve configuration
    resolve: {
        alias: {
            "@": resolve(__dirname, "../..", "src"),
            "@test": resolve(__dirname, ".."),
        },
    },

    // Define configuration for dependencies
    define: {
    // Babylon.js expects these globals
        global: "globalThis",
        window: "globalThis",
    },

    // Optimization for testing
    optimizeDeps: {
        include: [
            "@babylonjs/core",
            "fast-check",
        ],
    },
});
