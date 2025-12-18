import {afterEach, assert, beforeEach, describe, type MockInstance, test, vi} from "vitest";

import {GraphtyLogger} from "../../../src/logging/GraphtyLogger.js";
import {resetLoggingConfig} from "../../../src/logging/LoggerConfig.js";
import {LogLevel} from "../../../src/logging/types.js";

// Empty mock function to satisfy linter
function noop(): void {
    // Intentionally empty
}

describe("Disabled Logging Overhead", () => {
    let consoleDebugSpy: MockInstance;
    let consoleInfoSpy: MockInstance;
    let consoleWarnSpy: MockInstance;
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
        // Reset logging config before each test
        resetLoggingConfig();
        // Spy on console methods
        vi.spyOn(console, "log").mockImplementation(noop);
        consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(noop);
        consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(noop);
        consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(noop);
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        resetLoggingConfig();
    });

    describe("zero overhead when disabled", () => {
        test("should have zero overhead when disabled", async() => {
            await GraphtyLogger.configure({
                enabled: false,
                level: LogLevel.TRACE,
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);

            // Log many messages
            for (let i = 0; i < 1000; i++) {
                logger.trace("trace message");
                logger.debug("debug message");
                logger.info("info message");
                logger.warn("warn message");
                logger.error("error message");
            }

            // No console methods should be called
            assert.strictEqual(consoleDebugSpy.mock.calls.length, 0);
            assert.strictEqual(consoleInfoSpy.mock.calls.length, 0);
            assert.strictEqual(consoleWarnSpy.mock.calls.length, 0);
            assert.strictEqual(consoleErrorSpy.mock.calls.length, 0);
        });

        test("should not construct messages when disabled", async() => {
            await GraphtyLogger.configure({
                enabled: false,
                level: LogLevel.TRACE,
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const messageConstructor = vi.fn().mockReturnValue("expensive message");

            // Call the logger with the result of the function
            // If the logger is disabled, the function should NOT be called
            // because we use isDebugEnabled() guard
            if (logger.isDebugEnabled()) {
                logger.debug(messageConstructor());
            }

            assert.strictEqual(messageConstructor.mock.calls.length, 0);
        });

        test("should not call expensive data functions when level filtered", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.WARN, // Only warn and above
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const expensiveDataFn = vi.fn().mockReturnValue({computed: "data"});

            // Use the level guard to avoid calling expensive function
            if (logger.isDebugEnabled()) {
                logger.debug("message", expensiveDataFn());
            }

            // Expensive function should not be called because debug is filtered
            assert.strictEqual(expensiveDataFn.mock.calls.length, 0);
        });
    });

    describe("level guards prevent overhead", () => {
        test("isTraceEnabled prevents expensive operations when trace is filtered", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.INFO, // Trace is filtered
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const expensiveFn = vi.fn().mockReturnValue("expensive");

            if (logger.isTraceEnabled()) {
                logger.trace("expensive operation", {data: expensiveFn()});
            }

            assert.strictEqual(expensiveFn.mock.calls.length, 0);
        });

        test("isDebugEnabled prevents expensive operations when debug is filtered", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.WARN, // Debug is filtered
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const expensiveFn = vi.fn().mockReturnValue("expensive");

            if (logger.isDebugEnabled()) {
                logger.debug("expensive operation", {data: expensiveFn()});
            }

            assert.strictEqual(expensiveFn.mock.calls.length, 0);
        });

        test("isDebugEnabled allows logging when debug is enabled", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const expensiveFn = vi.fn().mockReturnValue("expensive");

            if (logger.isDebugEnabled()) {
                logger.debug("expensive operation", {data: expensiveFn()});
            }

            // Function should be called because debug is enabled
            assert.strictEqual(expensiveFn.mock.calls.length, 1);
        });
    });

    describe("module filtering prevents overhead", () => {
        test("should not call log methods when module is filtered", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.TRACE,
                modules: ["layout"], // Only layout is enabled
                format: {timestamp: true, module: true},
            });

            const xrLogger = GraphtyLogger.getLogger(["graphty", "xr"]);

            // Even with trace level, XR module is filtered
            xrLogger.trace("trace message");
            xrLogger.debug("debug message");
            xrLogger.info("info message");
            xrLogger.warn("warn message");
            xrLogger.error("error message");

            // No console methods should be called because module is filtered
            assert.strictEqual(consoleDebugSpy.mock.calls.length, 0);
            assert.strictEqual(consoleInfoSpy.mock.calls.length, 0);
            assert.strictEqual(consoleWarnSpy.mock.calls.length, 0);
            assert.strictEqual(consoleErrorSpy.mock.calls.length, 0);
        });

        test("should log when module is enabled", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: ["layout"], // Only layout is enabled
                format: {timestamp: true, module: true},
            });

            const layoutLogger = GraphtyLogger.getLogger(["graphty", "layout"]);

            layoutLogger.info("info message");

            // Console.info should be called for enabled module
            assert.strictEqual(consoleInfoSpy.mock.calls.length, 1);
        });
    });
});
