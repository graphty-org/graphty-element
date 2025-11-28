import {algorithmMetaBase, createAlgorithmStory, type Story} from "../helpers";

const meta = {
    ... algorithmMetaBase,
    title: "Algorithms/Traversal",
};
export default meta;

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
