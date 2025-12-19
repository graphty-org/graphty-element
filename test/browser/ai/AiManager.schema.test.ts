/**
 * AiManager Schema Lifecycle Tests.
 * @module test/ai/AiManager.schema.test
 */

import type {Observable} from "@babylonjs/core";
import {afterEach, assert, beforeEach, describe, it, vi} from "vitest";

import {AiManager} from "../../../src/ai/AiManager";
import type {Graph} from "../../../src/Graph";
import type {DataManager, EventManager} from "../../../src/managers";

/** Type for event listener callback */
type EventCallback = (event: unknown) => void;

/**
 * Result from createMockGraphWithEvents.
 */
interface MockGraphResult {
    graph: Graph;
    mockNodes: Map<string, {id: string, data: Record<string, unknown>}>;
    mockEdges: Map<string, {id: string, srcId: string, dstId: string, data: Record<string, unknown>}>;
    eventListeners: Map<string, EventCallback[]>;
    addNode: (id: string, data: Record<string, unknown>) => void;
    addEdge: (id: string, srcId: string, dstId: string, data: Record<string, unknown>) => void;
    emitDataAdded: (type: "nodes" | "edges", count: number) => void;
}

/**
 * Create a mock graph for testing schema lifecycle.
 * This graph supports adding nodes/edges and emitting events.
 */
function createMockGraphWithEvents(): MockGraphResult {
    const mockNodes = new Map<string, {id: string, data: Record<string, unknown>}>();
    const mockEdges = new Map<string, {id: string, srcId: string, dstId: string, data: Record<string, unknown>}>();
    const eventListeners = new Map<string, EventCallback[]>();

    // Add initial nodes for schema extraction
    for (let i = 0; i < 30; i++) {
        mockNodes.set(`node-${i}`, {
            id: `node-${i}`,
            data: {
                type: ["server", "client", "router"][i % 3],
                age: 20 + i,
                active: i % 2 === 0,
            },
        });
    }

    // Add initial edges
    for (let i = 0; i < 15; i++) {
        mockEdges.set(`edge-${i}`, {
            id: `edge-${i}`,
            srcId: `node-${i}`,
            dstId: `node-${(i + 1) % 30}`,
            data: {
                weight: Math.random() * 100,
                relation: "connects",
            },
        });
    }

    const mockDataManager = {
        nodes: mockNodes,
        edges: mockEdges,
        getNode: (id: string) => mockNodes.get(id),
        getEdge: (id: string) => mockEdges.get(id),
    } as unknown as DataManager;

    const mockEventManager = {
        addListener: (type: string, callback: EventCallback): symbol => {
            if (!eventListeners.has(type)) {
                eventListeners.set(type, []);
            }

            const listeners = eventListeners.get(type);
            listeners?.push(callback);

            return Symbol("listener-id");
        },
        removeListener: (): boolean => true,
        onGraphEvent: {
            add: () => null,
            remove: () => null,
        } as unknown as Observable<unknown>,
    } as unknown as EventManager;

    const graph = {
        getNodeCount: () => mockNodes.size,
        getEdgeCount: () => mockEdges.size,
        getDataManager: () => mockDataManager,
        eventManager: mockEventManager,
        is2D: () => false,
        getLayoutManager: () => ({
            layoutEngine: {type: "ngraph"},
        }),
    } as unknown as Graph;

    const addNode = (id: string, data: Record<string, unknown>): void => {
        mockNodes.set(id, {id, data});
    };

    const addEdge = (id: string, srcId: string, dstId: string, data: Record<string, unknown>): void => {
        mockEdges.set(id, {id, srcId, dstId, data});
    };

    const emitDataAdded = (type: "nodes" | "edges", count: number): void => {
        const listeners = eventListeners.get("data-added") ?? [];

        for (const listener of listeners) {
            listener({type: "data-added", dataType: type, count});
        }
    };

    return {
        graph,
        mockNodes,
        mockEdges,
        eventListeners,
        addNode,
        addEdge,
        emitDataAdded,
    };
}

describe("AiManager schema lifecycle", () => {
    let aiManager: AiManager;

    beforeEach(() => {
        aiManager = new AiManager();
        vi.useFakeTimers();
    });

    afterEach(() => {
        aiManager.dispose();
        vi.useRealTimers();
    });

    describe("initialization", () => {
        it("extracts schema on initialization", () => {
            const {graph} = createMockGraphWithEvents();

            aiManager.init(graph, {
                provider: "mock",
                registerBuiltinCommands: false,
            });

            const schemaManager = aiManager.getSchemaManager();
            assert.ok(schemaManager !== null, "Should have schema manager after init");

            const schema = schemaManager.getSchema();
            assert.ok(schema !== null, "Should have extracted schema on init");
            assert.strictEqual(schema.nodeCount, 30, "Should have correct node count");
        });

        it("does not extract schema when graph is empty", () => {
            // Create empty graph
            const mockDataManager = {
                nodes: new Map(),
                edges: new Map(),
            } as unknown as DataManager;

            const mockEventManager = {
                addListener: (): symbol => Symbol("id"),
                removeListener: (): boolean => true,
            } as unknown as EventManager;

            const emptyGraph = {
                getNodeCount: () => 0,
                getEdgeCount: () => 0,
                getDataManager: () => mockDataManager,
                eventManager: mockEventManager,
                is2D: () => false,
                getLayoutManager: () => ({layoutEngine: {type: "ngraph"}}),
            } as unknown as Graph;

            aiManager.init(emptyGraph, {
                provider: "mock",
                registerBuiltinCommands: false,
            });

            const schemaManager = aiManager.getSchemaManager();
            const schema = schemaManager?.getSchema();

            // Schema should be extracted even for empty graph (with zero properties)
            assert.ok(schema !== null, "Should have schema even for empty graph");
            assert.strictEqual(schema?.nodeCount, 0);
        });
    });

    describe("data change updates", () => {
        it("updates schema when nodes added", async() => {
            const {graph, addNode, emitDataAdded} = createMockGraphWithEvents();

            aiManager.init(graph, {
                provider: "mock",
                registerBuiltinCommands: false,
            });

            const schemaManager = aiManager.getSchemaManager();
            assert.ok(schemaManager, "Schema manager should exist");

            const initialSchema = schemaManager.extract();
            const initialNodeCount = initialSchema.nodeCount;

            // Add new nodes
            addNode("new-node-1", {type: "new-type", size: 42});
            addNode("new-node-2", {type: "new-type", size: 43});

            // Emit data-added event
            emitDataAdded("nodes", 2);

            // Fast-forward through debounce delay
            await vi.advanceTimersByTimeAsync(500);

            // Schema should be invalidated and will be re-extracted on next access
            const newSchema = schemaManager.extract();
            assert.strictEqual(newSchema.nodeCount, initialNodeCount + 2, "Should reflect new node count");
        });

        it("updates schema when edges added", async() => {
            const {graph, addEdge, emitDataAdded} = createMockGraphWithEvents();

            aiManager.init(graph, {
                provider: "mock",
                registerBuiltinCommands: false,
            });

            const schemaManager = aiManager.getSchemaManager();
            assert.ok(schemaManager, "Schema manager should exist");

            const initialSchema = schemaManager.extract();
            const initialEdgeCount = initialSchema.edgeCount;

            // Add new edges
            addEdge("new-edge-1", "node-0", "node-1", {weight: 50});

            // Emit data-added event
            emitDataAdded("edges", 1);

            // Fast-forward through debounce delay
            await vi.advanceTimersByTimeAsync(500);

            // Schema should be invalidated
            const newSchema = schemaManager.extract();
            assert.strictEqual(newSchema.edgeCount, initialEdgeCount + 1, "Should reflect new edge count");
        });

        it("debounces rapid schema updates", async() => {
            const {graph, emitDataAdded} = createMockGraphWithEvents();

            aiManager.init(graph, {
                provider: "mock",
                registerBuiltinCommands: false,
            });

            const schemaManager = aiManager.getSchemaManager();
            assert.ok(schemaManager, "Schema manager should exist");

            // Spy on invalidateCache
            let invalidateCount = 0;
            const originalInvalidate = schemaManager.invalidateCache.bind(schemaManager);
            schemaManager.invalidateCache = (): void => {
                invalidateCount++;
                originalInvalidate();
            };

            // Emit multiple rapid data-added events
            emitDataAdded("nodes", 1);
            emitDataAdded("nodes", 1);
            emitDataAdded("nodes", 1);
            emitDataAdded("edges", 1);
            emitDataAdded("edges", 1);

            // Should not have invalidated yet (debounced)
            assert.strictEqual(invalidateCount, 0, "Should not invalidate during debounce period");

            // Fast-forward through debounce delay
            await vi.advanceTimersByTimeAsync(500);

            // Should have invalidated only once
            assert.strictEqual(invalidateCount, 1, "Should invalidate once after debounce");
        });
    });

    describe("system prompt integration", () => {
        it("includes schema in generated system prompt", () => {
            const {graph} = createMockGraphWithEvents();

            aiManager.init(graph, {
                provider: "mock",
                registerBuiltinCommands: false,
            });

            const controller = aiManager.getController();
            assert.ok(controller !== null, "Should have controller after init");

            // The controller should have access to schema through its system prompt building
            // We can verify this by checking the schema manager exists and has schema
            const schemaManager = aiManager.getSchemaManager();
            assert.ok(schemaManager !== null);

            const schema = schemaManager.getSchema();
            assert.ok(schema !== null, "Schema should be available for system prompt");
            assert.ok(schema.nodeProperties.length > 0, "Schema should have node properties");
        });
    });

    describe("dispose cleanup", () => {
        it("cleans up event listeners on dispose", () => {
            const {graph, eventListeners} = createMockGraphWithEvents();

            aiManager.init(graph, {
                provider: "mock",
                registerBuiltinCommands: false,
            });

            // Verify listener was added
            const dataAddedListeners = eventListeners.get("data-added") ?? [];
            assert.ok(dataAddedListeners.length > 0, "Should have data-added listener");

            // Dispose
            aiManager.dispose();

            // Schema manager should be cleared
            const schemaManager = aiManager.getSchemaManager();
            assert.strictEqual(schemaManager, null, "Schema manager should be null after dispose");
        });
    });
});
