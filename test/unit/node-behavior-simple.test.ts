import {ActionManager} from "@babylonjs/core";
import {describe, expect, test, vi} from "vitest";

import {NodeBehavior} from "../../src/NodeBehavior";

// Mock ActionManager at the module level
vi.mock("@babylonjs/core", async() => {
    const actual = await vi.importActual("@babylonjs/core");
    return {
        ...actual,
        ActionManager: vi.fn().mockImplementation(function(scene) {
            this.scene = scene;
            this.actions = [];
            this.registerAction = vi.fn((action) => {
                this.actions.push(action);
            });
        }),
        SixDofDragBehavior: vi.fn().mockImplementation(function() {
            this.onDragStartObservable = {add: vi.fn()};
            this.onDragEndObservable = {add: vi.fn()};
            this.onPositionChangedObservable = {add: vi.fn()};
        }),
        ExecuteCodeAction: vi.fn().mockImplementation(function(triggerOrOptions, func) {
            if (typeof triggerOrOptions === 'object' && triggerOrOptions.trigger) {
                this._trigger = triggerOrOptions.trigger;
            } else {
                this._trigger = triggerOrOptions;
            }
            this._func = func;
        }),
    };
});

// Make sure ActionManager constants are available
(ActionManager as any).OnDoublePickTrigger = 1;

describe("NodeBehavior Unit Tests", () => {
    test("addDefaultBehaviors makes node pickable", () => {
        const mockNode = {
            mesh: {
                isPickable: false,
                addBehavior: vi.fn(),
                actionManager: null,
            },
            parentGraph: {
                getStyles: vi.fn(),
                getScene: () => ({} as any),
                setRunning: vi.fn(),
                getLayoutManager: () => ({
                    layoutEngine: {setNodePosition: vi.fn()},
                }),
                getDataManager: () => ({
                    addNodes: vi.fn(),
                    addEdges: vi.fn(),
                }),
            },
        } as any;

        NodeBehavior.addDefaultBehaviors(mockNode);

        expect(mockNode.mesh.isPickable).toBe(true);
    });

    test("addDefaultBehaviors sets pinOnDrag from options", () => {
        const mockNode = {
            mesh: {
                isPickable: false,
                addBehavior: vi.fn(),
                actionManager: null,
            },
            parentGraph: {
                getStyles: vi.fn(),
                getScene: () => ({} as any),
                setRunning: vi.fn(),
                getLayoutManager: () => ({
                    layoutEngine: {setNodePosition: vi.fn()},
                }),
                getDataManager: () => ({
                    addNodes: vi.fn(),
                    addEdges: vi.fn(),
                }),
            },
        } as any;

        // Test with pinOnDrag true
        NodeBehavior.addDefaultBehaviors(mockNode, {pinOnDrag: true});
        expect(mockNode.pinOnDrag).toBe(true);

        // Test with pinOnDrag false
        mockNode.pinOnDrag = undefined;
        NodeBehavior.addDefaultBehaviors(mockNode, {pinOnDrag: false});
        expect(mockNode.pinOnDrag).toBe(false);

        // Test default (should be true)
        mockNode.pinOnDrag = undefined;
        NodeBehavior.addDefaultBehaviors(mockNode, {});
        expect(mockNode.pinOnDrag).toBe(true);
    });

    test("addDefaultBehaviors creates action manager for click behavior", () => {
        const mockScene = {} as any;
        const mockNode = {
            mesh: {
                isPickable: false,
                addBehavior: vi.fn(),
                actionManager: null,
            },
            parentGraph: {
                getStyles: vi.fn(),
                getScene: () => mockScene,
                setRunning: vi.fn(),
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
        } as any;

        NodeBehavior.addDefaultBehaviors(mockNode);

        expect(mockNode.mesh.actionManager).toBeDefined();
        expect(mockNode.mesh.actionManager.registerAction).toHaveBeenCalled();

        // Check that double-click action was registered
        const doubleClickAction = mockNode.mesh.actionManager.actions.find(
            (action: any) => action._trigger === ActionManager.OnDoublePickTrigger,
        );
        expect(doubleClickAction).toBeDefined();
    });

    test("addDefaultBehaviors does not add double-click when no fetch functions", () => {
        const mockScene = {} as any;
        const mockNode = {
            mesh: {
                isPickable: false,
                addBehavior: vi.fn(),
                actionManager: null,
            },
            parentGraph: {
                getStyles: vi.fn(),
                getScene: () => mockScene,
                setRunning: vi.fn(),
                getLayoutManager: () => ({
                    layoutEngine: {setNodePosition: vi.fn()},
                }),
                getDataManager: () => ({
                    addNodes: vi.fn(),
                    addEdges: vi.fn(),
                }),
                // NO fetch functions
            },
        } as any;

        NodeBehavior.addDefaultBehaviors(mockNode);

        expect(mockNode.mesh.actionManager).toBeDefined();
        expect(mockNode.mesh.actionManager.registerAction).not.toHaveBeenCalled();

        // No actions should be registered
        expect(mockNode.mesh.actionManager.actions.length).toBe(0);
    });
});
