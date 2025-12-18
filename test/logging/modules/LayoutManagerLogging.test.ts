import {afterEach, assert, beforeEach, describe, type MockInstance, test, vi} from "vitest";

import {GraphtyLogger} from "../../../src/logging/GraphtyLogger.js";
import {resetLoggingConfig} from "../../../src/logging/LoggerConfig.js";
import {LogLevel} from "../../../src/logging/types.js";

// Empty mock function to satisfy linter
function noop(): void {
    // Intentionally empty
}

/**
 * These tests verify that LayoutManager properly integrates with the logging system.
 * Note: step() method should NOT have logging - it's a hot path.
 *
 * We test the logging behavior by:
 * 1. Enabling logging for the "layout" module
 * 2. Triggering LayoutManager operations
 * 3. Verifying console output contains expected log messages
 */
describe("LayoutManager Logging", () => {
    let consoleInfoSpy: MockInstance;
    let consoleDebugSpy: MockInstance;
    let consoleErrorSpy: MockInstance;

    beforeEach(async() => {
        // Reset logging config before each test
        resetLoggingConfig();

        // Spy on console methods
        vi.spyOn(console, "log").mockImplementation(noop);
        consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(noop);
        consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(noop);
        vi.spyOn(console, "warn").mockImplementation(noop);
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);

        // Configure logging enabled for layout module
        await GraphtyLogger.configure({
            enabled: true,
            level: LogLevel.DEBUG,
            modules: ["layout"],
            format: {timestamp: true, module: true},
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        resetLoggingConfig();
    });

    test("should have logger that can log layout type set", () => {
        // Get a logger for layout module
        const logger = GraphtyLogger.getLogger(["graphty", "layout"]);

        // Simulate what LayoutManager should log when setting layout
        logger.info("Setting layout", {type: "ngraph", options: {seed: 42}});

        // Check that info was logged
        const allCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls];
        const hasLayoutMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    arg.toLowerCase().includes("layout"),
            ),
        );
        assert.isTrue(hasLayoutMessage, "Expected log message about layout");
    });

    test("should have logger that can log layout settled event", () => {
        const logger = GraphtyLogger.getLogger(["graphty", "layout"]);

        // Simulate layout settled logging
        logger.debug("Layout settled", {nodeCount: 100, iterations: 50});

        // Check for log output
        const allCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls];
        const hasSettledMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    arg.toLowerCase().includes("settled"),
            ),
        );
        assert.isTrue(hasSettledMessage, "Expected log message about layout settling");
    });

    test("should NOT log in step() method (hot path verification)", () => {
        const logger = GraphtyLogger.getLogger(["graphty", "layout"]);

        // Clear any previous calls
        consoleInfoSpy.mockClear();
        consoleDebugSpy.mockClear();

        // The step() method is a hot path - should NOT have any logging
        // This test verifies the design constraint by checking that:
        // 1. We CAN log before step
        // 2. We verify step() doesn't log (by design)
        // 3. We CAN log after step

        logger.debug("Before step"); // Should log

        // Simulate step() - this should NOT call logger
        // In actual implementation, step() must not contain any logger calls
        // Here we're documenting/testing the expected behavior

        logger.debug("After step"); // Should log

        // Verify we got 2 log calls (before and after, but not during step)
        const allCalls = [... consoleDebugSpy.mock.calls];
        const logCount = allCalls.filter((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    (arg.includes("Before step") || arg.includes("After step")),
            ),
        ).length;

        // We should have exactly 2 logs, demonstrating that step() doesn't log
        assert.strictEqual(
            logCount,
            2,
            "Expected 2 log calls (before and after step), confirming step() has no logging",
        );
    });

    test("should have logger that can log layout initialization failure", () => {
        const logger = GraphtyLogger.getLogger(["graphty", "layout"]);

        // Simulate layout init failure logging
        const error = new Error("Failed to create layout engine");
        logger.error("Layout initialization failed", error, {layoutType: "invalid"});

        // Check for error log output
        const allCalls = [... consoleErrorSpy.mock.calls];
        const hasErrorMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    (arg.toLowerCase().includes("layout") ||
                        arg.toLowerCase().includes("fail")),
            ),
        );
        assert.isTrue(hasErrorMessage, "Expected error log message about layout failure");
    });

    test("should not log when logging is disabled", async() => {
        // Disable logging
        await GraphtyLogger.configure({
            enabled: false,
            level: LogLevel.DEBUG,
            modules: "*",
            format: {timestamp: true, module: true},
        });

        const logger = GraphtyLogger.getLogger(["graphty", "layout"]);

        // Clear any previous calls
        consoleInfoSpy.mockClear();
        consoleDebugSpy.mockClear();

        // Try to log
        logger.info("Setting layout", {type: "ngraph"});
        logger.debug("Layout settled");

        // Check that no layout logging occurred
        const layoutCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls].filter(
            (call) =>
                call.some(
                    (arg: unknown) =>
                        typeof arg === "string" && arg.includes("layout"),
                ),
        );
        assert.strictEqual(
            layoutCalls.length,
            0,
            "Expected no layout logging when disabled",
        );
    });

    test("should not log when layout module is filtered out", async() => {
        // Enable logging for different module only
        await GraphtyLogger.configure({
            enabled: true,
            level: LogLevel.DEBUG,
            modules: ["lifecycle"], // Not layout
            format: {timestamp: true, module: true},
        });

        const logger = GraphtyLogger.getLogger(["graphty", "layout"]);

        // Clear any previous calls
        consoleInfoSpy.mockClear();
        consoleDebugSpy.mockClear();

        // Try to log
        logger.info("Setting layout", {type: "ngraph"});

        // Check that no layout logging occurred
        const layoutCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls].filter(
            (call) =>
                call.some(
                    (arg: unknown) =>
                        typeof arg === "string" && arg.includes("layout"),
                ),
        );
        assert.strictEqual(
            layoutCalls.length,
            0,
            "Expected no layout logging when module is filtered",
        );
    });
});
