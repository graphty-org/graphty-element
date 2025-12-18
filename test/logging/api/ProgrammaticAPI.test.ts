import {afterEach, assert, beforeEach, describe, type MockInstance, test, vi} from "vitest";

import {GraphtyLogger} from "../../../src/logging/GraphtyLogger.js";
import {configureLogging, getLoggingConfig, resetLoggingConfig} from "../../../src/logging/LoggerConfig.js";
import {LogLevel, type Sink} from "../../../src/logging/types.js";

// Empty mock function to satisfy linter
function noop(): void {
    // Intentionally empty
}

describe("Programmatic API", () => {
    let consoleDebugSpy: MockInstance;
    let consoleInfoSpy: MockInstance;
    let consoleWarnSpy: MockInstance;
    let consoleErrorSpy: MockInstance;

    beforeEach(() => {
        // Reset logging config before each test
        resetLoggingConfig();
        // Spy on console methods
        consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(noop);
        consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(noop);
        consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(noop);
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        resetLoggingConfig();
        // Clear any registered sinks
        for (const sink of GraphtyLogger.getSinks()) {
            GraphtyLogger.removeSink(sink.name);
        }
    });

    describe("GraphtyLogger.configure()", () => {
        test("should configure logging via GraphtyLogger.configure()", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });

            assert.strictEqual(GraphtyLogger.isEnabled(), true);

            const config = getLoggingConfig();
            assert.strictEqual(config.enabled, true);
            assert.strictEqual(config.level, LogLevel.DEBUG);
            assert.deepStrictEqual(config.modules, "*");
        });

        test("should configure with specific modules", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.INFO,
                modules: ["layout", "xr"],
                format: {timestamp: true, module: true},
            });

            const config = getLoggingConfig();
            assert.deepStrictEqual(config.modules, ["layout", "xr"]);
        });

        test("should configure with remote log URL", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
                remoteLogUrl: "https://localhost:9080",
            });

            // Check that a remote sink was registered
            const sinks = GraphtyLogger.getSinks();
            const remoteSink = sinks.find((s) => s.name === "remote");
            assert.isNotNull(remoteSink, "Remote sink should be registered");
        });

        test("should configure with custom sinks", async() => {
            const customSink: Sink = {
                name: "test-sink",
                write: vi.fn(),
            };

            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
                sinks: [customSink],
            });

            const sinks = GraphtyLogger.getSinks();
            const foundSink = sinks.find((s) => s.name === "test-sink");
            assert.isNotNull(foundSink, "Custom sink should be registered");
        });
    });

    describe("getLogger for custom category", () => {
        beforeEach(async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });
        });

        test("should get logger for custom category", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "custom", "category"]);
            assert.isNotNull(logger);
            assert.isFunction(logger.info);
        });

        test("should log with custom category in output", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "custom", "module"]);
            logger.info("test message");

            const allCalls = [
                ... consoleDebugSpy.mock.calls,
                ... consoleInfoSpy.mock.calls,
            ];

            const hasCategory = allCalls.some((call) =>
                call.some((arg: unknown) => typeof arg === "string" && arg.includes("custom.module")),
            );
            assert.isTrue(hasCategory, "Expected output to include custom category");
        });

        test("should support deeply nested categories", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "a", "b", "c", "d"]);
            logger.info("nested test");

            const allCalls = [
                ... consoleDebugSpy.mock.calls,
                ... consoleInfoSpy.mock.calls,
            ];

            const hasCategory = allCalls.some((call) =>
                call.some((arg: unknown) => typeof arg === "string" && arg.includes("a.b.c.d")),
            );
            assert.isTrue(hasCategory, "Expected output to include nested category");
        });
    });

    describe("dynamically enable/disable modules", () => {
        test("should dynamically enable modules", async() => {
            // Start with only layout enabled
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: ["layout"],
                format: {timestamp: true, module: true},
            });

            const xrLogger = GraphtyLogger.getLogger(["graphty", "xr"]);
            xrLogger.info("this should not log");
            assert.strictEqual(consoleInfoSpy.mock.calls.length, 0);

            // Now enable xr module as well
            configureLogging({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: ["layout", "xr"],
                format: {timestamp: true, module: true},
            });

            xrLogger.info("this should log");
            const totalCalls = consoleInfoSpy.mock.calls.length + consoleDebugSpy.mock.calls.length;
            assert.isTrue(totalCalls > 0, "Expected XR logger to log after enabling module");
        });

        test("should dynamically disable modules", async() => {
            // Start with all modules enabled
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const layoutLogger = GraphtyLogger.getLogger(["graphty", "layout"]);
            layoutLogger.info("first message");
            const initialCalls = consoleInfoSpy.mock.calls.length + consoleDebugSpy.mock.calls.length;
            assert.isTrue(initialCalls > 0, "Expected initial log");

            // Now disable layout module by enabling only xr
            configureLogging({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: ["xr"], // layout is no longer enabled
                format: {timestamp: true, module: true},
            });

            vi.clearAllMocks();
            layoutLogger.info("second message should not log");
            assert.strictEqual(consoleInfoSpy.mock.calls.length, 0, "Layout should not log after being disabled");
        });

        test("should enable all modules with '*'", async() => {
            // Start with specific modules
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: ["layout"],
                format: {timestamp: true, module: true},
            });

            // Enable all modules
            configureLogging({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const xrLogger = GraphtyLogger.getLogger(["graphty", "xr"]);
            xrLogger.info("should log now");
            const totalCalls = consoleInfoSpy.mock.calls.length + consoleDebugSpy.mock.calls.length;
            assert.isTrue(totalCalls > 0, "Expected XR logger to log when all modules enabled");
        });
    });

    describe("change log level at runtime", () => {
        beforeEach(async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.INFO,
                modules: "*",
                format: {timestamp: true, module: true},
            });
        });

        test("should change log level at runtime", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);

            // DEBUG should not log at INFO level
            logger.debug("debug message");
            assert.strictEqual(consoleDebugSpy.mock.calls.length, 0);

            // Change to DEBUG level
            configureLogging({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });

            // Now DEBUG should log
            logger.debug("debug message after level change");
            assert.isTrue(consoleDebugSpy.mock.calls.length > 0, "Expected debug to log after level change");
        });

        test("should restrict logging when level is raised", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);

            // INFO should log at INFO level
            logger.info("info message");
            assert.isTrue(consoleInfoSpy.mock.calls.length > 0);

            vi.clearAllMocks();

            // Change to WARN level
            configureLogging({
                enabled: true,
                level: LogLevel.WARN,
                modules: "*",
                format: {timestamp: true, module: true},
            });

            // INFO should no longer log
            logger.info("info message after level change");
            assert.strictEqual(consoleInfoSpy.mock.calls.length, 0, "INFO should not log at WARN level");

            // WARN should still log
            logger.warn("warn message");
            assert.isTrue(consoleWarnSpy.mock.calls.length > 0, "WARN should still log");
        });

        test("should enable all levels with TRACE", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);

            // Change to TRACE level
            configureLogging({
                enabled: true,
                level: LogLevel.TRACE,
                modules: "*",
                format: {timestamp: true, module: true},
            });

            logger.trace("trace message");
            logger.debug("debug message");
            logger.info("info message");

            // All should log (trace and debug go to console.debug)
            const totalCalls = consoleDebugSpy.mock.calls.length + consoleInfoSpy.mock.calls.length;
            assert.isTrue(totalCalls >= 3, "Expected all log levels to log at TRACE level");
        });

        test("should silence all logging with SILENT level", () => {
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);

            // Change to SILENT level
            configureLogging({
                enabled: true,
                level: LogLevel.SILENT,
                modules: "*",
                format: {timestamp: true, module: true},
            });

            logger.error("error message");
            logger.warn("warn message");
            logger.info("info message");
            logger.debug("debug message");
            logger.trace("trace message");

            // Nothing should log
            const totalCalls =
                consoleErrorSpy.mock.calls.length +
                consoleWarnSpy.mock.calls.length +
                consoleInfoSpy.mock.calls.length +
                consoleDebugSpy.mock.calls.length;
            assert.strictEqual(totalCalls, 0, "Expected no logs at SILENT level");
        });
    });

    describe("register custom sinks", () => {
        beforeEach(async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });
        });

        test("should register custom sink via addSink", () => {
            const customSink: Sink = {
                name: "my-custom-sink",
                write: vi.fn(),
            };

            GraphtyLogger.addSink(customSink);

            const sinks = GraphtyLogger.getSinks();
            const foundSink = sinks.find((s) => s.name === "my-custom-sink");
            assert.isNotNull(foundSink, "Custom sink should be registered");
        });

        test("should receive log records in custom sink", () => {
            const writeFn = vi.fn();
            const customSink: Sink = {
                name: "test-receiver-sink",
                write: writeFn,
            };

            GraphtyLogger.addSink(customSink);

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.info("test message", {key: "value"});

            assert.isTrue(writeFn.mock.calls.length > 0, "Custom sink should receive log record");

            const record = writeFn.mock.calls[0][0];
            assert.strictEqual(record.message, "test message");
            assert.deepStrictEqual(record.category, ["graphty", "test"]);
            assert.strictEqual(record.level, LogLevel.INFO);
            assert.deepStrictEqual(record.data, {key: "value"});
        });

        test("should remove sink by name", () => {
            const customSink: Sink = {
                name: "removable-sink",
                write: vi.fn(),
            };

            GraphtyLogger.addSink(customSink);
            assert.isTrue(
                GraphtyLogger.getSinks().some((s) => s.name === "removable-sink"),
                "Sink should exist before removal",
            );

            const removed = GraphtyLogger.removeSink("removable-sink");
            assert.isTrue(removed, "removeSink should return true");
            assert.isFalse(
                GraphtyLogger.getSinks().some((s) => s.name === "removable-sink"),
                "Sink should be removed",
            );
        });

        test("should return false when removing non-existent sink", () => {
            const removed = GraphtyLogger.removeSink("non-existent-sink");
            assert.isFalse(removed, "removeSink should return false for non-existent sink");
        });

        test("should dispatch to multiple sinks", () => {
            const writeFn1 = vi.fn();
            const writeFn2 = vi.fn();

            GraphtyLogger.addSink({name: "sink1", write: writeFn1});
            GraphtyLogger.addSink({name: "sink2", write: writeFn2});

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.info("multi-sink test");

            assert.isTrue(writeFn1.mock.calls.length > 0, "Sink 1 should receive log");
            assert.isTrue(writeFn2.mock.calls.length > 0, "Sink 2 should receive log");
        });
    });

    describe("getLoggingConfig()", () => {
        test("should return current configuration", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.WARN,
                modules: ["test", "layout"],
                format: {timestamp: false, module: true, colors: true},
            });

            const config = getLoggingConfig();
            assert.strictEqual(config.enabled, true);
            assert.strictEqual(config.level, LogLevel.WARN);
            assert.deepStrictEqual(config.modules, ["test", "layout"]);
            assert.strictEqual(config.format.timestamp, false);
            assert.strictEqual(config.format.module, true);
            assert.strictEqual(config.format.colors, true);
        });

        test("should return default configuration when not configured", () => {
            const config = getLoggingConfig();
            assert.strictEqual(config.enabled, false);
            assert.strictEqual(config.level, LogLevel.INFO);
            assert.strictEqual(config.modules, "*");
        });
    });
});
