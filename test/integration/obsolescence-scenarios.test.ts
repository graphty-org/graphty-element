import {assert, beforeEach, describe, it} from "vitest";

import {EventManager} from "../../src/managers/EventManager";
import {OperationQueueManager} from "../../src/managers/OperationQueueManager";

describe("Obsolescence Scenarios", () => {
    let eventManager: EventManager;
    let queueManager: OperationQueueManager;
    let obsoletedOperations: string[];
    let completedOperations: string[];

    beforeEach(() => {
        eventManager = new EventManager();
        queueManager = new OperationQueueManager(eventManager);
        obsoletedOperations = [];
        completedOperations = [];

        eventManager.onGraphEvent.add((event) => {
            if (event.type === "operation-obsoleted") {
                obsoletedOperations.push((event as Record<string, unknown>).id as string);
            } else if (event.type === "operation-complete") {
                completedOperations.push((event as Record<string, unknown>).id as string);
            }
        });
    });

    it("should handle rapid data updates efficiently", async() => {
        const executedLayouts: string[] = [];
        const executedDataOps: string[] = [];

        // Simulate rapid data updates that trigger layout recalculations
        for (let i = 0; i < 5; i++) {
            // Add data operation
            queueManager.queueOperation(
                "data-add",
                async() => {
                    executedDataOps.push(`data-${i}`);
                    // Simulate data processing
                    await new Promise((resolve) => setTimeout(resolve, 10));
                },
                {
                    description: `Data batch ${i}`,
                    obsoletes: ["layout-update"], // Each data update obsoletes pending layouts
                },
            );

            // Queue layout update that will likely be obsoleted by next data update
            queueManager.queueOperation(
                "layout-update",
                async(context) => {
                    // Check for abort at start
                    if (context.signal.aborted) {
                        throw new Error("AbortError");
                    }

                    // Simulate layout calculation
                    for (let j = 0; j < 10; j++) {
                        context.progress.setProgress(j * 10);
                        await new Promise((resolve) => setTimeout(resolve, 5));
                    }
                    executedLayouts.push(`layout-${i}`);
                },
                {description: `Layout for batch ${i}`},
            );

            // Small delay between batches
            await new Promise((resolve) => setTimeout(resolve, 5));
        }

        await queueManager.waitForCompletion();

        // All data operations should complete
        assert.equal(executedDataOps.length, 5, "All data operations should complete");

        // Most layout updates should be obsoleted, only the last one might complete
        assert.isTrue(
            executedLayouts.length <= 2,
            `Only 1-2 layout updates should complete, got ${executedLayouts.length}`,
        );

        // Should have obsoleted some operations
        assert.isTrue(
            obsoletedOperations.length > 0,
            "Should have obsoleted some operations",
        );
    });

    it("should not cancel near-complete operations (>90% progress)", async() => {
        const results: string[] = [];

        // Use a Promise to synchronize when layout reaches 90%+ progress
        // This eliminates timing-based race conditions
        let resolveProgressReached: () => void;
        const progressReached = new Promise<void>((resolve) => {
            resolveProgressReached = resolve;
        });

        // First queue a layout-set so layout-update has its dependency satisfied
        queueManager.queueOperation(
            "layout-set",
            () => {
                results.push("layout-set");
            },
            {description: "Set layout"},
        );

        // Wait for layout-set to complete
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Start a layout operation that will be near completion
        const layoutOp = queueManager.queueOperation(
            "layout-update",
            async(context) => {
                // Quickly get to 95% progress
                for (let i = 0; i <= 95; i += 5) {
                    if (context.signal.aborted) {
                        throw new Error("AbortError");
                    }

                    context.progress.setProgress(i);

                    // Signal when we've reached 90%+ progress
                    if (i >= 90) {
                        resolveProgressReached();
                    }

                    await new Promise((resolve) => setTimeout(resolve, 2));
                }

                // At 95% progress - should not be cancelled
                results.push("layout-completed");
                context.progress.setProgress(100);
            },
            {description: "Nearly complete layout"},
        );

        // Wait for layout to ACTUALLY reach 90%+ progress (deterministic, not timing-based)
        await progressReached;

        // Small additional delay to ensure progress is registered in the queue manager
        await new Promise((resolve) => setTimeout(resolve, 5));

        // Queue a data operation that would normally obsolete the layout
        queueManager.queueOperation(
            "data-add",
            () => {
                results.push("data-added");
            },
            {
                description: "New data",
                obsoletes: ["layout-update"],
                respectProgress: true, // Don't cancel operations >90% complete
            },
        );

        await queueManager.waitForCompletion();

        // Both operations should complete since layout was near completion
        assert.include(results, "layout-completed", "Layout should complete");
        assert.include(results, "data-added", "Data operation should complete");

        // Layout should not be in obsoleted list
        assert.isFalse(
            obsoletedOperations.includes(layoutOp),
            "Near-complete layout should not be obsoleted",
        );
    });

    it("should cancel cascading obsolete operations", async() => {
        const executed: string[] = [];

        // Queue a chain of dependent operations
        queueManager.queueOperation(
            "data-add",
            async(context) => {
                await new Promise((resolve) => setTimeout(resolve, 50));
                if (context.signal.aborted) {
                    throw new Error("AbortError");
                }

                executed.push("data");
            },
            {description: "Add initial data"},
        );

        queueManager.queueOperation(
            "layout-update",
            async(context) => {
                await new Promise((resolve) => setTimeout(resolve, 50));
                if (context.signal.aborted) {
                    throw new Error("AbortError");
                }

                executed.push("layout");
            },
            {description: "Calculate layout"},
        );

        queueManager.queueOperation(
            "algorithm-run",
            async(context) => {
                await new Promise((resolve) => setTimeout(resolve, 50));
                if (context.signal.aborted) {
                    throw new Error("AbortError");
                }

                executed.push("algorithm");
            },
            {description: "Run algorithm on layout"},
        );

        queueManager.queueOperation(
            "render-update",
            async(context) => {
                await new Promise((resolve) => setTimeout(resolve, 50));
                if (context.signal.aborted) {
                    throw new Error("AbortError");
                }

                executed.push("render");
            },
            {description: "Render results"},
        );

        // After a short delay, add new data that obsoletes everything
        await new Promise((resolve) => setTimeout(resolve, 20));

        queueManager.queueOperation(
            "data-remove",
            () => {
                executed.push("new-data");
            },
            {
                description: "Remove all data",
                obsoletes: ["layout-update", "algorithm-run", "render-update"],
                cascading: true, // Obsolete all dependent operations
            },
        );

        await queueManager.waitForCompletion();

        // Original data op might complete if it started
        // New data op should definitely complete
        assert.include(executed, "new-data", "New data operation should complete");

        // Most dependent operations should be obsoleted
        const dependentOpsCompleted = ["layout", "algorithm", "render"].filter((op) =>
            executed.includes(op),
        );
        assert.isTrue(
            dependentOpsCompleted.length <= 1,
            `Most dependent operations should be cancelled, but ${dependentOpsCompleted.length} completed`,
        );
    });

    it("should handle mixed operation priorities correctly", async() => {
        const results: {operation: string, timestamp: number}[] = [];

        // Queue operations with different priorities and obsolescence rules

        // Low priority operation
        queueManager.queueOperation(
            "render-update",
            async(context) => {
                if (context.signal.aborted) {
                    throw new Error("AbortError");
                }

                await new Promise((resolve) => setTimeout(resolve, 30));
                results.push({operation: "render", timestamp: Date.now()});
            },
            {description: "Low priority render"},
        );

        // High priority data operation
        queueManager.queueOperation(
            "data-add",
            async() => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                results.push({operation: "data", timestamp: Date.now()});
            },
            {
                description: "High priority data",
                obsoletes: ["render-update"],
            },
        );

        // Critical style initialization
        queueManager.queueOperation(
            "style-init",
            () => {
                results.push({operation: "style", timestamp: Date.now()});
            },
            {description: "Critical style init"},
        );

        await queueManager.waitForCompletion();

        // Style should execute first due to dependencies
        // Data should execute and obsolete render
        assert.isTrue(results.some((r) => r.operation === "style"), "Style should execute");
        assert.isTrue(results.some((r) => r.operation === "data"), "Data should execute");

        // Render might be obsoleted
        const renderCompleted = results.some((r) => r.operation === "render");
        if (!renderCompleted) {
            assert.isTrue(
                obsoletedOperations.length > 0,
                "Render should be obsoleted if it didn't complete",
            );
        }
    });

    it("should respect custom obsolescence conditions", async() => {
        const completed: string[] = [];

        // Queue operations with timestamp-based obsolescence
        const startTime = Date.now();

        for (let i = 0; i < 3; i++) {
            queueManager.queueOperation(
                "algorithm-run",
                (context) => {
                    if (context.signal.aborted) {
                        throw new Error("AbortError");
                    }

                    completed.push(`algo-${i}`);
                },
                {
                    description: `Algorithm ${i}`,
                    timestamp: startTime + (i * 100),
                    shouldObsolete: (operation) => {
                        // Obsolete older algorithms of the same type
                        if (operation.category !== "algorithm-run") {
                            return false;
                        }

                        const opTime = operation.metadata?.timestamp ?? 0;
                        const myTime = startTime + (i * 100);
                        return opTime < myTime;
                    },
                },
            );

            await new Promise((resolve) => setTimeout(resolve, 5));
        }

        await queueManager.waitForCompletion();

        // Since obsolescence only applies to queued/pending operations when new ones arrive,
        // all 3 may complete if they start quickly
        assert.isTrue(
            completed.length >= 1 && completed.length <= 3,
            `Expected 1-3 algorithms to complete, got ${completed.length}`,
        );

        // The last algorithm should definitely complete
        if (completed.length > 0) {
            const lastCompleted = completed[completed.length - 1];
            assert.isTrue(
                lastCompleted.includes("2") || lastCompleted.includes("1"),
                "Latest algorithm should complete",
            );
        }
    });

    it("should handle operation batches with obsolescence", async() => {
        const results: string[] = [];

        // Simulate a batch of related operations
        const batch1 = [
            () =>
                queueManager.queueOperation(
                    "data-add",
                    () => {
                        results.push("batch1-data");
                    },
                    {description: "Batch 1 data"},
                ),
            () =>
                queueManager.queueOperation(
                    "layout-update",
                    async(context) => {
                        if (context.signal.aborted) {
                            throw new Error("AbortError");
                        }

                        await new Promise((resolve) => setTimeout(resolve, 30));
                        results.push("batch1-layout");
                    },
                    {description: "Batch 1 layout"},
                ),
            () =>
                queueManager.queueOperation(
                    "render-update",
                    async(context) => {
                        if (context.signal.aborted) {
                            throw new Error("AbortError");
                        }

                        await new Promise((resolve) => setTimeout(resolve, 20));
                        results.push("batch1-render");
                    },
                    {description: "Batch 1 render"},
                ),
        ];

        // Queue first batch
        batch1.forEach((op) => op());

        // Simulate second batch that obsoletes the first
        await new Promise((resolve) => setTimeout(resolve, 10));

        const batch2 = [
            () =>
                queueManager.queueOperation(
                    "data-remove",
                    () => {
                        results.push("batch2-data");
                    },
                    {
                        description: "Batch 2 data - clear all",
                        obsoletes: ["layout-update", "render-update"],
                    },
                ),
            () =>
                queueManager.queueOperation(
                    "style-init",
                    () => {
                        results.push("batch2-style");
                    },
                    {description: "Batch 2 style reset"},
                ),
        ];

        batch2.forEach((op) => op());

        await queueManager.waitForCompletion();

        // Batch 1 data should complete (it's quick)
        assert.include(results, "batch1-data");

        // Batch 2 operations should complete
        assert.include(results, "batch2-data");
        assert.include(results, "batch2-style");

        // Batch 1 layout and render should likely be obsoleted
        const batch1Obsoleted = !results.includes("batch1-layout") || !results.includes("batch1-render");
        assert.isTrue(
            batch1Obsoleted,
            "At least one batch 1 operation should be obsoleted",
        );
    });
});
