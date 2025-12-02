/**
 * AI Graph Integration Story
 * Demonstrates the AiManager integrated with an actual Graph instance.
 * Phase 3: Real graph control via natural language commands.
 */

import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {html, type TemplateResult} from "lit";

import type {AiStatus} from "../../src/ai/AiStatus";
import {type GraphtyElement} from "../../src/graphty-element";

// Sample graph data
const SAMPLE_NODES = [
    {id: "A", label: "Server 1", type: "server"},
    {id: "B", label: "Server 2", type: "server"},
    {id: "C", label: "Client 1", type: "client"},
    {id: "D", label: "Client 2", type: "client"},
    {id: "E", label: "Client 3", type: "client"},
    {id: "F", label: "Router 1", type: "router"},
    {id: "G", label: "Router 2", type: "router"},
    {id: "H", label: "Database", type: "database"},
    {id: "I", label: "Cache", type: "cache"},
    {id: "J", label: "Load Balancer", type: "loadbalancer"},
];

const SAMPLE_EDGES = [
    {src: "J", dst: "A"},
    {src: "J", dst: "B"},
    {src: "A", dst: "H"},
    {src: "B", dst: "H"},
    {src: "A", dst: "I"},
    {src: "B", dst: "I"},
    {src: "C", dst: "F"},
    {src: "D", dst: "F"},
    {src: "E", dst: "G"},
    {src: "F", dst: "J"},
    {src: "G", dst: "J"},
];

// Setup demo with real graph integration
async function setupGraphDemo(): Promise<void> {
    const element = document.querySelector<GraphtyElement>("graphty-element");
    const input = document.getElementById("ai-input") as HTMLInputElement | null;
    const button = document.getElementById("ai-submit") as HTMLButtonElement | null;
    const status = document.getElementById("ai-status");
    const response = document.getElementById("ai-response");
    const commandLog = document.getElementById("command-log");

    if (!element || !input || !button || !status || !response || !commandLog) {
        console.error("Required elements not found");
        return;
    }

    // Wait a short time for element initialization
    await new Promise((resolve) => setTimeout(resolve, 100));

    const {graph} = element;

    // Add sample data
    await graph.addNodes(SAMPLE_NODES);
    await graph.addEdges(SAMPLE_EDGES);

    // Enable AI control with mock provider
    await graph.enableAiControl({provider: "mock"});

    // Configure mock responses for demo
    const aiManager = graph.getAiManager();
    if (aiManager) {
        const provider = aiManager.getProvider() as import("../../src/ai/providers/MockLlmProvider").MockLlmProvider;

        // Query commands
        provider.setResponse("how many", {
            text: "Let me check the graph statistics...",
            toolCalls: [{id: "1", name: "queryGraph", arguments: {query: "all"}}],
        });
        provider.setResponse("summary", {
            text: "Here's the graph summary...",
            toolCalls: [{id: "1", name: "queryGraph", arguments: {query: "summary"}}],
        });
        provider.setResponse("nodes", {
            text: "Counting nodes...",
            toolCalls: [{id: "1", name: "queryGraph", arguments: {query: "nodeCount"}}],
        });
        provider.setResponse("edges", {
            text: "Counting edges...",
            toolCalls: [{id: "1", name: "queryGraph", arguments: {query: "edgeCount"}}],
        });

        // Layout commands
        provider.setResponse("circular", {
            text: "Switching to circular layout...",
            toolCalls: [{id: "1", name: "setLayout", arguments: {type: "circular"}}],
        });
        provider.setResponse("circle", {
            text: "Arranging nodes in a circle...",
            toolCalls: [{id: "1", name: "setLayout", arguments: {type: "circular"}}],
        });
        provider.setResponse("force", {
            text: "Applying force-directed layout...",
            toolCalls: [{id: "1", name: "setLayout", arguments: {type: "ngraph"}}],
        });
        provider.setResponse("random", {
            text: "Randomizing node positions...",
            toolCalls: [{id: "1", name: "setLayout", arguments: {type: "random"}}],
        });
        provider.setResponse("spiral", {
            text: "Arranging in a spiral...",
            toolCalls: [{id: "1", name: "setLayout", arguments: {type: "spiral"}}],
        });
        provider.setResponse("shell", {
            text: "Arranging in shells...",
            toolCalls: [{id: "1", name: "setLayout", arguments: {type: "shell"}}],
        });

        // Dimension commands
        provider.setResponse("2d", {
            text: "Switching to 2D view...",
            toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
        });
        provider.setResponse("flat", {
            text: "Making it flat...",
            toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "2d"}}],
        });
        provider.setResponse("3d", {
            text: "Switching to 3D view...",
            toolCalls: [{id: "1", name: "setDimension", arguments: {dimension: "3d"}}],
        });

        // Default response
        provider.setDefaultResponse({
            text: `I can help you control the graph! Try:
• "how many nodes/edges" - Query graph statistics
• "circular layout" or "force layout" - Change layout
• "switch to 2D" or "show in 3D" - Change dimension
• "summary" - Get graph summary`,
            toolCalls: [],
        });
    }

    // Update status display
    const updateStatusDisplay = (s: AiStatus): void => {
        status.textContent = `Status: ${s.state}`;
        status.className = `status ${s.state}`;

        if (s.toolCalls && s.toolCalls.length > 0) {
            const toolInfo = s.toolCalls.map((tc) => `${tc.name}: ${tc.status}`).join(", ");
            status.textContent += ` (${toolInfo})`;
        }
    };

    graph.onAiStatusChange(updateStatusDisplay);

    // Log function
    const logCommand = (input: string, result: string): void => {
        const entry = document.createElement("div");
        entry.className = "log-entry";
        entry.innerHTML = `<span class="log-input">&gt; ${input}</span><span class="log-result">${result}</span>`;
        commandLog.insertBefore(entry, commandLog.firstChild);

        // Keep only last 10 entries
        while (commandLog.children.length > 10) {
            commandLog.removeChild(commandLog.lastChild as Node);
        }
    };

    // Handle submit
    const handleSubmit = async(): Promise<void> => {
        const value = input.value.trim();
        if (!value) {
            return;
        }

        response.textContent = "Processing...";
        button.disabled = true;

        try {
            const result = await graph.aiCommand(value);
            response.textContent = result.message;
            logCommand(value, result.success ? `✓ ${result.message}` : `✗ ${result.message}`);
        } catch (error) {
            const errorMsg = `Error: ${(error as Error).message}`;
            response.textContent = errorMsg;
            logCommand(value, `✗ ${errorMsg}`);
        } finally {
            button.disabled = false;
            input.value = "";
            input.focus();
        }
    };

    button.addEventListener("click", () => void handleSubmit());
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            void handleSubmit();
        }
    });

    // Initial status
    response.textContent = `Graph loaded with ${SAMPLE_NODES.length} nodes and ${SAMPLE_EDGES.length} edges. Try a command!`;
}

const meta: Meta = {
    title: "AI/Graph Integration",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
# AI Graph Integration Demo

This demo showcases the AiManager integrated with an actual Graph instance.
Use natural language commands to query and control the graph visualization.

## Available Commands

### Query Commands
- "How many nodes?" / "Count edges" - Get graph statistics
- "Summary" / "Show me the graph stats" - Get full graph summary

### Layout Commands
- "Use circular layout" / "Arrange in a circle"
- "Force directed layout" / "Use physics layout"
- "Random layout" / "Randomize positions"
- "Grid layout" / "Put in a grid"

### Dimension Commands
- "Switch to 2D" / "Make it flat"
- "Show in 3D" / "Enable 3D mode"

## Architecture

This demo uses:
- **AiManager**: Manages AI lifecycle with the Graph
- **Graph.enableAiControl()**: Integrates AI with graph instance
- **Graph.aiCommand()**: Send natural language commands
- **Built-in Commands**: queryGraph, setLayout, setDimension
                `,
            },
        },
    },
    render: (): TemplateResult => {
        // Use setTimeout to setup demo after DOM renders
        setTimeout(() => void setupGraphDemo(), 100);

        return html`
            <style>
                .demo-layout {
                    display: flex;
                    gap: 20px;
                    padding: 20px;
                    font-family: system-ui, -apple-system, sans-serif;
                    height: calc(100vh - 40px);
                }
                .graph-container {
                    flex: 2;
                    min-width: 400px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                }
                graphty-element {
                    width: 100%;
                    height: 100%;
                }
                .control-panel {
                    flex: 1;
                    min-width: 300px;
                    max-width: 400px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .input-row {
                    display: flex;
                    gap: 8px;
                }
                #ai-input {
                    flex: 1;
                    padding: 12px;
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
                    padding: 12px 20px;
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
                    padding: 10px 14px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                }
                .status.ready { background: #e8f5e9; color: #2e7d32; }
                .status.submitted { background: #fff3e0; color: #e65100; }
                .status.streaming { background: #e3f2fd; color: #1565c0; }
                .status.executing { background: #f3e5f5; color: #7b1fa2; }
                .status.error { background: #ffebee; color: #c62828; }
                #ai-response {
                    padding: 14px;
                    background: #f5f5f5;
                    border-radius: 6px;
                    min-height: 60px;
                    font-size: 14px;
                    white-space: pre-wrap;
                    line-height: 1.5;
                }
                .command-log-container {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .command-log-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: #666;
                    margin-bottom: 8px;
                }
                #command-log {
                    flex: 1;
                    overflow-y: auto;
                    background: #fafafa;
                    border-radius: 6px;
                    padding: 8px;
                    font-size: 12px;
                }
                .log-entry {
                    padding: 6px 8px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .log-entry:last-child {
                    border-bottom: none;
                }
                .log-input {
                    color: #1976d2;
                    font-family: monospace;
                }
                .log-result {
                    color: #555;
                    font-size: 11px;
                }
                .commands-hint {
                    font-size: 12px;
                    color: #666;
                    padding: 12px;
                    background: #fafafa;
                    border-radius: 6px;
                    line-height: 1.6;
                }
                .commands-hint strong {
                    color: #333;
                }
            </style>
            <div class="demo-layout">
                <div class="graph-container">
                    <graphty-element></graphty-element>
                </div>
                <div class="control-panel">
                    <h3 style="margin: 0;">AI Graph Control</h3>
                    <p style="margin: 0; color: #666; font-size: 14px;">
                        Control the graph using natural language commands.
                    </p>

                    <div class="input-row">
                        <input id="ai-input" type="text" placeholder="Enter command... (e.g., 'circular layout')">
                        <button id="ai-submit">Send</button>
                    </div>

                    <div id="ai-status" class="status ready">Status: ready</div>
                    <div id="ai-response">Loading graph...</div>

                    <div class="command-log-container">
                        <div class="command-log-title">Command History</div>
                        <div id="command-log"></div>
                    </div>

                    <div class="commands-hint">
                        <strong>Try these commands:</strong><br>
                        • "how many nodes" / "summary"<br>
                        • "circular layout" / "force layout" / "grid"<br>
                        • "switch to 2D" / "show in 3D"
                    </div>
                </div>
            </div>
        `;
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {};
