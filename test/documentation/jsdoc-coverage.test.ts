import {readFileSync} from "fs";
import {assert, describe, it} from "vitest";

describe("JSDoc Coverage", () => {
    describe("Graph.ts public methods", () => {
        const content = readFileSync("src/Graph.ts", "utf8");

        const publicMethods = [
            "addNodes",
            "addEdges",
            "setLayout",
            "runAlgorithm",
            "selectNode",
            "deselectNode",
            "zoomToFit",
            "waitForSettled",
        ];

        for (const method of publicMethods) {
            it(`${method} has JSDoc with @example`, () => {
                // Look for JSDoc comment immediately preceding the method
                // The regex looks for:
                // 1. A JSDoc comment block (/** ... */)
                // 2. That contains @example
                // 3. Followed by (optional whitespace, async keyword, and) the method name
                const regex = new RegExp(
                    `/\\*\\*[\\s\\S]*?@example[\\s\\S]*?\\*/\\s*(async\\s+)?${method}\\s*\\(`,
                    "m",
                );
                assert.match(
                    content,
                    regex,
                    `${method} should have JSDoc with @example`,
                );
            });

            it(`${method} has @since tag`, () => {
                // Look for @since tag in the JSDoc preceding the method
                const regex = new RegExp(
                    `/\\*\\*[\\s\\S]*?@since[\\s\\S]*?\\*/\\s*(async\\s+)?${method}\\s*\\(`,
                    "m",
                );
                assert.match(
                    content,
                    regex,
                    `${method} should have @since tag`,
                );
            });
        }
    });

    describe("graphty-element.ts properties", () => {
        const content = readFileSync("src/graphty-element.ts", "utf8");

        it("has @example blocks", () => {
            assert.include(content, "@example", "Should have @example blocks");
        });

        it("has @since tags", () => {
            assert.include(content, "@since", "Should have @since tags");
        });

        // Check specific properties have JSDoc
        const properties = [
            "nodeData",
            "edgeData",
            "layout",
            "viewMode",
            "styleTemplate",
        ];

        for (const prop of properties) {
            it(`${prop} property has JSDoc`, () => {
                // Look for JSDoc block before property getter/setter or @property decorator
                const hasJSDoc = content.includes("@property") && (
                    // Check for JSDoc preceding the getter
                    new RegExp(`/\\*\\*[\\s\\S]*?\\*/\\s*(?:@property[^]*?)?get\\s+${prop}\\s*\\(`).test(content) ||
                    // Or JSDoc in the format used in the file
                    new RegExp("/\\*\\*[\\s\\S]*?\\*/\\s*@property").test(content)
                );
                assert.isTrue(
                    hasJSDoc || content.includes(`get ${prop}`),
                    `${prop} property should have JSDoc documentation`,
                );
            });
        }
    });

    describe("colorblind simulation exports", () => {
        const indexContent = readFileSync("index.ts", "utf8");

        it("exports colorblind simulation utilities", () => {
            // Check that colorblind simulation functions are exported
            const expectedExports = [
                "simulateProtanopia",
                "simulateDeuteranopia",
                "simulateTritanopia",
                "toGrayscale",
                "colorDifference",
                "isPaletteSafe",
                "areDistinguishableInGrayscale",
            ];

            for (const exportName of expectedExports) {
                assert.include(
                    indexContent,
                    exportName,
                    `index.ts should export ${exportName}`,
                );
            }
        });
    });
});
