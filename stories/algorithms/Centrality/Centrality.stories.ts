import {algorithmMetaBase, createAlgorithmStory, type Story} from "../helpers";

const meta = {
    ... algorithmMetaBase,
    title: "Algorithms/Centrality",
};
export default meta;

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
