import {afterEach, assert, beforeEach, describe, type MockInstance, test, vi} from "vitest";

import {GraphtyLogger} from "../../../src/logging/GraphtyLogger.js";
import {lazy} from "../../../src/logging/LazyEval.js";
import {resetLoggingConfig} from "../../../src/logging/LoggerConfig.js";
import {LogLevel} from "../../../src/logging/types.js";

// Empty mock function to satisfy linter
function noop(): void {
    // Intentionally empty
}

describe("Lazy Evaluation", () => {
    let consoleDebugSpy: MockInstance;

    beforeEach(() => {
        // Reset logging config before each test
        resetLoggingConfig();
        // Spy on console methods
        vi.spyOn(console, "log").mockImplementation(noop);
        consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(noop);
        vi.spyOn(console, "info").mockImplementation(noop);
        vi.spyOn(console, "warn").mockImplementation(noop);
        vi.spyOn(console, "error").mockImplementation(noop);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        resetLoggingConfig();
    });

    describe("lazy() helper function", () => {
        test("should not evaluate lazy function when level filtered", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.WARN, // Debug is filtered
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const expensiveFn = vi.fn().mockReturnValue({computed: "expensive data"});
            const lazyData = lazy(expensiveFn);

            // Log with lazy data - should not evaluate because debug is filtered
            logger.debug("message", {data: lazyData});

            assert.strictEqual(expensiveFn.mock.calls.length, 0);
        });

        test("should evaluate lazy function when level passes", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG, // Debug is enabled
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const expensiveFn = vi.fn().mockReturnValue({computed: "expensive data"});
            const lazyData = lazy(expensiveFn);

            // Log with lazy data - should evaluate because debug is enabled
            logger.debug("message", {data: lazyData});

            assert.strictEqual(expensiveFn.mock.calls.length, 1);
        });

        test("should work with isDebugEnabled() guard", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.WARN, // Debug is filtered
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const expensiveFn = vi.fn().mockReturnValue({computed: "expensive data"});

            // Pattern: Use isDebugEnabled() guard with lazy evaluation
            if (logger.isDebugEnabled()) {
                const lazyData = lazy(expensiveFn);
                logger.debug("message", {data: lazyData});
            }

            // Function should not be called because of the guard
            assert.strictEqual(expensiveFn.mock.calls.length, 0);
        });

        test("should not evaluate when logging is disabled", async() => {
            await GraphtyLogger.configure({
                enabled: false,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const expensiveFn = vi.fn().mockReturnValue({computed: "expensive data"});
            const lazyData = lazy(expensiveFn);

            // Log with lazy data - should not evaluate because logging is disabled
            logger.debug("message", {data: lazyData});

            assert.strictEqual(expensiveFn.mock.calls.length, 0);
        });

        test("should not evaluate when module is filtered", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: ["layout"], // Only layout is enabled
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "xr"]);
            const expensiveFn = vi.fn().mockReturnValue({computed: "expensive data"});
            const lazyData = lazy(expensiveFn);

            // Log with lazy data - should not evaluate because xr module is filtered
            logger.debug("message", {data: lazyData});

            assert.strictEqual(expensiveFn.mock.calls.length, 0);
        });
    });

    describe("lazy() return type", () => {
        test("should return a function that returns the computed value", () => {
            const expensiveFn = vi.fn().mockReturnValue({result: 42});
            const lazyFn = lazy(expensiveFn);

            // lazy() returns a function
            assert.isFunction(lazyFn);

            // Calling the lazy function invokes the expensive function
            const result = lazyFn();
            assert.deepStrictEqual(result, {result: 42});
            assert.strictEqual(expensiveFn.mock.calls.length, 1);
        });

        test("should cache the result on subsequent calls", () => {
            let callCount = 0;
            const expensiveFn = (): {counter: number} => {
                callCount++;
                return {counter: callCount};
            };
            const lazyFn = lazy(expensiveFn);

            // First call computes the value
            const result1 = lazyFn();
            assert.deepStrictEqual(result1, {counter: 1});

            // Second call returns cached value
            const result2 = lazyFn();
            assert.deepStrictEqual(result2, {counter: 1}); // Still 1, not 2
            assert.strictEqual(callCount, 1); // Only called once
        });

        test("should preserve type of returned value", () => {
            const stringFn = lazy(() => "hello");
            const numberFn = lazy(() => 42);
            const objectFn = lazy(() => ({key: "value"}));

            assert.strictEqual(stringFn(), "hello");
            assert.strictEqual(numberFn(), 42);
            assert.deepStrictEqual(objectFn(), {key: "value"});
        });
    });

    describe("performance patterns", () => {
        test("pattern: lazy evaluation for expensive object serialization", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.INFO, // Debug is filtered
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const serializeFn = vi.fn().mockReturnValue({serialized: "data"});

            // Common pattern: wrap expensive serialization in lazy()
            logger.debug("Node data", {
                serialized: lazy(serializeFn),
            });

            // Serialization should not happen because debug is filtered
            assert.strictEqual(serializeFn.mock.calls.length, 0);
        });

        test("pattern: lazy evaluation for expensive computation", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.WARN, // Debug and info are filtered
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const computeFn = vi.fn().mockReturnValue([1, 2, 3, 4, 5]);

            // Common pattern: wrap expensive computation in lazy()
            logger.debug("Layout positions", {
                positions: lazy(computeFn),
            });

            // Computation should not happen
            assert.strictEqual(computeFn.mock.calls.length, 0);
        });

        test("pattern: combining isDebugEnabled() with lazy() for maximum efficiency", async() => {
            await GraphtyLogger.configure({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const computeFn = vi.fn().mockReturnValue({complex: "data"});

            // Most efficient pattern: guard + lazy
            if (logger.isDebugEnabled()) {
                logger.debug("Complex data", {
                    data: lazy(computeFn),
                });
            }

            // Since debug is enabled, computation should happen
            assert.strictEqual(computeFn.mock.calls.length, 1);
            assert.strictEqual(consoleDebugSpy.mock.calls.length, 1);
        });

        test("pattern: lazy evaluation skipped entirely when using guard with disabled logging", async() => {
            await GraphtyLogger.configure({
                enabled: false, // Logging disabled
                level: LogLevel.DEBUG,
                modules: "*",
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            const computeFn = vi.fn().mockReturnValue({complex: "data"});
            let lazyWasCalled = false;

            // Guard pattern - most efficient
            if (logger.isDebugEnabled()) {
                lazyWasCalled = true;
                logger.debug("Complex data", {
                    data: lazy(computeFn),
                });
            }

            // Neither lazy wrapper creation nor computation should happen
            assert.strictEqual(lazyWasCalled, false);
            assert.strictEqual(computeFn.mock.calls.length, 0);
        });
    });
});
