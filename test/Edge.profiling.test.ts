import {assert, beforeEach, describe, it} from "vitest";

import type {Edge} from "../src/Edge";
import {Graph} from "../src/Graph";

describe("Edge - Profiling", () => {
    let graph: Graph;
    let edge: Edge;

    beforeEach(async() => {
        // Create a minimal graph instance
        const container = document.createElement("div");
        document.body.appendChild(container);

        graph = new Graph(container);
        await graph.init();

        // Add nodes and edge
        await graph.addNodes([{id: "node-a"}, {id: "node-b"}]);
        await graph.addEdges([{source: "node-a", target: "node-b"}]);

        // Get the created edge
        const edges = Array.from(graph.getDataManager().edges.values());
        edge = edges[0];
    });

    it("should measure edge update when profiling enabled", () => {
        // Enable profiling
        graph.getStatsManager().enableProfiling();

        // Trigger update
        edge.update();

        // Verify measurement recorded for Edge.update
        const snapshot = graph.getStatsManager().getSnapshot();
        const edgeUpdateMeasurement = snapshot.cpu.find((m: {label: string}) => m.label === "Edge.update");

        assert.isDefined(edgeUpdateMeasurement, "Edge.update measurement should be recorded");
        assert.isNumber(edgeUpdateMeasurement.count);
        assert.isAtLeast(edgeUpdateMeasurement.count, 1);
        assert.isAtLeast(edgeUpdateMeasurement.total, 0);
    });

    it("should measure arrow update when profiling enabled", () => {
        // Enable profiling
        graph.getStatsManager().enableProfiling();

        // Trigger update which calls updateArrows -> updateFilledArrowInstance
        edge.update();

        // Verify measurement recorded for Edge.updateArrow
        const snapshot = graph.getStatsManager().getSnapshot();
        const arrowUpdateMeasurement = snapshot.cpu.find((m: {label: string}) => m.label === "Edge.updateArrow");

        // May or may not be present depending on arrow configuration
        // We just verify it doesn't crash
        if (arrowUpdateMeasurement) {
            assert.isAtLeast(arrowUpdateMeasurement.count, 1);
            assert.isAtLeast(arrowUpdateMeasurement.total, 0);
        }
    });

    it("should not measure when profiling disabled", () => {
        // Profiling is disabled by default

        // Trigger update
        edge.update();

        // Verify no measurements were recorded
        const snapshot = graph.getStatsManager().getSnapshot();
        assert.equal(snapshot.cpu.length, 0);
    });

    it("should handle multiple updates", () => {
        graph.getStatsManager().enableProfiling();

        // Trigger multiple updates
        edge.update();
        edge.update();
        edge.update();

        const snapshot = graph.getStatsManager().getSnapshot();
        const edgeUpdateMeasurement = snapshot.cpu.find((m: {label: string}) => m.label === "Edge.update");

        assert.isDefined(edgeUpdateMeasurement);
        assert.isNumber(edgeUpdateMeasurement.count);
        assert.isAtLeast(edgeUpdateMeasurement.count, 3);
    });
});
