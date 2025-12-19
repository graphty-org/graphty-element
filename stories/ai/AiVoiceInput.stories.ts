/**
 * AI Voice Input Story
 * Demonstrates voice-controlled graph manipulation using the Web Speech API.
 */

import "../../src/graphty-element";

import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {html, type TemplateResult} from "lit";

const meta: Meta = {
    title: "AI/Voice Input",
    parameters: {
        layout: "fullscreen",
    },
};

export default meta;

// Sample graph data for the voice demo
const SAMPLE_NODES = [
    {id: "A", label: "Server 1", type: "server"},
    {id: "B", label: "Server 2", type: "server"},
    {id: "C", label: "Client 1", type: "client"},
    {id: "D", label: "Client 2", type: "client"},
    {id: "E", label: "Client 3", type: "client"},
    {id: "F", label: "Router 1", type: "router"},
    {id: "G", label: "Router 2", type: "router"},
    {id: "H", label: "Database", type: "database"},
];

const SAMPLE_EDGES = [
    {src: "A", dst: "H"},
    {src: "B", dst: "H"},
    {src: "C", dst: "F"},
    {src: "D", dst: "F"},
    {src: "E", dst: "G"},
    {src: "F", dst: "A"},
    {src: "G", dst: "B"},
];

interface VoiceGraph {
    addNodes: (nodes: Record<string, unknown>[]) => Promise<void>;
    addEdges: (edges: Record<string, unknown>[]) => Promise<void>;
    enableAiControl: (config: {provider: string}) => Promise<void>;
    getVoiceAdapter: () => {isSupported: boolean};
    startVoiceInput: (options: {
        continuous?: boolean;
        interimResults?: boolean;
        onTranscript?: (text: string, isFinal: boolean) => void;
        onStart?: (started: boolean, error?: string) => void;
    }) => boolean;
    stopVoiceInput: () => void;
    aiCommand: (text: string) => Promise<{success: boolean, message: string}>;
    isVoiceActive: () => boolean;
}

// Custom element type for graphty-element
type GraphtyElement = HTMLElement & {graph?: VoiceGraph};

/**
 * Setup voice input demo after DOM is ready.
 */
function setupVoiceDemo(): void {
    setTimeout(() => void (async() => {
        const graphEl = document.querySelector<GraphtyElement>("graphty-element");
        if (!graphEl) {
            console.error("Graph element not available");
            return;
        }

        const {graph} = graphEl;
        if (!graph) {
            console.error("Graph not available");
            return;
        }

        // Add sample data
        await graph.addNodes(SAMPLE_NODES);
        await graph.addEdges(SAMPLE_EDGES);

        // Enable AI control with mock provider
        await graph.enableAiControl({provider: "mock"});

        const micBtn = document.getElementById("mic-btn") as HTMLButtonElement | null;
        const transcript = document.getElementById("transcript");
        const status = document.getElementById("voice-status");
        const resultsDiv = document.getElementById("results");

        if (!micBtn || !transcript || !status || !resultsDiv) {
            console.error("Missing DOM elements");
            return;
        }

        // Check support
        const adapter = graph.getVoiceAdapter();
        if (!adapter.isSupported) {
            status.textContent = "⚠️ Voice input not supported in this browser. Try Chrome.";
            status.style.color = "#cc6600";
            micBtn.disabled = true;
            return;
        }

        status.textContent = "✓ Voice input supported. Click the button to start.";
        status.style.color = "#008800";

        let isListening = false;

        micBtn.onclick = () => {
            if (isListening) {
                graph.stopVoiceInput();
                micBtn.textContent = "🎤 Start Listening";
                micBtn.style.background = "";
                isListening = false;
                status.textContent = "Voice input stopped.";
            } else {
                // Show pending state while waiting for permission
                micBtn.textContent = "⏳ Requesting...";
                micBtn.disabled = true;
                status.textContent = "Requesting microphone permission...";

                graph.startVoiceInput({
                    continuous: true,
                    interimResults: true,
                    onStart: (started, error) => {
                        micBtn.disabled = false;
                        if (started) {
                            micBtn.textContent = "⏹ Stop";
                            micBtn.style.background = "#ff4444";
                            isListening = true;
                            status.textContent = "Listening... Speak a command.";
                        } else {
                            micBtn.textContent = "🎤 Start Listening";
                            micBtn.style.background = "";
                            status.textContent = `Failed to start voice input: ${error ?? "unknown error"}. Please check permissions.`;
                            status.style.color = "#cc0000";
                        }
                    },
                    onTranscript: (text, isFinal) => {
                        transcript.textContent = text;
                        transcript.style.fontStyle = isFinal ? "normal" : "italic";
                        transcript.style.color = isFinal ? "#000000" : "#666666";

                        if (isFinal && text.trim()) {
                            // Execute the command
                            void graph.aiCommand(text).then((result) => {
                                const resultEl = document.createElement("div");
                                resultEl.style.cssText = `
                                    padding: 8px;
                                    margin-bottom: 8px;
                                    border-radius: 4px;
                                    background: ${result.success ? "#e8f5e9" : "#ffebee"};
                                    border-left: 4px solid ${result.success ? "#4caf50" : "#f44336"};
                                `;
                                resultEl.innerHTML = `
                                    <strong>"${text}"</strong><br>
                                    <span style="color: ${result.success ? "#2e7d32" : "#c62828"}">${result.message}</span>
                                `;
                                resultsDiv.insertBefore(resultEl, resultsDiv.firstChild);

                                // Keep only last 5 results
                                while (resultsDiv.children.length > 5) {
                                    resultsDiv.lastChild?.remove();
                                }
                            });
                        }
                    },
                });
            }
        };
    })(), 500);
}

/**
 * Render the voice input demo template.
 */
function renderVoiceDemo(): TemplateResult {
    setupVoiceDemo();

    return html`
        <style>
            .voice-panel {
                position: absolute;
                top: 10px;
                left: 10px;
                background: white;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                z-index: 100;
                width: 320px;
            }
            .voice-panel h3 {
                margin-top: 0;
                margin-bottom: 12px;
            }
            #mic-btn {
                font-size: 18px;
                padding: 12px 24px;
                cursor: pointer;
                border: none;
                border-radius: 8px;
                background: #4caf50;
                color: white;
                transition: background 0.2s;
            }
            #mic-btn:hover:not(:disabled) {
                background: #45a049;
            }
            #mic-btn:disabled {
                background: #cccccc;
                cursor: not-allowed;
            }
            #voice-status {
                margin-top: 12px;
                font-size: 12px;
                min-height: 18px;
            }
            #transcript {
                margin-top: 12px;
                padding: 12px;
                background: #f5f5f5;
                min-height: 40px;
                border-radius: 4px;
                font-size: 14px;
            }
            .examples {
                margin-top: 12px;
                font-size: 12px;
                color: #666;
            }
            .examples ul {
                margin: 4px 0 0 0;
                padding-left: 20px;
            }
            #results {
                margin-top: 12px;
                max-height: 200px;
                overflow-y: auto;
            }
        </style>
        <div style="width: 100%; height: 600px; position: relative;">
            <graphty-element layout-type="ngraph"></graphty-element>
            <div class="voice-panel">
                <h3>🎙️ Voice Input</h3>
                <div id="voice-status"></div>
                <button id="mic-btn">🎤 Start Listening</button>
                <div id="transcript"></div>
                <div class="examples">
                    <strong>Try saying:</strong>
                    <ul>
                        <li>"Make all nodes red"</li>
                        <li>"Switch to circular layout"</li>
                        <li>"Show from top"</li>
                        <li>"How many nodes are there?"</li>
                    </ul>
                </div>
                <div id="results"></div>
            </div>
        </div>
    `;
}

export const Default: StoryObj = {
    render: () => renderVoiceDemo(),
};

/**
 * Browser support information story.
 */
export const BrowserSupport: StoryObj = {
    render: () => html`
        <div style="padding: 24px; max-width: 600px; font-family: system-ui, sans-serif;">
            <h2>🎙️ Voice Input Browser Support</h2>
            <p>Voice input uses the <strong>Web Speech API</strong> which has varying support across browsers:</p>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <thead>
                    <tr style="background: #f5f5f5;">
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Browser</th>
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Support</th>
                        <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Notes</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">Chrome</td>
                        <td style="padding: 12px; border: 1px solid #ddd; color: #008800;">✓ Full Support</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">Best support, requires internet</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">Edge</td>
                        <td style="padding: 12px; border: 1px solid #ddd; color: #008800;">✓ Full Support</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">Chromium-based, same as Chrome</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">Safari</td>
                        <td style="padding: 12px; border: 1px solid #ddd; color: #cc6600;">⚠️ Partial</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">iOS/macOS only, limited features</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">Firefox</td>
                        <td style="padding: 12px; border: 1px solid #ddd; color: #cc0000;">✗ Not Supported</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">No Web Speech API</td>
                    </tr>
                </tbody>
            </table>

            <h3>How it Works</h3>
            <ol>
                <li>Click "Start Listening" to activate the microphone</li>
                <li>Speak a command naturally (e.g., "make all nodes blue")</li>
                <li>The speech is converted to text and sent to the AI controller</li>
                <li>The AI interprets the command and executes the appropriate action</li>
            </ol>

            <h3>Privacy Note</h3>
            <p style="background: #fff3e0; padding: 12px; border-radius: 4px;">
                ⚠️ Voice input requires microphone access and sends audio to Google's servers for processing in Chrome.
                No audio is stored after processing.
            </p>
        </div>
    `,
};
