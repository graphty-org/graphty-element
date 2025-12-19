/**
 * AI Controller Demo Story
 * Demonstrates the AI command infrastructure with mock responses.
 */

import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {html, type TemplateResult} from "lit";
import {z} from "zod";

import {AiController} from "../../src/ai/AiController";
import type {AiStatus} from "../../src/ai/AiStatus";
import {CommandRegistry} from "../../src/ai/commands";
import type {CommandContext, CommandResult} from "../../src/ai/commands/types";
import {MockLlmProvider} from "../../src/ai/providers/MockLlmProvider";

// Create controller elements after DOM is ready
function setupDemo(): void {
    const provider = new MockLlmProvider();
    const registry = new CommandRegistry();

    // Register demo commands
    registry.register({
        name: "changeColor",
        description: "Change the demo box color",
        parameters: z.object({color: z.string()}),
        examples: [
            {input: "make it red", params: {color: "red"}},
            {input: "make it blue", params: {color: "blue"}},
        ],
        execute: (_graph, params): Promise<CommandResult> => {
            const box = document.getElementById("demo-box");

            if (box) {
                box.style.backgroundColor = params.color as string;
            }

            return Promise.resolve({success: true, message: `Changed color to ${params.color}`});
        },
    });

    registry.register({
        name: "changeSize",
        description: "Change the demo box size",
        parameters: z.object({size: z.number()}),
        examples: [
            {input: "make it bigger", params: {size: 300}},
            {input: "make it smaller", params: {size: 100}},
        ],
        execute: (_graph, params): Promise<CommandResult> => {
            const box = document.getElementById("demo-box");

            if (box) {
                const size = params.size as number;

                box.style.width = `${size}px`;
                box.style.height = `${size}px`;
            }

            return Promise.resolve({success: true, message: `Changed size to ${params.size}px`});
        },
    });

    registry.register({
        name: "resetBox",
        description: "Reset the demo box to default state",
        parameters: z.object({}),
        examples: [
            {input: "reset", params: {}},
            {input: "start over", params: {}},
        ],
        execute: (): Promise<CommandResult> => {
            const box = document.getElementById("demo-box");

            if (box) {
                box.style.backgroundColor = "#cccccc";
                box.style.width = "200px";
                box.style.height = "200px";
            }

            return Promise.resolve({success: true, message: "Box reset to default"});
        },
    });

    // Configure mock responses
    provider.setResponse("red", {
        text: "Making it red!",
        toolCalls: [{id: "1", name: "changeColor", arguments: {color: "#ff4444"}}],
    });
    provider.setResponse("blue", {
        text: "Making it blue!",
        toolCalls: [{id: "1", name: "changeColor", arguments: {color: "#4444ff"}}],
    });
    provider.setResponse("green", {
        text: "Making it green!",
        toolCalls: [{id: "1", name: "changeColor", arguments: {color: "#44ff44"}}],
    });
    provider.setResponse("purple", {
        text: "Making it purple!",
        toolCalls: [{id: "1", name: "changeColor", arguments: {color: "#9944ff"}}],
    });
    provider.setResponse("bigger", {
        text: "Making it bigger!",
        toolCalls: [{id: "1", name: "changeSize", arguments: {size: 300}}],
    });
    provider.setResponse("smaller", {
        text: "Making it smaller!",
        toolCalls: [{id: "1", name: "changeSize", arguments: {size: 100}}],
    });
    provider.setResponse("reset", {
        text: "Resetting the box!",
        toolCalls: [{id: "1", name: "resetBox", arguments: {}}],
    });
    provider.setResponse("start over", {
        text: "Starting fresh!",
        toolCalls: [{id: "1", name: "resetBox", arguments: {}}],
    });

    // Default response for unknown commands
    provider.setDefaultResponse({
        text: "I can help you change the box! Try:\n• 'make it red/blue/green/purple'\n• 'make it bigger/smaller'\n• 'reset' or 'start over'",
        toolCalls: [],
    });

    // Create a mock graph object (not used in this demo but required by AiController)
    // This demo doesn't interact with the actual graph - commands manipulate DOM elements instead
    const mockGraph = {} as CommandContext["graph"];

    const controller = new AiController({
        provider,
        commandRegistry: registry,
        graph: mockGraph,
    });

    // Wire up UI
    const input = document.getElementById("ai-input") as HTMLInputElement | null;
    const button = document.getElementById("ai-submit") as HTMLButtonElement | null;
    const status = document.getElementById("ai-status");
    const response = document.getElementById("ai-response");

    if (!input || !button || !status || !response) {
        console.error("Required elements not found");

        return;
    }

    // Update status display
    const updateStatusDisplay = (s: AiStatus): void => {
        status.textContent = `Status: ${s.state}`;
        status.className = `status ${s.state}`;
    };

    controller.onStatusChange(updateStatusDisplay);

    // Handle submit
    const handleSubmit = async(): Promise<void> => {
        const value = input.value.trim();
        if (!value) {
            return;
        }

        response.textContent = "Processing...";
        button.disabled = true;

        try {
            const result = await controller.execute(value);
            response.textContent = result.message;
        } catch (error) {
            response.textContent = `Error: ${(error as Error).message}`;
        } finally {
            button.disabled = false;
        }
    };

    button.addEventListener("click", () => void handleSubmit());
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            void handleSubmit();
        }
    });
}

const meta: Meta = {
    title: "AI/Controller Demo",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
# AI Controller Demo

This demo showcases the AI command infrastructure with mock LLM responses.
The AiController processes natural language input and executes registered commands.

## Available Commands

- **changeColor**: Changes the demo box color
- **changeSize**: Changes the demo box size
- **resetBox**: Resets the box to default state

## Try These Commands

- "make it red" / "make it blue" / "make it green" / "make it purple"
- "make it bigger" / "make it smaller"
- "reset" / "start over"

## Architecture

This demo uses:
- **MockLlmProvider**: Returns predefined responses for testing
- **CommandRegistry**: Manages available commands
- **AiController**: Orchestrates the LLM and command execution
- **AiStatusManager**: Tracks execution state (ready → submitted → streaming → executing → ready)
                `,
            },
        },
    },
    render: (): TemplateResult => {
        // Use setTimeout to set up demo after DOM renders
        setTimeout(setupDemo, 0);

        return html`
            <style>
                .demo-container {
                    padding: 20px;
                    font-family: system-ui, -apple-system, sans-serif;
                    max-width: 500px;
                }
                .input-row {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                #ai-input {
                    flex: 1;
                    padding: 10px 12px;
                    font-size: 14px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    outline: none;
                }
                #ai-input:focus {
                    border-color: #2196f3;
                    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
                }
                #ai-submit {
                    padding: 10px 20px;
                    font-size: 14px;
                    background: #2196f3;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }
                #ai-submit:hover {
                    background: #1976d2;
                }
                #ai-submit:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }
                .status {
                    padding: 8px 12px;
                    margin: 12px 0;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                }
                .status.ready {
                    background: #e8f5e9;
                    color: #2e7d32;
                }
                .status.submitted {
                    background: #fff3e0;
                    color: #e65100;
                }
                .status.streaming {
                    background: #e3f2fd;
                    color: #1565c0;
                }
                .status.executing {
                    background: #f3e5f5;
                    color: #7b1fa2;
                }
                .status.error {
                    background: #ffebee;
                    color: #c62828;
                }
                #ai-response {
                    padding: 12px;
                    background: #f5f5f5;
                    border-radius: 6px;
                    margin: 12px 0;
                    min-height: 40px;
                    font-size: 14px;
                    white-space: pre-wrap;
                }
                #demo-box {
                    width: 200px;
                    height: 200px;
                    background: #ccc;
                    margin: 20px 0;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: rgba(0, 0, 0, 0.3);
                    font-size: 12px;
                }
                .commands-hint {
                    font-size: 12px;
                    color: #666;
                    margin-top: 16px;
                    padding: 12px;
                    background: #fafafa;
                    border-radius: 6px;
                }
                .commands-hint strong {
                    color: #333;
                }
            </style>
            <div class="demo-container">
                <h2>AI Controller Demo</h2>
                <p>Control the box below using natural language commands.</p>

                <div class="input-row">
                    <input id="ai-input" type="text" placeholder="Enter command... (e.g., 'make it red')">
                    <button id="ai-submit">Send</button>
                </div>

                <div id="ai-status" class="status ready">Status: ready</div>
                <div id="ai-response">Enter a command above to get started.</div>

                <div id="demo-box">Demo Box</div>

                <div class="commands-hint">
                    <strong>Try these commands:</strong><br>
                    • "make it red", "make it blue", "make it green", "make it purple"<br>
                    • "make it bigger", "make it smaller"<br>
                    • "reset" or "start over"
                </div>
            </div>
        `;
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {};
