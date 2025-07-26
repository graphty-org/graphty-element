import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {nodeShapes, renderFn, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Styles/Node",
    component: "graphty-element",
    // XXX: https://github.com/storybookjs/storybook/issues/23343
    render: renderFn,
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
    },
    args: {
        styleTemplate: templateCreator({}),
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

type Story = StoryObj<Graphty>;

export const Default: Story = {};

export const Color: Story = {
    args: {
        styleTemplate: templateCreator({nodeStyle: {texture: {color: "red"}}}),
    },
    parameters: {
        controls: {
            include: ["texture.color"],
        },
    },
};

export const Shape: Story = {
    args: {
        styleTemplate: templateCreator({nodeStyle: {shape: {type: "box"}}}),
    },
    parameters: {
        controls: {
            include: ["shape.type"],
        },
    },
};

export const Size: Story = {
    args: {
        styleTemplate: templateCreator({nodeStyle: {shape: {size: 3}}}),
    },
    parameters: {
        controls: {
            include: ["shape.size"],
        },
    },
};

export const Wireframe: Story = {
    args: {
        styleTemplate: templateCreator({nodeStyle: {effect: {wireframe: true}}}),
    },
    parameters: {
        controls: {
            include: ["effect.wireframe"],
        },
    },
};

export const Label: Story = {
    args: {
        styleTemplate: templateCreator({nodeStyle: {label: {enabled: true}}}),
    },
    parameters: {
        controls: {
            include: ["label.enabled"],
        },
    },
};

export const Opacity: Story = {
    args: {
        styleTemplate: templateCreator({nodeStyle: {texture: {color: {
            colorType: "solid",
            value: "#0000FF",
            opacity: 0.5,
        }}}}),
    },
    parameters: {
        controls: {
            include: ["texture.color.value", "texture.color.opacity"],
        },
    },
};
