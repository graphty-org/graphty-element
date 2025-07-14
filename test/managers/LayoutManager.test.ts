import {beforeEach, describe, it, vi} from "vitest";
import {assert} from "chai";
import {LayoutManager} from "../../src/managers/LayoutManager";
import type {EventManager} from "../../src/managers/EventManager";
import type {DataManager} from "../../src/managers/DataManager";
import type {Styles} from "../../src/Styles";
import type {Node} from "../../src/Node";
import type {Edge} from "../../src/Edge";
import type {LayoutEngine} from "../../src/layout/LayoutEngine";
import type {GraphContext} from "../../src/managers/GraphContext";

describe("LayoutManager", () => {
    let layoutManager: LayoutManager;
    let mockEventManager: EventManager;
    let mockDataManager: DataManager;
    let mockStyles: Styles;
    let mockGraphContext: GraphContext;
    let mockLayoutEngine: LayoutEngine;

    beforeEach(() => {
        // Create mocks
        mockEventManager = {
            emitLayoutInitialized: vi.fn(),
            emitGraphError: vi.fn(),
            onDataEvent: vi.fn().mockReturnValue({remove: vi.fn()}),
        } as any;

        mockDataManager = {
            setLayoutEngine: vi.fn(),
            getNodes: vi.fn().mockReturnValue(new Map()),
            getEdges: vi.fn().mockReturnValue(new Map()),
        } as any;

        mockStyles = {
            config: {
                behavior: {
                    layout: {
                        preSteps: 5,
                        dimensions: 3,
                        stepMultiplier: 1,
                    },
                },
            },
        } as any;

        mockGraphContext = {
            getLayoutEngine: vi.fn(),
        } as any;

        mockLayoutEngine = {
            init: vi.fn().mockResolvedValue(undefined),
            step: vi.fn(),
            addNode: vi.fn(),
            addEdge: vi.fn(),
            removeNode: vi.fn(),
            removeEdge: vi.fn(),
            getNodePosition: vi.fn(),
            setNodePosition: vi.fn(),
            dispose: vi.fn(),
            isSettled: false,
        } as any;

        layoutManager = new LayoutManager(
            mockEventManager,
            mockDataManager,
            mockStyles,
            mockGraphContext
        );
    });

    describe("initialization", () => {
        it("should initialize without errors", async () => {
            await layoutManager.init();
            assert.isNotNull(layoutManager);
        });

        it("should dispose without errors", () => {
            layoutManager.dispose();
            assert.isNotNull(layoutManager);
        });

        it("should dispose layout engine on dispose", async () => {
            // Mock layout registry
            const mockGet = vi.fn().mockReturnValue(() => mockLayoutEngine);
            vi.doMock("../../src/layout/LayoutRegistry", () => ({
                default: {get: mockGet},
            }));

            await layoutManager.setLayout("force", {});
            layoutManager.dispose();

            assert.isTrue(mockLayoutEngine.dispose.called);
        });
    });

    describe("layout management", () => {
        beforeEach(() => {
            // Mock layout registry
            const mockGet = vi.fn().mockReturnValue(() => mockLayoutEngine);
            vi.doMock("../../src/layout/LayoutRegistry", () => ({
                default: {get: mockGet},
            }));
        });

        it("should set layout engine", async () => {
            const options = {springLength: 100};
            await layoutManager.setLayout("force", options);

            assert.isTrue(mockLayoutEngine.init.calledOnce);
            assert.isTrue(mockDataManager.setLayoutEngine.calledWith(mockLayoutEngine));
            assert.isTrue(mockEventManager.emitLayoutInitialized.calledWith("force", true));
            assert.equal(layoutManager.layoutEngine, mockLayoutEngine);
            assert.isTrue(layoutManager.running);
        });

        it("should run pre-steps when setting layout", async () => {
            await layoutManager.setLayout("force", {});

            // Should run 5 pre-steps based on config
            assert.equal(mockLayoutEngine.step.callCount, 5);
        });

        it("should handle layout initialization errors", async () => {
            const error = new Error("Layout init failed");
            mockLayoutEngine.init.mockRejectedValue(error);

            await assert.isRejected(
                layoutManager.setLayout("force", {}),
                /Error setting layout 'force'/
            );

            assert.isTrue(mockEventManager.emitGraphError.calledOnce);
        });

        it("should handle unknown layout type", async () => {
            // Mock registry to return null
            const mockGet = vi.fn().mockReturnValue(null);
            vi.doMock("../../src/layout/LayoutRegistry", () => ({
                default: {get: mockGet},
            }));

            await assert.isRejected(
                layoutManager.setLayout("unknown", {}),
                /Layout type 'unknown' not found/
            );
        });

        it("should dispose previous layout when setting new one", async () => {
            // Set first layout
            await layoutManager.setLayout("force", {});
            const firstEngine = layoutManager.layoutEngine;

            // Create new mock for second layout
            const secondEngine = {
                ...mockLayoutEngine,
                init: vi.fn().mockResolvedValue(undefined),
            };
            const mockGet = vi.fn().mockReturnValue(() => secondEngine);
            vi.doMock("../../src/layout/LayoutRegistry", () => ({
                default: {get: mockGet},
            }));

            // Set second layout
            await layoutManager.setLayout("circular", {});

            assert.isTrue(firstEngine?.dispose.called);
            assert.equal(layoutManager.layoutEngine, secondEngine);
        });
    });

    describe("layout stepping", () => {
        beforeEach(async () => {
            // Mock layout registry
            const mockGet = vi.fn().mockReturnValue(() => mockLayoutEngine);
            vi.doMock("../../src/layout/LayoutRegistry", () => ({
                default: {get: mockGet},
            }));

            await layoutManager.setLayout("force", {});
        });

        it("should step layout when running", () => {
            layoutManager.step();
            assert.isTrue(mockLayoutEngine.step.calledOnce);
        });

        it("should not step when not running", () => {
            layoutManager.running = false;
            mockLayoutEngine.step.mockClear();
            
            layoutManager.step();
            assert.isFalse(mockLayoutEngine.step.called);
        });

        it("should not step when no layout engine", async () => {
            // Create new manager without layout
            const newManager = new LayoutManager(
                mockEventManager,
                mockDataManager,
                mockStyles,
                mockGraphContext
            );

            newManager.step();
            // Should not throw
            assert.isNotNull(newManager);
        });
    });

    describe("node and edge management", () => {
        it("should get nodes from data manager", () => {
            const mockNodes = new Map([
                ["node1", {id: "node1"} as Node],
                ["node2", {id: "node2"} as Node],
            ]);
            mockDataManager.getNodes.mockReturnValue(mockNodes);

            const nodes = layoutManager.nodes;
            assert.equal(nodes.length, 2);
            assert.equal(nodes[0].id, "node1");
            assert.equal(nodes[1].id, "node2");
        });

        it("should get edges from data manager", () => {
            const mockEdges = new Map([
                ["edge1", {id: "edge1"} as Edge],
                ["edge2", {id: "edge2"} as Edge],
            ]);
            mockDataManager.getEdges.mockReturnValue(mockEdges);

            const edges = layoutManager.edges;
            assert.equal(edges.length, 2);
            assert.equal(edges[0].id, "edge1");
            assert.equal(edges[1].id, "edge2");
        });
    });

    describe("position management", () => {
        beforeEach(async () => {
            // Mock layout registry
            const mockGet = vi.fn().mockReturnValue(() => mockLayoutEngine);
            vi.doMock("../../src/layout/LayoutRegistry", () => ({
                default: {get: mockGet},
            }));

            await layoutManager.setLayout("force", {});
        });

        it("should get node position from layout engine", () => {
            const mockNode = {id: "node1"} as Node;
            const mockPosition = {x: 10, y: 20, z: 30};
            mockLayoutEngine.getNodePosition.mockReturnValue(mockPosition);

            const position = layoutManager.getNodePosition(mockNode);
            
            assert.isDefined(position);
            assert.deepEqual(position, [10, 20, 30]);
            assert.isTrue(mockLayoutEngine.getNodePosition.calledWith(mockNode));
        });

        it("should handle undefined position", () => {
            const mockNode = {id: "node1"} as Node;
            mockLayoutEngine.getNodePosition.mockReturnValue(undefined);

            const position = layoutManager.getNodePosition(mockNode);
            
            assert.isUndefined(position);
        });

        it("should handle position without z coordinate", () => {
            const mockNode = {id: "node1"} as Node;
            const mockPosition = {x: 10, y: 20};
            mockLayoutEngine.getNodePosition.mockReturnValue(mockPosition);

            const position = layoutManager.getNodePosition(mockNode);
            
            assert.isDefined(position);
            assert.deepEqual(position, [10, 20, 0]);
        });

        it("should return undefined when no layout engine", () => {
            // Create new manager without layout
            const newManager = new LayoutManager(
                mockEventManager,
                mockDataManager,
                mockStyles,
                mockGraphContext
            );

            const mockNode = {id: "node1"} as Node;
            const position = newManager.getNodePosition(mockNode);
            
            assert.isUndefined(position);
        });
    });

    describe("layout state", () => {
        it("should report settled state from layout engine", async () => {
            // Mock layout registry
            const mockGet = vi.fn().mockReturnValue(() => mockLayoutEngine);
            vi.doMock("../../src/layout/LayoutRegistry", () => ({
                default: {get: mockGet},
            }));

            await layoutManager.setLayout("force", {});

            // Initially not settled
            assert.isFalse(layoutManager.isSettled);

            // Update engine state
            mockLayoutEngine.isSettled = true;
            assert.isTrue(layoutManager.isSettled);
        });

        it("should report as settled when no layout engine", () => {
            assert.isTrue(layoutManager.isSettled);
        });

        it("should report as settled when not running", async () => {
            // Mock layout registry
            const mockGet = vi.fn().mockReturnValue(() => mockLayoutEngine);
            vi.doMock("../../src/layout/LayoutRegistry", () => ({
                default: {get: mockGet},
            }));

            await layoutManager.setLayout("force", {});
            layoutManager.running = false;

            assert.isTrue(layoutManager.isSettled);
        });
    });

    describe("dimensions", () => {
        it("should get dimensions from styles config", () => {
            assert.equal(layoutManager.dimensions, 3);

            // Update config
            mockStyles.config.behavior.layout.dimensions = 2;
            assert.equal(layoutManager.dimensions, 2);
        });
    });

    describe("data event handling", () => {
        it("should listen to data events on init", async () => {
            await layoutManager.init();

            assert.isTrue(mockEventManager.onDataEvent.calledWith("added", layoutManager.handleDataAdded));
        });

        it("should remove listener on dispose", async () => {
            const mockObserver = {remove: vi.fn()};
            mockEventManager.onDataEvent.mockReturnValue(mockObserver);

            await layoutManager.init();
            layoutManager.dispose();

            assert.isTrue(mockObserver.remove.called);
        });

        it("should restart layout on data added event", () => {
            const event = {
                type: "data-added",
                dataType: "nodes",
                count: 5,
                shouldStartLayout: true,
                shouldZoomToFit: false,
            };

            layoutManager.handleDataAdded(event);

            assert.isTrue(layoutManager.running);
        });

        it("should not restart layout if shouldStartLayout is false", () => {
            layoutManager.running = false;
            
            const event = {
                type: "data-added",
                dataType: "nodes",
                count: 5,
                shouldStartLayout: false,
                shouldZoomToFit: false,
            };

            layoutManager.handleDataAdded(event);

            assert.isFalse(layoutManager.running);
        });
    });
});