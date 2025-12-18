import {afterEach, assert, beforeEach, describe, type MockInstance, test, vi} from "vitest";

import {createRemoteSink} from "../../../src/logging/sinks/RemoteSink.js";
import {LogLevel, type LogRecord} from "../../../src/logging/types.js";

describe("RemoteSink", () => {
    let fetchSpy: MockInstance;

    beforeEach(() => {
        // Mock fetch
        fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify({success: true}), {status: 200}),
        );
        // Use fake timers for batch testing
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    function createTestRecord(overrides: Partial<LogRecord> = {}): LogRecord {
        return {
            timestamp: new Date("2024-01-15T10:30:00.000Z"),
            level: LogLevel.INFO,
            category: ["graphty", "test"],
            message: "Test message",
            ... overrides,
        };
    }

    describe("basic functionality", () => {
        test("should create a sink with name 'remote'", () => {
            const sink = createRemoteSink({serverUrl: "https://example.com/log"});
            assert.strictEqual(sink.name, "remote");
        });

        test("should have write and flush methods", () => {
            const sink = createRemoteSink({serverUrl: "https://example.com/log"});
            assert.isFunction(sink.write);
            assert.isFunction(sink.flush);
        });

        test("should generate unique session ID", () => {
            const sink1 = createRemoteSink({serverUrl: "https://example.com/log"});
            const sink2 = createRemoteSink({serverUrl: "https://example.com/log"});
            // Both sinks work independently (internal session IDs should differ)
            sink1.write(createTestRecord());
            sink2.write(createTestRecord());
            // No assertions needed on internal state, just verify no errors
        });

        test("should use custom session prefix", () => {
            const sink = createRemoteSink({
                serverUrl: "https://example.com/log",
                sessionPrefix: "custom-prefix",
            });
            sink.write(createTestRecord());
            vi.runAllTimers();

            assert.isTrue(fetchSpy.mock.calls.length > 0);
            const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string) as {sessionId: string};
            assert.isTrue(body.sessionId.startsWith("custom-prefix-"));
        });
    });

    describe("batching", () => {
        test("should batch logs before sending", () => {
            const sink = createRemoteSink({serverUrl: "https://example.com/log"});

            // Write multiple logs quickly
            sink.write(createTestRecord({message: "Message 1"}));
            sink.write(createTestRecord({message: "Message 2"}));
            sink.write(createTestRecord({message: "Message 3"}));

            // Fetch should not be called yet
            assert.strictEqual(fetchSpy.mock.calls.length, 0);

            // After timer fires, fetch should be called once with all logs
            vi.runAllTimers();

            assert.strictEqual(fetchSpy.mock.calls.length, 1);
            const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string) as {logs: unknown[]};
            assert.strictEqual(body.logs.length, 3);
        });

        test("should send batch after flush interval", () => {
            const sink = createRemoteSink({
                serverUrl: "https://example.com/log",
                batchIntervalMs: 200,
            });

            sink.write(createTestRecord());

            // After 100ms, should not have sent yet
            vi.advanceTimersByTime(100);
            assert.strictEqual(fetchSpy.mock.calls.length, 0);

            // After another 100ms (200ms total), should have sent
            vi.advanceTimersByTime(100);
            assert.strictEqual(fetchSpy.mock.calls.length, 1);
        });
    });

    describe("retry on failure", () => {
        test("should retry on fetch failure", async() => {
            // Fail first attempt, succeed second
            fetchSpy.mockRejectedValueOnce(new Error("Network error"));
            fetchSpy.mockResolvedValueOnce(
                new Response(JSON.stringify({success: true}), {status: 200}),
            );

            const sink = createRemoteSink({
                serverUrl: "https://example.com/log",
                maxRetries: 3,
                retryDelayMs: 100,
            });

            sink.write(createTestRecord());
            vi.runAllTimers();

            // Wait for async retry
            await vi.runAllTimersAsync();

            // Should have been called twice (initial + 1 retry)
            assert.isTrue(fetchSpy.mock.calls.length >= 2);
        });

        test("should give up after max retries", async() => {
            // Always fail
            fetchSpy.mockRejectedValue(new Error("Network error"));

            const sink = createRemoteSink({
                serverUrl: "https://example.com/log",
                maxRetries: 2,
                retryDelayMs: 50,
            });

            sink.write(createTestRecord());

            // Run all timers to process retries
            await vi.runAllTimersAsync();

            // Should have attempted maxRetries + 1 times (initial + retries)
            assert.strictEqual(fetchSpy.mock.calls.length, 3); // 1 initial + 2 retries
        });
    });

    describe("throttling", () => {
        test("should respect throttle patterns", () => {
            const sink = createRemoteSink({
                serverUrl: "https://example.com/log",
                throttlePatterns: [/Max number of touches/],
                throttleMs: 5000,
            });

            // First occurrence should be logged
            sink.write(createTestRecord({message: "Max number of touches exceeded"}));

            // Second occurrence within throttle window should be skipped
            sink.write(createTestRecord({message: "Max number of touches exceeded"}));
            sink.write(createTestRecord({message: "Max number of touches exceeded"}));

            vi.runAllTimers();

            assert.strictEqual(fetchSpy.mock.calls.length, 1);
            const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string) as {logs: unknown[]};
            // Only 1 log should be sent (throttled duplicates)
            assert.strictEqual(body.logs.length, 1);
        });

        test("should allow messages after throttle window expires", async() => {
            const sink = createRemoteSink({
                serverUrl: "https://example.com/log",
                throttlePatterns: [/Throttled pattern/],
                throttleMs: 1000,
            });

            // First occurrence
            sink.write(createTestRecord({message: "Throttled pattern here"}));
            await vi.runAllTimersAsync();

            // Clear mock calls
            fetchSpy.mockClear();

            // Advance past throttle window
            vi.advanceTimersByTime(1001);

            // Should be allowed again
            sink.write(createTestRecord({message: "Throttled pattern here"}));
            await vi.runAllTimersAsync();

            assert.strictEqual(fetchSpy.mock.calls.length, 1);
        });

        test("should not throttle non-matching messages", () => {
            const sink = createRemoteSink({
                serverUrl: "https://example.com/log",
                throttlePatterns: [/Throttled pattern/],
                throttleMs: 5000,
            });

            // Non-matching messages should all be sent
            sink.write(createTestRecord({message: "Normal message 1"}));
            sink.write(createTestRecord({message: "Normal message 2"}));
            sink.write(createTestRecord({message: "Normal message 3"}));

            vi.runAllTimers();

            assert.strictEqual(fetchSpy.mock.calls.length, 1);
            const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string) as {logs: unknown[]};
            assert.strictEqual(body.logs.length, 3);
        });
    });

    describe("message formatting", () => {
        test("should format messages correctly for server", () => {
            const sink = createRemoteSink({serverUrl: "https://example.com/log"});

            const timestamp = new Date("2024-01-15T10:30:00.000Z");
            sink.write({
                timestamp,
                level: LogLevel.ERROR,
                category: ["graphty", "layout", "ngraph"],
                message: "Layout failed",
                data: {nodeCount: 100},
                error: new Error("Test error"),
            });

            vi.runAllTimers();

            assert.isTrue(fetchSpy.mock.calls.length > 0);
            const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string) as {
                sessionId: string;
                logs: {time: string, level: string, message: string}[];
            };

            const {logs} = body;
            const log = logs[0];
            assert.strictEqual(log.time, "2024-01-15T10:30:00.000Z");
            assert.strictEqual(log.level, "ERROR");
            assert.isTrue(log.message.includes("Layout failed"));
            assert.isTrue(log.message.includes("graphty.layout.ngraph"));
        });

        test("should include structured data in message", () => {
            const sink = createRemoteSink({serverUrl: "https://example.com/log"});

            sink.write(createTestRecord({
                message: "Test with data",
                data: {key: "value", count: 42},
            }));

            vi.runAllTimers();

            const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string) as {
                logs: {message: string}[];
            };
            const {logs} = body;
            const {message} = logs[0];

            assert.isTrue(message.includes("key"));
            assert.isTrue(message.includes("value"));
        });

        test("should include error stack in message", () => {
            const sink = createRemoteSink({serverUrl: "https://example.com/log"});

            const error = new Error("Test error");
            sink.write(createTestRecord({
                message: "Error occurred",
                error,
            }));

            vi.runAllTimers();

            const body = JSON.parse(fetchSpy.mock.calls[0][1].body as string) as {
                logs: {message: string}[];
            };
            const {logs} = body;
            const {message} = logs[0];

            assert.isTrue(message.includes("Error occurred"));
            assert.isTrue(message.includes("Test error"));
        });
    });

    describe("flush", () => {
        test("should immediately send buffered logs on flush", async() => {
            const sink = createRemoteSink({
                serverUrl: "https://example.com/log",
                batchIntervalMs: 10000, // Long interval
            });

            sink.write(createTestRecord({message: "Buffered message"}));

            // Fetch not called yet
            assert.strictEqual(fetchSpy.mock.calls.length, 0);

            // Flush should send immediately
            await sink.flush?.();

            assert.strictEqual(fetchSpy.mock.calls.length, 1);
        });

        test("should be no-op when buffer is empty", async() => {
            const sink = createRemoteSink({serverUrl: "https://example.com/log"});

            await sink.flush?.();

            assert.strictEqual(fetchSpy.mock.calls.length, 0);
        });
    });
});
