import {assert, beforeEach, describe, it} from "vitest";

import {EventManager} from "../../src/managers/EventManager";
import {type OperationCategory, OperationQueueManager} from "../../src/managers/OperationQueueManager";

describe("Operation Triggers", () => {
    let manager: OperationQueueManager;
    let eventManager: EventManager;

    beforeEach(() => {
        eventManager = new EventManager();
        manager = new OperationQueueManager(eventManager);
    });

    it("should trigger layout-update after data-add", async() => {
        const operations: string[] = [];
        let layoutUpdateTriggered = false;

        // Set up a way to detect if layout-update was triggered BEFORE queuing
        manager.onOperationQueued = (category: OperationCategory) => {
            if (category === "layout-update") {
                layoutUpdateTriggered = true;
                operations.push("layout-update-triggered");
            }
        };

        // Queue a data-add operation
        await manager.queueOperationAsync(
            "data-add",
            () => {
                operations.push("data-add");
            },
            {
                description: "Adding nodes",
            },
        );

        // Wait for operations to complete
        await new Promise((resolve) => setTimeout(resolve, 50));

        assert.isTrue(layoutUpdateTriggered, "layout-update should be triggered after data-add");
        assert.include(operations, "data-add", "data-add should have executed");
    });

    it("should skip triggers when skipTriggers flag is set", async() => {
        const operations: string[] = [];
        let layoutUpdateTriggered = false;

        // Set up detection for layout-update trigger
        manager.onOperationQueued = (category: OperationCategory) => {
            if (category === "layout-update") {
                layoutUpdateTriggered = true;
            }
        };

        // Queue a data-add operation with skipTriggers flag
        await manager.queueOperationAsync(
            "data-add",
            () => {
                operations.push("data-add");
            },
            {
                description: "Adding nodes",
                skipTriggers: true,
            },
        );

        // Wait for operations to complete
        await new Promise((resolve) => setTimeout(resolve, 50));

        assert.isFalse(layoutUpdateTriggered, "layout-update should not be triggered when skipTriggers is true");
        assert.include(operations, "data-add", "data-add should have executed");
    });

    it("should handle custom triggers", async() => {
        const operations: string[] = [];
        let customTriggered = false;

        // Register a custom trigger for style-init -> render-update
        manager.registerTrigger("style-init", () => {
            customTriggered = true;
            operations.push("custom-trigger");
            return {
                category: "render-update" as OperationCategory,
                execute: () => {
                    operations.push("render-update");
                },
                description: "Triggered render update",
            };
        });

        // Queue a style-init operation
        await manager.queueOperationAsync(
            "style-init",
            () => {
                operations.push("style-init");
            },
            {
                description: "Initializing styles",
            },
        );

        // Wait for operations to complete
        await new Promise((resolve) => setTimeout(resolve, 50));

        assert.isTrue(customTriggered, "custom trigger should be called");
        assert.include(operations, "style-init", "style-init should have executed");
        assert.include(operations, "custom-trigger", "custom trigger should have been invoked");
    });

    it("should not trigger if prerequisites missing (no layout engine)", async() => {
        const operations: string[] = [];
        let layoutUpdateTriggered = false;

        // Mock hasLayoutEngine to return false
        manager.hasLayoutEngine = () => false;

        // Set up detection for layout-update trigger
        manager.onOperationQueued = (category: OperationCategory) => {
            if (category === "layout-update") {
                layoutUpdateTriggered = true;
            }
        };

        // Queue a data-add operation
        await manager.queueOperationAsync(
            "data-add",
            () => {
                operations.push("data-add");
            },
            {
                description: "Adding nodes",
            },
        );

        // Wait for operations to complete
        await new Promise((resolve) => setTimeout(resolve, 50));

        assert.isFalse(layoutUpdateTriggered, "layout-update should not be triggered when no layout engine exists");
        assert.include(operations, "data-add", "data-add should have executed");
    });

    it("should queue multiple triggered operations from single source", async() => {
        const operations: string[] = [];
        const triggeredCategories: OperationCategory[] = [];

        // Set up detection for triggered operations
        manager.onOperationQueued = (category: OperationCategory) => {
            triggeredCategories.push(category);
        };

        // Register multiple triggers for data-add
        manager.registerTrigger("data-add", () => {
            operations.push("trigger-1");
            return {
                category: "layout-update" as OperationCategory,
                execute: () => {
                    operations.push("layout-update");
                },
                description: "Update layout",
            };
        });

        manager.registerTrigger("data-add", () => {
            operations.push("trigger-2");
            return {
                category: "render-update" as OperationCategory,
                execute: () => {
                    operations.push("render-update");
                },
                description: "Update render",
            };
        });

        // Queue a data-add operation
        await manager.queueOperationAsync(
            "data-add",
            () => {
                operations.push("data-add");
            },
            {
                description: "Adding nodes",
            },
        );

        // Wait for operations to complete
        await new Promise((resolve) => setTimeout(resolve, 50));

        assert.include(operations, "data-add", "data-add should have executed");
        assert.include(operations, "trigger-1", "first trigger should have been invoked");
        assert.include(operations, "trigger-2", "second trigger should have been invoked");
    });

    it("should handle trigger that returns null (conditional trigger)", async() => {
        const operations: string[] = [];
        let triggerCalled = false;

        // Register a conditional trigger that returns null
        manager.registerTrigger("data-remove", () => {
            triggerCalled = true;
            // Return null to indicate no operation should be triggered
            return null;
        });

        // Queue a data-remove operation
        await manager.queueOperationAsync(
            "data-remove",
            () => {
                operations.push("data-remove");
            },
            {
                description: "Removing nodes",
            },
        );

        // Wait for operations to complete
        await new Promise((resolve) => setTimeout(resolve, 50));

        assert.isTrue(triggerCalled, "trigger function should be called");
        assert.include(operations, "data-remove", "data-remove should have executed");
        assert.equal(operations.length, 1, "only the original operation should execute");
    });

    it("should pass operation metadata to trigger function", async() => {
        let receivedMetadata: unknown = null;

        // Register a trigger that captures metadata
        manager.registerTrigger("data-update", (metadata) => {
            receivedMetadata = metadata;
            return null;
        });

        const testMetadata = {
            description: "Test operation with metadata",
        };

        // Queue an operation with metadata
        await manager.queueOperationAsync(
            "data-update",
            () => {
                // Operation implementation
            },
            testMetadata,
        );

        // Wait for operations to complete
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Check that the metadata contains the expected fields (ignoring timestamp)
        assert.equal((receivedMetadata as Record<string, unknown>).description, testMetadata.description, "should have description");
    });
});
