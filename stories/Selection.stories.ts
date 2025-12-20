/**
 * Node Selection Stories
 *
 * Demonstrates the node selection feature across different view modes.
 * Click on a node to select it - selected nodes show a yellow outline.
 * Click on the background to deselect.
 */
import "../index.ts";

import type {Meta, StoryObj} from "@storybook/web-components-vite";

import {type StyleSchema, StyleTemplate, type ViewMode} from "../src/config";
import {Graphty} from "../src/graphty-element";
import {eventWaitingDecorator, waitForGraphSettled} from "./helpers";

// Sample data with named nodes for clarity
const selectionNodeData = [
    {id: "alpha", label: "Alpha"},
    {id: "beta", label: "Beta"},
    {id: "gamma", label: "Gamma"},
    {id: "delta", label: "Delta"},
    {id: "epsilon", label: "Epsilon"},
];

const selectionEdgeData = [
    {src: "alpha", dst: "beta"},
    {src: "alpha", dst: "gamma"},
    {src: "beta", dst: "delta"},
    {src: "gamma", dst: "delta"},
    {src: "delta", dst: "epsilon"},
];

// Create a style template with node labels
const createStyleTemplate = (viewMode: ViewMode): StyleSchema => StyleTemplate.parse({
    graphtyTemplate: true,
    majorVersion: "1",
    graph: {
        viewMode,
        addDefaultStyle: true,
        startingCameraDistance: 20,
    },
    layers: [
        {
            node: {
                selector: "",
                style: {
                    shape: {
                        type: "sphere",
                        size: 1.5,
                    },
                    texture: {
                        color: "#4A90D9",
                    },
                    label: {
                        enabled: true,
                        textPath: "label",
                        fontSize: 14,
                        textColor: "#FFFFFF",
                        backgroundColor: "transparent",
                        location: "top",
                    },
                },
            },
        },
    ],
    behavior: {
        layout: {
            type: "ngraph",
            preSteps: 2000,
        },
    },
});

/**
 * Render function that creates a selection demo with status display
 */
const renderSelectionDemo = (viewMode: ViewMode): HTMLDivElement => {
    // Prevent document scrolling to avoid browser's focus-scroll behavior.
    // When clicking on the canvas, browsers auto-scroll to bring focused elements into view,
    // which can hide the status bar. For fullscreen stories, the document should never scroll.
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    // Reset any existing scroll position
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Create container - use position: fixed to be independent of document scroll
    const container = document.createElement("div");
    container.style.cssText = "position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; overflow: hidden;";

    // Create status bar
    const statusBar = document.createElement("div");
    statusBar.style.cssText = `
        padding: 12px 16px;
        background: #2a2a2a;
        color: #fff;
        font-family: system-ui, sans-serif;
        font-size: 14px;
        border-bottom: 1px solid #444;
        display: flex;
        align-items: center;
        gap: 16px;
        flex-shrink: 0;
    `;
    statusBar.innerHTML = `
        <span style="color: #888;">Selected Node:</span>
        <span id="selected-node-display" style="font-weight: 600; color: #4A90D9;">None</span>
        <span style="margin-left: auto; color: #666; font-size: 12px;">
            Click a node to select • Click background to deselect
        </span>
    `;
    container.appendChild(statusBar);

    // Create graph element
    // min-height: 0 is required for flexbox - without it, flex items have min-height: auto
    // which prevents them from shrinking below their content size
    const graphEl = document.createElement("graphty-element") as Graphty;
    graphEl.style.cssText = "flex: 1; display: block; min-height: 0;";
    graphEl.nodeData = selectionNodeData;
    graphEl.edgeData = selectionEdgeData;
    graphEl.styleTemplate = createStyleTemplate(viewMode);
    graphEl.layoutConfig = {seed: 42};
    container.appendChild(graphEl);

    // Set up selection change listener
    graphEl.addEventListener("selection-changed", (event) => {
        const display = container.querySelector("#selected-node-display");
        if (display) {
            const customEvent = event as CustomEvent<{currentNode: {id: string, data: {label?: string}} | null}>;
            const node = customEvent.detail.currentNode;
            if (node) {
                const label = node.data.label ?? node.id;
                display.textContent = `${label} (${node.id})`;
                (display as HTMLElement).style.color = "#FFFF00";
            } else {
                display.textContent = "None";
                (display as HTMLElement).style.color = "#4A90D9";
            }
        }
    });

    return container;
};

const meta: Meta = {
    title: "Selection",
    component: "graphty-element",
    decorators: [eventWaitingDecorator],
    parameters: {
        layout: "fullscreen",
    },
};
export default meta;

type Story = StoryObj<Graphty>;

/**
 * 2D Mode Selection
 *
 * Click on nodes to select them in 2D orthographic view.
 * Selected nodes display a yellow outline.
 */
export const Mode2D: Story = {
    name: "2D Mode",
    render: () => renderSelectionDemo("2d"),
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

/**
 * 3D Mode Selection
 *
 * Click on nodes to select them in 3D perspective view.
 * You can orbit the camera while maintaining selection.
 */
export const Mode3D: Story = {
    name: "3D Mode",
    render: () => renderSelectionDemo("3d"),
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

/**
 * VR Mode Selection
 *
 * Enter VR mode to select nodes using VR controllers.
 * Requires a WebXR-compatible browser and VR headset.
 *
 * Note: VR selection uses controller raycasting instead of mouse clicks.
 */
export const ModeVR: Story = {
    name: "VR Mode",
    render: () => {
        const container = renderSelectionDemo("vr");

        // Add VR-specific instructions
        const statusBar = container.querySelector("div");
        if (statusBar) {
            const vrNote = document.createElement("span");
            vrNote.style.cssText = "color: #ff9800; font-size: 12px; margin-left: 8px;";
            vrNote.textContent = "⚠️ Requires VR headset";
            statusBar.appendChild(vrNote);
        }

        return container;
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

/**
 * AR Mode Selection
 *
 * Enter AR mode to select nodes in augmented reality.
 * Requires a WebXR-compatible browser and AR-capable device.
 */
export const ModeAR: Story = {
    name: "AR Mode",
    render: () => {
        const container = renderSelectionDemo("ar");

        // Add AR-specific instructions
        const statusBar = container.querySelector("div");
        if (statusBar) {
            const arNote = document.createElement("span");
            arNote.style.cssText = "color: #ff9800; font-size: 12px; margin-left: 8px;";
            arNote.textContent = "⚠️ Requires AR-capable device";
            statusBar.appendChild(arNote);
        }

        return container;
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};

/**
 * Programmatic Selection
 *
 * Demonstrates using the Graph API to select nodes programmatically.
 * Click the buttons to select specific nodes.
 */
export const Programmatic: Story = {
    name: "Programmatic Selection",
    render: () => {
        // Prevent document scrolling to avoid browser's focus-scroll behavior.
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        // Reset any existing scroll position
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Create container - use position: fixed to be independent of document scroll
        const container = document.createElement("div");
        container.style.cssText = "position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; overflow: hidden;";

        // Create button bar
        const buttonBar = document.createElement("div");
        buttonBar.style.cssText = `
            padding: 12px 16px;
            background: #2a2a2a;
            color: #fff;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            border-bottom: 1px solid #444;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            flex-shrink: 0;
        `;

        const buttonStyle = `
            padding: 6px 12px;
            border: 1px solid #555;
            border-radius: 4px;
            background: #333;
            color: #fff;
            cursor: pointer;
            font-size: 12px;
        `;

        // Create buttons for each node
        selectionNodeData.forEach((node) => {
            const btn = document.createElement("button");
            btn.style.cssText = buttonStyle;
            btn.textContent = `Select ${node.label}`;
            btn.addEventListener("click", () => {
                const graphEl = container.querySelector("graphty-element");
                if (graphEl) {
                    const {graph} = graphEl as Graphty;
                    graph.selectNode(node.id);
                }
            });
            buttonBar.appendChild(btn);
        });

        // Deselect button
        const deselectBtn = document.createElement("button");
        deselectBtn.style.cssText = `${buttonStyle}background: #553333; border-color: #773333;`;
        deselectBtn.textContent = "Deselect";
        deselectBtn.addEventListener("click", () => {
            const graphEl = container.querySelector("graphty-element");
            if (graphEl) {
                const {graph} = graphEl as Graphty;
                graph.deselectNode();
            }
        });
        buttonBar.appendChild(deselectBtn);

        // Status display
        const status = document.createElement("span");
        status.id = "selected-node-display";
        status.style.cssText = "margin-left: auto; color: #4A90D9; font-weight: 600;";
        status.textContent = "None selected";
        buttonBar.appendChild(status);

        container.appendChild(buttonBar);

        // Create graph element
        // min-height: 0 is required for flexbox - without it, flex items have min-height: auto
        // which prevents them from shrinking below their content size
        const graphEl = document.createElement("graphty-element") as Graphty;
        graphEl.style.cssText = "flex: 1; display: block; min-height: 0;";
        graphEl.nodeData = selectionNodeData;
        graphEl.edgeData = selectionEdgeData;
        graphEl.styleTemplate = createStyleTemplate("3d");
        graphEl.layoutConfig = {seed: 42};
        container.appendChild(graphEl);

        // Set up selection change listener
        graphEl.addEventListener("selection-changed", (event) => {
            const display = container.querySelector("#selected-node-display");
            if (display) {
                const customEvent = event as CustomEvent<{currentNode: {id: string, data: {label?: string}} | null}>;
                const node = customEvent.detail.currentNode;
                if (node) {
                    const label = node.data.label ?? node.id;
                    display.textContent = `Selected: ${label}`;
                    (display as HTMLElement).style.color = "#FFFF00";
                } else {
                    display.textContent = "None selected";
                    (display as HTMLElement).style.color = "#4A90D9";
                }
            }
        });

        return container;
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);
    },
};
