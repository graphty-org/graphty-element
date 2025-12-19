/**
 * AI Showcase Story
 * A comprehensive demonstration that brings together all AI interface features:
 * - Multiple LLM providers (Cloud APIs with stored keys, WebLLM for in-browser)
 * - Voice input for natural language commands
 * - LLM responses executing graph commands
 * - Screenshot capture
 * - Error retry functionality
 */

import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {html, type TemplateResult} from "lit";

import type {AiStatus} from "../../src/ai/AiStatus";
import {ApiKeyManager} from "../../src/ai/keys/ApiKeyManager";
import type {WebLlmProvider} from "../../src/ai/providers/WebLlmProvider";
import {type GraphtyElement} from "../../src/graphty-element";

// Sample network infrastructure graph
const SAMPLE_NODES = [
    {id: "lb", label: "Load Balancer", type: "loadbalancer", tier: "entry"},
    {id: "web1", label: "Web Server 1", type: "server", tier: "frontend"},
    {id: "web2", label: "Web Server 2", type: "server", tier: "frontend"},
    {id: "api1", label: "API Server 1", type: "server", tier: "backend"},
    {id: "api2", label: "API Server 2", type: "server", tier: "backend"},
    {id: "cache", label: "Redis Cache", type: "cache", tier: "data"},
    {id: "db1", label: "Primary DB", type: "database", tier: "data"},
    {id: "db2", label: "Replica DB", type: "database", tier: "data"},
    {id: "queue", label: "Message Queue", type: "queue", tier: "backend"},
    {id: "worker1", label: "Worker 1", type: "worker", tier: "backend"},
    {id: "worker2", label: "Worker 2", type: "worker", tier: "backend"},
    {id: "monitor", label: "Monitoring", type: "monitor", tier: "infra"},
];

const SAMPLE_EDGES = [
    {src: "lb", dst: "web1"},
    {src: "lb", dst: "web2"},
    {src: "web1", dst: "api1"},
    {src: "web1", dst: "api2"},
    {src: "web2", dst: "api1"},
    {src: "web2", dst: "api2"},
    {src: "api1", dst: "cache"},
    {src: "api2", dst: "cache"},
    {src: "api1", dst: "db1"},
    {src: "api2", dst: "db1"},
    {src: "db1", dst: "db2"},
    {src: "api1", dst: "queue"},
    {src: "api2", dst: "queue"},
    {src: "queue", dst: "worker1"},
    {src: "queue", dst: "worker2"},
    {src: "worker1", dst: "db1"},
    {src: "worker2", dst: "db1"},
    {src: "monitor", dst: "lb"},
    {src: "monitor", dst: "db1"},
    {src: "monitor", dst: "cache"},
];

// Key persistence
const keyManager = new ApiKeyManager();
const PERSISTENCE_KEY = "graphty-ai-showcase";

// Check WebGPU availability
async function checkWebGPU(): Promise<boolean> {
    if (typeof navigator === "undefined" || !("gpu" in navigator)) {
        return false;
    }

    try {
        const adapter = await navigator.gpu?.requestAdapter();
        return Boolean(adapter);
    } catch {
        return false;
    }
}

// Available WebLLM models that support tool calling
// Only Hermes models support function calling in WebLLM
const WEBLLM_MODELS = [
    {id: "Hermes-3-Llama-3.1-8B-q4f16_1-MLC", name: "Hermes 3 Llama 8B (q4f16)", size: "~4GB", sizeBytes: 4 * 1024 * 1024 * 1024},
    {id: "Hermes-3-Llama-3.1-8B-q4f32_1-MLC", name: "Hermes 3 Llama 8B (q4f32)", size: "~4GB", sizeBytes: 4 * 1024 * 1024 * 1024},
    {id: "Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC", name: "Hermes 2 Pro Llama 8B (q4f16)", size: "~4GB", sizeBytes: 4 * 1024 * 1024 * 1024},
    {id: "Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC", name: "Hermes 2 Pro Llama 8B (q4f32)", size: "~4GB", sizeBytes: 4 * 1024 * 1024 * 1024},
    {id: "Hermes-2-Pro-Mistral-7B-q4f16_1-MLC", name: "Hermes 2 Pro Mistral 7B", size: "~3.5GB", sizeBytes: 3.5 * 1024 * 1024 * 1024},
];

// Memory warning threshold (warn if model size > 50% of available memory)
const MEMORY_WARNING_THRESHOLD = 0.5;

// Clear WebLLM IndexedDB cache
async function clearWebLlmCache(): Promise<{cleared: boolean, error?: string}> {
    try {
        const databases = await indexedDB.databases();
        const webllmDbs = databases.filter((db) => db.name?.includes("webllm") ?? db.name?.includes("mlc"));

        for (const db of webllmDbs) {
            if (db.name) {
                indexedDB.deleteDatabase(db.name);
            }
        }

        return {cleared: true};
    } catch (error) {
        return {cleared: false, error: (error as Error).message};
    }
}

// Get available memory (if supported)
function getAvailableMemory(): {available: number | null, total: number | null} {
    try {
        // Check for memory API (Chrome only)
        if ("memory" in performance) {
            const perfWithMemory = performance as Performance & {memory?: {jsHeapSizeLimit: number, usedJSHeapSize: number}};
            const {memory} = perfWithMemory;
            if (memory) {
                return {
                    available: memory.jsHeapSizeLimit - memory.usedJSHeapSize,
                    total: memory.jsHeapSizeLimit,
                };
            }
        }

        // Try navigator.deviceMemory (gives RAM in GB, approximate)
        if ("deviceMemory" in navigator) {
            const deviceMemoryGB = (navigator as Navigator & {deviceMemory?: number}).deviceMemory ?? 4;
            const totalBytes = deviceMemoryGB * 1024 * 1024 * 1024;
            // Assume 50% available as a conservative estimate
            return {available: totalBytes * 0.5, total: totalBytes};
        }

        return {available: null, total: null};
    } catch {
        return {available: null, total: null};
    }
}

// Voice graph interface
interface VoiceGraph {
    getVoiceAdapter: () => {isSupported: boolean};
    startVoiceInput: (options: {
        continuous?: boolean;
        interimResults?: boolean;
        onTranscript?: (text: string, isFinal: boolean) => void;
        onStart?: (started: boolean, error?: string) => void;
    }) => boolean;
    stopVoiceInput: () => void;
    isVoiceActive: () => boolean;
}

// Main setup function
async function setupShowcase(): Promise<void> {
    const element = document.querySelector<GraphtyElement>("graphty-element");

    // UI elements
    const providerSelect = document.getElementById("provider-select") as HTMLSelectElement | null;
    const apiKeyInput = document.getElementById("api-key") as HTMLInputElement | null;
    const rememberKeyCheckbox = document.getElementById("remember-key") as HTMLInputElement | null;
    const webllmModelSelect = document.getElementById("webllm-model") as HTMLSelectElement | null;
    const connectBtn = document.getElementById("connect-btn") as HTMLButtonElement | null;
    const disconnectBtn = document.getElementById("disconnect-btn") as HTMLButtonElement | null;
    const webllmProgress = document.getElementById("webllm-progress");
    const webllmProgressFill = document.getElementById("webllm-progress-fill");
    const connectionStatus = document.getElementById("connection-status");

    const commandInput = document.getElementById("command-input") as HTMLInputElement | null;
    const sendBtn = document.getElementById("send-btn") as HTMLButtonElement | null;
    const voiceBtn = document.getElementById("voice-btn") as HTMLButtonElement | null;
    const voiceTranscript = document.getElementById("voice-transcript");

    const voiceAutoExecute = document.getElementById("voice-auto-execute") as HTMLInputElement | null;

    const statusBadge = document.getElementById("status-badge");
    const responseOutput = document.getElementById("response-output");
    const commandHistory = document.getElementById("command-history");

    const cloudProviderSection = document.getElementById("cloud-provider-section");
    const webllmSection = document.getElementById("webllm-section");
    const webgpuStatus = document.getElementById("webgpu-status");
    const clearCacheBtn = document.getElementById("clear-cache-btn") as HTMLButtonElement | null;
    const memoryWarning = document.getElementById("memory-warning");
    const memoryWarningText = document.getElementById("memory-warning-text");

    if (!element || !providerSelect || !connectBtn || !commandInput || !sendBtn ||
        !responseOutput || !commandHistory || !disconnectBtn || !statusBadge) {
        console.error("Required elements not found");
        return;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    const graph = element.graph as VoiceGraph & GraphtyElement["graph"];

    // Add sample data
    await graph.addNodes(SAMPLE_NODES);
    await graph.addEdges(SAMPLE_EDGES);

    // State
    let isConnected = false;
    let isVoiceActive = false;
    let webllmProvider: WebLlmProvider | null = null;

    // Capture references to required elements for use in closures
    // These are guaranteed non-null after the check above
    const ui = {
        providerSelect,
        connectBtn,
        disconnectBtn,
        commandInput,
        sendBtn,
        responseOutput,
        commandHistory,
        statusBadge,
        // Optional elements (may be null)
        apiKeyInput,
        rememberKeyCheckbox,
        webllmModelSelect,
        webllmProgress,
        webllmProgressFill,
        connectionStatus,
        voiceBtn,
        voiceTranscript,
        voiceAutoExecute,
        cloudProviderSection,
        webllmSection,
        webgpuStatus,
        clearCacheBtn,
        memoryWarning,
        memoryWarningText,
    };

    // Check WebGPU for WebLLM option
    const hasWebGPU = await checkWebGPU();
    if (ui.webgpuStatus) {
        ui.webgpuStatus.innerHTML = hasWebGPU ?
            "<span class=\"status-ok\">✓ WebGPU Available</span>" :
            "<span class=\"status-error\">✗ WebGPU Not Available</span>";
    }

    // Clear cache button handler
    if (ui.clearCacheBtn) {
        ui.clearCacheBtn.addEventListener("click", () => {
            void (async() => {
                if (!ui.clearCacheBtn) {
                    return;
                }

                const originalText = ui.clearCacheBtn.textContent;
                ui.clearCacheBtn.textContent = "⏳";
                ui.clearCacheBtn.disabled = true;

                const result = await clearWebLlmCache();

                if (result.cleared) {
                    ui.clearCacheBtn.textContent = "✓";
                    if (ui.connectionStatus) {
                        ui.connectionStatus.textContent = "Cache cleared. Models will be re-downloaded on next load.";
                        ui.connectionStatus.className = "";
                    }
                } else {
                    ui.clearCacheBtn.textContent = "✗";
                    if (ui.connectionStatus) {
                        ui.connectionStatus.textContent = `Failed to clear cache: ${result.error}`;
                        ui.connectionStatus.className = "status-error";
                    }
                }

                // Reset button after a delay
                setTimeout(() => {
                    if (ui.clearCacheBtn) {
                        ui.clearCacheBtn.textContent = originalText ?? "🗑️";
                        ui.clearCacheBtn.disabled = false;
                    }
                }, 2000);
            })();
        });
    }

    // Memory warning check when model is selected
    const checkMemoryWarning = (modelId: string): void => {
        const model = WEBLLM_MODELS.find((m) => m.id === modelId);
        if (!model || !ui.memoryWarning || !ui.memoryWarningText) {
            return;
        }

        const memory = getAvailableMemory();
        if (memory.available !== null) {
            const ratio = model.sizeBytes / memory.available;
            if (ratio > MEMORY_WARNING_THRESHOLD) {
                const modelSizeGB = (model.sizeBytes / (1024 * 1024 * 1024)).toFixed(1);
                const availableGB = (memory.available / (1024 * 1024 * 1024)).toFixed(1);
                ui.memoryWarningText.textContent =
                    `Model size (${modelSizeGB}GB) exceeds ${Math.round(MEMORY_WARNING_THRESHOLD * 100)}% of available memory (${availableGB}GB). Loading may cause browser instability.`;
                ui.memoryWarning.style.display = "block";
            } else {
                ui.memoryWarning.style.display = "none";
            }
        } else {
            // Can't detect memory, show generic warning for large models
            if (model.sizeBytes > 3 * 1024 * 1024 * 1024) {
                ui.memoryWarningText.textContent =
                    `Large model (${model.size}). Ensure you have sufficient memory available.`;
                ui.memoryWarning.style.display = "block";
            } else {
                ui.memoryWarning.style.display = "none";
            }
        }
    };

    // Check memory warning when model selection changes
    if (ui.webllmModelSelect) {
        ui.webllmModelSelect.addEventListener("change", () => {
            checkMemoryWarning(ui.webllmModelSelect?.value ?? "");
        });
        // Initial check
        checkMemoryWarning(ui.webllmModelSelect.value);
    }

    // Load persisted keys
    const loadPersistedKey = (): void => {
        try {
            keyManager.enablePersistence({
                encryptionKey: PERSISTENCE_KEY,
                storage: "localStorage",
            });
            const provider = ui.providerSelect.value;
            if (provider !== "webllm" && provider !== "mock") {
                const savedKey = keyManager.getKey(provider as "openai" | "anthropic" | "google");
                if (savedKey && ui.apiKeyInput) {
                    ui.apiKeyInput.value = savedKey;
                    if (ui.rememberKeyCheckbox) {
                        ui.rememberKeyCheckbox.checked = true;
                    }
                }
            }
        } catch {
            keyManager.disablePersistence();
        }
    };

    // Toggle provider sections
    const updateProviderUI = (): void => {
        const provider = ui.providerSelect.value;
        const isCloud = ["openai", "anthropic", "google"].includes(provider);
        const isWebLLM = provider === "webllm";

        if (ui.cloudProviderSection) {
            ui.cloudProviderSection.style.display = isCloud ? "block" : "none";
        }

        if (ui.webllmSection) {
            ui.webllmSection.style.display = isWebLLM ? "block" : "none";
        }

        // Load persisted key for cloud providers
        if (isCloud) {
            loadPersistedKey();
        }
    };

    ui.providerSelect.addEventListener("change", updateProviderUI);
    updateProviderUI();

    // Update status display
    const updateStatus = (status: AiStatus): void => {
        ui.statusBadge.textContent = status.state;
        ui.statusBadge.className = `status-badge ${status.state}`;

        if (status.toolCalls && status.toolCalls.length > 0) {
            const tools = status.toolCalls.map((tc) => tc.name).join(", ");
            ui.statusBadge.textContent += ` (${tools})`;
        }
    };

    // Log command to history
    const logCommand = (input: string, result: string, success: boolean): void => {
        const entry = document.createElement("div");
        entry.className = `history-entry ${success ? "success" : "error"}`;
        entry.innerHTML = `
            <div class="history-input">&gt; ${input}</div>
            <div class="history-result">${result}</div>
        `;
        ui.commandHistory.insertBefore(entry, ui.commandHistory.firstChild);

        while (ui.commandHistory.children.length > 8) {
            ui.commandHistory.removeChild(ui.commandHistory.lastChild as Node);
        }
    };

    // Connect handler
    ui.connectBtn.addEventListener("click", () => {
        void (async() => {
            const provider = ui.providerSelect.value;

            try {
                if (ui.connectionStatus) {
                    ui.connectionStatus.textContent = `Connecting to ${provider}...`;
                    ui.connectionStatus.className = "status-connecting";
                }

                ui.connectBtn.disabled = true;

                if (provider === "webllm") {
                    // Dynamic import WebLlmProvider
                    const {WebLlmProvider} = await import("../../src/ai/providers/WebLlmProvider");
                    webllmProvider = new WebLlmProvider();

                    const selectedModel = ui.webllmModelSelect?.value ?? WEBLLM_MODELS[0].id;
                    webllmProvider.configure({model: selectedModel});

                    // Show progress
                    if (ui.webllmProgress) {
                        ui.webllmProgress.style.display = "block";
                    }

                    let lastProgressText = "";
                    webllmProvider.onProgress((progress, text) => {
                        lastProgressText = text;
                        if (ui.webllmProgressFill) {
                            ui.webllmProgressFill.style.width = `${progress * 100}%`;
                        }

                        if (ui.connectionStatus) {
                            ui.connectionStatus.textContent = text;
                        }
                    });

                    try {
                        await webllmProvider.initialize();
                    } catch (initError) {
                        // Handle specific WebLLM initialization errors
                        const errorMsg = (initError as Error).message;

                        // Check for common WebLLM errors and provide helpful messages
                        let helpfulMessage = errorMsg;
                        let suggestClearCache = false;

                        if (errorMsg.includes("WebGPU") || errorMsg.includes("GPU")) {
                            helpfulMessage = "WebGPU initialization failed. Try refreshing the page or using a different browser.";
                        } else if (errorMsg.includes("memory") || errorMsg.includes("OOM")) {
                            helpfulMessage = "Out of memory. Try a smaller model or close other browser tabs.";
                            suggestClearCache = true;
                        } else if (errorMsg.includes("cache") || errorMsg.includes("IndexedDB")) {
                            helpfulMessage = "Cache error. Try clearing the WebLLM cache.";
                            suggestClearCache = true;
                        } else if (errorMsg.includes("network") || errorMsg.includes("fetch")) {
                            helpfulMessage = "Network error downloading model. Check your connection and try again.";
                        } else if (lastProgressText.includes("Loading model")) {
                            // If error occurred while loading model, cache might be corrupted
                            helpfulMessage = `Error loading model: ${errorMsg}. The cached model may be corrupted.`;
                            suggestClearCache = true;
                        }

                        // Clean up partial initialization
                        webllmProvider = null;

                        // Show error with helpful suggestion
                        if (ui.connectionStatus) {
                            ui.connectionStatus.innerHTML = suggestClearCache ?
                                `✗ ${helpfulMessage} <button id="suggest-clear-cache" style="margin-left: 8px; padding: 4px 8px; cursor: pointer;">Clear Cache</button>` :
                                `✗ ${helpfulMessage}`;
                            ui.connectionStatus.className = "status-error";

                            // Add click handler for suggested clear cache button
                            if (suggestClearCache) {
                                const suggestBtn = document.getElementById("suggest-clear-cache");
                                if (suggestBtn) {
                                    suggestBtn.addEventListener("click", () => {
                                        void clearWebLlmCache().then((result) => {
                                            if (result.cleared && ui.connectionStatus) {
                                                ui.connectionStatus.textContent = "Cache cleared. Try connecting again.";
                                                ui.connectionStatus.className = "";
                                            }
                                        });
                                    });
                                }
                            }
                        }

                        if (ui.webllmProgress) {
                            ui.webllmProgress.style.display = "none";
                        }

                        ui.connectBtn.disabled = false;
                        return;
                    }

                    // Enable AI with the initialized provider instance
                    await graph.enableAiControl({
                        provider: "webllm",
                        providerInstance: webllmProvider,
                    });
                } else if (provider === "mock") {
                    await graph.enableAiControl({provider: "mock"});
                } else {
                    // Cloud provider
                    const apiKey = ui.apiKeyInput?.value.trim();
                    if (!apiKey) {
                        throw new Error("Please enter an API key");
                    }

                    await graph.enableAiControl({
                        provider: provider as "openai" | "anthropic" | "google",
                        apiKey,
                    });

                    // Save key if requested
                    if (ui.rememberKeyCheckbox?.checked && ui.apiKeyInput) {
                        keyManager.enablePersistence({
                            encryptionKey: PERSISTENCE_KEY,
                            storage: "localStorage",
                        });
                        keyManager.setKey(provider as "openai" | "anthropic" | "google", apiKey);
                    }
                }

                // Subscribe to status updates
                graph.onAiStatusChange(updateStatus);

                isConnected = true;
                if (ui.connectionStatus) {
                    ui.connectionStatus.textContent = `✓ Connected to ${provider}`;
                    ui.connectionStatus.className = "status-connected";
                }

                ui.sendBtn.disabled = false;
                if (ui.voiceBtn) {
                    ui.voiceBtn.disabled = false;
                }

                ui.disconnectBtn.disabled = false;

                if (ui.webllmProgress) {
                    ui.webllmProgress.style.display = "none";
                }

                ui.responseOutput.textContent = `Connected! Try natural language commands like:
• "Highlight all database nodes in blue"
• "Switch to circular layout"
• "Show me a top-down view"
• "How many servers are there?"
• "Make the frontend tier larger"`;
            } catch (error) {
                if (ui.connectionStatus) {
                    ui.connectionStatus.textContent = `✗ ${(error as Error).message}`;
                    ui.connectionStatus.className = "status-error";
                }

                if (ui.webllmProgress) {
                    ui.webllmProgress.style.display = "none";
                }
            } finally {
                ui.connectBtn.disabled = false;
            }
        })();
    });

    // Disconnect handler
    ui.disconnectBtn.addEventListener("click", () => {
        graph.disableAiControl();
        isConnected = false;
        webllmProvider = null;

        if (ui.connectionStatus) {
            ui.connectionStatus.textContent = "Disconnected";
            ui.connectionStatus.className = "";
        }

        ui.sendBtn.disabled = true;
        if (ui.voiceBtn) {
            ui.voiceBtn.disabled = true;
        }

        ui.disconnectBtn.disabled = true;
    });

    // Command submission
    const handleSubmit = async(): Promise<void> => {
        if (!isConnected) {
            ui.responseOutput.textContent = "Please connect to a provider first.";
            return;
        }

        const value = ui.commandInput.value.trim();
        if (!value) {
            return;
        }

        ui.responseOutput.textContent = "Processing...";
        ui.sendBtn.disabled = true;

        try {
            const result = await graph.aiCommand(value);

            let output = result.message;
            if (result.data) {
                output += `\n\n${JSON.stringify(result.data, null, 2)}`;
            }

            ui.responseOutput.textContent = output;
            logCommand(value, result.success ? `✓ ${result.message}` : `✗ ${result.message}`, result.success);
        } catch (error) {
            const msg = `Error: ${(error as Error).message}`;
            ui.responseOutput.textContent = msg;
            logCommand(value, msg, false);
        } finally {
            ui.sendBtn.disabled = false;
            ui.commandInput.value = "";
            ui.commandInput.focus();
        }
    };

    ui.sendBtn.addEventListener("click", () => void handleSubmit());
    ui.commandInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            void handleSubmit();
        }
    });

    // Voice input
    if (ui.voiceBtn) {
        const adapter = graph.getVoiceAdapter();
        if (!adapter.isSupported) {
            ui.voiceBtn.disabled = true;
            ui.voiceBtn.title = "Voice input not supported in this browser";
        }

        ui.voiceBtn.addEventListener("click", () => {
            if (!ui.voiceBtn) {
                return;
            }

            if (isVoiceActive) {
                graph.stopVoiceInput();
                ui.voiceBtn.textContent = "🎤";
                ui.voiceBtn.className = "action-btn voice";
                isVoiceActive = false;
                if (ui.voiceTranscript) {
                    ui.voiceTranscript.style.display = "none";
                }
            } else {
                ui.voiceBtn.textContent = "⏳";
                ui.voiceBtn.disabled = true;

                graph.startVoiceInput({
                    continuous: true,
                    interimResults: true,
                    onStart: (started, error) => {
                        if (!ui.voiceBtn) {
                            return;
                        }

                        ui.voiceBtn.disabled = false;
                        if (started) {
                            ui.voiceBtn.textContent = "⏹";
                            ui.voiceBtn.className = "action-btn voice active";
                            isVoiceActive = true;
                            if (ui.voiceTranscript) {
                                ui.voiceTranscript.style.display = "block";
                                ui.voiceTranscript.textContent = "Listening...";
                            }
                        } else {
                            ui.voiceBtn.textContent = "🎤";
                            ui.responseOutput.textContent = `Voice error: ${error ?? "Unknown error"}`;
                        }
                    },
                    onTranscript: (text, isFinal) => {
                        if (ui.voiceTranscript) {
                            ui.voiceTranscript.textContent = text;
                            ui.voiceTranscript.style.fontStyle = isFinal ? "normal" : "italic";
                        }

                        if (isFinal && text.trim()) {
                            const shouldAutoExecute = ui.voiceAutoExecute?.checked ?? true;

                            if (shouldAutoExecute) {
                                // Auto-execute: send command immediately
                                void graph.aiCommand(text).then((result) => {
                                    ui.responseOutput.textContent = result.message;
                                    logCommand(`🎤 ${text}`, result.success ? `✓ ${result.message}` : `✗ ${result.message}`, result.success);
                                });
                            } else {
                                // Fill input: populate the text field for review/editing
                                ui.commandInput.value = text;
                                ui.commandInput.focus();
                                ui.responseOutput.textContent = "Voice input captured. Press Send or Enter to execute.";
                            }
                        }
                    },
                });
            }
        });
    }

    // Initial display
    ui.responseOutput.textContent = `Network graph loaded with ${SAMPLE_NODES.length} nodes and ${SAMPLE_EDGES.length} edges.

Select an AI provider and connect to start using natural language commands.

• Cloud Providers (OpenAI, Anthropic, Google) require API keys
• WebLLM runs entirely in your browser (requires WebGPU)
• Mock provider for testing without real LLM`;
}

const meta: Meta = {
    title: "AI/Showcase",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
# AI Showcase - Complete Feature Demo

This showcase demonstrates all AI interface capabilities in one integrated experience.

## Features Demonstrated

### 🔌 Multiple LLM Providers

| Provider | Key Required | Runs In Browser | Best For |
|----------|-------------|-----------------|----------|
| **OpenAI** | Yes | No | High-quality responses |
| **Anthropic** | Yes | No | Complex reasoning |
| **Google** | Yes | No | Multimodal tasks |
| **WebLLM** | No | Yes (WebGPU) | Privacy, offline use |
| **Mock** | No | Yes | Testing |

### 🔐 API Key Management
- Keys can be remembered (encrypted in localStorage)
- Per-provider key storage
- Automatic key loading on provider switch

### 🎤 Voice Input
- Speak commands naturally
- Real-time transcription
- Automatic command execution

### 📸 Screenshot Capture
- Capture current view
- Download as PNG
- Get image metadata

### 🔄 Error Recovery
- Retry failed commands
- Status tracking throughout execution

## Example Commands

### Styling
- "Make all nodes red"
- "Highlight database nodes in blue"
- "Make the frontend tier larger"
- "Clear all styles"

### Layout
- "Switch to circular layout"
- "Use force-directed layout"
- "Arrange in a spiral"

### Camera
- "Show from top"
- "Zoom to fit all nodes"
- "Isometric view"

### Queries
- "How many nodes are there?"
- "Give me a summary"
- "Find all server nodes"

### Dimensions
- "Switch to 2D"
- "Show in 3D"

## Architecture

This demo integrates:
- **AiManager** - Orchestrates AI lifecycle
- **LLM Providers** - Vercel AI SDK (cloud) + WebLLM (browser)
- **CommandRegistry** - Maps LLM tool calls to graph operations
- **VoiceInputAdapter** - Web Speech API integration
- **ApiKeyManager** - Secure key storage
- **ScreenshotCapture** - Babylon.js screenshot system
`,
            },
        },
    },
    render: (): TemplateResult => {
        setTimeout(() => void setupShowcase(), 100);

        return html`
            <style>
                .showcase-layout {
                    display: flex;
                    gap: 16px;
                    padding: 16px;
                    font-family: system-ui, -apple-system, sans-serif;
                    height: calc(100vh - 32px);
                    background: #f5f5f5;
                }
                .graph-container {
                    flex: 2;
                    min-width: 400px;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                graphty-element {
                    width: 100%;
                    height: 100%;
                }
                .control-panel {
                    flex: 1;
                    min-width: 360px;
                    max-width: 420px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    overflow-y: auto;
                }
                .panel-section {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
                }
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                .section-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }
                .section-icon.provider { background: #e3f2fd; }
                .section-icon.command { background: #f3e5f5; }
                .section-icon.history { background: #e8f5e9; }
                .section-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                }

                /* Provider Selection */
                .provider-row {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                #provider-select {
                    flex: 1;
                    padding: 10px 12px;
                    font-size: 14px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background: white;
                }
                .connect-btn {
                    padding: 10px 16px;
                    font-size: 14px;
                    background: #4caf50;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .connect-btn:hover:not(:disabled) { background: #43a047; }
                .connect-btn:disabled { background: #ccc; cursor: not-allowed; }
                .connect-btn.disconnect { background: #f44336; }
                .connect-btn.disconnect:hover:not(:disabled) { background: #e53935; }

                /* Cloud Provider */
                #cloud-provider-section, #webllm-section {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #eee;
                }
                .key-row {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                #api-key {
                    flex: 1;
                    padding: 10px 12px;
                    font-size: 14px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }
                .remember-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 8px;
                    font-size: 12px;
                    color: #666;
                }
                .remember-row input { width: 16px; height: 16px; }

                /* WebLLM */
                #webllm-model {
                    width: 100%;
                    padding: 10px 12px;
                    font-size: 14px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background: white;
                    margin-bottom: 8px;
                }
                #webgpu-status {
                    font-size: 12px;
                    margin-bottom: 8px;
                }
                .status-ok { color: #2e7d32; }
                .status-error { color: #c62828; }
                .progress-bar {
                    height: 8px;
                    background: #e0e0e0;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-top: 8px;
                }
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #7c4dff, #448aff);
                    transition: width 0.3s;
                }

                /* Connection Status */
                #connection-status {
                    font-size: 13px;
                    padding: 8px;
                    border-radius: 6px;
                    margin-top: 8px;
                    background: #f5f5f5;
                }
                .status-connecting { color: #1565c0; background: #e3f2fd; }
                .status-connected { color: #2e7d32; background: #e8f5e9; }
                .status-error { color: #c62828; background: #ffebee; }

                /* Command Input */
                .command-row {
                    display: flex;
                    gap: 8px;
                }
                #command-input {
                    flex: 1;
                    padding: 12px;
                    font-size: 14px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    outline: none;
                }
                #command-input:focus {
                    border-color: #7c4dff;
                    box-shadow: 0 0 0 2px rgba(124, 77, 255, 0.2);
                }
                .send-btn {
                    padding: 12px 20px;
                    font-size: 14px;
                    background: #7c4dff;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .send-btn:hover:not(:disabled) { background: #651fff; }
                .send-btn:disabled { background: #ccc; cursor: not-allowed; }

                /* Voice */
                .voice-options {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 8px;
                    font-size: 12px;
                    color: #666;
                }
                .voice-options input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                }
                #voice-transcript {
                    display: none;
                    padding: 10px;
                    background: #f0f0f0;
                    border-radius: 6px;
                    margin-top: 8px;
                    font-size: 13px;
                    min-height: 20px;
                }

                /* Status */
                .status-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 8px;
                }
                .status-badge {
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

                /* Response */
                #response-output {
                    padding: 14px;
                    background: #fafafa;
                    border-radius: 8px;
                    min-height: 80px;
                    max-height: 180px;
                    overflow-y: auto;
                    font-size: 13px;
                    white-space: pre-wrap;
                    line-height: 1.5;
                    font-family: ui-monospace, monospace;
                    border: 1px solid #eee;
                }

                /* Voice Button */
                .action-btn {
                    padding: 10px 12px;
                    font-size: 16px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .action-btn.voice { background: #e3f2fd; color: #1565c0; }
                .action-btn.voice:hover:not(:disabled) { background: #bbdefb; }
                .action-btn.voice.active { background: #f44336; color: white; }

                /* WebLLM Model Row */
                .webllm-model-row {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }
                .webllm-model-row select {
                    flex: 1;
                }
                .clear-cache-btn {
                    padding: 8px 12px;
                    font-size: 14px;
                    background: #ff9800;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                }
                .clear-cache-btn:hover { background: #f57c00; }
                .clear-cache-btn:disabled { background: #ccc; cursor: not-allowed; }

                /* Memory Warning */
                .memory-warning {
                    padding: 8px 12px;
                    background: #fff3e0;
                    color: #e65100;
                    border-radius: 6px;
                    font-size: 12px;
                    margin-top: 8px;
                }

                /* History */
                #command-history {
                    max-height: 150px;
                    overflow-y: auto;
                }
                .history-entry {
                    padding: 8px 10px;
                    border-bottom: 1px solid #f0f0f0;
                    font-size: 12px;
                }
                .history-entry:last-child { border-bottom: none; }
                .history-input {
                    color: #1976d2;
                    font-family: monospace;
                    margin-bottom: 2px;
                }
                .history-result { color: #555; }
                .history-entry.success .history-result { color: #2e7d32; }
                .history-entry.error .history-result { color: #c62828; }

                /* Commands Hint */
                .commands-hint {
                    font-size: 11px;
                    color: #888;
                    padding: 10px;
                    background: #fafafa;
                    border-radius: 6px;
                    line-height: 1.6;
                }
                .commands-hint strong { color: #555; }
            </style>

            <div class="showcase-layout">
                <div class="graph-container">
                    <graphty-element layout-type="ngraph"></graphty-element>
                </div>

                <div class="control-panel">
                    <!-- Header -->
                    <div class="panel-section" style="padding: 12px 16px;">
                        <h2 style="margin: 0; font-size: 18px;">🤖 AI Showcase</h2>
                        <p style="margin: 4px 0 0; font-size: 13px; color: #666;">
                            Complete demonstration of AI-powered graph control
                        </p>
                    </div>

                    <!-- Provider Selection -->
                    <div class="panel-section">
                        <div class="section-header">
                            <div class="section-icon provider">🔌</div>
                            <span class="section-title">LLM Provider</span>
                        </div>

                        <div class="provider-row">
                            <select id="provider-select">
                                <optgroup label="Cloud Providers (API Key)">
                                    <option value="openai">OpenAI (GPT-4o)</option>
                                    <option value="anthropic">Anthropic (Claude)</option>
                                    <option value="google">Google (Gemini)</option>
                                </optgroup>
                                <optgroup label="Local/Browser">
                                    <option value="webllm">WebLLM (In-Browser)</option>
                                    <option value="mock">Mock (Testing)</option>
                                </optgroup>
                            </select>
                            <button id="connect-btn" class="connect-btn">Connect</button>
                            <button id="disconnect-btn" class="connect-btn disconnect" disabled>×</button>
                        </div>

                        <!-- Cloud Provider Options -->
                        <div id="cloud-provider-section">
                            <div class="key-row">
                                <input id="api-key" type="password" placeholder="Enter API key...">
                            </div>
                            <div class="remember-row">
                                <input type="checkbox" id="remember-key">
                                <label for="remember-key">Remember key (encrypted)</label>
                            </div>
                        </div>

                        <!-- WebLLM Options -->
                        <div id="webllm-section" style="display: none;">
                            <div id="webgpu-status">Checking WebGPU...</div>
                            <div class="webllm-model-row">
                                <select id="webllm-model">
                                    <option value="Hermes-3-Llama-3.1-8B-q4f16_1-MLC">Hermes 3 Llama 8B (q4f16) (~4GB)</option>
                                    <option value="Hermes-3-Llama-3.1-8B-q4f32_1-MLC">Hermes 3 Llama 8B (q4f32) (~4GB)</option>
                                    <option value="Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC">Hermes 2 Pro Llama 8B (q4f16) (~4GB)</option>
                                    <option value="Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC">Hermes 2 Pro Llama 8B (q4f32) (~4GB)</option>
                                    <option value="Hermes-2-Pro-Mistral-7B-q4f16_1-MLC">Hermes 2 Pro Mistral 7B (~3.5GB)</option>
                                </select>
                                <button id="clear-cache-btn" class="clear-cache-btn" title="Clear cached models">🗑️</button>
                            </div>
                            <div id="memory-warning" class="memory-warning" style="display: none;">
                                ⚠️ <span id="memory-warning-text">Large model may cause issues</span>
                            </div>
                            <div id="webllm-progress" style="display: none;">
                                <div class="progress-bar">
                                    <div id="webllm-progress-fill" class="progress-fill" style="width: 0%"></div>
                                </div>
                            </div>
                        </div>

                        <div id="connection-status">Select a provider and connect</div>
                    </div>

                    <!-- Command Input -->
                    <div class="panel-section">
                        <div class="section-header">
                            <div class="section-icon command">💬</div>
                            <span class="section-title">Natural Language Command</span>
                        </div>

                        <div class="command-row">
                            <button id="voice-btn" class="action-btn voice" disabled title="Voice input">🎤</button>
                            <input id="command-input" type="text" placeholder="e.g., 'Make database nodes blue'">
                            <button id="send-btn" class="send-btn" disabled>Send</button>
                        </div>

                        <div class="voice-options">
                            <input type="checkbox" id="voice-auto-execute" checked>
                            <label for="voice-auto-execute">Auto-execute voice commands</label>
                        </div>

                        <div id="voice-transcript"></div>

                        <div class="status-row">
                            <span style="font-size: 12px; color: #888;">Status:</span>
                            <span id="status-badge" class="status-badge ready">ready</span>
                        </div>

                        <pre id="response-output">Loading graph...</pre>
                    </div>

                    <!-- Command History -->
                    <div class="panel-section" style="flex: 1; min-height: 100px;">
                        <div class="section-header">
                            <div class="section-icon history">📜</div>
                            <span class="section-title">Command History</span>
                        </div>
                        <div id="command-history"></div>
                    </div>

                    <!-- Hints -->
                    <div class="commands-hint">
                        <strong>Try:</strong> "highlight servers" • "circular layout" • "top view" • "how many nodes?" • "switch to 2D"
                    </div>
                </div>
            </div>
        `;
    },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {};
