import {afterEach, assert, beforeEach, describe, test, vi} from "vitest";

describe("Graph.loadFromUrl", () => {
    beforeEach(() => {
        // Create a fresh canvas for each test
        document.body.innerHTML = "<canvas id=\"test-canvas\"></canvas>";
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("loads GraphML URL with extension-based detection", async() => {
        const xml = "<?xml version=\"1.0\"?><graphml xmlns=\"http://graphml.graphdrawing.org/xmlns\"><graph><node id=\"n1\"/></graph></graphml>";

        // Mock fetch to return GraphML content
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            new Response(xml, {status: 200}),
        );

        const {Graph} = await import("../../src/Graph.js");
        const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
        const graph = new Graph(canvas);

        await graph.loadFromUrl("https://example.com/test.graphml");

        assert.strictEqual(graph.getDataManager().nodes.size, 1);
        // Verify fetch was called with the URL
        assert.strictEqual(vi.mocked(globalThis.fetch).mock.calls.length, 1);
    });

    test("loads URL with content-based detection when extension unknown", async() => {
        const xml = "<?xml version=\"1.0\"?><graphml xmlns=\"http://graphml.graphdrawing.org/xmlns\"><graph><node id=\"n1\"/><node id=\"n2\"/></graph></graphml>";

        // Mock fetch to return GraphML content
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            new Response(xml, {status: 200}),
        );

        const {Graph} = await import("../../src/Graph.js");
        const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
        const graph = new Graph(canvas);

        // Use .txt extension - should trigger content-based detection
        await graph.loadFromUrl("https://example.com/data.txt");

        assert.strictEqual(graph.getDataManager().nodes.size, 2);
        // Fetch should be called only once (content reused for loading)
        assert.strictEqual(vi.mocked(globalThis.fetch).mock.calls.length, 1);
    });

    test("loads JSON URL with auto-detection from content", async() => {
        const json = JSON.stringify({
            nodes: [{id: "a"}, {id: "b"}, {id: "c"}],
            edges: [{src: "a", dst: "b"}],
        });

        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            new Response(json, {status: 200}),
        );

        const {Graph} = await import("../../src/Graph.js");
        const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
        const graph = new Graph(canvas);

        // Unknown extension - should detect JSON from content
        await graph.loadFromUrl("https://example.com/graph");

        assert.strictEqual(graph.getDataManager().nodes.size, 3);
        assert.strictEqual(graph.getDataManager().edges.size, 1);
    });

    test("supports explicit format override", async() => {
        const csv = "source,target\nn1,n2\nn2,n3";

        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            new Response(csv, {status: 200}),
        );

        const {Graph} = await import("../../src/Graph.js");
        const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
        const graph = new Graph(canvas);

        // Explicitly specify CSV format even though extension is .txt
        await graph.loadFromUrl("https://example.com/data.txt", {format: "csv"});

        assert.strictEqual(graph.getDataManager().edges.size, 2);
    });

    test("throws error for unknown format", async() => {
        const unknownContent = "this is not a recognized graph format ~~~!!!";

        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            new Response(unknownContent, {status: 200}),
        );

        const {Graph} = await import("../../src/Graph.js");
        const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
        const graph = new Graph(canvas);

        let errorThrown = false;
        try {
            await graph.loadFromUrl("https://example.com/data.xyz");
        } catch (error) {
            errorThrown = true;
            assert.match((error as Error).message, /Could not detect file format/);
        }

        assert.isTrue(errorThrown, "Should throw error for unknown format");
    });

    test("throws error for HTTP failure", async() => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            new Response("Not Found", {status: 404, statusText: "Not Found"}),
        );

        const {Graph} = await import("../../src/Graph.js");
        const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
        const graph = new Graph(canvas);

        let errorThrown = false;
        try {
            // Unknown extension forces fetch for content detection
            await graph.loadFromUrl("https://example.com/missing.txt");
        } catch (error) {
            errorThrown = true;
            assert.match((error as Error).message, /Failed to fetch URL/);
            assert.match((error as Error).message, /404/);
        }

        assert.isTrue(errorThrown, "Should throw error for HTTP failure");
    });

    test("does not fetch when extension is recognized", async() => {
        const xml = "<?xml version=\"1.0\"?><graphml xmlns=\"http://graphml.graphdrawing.org/xmlns\"><graph><node id=\"n1\"/></graph></graphml>";

        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(xml, {status: 200}),
        );

        const {Graph} = await import("../../src/Graph.js");
        const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
        const graph = new Graph(canvas);

        // Use recognized extension - should pass URL to DataSource
        await graph.loadFromUrl("https://example.com/test.graphml");

        // Fetch is called once by DataSource (not twice - once for detection, once for loading)
        assert.strictEqual(fetchSpy.mock.calls.length, 1);
    });

    test("avoids double-fetch when content detection is needed", async() => {
        const xml = "<?xml version=\"1.0\"?><graphml xmlns=\"http://graphml.graphdrawing.org/xmlns\"><graph><node id=\"n1\"/></graph></graphml>";

        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(xml, {status: 200}),
        );

        const {Graph} = await import("../../src/Graph.js");
        const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
        const graph = new Graph(canvas);

        // Unrecognized extension - must fetch for content detection
        // But should NOT fetch again for loading (content passed as data)
        await graph.loadFromUrl("https://example.com/data.txt");

        // Should only fetch once total
        assert.strictEqual(fetchSpy.mock.calls.length, 1);
    });

    test("works with graph that has custom nodeIdPath configured", async() => {
        const json = JSON.stringify({
            nodes: [{nodeId: "x"}, {nodeId: "y"}],
            edges: [{src: "x", dst: "y"}],
        });

        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
            new Response(json, {status: 200}),
        );

        const {Graph} = await import("../../src/Graph.js");
        const canvas = document.getElementById("test-canvas") as HTMLCanvasElement;
        const graph = new Graph(canvas);

        // Configure nodeIdPath on the graph config before loading
        graph.styles.config.data.knownFields.nodeIdPath = "nodeId";

        await graph.loadFromUrl("https://example.com/data.json");

        // Nodes should be loaded with custom ID path
        assert.strictEqual(graph.getDataManager().nodes.size, 2);
        assert.isTrue(graph.getDataManager().nodes.has("x"));
        assert.isTrue(graph.getDataManager().nodes.has("y"));
    });
});
