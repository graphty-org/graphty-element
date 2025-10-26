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
            //g.styleTemplate = STYLE_TEMPLATE; // FINAL: matches Variant 1
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
            g.layout = "force"; // Wrong layout #2
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
            ...STYLE_TEMPLATE,
            data: {
                algorithms: ["pagerank"], // Algorithm configured but won't run until data exists
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
            g.layout = "grid";
        }, 4);

        setTimeout(() => {
            g.layout = "d3";
        }, 6);

        setTimeout(() => {
            g.layout = "force";
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
