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
            data: "../test/helpers/cat-social-network-2.json",
        },
        layout: "ngraph",
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

// Create a story specifically for Chromatic that tests all shapes
// This won't show in the Storybook UI
const AllShapesStory: Story = {
    args: {
        styleTemplate: templateCreator({nodeStyle: {shape: {type: "box"}}}),
    },
    tags: ["!dev"], // Hide from Storybook UI
};

// Export it with a name that indicates it's for testing
export const ChromaticAllShapes = {
    ... AllShapesStory,
    parameters: {
        chromatic: {
            // Test each shape as a different mode
            modes: {
                box: {args: {styleTemplate: templateCreator({nodeStyle: {shape: {type: "box"}}})}},
                sphere: {args: {styleTemplate: templateCreator({nodeStyle: {shape: {type: "sphere"}}})}},
                cylinder: {args: {styleTemplate: templateCreator({nodeStyle: {shape: {type: "cylinder"}}})}},
                cone: {args: {styleTemplate: templateCreator({nodeStyle: {shape: {type: "cone"}}})}},
                capsule: {args: {styleTemplate: templateCreator({nodeStyle: {shape: {type: "capsule"}}})}},
                torusKnot: {args: {styleTemplate: templateCreator({nodeStyle: {shape: {type: "torus-knot"}}})}},
                tetrahedron: {args: {styleTemplate: templateCreator({nodeStyle: {shape: {type: "tetrahedron"}}})}},
                octahedron: {args: {styleTemplate: templateCreator({nodeStyle: {shape: {type: "octahedron"}}})}},
                dodecahedron: {args: {styleTemplate: templateCreator({nodeStyle: {shape: {type: "dodecahedron"}}})}},
                icosahedron: {args: {styleTemplate: templateCreator({nodeStyle: {shape: {type: "icosahedron"}}})}},
                rhombicuboctahedron: {args: {styleTemplate: templateCreator({nodeStyle: {shape: {type: "rhombicuboctahedron"}}})}},
                geodesic: {args: {styleTemplate: templateCreator({nodeStyle: {shape: {type: "geodesic"}}})}},
            },
            delay: 500, // Give time for 3D rendering
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
