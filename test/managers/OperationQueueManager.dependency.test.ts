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

    it("should allow layout-set and data-add in any order (stateless design)", async() => {
        const executionOrder: string[] = [];

        // Queue layout-set before data - this is now valid in stateless design
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

        // In stateless design, layout-set does NOT depend on data-add
        // They can execute in queue order since there's no dependency
        assert.deepEqual(executionOrder, ["layout-set", "data-add"]);
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

        // style-init before data-add (data-add depends on style-init)
        assert.isTrue(indices["style-init"] < indices["data-add"]);

        // layout-set does NOT depend on data-add in stateless design
        // So we just verify they all execute
        assert.equal(executionOrder.length, 3);
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

        // Use camera-update which does depend on layout-set
        queueManager.queueOperation("camera-update", () => {
            executionOrder.push("camera-update");
        });

        // Wait a microtask for batching
        await new Promise((resolve) => {
            queueMicrotask(() => {
                resolve(undefined);
            });
        });

        await queueManager.waitForCompletion();

        // All data-add operations should execute (order preserved within category)
        // camera-update has no dependency on data-add, so it executes in queue order
        assert.equal(executionOrder.length, 4);
        assert.deepEqual(executionOrder.slice(0, 3), ["data-add-1", "data-add-2", "data-add-3"]);
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

        // style-init -> data-add (data-add depends on style-init)
        assert.isTrue(indices["style-init"] < indices["data-add"]);

        // data-add -> algorithm-run (data-add obsoletes algorithm-run, so algorithm-run won't run)
        // But since data-add is queued after algorithm-run, algorithm-run should run first if not obsoleted
        // Actually, data-add obsoletes algorithm-run, so only data-add should run
        // Let's test the actual execution order
        assert.equal(executionOrder.length, 3); // Only style-init, data-add, layout-set should run
        // layout-set does NOT depend on data-add in stateless design, so order can vary
        assert.isTrue(executionOrder.includes("style-init"));
        assert.isTrue(executionOrder.includes("data-add"));
        assert.isTrue(executionOrder.includes("layout-set"));
    });

    // Phase 1 Tests - These will FAIL initially
    it("should have layout-update → layout-set dependency", () => {
        // This test will FAIL initially
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const deps = (OperationQueueManager as any).CATEGORY_DEPENDENCIES;
        const hasLayoutUpdateToLayoutSet = deps.some((dep: [string, string]) =>
            dep[0] === "layout-update" && dep[1] === "layout-set",
        );
        assert.isTrue(hasLayoutUpdateToLayoutSet, "Missing layout-update → layout-set dependency");
    });

    it("should execute layout-set before layout-update", async() => {
        const executionOrder: string[] = [];

        // Queue layout-set first
        queueManager.queueOperation("layout-set", () => {
            executionOrder.push("layout-set");
        }, {description: "Set layout"});

        // Then queue layout-update - it should wait for layout-set due to dependency
        queueManager.queueOperation("layout-update", () => {
            executionOrder.push("layout-update");
        }, {description: "Update layout"});

        // Wait a microtask for batching
        await new Promise((resolve) => {
            queueMicrotask(() => {
                resolve(undefined);
            });
        });

        await queueManager.waitForCompletion();

        // Should execute in correct dependency order
        assert.deepEqual(executionOrder, ["layout-set", "layout-update"]);
    });

    it("should obsolete previous layout-update operations", async() => {
        const executionOrder: string[] = [];

        queueManager.queueOperation("layout-update", () => {
            executionOrder.push("layout-update-1");
        }, {description: "Update 1"});

        queueManager.queueOperation("layout-update", () => {
            executionOrder.push("layout-update-2");
        }, {description: "Update 2"});

        queueManager.queueOperation("layout-update", () => {
            executionOrder.push("layout-update-3");
        }, {description: "Update 3"});

        // Wait a microtask for batching
        await new Promise((resolve) => {
            queueMicrotask(() => {
                resolve(undefined);
            });
        });

        await queueManager.waitForCompletion();

        // Only the last layout-update should execute
        assert.deepEqual(executionOrder, ["layout-update-3"]);
    });
});

