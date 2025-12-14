import {assert, beforeEach, describe, test} from "vitest";

describe("Graph.loadFromFile", () => {
    beforeEach(() => {
        // Create a fresh canvas for each test
        document.body.innerHTML = "<canvas id=\"test-canvas\"></canvas>";
    });

    test("loads GraphML file with auto-detection", async() => {
        const xml = "<?xml version=\"1.0\"?><graphml xmlns=\"http://graphml.graphdrawing.org/xmlns\"><graph><node id=\"n1\"/></graph></graphml>";
        const file = new File([xml], "test.graphml", {type: "application/xml"});

        const {Graph} = await import("../../src/Graph.js");
        const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
        const graph = new Graph(canvas);

        await graph.loadFromFile(file);

        assert.strictEqual(graph.getDataManager().nodes.size, 1);
    });

    test("loads CSV file with auto-detection", async() => {
        const csv = "source,target\nn1,n2\nn2,n3";
        const file = new File([csv], "edges.csv", {type: "text/csv"});

        const {Graph} = await import("../../src/Graph.js");
        const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
        const graph = new Graph(canvas);

        await graph.loadFromFile(file);

        assert.strictEqual(graph.getDataManager().edges.size, 2);
    });

    test("supports explicit format override", async() => {
        const csv = "source,target\nn1,n2";
        const file = new File([csv], "data.txt", {type: "text/plain"});

        const {Graph} = await import("../../src/Graph.js");
        const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
        const graph = new Graph(canvas);

        await graph.loadFromFile(file, {format: "csv"});

        assert.strictEqual(graph.getDataManager().edges.size, 1);
    });

    test("throws error for unknown format", async() => {
        const file = new File(["unknown content"], "data.xyz", {type: "application/octet-stream"});

        const {Graph} = await import("../../src/Graph.js");
        const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
        const graph = new Graph(canvas);

        let errorThrown = false;
        try {
            await graph.loadFromFile(file);
        } catch (error) {
            errorThrown = true;
            assert.match((error as Error).message, /Could not detect file format/);
        }

        assert.isTrue(errorThrown, "Should throw error for unknown format");
    });
});
