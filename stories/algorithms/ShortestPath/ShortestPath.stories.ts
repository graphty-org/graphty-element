import {algorithmMetaBase, createAlgorithmStory, type Story} from "../helpers";

const meta = {
    ... algorithmMetaBase,
    title: "Algorithms/Shortest Path",
};
export default meta;

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
