/**
 * AI Manager Module - Graph integration manager for AI functionality.
 * Follows a similar pattern to the Manager interface used throughout the codebase.
 * @module ai/AiManager
 */

import {debounce} from "lodash";

import type {Graph} from "../Graph";
import {AiController, type ExecutionResult} from "./AiController";
import {type AiStatus, AiStatusManager, type StatusChangeCallback} from "./AiStatus";
import {CommandRegistry} from "./commands";
// Import built-in commands
import {setCameraPosition, zoomToNodes} from "./commands/CameraCommands";
import {setDimension, setLayout} from "./commands/LayoutCommands";
import {setImmersiveMode} from "./commands/ModeCommands";
import {findNodes, getSchema, queryGraph} from "./commands/QueryCommands";
import {describeProperty, sampleData} from "./commands/SchemaCommands";
import {clearStyles, findAndStyleEdges, findAndStyleNodes} from "./commands/StyleCommands";
import {ApiKeyManager} from "./keys";
import {createProvider, type ProviderType} from "./providers";
import type {LlmProvider} from "./providers/types";
import {SchemaManager} from "./schema";

/** Default debounce delay for schema updates in milliseconds */
const SCHEMA_UPDATE_DEBOUNCE_MS = 300;

/**
 * Configuration for enabling encrypted key persistence.
 */
export interface KeyPersistenceConfig {
    /** Enable encrypted key persistence */
    enabled: boolean;
    /** Encryption key for AES encryption (min 10 characters) */
    encryptionKey: string;
    /** Storage backend (default: "localStorage") */
    storage?: "localStorage" | "sessionStorage";
    /** Storage key prefix (default: "@graphty-ai-keys") */
    prefix?: string;
}

/**
 * Configuration options for initializing the AiManager.
 */
export interface AiManagerConfig {
    /** The LLM provider to use (e.g., "openai", "anthropic", "google", "mock") */
    provider: ProviderType;
    /** Optional API key for the provider */
    apiKey?: string;
    /** Optional model name override */
    model?: string;
    /** Whether to register built-in commands (default: true) */
    registerBuiltinCommands?: boolean;
    /** Optional custom provider instance (e.g., pre-initialized WebLlmProvider) */
    providerInstance?: LlmProvider;
    /** Key persistence configuration for encrypted storage */
    keyPersistence?: KeyPersistenceConfig;
}

/**
 * AI Manager that integrates LLM-powered natural language control with the Graph.
 * Follows a similar pattern to the Manager interface with init() and dispose().
 *
 * Note: Does not implement the Manager interface directly because it requires
 * graph and config parameters during initialization.
 */
export class AiManager {
    private graph: Graph | null = null;
    private controller: AiController | null = null;
    private provider: LlmProvider | null = null;
    private commandRegistry: CommandRegistry;
    private apiKeyManager: ApiKeyManager;
    private statusManager: AiStatusManager;
    private schemaManager: SchemaManager | null = null;
    private dataAddedListenerId: symbol | null = null;
    private debouncedSchemaUpdate: ReturnType<typeof debounce> | null = null;
    private disposed = false;
    private initialized = false;

    /**
     * Creates a new AiManager instance.
     */
    constructor() {
        this.commandRegistry = new CommandRegistry();
        this.apiKeyManager = new ApiKeyManager();
        this.statusManager = new AiStatusManager();
    }

    /**
     * Initialize the AI Manager with a graph and configuration.
     * @param graph - The graph instance to control
     * @param config - Configuration options
     */
    init(graph: Graph, config: AiManagerConfig): void {
        if (this.initialized) {
            return;
        }

        this.graph = graph;
        this.disposed = false;

        // Configure key persistence if specified (before setting API key)
        if (config.keyPersistence?.enabled) {
            this.apiKeyManager.enablePersistence({
                encryptionKey: config.keyPersistence.encryptionKey,
                storage: config.keyPersistence.storage ?? "localStorage",
                prefix: config.keyPersistence.prefix,
            });
        }

        // Use custom provider instance if provided, otherwise create one
        if (config.providerInstance) {
            this.provider = config.providerInstance;
        } else {
            // Create the provider
            this.provider = createProvider(config.provider);

            // Configure the provider with API key if provided (will be persisted if persistence enabled)
            if (config.apiKey) {
                this.apiKeyManager.setKey(config.provider, config.apiKey);
                this.provider.configure({
                    apiKey: config.apiKey,
                    model: config.model,
                });
            }
        }

        // Register built-in commands unless disabled
        if (config.registerBuiltinCommands !== false) {
            this.registerBuiltinCommands();
        }

        // Initialize schema manager and set up data change listeners
        this.initializeSchemaManager();

        // Create the controller
        this.controller = new AiController({
            provider: this.provider,
            commandRegistry: this.commandRegistry,
            graph: this.graph,
            schemaManager: this.schemaManager,
        });

        this.initialized = true;
    }

    /**
     * Initialize the schema manager and set up event listeners for data changes.
     */
    private initializeSchemaManager(): void {
        if (!this.graph) {
            return;
        }

        // Create schema manager
        this.schemaManager = new SchemaManager(this.graph);

        // Extract initial schema
        this.schemaManager.extract();

        // Set up debounced schema update
        this.debouncedSchemaUpdate = debounce(() => {
            if (this.schemaManager) {
                this.schemaManager.invalidateCache();
            }
        }, SCHEMA_UPDATE_DEBOUNCE_MS);

        // Listen for data-added events to update schema
        try {
            const {eventManager} = this.graph;
            this.dataAddedListenerId = eventManager.addListener("data-added", () => {
                this.debouncedSchemaUpdate?.();
            });
        } catch {
            // EventManager may not be available in all contexts (e.g., tests)
            // Schema will still work, just won't auto-update
        }
    }

    /**
     * Register built-in commands for graph control.
     */
    private registerBuiltinCommands(): void {
        // Query commands
        this.registerCommand(queryGraph);
        this.registerCommand(findNodes);
        this.registerCommand(getSchema);

        // Schema exploration commands
        this.registerCommand(sampleData);
        this.registerCommand(describeProperty);

        // Layout commands
        this.registerCommand(setLayout);
        this.registerCommand(setDimension);

        // Mode commands
        this.registerCommand(setImmersiveMode);

        // Style commands (Phase 5)
        this.registerCommand(findAndStyleNodes);
        this.registerCommand(findAndStyleEdges);
        this.registerCommand(clearStyles);

        // Camera commands (Phase 5)
        this.registerCommand(setCameraPosition);
        this.registerCommand(zoomToNodes);
    }

    /**
     * Register a custom command.
     * @param command - The command to register
     */
    registerCommand(command: Parameters<CommandRegistry["register"]>[0]): void {
        if (!this.commandRegistry.has(command.name)) {
            this.commandRegistry.register(command);
        }
    }

    /**
     * Get names of all registered commands.
     * @returns Array of command names
     */
    getRegisteredCommands(): string[] {
        return this.commandRegistry.getNames();
    }

    /**
     * Execute a natural language command.
     * @param input - The user's natural language input
     * @returns Promise resolving to the execution result
     */
    async execute(input: string): Promise<ExecutionResult> {
        if (this.disposed) {
            return {
                success: false,
                message: "AI Manager has been disposed. Please re-initialize before using.",
            };
        }

        if (!this.controller) {
            return {
                success: false,
                message: "AI Manager not initialized. Call init() first.",
            };
        }

        return this.controller.execute(input);
    }

    /**
     * Set an API key for a provider.
     * @param provider - The provider type (e.g., "openai")
     * @param key - The API key
     */
    setApiKey(provider: ProviderType, key: string): void {
        this.apiKeyManager.setKey(provider, key);

        // If this is the current provider, update it
        if (this.provider?.name === provider) {
            this.provider.configure({apiKey: key});
        }
    }

    /**
     * Get the current AI status.
     * @returns Current status snapshot
     */
    getStatus(): AiStatus {
        return this.controller?.getStatus() ?? this.statusManager.getSnapshot();
    }

    /**
     * Subscribe to status changes.
     * @param callback - Function to call on status change
     * @returns Unsubscribe function
     */
    onStatusChange(callback: StatusChangeCallback): () => void {
        if (this.controller) {
            return this.controller.onStatusChange(callback);
        }

        // Fallback to internal status manager if controller not ready
        return this.statusManager.subscribe(callback);
    }

    /**
     * Cancel any in-progress AI command.
     */
    cancel(): void {
        this.controller?.cancel();
    }

    /**
     * Retry the last AI command that was executed.
     * Useful for retrying after transient errors.
     * @returns Promise resolving to the execution result
     * @throws Error if no previous command exists or AI is not initialized
     */
    async retry(): Promise<ExecutionResult> {
        if (this.disposed) {
            throw new Error("AI Manager has been disposed.");
        }

        if (!this.controller) {
            throw new Error("AI not enabled. Call enableAiControl() first.");
        }

        const lastInput = this.controller.getLastInput();

        if (!lastInput) {
            throw new Error("No previous command to retry.");
        }

        return this.controller.execute(lastInput);
    }

    /**
     * Get the command registry for external command registration.
     * @returns The command registry
     */
    getCommandRegistry(): CommandRegistry {
        return this.commandRegistry;
    }

    /**
     * Get the underlying AI controller (for advanced use).
     * @returns The AI controller or null if not initialized
     */
    getController(): AiController | null {
        return this.controller;
    }

    /**
     * Get the underlying LLM provider (for advanced use).
     * @returns The LLM provider or null if not initialized
     */
    getProvider(): LlmProvider | null {
        return this.provider;
    }

    /**
     * Get the schema manager (for advanced use).
     * @returns The schema manager or null if not initialized
     */
    getSchemaManager(): SchemaManager | null {
        return this.schemaManager;
    }

    /**
     * Get the API key manager for external key operations.
     * Useful for managing keys before AI is fully initialized.
     * @returns The API key manager
     */
    getApiKeyManager(): ApiKeyManager {
        return this.apiKeyManager;
    }

    /**
     * Dispose of the manager and clean up resources.
     */
    dispose(): void {
        if (this.disposed) {
            return;
        }

        this.disposed = true;
        this.initialized = false;

        // Cancel any pending debounced updates
        if (this.debouncedSchemaUpdate) {
            this.debouncedSchemaUpdate.cancel();
            this.debouncedSchemaUpdate = null;
        }

        // Remove event listener
        if (this.dataAddedListenerId && this.graph) {
            try {
                const {eventManager} = this.graph;
                eventManager.removeListener(this.dataAddedListenerId);
            } catch {
                // EventManager may not be available
            }
            this.dataAddedListenerId = null;
        }

        // Clean up schema manager
        this.schemaManager = null;

        if (this.controller) {
            this.controller.dispose();
            this.controller = null;
        }

        this.provider = null;
        this.graph = null;
        this.commandRegistry.clear();
        this.statusManager.reset();
    }
}

/**
 * Create a new AiManager instance.
 * @returns A new AiManager
 */
export function createAiManager(): AiManager {
    return new AiManager();
}
