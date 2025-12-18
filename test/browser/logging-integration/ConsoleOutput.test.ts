import {afterEach, assert, beforeEach, describe, type MockInstance, test, vi} from "vitest";

import {GraphtyLogger} from "../../../src/logging/GraphtyLogger.js";
import {resetLoggingConfig} from "../../../src/logging/LoggerConfig.js";
import {LogLevel} from "../../../src/logging/types.js";

// Empty mock function to satisfy linter
function noop(): void {
    // Intentionally empty
}

describe("Console Output", () => {
    let consoleDebugSpy: MockInstance;
    let consoleInfoSpy: MockInstance;
    let consoleWarnSpy: MockInstance;
    let consoleErrorSpy: MockInstance;

    beforeEach(async() => {
        // Reset logging config before each test
        resetLoggingConfig();

        // Spy on console methods
        consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(noop);
        consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(noop);
        consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(noop);
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
        vi.spyOn(console, "log").mockImplementation(noop);

        // Configure logging for tests
        await GraphtyLogger.configure({
            enabled: true,
            level: LogLevel.TRACE,
            modules: "*",
            format: {timestamp: true, module: true, colors: true},
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        resetLoggingConfig();
    });

    describe("Output format", () => {
        test("should include ISO timestamp", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.info("Test message");

            assert.isTrue(consoleInfoSpy.mock.calls.length > 0, "Expected console.info to be called");

            const firstArg = consoleInfoSpy.mock.calls[0][0] as string;
            // ISO timestamp pattern: [YYYY-MM-DDTHH:mm:ss.sssZ]
            const isoPattern = /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/;
            assert.isTrue(isoPattern.test(firstArg), `Expected ISO timestamp in: ${firstArg}`);
        });

        test("should include module category path", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "layout", "ngraph"]);
            logger.info("Test message");

            assert.isTrue(consoleInfoSpy.mock.calls.length > 0, "Expected console.info to be called");

            const firstArg = consoleInfoSpy.mock.calls[0][0] as string;
            assert.isTrue(
                firstArg.includes("[graphty.layout.ngraph]"),
                `Expected category path in: ${firstArg}`,
            );
        });

        test("should include log level", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);

            // Test INFO level
            logger.info("Info message");
            let firstArg = consoleInfoSpy.mock.calls[0][0] as string;
            assert.isTrue(firstArg.includes("[INFO]"), `Expected [INFO] in: ${firstArg}`);

            // Test DEBUG level
            logger.debug("Debug message");
            firstArg = consoleDebugSpy.mock.calls[0][0] as string;
            assert.isTrue(firstArg.includes("[DEBUG]"), `Expected [DEBUG] in: ${firstArg}`);

            // Test WARN level
            logger.warn("Warn message");
            firstArg = consoleWarnSpy.mock.calls[0][0] as string;
            assert.isTrue(firstArg.includes("[WARN]"), `Expected [WARN] in: ${firstArg}`);

            // Test ERROR level
            logger.error("Error message");
            firstArg = consoleErrorSpy.mock.calls[0][0] as string;
            assert.isTrue(firstArg.includes("[ERROR]"), `Expected [ERROR] in: ${firstArg}`);
        });

        test("should format structured data as JSON-serializable object", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const testData = {
                count: 42,
                name: "test",
                nested: {value: true},
            };

            logger.info("Test message", testData);

            assert.isTrue(consoleInfoSpy.mock.calls.length > 0, "Expected console.info to be called");

            // The second argument should be the data object
            const calls = consoleInfoSpy.mock.calls[0];
            const dataArg = calls[1] as Record<string, unknown>;

            assert.isDefined(dataArg, "Expected data argument");
            assert.strictEqual(dataArg.count, 42);
            assert.strictEqual(dataArg.name, "test");
            assert.deepEqual(dataArg.nested, {value: true});
        });

        test("should include stack trace for errors", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const testError = new Error("Test error");

            logger.error("Something went wrong", testError);

            assert.isTrue(consoleErrorSpy.mock.calls.length > 0, "Expected console.error to be called");

            // The data should include error info
            const calls = consoleErrorSpy.mock.calls[0];

            // Check if error info is in the second argument (properties)
            const dataArg = calls[1] as Record<string, unknown>;
            assert.isDefined(dataArg, "Expected data argument with error");
            assert.isDefined(dataArg.error, "Expected error property");

            // The error property should contain stack or message
            const errorInfo = dataArg.error as string;
            assert.isTrue(
                errorInfo.includes("Test error"),
                `Expected error message in: ${errorInfo}`,
            );
        });
    });

    describe("Console method selection", () => {
        test("should use console.debug for debug level", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.debug("Debug message");

            assert.isTrue(consoleDebugSpy.mock.calls.length > 0, "Expected console.debug to be called");
        });

        test("should use console.info for info level", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.info("Info message");

            assert.isTrue(consoleInfoSpy.mock.calls.length > 0, "Expected console.info to be called");
        });

        test("should use console.warn for warn level", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.warn("Warn message");

            assert.isTrue(consoleWarnSpy.mock.calls.length > 0, "Expected console.warn to be called");
        });

        test("should use console.error for error level", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.error("Error message");

            assert.isTrue(consoleErrorSpy.mock.calls.length > 0, "Expected console.error to be called");
        });

        test("should use console.debug for trace level", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.trace("Trace message");

            // Trace maps to debug at the console level
            assert.isTrue(consoleDebugSpy.mock.calls.length > 0, "Expected console.debug for trace");
        });
    });

    describe("Format configuration", () => {
        test("should omit timestamp when format.timestamp is false", async() => {
            resetLoggingConfig();
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.INFO,
                modules: "*",
                format: {timestamp: false, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.info("Test message");

            const firstArg = consoleInfoSpy.mock.calls[0][0] as string;
            // Should NOT have ISO timestamp
            const isoPattern = /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/;
            assert.isFalse(isoPattern.test(firstArg), `Should not have timestamp in: ${firstArg}`);
        });

        test("should omit module when format.module is false", async() => {
            resetLoggingConfig();
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.INFO,
                modules: "*",
                format: {timestamp: true, module: false},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.info("Test message");

            const firstArg = consoleInfoSpy.mock.calls[0][0] as string;
            // Should NOT have module path
            assert.isFalse(
                firstArg.includes("[graphty.test]"),
                `Should not have module in: ${firstArg}`,
            );
        });
    });

    describe("Complete output format", () => {
        test("should output complete formatted message with all parts", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "layout"]);
            logger.info("Layout initialized", {nodeCount: 100, edgeCount: 50});

            assert.isTrue(consoleInfoSpy.mock.calls.length > 0);

            const firstArg = consoleInfoSpy.mock.calls[0][0] as string;

            // Check all parts are present in order
            // Pattern: [timestamp] [category] [LEVEL] message
            const parts = [
                /\[\d{4}-\d{2}-\d{2}T/, // Timestamp start
                /\[graphty\.layout\]/, // Category
                /\[INFO\]/, // Level
                /Layout initialized/, // Message
            ];

            for (const pattern of parts) {
                assert.isTrue(
                    pattern.test(firstArg),
                    `Expected ${pattern.toString()} in: ${firstArg}`,
                );
            }

            // Check data is passed
            const dataArg = consoleInfoSpy.mock.calls[0][1] as Record<string, unknown>;
            assert.strictEqual(dataArg.nodeCount, 100);
            assert.strictEqual(dataArg.edgeCount, 50);
        });
    });
});
