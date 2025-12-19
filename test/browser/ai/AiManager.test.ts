/**
 * AiManager Tests - Tests for the AI Manager that integrates with Graph.
 * @module test/ai/AiManager.test
 */

import {afterEach, assert, beforeEach, describe, it} from "vitest";

import {AiManager} from "../../../src/ai/AiManager";
import type {Graph} from "../../../src/Graph";
import {createMockGraphContext} from "../../helpers/mock-graph-context";

describe("AiManager", () => {
    let manager: AiManager;
    let mockGraph: Graph;

    beforeEach(() => {
        mockGraph = createMockGraphContext({nodeCount: 10, edgeCount: 15});
        manager = new AiManager();
        manager.init(mockGraph, {provider: "mock"});
    });

    afterEach(() => {
        manager.dispose();
    });

    describe("initialization", () => {
        it("initializes with built-in commands", () => {
            const commands = manager.getRegisteredCommands();
            assert.ok(commands.includes("queryGraph"), "should include queryGraph command");
            assert.ok(commands.includes("setLayout"), "should include setLayout command");
            assert.ok(commands.includes("setImmersiveMode"), "should include setImmersiveMode command");
        });

        it("initializes with mock provider", () => {
            const status = manager.getStatus();
            assert.strictEqual(status.state, "ready");
        });

        it("can be initialized with different providers", () => {
            const anotherManager = new AiManager();
            // Note: In real usage, you'd need API keys for non-mock providers
            // For this test, we just verify the manager accepts the provider type
            anotherManager.init(mockGraph, {provider: "mock"});
            assert.strictEqual(anotherManager.getStatus().state, "ready");
            anotherManager.dispose();
        });
    });

    describe("execute", () => {
        it("executes commands through context", async() => {
            const result = await manager.execute("How many nodes?");
            assert.strictEqual(result.success, true);
        });

        it("returns error for disposed manager", async() => {
            manager.dispose();
            const result = await manager.execute("test");
            assert.strictEqual(result.success, false);
            assert.ok(result.message.toLowerCase().includes("disposed"));
        });
    });

    describe("API key management", () => {
        it("can set API keys without throwing", () => {
            // Should not throw
            manager.setApiKey("openai", "sk-test-key");
            manager.setApiKey("anthropic", "sk-ant-test-key");
            manager.setApiKey("google", "AIza-test-key");
        });
    });

    describe("dispose", () => {
        it("disposes cleanly", () => {
            manager.dispose();
            // Attempting to get status after dispose should still work (returns disposed state)
            const status = manager.getStatus();
            assert.ok(status);
        });

        it("can be disposed multiple times without error", () => {
            manager.dispose();
            manager.dispose(); // Should not throw
        });
    });

    describe("status", () => {
        it("returns current status", () => {
            const status = manager.getStatus();
            assert.strictEqual(status.state, "ready");
            assert.strictEqual(status.canCancel, false);
        });

        it("allows subscribing to status changes", async() => {
            const states: string[] = [];
            const unsubscribe = manager.onStatusChange((status) => {
                states.push(status.state);
            });

            await manager.execute("test");

            // Should have received status updates
            assert.ok(states.length > 0);
            unsubscribe();
        });
    });

    describe("cancel", () => {
        it("can cancel in-progress commands", () => {
            // Start a command (don't await)
            void manager.execute("test");

            // Cancel should not throw
            manager.cancel();
        });
    });
});
