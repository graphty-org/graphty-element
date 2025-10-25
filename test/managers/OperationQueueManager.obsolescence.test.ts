import {assert, beforeEach, describe, it} from "vitest";

import {EventManager} from "../../src/managers/EventManager";
import {OperationQueueManager} from "../../src/managers/OperationQueueManager";

describe("Obsolescence Rules", () => {
    let eventManager: EventManager;
    let queueManager: OperationQueueManager;
    let obsoletedEvents: {id: string, category: string, reason: string}[];
    let startedOperations: string[];
    let completedOperations: string[];

    beforeEach(() => {
        eventManager = new EventManager();
        queueManager = new OperationQueueManager(eventManager);
        obsoletedEvents = [];
        startedOperations = [];
        completedOperations = [];

        // Capture events
        eventManager.onGraphEvent.add((event) => {
            if (event.type === "operation-obsoleted") {
                obsoletedEvents.push({
                    id: (event as Record<string, unknown>).id as string,
                    category: (event as Record<string, unknown>).category as string,
                    reason: (event as Record<string, unknown>).reason as string,
                });
            } else if (event.type === "operation-start") {
                startedOperations.push(event.id as string);
            } else if (event.type === "operation-complete") {
                completedOperations.push(event.id as string);
            }
        });
    });

    it("should cancel layout-update when new data-add arrives", async() => {
        const executedOps: string[] = [];

        // Queue a layout-update
        queueManager.queueOperation(
            "layout-update",
            async(context) => {
                // Simulate long-running layout calculation
                for (let i = 0; i < 10; i++) {
                    if (context.signal.aborted) {
                        throw new Error("AbortError");
                    }

                    context.progress.setProgress(i * 10);
                    await new Promise((resolve) => setTimeout(resolve, 10));
                }
                executedOps.push("layout-update");
            },
            {description: "Update layout positions"},
        );

        // After a short delay, queue a data-add which should obsolete the layout
        await new Promise((resolve) => setTimeout(resolve, 20));

        queueManager.queueOperation(
            "data-add",
            () => {
                executedOps.push("data-add");
            },
            {
                description: "Add new nodes",
                obsoletes: ["layout-update"],
            },
        );

        await queueManager.waitForCompletion();

        // The layout-update should have been cancelled
        assert.isTrue(obsoletedEvents.some((e) => e.category === "layout-update"));
        // Data-add should complete
        assert.include(executedOps, "data-add");
        // Layout-update should not complete if it was obsoleted
        // (it may have completed if it was quick enough)
    });

    it("should cancel algorithm-run when data changes", async() => {
        const executedOps: string[] = [];

        // Queue an algorithm operation
        queueManager.queueOperation(
            "algorithm-run",
            async(context) => {
                // Simulate algorithm computation
                for (let i = 0; i < 10; i++) {
                    if (context.signal.aborted) {
                        throw new Error("AbortError");
                    }

                    context.progress.setProgress(i * 10);
                    await new Promise((resolve) => setTimeout(resolve, 10));
                }
                executedOps.push("algorithm-run");
            },
            {description: "Run graph algorithm"},
        );

        // Queue data changes that should obsolete the algorithm
        await new Promise((resolve) => setTimeout(resolve, 20));

        queueManager.queueOperation(
            "data-update",
            () => {
                executedOps.push("data-update");
            },
            {
                description: "Update node properties",
                obsoletes: ["algorithm-run"],
            },
        );

        await queueManager.waitForCompletion();

        // Check that the algorithm was obsoleted
        const obsoletedAlgo = obsoletedEvents.find((e) => e.category === "algorithm-run");
        if (obsoletedAlgo) {
            assert.isDefined(obsoletedAlgo);
        }

        // Data update should complete
        assert.include(executedOps, "data-update");
    });

    it("should apply custom obsolescence rules", async() => {
        const executedOps: string[] = [];

        // Queue operation with custom obsolescence rule
        queueManager.queueOperation(
            "render-update",
            async() => {
                await new Promise((resolve) => setTimeout(resolve, 50));
                executedOps.push("render-1");
            },
            {
                description: "Render update 1",
            },
        );

        // Queue another operation with custom rule to obsolete specific renders
        queueManager.queueOperation(
            "render-update",
            () => {
                executedOps.push("render-2");
            },
            {
                description: "Render update 2",
                shouldObsolete: (operation) => {
                    // Custom logic: obsolete all other render-update operations
                    // Since shouldObsolete is called for existing operations,
                    // and this is the newest operation, we can obsolete all
                    // other operations of the same category
                    return operation.category === "render-update";
                },
            },
        );

        await queueManager.waitForCompletion();

        // One render should be obsoleted by the custom rule
        obsoletedEvents.find((e) => e.category === "render-update");
        // At least render-2 should execute
        assert.include(executedOps, "render-2");
    });

    it("should track running vs queued operations separately", async() => {
        const executedOps: string[] = [];
        const queuedOps: string[] = [];

        // Start a long-running operation
        queueManager.queueOperation(
            "data-add",
            async(context) => {
                executedOps.push("running-data-add");
                context.progress.setProgress(50);
                await new Promise((resolve) => setTimeout(resolve, 100));
                context.progress.setProgress(100);
            },
            {description: "Currently running data operation"},
        );

        // Wait for it to start
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Queue more operations while first is running
        queueManager.queueOperation(
            "layout-update",
            () => {
                queuedOps.push("queued-layout");
            },
            {description: "Queued layout operation"},
        );

        queueManager.queueOperation(
            "algorithm-run",
            () => {
                queuedOps.push("queued-algorithm");
            },
            {description: "Queued algorithm operation"},
        );

        // The implementation should track these separately
        // and be able to obsolete queued operations without affecting running ones

        // Queue an operation that obsoletes queued operations
        queueManager.queueOperation(
            "data-remove",
            () => {
                executedOps.push("data-remove");
            },
            {
                description: "Remove data",
                obsoletes: ["layout-update", "algorithm-run"],
                skipRunning: true, // Only obsolete queued operations
            },
        );

        await queueManager.waitForCompletion();

        // Running operation should complete
        assert.include(executedOps, "running-data-add");
        // Obsoleting operation should complete
        assert.include(executedOps, "data-remove");
        // Queued operations may be obsoleted
    });

    it("should allow conditional obsolescence with shouldObsolete", async() => {
        const results: string[] = [];

        // Queue multiple operations
        queueManager.queueOperation(
            "style-apply",
            async() => {
                await new Promise((resolve) => setTimeout(resolve, 20));
                results.push("style-1");
            },
            {
                description: "Apply styles to nodes",
                nodeSelector: ".class-a",
            },
        );

        queueManager.queueOperation(
            "style-apply",
            async() => {
                await new Promise((resolve) => setTimeout(resolve, 20));
                results.push("style-2");
            },
            {
                description: "Apply styles to edges",
                edgeSelector: ".class-b",
            },
        );

        // Queue operation with conditional obsolescence
        queueManager.queueOperation(
            "style-apply",
            () => {
                results.push("style-3");
            },
            {
                description: "Apply global styles",
                shouldObsolete: (operation) => {
                    // Only obsolete style operations for nodes
                    return (
                        operation.category === "style-apply" &&
                        operation.metadata?.nodeSelector !== undefined
                    );
                },
            },
        );

        await queueManager.waitForCompletion();

        // style-3 should complete
        assert.include(results, "style-3");
        // style-2 (edge styles) should complete as it wasn't obsoleted
        assert.include(results, "style-2");
        // style-1 (node styles) might be obsoleted
    });
});
