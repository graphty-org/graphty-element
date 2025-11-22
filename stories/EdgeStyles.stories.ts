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
