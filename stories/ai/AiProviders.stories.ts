/**
 * AI Providers Comparison Story
 * Demonstrates and compares different LLM provider options for the AI interface.
 */

import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {html, type TemplateResult} from "lit";

// Check WebGPU availability without importing WebLlmProvider
async function checkWebGPU(): Promise<boolean> {
    if (typeof navigator === "undefined") {
        return false;
    }

    try {
        if (!("gpu" in navigator)) {
            return false;
        }

        const {gpu} = navigator;
        if (!gpu) {
            return false;
        }

        const adapter = await gpu.requestAdapter();

        return Boolean(adapter);
    } catch {
        return false;
    }
}

// Available models (defined here to avoid importing WebLlmProvider at load time)
const AVAILABLE_MODELS = [
    {id: "Llama-3.2-1B-Instruct-q4f32_1-MLC", name: "Llama 3.2 1B", size: "~500MB", description: "Fast, lightweight model suitable for quick responses"},
    {id: "Llama-3.2-3B-Instruct-q4f32_1-MLC", name: "Llama 3.2 3B", size: "~1.5GB", description: "Better quality responses with reasonable performance"},
    {id: "Phi-3.5-mini-instruct-q4f16_1-MLC", name: "Phi 3.5 Mini", size: "~2GB", description: "Good balance of quality and performance"},
    {id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC", name: "Qwen 2.5 1.5B", size: "~800MB", description: "Efficient model with good multilingual support"},
    {id: "SmolLM2-360M-Instruct-q4f16_1-MLC", name: "SmolLM2 360M", size: "~200MB", description: "Very small and fast, basic capabilities"},
];

const meta: Meta = {
    title: "AI/Providers",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
# AI Providers

The AI interface supports multiple LLM providers, each with different characteristics and requirements.

## Provider Comparison

| Provider | API Key Required | Streaming | Tool Calling | Runs In Browser |
|----------|-----------------|-----------|--------------|-----------------|
| **OpenAI** | Yes | Yes | Yes | No (cloud) |
| **Anthropic** | Yes | Yes | Yes | No (cloud) |
| **Google** | Yes | Yes | Yes | No (cloud) |
| **WebLLM** | No | Yes | Yes | Yes (WebGPU) |
| **Mock** | No | Yes | Yes | Yes |

## Cloud Providers (OpenAI, Anthropic, Google)

These providers use the Vercel AI SDK to communicate with cloud-based LLMs.

**Pros:**
- High-quality responses
- Latest models available
- No local hardware requirements
- Fast response times

**Cons:**
- Requires API key and account
- Usage costs per token
- Requires internet connection
- Data sent to third-party servers

## WebLLM (In-Browser)

WebLLM runs LLMs entirely in the browser using WebGPU.

**Pros:**
- No API key required
- Runs completely offline
- Privacy - no data leaves your device
- Free to use

**Cons:**
- Requires WebGPU-capable browser (Chrome 113+)
- Initial model download (500MB - 2GB)
- Slower than cloud providers
- Limited to smaller models

## Mock Provider

For testing and development without any LLM.

**Pros:**
- Instant responses
- Deterministic behavior
- No setup required

**Cons:**
- Not a real LLM
- Only for testing
                `,
            },
        },
    },
    render: (): TemplateResult => {
        // Check WebGPU availability after render
        setTimeout(() => {
            const statusEl = document.getElementById("webgpu-status");
            if (statusEl) {
                void checkWebGPU().then((available) => {
                    if (available) {
                        statusEl.innerHTML = `
                            <span style="color: #2e7d32;">✓ WebGPU is available</span>
                            <br>
                            <small>You can use WebLLM for in-browser inference.</small>
                        `;
                    } else {
                        statusEl.innerHTML = `
                            <span style="color: #c62828;">✗ WebGPU is not available</span>
                            <br>
                            <small>WebLLM requires Chrome 113+ with WebGPU enabled.</small>
                        `;
                    }
                });
            }

            // Populate model list
            const modelList = document.getElementById("model-list");
            if (modelList) {
                modelList.innerHTML = AVAILABLE_MODELS.map((m) => `
                    <tr>
                        <td><strong>${m.name}</strong></td>
                        <td><code>${m.id}</code></td>
                        <td>${m.size}</td>
                        <td>${m.description}</td>
                    </tr>
                `).join("");
            }
        }, 100);

        return html`
            <style>
                .providers-panel {
                    padding: 20px;
                    max-width: 900px;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                .provider-card {
                    background: #fafafa;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 16px;
                    border: 1px solid #eee;
                }
                .provider-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                .provider-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }
                .provider-icon.openai { background: #10a37f; color: white; }
                .provider-icon.anthropic { background: #d4a574; color: white; }
                .provider-icon.google { background: #4285f4; color: white; }
                .provider-icon.webllm { background: #7c4dff; color: white; }
                .provider-icon.mock { background: #9e9e9e; color: white; }
                .provider-name {
                    font-size: 18px;
                    font-weight: 600;
                }
                .provider-type {
                    font-size: 12px;
                    padding: 2px 8px;
                    border-radius: 4px;
                    background: #e3f2fd;
                    color: #1565c0;
                }
                .provider-type.local {
                    background: #e8f5e9;
                    color: #2e7d32;
                }
                .feature-list {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                    margin-top: 12px;
                }
                .feature {
                    font-size: 13px;
                    padding: 4px 10px;
                    border-radius: 4px;
                    background: white;
                    border: 1px solid #ddd;
                }
                .feature.yes { border-color: #81c784; color: #2e7d32; }
                .feature.no { border-color: #e57373; color: #c62828; }
                .section-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 24px 0 16px 0;
                    color: #333;
                }
                #webgpu-status {
                    padding: 16px;
                    background: #f5f5f5;
                    border-radius: 8px;
                    margin-top: 12px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 12px;
                    font-size: 13px;
                }
                th, td {
                    padding: 10px;
                    text-align: left;
                    border-bottom: 1px solid #eee;
                }
                th {
                    background: #f5f5f5;
                    font-weight: 600;
                }
                code {
                    background: #f0f0f0;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 12px;
                }
                .api-links {
                    margin-top: 16px;
                    padding: 16px;
                    background: #fff8e1;
                    border-radius: 8px;
                }
                .api-links a {
                    display: block;
                    margin: 8px 0;
                    color: #1976d2;
                }
            </style>
            <div class="providers-panel">
                <h2>AI Provider Options</h2>
                <p>Choose the right provider for your use case.</p>

                <!-- Cloud Providers -->
                <div class="section-title">Cloud Providers</div>

                <div class="provider-card">
                    <div class="provider-header">
                        <div class="provider-icon openai">O</div>
                        <span class="provider-name">OpenAI</span>
                        <span class="provider-type">Cloud API</span>
                    </div>
                    <p>GPT-4o and GPT-4-turbo models with excellent tool calling support.</p>
                    <div class="feature-list">
                        <span class="feature yes">Streaming</span>
                        <span class="feature yes">Tool Calling</span>
                        <span class="feature no">Requires API Key</span>
                        <span class="feature no">Cloud Only</span>
                    </div>
                </div>

                <div class="provider-card">
                    <div class="provider-header">
                        <div class="provider-icon anthropic">A</div>
                        <span class="provider-name">Anthropic</span>
                        <span class="provider-type">Cloud API</span>
                    </div>
                    <p>Claude models with strong reasoning and tool use capabilities.</p>
                    <div class="feature-list">
                        <span class="feature yes">Streaming</span>
                        <span class="feature yes">Tool Calling</span>
                        <span class="feature no">Requires API Key</span>
                        <span class="feature no">Cloud Only</span>
                    </div>
                </div>

                <div class="provider-card">
                    <div class="provider-header">
                        <div class="provider-icon google">G</div>
                        <span class="provider-name">Google</span>
                        <span class="provider-type">Cloud API</span>
                    </div>
                    <p>Gemini models with multimodal capabilities.</p>
                    <div class="feature-list">
                        <span class="feature yes">Streaming</span>
                        <span class="feature yes">Tool Calling</span>
                        <span class="feature no">Requires API Key</span>
                        <span class="feature no">Cloud Only</span>
                    </div>
                </div>

                <!-- Local Providers -->
                <div class="section-title">Local/Browser Providers</div>

                <div class="provider-card">
                    <div class="provider-header">
                        <div class="provider-icon webllm">W</div>
                        <span class="provider-name">WebLLM</span>
                        <span class="provider-type local">In-Browser</span>
                    </div>
                    <p>Run LLMs entirely in your browser using WebGPU acceleration. No API key required!</p>
                    <div class="feature-list">
                        <span class="feature yes">Streaming</span>
                        <span class="feature yes">Tool Calling</span>
                        <span class="feature yes">No API Key</span>
                        <span class="feature yes">Runs Locally</span>
                        <span class="feature yes">Works Offline</span>
                    </div>
                    <div id="webgpu-status">Checking WebGPU availability...</div>
                </div>

                <div class="provider-card">
                    <div class="provider-header">
                        <div class="provider-icon mock">M</div>
                        <span class="provider-name">Mock</span>
                        <span class="provider-type local">Testing</span>
                    </div>
                    <p>Deterministic mock provider for testing and development.</p>
                    <div class="feature-list">
                        <span class="feature yes">Streaming</span>
                        <span class="feature yes">Tool Calling</span>
                        <span class="feature yes">No Setup Required</span>
                        <span class="feature no">Not a Real LLM</span>
                    </div>
                </div>

                <!-- WebLLM Models -->
                <div class="section-title">Available WebLLM Models</div>
                <table>
                    <thead>
                        <tr>
                            <th>Model</th>
                            <th>ID</th>
                            <th>Size</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody id="model-list">
                        <tr><td colspan="4">Loading...</td></tr>
                    </tbody>
                </table>

                <!-- API Key Links -->
                <div class="api-links">
                    <strong>Get API Keys:</strong>
                    <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI API Keys</a>
                    <a href="https://console.anthropic.com/settings/keys" target="_blank">Anthropic API Keys</a>
                    <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI API Keys</a>
                </div>
            </div>
        `;
    },
};

export default meta;

type Story = StoryObj;

export const Comparison: Story = {};
