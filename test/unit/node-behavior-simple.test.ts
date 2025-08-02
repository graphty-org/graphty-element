import {ActionManager} from "@babylonjs/core";
import {describe, expect, test, vi} from "vitest";

import {NodeBehavior} from "../../src/NodeBehavior";

// Mock ActionManager at the module level
vi.mock("@babylonjs/core", async() => {
    const actual = await vi.importActual("@babylonjs/core");
    return {
        ... actual,
        ActionManager: vi.fn().mockImplementation(function(this: {scene: unknown, actions: unknown[], registerAction: (action: unknown) => void}, scene: unknown) {
            this.scene = scene;
            this.actions = [];
            this.registerAction = vi.fn((action) => {
                this.actions.push(action);
            });
        }),
        SixDofDragBehavior: vi.fn().mockImplementation(function(this: {onDragStartObservable: {add: unknown}, onDragEndObservable: {add: unknown}, onPositionChangedObservable: {add: unknown}}) {
            this.onDragStartObservable = {add: vi.fn()};
            this.onDragEndObservable = {add: vi.fn()};
            this.onPositionChangedObservable = {add: vi.fn()};
        }),
        ExecuteCodeAction: vi.fn().mockImplementation(function(this: {_trigger: unknown, _func: unknown}, triggerOrOptions: {trigger?: unknown}, func: unknown) {
            if (typeof triggerOrOptions === "object" && (triggerOrOptions as {trigger?: unknown}).trigger) {
                this._trigger = (triggerOrOptions as {trigger: unknown}).trigger;
            } else {
                this._trigger = triggerOrOptions;
            }

            this._func = func;
        }),
    };
});

// Make sure ActionManager constants are available
(ActionManager as {OnDoublePickTrigger: number}).OnDoublePickTrigger = 1;

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
                getScene: () => ({} as Record<string, unknown>),
                setRunning: vi.fn(),
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
        const mockNode = {
            mesh: {
                isPickable: false,
                addBehavior: vi.fn(),
                actionManager: null,
            },
            parentGraph: {
                getStyles: vi.fn(),
                getScene: () => ({} as Record<string, unknown>),
                setRunning: vi.fn(),
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
        const mockScene = {} as Parameters<typeof NodeBehavior.addDefaultBehaviors>[1];
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
        } as Parameters<typeof NodeBehavior.addDefaultBehaviors>[0];

        NodeBehavior.addDefaultBehaviors(mockNode);

        expect(mockNode.mesh.actionManager).toBeDefined();
        expect(mockNode.mesh.actionManager?.registerAction).toHaveBeenCalled();

        // Check that double-click action was registered
        const doubleClickAction = mockNode.mesh.actionManager?.actions.find(
            (action: {_trigger: number}) => action._trigger === ActionManager.OnDoublePickTrigger,
        );
        expect(doubleClickAction).toBeDefined();
    });

    test("addDefaultBehaviors does not add double-click when no fetch functions", () => {
        const mockScene = {} as Parameters<typeof NodeBehavior.addDefaultBehaviors>[1];
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
        } as Parameters<typeof NodeBehavior.addDefaultBehaviors>[0];

        NodeBehavior.addDefaultBehaviors(mockNode);

        expect(mockNode.mesh.actionManager).toBeDefined();
        expect(mockNode.mesh.actionManager.registerAction).not.toHaveBeenCalled();

        // No actions should be registered
        expect(mockNode.mesh.actionManager.actions.length).toBe(0);
    });
});
