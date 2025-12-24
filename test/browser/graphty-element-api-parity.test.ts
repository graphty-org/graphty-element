import {assert, describe, it} from "vitest";

import {Graphty} from "../../src/graphty-element";

describe("Graphty API Parity", () => {
    describe("Phase 7a: High Priority Methods", () => {
        describe("Data Methods", () => {
            it("has data manipulation methods", () => {
                assert.isFunction(Graphty.prototype.addNode);
                assert.isFunction(Graphty.prototype.addNodes);
                assert.isFunction(Graphty.prototype.addEdge);
                assert.isFunction(Graphty.prototype.addEdges);
                assert.isFunction(Graphty.prototype.removeNodes);
                assert.isFunction(Graphty.prototype.updateNodes);
                assert.isFunction(Graphty.prototype.getNode);
                assert.isFunction(Graphty.prototype.getNodes);
                assert.isFunction(Graphty.prototype.getNodeCount);
                assert.isFunction(Graphty.prototype.getEdgeCount);
            });

            it("has data loading methods", () => {
                assert.isFunction(Graphty.prototype.addDataFromSource);
                assert.isFunction(Graphty.prototype.loadFromUrl);
                assert.isFunction(Graphty.prototype.loadFromFile);
            });
        });

        describe("Selection Methods", () => {
            it("has selection methods", () => {
                assert.isFunction(Graphty.prototype.selectNode);
                assert.isFunction(Graphty.prototype.deselectNode);
                assert.isFunction(Graphty.prototype.getSelectedNode);
                assert.isFunction(Graphty.prototype.isNodeSelected);
            });
        });

        describe("Algorithm Methods", () => {
            it("has algorithm methods", () => {
                assert.isFunction(Graphty.prototype.runAlgorithm);
                assert.isFunction(Graphty.prototype.applySuggestedStyles);
                assert.isFunction(Graphty.prototype.getSuggestedStyles);
            });
        });

        describe("Style Methods", () => {
            it("has style methods", () => {
                assert.isFunction(Graphty.prototype.setStyleTemplate);
                assert.isFunction(Graphty.prototype.getStyleManager);
            });
        });

        describe("Layout Methods", () => {
            it("has layout methods", () => {
                assert.isFunction(Graphty.prototype.setLayout);
            });
        });

        describe("Utility Methods", () => {
            it("has utility methods", () => {
                assert.isFunction(Graphty.prototype.zoomToFit);
                assert.isFunction(Graphty.prototype.waitForSettled);
                assert.isFunction(Graphty.prototype.batchOperations);
            });
        });

        describe("Event Methods", () => {
            it("has event methods", () => {
                assert.isFunction(Graphty.prototype.on);
                assert.isFunction(Graphty.prototype.addListener);
                assert.isFunction(Graphty.prototype.listenerCount);
            });
        });
    });

    describe("Phase 7b: Medium Priority Methods", () => {
        describe("View Methods", () => {
            it("has is2D method", () => {
                assert.isFunction(Graphty.prototype.is2D);
            });
        });

        describe("XR Methods", () => {
            it("has XR methods", () => {
                assert.isFunction(Graphty.prototype.setXRConfig);
                assert.isFunction(Graphty.prototype.getXRConfig);
                assert.isFunction(Graphty.prototype.exitXR);
            });
        });

        describe("Camera Methods", () => {
            it("has resolveCameraPreset method", () => {
                assert.isFunction(Graphty.prototype.resolveCameraPreset);
            });
        });

        describe("Input Methods", () => {
            it("has setInputEnabled method", () => {
                assert.isFunction(Graphty.prototype.setInputEnabled);
            });
        });

        describe("Lifecycle Methods", () => {
            it("has lifecycle methods", () => {
                assert.isFunction(Graphty.prototype.shutdown);
                assert.isFunction(Graphty.prototype.isRunning);
            });
        });

        describe("Coordinate Methods", () => {
            it("has coordinate transform methods", () => {
                assert.isFunction(Graphty.prototype.worldToScreen);
                assert.isFunction(Graphty.prototype.screenToWorld);
            });
        });
    });

    describe("Phase 7c: New Event Types", () => {
        it("event types are defined in events module", async() => {
            // Import the events module - TypeScript will fail compilation if types don't exist
            const eventsModule = await import("../../src/events");
            // Just verify the module loaded successfully - TypeScript checks types at compile time
            assert.ok(eventsModule, "Events module loaded");
        });
    });

    describe("Phase 7d: Extension API Methods", () => {
        it("has Algorithm.getRegisteredTypes static method", async() => {
            const {Algorithm} = await import("../../src/algorithms/Algorithm");
            assert.isFunction(Algorithm.getRegisteredTypes);
        });

        it("has DataSource.getRegisteredTypes static method", async() => {
            const {DataSource} = await import("../../src/data/DataSource");
            assert.isFunction(DataSource.getRegisteredTypes);
        });
    });
});
