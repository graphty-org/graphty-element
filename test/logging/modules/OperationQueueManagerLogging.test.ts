import {afterEach, assert, beforeEach, describe, type MockInstance, test, vi} from "vitest";

import {GraphtyLogger} from "../../../src/logging/GraphtyLogger.js";
import {resetLoggingConfig} from "../../../src/logging/LoggerConfig.js";
import {LogLevel} from "../../../src/logging/types.js";

// Empty mock function to satisfy linter
function noop(): void {
    // Intentionally empty
}

/**
 * These tests verify that OperationQueueManager properly integrates with the logging system.
 *
 * We test the logging behavior by:
 * 1. Enabling logging for the "operation" module
 * 2. Simulating OperationQueueManager operations via logger calls
 * 3. Verifying console output contains expected log messages
 */
describe("OperationQueueManager Logging", () => {
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

        // Configure logging enabled for operation module
        await GraphtyLogger.configure({
            enabled: true,
            level: LogLevel.DEBUG,
            modules: ["operation"],
            format: {timestamp: true, module: true},
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        resetLoggingConfig();
    });

    test("should have logger that can log operation queued", () => {
        const logger = GraphtyLogger.getLogger(["graphty", "operation"]);

        // Simulate operation queued logging
        logger.debug("Operation queued", {
            id: "op-123",
            category: "layout-set",
        });

        // Check for log output
        const allCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls];
        const hasQueueMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    arg.toLowerCase().includes("queue"),
            ),
        );
        assert.isTrue(hasQueueMessage, "Expected log message about operation queued");
    });

    test("should have logger that can log operation started", () => {
        const logger = GraphtyLogger.getLogger(["graphty", "operation"]);

        // Simulate operation start logging
        logger.debug("Operation started", {
            id: "op-123",
            category: "data-add",
            description: "Adding 100 nodes",
        });

        // Check for log output
        const allCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls];
        const hasStartMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    arg.toLowerCase().includes("start"),
            ),
        );
        assert.isTrue(hasStartMessage, "Expected log message about operation started");
    });

    test("should have logger that can log operation completed", () => {
        const logger = GraphtyLogger.getLogger(["graphty", "operation"]);

        // Simulate operation completion logging
        logger.debug("Operation completed", {
            id: "op-123",
            category: "layout-set",
            duration: 150,
        });

        // Check for log output
        const allCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls];
        const hasCompleteMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    arg.toLowerCase().includes("complet"),
            ),
        );
        assert.isTrue(hasCompleteMessage, "Expected log message about operation completed");
    });

    test("should have logger that can log operation errors", () => {
        const logger = GraphtyLogger.getLogger(["graphty", "operation"]);

        // Simulate operation error logging
        const error = new Error("Operation failed");
        logger.error("Operation failed", error, {
            id: "op-123",
            category: "data-add",
        });

        // Check for error log output
        const allCalls = [... consoleErrorSpy.mock.calls];
        const hasErrorMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    arg.toLowerCase().includes("fail"),
            ),
        );
        assert.isTrue(hasErrorMessage, "Expected error log message about operation failure");
    });

    test("should have logger that can log batch execution", () => {
        const logger = GraphtyLogger.getLogger(["graphty", "operation"]);

        // Simulate batch execution logging
        logger.debug("Executing operation batch", {
            operationCount: 5,
            categories: ["style-init", "data-add", "layout-set"],
        });

        // Check for log output
        const allCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls];
        const hasBatchMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    arg.toLowerCase().includes("batch"),
            ),
        );
        assert.isTrue(hasBatchMessage, "Expected log message about batch execution");
    });

    test("should not log when logging is disabled", async() => {
        // Disable logging
        await GraphtyLogger.configure({
            enabled: false,
            level: LogLevel.DEBUG,
            modules: "*",
            format: {timestamp: true, module: true},
        });

        const logger = GraphtyLogger.getLogger(["graphty", "operation"]);

        // Clear any previous calls
        consoleInfoSpy.mockClear();
        consoleDebugSpy.mockClear();

        // Try to log
        logger.debug("Operation queued", {id: "op-123"});
        logger.debug("Operation completed");

        // Check that no operation logging occurred
        const operationCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls].filter(
            (call) =>
                call.some(
                    (arg: unknown) =>
                        typeof arg === "string" && arg.includes("operation"),
                ),
        );
        assert.strictEqual(
            operationCalls.length,
            0,
            "Expected no operation logging when disabled",
        );
    });

    test("should not log when operation module is filtered out", async() => {
        // Enable logging for different module only
        await GraphtyLogger.configure({
            enabled: true,
            level: LogLevel.DEBUG,
            modules: ["layout"], // Not operation
            format: {timestamp: true, module: true},
        });

        const logger = GraphtyLogger.getLogger(["graphty", "operation"]);

        // Clear any previous calls
        consoleInfoSpy.mockClear();
        consoleDebugSpy.mockClear();

        // Try to log
        logger.debug("Operation queued", {id: "op-123"});

        // Check that no operation logging occurred
        const operationCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls].filter(
            (call) =>
                call.some(
                    (arg: unknown) =>
                        typeof arg === "string" && arg.includes("operation"),
                ),
        );
        assert.strictEqual(
            operationCalls.length,
            0,
            "Expected no operation logging when module is filtered",
        );
    });
});
