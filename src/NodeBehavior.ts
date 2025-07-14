import {
    ActionManager,
    ExecuteCodeAction,
    SixDofDragBehavior,
} from "@babylonjs/core";

import type {Graph} from "./Graph";
import type {GraphContext} from "./managers/GraphContext";
import type {Node, NodeIdType} from "./Node";

interface NodeBehaviorOptions {
    pinOnDrag?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class NodeBehavior {
    /**
     * Add default interaction behaviors to a node
     */
    static addDefaultBehaviors(node: Node, options: NodeBehaviorOptions = {}): void {
        node.mesh.isPickable = true;

        this.addDragBehavior(node, options);
        this.addClickBehavior(node);
    }

    /**
     * Add drag behavior to a node
     */
    private static addDragBehavior(node: Node, options: NodeBehaviorOptions): void {
        // drag behavior setup
        node.pinOnDrag = options.pinOnDrag ?? true;
        node.meshDragBehavior = new SixDofDragBehavior();
        node.mesh.addBehavior(node.meshDragBehavior);

        // drag started
        node.meshDragBehavior.onDragStartObservable.add(() => {
            // make sure the graph is running
            const context = this.getContext(node);
            context.setRunning(true);

            // don't let the graph engine update the node -- we are controlling it
            node.dragging = true;
        });

        // drag ended
        node.meshDragBehavior.onDragEndObservable.add(() => {
            // make sure the graph is running
            const context = this.getContext(node);
            context.setRunning(true);

            // pin after dragging if configured
            if (node.pinOnDrag) {
                node.pin();
            }

            // the graph engine can have control of the node again
            node.dragging = false;
        });

        // position changed
        node.meshDragBehavior.onPositionChangedObservable.add((event) => {
            // CRITICAL: DO NOT restart layout on position changes!
            // This was causing infinite loop - position changes from layout engine
            // would trigger this, which would restart layout, causing more position changes

            // Only update position in layout engine if user is actively dragging
            if (node.dragging) {
                const context = this.getContext(node);
                // update the node position
                context.getLayoutManager().layoutEngine?.setNodePosition(node, event.position);
            }
        });

        // TODO: this apparently updates dragging objects faster and more fluidly
        // https://playground.babylonjs.com/#YEZPVT%23840
        // https://forum.babylonjs.com/t/expandable-lines/24681/12
    }

    /**
     * Add click behavior for node expansion
     */
    private static addClickBehavior(node: Node): void {
        // click behavior setup
        const context = this.getContext(node);
        const scene = context.getScene();
        node.mesh.actionManager = node.mesh.actionManager ?? new ActionManager(scene);

        // Available triggers:
        // ActionManager.OnDoublePickTrigger
        // ActionManager.OnRightPickTrigger
        // ActionManager.OnCenterPickTrigger
        // ActionManager.OnLongPressTrigger

        // Only Graph has fetchNodes/fetchEdges, not GraphContext
        // For now, check if parentGraph is the full Graph instance
        const graph = node.parentGraph as Graph & { fetchNodes?: unknown; fetchEdges?: unknown };
        if (graph.fetchNodes && graph.fetchEdges) {
            const {fetchNodes, fetchEdges} = graph;

            node.mesh.actionManager.registerAction(
                new ExecuteCodeAction(
                    {
                        trigger: ActionManager.OnDoublePickTrigger,
                        // trigger: ActionManager.OnLongPressTrigger,
                    },
                    () => {
                        // make sure the graph is running
                        context.setRunning(true);

                        // fetch all edges for current node
                        const edges = fetchEdges(node, graph as unknown as Graph) as Array<{ src: NodeIdType; dst: NodeIdType }>;

                        // create set of unique node ids
                        const nodeIds = new Set<NodeIdType>();
                        edges.forEach((e) => {
                            nodeIds.add(e.src);
                            nodeIds.add(e.dst);
                        });
                        nodeIds.delete(node.id);

                        // fetch all nodes from associated edges
                        const nodes = fetchNodes(nodeIds, graph);

                        // add all the nodes and edges we collected
                        const dataManager = context.getDataManager();
                        dataManager.addNodes([... nodes]);
                        dataManager.addEdges([... edges]);

                        // TODO: fetch and add secondary edges
                    },
                ),
            );
        }
    }

    /**
     * Helper to get GraphContext from a Node
     */
    private static getContext(node: Node): GraphContext {
        // Check if parentGraph has GraphContext methods
        if ("getStyles" in node.parentGraph) {
            return node.parentGraph;
        }

        // Otherwise, it's a Graph instance which implements GraphContext
        return node.parentGraph;
    }
}
