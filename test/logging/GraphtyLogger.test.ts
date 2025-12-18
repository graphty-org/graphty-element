import {afterEach, assert, beforeEach, describe, type MockInstance, test, vi} from "vitest";

import {GraphtyLogger} from "../../src/logging/GraphtyLogger.js";
import {resetLoggingConfig} from "../../src/logging/LoggerConfig.js";
import {LogLevel} from "../../src/logging/types.js";

// Empty mock function to satisfy linter
function noop(): void {
    // Intentionally empty
}

describe("GraphtyLogger", () => {
    let consoleLogSpy: MockInstance;
    let consoleDebugSpy: MockInstance;
    let consoleInfoSpy: MockInstance;

    beforeEach(() => {
        // Reset logging config before each test
        resetLoggingConfig();
        // Spy on console methods
        consoleLogSpy = vi.spyOn(console, "log").mockImplementation(noop);
        consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(noop);
        consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(noop);
        vi.spyOn(console, "warn").mockImplementation(noop);
        vi.spyOn(console, "error").mockImplementation(noop);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        resetLoggingConfig();
    });

    describe("configure", () => {
        test("should configure logging", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });
            assert.strictEqual(GraphtyLogger.isEnabled(), true);
        });

        test("should disable logging when enabled is false", async() => {
            await GraphtyLogger.configure({
                enabled: false,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });
            assert.strictEqual(GraphtyLogger.isEnabled(), false);
        });
    });

    describe("getLogger", () => {
        test("should create logger for category", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });
            const logger = GraphtyLogger.getLogger(["graphty", "layout"]);
            assert.isNotNull(logger);
            assert.isFunction(logger.debug);
            assert.isFunction(logger.info);
            assert.isFunction(logger.warn);
            assert.isFunction(logger.error);
        });

        test("should cache logger instances", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });
            const logger1 = GraphtyLogger.getLogger(["graphty", "layout"]);
            const logger2 = GraphtyLogger.getLogger(["graphty", "layout"]);
            // Same category should return same logger instance
            assert.strictEqual(logger1, logger2);
        });

        test("should return different loggers for different categories", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });
            const logger1 = GraphtyLogger.getLogger(["graphty", "layout"]);
            const logger2 = GraphtyLogger.getLogger(["graphty", "xr"]);
            assert.notStrictEqual(logger1, logger2);
        });
    });

    describe("logging when disabled", () => {
        test("should not log when disabled", async() => {
            await GraphtyLogger.configure({
                enabled: false,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });
            const logger = GraphtyLogger.getLogger(["graphty", "layout"]);
            logger.info("test message");
            // Console should not be called
            assert.strictEqual(consoleInfoSpy.mock.calls.length, 0);
        });

        test("should not log when module is not enabled", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: ["xr"], // Only xr is enabled
                format: {timestamp: true, module: true},
            });
            const logger = GraphtyLogger.getLogger(["graphty", "layout"]);
            logger.info("test message");
            // Layout module should not log
            assert.strictEqual(consoleInfoSpy.mock.calls.length, 0);
        });
    });

    describe("logging when enabled", () => {
        beforeEach(async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });
        });

        test("should log when enabled at correct level", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "layout"]);
            logger.info("test message");
            // Console.info should be called (or console.log depending on implementation)
            const totalCalls = consoleInfoSpy.mock.calls.length +
                              consoleLogSpy.mock.calls.length;
            assert.isTrue(totalCalls > 0, "Expected at least one console call");
        });

        test("should not log below configured level", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.WARN, // Only warn and above
                modules: "*",
                format: {timestamp: true, module: true},
            });
            const logger = GraphtyLogger.getLogger(["graphty", "layout"]);
            logger.debug("debug message");
            logger.info("info message");
            // Debug and info should not be called
            assert.strictEqual(consoleDebugSpy.mock.calls.length, 0);
        });

        test("should include category prefix in output", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "layout"]);
            logger.info("test message");

            // Check that any console method was called with category info
            const allCalls = [
                ... consoleLogSpy.mock.calls,
                ... consoleInfoSpy.mock.calls,
            ];

            const hasCategory = allCalls.some((call) =>
                call.some((arg: unknown) => typeof arg === "string" && arg.includes("layout")),
            );
            assert.isTrue(hasCategory, "Expected output to include category");
        });
    });

    describe("log levels", () => {
        beforeEach(async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.TRACE, // Enable all levels
                modules: "*",
                format: {timestamp: true, module: true},
            });
        });

        test("should have trace method", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            assert.isFunction(logger.trace);
        });

        test("should have debug method", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            assert.isFunction(logger.debug);
        });

        test("should have info method", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            assert.isFunction(logger.info);
        });

        test("should have warn method", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            assert.isFunction(logger.warn);
        });

        test("should have error method", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            assert.isFunction(logger.error);
        });
    });

    describe("level guards", () => {
        test("isTraceEnabled should return false when level is above trace", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            assert.strictEqual(logger.isTraceEnabled(), false);
        });

        test("isTraceEnabled should return true when level is trace", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.TRACE,
                modules: "*",
                format: {timestamp: true, module: true},
            });
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            assert.strictEqual(logger.isTraceEnabled(), true);
        });

        test("isDebugEnabled should return false when level is above debug", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.INFO,
                modules: "*",
                format: {timestamp: true, module: true},
            });
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            assert.strictEqual(logger.isDebugEnabled(), false);
        });

        test("isDebugEnabled should return true when level is debug or below", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            assert.strictEqual(logger.isDebugEnabled(), true);
        });

        test("level guards should return false when logging is disabled", async() => {
            await GraphtyLogger.configure({
                enabled: false,
                level: LogLevel.TRACE,
                modules: "*",
                format: {timestamp: true, module: true},
            });
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            assert.strictEqual(logger.isTraceEnabled(), false);
            assert.strictEqual(logger.isDebugEnabled(), false);
        });
    });

    describe("structured data", () => {
        beforeEach(async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });
        });

        test("should accept data object", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            // Should not throw
            logger.info("test message", {key: "value", count: 42});
        });

        test("should accept error in error method", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const error = new Error("test error");
            // Should not throw
            logger.error("something went wrong", error);
        });

        test("should accept error and data in error method", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const error = new Error("test error");
            // Should not throw
            logger.error("something went wrong", error, {context: "test"});
        });
    });

    describe("isEnabled", () => {
        test("should return false by default", () => {
            assert.strictEqual(GraphtyLogger.isEnabled(), false);
        });

        test("should return true after enabling", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.INFO,
                modules: "*",
                format: {timestamp: true, module: true},
            });
            assert.strictEqual(GraphtyLogger.isEnabled(), true);
        });
    });
});
