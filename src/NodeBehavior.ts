import {
    ActionManager,
    ExecuteCodeAction,
    SixDofDragBehavior,
} from "@babylonjs/core";

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
            node.parentGraph.running = true;

            // don't let the graph engine update the node -- we are controlling it
            node.dragging = true;
        });

        // drag ended
        node.meshDragBehavior.onDragEndObservable.add(() => {
            // make sure the graph is running
            node.parentGraph.running = true;

            // pin after dragging if configured
            if (node.pinOnDrag) {
                node.pin();
            }

            // the graph engine can have control of the node again
            node.dragging = false;
        });

        // position changed
        node.meshDragBehavior.onPositionChangedObservable.add((event) => {
            // make sure the graph is running
            node.parentGraph.running = true;

            // update the node position
            node.parentGraph.layoutEngine?.setNodePosition(node, event.position);
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
        node.mesh.actionManager = node.mesh.actionManager ?? new ActionManager(node.parentGraph.scene);

        // Available triggers:
        // ActionManager.OnDoublePickTrigger
        // ActionManager.OnRightPickTrigger
        // ActionManager.OnCenterPickTrigger
        // ActionManager.OnLongPressTrigger

        if (node.parentGraph.fetchNodes && node.parentGraph.fetchEdges) {
            const {fetchNodes, fetchEdges} = node.parentGraph;

            node.mesh.actionManager.registerAction(
                new ExecuteCodeAction(
                    {
                        trigger: ActionManager.OnDoublePickTrigger,
                        // trigger: ActionManager.OnLongPressTrigger,
                    },
                    () => {
                        // make sure the graph is running
                        node.parentGraph.running = true;

                        // fetch all edges for current node
                        // @ts-expect-error for some reason this is confusing window.Node with our Node
                        const edges = fetchEdges(node, node.parentGraph);

                        // create set of unique node ids
                        const nodeIds = new Set<NodeIdType>();
                        edges.forEach((e) => {
                            nodeIds.add(e.src);
                            nodeIds.add(e.dst);
                        });
                        nodeIds.delete(node.id);

                        // fetch all nodes from associated edges
                        const nodes = fetchNodes(nodeIds, node.parentGraph);

                        // add all the nodes and edges we collected
                        node.parentGraph.addNodes([... nodes]);
                        node.parentGraph.addEdges([... edges]);

                        // TODO: fetch and add secondary edges
                    },
                ),
            );
        }
    }
}
