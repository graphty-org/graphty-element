import {beforeEach, describe, it, vi} from "vitest";
import {assert} from "chai";
import {LifecycleManager} from "../../src/managers/LifecycleManager";
import type {EventManager} from "../../src/managers/EventManager";
import type {Manager} from "../../src/managers/interfaces";

describe("LifecycleManager", () => {
    let lifecycleManager: LifecycleManager;
    let mockEventManager: EventManager;
    let mockManagers: Map<string, Manager>;
    let manager1: Manager;
    let manager2: Manager;
    let manager3: Manager;

    beforeEach(() => {
        // Create mock event manager
        mockEventManager = {
            emitGraphError: vi.fn(),
            emitGraphEvent: vi.fn(),
        } as any;

        // Create mock managers
        manager1 = {
            init: vi.fn().mockResolvedValue(undefined),
            dispose: vi.fn(),
        };

        manager2 = {
            init: vi.fn().mockResolvedValue(undefined),
            dispose: vi.fn(),
        };

        manager3 = {
            init: vi.fn().mockResolvedValue(undefined),
            dispose: vi.fn(),
        };

        mockManagers = new Map([
            ["manager1", manager1],
            ["manager2", manager2],
            ["manager3", manager3],
        ]);

        lifecycleManager = new LifecycleManager(
            mockManagers,
            mockEventManager,
            ["manager1", "manager2", "manager3"]
        );
    });

    describe("initialization", () => {
        it("should initialize without errors", async () => {
            await lifecycleManager.init();
            assert.isNotNull(lifecycleManager);
        });

        it("should initialize managers in specified order", async () => {
            await lifecycleManager.init();

            assert.isTrue(manager1.init.calledOnce);
            assert.isTrue(manager2.init.calledOnce);
            assert.isTrue(manager3.init.calledOnce);

            // Verify order
            assert.isTrue(manager1.init.calledBefore(manager2.init));
            assert.isTrue(manager2.init.calledBefore(manager3.init));
        });

        it("should handle manager initialization errors", async () => {
            const error = new Error("Manager init failed");
            manager2.init.mockRejectedValue(error);

            await assert.isRejected(
                lifecycleManager.init(),
                /Failed to initialize manager: manager2/
            );

            assert.isTrue(mockEventManager.emitGraphError.calledOnce);
            assert.equal(mockEventManager.emitGraphError.args[0][1].message, "Manager init failed");
        });

        it("should use default order if not specified", () => {
            const newLifecycleManager = new LifecycleManager(
                mockManagers,
                mockEventManager
            );

            assert.isNotNull(newLifecycleManager);
        });

        it("should handle empty manager map", async () => {
            const emptyLifecycleManager = new LifecycleManager(
                new Map(),
                mockEventManager
            );

            await emptyLifecycleManager.init();
            assert.isNotNull(emptyLifecycleManager);
        });
    });

    describe("disposal", () => {
        it("should dispose managers in reverse order", () => {
            lifecycleManager.dispose();

            assert.isTrue(manager1.dispose.calledOnce);
            assert.isTrue(manager2.dispose.calledOnce);
            assert.isTrue(manager3.dispose.calledOnce);

            // Verify reverse order
            assert.isTrue(manager3.dispose.calledBefore(manager2.dispose));
            assert.isTrue(manager2.dispose.calledBefore(manager1.dispose));
        });

        it("should handle manager disposal errors gracefully", () => {
            const error = new Error("Disposal failed");
            manager2.dispose.mockImplementation(() => {
                throw error;
            });

            // Should not throw
            assert.doesNotThrow(() => {
                lifecycleManager.dispose();
            });

            // Should still dispose other managers
            assert.isTrue(manager1.dispose.calledOnce);
            assert.isTrue(manager3.dispose.calledOnce);
        });

        it("should handle missing dispose method", () => {
            const managerWithoutDispose = {
                init: vi.fn().mockResolvedValue(undefined),
                // No dispose method
            } as any;

            const managers = new Map([
                ["manager1", manager1],
                ["noDispose", managerWithoutDispose],
                ["manager3", manager3],
            ]);

            const newLifecycleManager = new LifecycleManager(
                managers,
                mockEventManager,
                ["manager1", "noDispose", "manager3"]
            );

            // Should not throw
            assert.doesNotThrow(() => {
                newLifecycleManager.dispose();
            });

            assert.isTrue(manager1.dispose.calledOnce);
            assert.isTrue(manager3.dispose.calledOnce);
        });
    });

    describe("graph lifecycle", () => {
        it("should start graph with update callback", async () => {
            const updateCallback = vi.fn();
            let renderLoopCallback: (() => void) | undefined;

            // Mock scene register
            const mockScene = {
                registerBeforeRender: vi.fn((cb) => {
                    renderLoopCallback = cb;
                }),
                unregisterBeforeRender: vi.fn(),
            };

            // Add render manager with scene
            const renderManager = {
                init: vi.fn().mockResolvedValue(undefined),
                dispose: vi.fn(),
                getScene: () => mockScene,
            } as any;

            const managers = new Map([
                ["render", renderManager],
                ["manager1", manager1],
            ]);

            const newLifecycleManager = new LifecycleManager(
                managers,
                mockEventManager,
                ["render", "manager1"]
            );

            await newLifecycleManager.init();
            await newLifecycleManager.startGraph(updateCallback);

            assert.isTrue(mockScene.registerBeforeRender.calledOnce);
            assert.isDefined(renderLoopCallback);

            // Simulate render loop callback
            renderLoopCallback!();
            assert.isTrue(updateCallback.calledOnce);
        });

        it("should handle missing render manager", async () => {
            const updateCallback = vi.fn();

            await lifecycleManager.init();
            
            await assert.isRejected(
                lifecycleManager.startGraph(updateCallback),
                /Render manager not found/
            );
        });

        it("should stop graph render loop", async () => {
            const mockScene = {
                registerBeforeRender: vi.fn(),
                unregisterBeforeRender: vi.fn(),
            };

            const renderManager = {
                init: vi.fn().mockResolvedValue(undefined),
                dispose: vi.fn(),
                getScene: () => mockScene,
            } as any;

            const managers = new Map([
                ["render", renderManager],
            ]);

            const newLifecycleManager = new LifecycleManager(
                managers,
                mockEventManager,
                ["render"]
            );

            await newLifecycleManager.init();
            await newLifecycleManager.startGraph(() => {});
            
            // Stop the graph
            newLifecycleManager.dispose();

            assert.isTrue(mockScene.unregisterBeforeRender.calledOnce);
        });
    });

    describe("manager access", () => {
        it("should get manager by name", async () => {
            await lifecycleManager.init();

            const retrieved = lifecycleManager.getManager("manager2");
            assert.equal(retrieved, manager2);
        });

        it("should return undefined for non-existent manager", async () => {
            await lifecycleManager.init();

            const retrieved = lifecycleManager.getManager("nonexistent");
            assert.isUndefined(retrieved);
        });

        it("should get all managers", () => {
            const allManagers = lifecycleManager.getAllManagers();
            assert.equal(allManagers.size, 3);
            assert.equal(allManagers.get("manager1"), manager1);
            assert.equal(allManagers.get("manager2"), manager2);
            assert.equal(allManagers.get("manager3"), manager3);
        });
    });

    describe("error handling", () => {
        it("should emit error event when manager throws during init", async () => {
            const error = new Error("Init explosion");
            manager1.init.mockRejectedValue(error);

            await assert.isRejected(lifecycleManager.init());

            assert.isTrue(mockEventManager.emitGraphError.calledOnce);
            const errorCall = mockEventManager.emitGraphError.args[0];
            assert.equal(errorCall[1], error);
            assert.equal(errorCall[2], "lifecycle");
        });

        it("should handle async errors in render loop", async () => {
            const updateCallback = vi.fn().mockImplementation(() => {
                throw new Error("Update error");
            });

            const mockScene = {
                registerBeforeRender: vi.fn(),
                unregisterBeforeRender: vi.fn(),
            };

            const renderManager = {
                init: vi.fn().mockResolvedValue(undefined),
                dispose: vi.fn(),
                getScene: () => mockScene,
            } as any;

            const managers = new Map([["render", renderManager]]);
            const newLifecycleManager = new LifecycleManager(
                managers,
                mockEventManager
            );

            await newLifecycleManager.init();
            await newLifecycleManager.startGraph(updateCallback);

            // Get the registered callback and call it
            const renderCallback = mockScene.registerBeforeRender.args[0][0];
            
            // Should not throw
            assert.doesNotThrow(() => {
                renderCallback();
            });
        });
    });

    describe("initialization state", () => {
        it("should track initialization state", async () => {
            assert.isFalse(lifecycleManager.isInitialized());
            
            await lifecycleManager.init();
            
            assert.isTrue(lifecycleManager.isInitialized());
        });

        it("should reset initialization state on dispose", async () => {
            await lifecycleManager.init();
            assert.isTrue(lifecycleManager.isInitialized());
            
            lifecycleManager.dispose();
            
            assert.isFalse(lifecycleManager.isInitialized());
        });

        it("should prevent double initialization", async () => {
            await lifecycleManager.init();
            
            // Second init should be a no-op
            await lifecycleManager.init();
            
            // Managers should only be initialized once
            assert.equal(manager1.init.callCount, 1);
            assert.equal(manager2.init.callCount, 1);
            assert.equal(manager3.init.callCount, 1);
        });
    });
});