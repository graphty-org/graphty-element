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

    it("should order style-init before style-apply", async() => {
        const executionOrder: string[] = [];

        // Queue in wrong order
        queueManager.queueOperation("style-apply", () => {
            executionOrder.push("style-apply");
        });

        queueManager.queueOperation("style-init", () => {
            executionOrder.push("style-init");
        });

        await queueManager.waitForCompletion();

        // Should execute style-init first
        assert.deepEqual(executionOrder, ["style-init", "style-apply"]);
    });

    it("should order data-add before layout operations", async() => {
        const executionOrder: string[] = [];

        // Queue layout operations before data
        queueManager.queueOperation("layout-update", () => {
            executionOrder.push("layout-update");
        });

        queueManager.queueOperation("layout-set", () => {
            executionOrder.push("layout-set");
        });

        queueManager.queueOperation("data-add", () => {
            executionOrder.push("data-add");
        });

        await queueManager.waitForCompletion();

        // Data should come before layout operations
        const dataIndex = executionOrder.indexOf("data-add");
        const layoutSetIndex = executionOrder.indexOf("layout-set");
        const layoutUpdateIndex = executionOrder.indexOf("layout-update");

        assert.isTrue(dataIndex < layoutSetIndex);
        assert.isTrue(dataIndex < layoutUpdateIndex);
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

        await queueManager.waitForCompletion();

        // Should execute both
        assert.equal(executionOrder.length, 2);
    });

    it("should sort multiple operation categories correctly", async() => {
        const executionOrder: string[] = [];

        // Queue many operations in random order
        queueManager.queueOperation("render-update", () => {
            executionOrder.push("render-update");
        });

        queueManager.queueOperation("algorithm-run", () => {
            executionOrder.push("algorithm-run");
        });

        queueManager.queueOperation("layout-update", () => {
            executionOrder.push("layout-update");
        });

        queueManager.queueOperation("data-add", () => {
            executionOrder.push("data-add");
        });

        queueManager.queueOperation("style-apply", () => {
            executionOrder.push("style-apply");
        });

        queueManager.queueOperation("style-init", () => {
            executionOrder.push("style-init");
        });

        await queueManager.waitForCompletion();

        // Verify ordering constraints
        const indices = executionOrder.reduce<Record<string, number>>((acc, op, idx) => {
            acc[op] = idx;
            return acc;
        }, {});

        // style-init before style-apply
        assert.isTrue(indices["style-init"] < indices["style-apply"]);

        // style-init before data-add
        assert.isTrue(indices["style-init"] < indices["data-add"]);

        // data-add before layout-update
        assert.isTrue(indices["data-add"] < indices["layout-update"]);

        // data-add before algorithm-run
        assert.isTrue(indices["data-add"] < indices["algorithm-run"]);

        // render-update should be last (depends on most things)
        assert.equal(indices["render-update"], executionOrder.length - 1);
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

        queueManager.queueOperation("layout-update", () => {
            executionOrder.push("layout-update");
        });

        await queueManager.waitForCompletion();

        // All data-add should execute before layout-update
        const layoutIndex = executionOrder.indexOf("layout-update");
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

        await queueManager.waitForCompletion();

        // Should maintain FIFO order within category
        assert.deepEqual(executionOrder, ["data-1", "data-2", "data-3", "data-4", "data-5"]);
    });

    it("should handle complex dependency chains", async() => {
        const executionOrder: string[] = [];

        // Create a complex chain
        queueManager.queueOperation("camera-update", () => {
            executionOrder.push("camera-update");
        });

        queueManager.queueOperation("render-update", () => {
            executionOrder.push("render-update");
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

        await queueManager.waitForCompletion();

        // Verify the dependency chain
        const indices = executionOrder.reduce<Record<string, number>>((acc, op, idx) => {
            acc[op] = idx;
            return acc;
        }, {});

        // style-init -> data-add -> layout-set -> camera-update
        assert.isTrue(indices["style-init"] < indices["data-add"]);
        assert.isTrue(indices["data-add"] < indices["layout-set"]);
        assert.isTrue(indices["layout-set"] < indices["camera-update"]);

        // render-update depends on multiple things
        assert.isTrue(indices["data-add"] < indices["render-update"]);
    });
});

