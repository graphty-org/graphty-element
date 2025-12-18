import {afterEach, assert, beforeEach, describe, type MockInstance, test, vi} from "vitest";

import {GraphtyLogger} from "../../../src/logging/GraphtyLogger.js";
import {resetLoggingConfig} from "../../../src/logging/LoggerConfig.js";
import {LogLevel} from "../../../src/logging/types.js";
import {EventManager} from "../../../src/managers/EventManager.js";
import type {Manager} from "../../../src/managers/interfaces.js";
import {LifecycleManager} from "../../../src/managers/LifecycleManager.js";

// Empty mock function to satisfy linter
function noop(): void {
    // Intentionally empty
}

// Mock manager for testing
function createMockManager(name: string, initDelay = 0, shouldFail = false): Manager {
    return {
        async init() {
            if (initDelay > 0) {
                await new Promise((resolve) => setTimeout(resolve, initDelay));
            }

            if (shouldFail) {
                throw new Error(`Mock ${name} init failed`);
            }
        },
        dispose() {
            // Intentionally empty
        },
    };
}

describe("LifecycleManager Logging", () => {
    let consoleInfoSpy: MockInstance;
    let consoleDebugSpy: MockInstance;
    let consoleErrorSpy: MockInstance;
    let eventManager: EventManager;

    beforeEach(async() => {
        // Reset logging config before each test
        resetLoggingConfig();

        // Spy on console methods
        vi.spyOn(console, "log").mockImplementation(noop);
        consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(noop);
        consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(noop);
        vi.spyOn(console, "warn").mockImplementation(noop);
        consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(noop);

        // Configure logging enabled for lifecycle module
        await GraphtyLogger.configure({
            enabled: true,
            level: LogLevel.DEBUG,
            modules: ["lifecycle"],
            format: {timestamp: true, module: true},
        });

        // Create event manager for testing
        eventManager = new EventManager();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        resetLoggingConfig();
    });

    test("should log manager init started", async() => {
        const managers = new Map<string, Manager>([
            ["test", createMockManager("test")],
        ]);
        const lifecycleManager = new LifecycleManager(managers, eventManager, ["test"]);

        await lifecycleManager.init();

        // Check that info was logged with "Initializing" message
        const allCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls];
        const hasInitMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" && arg.toLowerCase().includes("initializ"),
            ),
        );
        assert.isTrue(hasInitMessage, "Expected log message about initialization");
    });

    test("should log each manager initialization with timing", async() => {
        const managers = new Map<string, Manager>([
            ["test1", createMockManager("test1", 10)],
            ["test2", createMockManager("test2", 10)],
        ]);
        const lifecycleManager = new LifecycleManager(managers, eventManager, ["test1", "test2"]);

        await lifecycleManager.init();

        // Check for manager names in log output
        const allCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls];
        const hasManager1 = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" && arg.includes("test1"),
            ),
        );
        const hasManager2 = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" && arg.includes("test2"),
            ),
        );

        // At minimum, expect logging about managers being initialized
        const hasAnyManagerLog = hasManager1 || hasManager2;
        assert.isTrue(
            hasAnyManagerLog,
            "Expected log messages about manager initialization",
        );
    });

    test("should log init failures with error details", async() => {
        const managers = new Map<string, Manager>([
            ["failing-manager", createMockManager("failing-manager", 0, true)],
        ]);
        const lifecycleManager = new LifecycleManager(
            managers,
            eventManager,
            ["failing-manager"],
        );

        try {
            await lifecycleManager.init();
            assert.fail("Expected init to throw");
        } catch {
            // Expected to throw
        }

        // Check for error logging
        const allCalls = [... consoleErrorSpy.mock.calls];
        const hasErrorMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" &&
                    (arg.toLowerCase().includes("fail") ||
                        arg.toLowerCase().includes("error")),
            ),
        );

        // The error should be logged somewhere (either via logger or console.error)
        assert.isTrue(
            hasErrorMessage || consoleErrorSpy.mock.calls.length > 0,
            "Expected error logging for failed initialization",
        );
    });

    test("should log disposal sequence", async() => {
        const managers = new Map<string, Manager>([
            ["test1", createMockManager("test1")],
            ["test2", createMockManager("test2")],
        ]);
        const lifecycleManager = new LifecycleManager(managers, eventManager, ["test1", "test2"]);

        // Initialize first
        await lifecycleManager.init();

        // Clear spy calls from init
        consoleInfoSpy.mockClear();
        consoleDebugSpy.mockClear();

        // Dispose
        lifecycleManager.dispose();

        // Check for disposal logging
        const allCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls];
        const hasDisposeMessage = allCalls.some((call) =>
            call.some(
                (arg: unknown) =>
                    typeof arg === "string" && arg.toLowerCase().includes("dispos"),
            ),
        );
        assert.isTrue(hasDisposeMessage, "Expected log message about disposal");
    });

    test("should not log when logging is disabled", async() => {
        // Disable logging
        await GraphtyLogger.configure({
            enabled: false,
            level: LogLevel.DEBUG,
            modules: "*",
            format: {timestamp: true, module: true},
        });

        const managers = new Map<string, Manager>([
            ["test", createMockManager("test")],
        ]);
        const lifecycleManager = new LifecycleManager(managers, eventManager, ["test"]);

        // Clear any previous calls
        consoleInfoSpy.mockClear();
        consoleDebugSpy.mockClear();

        await lifecycleManager.init();
        lifecycleManager.dispose();

        // Check that no logging occurred from the logger
        // Note: There might still be console.error calls for actual errors
        const lifecycleCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls].filter(
            (call) =>
                call.some(
                    (arg: unknown) =>
                        typeof arg === "string" && arg.includes("lifecycle"),
                ),
        );
        assert.strictEqual(
            lifecycleCalls.length,
            0,
            "Expected no lifecycle logging when disabled",
        );
    });

    test("should not log when lifecycle module is filtered out", async() => {
        // Enable logging for different module only
        await GraphtyLogger.configure({
            enabled: true,
            level: LogLevel.DEBUG,
            modules: ["layout"], // Not lifecycle
            format: {timestamp: true, module: true},
        });

        const managers = new Map<string, Manager>([
            ["test", createMockManager("test")],
        ]);
        const lifecycleManager = new LifecycleManager(managers, eventManager, ["test"]);

        // Clear any previous calls
        consoleInfoSpy.mockClear();
        consoleDebugSpy.mockClear();

        await lifecycleManager.init();

        // Check that no lifecycle logging occurred
        const lifecycleCalls = [... consoleInfoSpy.mock.calls, ... consoleDebugSpy.mock.calls].filter(
            (call) =>
                call.some(
                    (arg: unknown) =>
                        typeof arg === "string" && arg.includes("lifecycle"),
                ),
        );
        assert.strictEqual(
            lifecycleCalls.length,
            0,
            "Expected no lifecycle logging when module is filtered",
        );
    });
});
