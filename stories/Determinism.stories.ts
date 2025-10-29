/**
 * Determinism Stories - Property Order Independence Verification
 *
 * These stories verify that graph operations produce identical results
 * regardless of the order properties are set. Visual regression tests
 * will verify all variants produce pixel-perfect matching output.
 *
 * This is a critical requirement: the operation queue should ensure
 * deterministic execution order based on dependencies, not call order.
 *
 * Each variant sets the same properties but in a completely different
 * execution order using imperative JavaScript statements. The operation
 * queue should handle dependency ordering and produce identical visual output.
 */

import type {Meta, StoryObj} from "@storybook/web-components";

import {Graphty} from "../src/graphty-element.js";
import {eventWaitingDecorator, templateCreator} from "./helpers.js";

const meta: Meta = {
    title: "Determinism/Property Order Independence",
    component: "graphty-element",
    decorators: [eventWaitingDecorator],
    tags: ["autodocs"],
    parameters: {
        layout: "fullscreen",
        chromatic: {
            delay: 500,
        },
    },
};

export default meta;

type Story = StoryObj<Graphty>;

// Test data used across all stories - using more nodes for better visibility
const TEST_NODES = [
    {id: "1", label: "Node 1"},
    {id: "2", label: "Node 2"},
    {id: "3", label: "Node 3"},
    {id: "4", label: "Node 4"},
    {id: "5", label: "Node 5"},
    {id: "6", label: "Node 6"},
];

const TEST_EDGES = [
    {src: "1", dst: "2"},
    {src: "2", dst: "3"},
    {src: "3", dst: "4"},
    {src: "4", dst: "5"},
    {src: "5", dst: "6"},
    {src: "6", dst: "1"},
];

// Shared style configuration for both variants
const STYLE_TEMPLATE = templateCreator({
    nodeStyle: {
        texture: {
            color: "#4CAF50",
        },
        shape: {
            type: "sphere",
            size: 10, // Reduced from 20 to make edges more visible
        },
    },
    edgeStyle: {
        line: {
            color: "#666666",
            width: 3, // Increased from 2 to make edges more prominent
        },
    },
});

// Base style properties for reuse in variants
const BASE_STYLE_PROPS = {
    nodeStyle: {
        texture: {
            color: "#4CAF50",
        },
        shape: {
            type: "sphere",
            size: 10,
        },
    },
    edgeStyle: {
        line: {
            color: "#666666",
            width: 3,
        },
    },
};

// =============================================================================
// Scenario 1: Deterministic Output Despite Property Order
// =============================================================================

/**
 * Variant 1: Properties set in order: Style → Data → Layout
 *
 * Sets properties using imperative statements in this specific order:
 * 1. styleTemplate (styles before data exists)
 * 2. nodeData
 * 3. edgeData
 * 4. layout (layout last)
 *
 * The operation queue should handle this order gracefully and produce
 * the same visual output as Variant 2.
 */
export const DeterministicVariant1: Story = {
    name: "Variant 1",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Order 1: Style → Data → Layout
        g.styleTemplate = STYLE_TEMPLATE;
        g.nodeData = TEST_NODES;
        g.edgeData = TEST_EDGES;
        g.layout = "circular";

        return g;
    },
};

/**
 * Variant 2: Properties set in order: Layout → Data → Style
 *
 * Sets properties using imperative statements in a COMPLETELY DIFFERENT order:
 * 1. layout (layout first, before any data)
 * 2. edgeData (edges before nodes)
 * 3. nodeData
 * 4. styleTemplate (styles last)
 *
 * Despite the different execution order, the operation queue should ensure
 * this produces pixel-perfect identical output to Variant 1.
 */
export const DeterministicVariant2: Story = {
    name: "Variant 2",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Order 2: Layout → Data (reversed) → Style
        g.layout = "circular";
        g.edgeData = TEST_EDGES; // Edges before nodes!
        g.nodeData = TEST_NODES;
        g.styleTemplate = STYLE_TEMPLATE;

        return g;
    },
};

// =============================================================================
// Scenario 2: Asynchronous Property Updates
// =============================================================================

/**
 * Variant 3: Delayed data loading with crazy initial state
 *
 * Tests that the operation queue handles asynchronous updates correctly:
 * 1. Start with wrong layout (random)
 * 2. Start with partial/wrong data
 * 3. Update to correct layout after delay
 * 4. Update to correct data after delays
 *
 * Final state MUST match Variant 1 exactly for pixel-perfect comparison.
 */
export const DeterministicVariant3: Story = {
    name: "Variant 3 (Async)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Start with crazy initial state
        g.layout = "random"; // Wrong layout
        g.styleTemplate = STYLE_TEMPLATE; // Correct style from start

        // Load wrong/partial data first
        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 3); // Only 3 nodes
        }, 5);

        // Fix layout
        setTimeout(() => {
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 10);

        // Load correct complete data
        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: matches Variant 1
        }, 15);

        setTimeout(() => {
            g.edgeData = TEST_EDGES; // FINAL: matches Variant 1
        }, 20);

        return g;
    },
};

/**
 * Variant 4: Multiple style updates with delayed data
 *
 * Tests that multiple property updates are handled correctly:
 * 1. Start with completely wrong style (red nodes)
 * 2. Start with wrong layout (random)
 * 3. Update layout to correct value
 * 4. Load data after delay
 * 5. Update to correct style last
 *
 * Final state MUST match Variant 1 exactly for pixel-perfect comparison.
 */
export const DeterministicVariant4: Story = {
    name: "Variant 4 (Multi-update)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Start with wrong style (red nodes)
        const wrongStyle = templateCreator({
            nodeStyle: {
                texture: {color: "#FF0000"}, // Red - will be overwritten
                shape: {type: "sphere", size: 10},
            },
            edgeStyle: {
                line: {color: "#666666", width: 3},
            },
        });

        g.styleTemplate = wrongStyle; // Wrong style initially
        g.layout = "random"; // Wrong layout initially

        // Fix layout first
        setTimeout(() => {
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 5);

        // Load data
        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: matches Variant 1
            g.edgeData = TEST_EDGES; // FINAL: matches Variant 1
        }, 10);

        // Update to correct style last
        setTimeout(() => {
            g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1
        }, 30);

        return g;
    },
};

// =============================================================================
// Scenario 3: Partial Data Updates
// =============================================================================

/**
 * Variant 5: Incremental data loading with crazy initial values
 *
 * Tests that data can be loaded incrementally with corrections:
 * 1. Start with wrong layout (random)
 * 2. Start with wrong style (blue boxes)
 * 3. Load partial node data (first 2 nodes)
 * 4. Fix layout to correct value
 * 5. Load more partial data
 * 6. Fix style to correct value
 * 7. Load complete data
 * 8. Load edges last
 *
 * Final state MUST match Variant 1 exactly for pixel-perfect comparison.
 */
export const DeterministicVariant5: Story = {
    name: "Variant 5 (Incremental)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Start with wrong layout and style
        const wrongStyle = templateCreator({
            nodeStyle: {
                texture: {color: "#0000FF"}, // Blue - wrong
                shape: {type: "box", size: 10}, // Box - wrong
            },
            edgeStyle: {
                line: {color: "#FF0000", width: 3}, // Red - wrong
            },
        });

        g.layout = "random"; // Wrong layout
        g.styleTemplate = wrongStyle; // Wrong style

        // Load partial data immediately (only 2 nodes)
        g.nodeData = TEST_NODES.slice(0, 2);

        // Fix layout after 10ms
        setTimeout(() => {
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 10);

        // Load more partial data (4 nodes)
        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 4);
        }, 15);

        // Fix style
        setTimeout(() => {
            g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1
        }, 20);

        // Load complete node data
        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: matches Variant 1
        }, 25);

        // Load edges last
        setTimeout(() => {
            g.edgeData = TEST_EDGES; // FINAL: matches Variant 1
        }, 30);

        return g;
    },
};

/**
 * Variant 6: Maximum chaos with multiple wrong updates
 *
 * Tests the most chaotic scenario - properties set in rapid succession
 * with multiple wrong values that get corrected:
 * 1. Edges before nodes (buffered)
 * 2. Wrong layout multiple times
 * 3. Partial nodes multiple times
 * 4. Wrong style multiple times
 * 5. Eventually correct all values
 *
 * Final state MUST match Variant 1 exactly for pixel-perfect comparison.
 */
export const DeterministicVariant6: Story = {
    name: "Variant 6 (Chaotic)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Chaotic sequence of operations
        g.edgeData = TEST_EDGES; // Edges first (will be buffered - no nodes yet!)
        g.layout = "random"; // Wrong layout #1

        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 2); // Partial nodes (2)
        }, 5);

        setTimeout(() => {
            g.layout = "d3"; // Wrong layout #2
        }, 8);

        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 4); // Partial nodes (4)
        }, 10);

        const wrongStyle1 = templateCreator({
            nodeStyle: {
                texture: {color: "#0000FF"}, // Blue - wrong
                shape: {type: "box", size: 10}, // Box - wrong
            },
            edgeStyle: {
                line: {color: "#FF0000", width: 3}, // Red - wrong
            },
        });

        setTimeout(() => {
            g.styleTemplate = wrongStyle1; // Wrong style #1
        }, 15);

        const wrongStyle2 = templateCreator({
            nodeStyle: {
                texture: {color: "#FF00FF"}, // Magenta - wrong
                shape: {type: "cylinder", size: 10}, // Cylinder - wrong
            },
            edgeStyle: {
                line: {color: "#00FF00", width: 3}, // Green - wrong
            },
        });

        setTimeout(() => {
            g.styleTemplate = wrongStyle2; // Wrong style #2
        }, 20);

        setTimeout(() => {
            g.layout = "circular"; // FINAL: matches Variant 1 (correct layout)
        }, 25);

        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: matches Variant 1 (complete nodes)
        }, 30);

        setTimeout(() => {
            g.edgeData = TEST_EDGES; // FINAL: matches Variant 1 (re-set edges to ensure they're added)
        }, 35);

        setTimeout(() => {
            g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1 (correct style)
        }, 40);

        return g;
    },
};

// =============================================================================
// Scenario 4: Cancellation Patterns
// =============================================================================

/**
 * Variant 7: Cancel style loading mid-flight
 *
 * Tests that setting a new style cancels the previous style operation:
 * 1. Set wrong style immediately
 * 2. Set another wrong style after 5ms (should cancel previous)
 * 3. Set correct style after 10ms (should cancel previous and be final)
 * 4. Set data after 15ms
 * 5. Set layout after 20ms
 *
 * Final state MUST match Variant 1 exactly.
 */
export const DeterministicVariant7: Story = {
    name: "Variant 7 (Cancel Style)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        const wrongStyle1 = templateCreator({
            nodeStyle: {
                texture: {color: "#FF0000"}, // Red - will be canceled
                shape: {type: "sphere", size: 10},
            },
            edgeStyle: {
                line: {color: "#666666", width: 3},
            },
        });

        const wrongStyle2 = templateCreator({
            nodeStyle: {
                texture: {color: "#0000FF"}, // Blue - will be canceled
                shape: {type: "sphere", size: 10},
            },
            edgeStyle: {
                line: {color: "#666666", width: 3},
            },
        });

        // Set multiple styles in quick succession - only last should apply
        g.styleTemplate = wrongStyle1; // Will be obsoleted

        setTimeout(() => {
            g.styleTemplate = wrongStyle2; // Will be obsoleted
        }, 5);

        setTimeout(() => {
            g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1
        }, 10);

        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: matches Variant 1
            g.edgeData = TEST_EDGES; // FINAL: matches Variant 1
        }, 15);

        setTimeout(() => {
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 20);

        return g;
    },
};

/**
 * Variant 8: Cancel data loading and set new data
 *
 * Tests that setting new data cancels previous data operations:
 * 1. Load partial data immediately
 * 2. Load different partial data after 5ms (should cancel/replace)
 * 3. Load correct complete data after 10ms (final)
 * 4. Set style and layout after data is correct
 *
 * Final state MUST match Variant 1 exactly.
 */
export const DeterministicVariant8: Story = {
    name: "Variant 8 (Cancel Data)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Load wrong partial data
        g.nodeData = TEST_NODES.slice(0, 2); // 2 nodes - will be replaced
        g.edgeData = TEST_EDGES.slice(0, 1); // 1 edge - will be replaced

        // Replace with different partial data
        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 4); // 4 nodes - will be replaced
            g.edgeData = TEST_EDGES.slice(0, 3); // 3 edges - will be replaced
        }, 5);

        // Load correct complete data
        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: matches Variant 1
            g.edgeData = TEST_EDGES; // FINAL: matches Variant 1
        }, 10);

        setTimeout(() => {
            g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 15);

        return g;
    },
};

/**
 * Variant 9: Cancel force layout mid-execution
 *
 * Tests that setting a new layout cancels the previous layout:
 * 1. Set force layout (ngraph - will run for a while)
 * 2. Set different force layout after 5ms (should cancel previous)
 * 3. Set final circular layout after 10ms (should cancel and be final)
 * 4. Data and style set after layouts
 *
 * Final state MUST match Variant 1 exactly.
 */
export const DeterministicVariant9: Story = {
    name: "Variant 9 (Cancel Layout)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Set multiple layouts in quick succession - only last should complete
        g.layout = "ngraph"; // Force layout #1 - will be obsoleted

        setTimeout(() => {
            g.layout = "d3"; // Force layout #2 - will be obsoleted
        }, 5);

        setTimeout(() => {
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 10);

        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: matches Variant 1
            g.edgeData = TEST_EDGES; // FINAL: matches Variant 1
            g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1
        }, 15);

        return g;
    },
};

// =============================================================================
// Scenario 5: Algorithm Integration
// =============================================================================

/**
 * Variant 10: Algorithm + Style, then load data
 *
 * Tests setting algorithm and style before data exists:
 * 1. Set style with algorithm configuration
 * 2. Set layout
 * 3. Load data (algorithm should run after data loads)
 *
 * Final state MUST match Variant 1 exactly.
 */
export const DeterministicVariant10: Story = {
    name: "Variant 10 (Algorithm Before Data)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Set style with algorithms configured (but no data yet)
        const styleWithAlgorithm = {
            ... STYLE_TEMPLATE,
            data: {
                ... STYLE_TEMPLATE.data,
                // Algorithm configured but won't run until data exists
                algorithms: ["pagerank"],
            },
        };

        g.styleTemplate = styleWithAlgorithm;
        g.layout = "circular"; // FINAL: matches Variant 1

        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: matches Variant 1
            g.edgeData = TEST_EDGES; // FINAL: matches Variant 1
        }, 10);

        return g;
    },
};

/**
 * Variant 11: Layout before data
 *
 * Tests that layout can be set before any data exists:
 * 1. Set layout first (no data to layout yet)
 * 2. Set style
 * 3. Load data (layout should apply to data when it arrives)
 *
 * Final state MUST match Variant 1 exactly.
 */
export const DeterministicVariant11: Story = {
    name: "Variant 11 (Layout Before Data)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Set layout before any data exists
        g.layout = "circular"; // FINAL: matches Variant 1

        setTimeout(() => {
            g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1
        }, 5);

        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: matches Variant 1
            g.edgeData = TEST_EDGES; // FINAL: matches Variant 1
        }, 10);

        return g;
    },
};

// =============================================================================
// Scenario 6: Manual Node/Edge Addition
// =============================================================================

/**
 * Variant 12: Set algorithm, style, layout, then manually add nodes/edges
 *
 * Tests that manually adding nodes works after configuration:
 * 1. Set style, layout, algorithm configuration
 * 2. Manually add nodes one by one
 * 3. Manually add edges one by one
 *
 * Final state MUST match Variant 1 exactly.
 */
export const DeterministicVariant12: Story = {
    name: "Variant 12 (Config Then Manual Add)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Set all configuration first
        g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1
        g.layout = "circular"; // FINAL: matches Variant 1

        // Manually add nodes incrementally
        setTimeout(() => {
            g.nodeData = [TEST_NODES[0]]; // Add first node
        }, 5);

        setTimeout(() => {
            g.nodeData = [TEST_NODES[0], TEST_NODES[1]]; // Add second
        }, 10);

        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 3); // Add third
        }, 15);

        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 4); // Add fourth
        }, 20);

        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 5); // Add fifth
        }, 25);

        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: all nodes
        }, 30);

        // Add edges incrementally
        setTimeout(() => {
            g.edgeData = [TEST_EDGES[0]]; // Add first edge
        }, 35);

        setTimeout(() => {
            g.edgeData = TEST_EDGES.slice(0, 3); // Add more edges
        }, 40);

        setTimeout(() => {
            g.edgeData = TEST_EDGES; // FINAL: all edges
        }, 45);

        return g;
    },
};

/**
 * Variant 13: Add some nodes, then set config, then add more nodes
 *
 * Tests interleaved data and configuration updates:
 * 1. Add initial nodes/edges
 * 2. Set algorithm, style, layout
 * 3. Add more nodes/edges
 *
 * Final state MUST match Variant 1 exactly.
 */
export const DeterministicVariant13: Story = {
    name: "Variant 13 (Interleaved Manual Add)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Add some initial data
        g.nodeData = TEST_NODES.slice(0, 2); // First 2 nodes
        g.edgeData = [TEST_EDGES[0]]; // First edge

        setTimeout(() => {
            // Set configuration in the middle
            g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 10);

        setTimeout(() => {
            // Add more nodes
            g.nodeData = TEST_NODES.slice(0, 4); // 4 nodes total
            g.edgeData = TEST_EDGES.slice(0, 3); // 3 edges total
        }, 20);

        setTimeout(() => {
            // Complete the data
            g.nodeData = TEST_NODES; // FINAL: all nodes
            g.edgeData = TEST_EDGES; // FINAL: all edges
        }, 30);

        return g;
    },
};

// =============================================================================
// Scenario 7: Configuration Replacement
// =============================================================================

/**
 * Variant 14: Load data, style, layout; then set different style
 *
 * Tests that style can be completely replaced after initial setup:
 * 1. Load complete data, wrong style, correct layout
 * 2. Replace with correct style
 *
 * Final state MUST match Variant 1 exactly.
 */
export const DeterministicVariant14: Story = {
    name: "Variant 14 (Replace Style)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        const wrongStyle = templateCreator({
            nodeStyle: {
                texture: {color: "#FF0000"}, // Red - will be replaced
                shape: {type: "box", size: 10}, // Box - will be replaced
            },
            edgeStyle: {
                line: {color: "#0000FF", width: 3}, // Blue - will be replaced
            },
        });

        // Initial complete setup with wrong style
        g.nodeData = TEST_NODES;
        g.edgeData = TEST_EDGES;
        g.styleTemplate = wrongStyle;
        g.layout = "circular"; // FINAL: matches Variant 1

        // Replace style after everything is loaded
        setTimeout(() => {
            g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1
        }, 20);

        return g;
    },
};

/**
 * Variant 15: Load data, style, layout; then set different layout
 *
 * Tests that layout can be completely replaced after initial setup:
 * 1. Load complete data, correct style, wrong layout
 * 2. Replace with correct layout
 *
 * Final state MUST match Variant 1 exactly.
 */
export const DeterministicVariant15: Story = {
    name: "Variant 15 (Replace Layout)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Initial complete setup with wrong layout
        g.nodeData = TEST_NODES;
        g.edgeData = TEST_EDGES;
        g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1
        g.layout = "random"; // Wrong layout

        // Replace layout after everything is loaded
        setTimeout(() => {
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 20);

        return g;
    },
};

/**
 * Variant 16: Load data, style, layout; then set different layout AND style
 *
 * Tests that both layout and style can be replaced simultaneously:
 * 1. Load complete data, wrong style, wrong layout
 * 2. Replace both style and layout
 *
 * Final state MUST match Variant 1 exactly.
 */
export const DeterministicVariant16: Story = {
    name: "Variant 16 (Replace Layout+Style)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        const wrongStyle = templateCreator({
            nodeStyle: {
                texture: {color: "#0000FF"}, // Blue - will be replaced
                shape: {type: "cylinder", size: 10}, // Cylinder - will be replaced
            },
            edgeStyle: {
                line: {color: "#FF00FF", width: 3}, // Magenta - will be replaced
            },
        });

        // Initial complete setup with wrong style and layout
        g.nodeData = TEST_NODES;
        g.edgeData = TEST_EDGES;
        g.styleTemplate = wrongStyle;
        g.layout = "ngraph"; // Wrong layout (force-directed)

        // Replace both after everything is loaded
        setTimeout(() => {
            g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 30);

        return g;
    },
};

// =============================================================================
// Scenario 8: Extreme Edge Cases
// =============================================================================

/**
 * Variant 17: Interleaved node and edge additions
 *
 * Tests that nodes and edges can be added in completely interleaved fashion:
 * 1. Add node 1
 * 2. Add edge 1
 * 3. Add nodes 2-3
 * 4. Add edges 2-3
 * 5. Add remaining nodes
 * 6. Add remaining edges
 * 7. Set style and layout last
 *
 * Final state MUST match Variant 1 exactly.
 */
export const DeterministicVariant17: Story = {
    name: "Variant 17 (Interleaved Add)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Interleave nodes and edges in chaotic order
        g.nodeData = [TEST_NODES[0]]; // Node 1

        setTimeout(() => {
            g.edgeData = [TEST_EDGES[0]]; // Edge 1
        }, 5);

        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 3); // Nodes 1-3
        }, 10);

        setTimeout(() => {
            g.edgeData = TEST_EDGES.slice(0, 3); // Edges 1-3
        }, 15);

        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: all nodes
        }, 20);

        setTimeout(() => {
            g.edgeData = TEST_EDGES; // FINAL: all edges
        }, 25);

        setTimeout(() => {
            g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 30);

        return g;
    },
};

/**
 * Variant 18: Multiple rapid layout changes
 *
 * Tests that rapid layout switching settles to final layout:
 * 1. Set data and style correctly
 * 2. Rapidly change layouts multiple times
 * 3. Final layout should be circular
 *
 * Final state MUST match Variant 1 exactly.
 */
export const DeterministicVariant18: Story = {
    name: "Variant 18 (Rapid Layout Switch)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Set data and style first
        g.nodeData = TEST_NODES;
        g.edgeData = TEST_EDGES;
        g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1

        // Rapidly switch layouts
        g.layout = "random";

        setTimeout(() => {
            g.layout = "ngraph";
        }, 2);

        setTimeout(() => {
            g.layout = "random";
        }, 4);

        setTimeout(() => {
            g.layout = "d3";
        }, 6);

        setTimeout(() => {
            g.layout = "forceatlas2";
        }, 8);

        setTimeout(() => {
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 10);

        return g;
    },
};

/**
 * Variant 19: Empty start with everything delayed
 *
 * Tests that graph can start completely empty:
 * 1. Create empty graph element
 * 2. Wait, then set layout
 * 3. Wait, then set style
 * 4. Wait, then add data
 *
 * Final state MUST match Variant 1 exactly.
 */
export const DeterministicVariant19: Story = {
    name: "Variant 19 (Empty Start)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Start completely empty, add everything with delays
        setTimeout(() => {
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 10);

        setTimeout(() => {
            g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1
        }, 20);

        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: matches Variant 1
        }, 30);

        setTimeout(() => {
            g.edgeData = TEST_EDGES; // FINAL: matches Variant 1
        }, 40);

        return g;
    },
};

/**
 * Variant 20: Configuration first, long-delayed data
 *
 * Tests that configuration persists while waiting for data:
 * 1. Set all configuration immediately (style, layout)
 * 2. Wait a long time
 * 3. Finally load data
 *
 * Final state MUST match Variant 1 exactly.
 */
export const DeterministicVariant20: Story = {
    name: "Variant 20 (Config Then Long Wait)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Set all configuration immediately
        g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1
        g.layout = "circular"; // FINAL: matches Variant 1

        // Wait a long time before loading data
        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: matches Variant 1
            g.edgeData = TEST_EDGES; // FINAL: matches Variant 1
        }, 50);

        return g;
    },
};

// =============================================================================
// Scenario 9: Algorithm Re-execution After Data Changes
// =============================================================================

/**
 * Variant 21: Load data → run algorithm → add more data → verify algorithm re-runs
 *
 * Tests that algorithms automatically re-run when new data is added:
 * 1. Load initial data
 * 2. Set style with algorithm configured
 * 3. Add more data incrementally
 * 4. Algorithm should re-run automatically after each data addition
 *
 * This verifies the algorithm dependency system works correctly.
 */
export const DeterministicVariant21: Story = {
    name: "Variant 21 (Algorithm Re-run on Data Add)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Set layout
        g.layout = "circular"; // FINAL: matches Variant 1

        // Configure algorithm via style
        const styleWithAlgorithm = {
            ... STYLE_TEMPLATE,
            data: {
                ... STYLE_TEMPLATE.data,
                algorithms: ["pagerank"], // Algorithm will run on initial data
            },
        };

        // Load initial data (3 nodes)
        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 3);
            g.edgeData = TEST_EDGES.slice(0, 2);
        }, 10);

        setTimeout(() => {
            g.styleTemplate = styleWithAlgorithm;
        }, 15);

        // Add more data - algorithm should automatically re-run
        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 5); // Add 2 more nodes
            g.edgeData = TEST_EDGES.slice(0, 4); // Add 2 more edges
        }, 20);

        // Add final data - algorithm should re-run again
        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: all nodes
            g.edgeData = TEST_EDGES; // FINAL: all edges
        }, 30);

        return g;
    },
};

/**
 * Variant 22: Configure algorithm → load data → replace data → verify algorithm re-runs
 *
 * Tests that algorithms re-run when data is completely replaced:
 * 1. Configure algorithm before any data exists
 * 2. Load initial data (algorithm runs)
 * 3. Completely replace data (algorithm should re-run)
 *
 * This tests that algorithm operations are properly queued based on data changes.
 */
export const DeterministicVariant22: Story = {
    name: "Variant 22 (Algorithm Re-run on Data Replace)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Configure algorithm and layout before data
        const styleWithAlgorithm = {
            ... STYLE_TEMPLATE,
            data: {
                ... STYLE_TEMPLATE.data,
                algorithms: ["pagerank"],
            },
        };

        g.styleTemplate = styleWithAlgorithm;
        g.layout = "circular"; // FINAL: matches Variant 1

        // Load initial data
        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 3); // Partial data
            g.edgeData = TEST_EDGES.slice(0, 2);
        }, 10);

        // Replace with different data (algorithm should re-run)
        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 4); // Different partial data
            g.edgeData = TEST_EDGES.slice(0, 3);
        }, 20);

        // Replace with final complete data (algorithm should re-run)
        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: all nodes
            g.edgeData = TEST_EDGES; // FINAL: all edges
        }, 30);

        return g;
    },
};

/**
 * Variant 23: Multiple algorithms with incremental data
 *
 * Tests that multiple algorithms all re-run when data changes:
 * 1. Configure multiple algorithms
 * 2. Add data incrementally
 * 3. Each data addition should trigger re-runs of ALL algorithms
 *
 * Final state MUST match Variant 1 exactly.
 */
export const DeterministicVariant23: Story = {
    name: "Variant 23 (Multiple Algorithms Re-run)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Configure multiple algorithms
        const styleWithAlgorithms = {
            ... STYLE_TEMPLATE,
            data: {
                ... STYLE_TEMPLATE.data,
                algorithms: ["pagerank", "betweenness"], // Multiple algorithms
            },
        };

        g.styleTemplate = styleWithAlgorithms;
        g.layout = "circular"; // FINAL: matches Variant 1

        // Add data incrementally - algorithms should re-run each time
        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 2);
            g.edgeData = [TEST_EDGES[0]];
        }, 10);

        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 4);
            g.edgeData = TEST_EDGES.slice(0, 3);
        }, 20);

        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: all nodes
            g.edgeData = TEST_EDGES; // FINAL: all edges
        }, 30);

        return g;
    },
};

// =============================================================================
// Scenario 10: Camera Mode (2D/3D) with Style Updates
// =============================================================================

/**
 * Variant 24: Set 2D camera → load data → change styles → verify 2D rendering
 *
 * Tests that style updates work correctly in 2D camera mode:
 * 1. Configure 2D camera via styleTemplate
 * 2. Load data
 * 3. Update style properties
 * 4. Everything should render correctly in 2D
 *
 * Final state MUST match Variant 1 exactly (but in 2D).
 */
export const DeterministicVariant24: Story = {
    name: "Variant 24 (2D Camera + Style Updates)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Configure 2D camera from the start
        const style2D = templateCreator({
            ... BASE_STYLE_PROPS,
            graph: {
                twoD: true, // 2D camera mode
            },
        });

        g.styleTemplate = style2D;

        // Load data
        setTimeout(() => {
            g.nodeData = TEST_NODES;
            g.edgeData = TEST_EDGES;
        }, 10);

        // Change layout
        setTimeout(() => {
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 20);

        // Update style properties (while in 2D mode)
        setTimeout(() => {
            const updatedStyle = templateCreator({
                ... BASE_STYLE_PROPS,
                graph: {
                    twoD: true,
                },
            });
            g.styleTemplate = updatedStyle;
        }, 30);

        return g;
    },
};

/**
 * Variant 25: Load data in 3D → switch to 2D → change styles
 *
 * Tests that camera mode switching works with style updates:
 * 1. Start with default 3D camera
 * 2. Load data
 * 3. Switch to 2D camera
 * 4. Update styles
 * 5. Should render correctly in 2D mode
 *
 * Final state should be correctly rendered in 2D.
 */
export const DeterministicVariant25: Story = {
    name: "Variant 25 (3D → 2D + Style Update)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Start in 3D (default)
        g.nodeData = TEST_NODES;
        g.edgeData = TEST_EDGES;
        g.layout = "circular"; // FINAL: matches Variant 1

        // Set initial 3D style
        setTimeout(() => {
            g.styleTemplate = STYLE_TEMPLATE;
        }, 10);

        // Switch to 2D camera
        setTimeout(() => {
            const style2D = templateCreator({
                ... BASE_STYLE_PROPS,
                graph: {
                    twoD: true, // Switch to 2D
                },
            });
            g.styleTemplate = style2D;
        }, 20);

        // Update styles in 2D mode
        setTimeout(() => {
            const updatedStyle2D = templateCreator({
                ... BASE_STYLE_PROPS,
                graph: {
                    twoD: true,
                },
            });
            g.styleTemplate = updatedStyle2D;
        }, 30);

        return g;
    },
};

/**
 * Variant 26: Rapid camera mode switching with style updates
 *
 * Tests that rapid camera switching doesn't break style updates:
 * 1. Load data
 * 2. Rapidly switch between 2D and 3D multiple times
 * 3. Update styles during switches
 * 4. Final state should be correct
 *
 * This tests the camera dependency system under stress.
 */
export const DeterministicVariant26: Story = {
    name: "Variant 26 (Rapid Camera Switch)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Load data first
        g.nodeData = TEST_NODES;
        g.edgeData = TEST_EDGES;
        g.layout = "circular"; // FINAL: matches Variant 1

        // Initial 3D style
        g.styleTemplate = STYLE_TEMPLATE;

        // Switch to 2D
        setTimeout(() => {
            const style2D = templateCreator({
                ... BASE_STYLE_PROPS,
                graph: {
                    twoD: true,
                },
            });
            g.styleTemplate = style2D;
        }, 5);

        // Switch back to 3D
        setTimeout(() => {
            g.styleTemplate = STYLE_TEMPLATE;
        }, 10);

        // Switch to 2D again
        setTimeout(() => {
            const style2D = templateCreator({
                ... BASE_STYLE_PROPS,
                graph: {
                    twoD: true,
                },
            });
            g.styleTemplate = style2D;
        }, 15);

        // Final: back to 3D (to match Variant 1)
        setTimeout(() => {
            g.styleTemplate = STYLE_TEMPLATE;
        }, 20);

        return g;
    },
};

// =============================================================================
// Scenario 11: Algorithm + Camera Combinations
// =============================================================================

/**
 * Variant 27: Run algorithm in 3D → switch to 2D → verify results visible
 *
 * Tests that algorithm results persist when switching camera modes:
 * 1. Load data in 3D
 * 2. Run algorithm
 * 3. Switch to 2D camera
 * 4. Algorithm results should still be visible
 */
export const DeterministicVariant27: Story = {
    name: "Variant 27 (Algorithm 3D → 2D)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Load data in 3D with algorithm
        const styleWithAlgorithm = templateCreator({
            ... BASE_STYLE_PROPS,
            data: {
                algorithms: ["pagerank"],
            },
        });

        g.nodeData = TEST_NODES;
        g.edgeData = TEST_EDGES;
        g.styleTemplate = styleWithAlgorithm;
        g.layout = "circular"; // FINAL: matches Variant 1

        // Switch to 2D camera after algorithm runs
        setTimeout(() => {
            const style2D = templateCreator({
                ... BASE_STYLE_PROPS,
                graph: {
                    twoD: true,
                },
                data: {
                    algorithms: ["pagerank"],
                },
            });
            g.styleTemplate = style2D;
        }, 20);

        // Switch back to 3D (to match Variant 1)
        setTimeout(() => {
            g.styleTemplate = styleWithAlgorithm;
        }, 30);

        return g;
    },
};

/**
 * Variant 28: Set 2D camera → load data → run algorithms
 *
 * Tests that algorithms work correctly when camera is already in 2D mode:
 * 1. Configure 2D camera first
 * 2. Load data
 * 3. Run algorithms
 * 4. Should work correctly in 2D
 */
export const DeterministicVariant28: Story = {
    name: "Variant 28 (2D Camera + Algorithm)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Configure 2D camera with algorithm
        const style2DWithAlgorithm = templateCreator({
            ... BASE_STYLE_PROPS,
            graph: {
                twoD: true,
            },
            data: {
                algorithms: ["pagerank"],
            },
        });

        g.styleTemplate = style2DWithAlgorithm;
        g.layout = "circular"; // FINAL: matches Variant 1

        // Load data (algorithm will run in 2D mode)
        setTimeout(() => {
            g.nodeData = TEST_NODES;
            g.edgeData = TEST_EDGES;
        }, 10);

        // Switch to 3D (to match Variant 1)
        setTimeout(() => {
            const style3DWithAlgorithm = templateCreator({
                ... BASE_STYLE_PROPS,
                data: {
                    algorithms: ["pagerank"],
                },
            });
            g.styleTemplate = style3DWithAlgorithm;
        }, 30);

        return g;
    },
};

/**
 * Variant 29: Algorithm + layout + camera all changing
 *
 * Tests that algorithm, layout, and camera can all change together:
 * 1. Load data
 * 2. Change layout
 * 3. Change camera mode
 * 4. Run algorithm
 * 5. All should coordinate correctly
 */
export const DeterministicVariant29: Story = {
    name: "Variant 29 (Algorithm + Layout + Camera)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Load data first
        g.nodeData = TEST_NODES;
        g.edgeData = TEST_EDGES;

        // Wrong layout initially
        g.layout = "random";

        // Wrong camera mode initially (2D)
        setTimeout(() => {
            const style2D = templateCreator({
                ... BASE_STYLE_PROPS,
                graph: {
                    twoD: true,
                },
            });
            g.styleTemplate = style2D;
        }, 10);

        // Fix layout
        setTimeout(() => {
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 20);

        // Add algorithm
        setTimeout(() => {
            const style2DWithAlgorithm = templateCreator({
                ... BASE_STYLE_PROPS,
                graph: {
                    twoD: true,
                },
                data: {
                    algorithms: ["pagerank"],
                },
            });
            g.styleTemplate = style2DWithAlgorithm;
        }, 30);

        // Fix camera to 3D (to match Variant 1)
        setTimeout(() => {
            const style3DWithAlgorithm = templateCreator({
                ... BASE_STYLE_PROPS,
                data: {
                    algorithms: ["pagerank"],
                },
            });
            g.styleTemplate = style3DWithAlgorithm;
        }, 40);

        return g;
    },
};

// =============================================================================
// Scenario 12: Complex Multi-Property Combinations
// =============================================================================

/**
 * Variant 30: Data → Algorithm → Layout → Camera → Style (all delayed)
 *
 * Tests a realistic complex scenario with all properties changing:
 * 1. Load initial data
 * 2. Run algorithm after delay
 * 3. Change layout after delay
 * 4. Switch camera mode after delay
 * 5. Update style after delay
 * 6. All should work correctly
 */
export const DeterministicVariant30: Story = {
    name: "Variant 30 (Complex Delayed Updates)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // 1. Load data
        g.nodeData = TEST_NODES;
        g.edgeData = TEST_EDGES;

        // 2. Run algorithm
        setTimeout(() => {
            const styleWithAlgorithm = templateCreator({
                ... BASE_STYLE_PROPS,
                data: {
                    algorithms: ["pagerank"],
                },
            });
            g.styleTemplate = styleWithAlgorithm;
        }, 10);

        // 3. Change layout
        setTimeout(() => {
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 20);

        // 4. Switch to 2D camera
        setTimeout(() => {
            const style2DWithAlgorithm = templateCreator({
                ... BASE_STYLE_PROPS,
                graph: {
                    twoD: true,
                },
                data: {
                    algorithms: ["pagerank"],
                },
            });
            g.styleTemplate = style2DWithAlgorithm;
        }, 30);

        // 5. Update style and switch back to 3D (to match Variant 1)
        setTimeout(() => {
            const finalStyle = templateCreator({
                ... BASE_STYLE_PROPS,
                data: {
                    algorithms: ["pagerank"],
                },
            });
            g.styleTemplate = finalStyle;
        }, 40);

        return g;
    },
};

/**
 * Variant 31: Interleaved data/algorithm/camera/style updates
 *
 * Tests the most complex realistic scenario:
 * 1. Add some data
 * 2. Run algorithm
 * 3. Add more data (algorithm should re-run)
 * 4. Switch camera mode
 * 5. Update style
 * 6. Add final data (algorithm should re-run again)
 */
export const DeterministicVariant31: Story = {
    name: "Variant 31 (Interleaved Complex)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // 1. Add initial data
        g.nodeData = TEST_NODES.slice(0, 3);
        g.edgeData = TEST_EDGES.slice(0, 2);

        // 2. Run algorithm on initial data
        setTimeout(() => {
            const styleWithAlgorithm = templateCreator({
                ... BASE_STYLE_PROPS,
                data: {
                    algorithms: ["pagerank"],
                },
            });
            g.styleTemplate = styleWithAlgorithm;
        }, 10);

        // 3. Add more data (algorithm should re-run)
        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 5);
            g.edgeData = TEST_EDGES.slice(0, 4);
        }, 20);

        // 4. Switch to 2D camera
        setTimeout(() => {
            const style2DWithAlgorithm = templateCreator({
                ... BASE_STYLE_PROPS,
                graph: {
                    twoD: true,
                },
                data: {
                    algorithms: ["pagerank"],
                },
            });
            g.styleTemplate = style2DWithAlgorithm;
        }, 30);

        // 5. Update style (still in 2D)
        setTimeout(() => {
            const updatedStyle2D = templateCreator({
                ... BASE_STYLE_PROPS,
                graph: {
                    twoD: true,
                },
                data: {
                    algorithms: ["pagerank"],
                },
            });
            g.styleTemplate = updatedStyle2D;
        }, 40);

        // 6. Add final data (algorithm should re-run) and set layout
        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: all nodes
            g.edgeData = TEST_EDGES; // FINAL: all edges
        }, 50);

        setTimeout(() => {
            g.layout = "circular"; // FINAL: matches Variant 1
        }, 60);

        // Switch back to 3D (to match Variant 1)
        setTimeout(() => {
            const finalStyle = templateCreator({
                ... BASE_STYLE_PROPS,
                data: {
                    algorithms: ["pagerank"],
                },
            });
            g.styleTemplate = finalStyle;
        }, 70);

        return g;
    },
};

/**
 * Variant 32: Manual node addition → algorithm → more manual additions
 *
 * Tests that algorithms re-run with manual incremental node additions:
 * 1. Manually add nodes one by one
 * 2. Configure algorithm
 * 3. Continue adding more nodes manually
 * 4. Algorithm should run after each addition
 */
export const DeterministicVariant32: Story = {
    name: "Variant 32 (Manual Add + Algorithm)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Set layout first
        g.layout = "circular"; // FINAL: matches Variant 1

        // Manually add first node
        g.nodeData = [TEST_NODES[0]];

        // Configure algorithm
        setTimeout(() => {
            const styleWithAlgorithm = {
                ... STYLE_TEMPLATE,
                data: {
                    ... STYLE_TEMPLATE.data,
                    algorithms: ["pagerank"],
                },
            };
            g.styleTemplate = styleWithAlgorithm;
        }, 5);

        // Continue adding nodes manually (algorithm should re-run each time)
        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 2);
        }, 10);

        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 3);
            g.edgeData = [TEST_EDGES[0]];
        }, 15);

        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 4);
            g.edgeData = TEST_EDGES.slice(0, 2);
        }, 20);

        setTimeout(() => {
            g.nodeData = TEST_NODES.slice(0, 5);
            g.edgeData = TEST_EDGES.slice(0, 4);
        }, 25);

        setTimeout(() => {
            g.nodeData = TEST_NODES; // FINAL: all nodes
            g.edgeData = TEST_EDGES; // FINAL: all edges
        }, 30);

        return g;
    },
};

/**
 * Variant 33: 2D layout + 2D camera + algorithm + style updates
 *
 * Tests everything working together in 2D mode:
 * 1. Set 2D layout (circular can work in 2D)
 * 2. Set 2D camera
 * 3. Load data
 * 4. Run algorithm
 * 5. Update styles
 * 6. Everything should render correctly in 2D
 */
export const DeterministicVariant33: Story = {
    name: "Variant 33 (Full 2D Setup)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Set 2D layout
        g.layout = "circular"; // Works in 2D

        // Set 2D camera with algorithm
        const style2DWithAlgorithm = {
            ... STYLE_TEMPLATE,
            graph: {
                ... STYLE_TEMPLATE.graph,
                twoD: true,
            },
            data: {
                ... STYLE_TEMPLATE.data,
                algorithms: ["pagerank"],
            },
        };

        g.styleTemplate = style2DWithAlgorithm;

        // Load data
        setTimeout(() => {
            g.nodeData = TEST_NODES;
            g.edgeData = TEST_EDGES;
        }, 10);

        // Update styles (still in 2D)
        setTimeout(() => {
            const updatedStyle2D = {
                ... STYLE_TEMPLATE,
                graph: {
                    ... STYLE_TEMPLATE.graph,
                    twoD: true,
                },
                data: {
                    ... STYLE_TEMPLATE.data,
                    algorithms: ["pagerank"],
                },
            };
            g.styleTemplate = updatedStyle2D;
        }, 20);

        // Switch to 3D to match Variant 1
        setTimeout(() => {
            const finalStyle = {
                ... STYLE_TEMPLATE,
                data: {
                    ... STYLE_TEMPLATE.data,
                    algorithms: ["pagerank"],
                },
            };
            g.styleTemplate = finalStyle;
        }, 30);

        return g;
    },
};

/**
 * Variant 34: Cancel algorithm mid-run → change camera → run new algorithm
 *
 * Tests that camera changes properly coordinate with algorithm cancellation:
 * 1. Start expensive algorithm
 * 2. Switch camera mode (should trigger camera update)
 * 3. Cancel algorithm
 * 4. Run different algorithm
 * 5. Should work correctly
 */
export const DeterministicVariant34: Story = {
    name: "Variant 34 (Cancel Algorithm + Camera)",
    render: () => {
        const g = document.createElement("graphty-element") as Graphty;

        // Load data
        g.nodeData = TEST_NODES;
        g.edgeData = TEST_EDGES;
        g.layout = "circular"; // FINAL: matches Variant 1

        // Start with betweenness (can be expensive)
        const styleWithBetweenness = {
            ... STYLE_TEMPLATE,
            data: {
                ... STYLE_TEMPLATE.data,
                algorithms: ["betweenness"],
            },
        };

        g.styleTemplate = styleWithBetweenness;

        // Switch camera mode
        setTimeout(() => {
            const style2D = {
                ... STYLE_TEMPLATE,
                graph: {
                    ... STYLE_TEMPLATE.graph,
                    twoD: true,
                },
                data: {
                    ... STYLE_TEMPLATE.data,
                    algorithms: ["betweenness"],
                },
            };
            g.styleTemplate = style2D;
        }, 5);

        // Cancel betweenness and run pagerank instead
        setTimeout(() => {
            const style2DWithPagerank = {
                ... STYLE_TEMPLATE,
                graph: {
                    ... STYLE_TEMPLATE.graph,
                    twoD: true,
                },
                data: {
                    ... STYLE_TEMPLATE.data,
                    algorithms: ["pagerank"], // Different algorithm
                },
            };
            g.styleTemplate = style2DWithPagerank;
        }, 10);

        // Switch back to 3D (to match Variant 1)
        setTimeout(() => {
            const finalStyle = {
                ... STYLE_TEMPLATE,
                data: {
                    ... STYLE_TEMPLATE.data,
                    algorithms: ["pagerank"],
                },
            };
            g.styleTemplate = finalStyle;
        }, 20);

        return g;
    },
};
