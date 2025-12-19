/**
 * pinOnDrag Behavior Tests
 *
 * Tests verify node pinning behavior during drag operations.
 */

import {assert} from "chai";
import {afterEach, beforeEach, describe, test, vi} from "vitest";

import type {StyleSchema} from "../../../src/config";
import {Graph} from "../../../src/Graph";

function createStyleTemplate(pinOnDrag: boolean): StyleSchema {
    return {
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            addDefaultStyle: true,
            twoD: false,
            layout: "ngraph",
            layoutOptions: {dim: 3},
        },
        layers: [],
        data: {
            knownFields: {
                nodeIdPath: "id",
                nodeWeightPath: null,
                nodeTimePath: null,
                edgeSrcIdPath: "src",
                edgeDstIdPath: "dst",
                edgeWeightPath: null,
                edgeTimePath: null,
            },
        },
        behavior: {
            layout: {type: "ngraph", preSteps: 0, stepMultiplier: 1, minDelta: 0.001, zoomStepInterval: 5},
            node: {pinOnDrag},
        },
    } as unknown as StyleSchema;
}

const TEST_NODES = [{id: "node1"}, {id: "node2"}, {id: "node3"}];
const TEST_EDGES = [{src: "node1", dst: "node2"}, {src: "node2", dst: "node3"}];

describe("pinOnDrag Behavior", () => {
    let graph: Graph;
    let container: HTMLDivElement;

    describe("pinOnDrag=true", () => {
        beforeEach(async() => {
            container = document.createElement("div");
            container.style.width = "800px";
            container.style.height = "600px";
            document.body.appendChild(container);

            graph = new Graph(container);
            await graph.init();
            await graph.setStyleTemplate(createStyleTemplate(true));
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.operationQueue.waitForCompletion();
            await new Promise((resolve) => setTimeout(resolve, 200));
        });

        afterEach(() => {
            vi.restoreAllMocks();
            graph.dispose();
            document.body.removeChild(container);
        });

        test("pinOnDrag=true pins node after drag", async() => {
            const node1 = graph.getNode("node1");
            assert.isDefined(node1, "Node 1 should exist");
            assert.isNotNull(node1);

            const newX = node1.mesh.position.x + 5;
            const newY = node1.mesh.position.y + 3;
            const newZ = node1.mesh.position.z + 1;

            node1.mesh.position.x = newX;
            node1.mesh.position.y = newY;
            node1.mesh.position.z = newZ;
            node1.pin();

            await new Promise((resolve) => setTimeout(resolve, 100));

            const graphInternal = graph as unknown as {layoutManager: {step: () => void}};
            for (let i = 0; i < 10; i++) {
                graphInternal.layoutManager.step();
            }

            await new Promise((resolve) => setTimeout(resolve, 50));

            assert.closeTo(node1.mesh.position.x, newX, 0.5, "Pinned node X should stay");
            assert.closeTo(node1.mesh.position.y, newY, 0.5, "Pinned node Y should stay");
            assert.closeTo(node1.mesh.position.z, newZ, 0.5, "Pinned node Z should stay");
        });

        test("pinned node stays at position during layout", async() => {
            const node1 = graph.getNode("node1");
            assert.isDefined(node1, "Node 1 should exist");
            assert.isNotNull(node1);

            const pinnedPos = {x: 10, y: 10, z: 10};
            node1.mesh.position.x = pinnedPos.x;
            node1.mesh.position.y = pinnedPos.y;
            node1.mesh.position.z = pinnedPos.z;
            node1.pin();

            const graphInternal = graph as unknown as {layoutManager: {step: () => void}};
            for (let i = 0; i < 50; i++) {
                graphInternal.layoutManager.step();
                await new Promise((resolve) => setTimeout(resolve, 10));
            }

            assert.closeTo(node1.mesh.position.x, pinnedPos.x, 0.5, "X should remain stable");
            assert.closeTo(node1.mesh.position.y, pinnedPos.y, 0.5, "Y should remain stable");
            assert.closeTo(node1.mesh.position.z, pinnedPos.z, 0.5, "Z should remain stable");
        });
    });

    describe("pinOnDrag=false", () => {
        beforeEach(async() => {
            container = document.createElement("div");
            container.style.width = "800px";
            container.style.height = "600px";
            document.body.appendChild(container);

            graph = new Graph(container);
            await graph.init();
            await graph.setStyleTemplate(createStyleTemplate(false));
            await graph.addNodes(TEST_NODES);
            await graph.addEdges(TEST_EDGES);
            await graph.operationQueue.waitForCompletion();
            await new Promise((resolve) => setTimeout(resolve, 200));
        });

        afterEach(() => {
            vi.restoreAllMocks();
            graph.dispose();
            document.body.removeChild(container);
        });

        test("explicit pin() works even with pinOnDrag=false", async() => {
            const node1 = graph.getNode("node1");
            assert.isDefined(node1, "Node 1 should exist");
            assert.isNotNull(node1);

            const pinnedPos = {x: 15, y: 15, z: 15};
            node1.mesh.position.x = pinnedPos.x;
            node1.mesh.position.y = pinnedPos.y;
            node1.mesh.position.z = pinnedPos.z;
            node1.pin();

            const graphInternal = graph as unknown as {layoutManager: {step: () => void}};
            for (let i = 0; i < 30; i++) {
                graphInternal.layoutManager.step();
            }

            await new Promise((resolve) => setTimeout(resolve, 100));

            assert.closeTo(node1.mesh.position.x, pinnedPos.x, 0.5, "X should stay in place");
            assert.closeTo(node1.mesh.position.y, pinnedPos.y, 0.5, "Y should stay in place");
            assert.closeTo(node1.mesh.position.z, pinnedPos.z, 0.5, "Z should stay in place");
        });

        test("unpin() releases node to layout", async() => {
            const node1 = graph.getNode("node1");
            assert.isDefined(node1, "Node 1 should exist");
            assert.isNotNull(node1);

            const pinnedPos = {x: 25, y: 25, z: 25};
            node1.mesh.position.x = pinnedPos.x;
            node1.mesh.position.y = pinnedPos.y;
            node1.mesh.position.z = pinnedPos.z;
            node1.pin();

            node1.unpin();

            const graphInternal = graph as unknown as {layoutManager: {step: () => void}};
            for (let i = 0; i < 30; i++) {
                graphInternal.layoutManager.step();
            }

            await new Promise((resolve) => setTimeout(resolve, 100));

            assert.isDefined(node1.mesh.position, "Node should have valid position");
            assert.isTrue(isFinite(node1.mesh.position.x), "X should be finite");
            assert.isTrue(isFinite(node1.mesh.position.y), "Y should be finite");
            assert.isTrue(isFinite(node1.mesh.position.z), "Z should be finite");
        });
    });
});
