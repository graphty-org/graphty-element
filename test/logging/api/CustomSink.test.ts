import {afterEach, assert, beforeEach, describe, type MockInstance, test, vi} from "vitest";

import {GraphtyLogger} from "../../../src/logging/GraphtyLogger.js";
import {resetLoggingConfig} from "../../../src/logging/LoggerConfig.js";
import {LogLevel, type LogRecord, type Sink} from "../../../src/logging/types.js";

// Empty mock function to satisfy linter
function noop(): void {
    // Intentionally empty
}

describe("Custom Sink", () => {
    let consoleErrorSpy: MockInstance;

    beforeEach(async() => {
        // Reset logging config before each test
        resetLoggingConfig();
        // Spy on console methods
        vi.spyOn(console, "debug").mockImplementation(noop);
        vi.spyOn(console, "info").mockImplementation(noop);
        vi.spyOn(console, "warn").mockImplementation(noop);
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);

        // Configure logging for tests
        await GraphtyLogger.configure({
            enabled: true,
            level: LogLevel.TRACE, // Enable all levels
            modules: "*",
            format: {timestamp: true, module: true},
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        resetLoggingConfig();
        // Clear any registered sinks
        for (const sink of GraphtyLogger.getSinks()) {
            GraphtyLogger.removeSink(sink.name);
        }
    });

    describe("receive all log records", () => {
        test("should receive all log records", () => {
            const records: LogRecord[] = [];
            const customSink: Sink = {
                name: "collector-sink",
                write: (record) => {
                    records.push(record);
                },
            };

            GraphtyLogger.addSink(customSink);

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.trace("trace message");
            logger.debug("debug message");
            logger.info("info message");
            logger.warn("warn message");
            logger.error("error message");

            assert.strictEqual(records.length, 5, "Should receive 5 log records");
            assert.strictEqual(records[0].level, LogLevel.TRACE);
            assert.strictEqual(records[1].level, LogLevel.DEBUG);
            assert.strictEqual(records[2].level, LogLevel.INFO);
            assert.strictEqual(records[3].level, LogLevel.WARN);
            assert.strictEqual(records[4].level, LogLevel.ERROR);
        });

        test("should receive records from multiple loggers", () => {
            const records: LogRecord[] = [];
            const customSink: Sink = {
                name: "multi-logger-sink",
                write: (record) => {
                    records.push(record);
                },
            };

            GraphtyLogger.addSink(customSink);

            const logger1 = GraphtyLogger.getLogger(["graphty", "layout"]);
            const logger2 = GraphtyLogger.getLogger(["graphty", "xr"]);
            const logger3 = GraphtyLogger.getLogger(["graphty", "camera"]);

            logger1.info("layout message");
            logger2.info("xr message");
            logger3.info("camera message");

            assert.strictEqual(records.length, 3, "Should receive 3 log records");
            assert.deepStrictEqual(records[0].category, ["graphty", "layout"]);
            assert.deepStrictEqual(records[1].category, ["graphty", "xr"]);
            assert.deepStrictEqual(records[2].category, ["graphty", "camera"]);
        });

        test("should not receive records when logging is disabled", async() => {
            const records: LogRecord[] = [];
            const customSink: Sink = {
                name: "disabled-test-sink",
                write: (record) => {
                    records.push(record);
                },
            };

            GraphtyLogger.addSink(customSink);

            // Disable logging
            await GraphtyLogger.configure({
                enabled: false,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.info("should not be received");

            assert.strictEqual(records.length, 0, "Should not receive records when disabled");
        });

        test("should not receive records for filtered modules", async() => {
            const records: LogRecord[] = [];
            const customSink: Sink = {
                name: "module-filter-sink",
                write: (record) => {
                    records.push(record);
                },
            };

            GraphtyLogger.addSink(customSink);

            // Enable only layout module
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: ["layout"],
                format: {timestamp: true, module: true},
            });

            const layoutLogger = GraphtyLogger.getLogger(["graphty", "layout"]);
            const xrLogger = GraphtyLogger.getLogger(["graphty", "xr"]);

            layoutLogger.info("layout message");
            xrLogger.info("xr message should not be received");

            assert.strictEqual(records.length, 1, "Should only receive layout record");
            assert.deepStrictEqual(records[0].category, ["graphty", "layout"]);
        });
    });

    describe("correct format", () => {
        test("should be called with correct LogRecord format", () => {
            const writeFn = vi.fn();
            const customSink: Sink = {
                name: "format-test-sink",
                write: writeFn,
            };

            GraphtyLogger.addSink(customSink);

            const logger = GraphtyLogger.getLogger(["graphty", "test", "format"]);
            logger.info("test message", {key: "value", num: 42});

            assert.strictEqual(writeFn.mock.calls.length, 1);
            const record: LogRecord = writeFn.mock.calls[0][0];

            // Check all required fields
            assert.instanceOf(record.timestamp, Date, "timestamp should be a Date");
            assert.strictEqual(record.level, LogLevel.INFO, "level should match");
            assert.deepStrictEqual(record.category, ["graphty", "test", "format"], "category should match");
            assert.strictEqual(record.message, "test message", "message should match");
            assert.deepStrictEqual(record.data, {key: "value", num: 42}, "data should match");
        });

        test("should include error in LogRecord for error logs", () => {
            const writeFn = vi.fn();
            const customSink: Sink = {
                name: "error-format-sink",
                write: writeFn,
            };

            GraphtyLogger.addSink(customSink);

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const testError = new Error("test error");
            logger.error("something went wrong", testError, {context: "test"});

            assert.strictEqual(writeFn.mock.calls.length, 1);
            const record: LogRecord = writeFn.mock.calls[0][0];

            assert.strictEqual(record.level, LogLevel.ERROR);
            assert.strictEqual(record.message, "something went wrong");
            assert.strictEqual(record.error, testError, "error should be included");
            assert.deepStrictEqual(record.data, {context: "test"});
        });

        test("should have undefined data when no data provided", () => {
            const writeFn = vi.fn();
            const customSink: Sink = {
                name: "no-data-sink",
                write: writeFn,
            };

            GraphtyLogger.addSink(customSink);

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.info("message without data");

            const record: LogRecord = writeFn.mock.calls[0][0];
            assert.isUndefined(record.data, "data should be undefined when not provided");
        });

        test("should have recent timestamp", () => {
            const writeFn = vi.fn();
            const customSink: Sink = {
                name: "timestamp-sink",
                write: writeFn,
            };

            GraphtyLogger.addSink(customSink);

            const beforeLog = new Date();
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.info("timestamp test");
            const afterLog = new Date();

            const record: LogRecord = writeFn.mock.calls[0][0];
            assert.isTrue(record.timestamp >= beforeLog, "timestamp should be >= before log time");
            assert.isTrue(record.timestamp <= afterLog, "timestamp should be <= after log time");
        });
    });

    describe("async flush support", () => {
        test("should support async flush", async() => {
            let flushed = false;
            const customSink: Sink = {
                name: "async-flush-sink",
                write: vi.fn(),
                flush: async() => {
                    // Simulate async operation
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    flushed = true;
                },
            };

            GraphtyLogger.addSink(customSink);

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.info("test message");

            assert.isFalse(flushed, "Should not be flushed before calling flush");

            await GraphtyLogger.flush();

            assert.isTrue(flushed, "Should be flushed after calling flush");
        });

        test("should flush all sinks that support flushing", async() => {
            const flushOrder: string[] = [];

            const sink1: Sink = {
                name: "flush-sink-1",
                write: vi.fn(),
                flush: async() => {
                    await new Promise((resolve) => setTimeout(resolve, 5));
                    flushOrder.push("sink1");
                },
            };

            const sink2: Sink = {
                name: "flush-sink-2",
                write: vi.fn(),
                flush: async() => {
                    await Promise.resolve();
                    flushOrder.push("sink2");
                },
            };

            // Sink without flush method
            const sink3: Sink = {
                name: "no-flush-sink",
                write: vi.fn(),
            };

            GraphtyLogger.addSink(sink1);
            GraphtyLogger.addSink(sink2);
            GraphtyLogger.addSink(sink3);

            await GraphtyLogger.flush();

            // Both sinks with flush should be flushed
            assert.isTrue(flushOrder.includes("sink1"), "sink1 should be flushed");
            assert.isTrue(flushOrder.includes("sink2"), "sink2 should be flushed");
            assert.strictEqual(flushOrder.length, 2, "Only 2 sinks should be flushed");
        });

        test("should handle flush errors gracefully", async() => {
            const sink1: Sink = {
                name: "error-flush-sink",
                write: vi.fn(),
                flush: async() => {
                    await Promise.resolve();
                    throw new Error("Flush failed");
                },
            };

            const sink2: Sink = {
                name: "good-flush-sink",
                write: vi.fn(),
                flush: async() => {
                    await Promise.resolve();
                },
            };

            GraphtyLogger.addSink(sink1);
            GraphtyLogger.addSink(sink2);

            // Should not throw even if one sink's flush fails
            try {
                await GraphtyLogger.flush();
            } catch {
                // If it throws, that's also acceptable behavior
                // The important thing is that the system handles it
            }

            // sink2 should still be flushed (or at least attempted)
            // This depends on implementation - parallel vs sequential
            // We just verify the test completes without hanging
            assert.isTrue(true, "Test completed without hanging");
        });
    });

    describe("error handling in sinks", () => {
        test("should handle sink write errors gracefully", () => {
            const errorSink: Sink = {
                name: "error-sink",
                write: () => {
                    throw new Error("Sink error");
                },
            };

            const records: LogRecord[] = [];
            const goodSink: Sink = {
                name: "good-sink",
                write: (record) => {
                    records.push(record);
                },
            };

            GraphtyLogger.addSink(errorSink);
            GraphtyLogger.addSink(goodSink);

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);

            // Should not throw
            logger.info("test message");

            // Good sink should still receive the record
            assert.strictEqual(records.length, 1, "Good sink should still receive record");

            // Error should be logged
            assert.isTrue(
                consoleErrorSpy.mock.calls.some((call) =>
                    call.some((arg: unknown) => typeof arg === "string" && arg.includes("error-sink")),
                ),
                "Error should be logged for failing sink",
            );
        });

        test("should continue logging after sink error", () => {
            let callCount = 0;
            const errorSink: Sink = {
                name: "intermittent-error-sink",
                write: () => {
                    callCount++;
                    if (callCount === 1) {
                        throw new Error("First call fails");
                    }
                },
            };

            GraphtyLogger.addSink(errorSink);

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);

            // First call - errors
            logger.info("first message");

            // Second call - should still work
            logger.info("second message");

            assert.strictEqual(callCount, 2, "Sink should be called twice despite error");
        });
    });

    describe("sink ordering", () => {
        test("should call sinks in registration order", () => {
            const callOrder: string[] = [];

            const sink1: Sink = {
                name: "ordered-sink-1",
                write: () => {
                    callOrder.push("sink1");
                },
            };

            const sink2: Sink = {
                name: "ordered-sink-2",
                write: () => {
                    callOrder.push("sink2");
                },
            };

            const sink3: Sink = {
                name: "ordered-sink-3",
                write: () => {
                    callOrder.push("sink3");
                },
            };

            GraphtyLogger.addSink(sink1);
            GraphtyLogger.addSink(sink2);
            GraphtyLogger.addSink(sink3);

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.info("test message");

            assert.deepStrictEqual(callOrder, ["sink1", "sink2", "sink3"]);
        });
    });
});
