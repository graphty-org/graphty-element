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
                line: {opacity: 0.7, color: "darkgrey"},
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
