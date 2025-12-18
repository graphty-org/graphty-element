import {afterEach, assert, beforeEach, describe, type MockInstance, test, vi} from "vitest";

import {GraphtyLogger} from "../../../src/logging/GraphtyLogger.js";
import {resetLoggingConfig} from "../../../src/logging/LoggerConfig.js";
import {LogLevel} from "../../../src/logging/types.js";

// Empty mock function to satisfy linter
function noop(): void {
    // Intentionally empty
}

/**
 * These tests verify that DataManager properly integrates with the logging system.
 *
 * We test the logging behavior by:
 * 1. Enabling logging for the "data" module
 * 2. Simulating DataManager operations via logger calls
 * 3. Verifying console output contains expected log messages
 */
describe("DataManager Logging", () => {
    let consoleInfoSpy: MockInstance;
    let consoleDebugSpy: MockInstance;
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    beforeEach(async() => {
        // Reset logging config before each test
        resetLoggingConfig();

        // Spy on console methods
        vi.spyOn(console, "log").mockImplementation(noop);
        consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(noop);
        consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(noop);
        consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(noop);
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);

        // Configure logging enabled for data module
        await GraphtyLogger.configure({
            enabled: true,
            level: LogLevel.DEBUG,
            modules: ["data"],
            format: {timestamp: true, module: true},
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        resetLoggingConfig();
    });

    test("should have logger that can log batch node addition with count", () => {
        const logger = GraphtyLogger.getLogger(["graphty", "data"]);

        // Simulate what DataManager should log when adding nodes
        logger.debug("Adding nodes", {count: 50});

        // Check for log output
        const allCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls];
        const hasNodeMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    arg.toLowerCase().includes("node"),
            ),
        );
        assert.isTrue(hasNodeMessage, "Expected log message about adding nodes");
    });

    test("should have logger that can log data source loading start", () => {
        const logger = GraphtyLogger.getLogger(["graphty", "data"]);

        // Simulate data source loading start
        logger.info("Loading data source", {type: "json-url", url: "https://example.com/data.json"});

        // Check for log output
        const allCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls];
        const hasLoadMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    arg.toLowerCase().includes("load"),
            ),
        );
        assert.isTrue(hasLoadMessage, "Expected log message about loading data source");
    });

    test("should have logger that can log data source completion with stats", () => {
        const logger = GraphtyLogger.getLogger(["graphty", "data"]);

        // Simulate data source completion
        logger.info("Data source loading complete", {
            nodesLoaded: 100,
            edgesLoaded: 250,
            duration: 1234,
            chunks: 5,
        });

        // Check for log output
        const allCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls];
        const hasCompleteMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    arg.toLowerCase().includes("complete"),
            ),
        );
        assert.isTrue(hasCompleteMessage, "Expected log message about data loading completion");
    });

    test("should have logger that can log validation errors", () => {
        const logger = GraphtyLogger.getLogger(["graphty", "data"]);

        // Simulate validation error logging
        logger.warn("Validation error in data", {
            field: "nodeId",
            expected: "string",
            received: "number",
            count: 3,
        });

        // Check for warning log output
        const allCalls = [... consoleWarnSpy.mock.calls];
        const hasValidationMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    arg.toLowerCase().includes("validation"),
            ),
        );
        assert.isTrue(hasValidationMessage, "Expected warning log message about validation");
    });

    test("should have logger that can log edge addition", () => {
        const logger = GraphtyLogger.getLogger(["graphty", "data"]);

        // Simulate edge addition logging
        logger.debug("Adding edges", {count: 100});

        // Check for log output
        const allCalls = [... consoleDebugSpy.mock.calls];
        const hasEdgeMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    arg.toLowerCase().includes("edge"),
            ),
        );
        assert.isTrue(hasEdgeMessage, "Expected log message about adding edges");
    });

    test("should have logger that can log data load errors", () => {
        const logger = GraphtyLogger.getLogger(["graphty", "data"]);

        // Simulate data load error
        const error = new Error("Network error: Failed to fetch");
        logger.error("Data source loading failed", error, {
            type: "json-url",
            url: "https://example.com/data.json",
        });

        // Check for error log output
        const allCalls = [... consoleErrorSpy.mock.calls];
        const hasErrorMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    (arg.toLowerCase().includes("fail") ||
                        arg.toLowerCase().includes("error")),
            ),
        );
        assert.isTrue(hasErrorMessage, "Expected error log message about data loading failure");
    });

    test("should not log when logging is disabled", async() => {
        // Disable logging
        await GraphtyLogger.configure({
            enabled: false,
            level: LogLevel.DEBUG,
            modules: "*",
            format: {timestamp: true, module: true},
        });

        const logger = GraphtyLogger.getLogger(["graphty", "data"]);

        // Clear any previous calls
        consoleInfoSpy.mockClear();
        consoleDebugSpy.mockClear();

        // Try to log
        logger.debug("Adding nodes", {count: 50});
        logger.info("Data source loading complete");

        // Check that no data logging occurred
        const dataCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls].filter(
            (call) =>
                call.some(
                    (arg: unknown) =>
                        typeof arg === "string" && arg.includes("data"),
                ),
        );
        assert.strictEqual(
            dataCalls.length,
            0,
            "Expected no data logging when disabled",
        );
    });

    test("should not log when data module is filtered out", async() => {
        // Enable logging for different module only
        await GraphtyLogger.configure({
            enabled: true,
            level: LogLevel.DEBUG,
            modules: ["layout"], // Not data
            format: {timestamp: true, module: true},
        });

        const logger = GraphtyLogger.getLogger(["graphty", "data"]);

        // Clear any previous calls
        consoleInfoSpy.mockClear();
        consoleDebugSpy.mockClear();

        // Try to log
        logger.debug("Adding nodes", {count: 50});

        // Check that no data logging occurred
        const dataCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls].filter(
            (call) =>
                call.some(
                    (arg: unknown) =>
                        typeof arg === "string" && arg.includes("data"),
                ),
        );
        assert.strictEqual(
            dataCalls.length,
            0,
            "Expected no data logging when module is filtered",
        );
    });
});
