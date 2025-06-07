import "../index.ts";
import type {Meta, StoryObj} from "@storybook/web-components";
import {Graphty} from "../src/webcomponent.ts";

const meta: Meta = {
    title: "Data",
    tags: ["autodocs"],
    component: "graphty-element",
    parameters: {
        controls: {exclude: /^(#|_)/},
    },
};
export default meta;

type Story = StoryObj<Graphty>

export const Basic: Story = {
    args: {
        nodeData: [
            {id: 0},
            {id: 1},
            {id: 2},
            {id: 3},
            {id: 4},
            {id: 5},
        ],
        edgeData: [
            {src: 0, dst: 1},
            {src: 0, dst: 2},
            {src: 2, dst: 3},
            {src: 3, dst: 0},
            {src: 3, dst: 4},
            {src: 3, dst: 5},
        ],
    },
};

export const Json: Story = {
    args: {
        dataProvider: "json",
        dataProviderConfig: {
            data: "https://raw.githubusercontent.com/apowers313/graphty/refs/heads/master/test/helpers/data2.json",
        },
    },
};
