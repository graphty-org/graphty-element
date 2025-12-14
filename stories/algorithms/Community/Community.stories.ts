import {algorithmMetaBase, createAlgorithmStory, type Story} from "../helpers";

const meta = {
    ... algorithmMetaBase,
    title: "Algorithms/Community",
};
export default meta;

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
