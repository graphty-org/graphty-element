import {assert, beforeEach, describe, it} from "vitest";

import {EventManager} from "../../src/managers/EventManager";
import {OperationQueueManager} from "../../src/managers/OperationQueueManager";

describe("Dependency Ordering", () => {
    let eventManager: EventManager;
    let queueManager: OperationQueueManager;

    beforeEach(async() => {
        eventManager = new EventManager();
        await eventManager.init();
        queueManager = new OperationQueueManager(eventManager);
        await queueManager.init();
    });

    it("should order style-init before data-add due to dependencies", async() => {
        const executionOrder: string[] = [];

        // Queue in wrong order - data-add depends on style-init
        queueManager.queueOperation("data-add", () => {
            executionOrder.push("data-add");
        });

        queueManager.queueOperation("style-init", () => {
            executionOrder.push("style-init");
        });

        // Wait a microtask for batching
        await new Promise((resolve) => {
            queueMicrotask(() => {
                resolve(undefined);
            });
        });

        await queueManager.waitForCompletion();

        // Should execute style-init first due to dependencies
        assert.deepEqual(executionOrder, ["style-init", "data-add"]);
    });

    it("should order data-add before layout-set", async() => {
        const executionOrder: string[] = [];

        // Queue layout-set before data (wrong order)
        queueManager.queueOperation("layout-set", () => {
            executionOrder.push("layout-set");
        });

        queueManager.queueOperation("data-add", () => {
            executionOrder.push("data-add");
        });

        // Wait a microtask for batching
        await new Promise((resolve) => {
            queueMicrotask(() => {
                resolve(undefined);
            });
        });

        await queueManager.waitForCompletion();

        // Data should come before layout-set due to dependencies
        assert.deepEqual(executionOrder, ["data-add", "layout-set"]);
    });

    it("should handle operations with no dependencies", async() => {
        const executionOrder: string[] = [];

        // Queue operations that aren't in the dependency graph
        // @ts-expect-error Testing unknown operation category
        queueManager.queueOperation("custom-op-1", () => {
            executionOrder.push("custom-op-1");
        });

        // @ts-expect-error Testing unknown operation category
        queueManager.queueOperation("custom-op-2", () => {
            executionOrder.push("custom-op-2");
        });

        // Wait a microtask for batching
        await new Promise((resolve) => {
            queueMicrotask(() => {
                resolve(undefined);
            });
        });

        await queueManager.waitForCompletion();

        // Should execute both
        assert.equal(executionOrder.length, 2);
    });

    it("should sort multiple operation categories correctly", async() => {
        const executionOrder: string[] = [];

        // Queue operations in reverse dependency order
        // TODO: We must avoid operations that obsolete each other
        queueManager.queueOperation("layout-set", () => {
            executionOrder.push("layout-set");
        });

        queueManager.queueOperation("data-add", () => {
            executionOrder.push("data-add");
        });

        queueManager.queueOperation("style-init", () => {
            executionOrder.push("style-init");
        });

        // Wait a microtask for batching
        await new Promise((resolve) => {
            queueMicrotask(() => {
                resolve(undefined);
            });
        });

        await queueManager.waitForCompletion();

        // Verify ordering constraints
        const indices = executionOrder.reduce<Record<string, number>>((acc, op, idx) => {
            acc[op] = idx;
            return acc;
        }, {});

        // style-init before data-add
        assert.isTrue(indices["style-init"] < indices["data-add"]);

        // data-add before layout-set
        assert.isTrue(indices["data-add"] < indices["layout-set"]);
    });

    it("should handle multiple operations of the same category", async() => {
        const executionOrder: string[] = [];

        // Queue multiple data-add operations
        queueManager.queueOperation("data-add", () => {
            executionOrder.push("data-add-1");
        });

        queueManager.queueOperation("data-add", () => {
            executionOrder.push("data-add-2");
        });

        queueManager.queueOperation("data-add", () => {
            executionOrder.push("data-add-3");
        });

        // Use layout-set which has dependency but isn't obsoleted by data-add
        queueManager.queueOperation("layout-set", () => {
            executionOrder.push("layout-set");
        });

        // Wait a microtask for batching
        await new Promise((resolve) => {
            queueMicrotask(() => {
                resolve(undefined);
            });
        });

        await queueManager.waitForCompletion();

        // All data-add should execute before layout-set
        const layoutIndex = executionOrder.indexOf("layout-set");
        assert.isTrue(executionOrder.indexOf("data-add-1") < layoutIndex);
        assert.isTrue(executionOrder.indexOf("data-add-2") < layoutIndex);
        assert.isTrue(executionOrder.indexOf("data-add-3") < layoutIndex);
    });

    it("should maintain order within same category", async() => {
        const executionOrder: string[] = [];

        // Queue multiple operations of same category
        for (let i = 1; i <= 5; i++) {
            queueManager.queueOperation("data-add", () => {
                executionOrder.push(`data-${i}`);
            });
        }

        // Wait a microtask for batching
        await new Promise((resolve) => {
            queueMicrotask(() => {
                resolve(undefined);
            });
        });

        await queueManager.waitForCompletion();

        // Should maintain FIFO order within category
        assert.deepEqual(executionOrder, ["data-1", "data-2", "data-3", "data-4", "data-5"]);
    });

    it("should handle complex dependency chains", async() => {
        const executionOrder: string[] = [];

        // Create a complex chain with operations that have dependencies but no obsolescence
        // Queue in reverse order to test dependency sorting
        queueManager.queueOperation("algorithm-run", () => {
            executionOrder.push("algorithm-run");
        });

        queueManager.queueOperation("layout-set", () => {
            executionOrder.push("layout-set");
        });

        queueManager.queueOperation("data-add", () => {
            executionOrder.push("data-add");
        });

        queueManager.queueOperation("style-init", () => {
            executionOrder.push("style-init");
        });

        // Wait a microtask for batching
        await new Promise((resolve) => {
            queueMicrotask(() => {
                resolve(undefined);
            });
        });

        await queueManager.waitForCompletion();

        // Verify the dependency chain
        const indices = executionOrder.reduce<Record<string, number>>((acc, op, idx) => {
            acc[op] = idx;
            return acc;
        }, {});

        // style-init -> data-add -> layout-set
        assert.isTrue(indices["style-init"] < indices["data-add"]);
        assert.isTrue(indices["data-add"] < indices["layout-set"]);

        // data-add -> algorithm-run (data-add obsoletes algorithm-run, so algorithm-run won't run)
        // But since data-add is queued after algorithm-run, algorithm-run should run first if not obsoleted
        // Actually, data-add obsoletes algorithm-run, so only data-add should run
        // Let's test the actual execution order
        assert.equal(executionOrder.length, 3); // Only style-init, data-add, layout-set should run
        assert.deepEqual(executionOrder, ["style-init", "data-add", "layout-set"]);
    });
});

