import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {renderFn, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Styles/Graph",
    component: "graphty-element",
    render: renderFn,
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
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2.json",
        },
        layout: "ngraph",
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const Default: Story = {
};

export const Skybox: Story = {
    args: {
        styleTemplate: templateCreator({graph: {background: {backgroundType: "skybox", data: "https://raw.githubusercontent.com/graphty-org/graphty-element/master/examples/assets/rolling_hills_equirectangular_skybox.png"}}}),
    },
    parameters: {
        controls: {
            include: ["graph.background.skybox"],
        },
    },
};

export const BackgroundColor: Story = {
    args: {
        styleTemplate: templateCreator({graph: {background: {backgroundType: "color", color: "hotpink"}}}),
    },
    parameters: {
        controls: {
            include: ["graph.background.color"],
        },
    },
};

export const Layers: Story = {
    args: {
        styleTemplate: templateCreator({
            layers: [
                {node: {selector: "starts_with(id, 'Lt.') == `true`", style: {enabled: true, texture: {color: "black"}}}},
                {node: {selector: "starts_with(id, 'Mme') == `true`", style: {enabled: true, texture: {color: "yellow"}}}},
                {node: {selector: "starts_with(id, 'Mlle') == `true`", style: {enabled: true, texture: {color: "red"}}}},
            ],
        }),
    },
    parameters: {
        controls: {
            include: [],
        },
    },
};
