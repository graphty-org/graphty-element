import {algorithmMetaBase, createAlgorithmStory, type Story} from "../helpers";

const meta = {
    ... algorithmMetaBase,
    title: "Algorithms/Spanning Tree",
};
export default meta;

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
