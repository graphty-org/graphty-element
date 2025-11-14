import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, renderFn, templateCreator} from "./helpers";

const meta: Meta = {
    title: "Styles/Edge/Bidirectional",
    component: "graphty-element",
    render: renderFn,
    decorators: [eventWaitingDecorator],
    argTypes: {
        arrowHeadSize: {control: {type: "range", min: 0.1, max: 5, step: 0.1}, table: {category: "Head"}, name: "arrowHead.size"},
        arrowHeadColor: {control: "color", table: {category: "Head"}, name: "arrowHead.color"},
        arrowTailSize: {control: {type: "range", min: 0.1, max: 5, step: 0.1}, table: {category: "Tail"}, name: "arrowTail.size"},
        arrowTailColor: {control: "color", table: {category: "Tail"}, name: "arrowTail.color"},
    },
    args: {
        styleTemplate: templateCreator({}),
        dataSource: "json",
        dataSourceConfig: {
            data: "https://raw.githubusercontent.com/graphty-org/graphty-element/refs/heads/master/test/helpers/cat-social-network-2.json",
        },
        layout: "ngraph",
        layoutConfig: {seed: 42},
    },
};
export default meta;

type Story = StoryObj<Graphty>;

export const BasicBidirectional: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "normal", color: "#FF0000"},
                arrowTail: {type: "normal", color: "#0000FF"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color", "arrowTail.size", "arrowTail.color"],
        },
    },
};

export const MixedTypes: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "normal", color: "#FF0000"},
                arrowTail: {type: "tee", color: "#0000FF"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowHead.color", "arrowTail.size", "arrowTail.color"],
        },
    },
};

export const IndependentSizing: Story = {
    args: {
        styleTemplate: templateCreator({
            edgeStyle: {
                arrowHead: {type: "normal", size: 3.0, color: "#FF0000"},
                arrowTail: {type: "dot", size: 0.5, color: "#0000FF"},
                line: {color: "darkgrey"},
            },
        }),
    },
    parameters: {
        controls: {
            include: ["arrowHead.size", "arrowTail.size"],
        },
    },
};
