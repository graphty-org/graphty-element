/**
 * Graph AI Key Management Tests - Tests for Graph-level API key manager access.
 * @module test/ai/Graph.keyPersistence.test
 */

import {afterEach, assert, beforeEach, describe, it} from "vitest";

import {ApiKeyManager} from "../../../src/ai/keys";
import type {Graph} from "../../../src/Graph";
import {cleanupE2EGraph, createE2EGraph} from "../../helpers/e2e-graph-setup";

describe("Graph AI key management", () => {
    let graph: Graph;
    let testPrefix: string;

    beforeEach(() => {
        // Generate unique prefix for each test
        testPrefix = `@graphty-test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        // Clear any existing test data
        localStorage.clear();
        sessionStorage.clear();
    });

    afterEach(() => {
        cleanupE2EGraph();
        // Clean up storage after each test
        localStorage.clear();
        sessionStorage.clear();
    });

    describe("getApiKeyManager", () => {
        it("should return null for getApiKeyManager before AI enabled", async() => {
            ({graph} = await createE2EGraph({
                nodes: [{id: "1", label: "Test"}],
                edges: [],
                enableAi: false,
            }));

            const keyManager = graph.getApiKeyManager();
            assert.strictEqual(keyManager, null);
        });

        it("should return ApiKeyManager after AI enabled", async() => {
            ({graph} = await createE2EGraph({
                nodes: [{id: "1", label: "Test"}],
                edges: [],
                enableAi: true,
            }));

            const keyManager = graph.getApiKeyManager();
            assert.ok(keyManager !== null, "keyManager should not be null");
            assert.ok(keyManager instanceof ApiKeyManager);
        });

        it("should allow accessing persistence config after AI enabled with persistence", async() => {
            ({graph} = await createE2EGraph({
                nodes: [{id: "1", label: "Test"}],
                edges: [],
                enableAi: false,
            }));

            // Enable AI with persistence
            await graph.enableAiControl({
                provider: "mock",
                keyPersistence: {
                    enabled: true,
                    encryptionKey: "test-secret-key-long",
                    prefix: testPrefix,
                },
            });

            const keyManager = graph.getApiKeyManager();
            assert.ok(keyManager !== null);
            assert.strictEqual(keyManager.isPersistenceEnabled(), true);
        });

        it("should allow checking configured providers after AI enabled", async() => {
            ({graph} = await createE2EGraph({
                nodes: [{id: "1", label: "Test"}],
                edges: [],
                enableAi: false,
            }));

            // Enable AI with an API key
            await graph.enableAiControl({
                provider: "openai",
                apiKey: "sk-test-key",
                keyPersistence: {
                    enabled: true,
                    encryptionKey: "test-secret-key-long",
                    prefix: testPrefix,
                },
            });

            const keyManager = graph.getApiKeyManager();
            const providers = keyManager?.getConfiguredProviders() ?? [];
            assert.ok(providers.includes("openai"));
        });
    });

    describe("static createApiKeyManager", () => {
        it("should create standalone ApiKeyManager via static method", async() => {
            // Import Graph dynamically to access static method
            const {Graph} = await import("../../../src/Graph");

            const keyManager = Graph.createApiKeyManager();
            assert.ok(keyManager instanceof ApiKeyManager);
            assert.strictEqual(keyManager.isPersistenceEnabled(), false);
        });

        it("should allow configuring persistence on standalone manager", async() => {
            const {Graph} = await import("../../../src/Graph");

            const keyManager = Graph.createApiKeyManager();
            keyManager.enablePersistence({
                encryptionKey: "test-secret-key-long",
                storage: "localStorage",
                prefix: testPrefix,
            });

            assert.strictEqual(keyManager.isPersistenceEnabled(), true);
        });

        it("should allow setting keys on standalone manager before AI enabled", async() => {
            const {Graph} = await import("../../../src/Graph");

            const keyManager = Graph.createApiKeyManager();
            keyManager.enablePersistence({
                encryptionKey: "test-secret-key-long",
                storage: "localStorage",
                prefix: testPrefix,
            });
            keyManager.setKey("openai", "sk-standalone-key");
            keyManager.setKey("anthropic", "sk-anthropic-key");

            const providers = keyManager.getConfiguredProviders();
            assert.ok(providers.includes("openai"));
            assert.ok(providers.includes("anthropic"));
            assert.strictEqual(keyManager.getKey("openai"), "sk-standalone-key");
        });
    });

    describe("key persistence integration", () => {
        it("should persist keys across Graph instances", async() => {
            // First graph - save key
            const result1 = await createE2EGraph({
                nodes: [{id: "1", label: "Test"}],
                edges: [],
                enableAi: false,
            });
            const graph1 = result1.graph;

            await graph1.enableAiControl({
                provider: "openai",
                apiKey: "sk-test-key-persist",
                keyPersistence: {
                    enabled: true,
                    encryptionKey: "my-secret-long-key",
                    prefix: testPrefix,
                },
            });

            // Clean up first graph
            cleanupE2EGraph();

            // Second graph - key should be available
            const result2 = await createE2EGraph({
                nodes: [{id: "1", label: "Test"}],
                edges: [],
                enableAi: false,
            });
            const graph2 = result2.graph;
            graph = graph2; // Set for cleanup

            await graph2.enableAiControl({
                provider: "openai",
                keyPersistence: {
                    enabled: true,
                    encryptionKey: "my-secret-long-key",
                    prefix: testPrefix,
                },
            });

            const keyManager = graph2.getApiKeyManager();
            assert.strictEqual(keyManager?.getKey("openai"), "sk-test-key-persist");
        });
    });
});
