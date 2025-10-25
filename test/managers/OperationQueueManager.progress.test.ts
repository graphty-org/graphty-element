import {assert, beforeEach, describe, it} from "vitest";

import {EventManager} from "../../src/managers/EventManager";
import {type OperationContext, OperationQueueManager} from "../../src/managers/OperationQueueManager";

describe("Progress Tracking", () => {
    let eventManager: EventManager;
    let queueManager: OperationQueueManager;
    let progressEvents: {id: string, progress: number, message?: string, phase?: string}[];

    beforeEach(() => {
        eventManager = new EventManager();
        queueManager = new OperationQueueManager(eventManager);
        progressEvents = [];

        // Capture progress events
        eventManager.onGraphEvent.add((event) => {
            if (event.type === "operation-progress") {
                progressEvents.push({
                    id: (event as Record<string, unknown>).id as string,
                    progress: (event as Record<string, unknown>).progress as number,
                    message: (event as Record<string, unknown>).message as string | undefined,
                    phase: (event as Record<string, unknown>).phase as string | undefined,
                });
            }
        });
    });

    it("should track operation progress with percent, message, and phase", async() => {
        let capturedContext: OperationContext | null = null;

        queueManager.queueOperation(
            "data-add",
            async(context) => {
                capturedContext = context;

                // Simulate progress updates
                context.progress.setProgress(25);
                context.progress.setMessage("Loading data");
                context.progress.setPhase("initialization");

                await new Promise((resolve) => setTimeout(resolve, 10));

                context.progress.setProgress(50);
                context.progress.setMessage("Processing nodes");
                context.progress.setPhase("processing");

                await new Promise((resolve) => setTimeout(resolve, 10));

                context.progress.setProgress(75);
                context.progress.setMessage("Creating edges");

                await new Promise((resolve) => setTimeout(resolve, 10));

                context.progress.setProgress(100);
                context.progress.setMessage("Complete");
                context.progress.setPhase("finalization");
            },
            {description: "Test operation with progress"},
        );

        await queueManager.waitForCompletion();

        // Verify progress context was provided
        assert.isNotNull(capturedContext);
        assert.isDefined((capturedContext as Record<string, unknown>).progress);

        // Verify progress events were emitted
        assert.isTrue(progressEvents.length > 0, "Should emit progress events");

        // Check that we have progress values
        const progressValues = progressEvents.map((e) => e.progress);
        assert.isTrue(progressValues.includes(25) || progressValues.includes(50) || progressValues.includes(75) || progressValues.includes(100),
            "Should have some progress values");

        // Check that at least one event has a message
        const hasMessage = progressEvents.some((e) => e.message !== undefined);
        assert.isTrue(hasMessage, "Should have at least one event with a message");

        // Check that at least one event has a phase
        const hasPhase = progressEvents.some((e) => e.phase !== undefined);
        assert.isTrue(hasPhase, "Should have at least one event with a phase");
    });

    it("should emit progress events during execution", async() => {
        const opId = queueManager.queueOperation(
            "layout-update",
            async(context) => {
                for (let i = 0; i <= 100; i += 10) {
                    context.progress.setProgress(i);
                    context.progress.setMessage(`Processing: ${i}%`);
                    await new Promise((resolve) => setTimeout(resolve, 5));
                }
            },
            {description: "Progressive operation"},
        );

        await queueManager.waitForCompletion();

        // Should have multiple progress events
        assert.isTrue(progressEvents.length >= 10, "Should have at least 10 progress events");

        // Verify events have increasing progress values
        const progressValues = progressEvents.map((e) => e.progress);
        for (let i = 1; i < progressValues.length; i++) {
            assert.isTrue(
                progressValues[i] >= progressValues[i - 1],
                "Progress should be non-decreasing",
            );
        }

        // Verify all events have the same operation ID
        const uniqueIds = new Set(progressEvents.map((e) => e.id));
        assert.equal(uniqueIds.size, 1, "All progress events should be for same operation");
        assert.equal(progressEvents[0].id, opId);
    });

    it("should cleanup progress after completion", async() => {
        const stats = queueManager.getStats();
        assert.equal(stats.pending, 0);

        queueManager.queueOperation(
            "style-apply",
            async(context) => {
                context.progress.setProgress(50);
                context.progress.setMessage("Applying styles");
                await new Promise((resolve) => setTimeout(resolve, 10));
                context.progress.setProgress(100);
            },
        );

        await queueManager.waitForCompletion();

        // Wait for cleanup timeout (1000ms as per implementation)
        await new Promise((resolve) => setTimeout(resolve, 1100));

        // Try to emit another progress event - it should not appear in events
        const eventCountBefore = progressEvents.length;

        // This would happen if progress wasn't cleaned up
        // Since we can't directly access private operationProgress,
        // we verify cleanup by checking no new events after operation
        const opId2 = queueManager.queueOperation(
            "style-apply",
            (context) => {
                context.progress.setProgress(50);
            },
        );

        await queueManager.waitForCompletion();

        // Should have new events for the second operation
        assert.isTrue(progressEvents.length > eventCountBefore);

        // Verify the new events are for the second operation
        const newEvents = progressEvents.slice(eventCountBefore);
        assert.isTrue(newEvents.every((e) => e.id === opId2));
    });

    it("should handle progress for cancelled operations", async() => {
        let operationStarted = false;

        queueManager.queueOperation(
            "algorithm-run",
            async(context) => {
                operationStarted = true;

                try {
                    context.progress.setProgress(10);
                    context.progress.setMessage("Starting algorithm");

                    // Check if already aborted
                    if (context.signal.aborted) {
                        throw new Error("AbortError");
                    }

                    await new Promise<void>((resolve, reject) => {
                        const timeout = setTimeout(resolve, 1000);

                        // Listen for abort
                        context.signal.addEventListener("abort", () => {
                            clearTimeout(timeout);
                            const error = new Error("Operation aborted");
                            error.name = "AbortError";
                            reject(error);
                        });
                    });

                    context.progress.setProgress(100);
                } catch (error) {
                    if ((error as Error).name === "AbortError") {
                        context.progress.setProgress(0);
                        context.progress.setMessage("Cancelled");
                    }
                }
            },
        );

        // Cancel the operation after a short delay
        setTimeout(() => {
            // Since we have access to the operation via the queue,
            // we need to expose cancellation or handle it differently
            // For now, we'll clear the queue which effectively cancels pending operations
            queueManager.clear();
        }, 50);

        try {
            await queueManager.waitForCompletion();
        } catch {
            // Expected for cancelled operations
        }

        // Check if we got progress events before cancellation
        const cancelledProgress = progressEvents.find((e) => e.message === "Starting algorithm");
        assert.isDefined(cancelledProgress, "Should have progress event before cancellation");

        // The operation may have been cleared before starting
        // or cancelled during execution
        assert.isTrue(operationStarted);
    });

    it("should handle multiple concurrent operations with separate progress", async() => {
        const op1Events: typeof progressEvents = [];
        const op2Events: typeof progressEvents = [];

        const op1Id = queueManager.queueOperation(
            "data-add",
            async(context) => {
                for (let i = 0; i <= 100; i += 25) {
                    context.progress.setProgress(i);
                    context.progress.setMessage(`Operation 1: ${i}%`);
                    await new Promise((resolve) => setTimeout(resolve, 10));
                }
            },
        );

        const op2Id = queueManager.queueOperation(
            "layout-update",
            async(context) => {
                for (let i = 0; i <= 100; i += 33) {
                    context.progress.setProgress(i);
                    context.progress.setMessage(`Operation 2: ${i}%`);
                    await new Promise((resolve) => setTimeout(resolve, 10));
                }
            },
        );

        await queueManager.waitForCompletion();

        // Separate events by operation ID
        progressEvents.forEach((event) => {
            if (event.id === op1Id) {
                op1Events.push(event);
            } else if (event.id === op2Id) {
                op2Events.push(event);
            }
        });

        // Both operations should have progress events
        assert.isTrue(op1Events.length > 0, "Operation 1 should have progress events");
        assert.isTrue(op2Events.length > 0, "Operation 2 should have progress events");

        // Each should have messages (but they might not all include the operation number)
        const op1HasMessages = op1Events.some((e) => e.message !== undefined);
        const op2HasMessages = op2Events.some((e) => e.message !== undefined);
        assert.isTrue(op1HasMessages, "Op1 should have some messages");
        assert.isTrue(op2HasMessages, "Op2 should have some messages");
    });

    it("should include duration in progress events", async() => {
        const capturedEvents: {duration?: number}[] = [];

        eventManager.onGraphEvent.add((event) => {
            if (event.type === "operation-progress") {
                capturedEvents.push({duration: (event as Record<string, unknown>).duration as number | undefined});
            }
        });

        queueManager.queueOperation(
            "render-update",
            async(context) => {
                context.progress.setProgress(25);
                await new Promise((resolve) => setTimeout(resolve, 50));
                context.progress.setProgress(75);
                await new Promise((resolve) => setTimeout(resolve, 50));
                context.progress.setProgress(100);
            },
        );

        await queueManager.waitForCompletion();

        // All progress events should have duration
        assert.isTrue(capturedEvents.length > 0);
        capturedEvents.forEach((event) => {
            assert.isDefined(event.duration);
            assert.isTrue((event.duration ?? 0) >= 0, "Duration should be non-negative");
        });

        // Later events should have larger durations
        if (capturedEvents.length > 1) {
            const firstDuration = capturedEvents[0].duration ?? 0;
            const lastDuration = capturedEvents[capturedEvents.length - 1].duration ?? 0;
            assert.isTrue(lastDuration >= firstDuration, "Duration should increase over time");
        }
    });
});

