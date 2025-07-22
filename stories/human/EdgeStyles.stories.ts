import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {Graphty} from "../../src/graphty-element";
import {renderFn, templateCreator} from "../helpers";

const meta: Meta = {
    title: "Styles/Edge",
    component: "graphty-element",
    // XXX: https://github.com/storybookjs/storybook/issues/23343
    render: renderFn,
    argTypes: {
        edgeLineWidth: {control: {type: "range", min: 0.1, max: 10, step: 0.1}, table: {category: "Line"}, name: "line.width"},
    },
    parameters: {
        // controls: {exclude: /^(#|_)/},
        controls: {
            include: [
                "line.width",
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
        styleTemplate: templateCreator({edgeStyle: {arrowHead: {type: "normal"}}}),
    },
};
