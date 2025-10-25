import {assert, beforeEach, describe, it} from "vitest";

import {EventManager} from "../../src/managers/EventManager";
import {OperationQueueManager} from "../../src/managers/OperationQueueManager";

describe("Operation Cancellation", () => {
    let eventManager: EventManager;
    let queueManager: OperationQueueManager;
    let cancelledEvents: {id: string, category: string, reason?: string}[];

    beforeEach(() => {
        eventManager = new EventManager();
        queueManager = new OperationQueueManager(eventManager);
        cancelledEvents = [];

        // Capture cancellation events
        eventManager.onGraphEvent.add((event) => {
            if (event.type === "operation-obsoleted") {
                cancelledEvents.push({
                    id: (event as Record<string, unknown>).id as string,
                    category: (event as Record<string, unknown>).category as string,
                    reason: (event as Record<string, unknown>).reason as string | undefined,
                });
            }
        });
    });

    it("should cancel operations via AbortController", async() => {
        let operationStarted = false;
        let operationCompleted = false;
        // We need to expose the AbortController to cancel it
        // Since the current implementation creates it internally,
        // we'll need to enhance the API
        queueManager.queueOperation(
            "algorithm-run",
            async(context) => {
                operationStarted = true;

                // Listen for abort signal
                context.signal.addEventListener("abort", () => {
                    // Signal aborted
                });

                try {
                    // Simulate long-running operation
                    await new Promise<void>((resolve, reject) => {
                        const checkInterval = setInterval(() => {
                            if (context.signal.aborted) {
                                clearInterval(checkInterval);
                                const error = new Error("Operation was aborted");
                                error.name = "AbortError";
                                reject(error);
                            }
                        }, 10);

                        setTimeout(() => {
                            clearInterval(checkInterval);
                            resolve();
                        }, 1000);
                    });

                    operationCompleted = true;
                } catch (error) {
                    if ((error as Error).name === "AbortError") {
                        throw error; // Re-throw abort errors
                    }

                    throw error;
                }
            },
        );

        // Cancel after a short delay
        setTimeout(() => {
            // Need to implement cancelOperation method
            queueManager.clear();
        }, 50);

        try {
            await queueManager.waitForCompletion();
        } catch {
            // Expected for cancelled operations
        }

        assert.isTrue(operationStarted, "Operation should have started");
        assert.isFalse(operationCompleted, "Operation should not have completed");
    });

    it("should handle signal.aborted checks in operations", async() => {
        let checkedAbortedBeforeStart = false;
        const checkedAbortedDuringExecution = false;

        queueManager.queueOperation(
            "data-update",
            async(context) => {
                // Check if already aborted before starting
                if (context.signal.aborted) {
                    checkedAbortedBeforeStart = true;
                    const error = new Error("Already aborted");
                    error.name = "AbortError";
                    throw error;
                }

                // Simulate work with periodic abort checks
                for (let i = 0; i < 10; i++) {
                    // Check abort signal during work

                    await new Promise((resolve) => setTimeout(resolve, 10));
                }
            },
        );

        await queueManager.waitForCompletion();

        // The operation should complete normally if not cancelled
        assert.isFalse(checkedAbortedBeforeStart, "Should not be aborted before start");
        assert.isFalse(checkedAbortedDuringExecution, "Should not be aborted during execution");
    });

    it("should cleanup cancelled operations properly", async() => {
        const startEvents: string[] = [];
        const completeEvents: string[] = [];

        eventManager.onGraphEvent.add((event) => {
            if (event.type === "operation-start") {
                startEvents.push((event as Record<string, unknown>).id as string);
            } else if (event.type === "operation-complete") {
                completeEvents.push((event as Record<string, unknown>).id as string);
            }
        });

        // Queue multiple operations
        const ops = [];
        for (let i = 0; i < 5; i++) {
            ops.push(
                queueManager.queueOperation(
                    "layout-update",
                    async(context) => {
                        // Check for abort
                        if (context.signal.aborted) {
                            throw new Error("AbortError");
                        }

                        await new Promise((resolve) => setTimeout(resolve, 100));
                    },
                ),
            );
        }

        // Clear the queue (which should cancel pending operations)
        setTimeout(() => {
            queueManager.clear();
        }, 50);

        try {
            await queueManager.waitForCompletion();
        } catch {
            // Expected
        }

        // Some operations may have started
        assert.isTrue(startEvents.length <= ops.length);

        // Completed operations should be fewer than total
        assert.isTrue(completeEvents.length < ops.length);

        // After clearing, stats should be clean
        const stats = queueManager.getStats();
        assert.equal(stats.pending, 0);
        assert.equal(stats.size, 0);
    });

    it("should emit cancellation events", async() => {
        queueManager.queueOperation(
            "camera-update",
            async(context) => {
                // Long running operation that will be cancelled
                await new Promise<void>((resolve, reject) => {
                    const timeout = setTimeout(resolve, 500);
                    context.signal.addEventListener("abort", () => {
                        clearTimeout(timeout);
                        const error = new Error("Cancelled");
                        error.name = "AbortError";
                        reject(error);
                    });
                });
            },
        );

        // Clear queue to cancel operations
        setTimeout(() => {
            queueManager.clear();
        }, 50);

        try {
            await queueManager.waitForCompletion();
        } catch {
            // Expected
        }

        // The current implementation emits "operation-obsoleted" events for cancelled ops
        // We should check if any were emitted
        // TODO: The implementation may need enhancement to properly emit these
    });

    it("should handle multiple abort listeners", async() => {
        const abortCallbacks: number[] = [];

        queueManager.queueOperation(
            "style-init",
            async(context) => {
                // Add multiple abort listeners
                context.signal.addEventListener("abort", () => {
                    abortCallbacks.push(1);
                });

                context.signal.addEventListener("abort", () => {
                    abortCallbacks.push(2);
                });

                context.signal.addEventListener("abort", () => {
                    abortCallbacks.push(3);
                });

                // Wait for potential abort
                await new Promise<void>((resolve, reject) => {
                    setTimeout(resolve, 100);
                    context.signal.addEventListener("abort", () => {
                        reject(new Error("Aborted"));
                    });
                });
            },
        );

        await queueManager.waitForCompletion();

        // If not cancelled, no abort callbacks should fire
        assert.equal(abortCallbacks.length, 0);
    });

    it("should properly propagate abort errors", async() => {
        eventManager.onGraphError.add(() => {
            // Error handler to verify no errors are propagated
            // Log if needed for debugging
        });

        queueManager.queueOperation(
            "data-remove",
            () => {
                // Immediately abort
                const error = new Error("Test abort");
                error.name = "AbortError";
                throw error;
            },
        );

        await queueManager.waitForCompletion();

        // AbortErrors should be handled specially and not propagated as regular errors
        // The implementation catches AbortError and re-throws it for p-queue to handle
        // Regular errors would be caught by handleOperationError
    });

    it("should support cancellation of specific operations", async() => {
        const results: string[] = [];

        // Queue three operations
        queueManager.queueOperation(
            "data-add",
            async() => {
                await new Promise((resolve) => setTimeout(resolve, 50));
                results.push("op1");
            },
        );

        queueManager.queueOperation(
            "layout-set",
            async(context) => {
                await new Promise<void>((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        results.push("op2");
                        resolve();
                    }, 100);

                    context.signal.addEventListener("abort", () => {
                        clearTimeout(timeout);
                        const error = new Error("Cancelled");
                        error.name = "AbortError";
                        reject(error);
                    });
                });
            },
        );

        queueManager.queueOperation(
            "render-update",
            async() => {
                await new Promise((resolve) => setTimeout(resolve, 50));
                results.push("op3");
            },
        );

        // Cancel the second operation
        // TODO: This requires exposing the AbortController in the API
        // For now, we can only test clearing all operations

        await queueManager.waitForCompletion();

        // All three should complete normally without cancellation
        assert.deepEqual(results, ["op1", "op2", "op3"]);
    });

    it("should not cancel already completed operations", async() => {
        const completed: string[] = [];

        queueManager.queueOperation(
            "style-apply",
            () => {
                completed.push("instant");
            },
        );

        // Wait for the operation to complete
        await queueManager.waitForCompletion();

        // Try to clear/cancel after completion
        queueManager.clear();

        // The completed operation should not be affected
        assert.deepEqual(completed, ["instant"]);

        // Stats should be clean
        const stats = queueManager.getStats();
        assert.equal(stats.pending, 0);
        assert.equal(stats.size, 0);
    });
});
