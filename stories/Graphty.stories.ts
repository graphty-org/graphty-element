import "../index.ts";
import type {Meta, StoryObj} from "@storybook/web-components";
import {Graphty} from "../src/webcomponent.ts";

const meta: Meta = {
    title: "Graphty",
    tags: ["autodocs"],
    component: "graphty-core",
};
export default meta;

// export const Default = () => "<graphty-core></graphty-core>";

type Story = StoryObj<Graphty>

export const Foo: Story = {
    parameters: {
        controls: {include: ["thing"]},
    },
};

export const Blah: Story = {
    args: {
        thing: true,
    },

    parameters: {
        controls: {
            include: ["thing"],
        },
    },
};
