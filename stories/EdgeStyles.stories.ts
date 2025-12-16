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
        styleTemplate: templateCreator({edgeStyle: {line: {width: 40}}}),
    },
    parameters: {
        controls: {
            include: ["line.width"],
        },
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

// Comprehensive 2D Arrow Type Showcase
// This story displays all 14 arrow types in a grid layout for visual comparison
// Arrow types: normal, inverted, dot, sphere-dot, open-dot, tee, open-normal,
//              diamond, open-diamond, crow, box, half-open, vee, none
export const TwoDAllArrows: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true, startingCameraDistance: 54},
            nodeStyle: {
                texture: {
                    color: {
                        colorType: "solid",
                        value: "#5A67D8",
                    },
                },
            },
            layers: [
                // Row 1: normal, inverted, dot, sphere-dot
                {edge: {selector: "src == 'normal-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2, text: {text: "normal", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'inverted-src'", style: {arrowHead: {type: "inverted", color: "darkgrey", size: 2, text: {text: "inverted", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'dot-src'", style: {arrowHead: {type: "dot", color: "darkgrey", size: 2, text: {text: "dot", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'sphere-dot-src'", style: {arrowHead: {type: "sphere-dot", color: "darkgrey", size: 2, text: {text: "sphere-dot", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                // Row 2: open-dot, tee, open-normal, diamond
                {edge: {selector: "src == 'open-dot-src'", style: {arrowHead: {type: "open-dot", color: "darkgrey", size: 2, text: {text: "open-dot", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'tee-src'", style: {arrowHead: {type: "tee", color: "darkgrey", size: 2, text: {text: "tee", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'open-normal-src'", style: {arrowHead: {type: "open-normal", color: "darkgrey", size: 2, text: {text: "open-normal", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'diamond-src'", style: {arrowHead: {type: "diamond", color: "darkgrey", size: 2, text: {text: "diamond", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                // Row 3: open-diamond, crow, box, half-open
                {edge: {selector: "src == 'open-diamond-src'", style: {arrowHead: {type: "open-diamond", color: "darkgrey", size: 2, text: {text: "open-diamond", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'crow-src'", style: {arrowHead: {type: "crow", color: "darkgrey", size: 2, text: {text: "crow", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'box-src'", style: {arrowHead: {type: "box", color: "darkgrey", size: 2, text: {text: "box", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'half-open-src'", style: {arrowHead: {type: "half-open", color: "darkgrey", size: 2, text: {text: "half-open", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                // Row 4: vee, none
                {edge: {selector: "src == 'vee-src'", style: {arrowHead: {type: "vee", color: "darkgrey", size: 2, text: {text: "vee", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'none-src'", style: {arrowHead: {type: "none"}, line: {color: "darkgrey"}, label: {enabled: true, text: "none", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
            ],
        }),
        nodeData: [
            // Grid layout: 4 columns x 4 rows (14 arrow types)
            // Row 1: normal, inverted, dot, sphere-dot
            {id: "normal-src", position: {x: -12, y: 6, z: 0}},
            {id: "normal-dst", position: {x: -8, y: 6, z: 0}},
            {id: "inverted-src", position: {x: -4, y: 6, z: 0}},
            {id: "inverted-dst", position: {x: 0, y: 6, z: 0}},
            {id: "dot-src", position: {x: 4, y: 6, z: 0}},
            {id: "dot-dst", position: {x: 8, y: 6, z: 0}},
            {id: "sphere-dot-src", position: {x: 12, y: 6, z: 0}},
            {id: "sphere-dot-dst", position: {x: 16, y: 6, z: 0}},
            // Row 2: open-dot, tee, open-normal, diamond
            {id: "open-dot-src", position: {x: -12, y: 0, z: 0}},
            {id: "open-dot-dst", position: {x: -8, y: 0, z: 0}},
            {id: "tee-src", position: {x: -4, y: 0, z: 0}},
            {id: "tee-dst", position: {x: 0, y: 0, z: 0}},
            {id: "open-normal-src", position: {x: 4, y: 0, z: 0}},
            {id: "open-normal-dst", position: {x: 8, y: 0, z: 0}},
            {id: "diamond-src", position: {x: 12, y: 0, z: 0}},
            {id: "diamond-dst", position: {x: 16, y: 0, z: 0}},
            // Row 3: open-diamond, crow, box, half-open
            {id: "open-diamond-src", position: {x: -12, y: -6, z: 0}},
            {id: "open-diamond-dst", position: {x: -8, y: -6, z: 0}},
            {id: "crow-src", position: {x: -4, y: -6, z: 0}},
            {id: "crow-dst", position: {x: 0, y: -6, z: 0}},
            {id: "box-src", position: {x: 4, y: -6, z: 0}},
            {id: "box-dst", position: {x: 8, y: -6, z: 0}},
            {id: "half-open-src", position: {x: 12, y: -6, z: 0}},
            {id: "half-open-dst", position: {x: 16, y: -6, z: 0}},
            // Row 4: vee, none
            {id: "vee-src", position: {x: -12, y: -12, z: 0}},
            {id: "vee-dst", position: {x: -8, y: -12, z: 0}},
            {id: "none-src", position: {x: -4, y: -12, z: 0}},
            {id: "none-dst", position: {x: 0, y: -12, z: 0}},
        ],
        edgeData: [
            // Row 1
            {src: "normal-src", dst: "normal-dst"},
            {src: "inverted-src", dst: "inverted-dst"},
            {src: "dot-src", dst: "dot-dst"},
            {src: "sphere-dot-src", dst: "sphere-dot-dst"},
            // Row 2
            {src: "open-dot-src", dst: "open-dot-dst"},
            {src: "tee-src", dst: "tee-dst"},
            {src: "open-normal-src", dst: "open-normal-dst"},
            {src: "diamond-src", dst: "diamond-dst"},
            // Row 3
            {src: "open-diamond-src", dst: "open-diamond-dst"},
            {src: "crow-src", dst: "crow-dst"},
            {src: "box-src", dst: "box-dst"},
            {src: "half-open-src", dst: "half-open-dst"},
            // Row 4
            {src: "vee-src", dst: "vee-dst"},
            {src: "none-src", dst: "none-dst"},
        ],
        layout: "fixed",
    },
    parameters: {
        chromatic: {
            delay: 1000,
        },
    },
};

// 3D version showing all 14 arrowhead types with labels
export const ThreeDAllArrows: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: false},
            nodeStyle: {
                texture: {
                    color: {
                        colorType: "solid",
                        value: "#5A67D8",
                    },
                },
            },
            layers: [
                // Row 1: normal, inverted, dot, sphere-dot
                {edge: {selector: "src == 'normal-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2, text: {text: "normal", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'inverted-src'", style: {arrowHead: {type: "inverted", color: "darkgrey", size: 2, text: {text: "inverted", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'dot-src'", style: {arrowHead: {type: "dot", color: "darkgrey", size: 2, text: {text: "dot", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'sphere-dot-src'", style: {arrowHead: {type: "sphere-dot", color: "darkgrey", size: 2, text: {text: "sphere-dot", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                // Row 2: open-dot, tee, open-normal, diamond
                {edge: {selector: "src == 'open-dot-src'", style: {arrowHead: {type: "open-dot", color: "darkgrey", size: 2, text: {text: "open-dot", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'tee-src'", style: {arrowHead: {type: "tee", color: "darkgrey", size: 2, text: {text: "tee", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'open-normal-src'", style: {arrowHead: {type: "open-normal", color: "darkgrey", size: 2, text: {text: "open-normal", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'diamond-src'", style: {arrowHead: {type: "diamond", color: "darkgrey", size: 2, text: {text: "diamond", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                // Row 3: open-diamond, crow, box, half-open
                {edge: {selector: "src == 'open-diamond-src'", style: {arrowHead: {type: "open-diamond", color: "darkgrey", size: 2, text: {text: "open-diamond", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'crow-src'", style: {arrowHead: {type: "crow", color: "darkgrey", size: 2, text: {text: "crow", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'box-src'", style: {arrowHead: {type: "box", color: "darkgrey", size: 2, text: {text: "box", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'half-open-src'", style: {arrowHead: {type: "half-open", color: "darkgrey", size: 2, text: {text: "half-open", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                // Row 4: vee, none
                {edge: {selector: "src == 'vee-src'", style: {arrowHead: {type: "vee", color: "darkgrey", size: 2, text: {text: "vee", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", attachOffset: 1}}, line: {color: "darkgrey"}}}},
                {edge: {selector: "src == 'none-src'", style: {arrowHead: {type: "none"}, line: {color: "darkgrey"}, label: {enabled: true, text: "none", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
            ],
        }),
        nodeData: [
            // 3D grid layout: 4 columns x 4 rows spread across Z-axis for 3D effect (14 arrow types)
            // Row 1 (front): normal, inverted, dot, sphere-dot
            {id: "normal-src", position: {x: -12, y: 4, z: 6}},
            {id: "normal-dst", position: {x: -8, y: 4, z: 6}},
            {id: "inverted-src", position: {x: -4, y: 4, z: 6}},
            {id: "inverted-dst", position: {x: 0, y: 4, z: 6}},
            {id: "dot-src", position: {x: 4, y: 4, z: 6}},
            {id: "dot-dst", position: {x: 8, y: 4, z: 6}},
            {id: "sphere-dot-src", position: {x: 12, y: 4, z: 6}},
            {id: "sphere-dot-dst", position: {x: 16, y: 4, z: 6}},
            // Row 2 (mid-front): open-dot, tee, open-normal, diamond
            {id: "open-dot-src", position: {x: -12, y: 0, z: 2}},
            {id: "open-dot-dst", position: {x: -8, y: 0, z: 2}},
            {id: "tee-src", position: {x: -4, y: 0, z: 2}},
            {id: "tee-dst", position: {x: 0, y: 0, z: 2}},
            {id: "open-normal-src", position: {x: 4, y: 0, z: 2}},
            {id: "open-normal-dst", position: {x: 8, y: 0, z: 2}},
            {id: "diamond-src", position: {x: 12, y: 0, z: 2}},
            {id: "diamond-dst", position: {x: 16, y: 0, z: 2}},
            // Row 3 (mid-back): open-diamond, crow, box, half-open
            {id: "open-diamond-src", position: {x: -12, y: -4, z: -2}},
            {id: "open-diamond-dst", position: {x: -8, y: -4, z: -2}},
            {id: "crow-src", position: {x: -4, y: -4, z: -2}},
            {id: "crow-dst", position: {x: 0, y: -4, z: -2}},
            {id: "box-src", position: {x: 4, y: -4, z: -2}},
            {id: "box-dst", position: {x: 8, y: -4, z: -2}},
            {id: "half-open-src", position: {x: 12, y: -4, z: -2}},
            {id: "half-open-dst", position: {x: 16, y: -4, z: -2}},
            // Row 4 (back): vee, none
            {id: "vee-src", position: {x: -12, y: -8, z: -6}},
            {id: "vee-dst", position: {x: -8, y: -8, z: -6}},
            {id: "none-src", position: {x: -4, y: -8, z: -6}},
            {id: "none-dst", position: {x: 0, y: -8, z: -6}},
        ],
        edgeData: [
            // Row 1
            {src: "normal-src", dst: "normal-dst"},
            {src: "inverted-src", dst: "inverted-dst"},
            {src: "dot-src", dst: "dot-dst"},
            {src: "sphere-dot-src", dst: "sphere-dot-dst"},
            // Row 2
            {src: "open-dot-src", dst: "open-dot-dst"},
            {src: "tee-src", dst: "tee-dst"},
            {src: "open-normal-src", dst: "open-normal-dst"},
            {src: "diamond-src", dst: "diamond-dst"},
            // Row 3
            {src: "open-diamond-src", dst: "open-diamond-dst"},
            {src: "crow-src", dst: "crow-dst"},
            {src: "box-src", dst: "box-dst"},
            {src: "half-open-src", dst: "half-open-dst"},
            // Row 4
            {src: "vee-src", dst: "vee-dst"},
            {src: "none-src", dst: "none-dst"},
        ],
        layout: "fixed",
    },
    parameters: {
        chromatic: {
            delay: 1000,
        },
    },
};

// 3D version showing all 9 line types with labels
export const ThreeDAllLines: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: false},
            nodeStyle: {
                texture: {
                    color: {
                        colorType: "solid",
                        value: "#5A67D8",
                    },
                },
            },
            layers: [
                // Row 1: solid, dot, star
                {edge: {selector: "src == 'solid-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "solid", color: "darkgrey"}, label: {enabled: true, text: "solid", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                {edge: {selector: "src == 'dot-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "dot", color: "darkgrey"}, label: {enabled: true, text: "dot", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                {edge: {selector: "src == 'star-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "star", color: "darkgrey"}, label: {enabled: true, text: "star", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                // Row 2: box, dash, diamond
                {edge: {selector: "src == 'box-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "box", color: "darkgrey"}, label: {enabled: true, text: "box", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                {edge: {selector: "src == 'dash-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "dash", color: "darkgrey"}, label: {enabled: true, text: "dash", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                {edge: {selector: "src == 'diamond-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "diamond", color: "darkgrey"}, label: {enabled: true, text: "diamond", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                // Row 3: dash-dot, sinewave, zigzag
                {edge: {selector: "src == 'dash-dot-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "dash-dot", color: "darkgrey"}, label: {enabled: true, text: "dash-dot", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                {edge: {selector: "src == 'sinewave-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "sinewave", color: "darkgrey"}, label: {enabled: true, text: "sinewave", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                {edge: {selector: "src == 'zigzag-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "zigzag", color: "darkgrey"}, label: {enabled: true, text: "zigzag", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
            ],
        }),
        nodeData: [
            // 3D grid layout: 3 columns x 3 rows spread across Z-axis for 3D effect (9 line types)
            // Row 1 (front): solid, dot, star
            {id: "solid-src", position: {x: -8, y: 4, z: 4}},
            {id: "solid-dst", position: {x: -4, y: 4, z: 4}},
            {id: "dot-src", position: {x: 0, y: 4, z: 4}},
            {id: "dot-dst", position: {x: 4, y: 4, z: 4}},
            {id: "star-src", position: {x: 8, y: 4, z: 4}},
            {id: "star-dst", position: {x: 12, y: 4, z: 4}},
            // Row 2 (middle): box, dash, diamond
            {id: "box-src", position: {x: -8, y: 0, z: 0}},
            {id: "box-dst", position: {x: -4, y: 0, z: 0}},
            {id: "dash-src", position: {x: 0, y: 0, z: 0}},
            {id: "dash-dst", position: {x: 4, y: 0, z: 0}},
            {id: "diamond-src", position: {x: 8, y: 0, z: 0}},
            {id: "diamond-dst", position: {x: 12, y: 0, z: 0}},
            // Row 3 (back): dash-dot, sinewave, zigzag
            {id: "dash-dot-src", position: {x: -8, y: -4, z: -4}},
            {id: "dash-dot-dst", position: {x: -4, y: -4, z: -4}},
            {id: "sinewave-src", position: {x: 0, y: -4, z: -4}},
            {id: "sinewave-dst", position: {x: 4, y: -4, z: -4}},
            {id: "zigzag-src", position: {x: 8, y: -4, z: -4}},
            {id: "zigzag-dst", position: {x: 12, y: -4, z: -4}},
        ],
        edgeData: [
            // Row 1
            {src: "solid-src", dst: "solid-dst"},
            {src: "dot-src", dst: "dot-dst"},
            {src: "star-src", dst: "star-dst"},
            // Row 2
            {src: "box-src", dst: "box-dst"},
            {src: "dash-src", dst: "dash-dst"},
            {src: "diamond-src", dst: "diamond-dst"},
            // Row 3
            {src: "dash-dot-src", dst: "dash-dot-dst"},
            {src: "sinewave-src", dst: "sinewave-dst"},
            {src: "zigzag-src", dst: "zigzag-dst"},
        ],
        layout: "fixed",
    },
    parameters: {
        chromatic: {
            delay: 1000,
        },
    },
};

// 2D version showing all 9 line types with labels
export const TwoDAllLines: Story = {
    args: {
        styleTemplate: templateCreator({
            graph: {twoD: true},
            nodeStyle: {
                texture: {
                    color: {
                        colorType: "solid",
                        value: "#5A67D8",
                    },
                },
            },
            layers: [
                // Row 1: solid, dot, star
                {edge: {selector: "src == 'solid-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "solid", color: "darkgrey"}, label: {enabled: true, text: "solid", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                {edge: {selector: "src == 'dot-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "dot", color: "darkgrey"}, label: {enabled: true, text: "dot", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                {edge: {selector: "src == 'star-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "star", color: "darkgrey"}, label: {enabled: true, text: "star", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                // Row 2: box, dash, diamond
                {edge: {selector: "src == 'box-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "box", color: "darkgrey"}, label: {enabled: true, text: "box", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                {edge: {selector: "src == 'dash-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "dash", color: "darkgrey"}, label: {enabled: true, text: "dash", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                {edge: {selector: "src == 'diamond-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "diamond", color: "darkgrey"}, label: {enabled: true, text: "diamond", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                // Row 3: dash-dot, sinewave, zigzag
                {edge: {selector: "src == 'dash-dot-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "dash-dot", color: "darkgrey"}, label: {enabled: true, text: "dash-dot", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                {edge: {selector: "src == 'sinewave-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "sinewave", color: "darkgrey"}, label: {enabled: true, text: "sinewave", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
                {edge: {selector: "src == 'zigzag-src'", style: {arrowHead: {type: "normal", color: "darkgrey", size: 2}, line: {type: "zigzag", color: "darkgrey"}, label: {enabled: true, text: "zigzag", fontSize: 32, textColor: "#000000", backgroundColor: "transparent", location: "top", attachOffset: 1}}}},
            ],
        }),
        nodeData: [
            // 2D grid layout: 3 columns x 3 rows (9 line types)
            // Row 1: solid, dot, star
            {id: "solid-src", position: {x: -8, y: 6, z: 0}},
            {id: "solid-dst", position: {x: -4, y: 6, z: 0}},
            {id: "dot-src", position: {x: 0, y: 6, z: 0}},
            {id: "dot-dst", position: {x: 4, y: 6, z: 0}},
            {id: "star-src", position: {x: 8, y: 6, z: 0}},
            {id: "star-dst", position: {x: 12, y: 6, z: 0}},
            // Row 2: box, dash, diamond
            {id: "box-src", position: {x: -8, y: 0, z: 0}},
            {id: "box-dst", position: {x: -4, y: 0, z: 0}},
            {id: "dash-src", position: {x: 0, y: 0, z: 0}},
            {id: "dash-dst", position: {x: 4, y: 0, z: 0}},
            {id: "diamond-src", position: {x: 8, y: 0, z: 0}},
            {id: "diamond-dst", position: {x: 12, y: 0, z: 0}},
            // Row 3: dash-dot, sinewave, zigzag
            {id: "dash-dot-src", position: {x: -8, y: -6, z: 0}},
            {id: "dash-dot-dst", position: {x: -4, y: -6, z: 0}},
            {id: "sinewave-src", position: {x: 0, y: -6, z: 0}},
            {id: "sinewave-dst", position: {x: 4, y: -6, z: 0}},
            {id: "zigzag-src", position: {x: 8, y: -6, z: 0}},
            {id: "zigzag-dst", position: {x: 12, y: -6, z: 0}},
        ],
        edgeData: [
            // Row 1
            {src: "solid-src", dst: "solid-dst"},
            {src: "dot-src", dst: "dot-dst"},
            {src: "star-src", dst: "star-dst"},
            // Row 2
            {src: "box-src", dst: "box-dst"},
            {src: "dash-src", dst: "dash-dst"},
            {src: "diamond-src", dst: "diamond-dst"},
            // Row 3
            {src: "dash-dot-src", dst: "dash-dot-dst"},
            {src: "sinewave-src", dst: "sinewave-dst"},
            {src: "zigzag-src", dst: "zigzag-dst"},
        ],
        layout: "fixed",
    },
    parameters: {
        chromatic: {
            delay: 1000,
        },
    },
};

