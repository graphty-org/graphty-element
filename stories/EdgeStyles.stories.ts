import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, renderFn, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Styles/Edge",
    component: "graphty-element",
    // XXX: https://github.com/storybookjs/storybook/issues/23343
    render: renderFn,
    decorators: [eventWaitingDecorator],
    argTypes: {
        edgeLineWidth: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Line"}, name: "line.width"},
        edgeLineColor: {control: "color", table: {category: "Line"}, name: "line.color"},
        edgeLineOpacity: {control: {type: "range", min: 0, max: 1, step: 0.1}, table: {category: "Line"}, name: "line.opacity"},
        arrowSize: {control: {type: "range", min: 0.1, max: 5, step: 0.1}, table: {category: "Arrow"}, name: "arrowHead.size"},
        arrowColor: {control: "color", table: {category: "Arrow"}, name: "arrowHead.color"},
        arrowOpacity: {control: {type: "range", min: 0, max: 1, step: 0.1}, table: {category: "Arrow"}, name: "arrowHead.opacity"},
    },
    parameters: {
        // controls: {exclude: /^(#|_)/},
        controls: {
            include: [
                "line.width",
            ],
        },
        chromatic: {
            delay: 500, // Allow Babylon.js render frames to complete (30 frames at 60fps)
        },
    },
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {
                texture: {
                    color: {
                        colorType: "solid",
                        value: "#5A67D8",
                    },
                },
            },
        }),
        nodeData: [
            {id: "A", position: {x: -3, y: 0, z: 0}},
            {id: "B", position: {x: 3, y: 0, z: 0}},
        ],
        edgeData: [
            {src: "A", dst: "B"},
        ],
        layout: "fixed",
        layoutConfig: {},
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const Default: Story = {};

export const Width: Story = {
    args: {
        styleTemplate: templateCreator({edgeStyle: {line: {width: 2}}}),
    },
    parameters: {
        controls: {
            include: ["line.width"],
        },
    },
};

export const NormalArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "normal", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
};

export const ArrowSize: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "normal", size: 2.0, color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size"],
        },
    },
};

export const ArrowOpacity: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "normal", opacity: 0.5, color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.opacity"],
        },
    },
};

export const ArrowColor: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "normal", color: "#FF0000"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.color", "line.color"],
        },
    },
};

export const LineOpacity: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "normal", color: "darkgrey"},
                line: {opacity: 0.5, color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["line.opacity"],
        },
    },
};

export const CombinedOpacity: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "normal", opacity: 0.3, color: "darkgrey"},
                line: {opacity: 0.3, color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.opacity", "line.opacity"],
        },
    },
};

export const InvertedArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "inverted", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const OpenDotArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "open-dot", color: "darkgrey", size: 1.0},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const SphereDotArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "sphere-dot", color: "darkgrey", size: 4.0},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const DotArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "dot", color: "darkgrey", size: 1.0},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const DiamondArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "diamond", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const BoxArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "box", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const OpenDiamondArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "open-diamond", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const TeeArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "tee", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const OpenArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "open-normal", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const HalfOpenArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "half-open", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const VeeArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "vee", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const CrowArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "crow", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

// 2D Camera Tests - Solid Lines
// This story demonstrates the line width bug in 2D orthographic camera mode
// Before fix: Lines appear ~10x too wide
// After fix: Lines should match 3D line width (4.5 pixels)
export const TwoDSolidLines: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["line.width"],
        },
    },
};

// 2D Camera Tests - Patterned Lines
// This story verifies patterned lines work correctly in 2D (no bug expected)
// Patterned lines use FilledArrowRenderer with world-space sizing
export const TwoDPatternedLines: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                line: {type: "diamond", color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["line.width"],
        },
    },
};

// 2D Arrow Head Stories
// These stories verify that all arrow head types render correctly in 2D orthographic mode
// All arrows should have uniform scaling and match 3D arrow dimensions

export const TwoDNormalArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                arrowHead: {type: "normal", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const TwoDInvertedArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                arrowHead: {type: "inverted", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const TwoDDiamondArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                arrowHead: {type: "diamond", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const TwoDBoxArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                arrowHead: {type: "box", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const TwoDDotArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                arrowHead: {type: "dot", color: "darkgrey", size: 1.0},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const TwoDVeeArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                arrowHead: {type: "vee", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const TwoDTeeArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                arrowHead: {type: "tee", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const TwoDCrowArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                arrowHead: {type: "crow", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const TwoDHalfOpenArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                arrowHead: {type: "half-open", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const TwoDOpenArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                arrowHead: {type: "open-normal", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const TwoDOpenDiamondArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                arrowHead: {type: "open-diamond", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const TwoDOpenDotArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                arrowHead: {type: "open-dot", color: "darkgrey", size: 1.0},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

export const TwoDSphereDotArrowHead: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                arrowHead: {type: "sphere-dot", color: "darkgrey", size: 1.0},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color"],
        },
    },
};

// Comprehensive 2D Arrow Type Showcase
// This story displays all arrow types in a grid layout for visual comparison
export const TwoDAllArrows: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
        }),
        nodeData: [
            // Row 1: normal, inverted, diamond
            {id: "normal-src", position: {x: -6, y: 3, z: 0}},
            {id: "normal-dst", position: {x: -3, y: 3, z: 0}},
            {id: "inverted-src", position: {x: -1, y: 3, z: 0}},
            {id: "inverted-dst", position: {x: 2, y: 3, z: 0}},
            {id: "diamond-src", position: {x: 4, y: 3, z: 0}},
            {id: "diamond-dst", position: {x: 7, y: 3, z: 0}},
            // Row 2: box, dot, vee
            {id: "box-src", position: {x: -6, y: 0, z: 0}},
            {id: "box-dst", position: {x: -3, y: 0, z: 0}},
            {id: "dot-src", position: {x: -1, y: 0, z: 0}},
            {id: "dot-dst", position: {x: 2, y: 0, z: 0}},
            {id: "vee-src", position: {x: 4, y: 0, z: 0}},
            {id: "vee-dst", position: {x: 7, y: 0, z: 0}},
            // Row 3: tee, crow, open-normal
            {id: "tee-src", position: {x: -6, y: -3, z: 0}},
            {id: "tee-dst", position: {x: -3, y: -3, z: 0}},
            {id: "crow-src", position: {x: -1, y: -3, z: 0}},
            {id: "crow-dst", position: {x: 2, y: -3, z: 0}},
            {id: "open-normal-src", position: {x: 4, y: -3, z: 0}},
            {id: "open-normal-dst", position: {x: 7, y: -3, z: 0}},
            // Row 4: half-open, open-diamond, open-dot, sphere-dot
            {id: "half-open-src", position: {x: -8, y: -6, z: 0}},
            {id: "half-open-dst", position: {x: -5, y: -6, z: 0}},
            {id: "open-diamond-src", position: {x: -3, y: -6, z: 0}},
            {id: "open-diamond-dst", position: {x: 0, y: -6, z: 0}},
            {id: "open-dot-src", position: {x: 2, y: -6, z: 0}},
            {id: "open-dot-dst", position: {x: 5, y: -6, z: 0}},
            {id: "sphere-dot-src", position: {x: 7, y: -6, z: 0}},
            {id: "sphere-dot-dst", position: {x: 10, y: -6, z: 0}},
        ],
        edgeData: [
            {src: "normal-src", dst: "normal-dst", style: {arrowHead: {type: "normal"}}},
            {src: "inverted-src", dst: "inverted-dst", style: {arrowHead: {type: "inverted"}}},
            {src: "diamond-src", dst: "diamond-dst", style: {arrowHead: {type: "diamond"}}},
            {src: "box-src", dst: "box-dst", style: {arrowHead: {type: "box"}}},
            {src: "dot-src", dst: "dot-dst", style: {arrowHead: {type: "dot"}}},
            {src: "vee-src", dst: "vee-dst", style: {arrowHead: {type: "vee"}}},
            {src: "tee-src", dst: "tee-dst", style: {arrowHead: {type: "tee"}}},
            {src: "crow-src", dst: "crow-dst", style: {arrowHead: {type: "crow"}}},
            {src: "open-normal-src", dst: "open-normal-dst", style: {arrowHead: {type: "open-normal"}}},
            {src: "half-open-src", dst: "half-open-dst", style: {arrowHead: {type: "half-open"}}},
            {src: "open-diamond-src", dst: "open-diamond-dst", style: {arrowHead: {type: "open-diamond"}}},
            {src: "open-dot-src", dst: "open-dot-dst", style: {arrowHead: {type: "open-dot"}}},
            {src: "sphere-dot-src", dst: "sphere-dot-dst", style: {arrowHead: {type: "sphere-dot"}}},
        ],
        layout: "fixed",
    },
    parameters: {
        chromatic: {
            delay: 1000,
        },
    },
};

// Simple 2D story with 5 fully connected nodes for debugging arrow alignment
export const TwoDFiveNodeComplete: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            edgeStyle: {
                arrowHead: {type: "normal", color: "darkgrey"},
                line: {color: "darkgrey"},
            },
        }),
        nodeData: [
            {id: "A", position: {x: 0, y: 3, z: 0}},
            {id: "B", position: {x: 2.85, y: 0.93, z: 0}},
            {id: "C", position: {x: 1.76, y: -2.43, z: 0}},
            {id: "D", position: {x: -1.76, y: -2.43, z: 0}},
            {id: "E", position: {x: -2.85, y: 0.93, z: 0}},
        ],
        edgeData: [
            // All edges from A
            {src: "A", dst: "B"},
            {src: "A", dst: "C"},
            {src: "A", dst: "D"},
            {src: "A", dst: "E"},
            // All edges from B
            {src: "B", dst: "C"},
            {src: "B", dst: "D"},
            {src: "B", dst: "E"},
            // All edges from C
            {src: "C", dst: "D"},
            {src: "C", dst: "E"},
            // All edges from D
            {src: "D", dst: "E"},
        ],
        layout: "fixed",
    },
    parameters: {
        chromatic: {
            delay: 1000,
        },
    },
};

