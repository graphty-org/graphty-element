import type {Graphty} from "../../../src/graphty-element";
import {algorithmMetaBase, createAlgorithmStory, type Story, templateCreator} from "../helpers";

const meta = {
    ... algorithmMetaBase,
    title: "Algorithms/Flow",
};
export default meta;

// Bipartite graph data: Job candidates ↔ Job positions
const bipartiteJobMatchingData = {
    nodes: [
        // Left partition: Job Candidates
        {id: "alice", label: "Alice", partition: "candidate"},
        {id: "bob", label: "Bob", partition: "candidate"},
        {id: "carol", label: "Carol", partition: "candidate"},
        {id: "dave", label: "Dave", partition: "candidate"},
        {id: "eve", label: "Eve", partition: "candidate"},
        {id: "frank", label: "Frank", partition: "candidate"},
        {id: "grace", label: "Grace", partition: "candidate"},
        // Right partition: Job Openings
        {id: "senior_dev", label: "Senior Dev", partition: "job"},
        {id: "ux_designer", label: "UX Designer", partition: "job"},
        {id: "backend", label: "Backend Eng", partition: "job"},
        {id: "data_sci", label: "Data Scientist", partition: "job"},
        {id: "tech_lead", label: "Tech Lead", partition: "job"},
        {id: "frontend", label: "Frontend Eng", partition: "job"},
        {id: "security", label: "Security Eng", partition: "job"},
    ],
    edges: [
        // Alice: experienced, qualifies for multiple roles
        {src: "alice", dst: "senior_dev"},
        {src: "alice", dst: "backend"},
        {src: "alice", dst: "frontend"},
        // Bob: UX specialist
        {src: "bob", dst: "ux_designer"},
        // Carol: backend focus
        {src: "carol", dst: "backend"},
        {src: "carol", dst: "senior_dev"},
        // Dave: data specialist
        {src: "dave", dst: "data_sci"},
        // Eve: management
        {src: "eve", dst: "tech_lead"},
        // Frank: frontend focus
        {src: "frank", dst: "frontend"},
        // Grace: security/systems
        {src: "grace", dst: "backend"},
        {src: "grace", dst: "security"},
        {src: "grace", dst: "senior_dev"},
    ],
};

/**
 * Bipartite Matching - maximum matching in bipartite graphs
 * Demonstrates job candidate ↔ job position matching
 * Matched edges are highlighted in purple (thick)
 * Left partition (candidates) are blue, right partition (jobs) are red
 * Non-matched edges are dimmed gray
 */
export const BipartiteMatching: Story = {
    args: {
        dataSource: undefined,
        nodeData: bipartiteJobMatchingData.nodes,
        edgeData: bipartiteJobMatchingData.edges,
        styleTemplate: templateCreator({
            graph: {
                twoD: true,
                layout: "bipartite",
                layoutOptions: {
                    nodes: ["alice", "bob", "carol", "dave", "eve", "frank", "grace"],
                    align: "horizontal",
                    aspectRatio: 1.5,
                },
            },
            algorithms: ["graphty:bipartite-matching"],
        }),
        runAlgorithmsOnLoad: true,
    },
    play: async({canvasElement}) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const element = canvasElement.querySelector("graphty-element");
        if (!element) {
            return;
        }

        const graphtyElement = element as Graphty;
        const {graph} = graphtyElement;
        const dm = graph.getDataManager();
        const layoutManager = graph.getLayoutManager();

        // Run the algorithm explicitly (runAlgorithmsOnLoad may not trigger for all data sources)
        await graph.runAlgorithmsFromTemplate();

        // Store current positions before style application (applyStylesToExistingNodes resets them)
        const savedPositions = new Map<string, {x: number, y: number, z: number}>();
        for (const [id, node] of dm.nodes) {
            savedPositions.set(String(id), {
                x: node.mesh.position.x,
                y: node.mesh.position.y,
                z: node.mesh.position.z,
            });
        }

        // Apply suggested styles
        graph.applySuggestedStyles("graphty:bipartite-matching");

        // Apply styles to existing elements (this will reset positions - bug)
        dm.applyStylesToExistingNodes();
        dm.applyStylesToExistingEdges();

        // Restore positions after style application
        for (const [id, node] of dm.nodes) {
            const savedPos = savedPositions.get(String(id));
            if (savedPos) {
                node.mesh.position.x = savedPos.x;
                node.mesh.position.y = savedPos.y;
                node.mesh.position.z = savedPos.z;
            }
        }

        // Update edge geometry to reflect new node positions
        for (const edge of layoutManager.edges) {
            edge.update();
        }
    },
};

/**
 * Max Flow - network flow visualization
 * Edge width proportional to flow amount
 * Edge color intensity shows flow utilization (light → dark blue)
 * Source node is green with glow, sink node is red with glow
 */
export const MaxFlow: Story = createAlgorithmStory("graphty:max-flow");

/**
 * Min Cut - minimum cut visualization
 * Cut edges are highlighted in orange
 * Partition 1 nodes are blue, partition 2 nodes are red
 * Non-cut edges are dimmed
 */
export const MinCut: Story = createAlgorithmStory("graphty:min-cut");
