import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {renderFn, templateCreator, waitForGraphSettled, waitForSkyboxLoaded, eventWaitingDecorator} from "./helpers";

const meta: Meta = {
    title: "Styles/Graph",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
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
        chromatic: {
            delay: 500, // Allow Babylon.js render frames to complete (30 frames at 60fps)
        },
    },
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2.json",
        },
        layout: "ngraph",
        layoutConfig: {
            seed: 42, // Fixed seed for consistent layouts in visual tests
        },
        styleTemplate: templateCreator({
            behavior: {
                layout: {
                    preSteps: 2000, // Extra preSteps for more stable physics layouts
                },
            },
        }),
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const Default: Story = {
};

export const Skybox: Story = {
    args: {
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2-fixed-positions-actual-engine.json",
        },
        layout: "fixed",
        layoutConfig: {
            dim: 3,
        },
        styleTemplate: templateCreator({
            graph: {background: {backgroundType: "skybox", data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/rolling_hills_equirectangular_skybox.png"}},
        }),
    },
    parameters: {
        controls: {
            include: ["graph.background.skybox"],
        },
        chromatic: {
            diffIncludeAntiAliasing: true,
            diffThreshold: 0.3,
        },
    },
    play: async({canvasElement}) => {
        // Wait for the skybox to fully load before taking the screenshot
        await waitForSkyboxLoaded(canvasElement);
        await waitForGraphSettled(canvasElement);
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
