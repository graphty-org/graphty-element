import type {Meta, StoryObj} from "@storybook/web-components-vite";

import type {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Algorithms",
    component: "graphty-element",
    decorators: [eventWaitingDecorator],
    parameters: {
        controls: {exclude: /^(#|_)/},
        chromatic: {
            delay: 500, // Allow Babylon.js render frames to complete
        },
    },
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2.json",
        },
        layout: "ngraph",
        layoutConfig: {
            seed: 42, // Fixed seed for consistent layouts in visual tests
        },
    },
};
export default meta;

type Story = StoryObj<Graphty>;

/**
 * Helper function for algorithm stories
 * Creates a story that runs an algorithm and applies its suggested styles
 */
const createAlgorithmStory = (algorithmId: string): Story => ({
    args: {
        styleTemplate: templateCreator({
            algorithms: [algorithmId],
        }),
        runAlgorithmsOnLoad: true,
    },
    play: async({canvasElement}) => {
        // Wait for the graph to load and settle
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Get the graphty-element
        const element = canvasElement.querySelector("graphty-element");
        if (!element) {
            return;
        }

        const graphtyElement = element as Graphty;
        const {graph} = graphtyElement;

        // Apply suggested styles from the algorithm
        graph.applySuggestedStyles(algorithmId);

        // Re-apply styles to existing nodes and edges so they pick up the new style layers
        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
});

// ============================================
// CENTRALITY ALGORITHMS
// ============================================

/**
 * Degree centrality - colors nodes by connection count
 * Uses a red-to-yellow gradient where red = low degree, yellow = high degree
 */
export const Degree: Story = createAlgorithmStory("graphty:degree");

/**
 * PageRank - sizes nodes by importance
 * Nodes are scaled from 1 to 5 based on their PageRank score
 */
export const PageRank: Story = createAlgorithmStory("graphty:pagerank");

/**
 * Betweenness centrality - colors bridge nodes
 * Uses plasma gradient (blue → pink → yellow) where yellow = high betweenness
 */
export const Betweenness: Story = createAlgorithmStory("graphty:betweenness");

/**
 * Closeness centrality - colors by average distance to others
 * Uses greens gradient (light → dark) where dark = high closeness
 */
export const Closeness: Story = createAlgorithmStory("graphty:closeness");

/**
 * Eigenvector centrality - colors by influence
 * Uses oranges gradient (light → dark) where dark = high influence
 */
export const Eigenvector: Story = createAlgorithmStory("graphty:eigenvector");

/**
 * HITS - hub and authority scores
 * Uses viridis gradient with size for combined hub/authority importance
 */
export const HITS: Story = createAlgorithmStory("graphty:hits");

/**
 * Katz centrality - colors by attenuated paths
 * Uses blues gradient (light → dark) where dark = high Katz centrality
 */
export const Katz: Story = createAlgorithmStory("graphty:katz");

// ============================================
// COMMUNITY DETECTION ALGORITHMS
// ============================================

/**
 * Louvain - categorical colors by detected community
 * Uses Okabe-Ito colorblind-safe palette for community membership
 */
export const Louvain: Story = createAlgorithmStory("graphty:louvain");

/**
 * Girvan-Newman - community detection via edge betweenness removal
 * Uses Tol Vibrant palette with 7 high-saturation colors
 */
export const GirvanNewman: Story = createAlgorithmStory("graphty:girvan-newman");

/**
 * Leiden - improved community detection (guarantees connected communities)
 * Uses Tol Muted palette with 7 subdued professional colors
 */
export const Leiden: Story = createAlgorithmStory("graphty:leiden");

/**
 * Label Propagation - fast community detection via label spreading
 * Uses pastel palette with 8 soft colors
 */
export const LabelPropagation: Story = createAlgorithmStory("graphty:label-propagation");

// ============================================
// SHORTEST PATH ALGORITHMS
// ============================================

/**
 * Dijkstra - highlights shortest path
 * Path edges are highlighted in red with increased width
 * Path nodes have red color and glow effect
 */
export const Dijkstra: Story = createAlgorithmStory("graphty:dijkstra");

/**
 * Bellman-Ford - shortest path with support for negative weights
 * Path edges are highlighted in blue with increased width
 * Path nodes have blue color and glow effect
 * Nodes fade based on distance from source
 */
export const BellmanFord: Story = createAlgorithmStory("graphty:bellman-ford");

/**
 * Floyd-Warshall - all-pairs shortest paths
 * Colors nodes by eccentricity using inferno gradient
 * Central nodes (eccentricity = radius) are highlighted with glow
 * Peripheral nodes (eccentricity = diameter) are dimmed
 */
export const FloydWarshall: Story = createAlgorithmStory("graphty:floyd-warshall");

// ============================================
// TRAVERSAL ALGORITHMS (Phase 5)
// ============================================

/**
 * BFS - Breadth-First Search
 * Colors nodes by BFS level from source (viridis gradient)
 * Nodes closer to source are larger
 */
export const BFS: Story = createAlgorithmStory("graphty:bfs");

/**
 * DFS - Depth-First Search
 * Colors nodes by DFS discovery time (inferno gradient: black to yellow)
 * Nodes discovered earlier are larger
 */
export const DFS: Story = createAlgorithmStory("graphty:dfs");

// ============================================
// COMPONENT ALGORITHMS (Phase 6)
// ============================================

/**
 * Connected Components - identifies disconnected graph parts
 * Colors nodes by component ID using IBM Carbon design system colors
 */
export const ConnectedComponents: Story = createAlgorithmStory("graphty:connected-components");

/**
 * Strongly Connected Components - for directed graphs
 * Colors nodes by SCC using Okabe-Ito colorblind-safe palette
 * In a directed graph, an SCC is where every node can reach every other node
 */
export const SCC: Story = createAlgorithmStory("graphty:scc");

// ============================================
// MINIMUM SPANNING TREE ALGORITHMS (Phase 7)
// ============================================

/**
 * Kruskal's MST - highlights minimum spanning tree edges
 * MST edges are highlighted in green with increased width
 * Non-MST edges are dimmed (gray with reduced opacity)
 */
export const Kruskal: Story = createAlgorithmStory("graphty:kruskal");

/**
 * Prim's MST - highlights minimum spanning tree edges
 * Same visualization as Kruskal but uses Prim's algorithm
 * (grows tree from a starting node instead of sorting edges)
 */
export const Prim: Story = createAlgorithmStory("graphty:prim");

// ============================================
// ADVANCED ALGORITHMS (Phase 8)
// ============================================

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
            if (node.mesh) {
                savedPositions.set(String(id), {
                    x: node.mesh.position.x,
                    y: node.mesh.position.y,
                    z: node.mesh.position.z,
                });
            }
        }

        // Apply suggested styles
        graph.applySuggestedStyles("graphty:bipartite-matching");

        // Apply styles to existing elements (this will reset positions - bug)
        dm.applyStylesToExistingNodes();
        dm.applyStylesToExistingEdges();

        // Restore positions after style application
        for (const [id, node] of dm.nodes) {
            const savedPos = savedPositions.get(String(id));
            if (savedPos && node.mesh) {
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

// ============================================
// COMBINATION STORIES
// ============================================

/**
 * Multiple algorithms coexisting - Degree and PageRank
 * - Degree colors nodes (red to yellow) based on connection count
 * - PageRank sizes nodes (1-5) based on importance
 */
export const DegreeAndPageRank: Story = {
    args: {
        styleTemplate: templateCreator({
            algorithms: ["graphty:degree", "graphty:pagerank"],
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

        graph.applySuggestedStyles(["graphty:degree", "graphty:pagerank"]);
        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
};

/**
 * Community with PageRank - shows community membership with importance sizing
 * - Louvain colors nodes by community (categorical colors)
 * - PageRank sizes nodes (1-5) based on importance
 */
export const LouvainWithPageRank: Story = {
    args: {
        styleTemplate: templateCreator({
            algorithms: ["graphty:louvain", "graphty:pagerank"],
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

        graph.applySuggestedStyles(["graphty:pagerank", "graphty:louvain"]);
        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
};

/**
 * All Four Phase 1 Algorithms Combined
 * - Degree: Colors nodes by connection count
 * - PageRank: Sizes nodes by importance
 * - Louvain: Colors nodes by community (overrides degree color)
 * - Dijkstra: Highlights shortest path edges and nodes
 */
export const AllPhase1Algorithms: Story = {
    args: {
        styleTemplate: templateCreator({
            algorithms: ["graphty:degree", "graphty:pagerank", "graphty:louvain", "graphty:dijkstra"],
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

        // Order matters: later algorithms can override earlier ones
        graph.applySuggestedStyles([
            "graphty:degree", // Color by degree (will be overridden by louvain)
            "graphty:pagerank", // Size by PageRank importance
            "graphty:louvain", // Color by community (overrides degree color)
            "graphty:dijkstra", // Highlight shortest path
        ]);

        graph.getDataManager().applyStylesToExistingNodes();
        graph.getDataManager().applyStylesToExistingEdges();
    },
};
