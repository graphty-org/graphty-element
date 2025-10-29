import {assert, beforeEach, describe, it} from "vitest";

import {EventManager} from "../../src/managers/EventManager";
import {type OperationCategory, type OperationContext, OperationQueueManager} from "../../src/managers/OperationQueueManager";

describe("OperationQueueManager", () => {
    let eventManager: EventManager;
    let queueManager: OperationQueueManager;

    beforeEach(async() => {
        eventManager = new EventManager();
        await eventManager.init();
        queueManager = new OperationQueueManager(eventManager);
        await queueManager.init();
    });

    it("should queue and execute operations in dependency order", async() => {
        const executionOrder: string[] = [];

        // Queue operations in reverse dependency order
        queueManager.queueOperation("data-add", () => {
            executionOrder.push("data-add");
        });

        queueManager.queueOperation("style-init", () => {
            executionOrder.push("style-init");
        });

        queueManager.queueOperation("layout-set", () => {
            executionOrder.push("layout-set");
        });

        // Wait for completion
        await queueManager.waitForCompletion();

        // Should execute in correct dependency order: style-init -> data-add -> layout-set
        assert.deepEqual(executionOrder, ["style-init", "data-add", "layout-set"]);
    });

    it("should batch operations queued in same microtask", async() => {
        const executionOrder: string[] = [];
        let batchCount = 0;

        // Listen for batch events
        eventManager.addListener("operation-batch-complete", () => {
            batchCount++;
        });

        // Queue multiple operations in same microtask
        queueManager.queueOperation("style-init", () => {
            executionOrder.push("style-init");
        });

        queueManager.queueOperation("data-add", () => {
            executionOrder.push("data-add-1");
        });

        queueManager.queueOperation("data-add", () => {
            executionOrder.push("data-add-2");
        });

        await queueManager.waitForCompletion();

        // Should have executed all operations in correct dependency order
        // style-init should come first, then data-adds
        assert.isAbove(batchCount, 0, "Should have at least one batch");
        assert.isAtLeast(executionOrder.length, 3, "Should execute at least the 3 queued operations");
        // style-init should be first due to dependencies
        assert.equal(executionOrder[0], "style-init", "style-init should execute first");
    });

    it("should handle circular dependencies gracefully", async() => {
        const executionOrder: string[] = [];

        // Create a scenario that might have circular dependencies
        // The implementation should detect and handle this
        queueManager.queueOperation("style-init", () => {
            executionOrder.push("style-init");
        });

        queueManager.queueOperation("data-add", () => {
            executionOrder.push("data-add");
        });

        await queueManager.waitForCompletion();

        // Should still execute without throwing
        assert.isTrue(executionOrder.length > 0);
    });

    it("should emit lifecycle events (start, complete, error)", async() => {
        const events: string[] = [];

        eventManager.addListener("operation-start", () => {
            events.push("start");
        });

        eventManager.addListener("operation-complete", () => {
            events.push("complete");
        });

        eventManager.addListener("error", () => {
            events.push("error");
        });

        // Queue a successful operation
        queueManager.queueOperation("data-add", () => {
            // Success
        });

        await queueManager.waitForCompletion();

        assert.include(events, "start");
        assert.include(events, "complete");

        // Queue a failing operation
        queueManager.queueOperation("data-add", () => {
            throw new Error("Test error");
        });

        await queueManager.waitForCompletion();

        assert.include(events, "error");
    });

    it("should provide queue statistics", async() => {
        // Queue some operations but don't wait
        queueManager.queueOperation("data-add", async() => {
            await new Promise((resolve) => setTimeout(resolve, 10));
        });

        queueManager.queueOperation("layout-set", async() => {
            await new Promise((resolve) => setTimeout(resolve, 10));
        });

        // Check stats immediately after queueing
        await new Promise((resolve) => setTimeout(resolve, 5)); // Wait for microtask
        const stats = queueManager.getStats();

        assert.isDefined(stats.pending);
        assert.isDefined(stats.size);
        assert.isDefined(stats.isPaused);
        assert.equal(stats.isPaused, false);

        await queueManager.waitForCompletion();
    });

    it("should support pausing and resuming the queue", async() => {
        const executionOrder: string[] = [];

        queueManager.pause();

        queueManager.queueOperation("data-add", () => {
            executionOrder.push("data-add");
        });

        // Wait a bit - operation should not execute while paused
        await new Promise((resolve) => setTimeout(resolve, 50));
        assert.equal(executionOrder.length, 0);

        queueManager.resume();

        await queueManager.waitForCompletion();
        assert.equal(executionOrder.length, 1);
    });

    it("should clear pending operations", async() => {
        const executionOrder: string[] = [];

        // Pause to prevent execution
        queueManager.pause();

        queueManager.queueOperation("data-add", () => {
            executionOrder.push("data-add");
        });

        queueManager.queueOperation("layout-set", () => {
            executionOrder.push("layout-set");
        });

        // Clear before they execute
        queueManager.clear();
        queueManager.resume();

        await queueManager.waitForCompletion();

        // Nothing should have executed
        assert.equal(executionOrder.length, 0);
    });

    it("should handle operations with no dependencies", async() => {
        const executionOrder: string[] = [];

        // Queue operations that don't have dependencies defined
        queueManager.queueOperation("camera-update" as OperationCategory, () => {
            executionOrder.push("camera-update");
        });

        queueManager.queueOperation("render-update" as OperationCategory, () => {
            executionOrder.push("render-update");
        });

        await queueManager.waitForCompletion();

        // Both should execute
        assert.equal(executionOrder.length, 2);
    });

    it("should execute operations with context", async() => {
        let contextReceived: OperationContext | undefined;

        queueManager.queueOperation("data-add", (context: OperationContext) => {
            contextReceived = context;
        });

        await queueManager.waitForCompletion();

        assert.isDefined(contextReceived);
        assert.isDefined(contextReceived.signal);
        assert.isDefined(contextReceived.progress);
        assert.isDefined(contextReceived.id);
    });

    it("should handle async and sync operations", async() => {
        const executionOrder: string[] = [];

        // Mix async and sync operations
        queueManager.queueOperation("style-init", () => {
            executionOrder.push("style-init-sync");
        });

        queueManager.queueOperation("data-add", async() => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            executionOrder.push("data-add-async");
        });

        queueManager.queueOperation("layout-set", () => {
            executionOrder.push("layout-set-sync");
        });

        await queueManager.waitForCompletion();

        // Should execute in dependency order
        assert.deepEqual(executionOrder, ["style-init-sync", "data-add-async", "layout-set-sync"]);
    });
});

