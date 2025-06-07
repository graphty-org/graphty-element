import "../index.ts";
import type {Meta, StoryObj} from "@storybook/web-components";
import {Graphty} from "../src/webcomponent.ts";

const meta: Meta = {
    title: "Graphty",
    tags: ["autodocs"],
    component: "graphty-element",
    parameters: {
        controls: {exclude: /^(#|_)/},
    },
};
export default meta;

type Story = StoryObj<Graphty>

export const Basic: Story = {
};
