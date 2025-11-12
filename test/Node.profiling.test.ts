import {assert, beforeEach, describe, it} from "vitest";

import {Graph} from "../src/Graph";
import type {Node} from "../src/Node";

describe("Node - Profiling", () => {
    let graph: Graph;
    let node: Node;

    beforeEach(async() => {
        // Create a minimal graph instance
        const container = document.createElement("div");
        document.body.appendChild(container);

        graph = new Graph(container);
        await graph.init();

        // Add a node
        await graph.addNodes([{id: "test-node"}]);

        // Get the created node
        node = graph.getNodes()[0];
    });

    it("should measure node update when profiling enabled", () => {
        // Enable profiling
        graph.getStatsManager().enableProfiling();

        // Trigger update
        node.update();

        // Verify measurement recorded for Node.update
        const snapshot = graph.getStatsManager().getSnapshot();
        const nodeUpdateMeasurement = snapshot.cpu.find((m: {label: string}) => m.label === "Node.update");

        assert.isDefined(nodeUpdateMeasurement, "Node.update measurement should be recorded");
        assert.isNumber(nodeUpdateMeasurement.count);
        assert.isAtLeast(nodeUpdateMeasurement.count, 1);
        assert.isAtLeast(nodeUpdateMeasurement.total, 0);
    });

    it("should measure mesh update when profiling enabled", () => {
        // Enable profiling
        graph.getStatsManager().enableProfiling();

        // Trigger update which calls updateMesh
        node.update();

        // Verify measurement recorded for Node.updateMesh
        const snapshot = graph.getStatsManager().getSnapshot();
        const meshUpdateMeasurement = snapshot.cpu.find((m: {label: string}) => m.label === "Node.updateMesh");

        assert.isDefined(meshUpdateMeasurement, "Node.updateMesh measurement should be recorded");
        assert.isNumber(meshUpdateMeasurement.count);
        assert.isAtLeast(meshUpdateMeasurement.count, 1);
        assert.isAtLeast(meshUpdateMeasurement.total, 0);
    });

    it("should not measure when profiling disabled", () => {
        // Profiling is disabled by default

        // Trigger update
        node.update();

        // Verify no measurements were recorded
        const snapshot = graph.getStatsManager().getSnapshot();
        assert.equal(snapshot.cpu.length, 0);
    });

    it("should handle multiple updates", () => {
        graph.getStatsManager().enableProfiling();

        // Trigger multiple updates
        node.update();
        node.update();
        node.update();

        const snapshot = graph.getStatsManager().getSnapshot();
        const nodeUpdateMeasurement = snapshot.cpu.find((m: {label: string}) => m.label === "Node.update");

        assert.isDefined(nodeUpdateMeasurement);
        assert.isNumber(nodeUpdateMeasurement.count);
        assert.isAtLeast(nodeUpdateMeasurement.count, 3);
    });
});
