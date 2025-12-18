import {afterEach, assert, beforeEach, describe, test} from "vitest";

import {
    configureLogging,
    getLoggingConfig,
    isModuleEnabled,
    resetLoggingConfig,
} from "../../src/logging/LoggerConfig.js";
import {LogLevel} from "../../src/logging/types.js";

describe("LoggerConfig", () => {
    beforeEach(() => {
        // Reset config before each test
        resetLoggingConfig();
    });

    afterEach(() => {
        // Ensure config is reset after each test
        resetLoggingConfig();
    });

    describe("configureLogging", () => {
        test("should parse enabled=true from config", () => {
            configureLogging({enabled: true});
            const config = getLoggingConfig();
            assert.strictEqual(config.enabled, true);
        });

        test("should default to INFO level when not specified", () => {
            configureLogging({enabled: true});
            const config = getLoggingConfig();
            assert.strictEqual(config.level, LogLevel.INFO);
        });

        test("should accept custom level", () => {
            configureLogging({enabled: true, level: LogLevel.DEBUG});
            const config = getLoggingConfig();
            assert.strictEqual(config.level, LogLevel.DEBUG);
        });

        test("should parse comma-separated module list", () => {
            configureLogging({enabled: true, modules: ["layout", "xr", "camera"]});
            const config = getLoggingConfig();
            assert.deepEqual(config.modules, ["layout", "xr", "camera"]);
        });

        test("should accept '*' for all modules", () => {
            configureLogging({enabled: true, modules: "*"});
            const config = getLoggingConfig();
            assert.strictEqual(config.modules, "*");
        });

        test("should validate log level values", () => {
            // All valid levels should work
            const validLevels = [LogLevel.SILENT, LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.TRACE];
            for (const level of validLevels) {
                configureLogging({enabled: true, level});
                const config = getLoggingConfig();
                assert.strictEqual(config.level, level);
            }
        });

        test("should handle invalid config gracefully", () => {
            // Even with invalid data, it should not throw
            configureLogging({enabled: true, modules: "*"});
            const config = getLoggingConfig();
            assert.strictEqual(config.enabled, true);
        });

        test("should set default format options", () => {
            configureLogging({enabled: true});
            const config = getLoggingConfig();
            assert.strictEqual(config.format.timestamp, true);
            assert.strictEqual(config.format.module, true);
        });

        test("should allow custom format options", () => {
            configureLogging({
                enabled: true,
                format: {
                    timestamp: false,
                    module: false,
                    colors: true,
                },
            });
            const config = getLoggingConfig();
            assert.strictEqual(config.format.timestamp, false);
            assert.strictEqual(config.format.module, false);
            assert.strictEqual(config.format.colors, true);
        });
    });

    describe("getLoggingConfig", () => {
        test("should return default config when not configured", () => {
            const config = getLoggingConfig();
            assert.strictEqual(config.enabled, false);
            assert.strictEqual(config.level, LogLevel.INFO);
            assert.strictEqual(config.modules, "*");
        });

        test("should return current config after configuration", () => {
            configureLogging({
                enabled: true,
                level: LogLevel.DEBUG,
                modules: ["layout"],
            });
            const config = getLoggingConfig();
            assert.strictEqual(config.enabled, true);
            assert.strictEqual(config.level, LogLevel.DEBUG);
            assert.deepEqual(config.modules, ["layout"]);
        });
    });

    describe("isModuleEnabled", () => {
        test("should return false when logging is disabled", () => {
            configureLogging({enabled: false});
            assert.strictEqual(isModuleEnabled(["graphty", "layout"]), false);
        });

        test("should return true for all modules when modules is '*'", () => {
            configureLogging({enabled: true, modules: "*"});
            assert.strictEqual(isModuleEnabled(["graphty", "layout"]), true);
            assert.strictEqual(isModuleEnabled(["graphty", "xr"]), true);
            assert.strictEqual(isModuleEnabled(["graphty", "anything"]), true);
        });

        test("should return true only for enabled modules", () => {
            configureLogging({enabled: true, modules: ["layout", "xr"]});
            assert.strictEqual(isModuleEnabled(["graphty", "layout"]), true);
            assert.strictEqual(isModuleEnabled(["graphty", "xr"]), true);
            assert.strictEqual(isModuleEnabled(["graphty", "camera"]), false);
        });

        test("should match hierarchical categories", () => {
            configureLogging({enabled: true, modules: ["layout"]});
            // Should match layout and any sub-categories
            assert.strictEqual(isModuleEnabled(["graphty", "layout"]), true);
            assert.strictEqual(isModuleEnabled(["graphty", "layout", "ngraph"]), true);
            assert.strictEqual(isModuleEnabled(["graphty", "xr"]), false);
        });

        test("should handle empty category array", () => {
            configureLogging({enabled: true, modules: ["layout"]});
            // Empty categories should not match specific modules
            assert.strictEqual(isModuleEnabled([]), false);
        });

        test("should handle single element category", () => {
            configureLogging({enabled: true, modules: ["graphty"]});
            assert.strictEqual(isModuleEnabled(["graphty"]), true);
        });
    });

    describe("resetLoggingConfig", () => {
        test("should reset config to defaults", () => {
            configureLogging({
                enabled: true,
                level: LogLevel.TRACE,
                modules: ["layout"],
            });
            resetLoggingConfig();
            const config = getLoggingConfig();
            assert.strictEqual(config.enabled, false);
            assert.strictEqual(config.level, LogLevel.INFO);
            assert.strictEqual(config.modules, "*");
        });
    });
});
