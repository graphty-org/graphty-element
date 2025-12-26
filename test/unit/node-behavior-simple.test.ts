// @ts-nocheck
import {describe, expect, test, vi} from "vitest";

// Use vi.hoisted to define mock values before vi.mock is hoisted
const {mockActionManager, mockSixDofDragBehavior, mockExecuteCodeAction, DOUBLE_PICK_TRIGGER} = vi.hoisted(() => ({
    DOUBLE_PICK_TRIGGER: 6,
    mockActionManager: Object.assign(
        vi.fn().mockImplementation(function(scene) {
            this.scene = scene;
            this.actions = [];
            this.registerAction = vi.fn((action) => {
                this.actions.push(action);
            });
        }),
        {OnDoublePickTrigger: 6},
    ),
    mockSixDofDragBehavior: vi.fn().mockImplementation(function() {
        this.onDragStartObservable = {add: vi.fn()};
        this.onDragEndObservable = {add: vi.fn()};
        this.onPositionChangedObservable = {add: vi.fn()};
    }),
    mockExecuteCodeAction: vi.fn().mockImplementation(function(triggerOrOptions, func) {
        if (typeof triggerOrOptions === "object" && triggerOrOptions?.trigger) {
            this._trigger = triggerOrOptions.trigger;
        } else {
            this._trigger = triggerOrOptions;
        }

        this._func = func;
    }),
}));

// Mock @babylonjs/core - this will be merged with the global mock from setup.ts
vi.mock("@babylonjs/core", async(importOriginal) => {
    const actual = await importOriginal();
    return {
        ... actual,
        ActionManager: mockActionManager,
        SixDofDragBehavior: mockSixDofDragBehavior,
        ExecuteCodeAction: mockExecuteCodeAction,
    };
});

// Import after mock is set up
const {NodeBehavior} = await import("../../src/NodeBehavior");

describe("NodeBehavior Unit Tests", () => {
    test("addDefaultBehaviors makes node pickable", () => {
        const mockScene = {
            onPointerObservable: {add: vi.fn(), remove: vi.fn()},
            onPrePointerObservable: {add: vi.fn(), remove: vi.fn()},
            pointerX: 0,
            pointerY: 0,
            activeCamera: {position: {x: 0, y: 0, z: 10}},
            createPickingRay: vi.fn(),
        } as unknown as Parameters<typeof NodeBehavior.addDefaultBehaviors>[1];

        const mockNode = {
            mesh: {
                isPickable: false,
                addBehavior: vi.fn(),
                actionManager: null,
                getScene: () => mockScene,
                position: {x: 0, y: 0, z: 0},
            },
            parentGraph: {
                getStyles: vi.fn(),
                getScene: () => mockScene,
                setRunning: vi.fn(),
                getConfig: vi.fn().mockReturnValue({xr: undefined}),
                getLayoutManager: () => ({
                    layoutEngine: {setNodePosition: vi.fn()},
                }),
                getDataManager: () => ({
                    addNodes: vi.fn(),
                    addEdges: vi.fn(),
                }),
            },
        } as Parameters<typeof NodeBehavior.addDefaultBehaviors>[0];

        NodeBehavior.addDefaultBehaviors(mockNode);

        expect(mockNode.mesh.isPickable).toBe(true);
    });

    test("addDefaultBehaviors sets pinOnDrag from options", () => {
        const mockScene = {
            onPointerObservable: {add: vi.fn(), remove: vi.fn()},
            onPrePointerObservable: {add: vi.fn(), remove: vi.fn()},
            pointerX: 0,
            pointerY: 0,
            activeCamera: {position: {x: 0, y: 0, z: 10}},
            createPickingRay: vi.fn(),
        } as unknown as Parameters<typeof NodeBehavior.addDefaultBehaviors>[1];

        const mockNode = {
            mesh: {
                isPickable: false,
                addBehavior: vi.fn(),
                actionManager: null,
                getScene: () => mockScene,
                position: {x: 0, y: 0, z: 0},
            },
            parentGraph: {
                getStyles: vi.fn(),
                getScene: () => mockScene,
                setRunning: vi.fn(),
                getConfig: vi.fn().mockReturnValue({xr: undefined}),
                getLayoutManager: () => ({
                    layoutEngine: {setNodePosition: vi.fn()},
                }),
                getDataManager: () => ({
                    addNodes: vi.fn(),
                    addEdges: vi.fn(),
                }),
            },
        } as Parameters<typeof NodeBehavior.addDefaultBehaviors>[0];

        // Test with pinOnDrag true
        NodeBehavior.addDefaultBehaviors(mockNode, {pinOnDrag: true});
        expect(mockNode.pinOnDrag).toBe(true);

        // Test with pinOnDrag false
        (mockNode as {pinOnDrag?: boolean}).pinOnDrag = undefined;
        NodeBehavior.addDefaultBehaviors(mockNode, {pinOnDrag: false});
        expect((mockNode as {pinOnDrag?: boolean}).pinOnDrag).toBe(false);

        // Test default (should be true)
        (mockNode as {pinOnDrag?: boolean}).pinOnDrag = undefined;
        NodeBehavior.addDefaultBehaviors(mockNode, {});
        expect((mockNode as {pinOnDrag?: boolean}).pinOnDrag).toBe(true);
    });

    test("addDefaultBehaviors creates action manager for click behavior", () => {
        const mockScene = {
            onPointerObservable: {add: vi.fn(), remove: vi.fn()},
            onPrePointerObservable: {add: vi.fn(), remove: vi.fn()},
            pointerX: 0,
            pointerY: 0,
            activeCamera: {position: {x: 0, y: 0, z: 10}},
            createPickingRay: vi.fn(),
        } as unknown as Parameters<typeof NodeBehavior.addDefaultBehaviors>[1];

        const mockNode = {
            mesh: {
                isPickable: false,
                addBehavior: vi.fn(),
                actionManager: null,
                getScene: () => mockScene,
                position: {x: 0, y: 0, z: 0},
            },
            parentGraph: {
                getStyles: vi.fn(),
                getScene: () => mockScene,
                setRunning: vi.fn(),
                getConfig: vi.fn().mockReturnValue({xr: undefined}),
                getLayoutManager: () => ({
                    layoutEngine: {setNodePosition: vi.fn()},
                }),
                getDataManager: () => ({
                    addNodes: vi.fn(),
                    addEdges: vi.fn(),
                }),
                // Add fetch functions to trigger double-click behavior
                fetchNodes: vi.fn(),
                fetchEdges: vi.fn(),
            },
        } as Parameters<typeof NodeBehavior.addDefaultBehaviors>[0];

        NodeBehavior.addDefaultBehaviors(mockNode);

        expect(mockNode.mesh.actionManager).toBeDefined();
        expect(mockNode.mesh.actionManager?.registerAction).toHaveBeenCalled();

        // Check that double-click action was registered
        const doubleClickAction = mockNode.mesh.actionManager?.actions.find(
            (action: {_trigger: number}) => action._trigger === DOUBLE_PICK_TRIGGER,
        );
        expect(doubleClickAction).toBeDefined();
    });

    test("addDefaultBehaviors does not add double-click when no fetch functions", () => {
        const mockScene = {
            onPointerObservable: {add: vi.fn(), remove: vi.fn()},
            onPrePointerObservable: {add: vi.fn(), remove: vi.fn()},
            pointerX: 0,
            pointerY: 0,
            activeCamera: {position: {x: 0, y: 0, z: 10}},
            createPickingRay: vi.fn(),
        } as unknown as Parameters<typeof NodeBehavior.addDefaultBehaviors>[1];

        const mockNode = {
            mesh: {
                isPickable: false,
                addBehavior: vi.fn(),
                actionManager: null,
                getScene: () => mockScene,
                position: {x: 0, y: 0, z: 0},
            },
            parentGraph: {
                getStyles: vi.fn(),
                getScene: () => mockScene,
                setRunning: vi.fn(),
                getConfig: vi.fn().mockReturnValue({xr: undefined}),
                getLayoutManager: () => ({
                    layoutEngine: {setNodePosition: vi.fn()},
                }),
                getDataManager: () => ({
                    addNodes: vi.fn(),
                    addEdges: vi.fn(),
                }),
                // NO fetch functions
            },
        } as Parameters<typeof NodeBehavior.addDefaultBehaviors>[0];

        NodeBehavior.addDefaultBehaviors(mockNode);

        expect(mockNode.mesh.actionManager).toBeDefined();
        expect(mockNode.mesh.actionManager.registerAction).not.toHaveBeenCalled();

        // No actions should be registered
        expect(mockNode.mesh.actionManager.actions.length).toBe(0);
    });
});
