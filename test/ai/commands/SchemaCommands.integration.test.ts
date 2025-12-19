/**
 * SchemaCommands Integration Tests - Tests for command registration and tool definitions.
 * @module test/ai/commands/SchemaCommands.integration.test
 */

import {assert, describe, it} from "vitest";

import {CommandRegistry} from "../../../src/ai/commands/CommandRegistry";
import {describeProperty, sampleData} from "../../../src/ai/commands/SchemaCommands";
import type {Graph} from "../../../src/Graph";
import {createMockGraphWithCustomData} from "../../helpers/mock-graph-custom-data";

/**
 * Create a command registry with schema commands registered.
 */
function createRegistryWithSchemaCommands(): CommandRegistry {
    const registry = new CommandRegistry();
    registry.register(sampleData);
    registry.register(describeProperty);
    return registry;
}

describe("SchemaCommands integration", () => {
    describe("command registration", () => {
        it("sampleData can be registered to CommandRegistry", () => {
            const registry = new CommandRegistry();
            registry.register(sampleData);

            assert.ok(registry.has("sampleData"), "sampleData should be registered");
        });

        it("describeProperty can be registered to CommandRegistry", () => {
            const registry = new CommandRegistry();
            registry.register(describeProperty);

            assert.ok(registry.has("describeProperty"), "describeProperty should be registered");
        });

        it("both commands can be registered together", () => {
            const registry = createRegistryWithSchemaCommands();

            assert.ok(registry.has("sampleData"), "sampleData should be registered");
            assert.ok(registry.has("describeProperty"), "describeProperty should be registered");
            assert.strictEqual(registry.getNames().length, 2);
        });

        it("commands cannot be registered twice", () => {
            const registry = new CommandRegistry();
            registry.register(sampleData);

            assert.throws(() => {
                registry.register(sampleData);
            }, /already registered/);
        });
    });

    describe("tool definitions", () => {
        it("commands appear in tool definitions", () => {
            const registry = createRegistryWithSchemaCommands();
            const toolDefinitions = registry.toToolDefinitions();

            // Find sampleData and describeProperty in tool definitions
            const sampleDataTool = toolDefinitions.find((t) => t.name === "sampleData");
            const describePropertyTool = toolDefinitions.find((t) => t.name === "describeProperty");

            assert.ok(sampleDataTool !== undefined, "sampleData should be in tool definitions");
            assert.ok(describePropertyTool !== undefined, "describeProperty should be in tool definitions");

            // Verify tool definitions have required fields
            assert.ok(sampleDataTool.description.length > 0, "sampleData should have description");
            assert.ok(describePropertyTool.description.length > 0, "describeProperty should have description");
            assert.ok(sampleDataTool.parameters, "sampleData should have parameters");
            assert.ok(describePropertyTool.parameters, "describeProperty should have parameters");
        });

        it("sampleData tool definition matches command metadata", () => {
            const registry = new CommandRegistry();
            registry.register(sampleData);

            const toolDefs = registry.toToolDefinitions();
            const toolDef = toolDefs.find((t) => t.name === "sampleData");

            assert.ok(toolDef);
            assert.strictEqual(toolDef.name, sampleData.name);
            assert.strictEqual(toolDef.description, sampleData.description);
        });

        it("describeProperty tool definition matches command metadata", () => {
            const registry = new CommandRegistry();
            registry.register(describeProperty);

            const toolDefs = registry.toToolDefinitions();
            const toolDef = toolDefs.find((t) => t.name === "describeProperty");

            assert.ok(toolDef);
            assert.strictEqual(toolDef.name, describeProperty.name);
            assert.strictEqual(toolDef.description, describeProperty.description);
        });

        it("tool definitions include parameter schemas", () => {
            const registry = createRegistryWithSchemaCommands();
            const toolDefs = registry.toToolDefinitions();

            // Verify sampleData has target and count parameters in schema
            const sampleDataTool = toolDefs.find((t) => t.name === "sampleData");
            assert.ok(sampleDataTool?.parameters, "sampleData should have parameter schema");

            // Verify describeProperty has property and target parameters
            const describePropertyTool = toolDefs.find((t) => t.name === "describeProperty");
            assert.ok(describePropertyTool?.parameters, "describeProperty should have parameter schema");
        });
    });

    describe("command execution", () => {
        let graph: Graph;

        function createTestGraph(): Graph {
            return createMockGraphWithCustomData({
                nodeCount: 10,
                edgeCount: 15,
                nodeDataGenerator: (i) => ({
                    type: ["server", "client", "router"][i % 3],
                    count: i * 10,
                    active: i % 2 === 0,
                }),
                edgeDataGenerator: () => ({
                    weight: Math.random() * 100,
                    relation: "connects",
                }),
            });
        }

        it("sampleData command can be executed from registry", async() => {
            graph = createTestGraph();
            const registry = createRegistryWithSchemaCommands();

            const cmd = registry.get("sampleData");
            assert.ok(cmd);

            // Execute the command directly
            const noop = (): void => { /* no-op */ };
            const result = await cmd.execute(graph, {target: "nodes", count: 3}, {
                graph,
                abortSignal: new AbortController().signal,
                emitEvent: noop,
                updateStatus: noop,
            });

            assert.strictEqual(result.success, true);
            const data = result.data as {nodes: unknown[]};
            assert.ok(Array.isArray(data.nodes));
            assert.strictEqual(data.nodes.length, 3);
        });

        it("describeProperty command can be executed from registry", async() => {
            graph = createTestGraph();
            const registry = createRegistryWithSchemaCommands();

            const cmd = registry.get("describeProperty");
            assert.ok(cmd);

            // Execute the command directly - property is inside data object
            const noop = (): void => { /* no-op */ };
            const result = await cmd.execute(graph, {property: "type", target: "nodes"}, {
                graph,
                abortSignal: new AbortController().signal,
                emitEvent: noop,
                updateStatus: noop,
            });

            assert.strictEqual(result.success, true);
            const data = result.data as {type: string, property: string};
            assert.strictEqual(data.type, "string");
            assert.strictEqual(data.property, "type");
        });

        it("commands execute independently", async() => {
            graph = createTestGraph();
            const registry = createRegistryWithSchemaCommands();
            const noop = (): void => { /* no-op */ };
            const context = {
                graph,
                abortSignal: new AbortController().signal,
                emitEvent: noop,
                updateStatus: noop,
            };

            // Execute sampleData
            const sampleCmd = registry.get("sampleData");
            assert.ok(sampleCmd);
            const sampleResult = await sampleCmd.execute(graph, {target: "nodes", count: 2}, context);
            assert.strictEqual(sampleResult.success, true);

            // Execute describeProperty - property is inside data object
            const describeCmd = registry.get("describeProperty");
            assert.ok(describeCmd);
            const describeResult = await describeCmd.execute(graph, {property: "active", target: "nodes"}, context);
            assert.strictEqual(describeResult.success, true);
        });
    });

    describe("cleanup", () => {
        it("commands can be unregistered", () => {
            const registry = createRegistryWithSchemaCommands();

            registry.unregister("sampleData");
            assert.ok(!registry.has("sampleData"));
            assert.ok(registry.has("describeProperty"));
        });

        it("registry can be cleared", () => {
            const registry = createRegistryWithSchemaCommands();

            registry.clear();
            assert.strictEqual(registry.getNames().length, 0);
        });
    });
});
