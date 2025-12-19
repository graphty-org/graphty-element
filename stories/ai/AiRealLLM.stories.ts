/**
 * AI Real LLM Test Story
 * Demonstrates the full AI pipeline with real LLM providers (OpenAI, Anthropic, Google).
 * Phase 5: Test with actual API keys and real LLM responses.
 * Phase 7: Added screenshot capture and key persistence.
 */

import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {html, type TemplateResult} from "lit";

import type {AiStatus} from "../../src/ai/AiStatus";
import {ApiKeyManager} from "../../src/ai/keys/ApiKeyManager";
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

// Key persistence manager
const keyManager = new ApiKeyManager();
const PERSISTENCE_KEY = "graphty-ai-story-demo";

// Setup demo with real LLM integration
async function setupRealLlmDemo(): Promise<void> {
    const element = document.querySelector<GraphtyElement>("graphty-element");
    const providerSelect = document.getElementById("provider") as HTMLSelectElement | null;
    const keyInput = document.getElementById("api-key") as HTMLInputElement | null;
    const rememberKeyCheckbox = document.getElementById("remember-key") as HTMLInputElement | null;
    const connectBtn = document.getElementById("connect") as HTMLButtonElement | null;
    const input = document.getElementById("cmd-input") as HTMLInputElement | null;
    const submitBtn = document.getElementById("cmd-submit") as HTMLButtonElement | null;
    const screenshotBtn = document.getElementById("screenshot-btn") as HTMLButtonElement | null;
    const downloadScreenshotBtn = document.getElementById("download-screenshot-btn") as HTMLButtonElement | null;
    const retryBtn = document.getElementById("retry-btn") as HTMLButtonElement | null;
    const status = document.getElementById("status");
    const response = document.getElementById("output");
    const commandLog = document.getElementById("command-log");

    if (!element || !providerSelect || !keyInput || !connectBtn || !input ||
        !submitBtn || !status || !response || !commandLog || !rememberKeyCheckbox ||
        !screenshotBtn || !downloadScreenshotBtn || !retryBtn) {
        console.error("Required elements not found");
        return;
    }

    // Wait a short time for element initialization
    await new Promise((resolve) => setTimeout(resolve, 100));

    const {graph} = element;

    // Add sample data
    await graph.addNodes(SAMPLE_NODES);
    await graph.addEdges(SAMPLE_EDGES);

    // Check for persisted keys and load them
    const loadPersistedKeys = (): void => {
        try {
            keyManager.enablePersistence({
                encryptionKey: PERSISTENCE_KEY,
                storage: "localStorage",
            });

            const selectedProvider = providerSelect.value as "openai" | "anthropic" | "google";
            const savedKey = keyManager.getKey(selectedProvider);

            if (savedKey) {
                keyInput.value = savedKey;
                rememberKeyCheckbox.checked = true;
            }
        } catch {
            // No persisted keys or error loading
            keyManager.disablePersistence();
        }
    };

    // Load persisted keys on provider change
    providerSelect.addEventListener("change", () => {
        if (rememberKeyCheckbox.checked) {
            const selectedProvider = providerSelect.value as "openai" | "anthropic" | "google";
            const savedKey = keyManager.getKey(selectedProvider);
            keyInput.value = savedKey ?? "";
        }
    });

    // Initial load
    loadPersistedKeys();

    // Track connection state
    let isConnected = false;

    // Update status display
    const updateStatusDisplay = (s: AiStatus): void => {
        const statusBadge = document.getElementById("ai-status");
        if (statusBadge) {
            statusBadge.textContent = s.state;
            statusBadge.className = `status-badge ${s.state}`;

            if (s.toolCalls && s.toolCalls.length > 0) {
                const toolInfo = s.toolCalls.map((tc) => tc.name).join(", ");
                statusBadge.textContent += ` (${toolInfo})`;
            }
        }

        // Enable/disable retry button based on error state
        retryBtn.disabled = s.state !== "error";
    };

    // Log function
    const logCommand = (inputText: string, result: string, success: boolean): void => {
        const entry = document.createElement("div");
        entry.className = `log-entry ${success ? "success" : "error"}`;
        entry.innerHTML = `
            <span class="log-input">&gt; ${inputText}</span>
            <span class="log-result">${result}</span>
        `;
        commandLog.insertBefore(entry, commandLog.firstChild);

        // Keep only last 10 entries
        while (commandLog.children.length > 10) {
            commandLog.removeChild(commandLog.lastChild as Node);
        }
    };

    // Connect button handler
    connectBtn.addEventListener("click", () => {
        void (async() => {
            const provider = providerSelect.value as "openai" | "anthropic" | "google";
            const apiKey = keyInput.value.trim();

            if (!apiKey) {
                status.textContent = "⚠️ Please enter an API key";
                status.style.color = "#e65100";
                return;
            }

            try {
                status.textContent = `🔄 Connecting to ${provider}...`;
                status.style.color = "#1565c0";
                connectBtn.disabled = true;

                // Enable AI control with real provider
                await graph.enableAiControl({provider, apiKey});

                // Subscribe to status updates
                graph.onAiStatusChange(updateStatusDisplay);

                // Save key if remember is checked
                if (rememberKeyCheckbox.checked) {
                    keyManager.enablePersistence({
                        encryptionKey: PERSISTENCE_KEY,
                        storage: "localStorage",
                    });
                    keyManager.setKey(provider, apiKey);
                } else {
                    // Clear any previously saved key
                    keyManager.disablePersistence();
                }

                isConnected = true;
                status.textContent = `✓ Connected to ${provider}`;
                status.style.color = "#2e7d32";
                submitBtn.disabled = false;
                screenshotBtn.disabled = false;
                downloadScreenshotBtn.disabled = false;

                response.textContent = "Ready! Try natural language commands like:\n• \"Make all nodes red\"\n• \"Switch to circular layout\"\n• \"Show from top\"\n• \"How many nodes are there?\"";
            } catch (error) {
                status.textContent = `✗ Connection failed: ${(error as Error).message}`;
                status.style.color = "#c62828";
                isConnected = false;
            } finally {
                connectBtn.disabled = false;
            }
        })();
    });

    // Handle command submit
    const handleSubmit = async(): Promise<void> => {
        if (!isConnected) {
            response.textContent = "Please connect to an LLM provider first.";
            return;
        }

        const value = input.value.trim();
        if (!value) {
            return;
        }

        response.textContent = "🔄 Processing with real LLM...";
        submitBtn.disabled = true;

        try {
            const result = await graph.aiCommand(value);

            let outputText = result.message;
            if (result.data) {
                outputText += `\n\nData: ${JSON.stringify(result.data, null, 2)}`;
            }

            response.textContent = outputText;
            logCommand(value, result.success ? `✓ ${result.message}` : `✗ ${result.message}`, result.success);
        } catch (error) {
            const errorMsg = `Error: ${(error as Error).message}`;
            response.textContent = errorMsg;
            logCommand(value, errorMsg, false);
        } finally {
            submitBtn.disabled = false;
            input.value = "";
            input.focus();
        }
    };

    submitBtn.addEventListener("click", () => void handleSubmit());
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            void handleSubmit();
        }
    });

    // Screenshot handlers (Phase 7)
    screenshotBtn.addEventListener("click", () => {
        void (async() => {
            try {
                response.textContent = "📸 Capturing screenshot...";
                const result = await graph.captureScreenshot({format: "png"});
                response.textContent = `✓ Screenshot captured (${result.metadata.width}x${result.metadata.height}, ${(result.metadata.byteSize / 1024).toFixed(1)}KB)`;
            } catch (error) {
                response.textContent = `✗ Screenshot failed: ${(error as Error).message}`;
            }
        })();
    });

    downloadScreenshotBtn.addEventListener("click", () => {
        void (async() => {
            try {
                response.textContent = "📸 Capturing and downloading screenshot...";
                const result = await graph.captureScreenshot({
                    format: "png",
                    destination: {blob: true, download: true},
                    downloadFilename: `graph-${new Date().toISOString().replace(/[:.]/g, "-")}.png`,
                });
                response.textContent = `✓ Screenshot downloaded (${result.metadata.width}x${result.metadata.height})`;
            } catch (error) {
                response.textContent = `✗ Screenshot download failed: ${(error as Error).message}`;
            }
        })();
    });

    // Retry handler (Phase 7)
    retryBtn.addEventListener("click", () => {
        void (async() => {
            try {
                response.textContent = "🔄 Retrying last command...";
                retryBtn.disabled = true;

                const result = await graph.retryLastAiCommand();

                let outputText = `Retry: ${result.message}`;
                if (result.data) {
                    outputText += `\n\nData: ${JSON.stringify(result.data, null, 2)}`;
                }

                response.textContent = outputText;
                logCommand("[retry]", result.success ? `✓ ${result.message}` : `✗ ${result.message}`, result.success);
            } catch (error) {
                const errorMsg = `Retry Error: ${(error as Error).message}`;
                response.textContent = errorMsg;
            } finally {
                retryBtn.disabled = true; // Re-disable until next error
            }
        })();
    });

    // Initial status
    status.textContent = "Select provider and enter API key to connect";
    response.textContent = `Graph loaded with ${SAMPLE_NODES.length} nodes and ${SAMPLE_EDGES.length} edges.\n\nConnect to an LLM provider to start using natural language commands.`;
}

const meta: Meta = {
    title: "AI/Real LLM Test",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
# Real LLM Test

This story allows you to test the AI graph control with **real LLM providers**.

## Setup

1. Select your preferred LLM provider (OpenAI, Anthropic, or Google)
2. Enter your API key
3. Optionally check "Remember Key" to persist the key (encrypted in localStorage)
4. Click "Connect" to establish connection

## Available Commands

With a real LLM, you can use natural language freely:

### Style Commands (Phase 5)
- "Make all nodes red"
- "Highlight server nodes in blue"
- "Make nodes bigger"
- "Clear all styling"

### Camera Commands (Phase 5)
- "Show from top"
- "View from the side"
- "Zoom to fit all nodes"
- "Isometric view"

### Layout Commands
- "Use circular layout"
- "Switch to force-directed layout"
- "Spiral layout"

### Query Commands
- "How many nodes are there?"
- "Give me a summary of the graph"

### Dimension Commands
- "Switch to 2D view"
- "Show in 3D"

## Features (Phase 7)

### Screenshot Capture
- Click "📸 Capture" to take a screenshot
- Click "💾 Download" to save screenshot as PNG

### Key Persistence
- Check "Remember Key" to save your API key (encrypted)
- Keys are stored per-provider

### Retry
- If a command fails, click "🔄 Retry" to try again

## API Keys

Get your API keys from:
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys
- **Google**: https://makersuite.google.com/app/apikey

⚠️ **Security Note**: API keys are only used locally. When "Remember Key" is checked, keys are encrypted before being stored in localStorage.
                `,
            },
        },
    },
    render: (): TemplateResult => {
        // Use setTimeout to setup demo after DOM renders
        setTimeout(() => void setupRealLlmDemo(), 100);

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
                    min-width: 380px;
                    max-width: 450px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .panel-section {
                    background: #fafafa;
                    border-radius: 8px;
                    padding: 16px;
                }
                .section-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 12px;
                }
                .connection-row {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                #provider {
                    padding: 8px 12px;
                    font-size: 14px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    background: white;
                }
                #api-key {
                    flex: 1;
                    min-width: 150px;
                    padding: 8px 12px;
                    font-size: 14px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                }
                #connect {
                    padding: 8px 16px;
                    font-size: 14px;
                    background: #4caf50;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }
                #connect:hover {
                    background: #43a047;
                }
                #connect:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }
                .remember-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 8px;
                    font-size: 13px;
                    color: #666;
                }
                .remember-row input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                }
                #status {
                    font-size: 14px;
                    padding: 8px 0;
                    color: #666;
                }
                .input-row {
                    display: flex;
                    gap: 8px;
                }
                #cmd-input {
                    flex: 1;
                    padding: 12px;
                    font-size: 14px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    outline: none;
                }
                #cmd-input:focus {
                    border-color: #2196f3;
                    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
                }
                #cmd-submit {
                    padding: 12px 20px;
                    font-size: 14px;
                    background: #2196f3;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }
                #cmd-submit:hover {
                    background: #1976d2;
                }
                #cmd-submit:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }
                .status-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .status-badge {
                    display: inline-block;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                }
                .status-badge.ready { background: #e8f5e9; color: #2e7d32; }
                .status-badge.submitted { background: #fff3e0; color: #e65100; }
                .status-badge.streaming { background: #e3f2fd; color: #1565c0; }
                .status-badge.executing { background: #f3e5f5; color: #7b1fa2; }
                .status-badge.error { background: #ffebee; color: #c62828; }
                #output {
                    padding: 14px;
                    background: #f5f5f5;
                    border-radius: 6px;
                    min-height: 80px;
                    max-height: 200px;
                    overflow-y: auto;
                    font-size: 14px;
                    white-space: pre-wrap;
                    line-height: 1.5;
                    font-family: ui-monospace, monospace;
                }
                .command-log-container {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    min-height: 150px;
                }
                #command-log {
                    flex: 1;
                    overflow-y: auto;
                    background: white;
                    border-radius: 6px;
                    padding: 8px;
                    font-size: 12px;
                    border: 1px solid #eee;
                }
                .log-entry {
                    padding: 6px 8px;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .log-entry:last-child {
                    border-bottom: none;
                }
                .log-entry.success .log-result { color: #2e7d32; }
                .log-entry.error .log-result { color: #c62828; }
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
                    background: #fff;
                    border-radius: 6px;
                    line-height: 1.6;
                    border: 1px solid #eee;
                }
                .commands-hint strong {
                    color: #333;
                }
                .action-buttons {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                }
                .action-btn {
                    padding: 8px 12px;
                    font-size: 13px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .action-btn.screenshot {
                    background: #9c27b0;
                    color: white;
                }
                .action-btn.screenshot:hover:not(:disabled) {
                    background: #7b1fa2;
                }
                .action-btn.download {
                    background: #ff9800;
                    color: white;
                }
                .action-btn.download:hover:not(:disabled) {
                    background: #f57c00;
                }
                .action-btn.retry {
                    background: #607d8b;
                    color: white;
                }
                .action-btn.retry:hover:not(:disabled) {
                    background: #455a64;
                }
            </style>
            <div class="demo-layout">
                <div class="graph-container">
                    <graphty-element></graphty-element>
                </div>
                <div class="control-panel">
                    <h3 style="margin: 0;">🤖 Real LLM Test</h3>
                    <p style="margin: 0; color: #666; font-size: 14px;">
                        Connect to a real LLM provider and control the graph using natural language.
                    </p>

                    <div class="panel-section">
                        <div class="section-title">LLM Connection</div>
                        <div class="connection-row">
                            <select id="provider">
                                <option value="openai">OpenAI</option>
                                <option value="anthropic">Anthropic</option>
                                <option value="google">Google</option>
                            </select>
                            <input id="api-key" type="password" placeholder="API Key">
                            <button id="connect">Connect</button>
                        </div>
                        <div class="remember-row">
                            <input type="checkbox" id="remember-key">
                            <label for="remember-key">Remember Key (encrypted localStorage)</label>
                        </div>
                        <div id="status"></div>
                    </div>

                    <div class="panel-section">
                        <div class="section-title">Command Input</div>
                        <div class="input-row">
                            <input id="cmd-input" type="text" placeholder="Natural language command...">
                            <button id="cmd-submit" disabled>Send</button>
                        </div>
                        <div class="status-row" style="margin-top: 8px;">
                            <span style="font-size: 12px; color: #666;">Status:</span>
                            <span id="ai-status" class="status-badge ready">ready</span>
                        </div>
                        <div class="action-buttons">
                            <button id="screenshot-btn" class="action-btn screenshot" disabled>📸 Capture</button>
                            <button id="download-screenshot-btn" class="action-btn download" disabled>💾 Download</button>
                            <button id="retry-btn" class="action-btn retry" disabled>🔄 Retry</button>
                        </div>
                    </div>

                    <div class="panel-section">
                        <div class="section-title">Response</div>
                        <pre id="output">Loading graph...</pre>
                    </div>

                    <div class="command-log-container panel-section">
                        <div class="section-title">Command History</div>
                        <div id="command-log"></div>
                    </div>

                    <div class="commands-hint">
                        <strong>Try natural language:</strong><br>
                        • "Make all nodes blue"<br>
                        • "Switch to circular layout"<br>
                        • "Show from top"<br>
                        • "How many nodes are there?"<br>
                        • "Highlight nodes with high degree"
                    </div>
                </div>
            </div>
        `;
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {};
