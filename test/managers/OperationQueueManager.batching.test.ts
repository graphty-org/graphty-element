import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import type {EventManager} from "../../src/managers/EventManager";
import {OperationQueueManager} from "../../src/managers/OperationQueueManager";

describe("OperationQueueManager - Deferred Promise Batching", () => {
    let manager: OperationQueueManager;
    let executionOrder: string[];
    let mockEventManager: EventManager;

    beforeEach(() => {
        // Create a mock event manager
        mockEventManager = {
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn(),
            once: vi.fn(),
            listenerCount: vi.fn(() => 0),
            emitGraphEvent: vi.fn(),
            emitGraphError: vi.fn(),
            onGraphEvent: {
                add: vi.fn(),
                remove: vi.fn(),
            },
            onGraphError: {
                add: vi.fn(),
                remove: vi.fn(),
            },
        } as unknown as EventManager;

        manager = new OperationQueueManager(mockEventManager);
        executionOrder = [];
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Batch Mode Basics", () => {
        it("should enter and exit batch mode", () => {
            expect(manager.isInBatchMode()).toBe(false);

            manager.enterBatchMode();
            expect(manager.isInBatchMode()).toBe(true);

            manager.exitBatchMode();
            expect(manager.isInBatchMode()).toBe(false);
        });

        it("should queue operations without executing in batch mode", async() => {
            manager.enterBatchMode();

            let executed = false;
            void manager.queueOperationAsync(
                "data-add",
                () => {
                    executed = true;
                },
                {description: "Test operation"},
            );

            // Operation should be queued but not executed
            await new Promise((resolve) => setTimeout(resolve, 10));
            expect(executed).toBe(false);

            manager.exitBatchMode();
            await manager.waitForCompletion();

            // Now it should be executed
            expect(executed).toBe(true);
        });

        it("should return deferred promises in batch mode", async() => {
            manager.enterBatchMode();

            const promises: Promise<void>[] = [];
            const operations = ["op1", "op2", "op3"];

            for (const op of operations) {
                promises.push(manager.queueOperationAsync(
                    "data-add",
                    () => {
                        executionOrder.push(op);
                    },
                    {description: `Operation ${op}`},
                ));
            }

            // None should be executed yet
            expect(executionOrder).toEqual([]);

            manager.exitBatchMode();
            await manager.waitForCompletion();
            await Promise.all(promises);

            // All should be executed now
            expect(executionOrder).toEqual(["op1", "op2", "op3"]);
        });
    });

    describe("Dependency Ordering in Batches", () => {
        it("should execute operations in dependency order, not queue order", async() => {
            manager.enterBatchMode();

            // Queue in wrong order intentionally
            const p1 = manager.queueOperationAsync("layout-set",
                () => {
                    executionOrder.push("layout");
                });
            const p2 = manager.queueOperationAsync("data-add",
                () => {
                    executionOrder.push("data");
                });
            const p3 = manager.queueOperationAsync("style-init",
                () => {
                    executionOrder.push("style");
                });

            manager.exitBatchMode();
            await manager.waitForCompletion();
            await Promise.all([p1, p2, p3]);

            // Should execute in dependency order: style → data → layout
            expect(executionOrder).toEqual(["style", "data", "layout"]);
        });

        it("should handle multiple operations of the same category", async() => {
            manager.enterBatchMode();

            const promises: Promise<void>[] = [];

            // Queue multiple data operations
            promises.push(manager.queueOperationAsync("data-add",
                () => {
                    executionOrder.push("data1");
                }));
            promises.push(manager.queueOperationAsync("data-add",
                () => {
                    executionOrder.push("data2");
                }));
            promises.push(manager.queueOperationAsync("data-add",
                () => {
                    executionOrder.push("data3");
                }));

            // Add a layout operation
            promises.push(manager.queueOperationAsync("layout-set",
                () => {
                    executionOrder.push("layout");
                }));

            manager.exitBatchMode();
            await manager.waitForCompletion();
            await Promise.all(promises);

            // Data operations should maintain order and come before layout
            expect(executionOrder).toEqual(["data1", "data2", "data3", "layout"]);
        });
    });

    describe("Promise Resolution", () => {
        it("should complete operations after batch exits", async() => {
            manager.enterBatchMode();

            let executed = false;

            // In simplified batch mode, promises return immediately
            void manager.queueOperationAsync(
                "data-add",
                async() => {
                    await new Promise((resolve) => setTimeout(resolve, 50));
                    executed = true;
                },
            );

            // Operation shouldn't execute yet
            expect(executed).toBe(false);

            manager.exitBatchMode();
            await manager.waitForCompletion();

            // Operation should be complete after waiting
            expect(executed).toBe(true);
        });

        it("should handle errors in batch operations", async() => {
            manager.enterBatchMode();

            let errorEmitted = false;
            const error = new Error("Test error");

            // In simplified mode, errors are handled through event emission
            mockEventManager.emitGraphError = vi.fn(() => {
                errorEmitted = true;
            });

            void manager.queueOperationAsync(
                "data-add",
                () => {
                    throw error;
                },
            );

            manager.exitBatchMode();

            // Wait for operations to complete
            await manager.waitForCompletion();

            // Error should have been emitted through event system
            expect(errorEmitted).toBe(true);
        });

        it("should execute operations in dependency order", async() => {
            manager.enterBatchMode();

            const localExecutionOrder: string[] = [];

            // Queue operations in wrong order to test dependency sorting
            void manager.queueOperationAsync("layout-set",
                () => {
                    localExecutionOrder.push("layout");
                });

            void manager.queueOperationAsync("data-add",
                () => {
                    localExecutionOrder.push("data");
                });

            void manager.queueOperationAsync("style-init",
                () => {
                    localExecutionOrder.push("style");
                });

            manager.exitBatchMode();
            await manager.waitForCompletion();

            // Execution should be in dependency order regardless of queue order
            expect(localExecutionOrder).toEqual(["style", "data", "layout"]);
        });
    });

    describe("Batch Isolation", () => {
        it("should handle multiple sequential batches independently", async() => {
            // First batch
            manager.enterBatchMode();
            void manager.queueOperationAsync("data-add",
                () => {
                    executionOrder.push("batch1-data");
                });
            manager.exitBatchMode();
            await manager.waitForCompletion();

            // Second batch
            manager.enterBatchMode();
            void manager.queueOperationAsync("data-add",
                () => {
                    executionOrder.push("batch2-data");
                });
            manager.exitBatchMode();
            await manager.waitForCompletion();

            expect(executionOrder).toEqual(["batch1-data", "batch2-data"]);
        });

        it("should not affect normal operations outside batch mode", async() => {
            // Normal operation
            const p1 = manager.queueOperationAsync("data-add",
                () => {
                    executionOrder.push("normal1");
                });

            await p1;
            expect(executionOrder).toEqual(["normal1"]);

            // Batch operation
            manager.enterBatchMode();
            const p2 = manager.queueOperationAsync("data-add",
                () => {
                    executionOrder.push("batch");
                });
            manager.exitBatchMode();
            await p2;

            // Another normal operation
            const p3 = manager.queueOperationAsync("data-add",
                () => {
                    executionOrder.push("normal2");
                });
            await p3;

            expect(executionOrder).toEqual(["normal1", "batch", "normal2"]);
        });
    });

    describe("Error Handling", () => {
        it("should continue executing after errors in batch operations", async() => {
            manager.enterBatchMode();

            void manager.queueOperationAsync("data-add",
                () => {
                    executionOrder.push("success1");
                });
            void manager.queueOperationAsync("data-add",
                () => {
                    throw new Error("Failed operation");
                });
            void manager.queueOperationAsync("data-add",
                () => {
                    executionOrder.push("success2");
                });

            manager.exitBatchMode();
            await manager.waitForCompletion();

            // Other operations should still execute despite one failing
            expect(executionOrder).toContain("success1");
            expect(executionOrder).toContain("success2");
        });

        it("should clean up deferred promises after batch completion", async() => {
            manager.enterBatchMode();

            const promises = [
                manager.queueOperationAsync("data-add", () => { /* Test operation */ }),
                manager.queueOperationAsync("data-add", () => { /* Test operation */ }),
                manager.queueOperationAsync("data-add", () => { /* Test operation */ }),
            ];

            // Check that deferred promises are tracked
            expect(manager.getDeferredPromiseCount()).toBe(3);

            manager.exitBatchMode();
            await manager.waitForCompletion();
            await Promise.all(promises);

            // All deferred promises should be cleaned up
            expect(manager.getDeferredPromiseCount()).toBe(0);
        });
    });

    describe("Complex Scenarios", () => {
        it("should handle async operations in batch", async() => {
            manager.enterBatchMode();

            const p1 = manager.queueOperationAsync("style-init", async() => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                executionOrder.push("style");
            });

            const p2 = manager.queueOperationAsync("data-add", async() => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                executionOrder.push("data");
            });

            const p3 = manager.queueOperationAsync("layout-set", async() => {
                await new Promise((resolve) => setTimeout(resolve, 10));
                executionOrder.push("layout");
            });

            manager.exitBatchMode();
            await manager.waitForCompletion();
            await Promise.all([p1, p2, p3]);

            // Should still maintain dependency order
            expect(executionOrder).toEqual(["style", "data", "layout"]);
        });

        it("should work with waitForCompletion in batch mode", async() => {
            manager.enterBatchMode();

            void manager.queueOperationAsync("data-add",
                () => {
                    executionOrder.push("op1");
                });
            void manager.queueOperationAsync("data-add",
                () => {
                    executionOrder.push("op2");
                });

            manager.exitBatchMode();
            await manager.waitForCompletion();

            expect(executionOrder).toEqual(["op1", "op2"]);
        });

        it("should handle nested batch mode calls gracefully", () => {
            manager.enterBatchMode();
            expect(manager.isInBatchMode()).toBe(true);

            // Nested enter should be a no-op or throw
            manager.enterBatchMode();
            expect(manager.isInBatchMode()).toBe(true);

            manager.exitBatchMode();
            expect(manager.isInBatchMode()).toBe(false);

            // Extra exit should be safe
            manager.exitBatchMode();
            expect(manager.isInBatchMode()).toBe(false);
        });
    });
});
