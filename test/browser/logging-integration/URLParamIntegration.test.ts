import {afterEach, assert, beforeEach, describe, type MockInstance, test, vi} from "vitest";

import {GraphtyLogger} from "../../../src/logging/GraphtyLogger.js";
import {getLoggingConfig, resetLoggingConfig} from "../../../src/logging/LoggerConfig.js";
import {
    clearLoggingConfig,
    loadLoggingConfig,
    saveLoggingConfig,
} from "../../../src/logging/storage.js";
import {LogLevel} from "../../../src/logging/types.js";
import {parseLoggingURLParams} from "../../../src/logging/URLParamParser.js";

// Empty mock function to satisfy linter
function noop(): void {
    // Intentionally empty
}

describe("URL Parameter Integration", () => {
    let consoleDebugSpy: MockInstance;
    let consoleInfoSpy: MockInstance;

    beforeEach(() => {
        // Reset logging config before each test
        resetLoggingConfig();
        clearLoggingConfig();

        // Spy on console methods
        consoleDebugSpy = vi.spyOn(console, "debug").mockImplementation(noop);
        consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(noop);
        vi.spyOn(console, "warn").mockImplementation(noop);
        vi.spyOn(console, "error").mockImplementation(noop);
        vi.spyOn(console, "log").mockImplementation(noop);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        resetLoggingConfig();
        clearLoggingConfig();
        // Restore URL
        if (window.location.search !== "") {
            history.replaceState(null, "", window.location.pathname);
        }
    });

    function setURLParams(params: string): void {
        history.replaceState(null, "", `${window.location.pathname}?${params}`);
    }

    describe("URL parameter enabling", () => {
        test("should enable logging when ?graphty-element-logging=true", async() => {
            setURLParams("graphty-element-logging=true");
            const params = parseLoggingURLParams();

            assert.isNotNull(params);
            assert.strictEqual(params.enabled, true);

            // Configure based on URL params
            await GraphtyLogger.configure({
                enabled: params.enabled,
                modules: params.modules,
                level: params.level ?? LogLevel.INFO,
                format: {timestamp: true, module: true, colors: true},
            });

            assert.strictEqual(GraphtyLogger.isEnabled(), true);

            // Test that logging actually works
            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.info("Test message");

            // Should have logged
            assert.isTrue(consoleInfoSpy.mock.calls.length > 0, "Expected info to be called");
        });

        test("should filter to layout module with ?graphty-element-logging=layout", async() => {
            setURLParams("graphty-element-logging=layout");
            const params = parseLoggingURLParams();

            assert.isNotNull(params);
            assert.deepEqual(params.modules, ["layout"]);

            await GraphtyLogger.configure({
                enabled: params.enabled,
                modules: params.modules,
                level: params.level ?? LogLevel.INFO,
                format: {timestamp: true, module: true},
            });

            // Layout logger should log
            const layoutLogger = GraphtyLogger.getLogger(["graphty", "layout"]);
            layoutLogger.info("Layout message");
            assert.isTrue(consoleInfoSpy.mock.calls.length > 0, "Expected layout log");

            // Reset spy
            consoleInfoSpy.mockClear();

            // XR logger should not log
            const xrLogger = GraphtyLogger.getLogger(["graphty", "xr"]);
            xrLogger.info("XR message");
            assert.strictEqual(consoleInfoSpy.mock.calls.length, 0, "XR should not log");
        });

        test("should set debug level with ?graphty-element-log-level=debug", async() => {
            setURLParams("graphty-element-logging=true&graphty-element-log-level=debug");
            const params = parseLoggingURLParams();

            assert.isNotNull(params);
            assert.strictEqual(params.level, LogLevel.DEBUG);

            await GraphtyLogger.configure({
                enabled: params.enabled,
                modules: params.modules,
                level: params.level ?? LogLevel.INFO,
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);

            // Debug should work
            logger.debug("Debug message");
            assert.isTrue(consoleDebugSpy.mock.calls.length > 0, "Expected debug to be called");
        });

        test("should parse combined module:level format", () => {
            setURLParams("graphty-element-logging=layout:debug,xr:warn");
            const params = parseLoggingURLParams();

            assert.isNotNull(params);
            assert.deepEqual(params.modules, ["layout", "xr"]);
            assert.isDefined(params.moduleOverrides);
            const overrides = params.moduleOverrides;
            assert.isNotNull(overrides);
            assert.strictEqual(overrides.get("layout"), LogLevel.DEBUG);
            assert.strictEqual(overrides.get("xr"), LogLevel.WARN);
        });
    });

    describe("URL parameter disabling (regression tests)", () => {
        test("should return null from parseLoggingURLParams when ?graphty-element-logging=false", () => {
            setURLParams("graphty-element-logging=false");
            const params = parseLoggingURLParams();

            // parseLoggingURLParams returns null when logging is explicitly disabled
            assert.isNull(params, "Expected null when logging=false");
        });

        test("should NOT log when ?graphty-element-logging=false even with log-level set", async() => {
            setURLParams("graphty-element-logging=false&graphty-element-log-level=debug");
            const params = parseLoggingURLParams();

            // Should return null because logging is disabled
            assert.isNull(params, "Expected null when logging=false");

            // Even if someone tries to configure with enabled:false, no logs should appear
            await GraphtyLogger.configure({
                enabled: false,
                modules: "*",
                level: LogLevel.DEBUG,
                format: {timestamp: true, module: true},
            });

            const logger = GraphtyLogger.getLogger(["graphty", "test"]);
            logger.info("This should not appear");
            logger.debug("This should not appear either");

            assert.strictEqual(consoleInfoSpy.mock.calls.length, 0, "No info logs when disabled");
            assert.strictEqual(consoleDebugSpy.mock.calls.length, 0, "No debug logs when disabled");
        });

        test("should detect explicit false vs missing parameter", () => {
            // Test with explicit false
            setURLParams("graphty-element-logging=false");
            const urlParams1 = new URLSearchParams(window.location.search);
            const value1 = urlParams1.get("graphty-element-logging");
            assert.strictEqual(value1, "false", "Should have explicit false value");
            assert.isNull(parseLoggingURLParams(), "Should return null for false");

            // Test with no parameter
            setURLParams("");
            const urlParams2 = new URLSearchParams(window.location.search);
            const value2 = urlParams2.get("graphty-element-logging");
            assert.isNull(value2, "Should have no value when param missing");
            assert.isNull(parseLoggingURLParams(), "Should return null when missing");

            // Test with true
            setURLParams("graphty-element-logging=true");
            const params = parseLoggingURLParams();
            assert.isNotNull(params, "Should return params when true");
            assert.strictEqual(params.enabled, true);
        });
    });

    describe("Session persistence", () => {
        test("should persist config in sessionStorage", () => {
            const config = {
                enabled: true,
                level: LogLevel.DEBUG,
                modules: ["layout", "xr"] as string[],
                format: {timestamp: true, module: true, colors: true},
            };

            saveLoggingConfig(config);

            const loaded = loadLoggingConfig();
            assert.exists(loaded);
            assert.strictEqual(loaded.enabled, true);
            assert.strictEqual(loaded.level, LogLevel.DEBUG);
            assert.deepEqual(loaded.modules, ["layout", "xr"]);
        });

        test("should return null when no config is stored", () => {
            clearLoggingConfig();
            const loaded = loadLoggingConfig();
            assert.isNull(loaded);
        });

        test("should clear stored config", () => {
            const config = {
                enabled: true,
                level: LogLevel.INFO,
                modules: "*" as const,
                format: {timestamp: true, module: true},
            };

            saveLoggingConfig(config);
            clearLoggingConfig();

            const loaded = loadLoggingConfig();
            assert.isNull(loaded);
        });

        test("should preserve config across multiple saves", () => {
            const config1 = {
                enabled: true,
                level: LogLevel.DEBUG,
                modules: ["layout"] as string[],
                format: {timestamp: true, module: true},
            };

            saveLoggingConfig(config1);

            const config2 = {
                enabled: true,
                level: LogLevel.TRACE,
                modules: "*" as const,
                format: {timestamp: false, module: true, colors: false},
            };

            saveLoggingConfig(config2);

            const loaded = loadLoggingConfig();
            assert.exists(loaded);
            assert.strictEqual(loaded.level, LogLevel.TRACE);
            assert.strictEqual(loaded.modules, "*");
            assert.strictEqual(loaded.format.timestamp, false);
        });
    });

    describe("Integration with getLoggingConfig", () => {
        test("should reflect URL param config in getLoggingConfig", async() => {
            setURLParams("graphty-element-logging=true&graphty-element-log-level=debug");
            const params = parseLoggingURLParams();

            assert.isNotNull(params);

            await GraphtyLogger.configure({
                enabled: params.enabled,
                modules: params.modules,
                level: params.level ?? LogLevel.INFO,
                format: {timestamp: true, module: true},
            });

            const config = getLoggingConfig();
            assert.strictEqual(config.enabled, true);
            assert.strictEqual(config.level, LogLevel.DEBUG);
            assert.strictEqual(config.modules, "*");
        });
    });
});
