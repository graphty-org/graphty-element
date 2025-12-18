import {afterEach, assert, describe, test} from "vitest";

import {LogLevel} from "../../src/logging/types.js";
import {parseLoggingURLParams} from "../../src/logging/URLParamParser.js";

describe("URLParamParser", () => {
    afterEach(() => {
        // Restore original location if we mocked it
        // In vitest browser mode, we can use history.replaceState to restore
        if (window.location.search !== "") {
            history.replaceState(null, "", window.location.pathname);
        }
    });

    function setURLParams(params: string): void {
        // Use history.replaceState to set URL params without navigation
        history.replaceState(null, "", `${window.location.pathname}?${params}`);
    }

    describe("graphty-element-logging param", () => {
        test("should extract graphty-element-logging param", () => {
            setURLParams("graphty-element-logging=true");
            const result = parseLoggingURLParams();
            assert.isNotNull(result);
            assert.strictEqual(result.enabled, true);
        });

        test("should return null for missing params", () => {
            setURLParams("");
            const result = parseLoggingURLParams();
            assert.isNull(result);
        });

        test("should parse 'true' as enable all modules", () => {
            setURLParams("graphty-element-logging=true");
            const result = parseLoggingURLParams();
            assert.isNotNull(result);
            assert.strictEqual(result.enabled, true);
            assert.strictEqual(result.modules, "*");
        });

        test("should parse module list as string array", () => {
            setURLParams("graphty-element-logging=layout,xr,camera");
            const result = parseLoggingURLParams();
            assert.isNotNull(result);
            assert.strictEqual(result.enabled, true);
            assert.deepEqual(result.modules, ["layout", "xr", "camera"]);
        });

        test("should parse single module", () => {
            setURLParams("graphty-element-logging=layout");
            const result = parseLoggingURLParams();
            assert.isNotNull(result);
            assert.strictEqual(result.enabled, true);
            assert.deepEqual(result.modules, ["layout"]);
        });

        test("should handle 'false' value", () => {
            setURLParams("graphty-element-logging=false");
            const result = parseLoggingURLParams();
            assert.isNull(result);
        });

        test("should handle empty value", () => {
            setURLParams("graphty-element-logging=");
            const result = parseLoggingURLParams();
            assert.isNull(result);
        });
    });

    describe("graphty-element-log-level param", () => {
        test("should extract graphty-element-log-level param", () => {
            setURLParams("graphty-element-logging=true&graphty-element-log-level=debug");
            const result = parseLoggingURLParams();
            assert.isNotNull(result);
            assert.strictEqual(result.level, LogLevel.DEBUG);
        });

        test("should default to undefined level when not specified", () => {
            setURLParams("graphty-element-logging=true");
            const result = parseLoggingURLParams();
            assert.isNotNull(result);
            assert.isUndefined(result.level);
        });

        test("should parse all valid log levels", () => {
            const levels = [
                {param: "silent", expected: LogLevel.SILENT},
                {param: "error", expected: LogLevel.ERROR},
                {param: "warn", expected: LogLevel.WARN},
                {param: "info", expected: LogLevel.INFO},
                {param: "debug", expected: LogLevel.DEBUG},
                {param: "trace", expected: LogLevel.TRACE},
            ];

            for (const {param, expected} of levels) {
                setURLParams(`graphty-element-logging=true&graphty-element-log-level=${param}`);
                const result = parseLoggingURLParams();
                assert.isNotNull(result, `Expected result for level ${param}`);
                assert.strictEqual(result.level, expected, `Expected level ${expected} for param ${param}`);
            }
        });

        test("should handle case-insensitive level values", () => {
            setURLParams("graphty-element-logging=true&graphty-element-log-level=DEBUG");
            const result = parseLoggingURLParams();
            assert.isNotNull(result);
            assert.strictEqual(result.level, LogLevel.DEBUG);
        });

        test("should ignore invalid level values", () => {
            setURLParams("graphty-element-logging=true&graphty-element-log-level=invalid");
            const result = parseLoggingURLParams();
            assert.isNotNull(result);
            assert.isUndefined(result.level);
        });
    });

    describe("module:level format", () => {
        test("should parse module:level format", () => {
            setURLParams("graphty-element-logging=layout:debug,xr:info");
            const result = parseLoggingURLParams();
            assert.isNotNull(result);
            assert.strictEqual(result.enabled, true);
            assert.deepEqual(result.modules, ["layout", "xr"]);

            const overrides = result.moduleOverrides;
            assert.isDefined(overrides, "moduleOverrides should be defined");
            assert.strictEqual(overrides.get("layout"), LogLevel.DEBUG);
            assert.strictEqual(overrides.get("xr"), LogLevel.INFO);
        });

        test("should handle mixed format (some with levels, some without)", () => {
            setURLParams("graphty-element-logging=layout:debug,xr,camera:trace");
            const result = parseLoggingURLParams();
            assert.isNotNull(result);
            assert.deepEqual(result.modules, ["layout", "xr", "camera"]);

            const overrides = result.moduleOverrides;
            assert.isDefined(overrides, "moduleOverrides should be defined");
            assert.strictEqual(overrides.get("layout"), LogLevel.DEBUG);
            assert.strictEqual(overrides.get("camera"), LogLevel.TRACE);
            assert.isFalse(overrides.has("xr"));
        });

        test("should ignore invalid levels in module:level format", () => {
            setURLParams("graphty-element-logging=layout:invalid,xr:debug");
            const result = parseLoggingURLParams();
            assert.isNotNull(result);
            assert.deepEqual(result.modules, ["layout", "xr"]);

            const overrides = result.moduleOverrides;
            assert.isDefined(overrides, "moduleOverrides should be defined");
            assert.isFalse(overrides.has("layout"));
            assert.strictEqual(overrides.get("xr"), LogLevel.DEBUG);
        });
    });

    describe("edge cases", () => {
        test("should handle URL with other params", () => {
            setURLParams("other=value&graphty-element-logging=true&another=param");
            const result = parseLoggingURLParams();
            assert.isNotNull(result);
            assert.strictEqual(result.enabled, true);
        });

        test("should handle whitespace in module names", () => {
            setURLParams("graphty-element-logging=layout%20,xr");
            const result = parseLoggingURLParams();
            assert.isNotNull(result);
            // Module names should be trimmed
            assert.deepEqual(result.modules, ["layout", "xr"]);
        });
    });
});
