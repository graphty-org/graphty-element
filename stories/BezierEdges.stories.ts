import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, renderFn, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Styles/Bezier Edges",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    parameters: {
        chromatic: {
            delay: 500,
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
            {id: "A", position: {x: -5, y: 0, z: 0}},
            {id: "B", position: {x: 5, y: 5, z: 0}}, // Changed Y from 0 to 5 to create height variation
            {id: "C", position: {x: 0, y: 5, z: 0}},
        ],
        edgeData: [
            {src: "A", dst: "B"},
            {src: "B", dst: "C"},
            {src: "C", dst: "A"},
        ],
        layout: "fixed",
        layoutConfig: {},
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const Basic: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                line: {
                    bezier: true,
                },
            },
        }),
    },
};

export const WithArrows: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                line: {
                    bezier: true,
                    color: "#4ECDC4",
                },
                arrowHead: {
                    type: "normal",
                    color: "#4ECDC4",
                    size: 1.5,
                },
            },
        }),
    },
};

export const DifferentArrowTypes: Story = {
    args: {
        nodeData: [
            {id: "A", position: {x: -8, y: 0, z: 0}},
            {id: "B", position: {x: 0, y: 0, z: 0}},
            {id: "C", position: {x: 8, y: 0, z: 0}},
        ],
        edgeData: [
            {src: "A", dst: "B"},
            {src: "B", dst: "C"},
        ],
        styleTemplate: templateCreator({
            layers: [
                {
                    edge: {
                        selector: "[src == 'A']",
                        style: {
                            line: {bezier: true, color: "#FF6B6B"},
                            arrowHead: {type: "diamond", color: "#FF6B6B", size: 1.5},
                        },
                    },
                },
                {
                    edge: {
                        selector: "[src == 'B']",
                        style: {
                            line: {bezier: true, color: "#95E1D3"},
                            arrowHead: {type: "dot", color: "#95E1D3", size: 1.5},
                        },
                    },
                },
            ],
        }),
    },
};

export const SelfLoop: Story = {
    args: {
        nodeData: [
            {id: "A", position: {x: 0, y: 0, z: 0}},
        ],
        edgeData: [
            {src: "A", dst: "A"},
        ],
        styleTemplate: templateCreator({
            edgeStyle: {
                line: {
                    bezier: true,
                    color: "#F38181",
                },
                arrowHead: {
                    type: "normal",
                    color: "#F38181",
                    size: 1.5,
                },
            },
        }),
    },
};

export const WithOpacity: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                line: {
                    bezier: true,
                    color: "#AA96DA",
                    opacity: 0.5,
                },
                arrowHead: {
                    type: "normal",
                    color: "#AA96DA",
                    size: 1.5,
                    opacity: 0.5,
                },
            },
        }),
    },
};

export const ComplexGraph: Story = {
    args: {
        nodeData: [
            {id: "1", position: {x: 0, y: 5, z: 0}},
            {id: "2", position: {x: 5, y: 2.5, z: 0}},
            {id: "3", position: {x: 5, y: -2.5, z: 0}},
            {id: "4", position: {x: 0, y: -5, z: 0}},
            {id: "5", position: {x: -5, y: -2.5, z: 0}},
            {id: "6", position: {x: -5, y: 2.5, z: 0}},
        ],
        edgeData: [
            {src: "1", dst: "2"},
            {src: "2", dst: "3"},
            {src: "3", dst: "4"},
            {src: "4", dst: "5"},
            {src: "5", dst: "6"},
            {src: "6", dst: "1"},
            {src: "1", dst: "4"},
            {src: "2", dst: "5"},
            {src: "3", dst: "6"},
        ],
        styleTemplate: templateCreator({
            edgeStyle: {
                line: {
                    bezier: true,
                    color: "#FECA57",
                },
                arrowHead: {
                    type: "normal",
                    color: "#FECA57",
                    size: 1.0,
                },
            },
        }),
    },
};

export const ThreeD: Story = {
    args: {
        nodeData: [
            {id: "A", position: {x: -5, y: 0, z: -3}},
            {id: "B", position: {x: 5, y: 0, z: 3}},
            {id: "C", position: {x: 0, y: 5, z: 0}},
            {id: "D", position: {x: 0, y: -5, z: 0}},
        ],
        edgeData: [
            {src: "A", dst: "B"},
            {src: "B", dst: "C"},
            {src: "C", dst: "D"},
            {src: "D", dst: "A"},
            {src: "A", dst: "C"},
            {src: "B", dst: "D"},
        ],
        styleTemplate: templateCreator({
            edgeStyle: {
                line: {
                    bezier: true,
                    color: "#48DBFB",
                },
                arrowHead: {
                    type: "normal",
                    color: "#48DBFB",
                    size: 1.2,
                },
            },
        }),
    },
};
