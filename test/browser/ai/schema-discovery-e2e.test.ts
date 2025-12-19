/**
 * Schema Discovery End-to-End Tests
 *
 * Tests schema discovery commands against a real Graph instance with Babylon.js rendering.
 * These tests verify that schema extraction, sampleData, and describeProperty
 * work correctly with actual graph data.
 *
 * @module test/browser/ai/schema-discovery-e2e
 */

import {afterEach, assert, beforeEach, describe, it} from "vitest";

import type {MockLlmProvider} from "../../../src/ai/providers/MockLlmProvider";
import type {Graph} from "../../../src/Graph";
import {
    cleanupE2EGraph,
    createE2EGraph,
    type TestEdgeData,
    type TestNodeData,
} from "../../helpers/e2e-graph-setup";

/**
 * Test nodes with rich property types for schema testing.
 */
const SCHEMA_TEST_NODES: TestNodeData[] = [
    {id: "A", label: "Alpha", type: "server", priority: 1, active: true},
    {id: "B", label: "Beta", type: "client", priority: 2, active: false},
    {id: "C", label: "Gamma", type: "server", priority: 3, active: true},
    {id: "D", label: "Delta", type: "router", priority: 4, active: false},
    {id: "E", label: "Epsilon", type: "client", priority: 5, active: true},
];

/**
 * Test edges with varied data for schema testing.
 */
const SCHEMA_TEST_EDGES: TestEdgeData[] = [
    {src: "A", dst: "B", weight: 10, relation: "connects"},
    {src: "A", dst: "C", weight: 20, relation: "manages"},
    {src: "B", dst: "D", weight: 15, relation: "connects"},
    {src: "C", dst: "E", weight: 25, relation: "manages"},
    {src: "D", dst: "E", weight: 30, relation: "routes"},
];

/**
 * Type for sampleData command results.
 */
interface SampleDataResult {
    nodes?: {id: string, data: Record<string, unknown>}[];
    edges?: {id: string, source: string, target: string, data: Record<string, unknown>}[];
}

/**
 * Type for describeProperty string results.
 */
interface DescribePropertyStringResult {
    property: string;
    target: string;
    type: "string";
    totalCount: number;
    uniqueCount: number;
    distribution: Record<string, {count: number, percentage: number}>;
}

/**
 * Type for describeProperty number results.
 */
interface DescribePropertyNumberResult {
    property: string;
    target: string;
    type: "number";
    totalCount: number;
    statistics: {min: number, max: number, avg: number, median: number};
    histogram: {range: string, count: number}[];
}

/**
 * Type for describeProperty boolean results.
 */
interface DescribePropertyBooleanResult {
    property: string;
    target: string;
    type: "boolean";
    totalCount: number;
    distribution: {
        true: {count: number, percentage: number};
        false: {count: number, percentage: number};
    };
}

describe("Schema Discovery End-to-End", () => {
    let graph: Graph;

    beforeEach(async() => {
        // Create a real graphty-element with schema-rich test data
        const result = await createE2EGraph({
            nodes: SCHEMA_TEST_NODES,
            edges: SCHEMA_TEST_EDGES,
            enableAi: true,
        });
        ({graph} = result);
    });

    afterEach(() => {
        cleanupE2EGraph();
    });

    /**
     * Get the mock provider from the graph's AI manager.
     */
    function getProvider(): MockLlmProvider {
        const aiManager = graph.getAiManager();
        if (!aiManager) {
            throw new Error("AI Manager not initialized");
        }

        return aiManager.getProvider() as MockLlmProvider;
    }

    describe("schema in system prompt", () => {
        it("schema appears in system prompt for real graph", () => {
            const aiManager = graph.getAiManager();
            assert.ok(aiManager !== null, "AI Manager should be available");

            const schemaManager = aiManager.getSchemaManager();
            assert.ok(schemaManager !== null, "Schema manager should be available");

            const schema = schemaManager.getSchema();
            assert.ok(schema !== null, "Schema should be extracted");
            assert.strictEqual(schema.nodeCount, 5, "Should have 5 nodes");
            assert.strictEqual(schema.edgeCount, 5, "Should have 5 edges");

            // Check that schema has detected properties
            assert.ok(schema.nodeProperties.length > 0, "Should have node properties");
            assert.ok(schema.edgeProperties.length > 0, "Should have edge properties");
        });

        it("schema correctly identifies property types", () => {
            const aiManager = graph.getAiManager();
            const schemaManager = aiManager?.getSchemaManager();
            const schema = schemaManager?.getSchema();

            assert.ok(schema);

            // Find specific properties in schema
            const typeProp = schema.nodeProperties.find((p) => p.name === "type");
            const priorityProp = schema.nodeProperties.find((p) => p.name === "priority");
            const activeProp = schema.nodeProperties.find((p) => p.name === "active");

            // Type should be a string
            // Note: enum detection requires 25+ samples, so enumValues may not be populated with only 5 test nodes
            assert.ok(typeProp, "Should find 'type' property");
            assert.strictEqual(typeProp.type, "string");

            // Priority should be a number (integer) with range
            assert.ok(priorityProp, "Should find 'priority' property");
            assert.ok(
                priorityProp.type === "number" || priorityProp.type === "integer",
                `Priority should be numeric, got: ${priorityProp.type}`,
            );
            assert.ok(priorityProp.range, "Priority should have range");
            assert.strictEqual(priorityProp.range.min, 1);
            assert.strictEqual(priorityProp.range.max, 5);

            // Active should be a boolean
            assert.ok(activeProp, "Should find 'active' property");
            assert.strictEqual(activeProp.type, "boolean");
        });

        it("formatted schema is readable markdown", () => {
            const aiManager = graph.getAiManager();
            const schemaManager = aiManager?.getSchemaManager();
            const formatted = schemaManager?.getFormattedSchema();

            assert.ok(formatted);
            assert.ok(formatted.includes("Node"), "Should mention nodes");
            assert.ok(formatted.includes("Edge"), "Should mention edges");

            // Should contain markdown formatting
            assert.ok(
                formatted.includes("#") || formatted.includes("*") || formatted.includes("-"),
                "Should contain markdown formatting",
            );
        });
    });

    describe("sampleData command", () => {
        it("returns real node data", async() => {
            const provider = getProvider();

            provider.setResponse("sample nodes", {
                text: "",
                toolCalls: [{id: "1", name: "sampleData", arguments: {target: "nodes", count: 3}}],
            });

            const result = await graph.aiCommand("show me some sample nodes");

            assert.strictEqual(result.success, true);
            const data = result.data as SampleDataResult;
            assert.ok(data.nodes, "Should return nodes");
            assert.strictEqual(data.nodes.length, 3);

            // Verify node structure
            const node = data.nodes[0];
            assert.ok(typeof node.id === "string");
            assert.ok(typeof node.data === "object");
        });

        it("returns real edge data", async() => {
            const provider = getProvider();

            provider.setResponse("sample edges", {
                text: "",
                toolCalls: [{id: "1", name: "sampleData", arguments: {target: "edges", count: 2}}],
            });

            const result = await graph.aiCommand("show me some sample edges");

            assert.strictEqual(result.success, true);
            const data = result.data as SampleDataResult;
            assert.ok(data.edges, "Should return edges");
            assert.strictEqual(data.edges.length, 2);

            // Verify edge structure
            const edge = data.edges[0];
            assert.ok(typeof edge.id === "string");
            assert.ok(typeof edge.source === "string");
            assert.ok(typeof edge.target === "string");
            assert.ok(typeof edge.data === "object");
        });

        it("returns both nodes and edges by default", async() => {
            const provider = getProvider();

            provider.setResponse("sample data", {
                text: "",
                toolCalls: [{id: "1", name: "sampleData", arguments: {}}],
            });

            const result = await graph.aiCommand("show me sample data");

            assert.strictEqual(result.success, true);
            const data = result.data as SampleDataResult;
            assert.ok(data.nodes, "Should return nodes");
            assert.ok(data.edges, "Should return edges");
        });

        it("node samples contain actual data properties", async() => {
            const provider = getProvider();

            provider.setResponse("all nodes", {
                text: "",
                toolCalls: [{id: "1", name: "sampleData", arguments: {target: "nodes", count: 5}}],
            });

            const result = await graph.aiCommand("sample all nodes");

            assert.strictEqual(result.success, true);
            const data = result.data as SampleDataResult;
            assert.ok(data.nodes);

            // Check that at least one node has our expected properties
            const hasExpectedData = data.nodes.some((node) =>
                node.data.type !== undefined ||
                node.data.priority !== undefined ||
                node.data.label !== undefined,
            );
            assert.ok(hasExpectedData, "Nodes should contain expected data properties");
        });
    });

    describe("describeProperty command", () => {
        it("analyzes string property (type)", async() => {
            const provider = getProvider();

            provider.setResponse("type property", {
                text: "",
                toolCalls: [{id: "1", name: "describeProperty", arguments: {property: "type", target: "nodes"}}],
            });

            const result = await graph.aiCommand("describe the type property");

            assert.strictEqual(result.success, true);
            const data = result.data as DescribePropertyStringResult;
            assert.strictEqual(data.type, "string");
            assert.strictEqual(data.property, "type");
            assert.ok(data.distribution, "Should have distribution");
            assert.ok(data.uniqueCount > 0, "Should have unique values");
        });

        it("analyzes number property (priority)", async() => {
            const provider = getProvider();

            provider.setResponse("describe priority", {
                text: "",
                toolCalls: [{id: "1", name: "describeProperty", arguments: {property: "priority", target: "nodes"}}],
            });

            const result = await graph.aiCommand("describe priority property");

            assert.strictEqual(result.success, true);
            const data = result.data as DescribePropertyNumberResult;
            assert.strictEqual(data.type, "number");
            assert.strictEqual(data.property, "priority");
            assert.ok(data.statistics, "Should have statistics");
            assert.strictEqual(data.statistics.min, 1);
            assert.strictEqual(data.statistics.max, 5);
        });

        it("analyzes boolean property (active)", async() => {
            const provider = getProvider();

            provider.setResponse("describe active", {
                text: "",
                toolCalls: [{id: "1", name: "describeProperty", arguments: {property: "active", target: "nodes"}}],
            });

            const result = await graph.aiCommand("describe active property");

            assert.strictEqual(result.success, true);
            const data = result.data as DescribePropertyBooleanResult;
            assert.strictEqual(data.type, "boolean");
            assert.strictEqual(data.property, "active");
            assert.ok(data.distribution, "Should have distribution");
            assert.ok(data.distribution.true, "Should have true count");
            assert.ok(data.distribution.false, "Should have false count");
        });

        it("analyzes edge property (weight)", async() => {
            const provider = getProvider();

            provider.setResponse("edge weight", {
                text: "",
                toolCalls: [{id: "1", name: "describeProperty", arguments: {property: "weight", target: "edges"}}],
            });

            const result = await graph.aiCommand("describe edge weight");

            assert.strictEqual(result.success, true);
            const data = result.data as DescribePropertyNumberResult;
            assert.strictEqual(data.type, "number");
            assert.strictEqual(data.target, "edges");
            assert.ok(data.statistics, "Should have statistics");
        });

        it("returns not found for missing property", async() => {
            const provider = getProvider();

            provider.setResponse("nonexistent property", {
                text: "",
                toolCalls: [{id: "1", name: "describeProperty", arguments: {property: "nonexistent", target: "nodes"}}],
            });

            const result = await graph.aiCommand("describe nonexistent property");

            assert.strictEqual(result.success, false);
            assert.ok(result.message.includes("not found"), "Should indicate property not found");
        });

        it("suggests available properties when not found", async() => {
            const provider = getProvider();

            provider.setResponse("xyz123", {
                text: "",
                toolCalls: [{id: "1", name: "describeProperty", arguments: {property: "xyz123", target: "nodes"}}],
            });

            const result = await graph.aiCommand("describe xyz123");

            assert.strictEqual(result.success, false);
            // Should mention available properties in message or data
            const dataWithProps = result.data as {availableProperties?: string[]} | undefined;
            assert.ok(
                result.message.includes("Available") ||
                dataWithProps?.availableProperties !== undefined,
            );
        });
    });

    describe("LLM selector writing support", () => {
        it("LLM can use schema info to write type selectors", async() => {
            const provider = getProvider();

            // First, verify schema is available
            const aiManager = graph.getAiManager();
            const schemaManager = aiManager?.getSchemaManager();
            const schema = schemaManager?.getSchema();

            assert.ok(schema);
            const typeProp = schema.nodeProperties.find((p) => p.name === "type");
            // With only 5 test nodes, enum detection won't trigger (requires 25+ samples)
            // But we can verify the property exists as a string type
            assert.ok(typeProp, "Schema should have 'type' property");
            assert.strictEqual(typeProp.type, "string");

            // Now simulate LLM using that info to create a selector
            provider.setResponse("server nodes", {
                text: "",
                toolCalls: [{id: "1", name: "findNodes", arguments: {selector: "type == 'server'"}}],
            });

            const result = await graph.aiCommand("find all server nodes");

            assert.strictEqual(result.success, true);
            // Our test data has 2 server nodes (A and C)
            const data = result.data as {count: number, nodeIds: string[]};
            assert.strictEqual(data.count, 2);
            assert.ok(data.nodeIds.includes("A"));
            assert.ok(data.nodeIds.includes("C"));
        });

        it("LLM can use schema info for numeric comparisons", async() => {
            const provider = getProvider();

            // Simulate LLM creating a selector based on schema knowledge
            provider.setResponse("high priority", {
                text: "",
                toolCalls: [{id: "1", name: "findNodes", arguments: {selector: "priority >= 3"}}],
            });

            const result = await graph.aiCommand("find high priority nodes");

            assert.strictEqual(result.success, true);
            // Nodes with priority >= 3 are C (3), D (4), E (5)
            const data = result.data as {count: number, nodeIds: string[]};
            assert.strictEqual(data.count, 3);
        });

        it("LLM can use schema info for boolean filters", async() => {
            const provider = getProvider();

            provider.setResponse("find active", {
                text: "",
                toolCalls: [{id: "1", name: "findNodes", arguments: {selector: "active == 'true'"}}],
            });

            const result = await graph.aiCommand("find active nodes");

            assert.strictEqual(result.success, true);
            // Active nodes are A, C, E (3 total)
            const data = result.data as {count: number, nodeIds: string[]};
            assert.strictEqual(data.count, 3);
        });
    });

    describe("schema and sample commands in sequence", () => {
        it("sampleData then describeProperty for discovered property", async() => {
            const provider = getProvider();

            // First sample nodes to "discover" properties
            provider.setResponse("sample", {
                text: "",
                toolCalls: [{id: "1", name: "sampleData", arguments: {target: "nodes", count: 2}}],
            });
            const sampleResult = await graph.aiCommand("show samples");
            assert.strictEqual(sampleResult.success, true);

            // Then describe a discovered property
            provider.setResponse("describe", {
                text: "",
                toolCalls: [{id: "1", name: "describeProperty", arguments: {property: "type", target: "nodes"}}],
            });
            const describeResult = await graph.aiCommand("describe type");
            assert.strictEqual(describeResult.success, true);
        });

        it("describeProperty then findAndStyle using discovered values", async() => {
            const provider = getProvider();

            // First describe to get enum values
            provider.setResponse("describe type", {
                text: "",
                toolCalls: [{id: "1", name: "describeProperty", arguments: {property: "type", target: "nodes"}}],
            });
            const describeResult = await graph.aiCommand("describe type");
            assert.strictEqual(describeResult.success, true);

            const data = describeResult.data as DescribePropertyStringResult;
            assert.ok(data.distribution);
            assert.ok("server" in data.distribution || "client" in data.distribution);

            // Now style using the discovered value
            provider.setResponse("style servers", {
                text: "",
                toolCalls: [{id: "1", name: "findAndStyleNodes", arguments: {
                    selector: "type == 'server'",
                    style: {color: "#ff0000"},
                    layerName: "server-highlight",
                }}],
            });
            const styleResult = await graph.aiCommand("highlight servers in red");
            assert.strictEqual(styleResult.success, true);
        });

        it("multiple sampleData calls for different targets", async() => {
            const provider = getProvider();

            // Sample nodes
            provider.setResponse("sample nodes", {
                text: "",
                toolCalls: [{id: "1", name: "sampleData", arguments: {target: "nodes", count: 3}}],
            });
            const nodeResult = await graph.aiCommand("sample nodes");
            assert.strictEqual(nodeResult.success, true);

            // Sample edges
            provider.setResponse("sample edges", {
                text: "",
                toolCalls: [{id: "1", name: "sampleData", arguments: {target: "edges", count: 2}}],
            });
            const edgeResult = await graph.aiCommand("sample edges");
            assert.strictEqual(edgeResult.success, true);

            // Verify both returned appropriate data
            const nodeData = nodeResult.data as SampleDataResult;
            const edgeData = edgeResult.data as SampleDataResult;
            assert.ok(nodeData.nodes?.length === 3);
            assert.ok(edgeData.edges?.length === 2);
        });
    });
});
