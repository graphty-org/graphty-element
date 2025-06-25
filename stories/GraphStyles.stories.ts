import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {set as deepSet} from "lodash";

import {StyleSchema, StyleTemplate} from "../index";
import {StyleLayerType} from "../src/config/StyleTemplate";
import {Graphty} from "../src/graphty-element";

interface GraphTemplateOpts {
    graph?: Record<string, unknown>;
    layers?: StyleLayerType[];
}
function templateFromGraphStyle(opts: GraphTemplateOpts): StyleSchema {
    const pre = {
        graphtyTemplate: true,
        majorVersion: "1",
        graph: opts.graph,
        layers: opts.layers,
    };

    const template = StyleTemplate.parse(pre);

    return template;
}

const nodeData = [
    {id: 0},
    {id: 1},
    {id: 2},
    {id: 3},
    {id: 4},
    {id: 5},
];

const edgeData = [
    {src: 0, dst: 1},
    {src: 0, dst: 2},
    {src: 2, dst: 3},
    {src: 3, dst: 0},
    {src: 3, dst: 4},
    {src: 3, dst: 5},
];

const meta: Meta = {
    title: "Styles/Graph",
    component: "graphty-element",
    render: (args, storyConfig) => {
        const g = document.createElement("graphty-element") as Graphty;
        if (args.dataSource) {
            g.dataSource = args.dataSource;
            g.dataSourceConfig = args.dataSourceConfig;
        } else {
            g.nodeData = nodeData;
            g.edgeData = edgeData;
        }

        const t = args.styleTemplate;

        // if argTypes have a name like "texture.color", apply that value to the node style
        for (const arg of Object.getOwnPropertyNames(args)) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const name = storyConfig.argTypes[arg]?.name;

            // if the arg has a name...
            if (name) {
                const val = storyConfig.args[arg];
                // ...apply the value of the argument to our style
                deepSet(t, name, val);
            }
        }

        g.styleTemplate = t;
        return g;
    },
    argTypes: {
        skybox: {control: "text", table: {category: "Background"}, name: "graph.background.skybox"},
        background: {control: "color", table: {category: "Background"}, name: "graph.background.color"},
    },
    parameters: {
        // controls: {exclude: /^(#|_)/},
        controls: {
            include: [
                "graph.background.skybox",
                "graph.background.color",
            ],
        },
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const Default: Story = {
};

export const Skybox: Story = {
    args: {
        styleTemplate: templateFromGraphStyle({graph: {background: {backgroundType: "skybox", data: "https://raw.githubusercontent.com/graphty-org/graphty-element/master/examples/assets/rolling_hills_equirectangular_skybox.png"}}}),
    },
    parameters: {
        controls: {
            include: ["graph.background.skybox"],
        },
    },
};

export const BackgroundColor: Story = {
    args: {
        styleTemplate: templateFromGraphStyle({graph: {background: {backgroundType: "color", color: "lightblue"}}}),
    },
    parameters: {
        controls: {
            include: ["graph.background.color"],
        },
    },
};

export const Layers: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/data3.json",
        },
        styleTemplate: templateFromGraphStyle({
            layers: [
                {node: {selector: "starts_with(id, 'Mme') == `true`", style: {enabled: true, texture: {color: "lightgreen"}}}},
                {node: {selector: "starts_with(id, 'Mlle') == `true`", style: {enabled: true, texture: {color: "lightpink"}}}},
            ],
        }),
    },
    parameters: {
        controls: {
            include: [],
        },
    },
};
