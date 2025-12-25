/**
 * API Parity Tests for Graphty Web Component.
 *
 * Verifies that graphty-element exposes all necessary methods from Graph.ts
 * per Phase 7 of the documentation-implementation-plan.md.
 *
 * @module test/graphty-element/api-parity.test
 */

import {readFileSync} from "fs";
import {assert, describe, it} from "vitest";

describe("Graphty API Parity", () => {
    const graphtyContent = readFileSync("src/graphty-element.ts", "utf8");
    const algorithmContent = readFileSync("src/algorithms/Algorithm.ts", "utf8");
    const dataSourceContent = readFileSync("src/data/DataSource.ts", "utf8");

    /**
     * Helper to check if a method is defined in the class.
     */
    function hasMethod(content: string, methodName: string): boolean {
        // Match method definitions like:
        // - public methodName(
        // - async methodName(
        // - methodName(
        // But not comments or string literals
        const methodRegex = new RegExp(
            `^\\s*(public\\s+)?(async\\s+)?${methodName}\\s*\\(`,
            "m",
        );
        return methodRegex.test(content);
    }

    /**
     * Helper to check if a static method is defined in the class.
     */
    function hasStaticMethod(content: string, methodName: string): boolean {
        const methodRegex = new RegExp(
            `^\\s*static\\s+(async\\s+)?${methodName}\\s*\\(`,
            "m",
        );
        return methodRegex.test(content);
    }

    describe("Phase 7a: High Priority Methods (28 methods)", () => {
        describe("Data Methods", () => {
            const dataMethods = [
                "addNode",
                "addNodes",
                "addEdge",
                "addEdges",
                "removeNodes",
                "updateNodes",
                "getNode",
                "getNodes",
                "getNodeCount",
                "getEdgeCount",
            ];

            for (const method of dataMethods) {
                it(`has ${method} method`, () => {
                    assert.ok(
                        hasMethod(graphtyContent, method),
                        `Graphty should have ${method} method`,
                    );
                });
            }
        });

        describe("Data Loading Methods", () => {
            const loadingMethods = [
                "addDataFromSource",
                "loadFromUrl",
                "loadFromFile",
            ];

            for (const method of loadingMethods) {
                it(`has ${method} method`, () => {
                    assert.ok(
                        hasMethod(graphtyContent, method),
                        `Graphty should have ${method} method`,
                    );
                });
            }
        });

        describe("Selection Methods", () => {
            const selectionMethods = [
                "selectNode",
                "deselectNode",
                "getSelectedNode",
                "isNodeSelected",
            ];

            for (const method of selectionMethods) {
                it(`has ${method} method`, () => {
                    assert.ok(
                        hasMethod(graphtyContent, method),
                        `Graphty should have ${method} method`,
                    );
                });
            }
        });

        describe("Algorithm Methods", () => {
            const algorithmMethods = [
                "runAlgorithm",
                "applySuggestedStyles",
                "getSuggestedStyles",
            ];

            for (const method of algorithmMethods) {
                it(`has ${method} method`, () => {
                    assert.ok(
                        hasMethod(graphtyContent, method),
                        `Graphty should have ${method} method`,
                    );
                });
            }
        });

        describe("Style Methods", () => {
            const styleMethods = [
                "setStyleTemplate",
                "getStyleManager",
            ];

            for (const method of styleMethods) {
                it(`has ${method} method`, () => {
                    assert.ok(
                        hasMethod(graphtyContent, method),
                        `Graphty should have ${method} method`,
                    );
                });
            }
        });

        describe("Layout Methods", () => {
            it("has setLayout method", () => {
                assert.ok(
                    hasMethod(graphtyContent, "setLayout"),
                    "Graphty should have setLayout method",
                );
            });
        });

        describe("Utility Methods", () => {
            const utilityMethods = [
                "zoomToFit",
                "waitForSettled",
                "batchOperations",
            ];

            for (const method of utilityMethods) {
                it(`has ${method} method`, () => {
                    assert.ok(
                        hasMethod(graphtyContent, method),
                        `Graphty should have ${method} method`,
                    );
                });
            }
        });

        describe("Event Methods", () => {
            const eventMethods = [
                "on",
                "addListener",
                "listenerCount",
            ];

            for (const method of eventMethods) {
                it(`has ${method} method`, () => {
                    assert.ok(
                        hasMethod(graphtyContent, method),
                        `Graphty should have ${method} method`,
                    );
                });
            }
        });
    });

    describe("Phase 7b: Medium Priority Methods (10 methods)", () => {
        describe("View Methods", () => {
            it("has is2D method", () => {
                assert.ok(
                    hasMethod(graphtyContent, "is2D"),
                    "Graphty should have is2D method",
                );
            });
        });

        describe("XR Methods", () => {
            const xrMethods = [
                "setXRConfig",
                "getXRConfig",
                "exitXR",
            ];

            for (const method of xrMethods) {
                it(`has ${method} method`, () => {
                    assert.ok(
                        hasMethod(graphtyContent, method),
                        `Graphty should have ${method} method`,
                    );
                });
            }
        });

        describe("Camera Methods", () => {
            it("has resolveCameraPreset method", () => {
                assert.ok(
                    hasMethod(graphtyContent, "resolveCameraPreset"),
                    "Graphty should have resolveCameraPreset method",
                );
            });
        });

        describe("Input Methods", () => {
            it("has setInputEnabled method", () => {
                assert.ok(
                    hasMethod(graphtyContent, "setInputEnabled"),
                    "Graphty should have setInputEnabled method",
                );
            });
        });

        describe("Lifecycle Methods", () => {
            const lifecycleMethods = [
                "shutdown",
                "isRunning",
            ];

            for (const method of lifecycleMethods) {
                it(`has ${method} method`, () => {
                    assert.ok(
                        hasMethod(graphtyContent, method),
                        `Graphty should have ${method} method`,
                    );
                });
            }
        });

        describe("Coordinate Methods", () => {
            const coordinateMethods = [
                "worldToScreen",
                "screenToWorld",
            ];

            for (const method of coordinateMethods) {
                it(`has ${method} method`, () => {
                    assert.ok(
                        hasMethod(graphtyContent, method),
                        `Graphty should have ${method} method`,
                    );
                });
            }
        });
    });

    describe("Phase 7d: Extension API Consistency", () => {
        it("Algorithm has getRegisteredTypes static method", () => {
            assert.ok(
                hasStaticMethod(algorithmContent, "getRegisteredTypes"),
                "Algorithm should have getRegisteredTypes static method",
            );
        });

        it("DataSource has getRegisteredTypes static method", () => {
            assert.ok(
                hasStaticMethod(dataSourceContent, "getRegisteredTypes"),
                "DataSource should have getRegisteredTypes static method",
            );
        });
    });
});
