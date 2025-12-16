import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, nodeShapes, renderFn, templateCreator, waitForGraphSettled} from "./helpers";

const meta: Meta = {
    title: "Styles/Node",
    component: "graphty-element",
    // XXX: https://github.com/storybookjs/storybook/issues/23343
    render: renderFn,
    decorators: [eventWaitingDecorator],
    argTypes: {
        nodeColor: {control: "color", table: {category: "Texture"}, name: "texture.color"},
        nodeShape: {control: "select", options: nodeShapes, table: {category: "Shape"}, name: "shape.type"},
        nodeSize: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Shape"}, name: "shape.size"},
        nodeWireframe: {control: "boolean", table: {category: "Effect"}, name: "effect.wireframe"},
        nodeLabelEnabled: {control: "boolean", table: {category: "Label"}, name: "label.enabled"},
        advancedNodeColor: {control: "color", table: {category: "Texture"}, name: "texture.color.value"},
        advancedNodeOpacity: {control: {type: "range", min: 0.1, max: 1, step: 0.1}, table: {category: "Texture"}, name: "texture.color.opacity"},
    },
    parameters: {
        // controls: {exclude: /^(#|_)/},
        controls: {
            include: [
                "texture.color",
                "shape.type",
                "shape.size",
                "effect.wireframe",
                "label.enabled",
            ],
        },
        chromatic: {
            delay: 500, // Allow Babylon.js render frames to complete (30 frames at 60fps)
        },
    },
    args: {
        styleTemplate: templateCreator({
            behavior: {
                layout: {
                    preSteps: 8000, // Extra preSteps for ngraph physics layout
                },
            },
        }),
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2.json",
        },
        layout: "ngraph",
        layoutConfig: {
            seed: 42, // Fixed seed for consistent layouts in visual tests
        },
    },
};
export default meta;

// Common play function for all stories
const waitForSettle = async({canvasElement}: {canvasElement: HTMLElement}): Promise<void> => {
    await waitForGraphSettled(canvasElement);
};

type Story = StoryObj<Graphty>;

export const Default: Story = {
    play: waitForSettle,
};

export const Color: Story = {
    args: {
        styleTemplate: templateCreator({nodeStyle: {texture: {color: "red"}}, behavior: {layout: {preSteps: 8000}}}),
    },
    parameters: {
        controls: {
            include: ["texture.color"],
        },
    },
    play: waitForSettle,
};

export const Shape: Story = {
    args: {
        styleTemplate: templateCreator({nodeStyle: {shape: {type: "box"}}, behavior: {layout: {preSteps: 8000}}}),
    },
    parameters: {
        controls: {
            include: ["shape.type"],
        },
    },
    play: waitForSettle,
};

export const Size: Story = {
    args: {
        styleTemplate: templateCreator({nodeStyle: {shape: {size: 3}}, behavior: {layout: {preSteps: 8000}}}),
    },
    parameters: {
        controls: {
            include: ["shape.size"],
        },
    },
    play: waitForSettle,
};

export const Wireframe: Story = {
    args: {
        styleTemplate: templateCreator({nodeStyle: {effect: {wireframe: true}}, behavior: {layout: {preSteps: 8000}}}),
    },
    parameters: {
        controls: {
            include: ["effect.wireframe"],
        },
    },
    play: waitForSettle,
};

export const Label: Story = {
    args: {
        styleTemplate: templateCreator({nodeStyle: {label: {enabled: true}}, behavior: {layout: {preSteps: 8000}}}),
    },
    parameters: {
        controls: {
            include: ["label.enabled"],
        },
    },
    play: waitForSettle,
};

export const Opacity: Story = {
    args: {
        styleTemplate: templateCreator({
            nodeStyle: {texture: {color: {
                colorType: "solid",
                value: "#0000FF",
                opacity: 0.5,
            }}},
            behavior: {layout: {preSteps: 8000}},
        }),
    },
    parameters: {
        controls: {
            include: ["texture.color.value", "texture.color.opacity"],
        },
    },
    play: waitForSettle,
};
