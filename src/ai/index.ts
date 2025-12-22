/**
 * AI Module - Natural language control interface for graphty-element.
 * @module ai
 */

// Status
export type {
    AiStage,
    AiState,
    AiStatus,
    StatusChangeCallback,
    ToolCallStatus,
    ToolCallStatusType,
} from "./AiStatus";
export {AiStatusManager} from "./AiStatus";

// Controller
export type {AiControllerOptions, AiEventEmitter, ExecutionResult} from "./AiController";
export {AiController} from "./AiController";

// Manager (Phase 3)
export type {AiManagerConfig, KeyPersistenceConfig} from "./AiManager";
export {AiManager, createAiManager} from "./AiManager";

// Commands
export {
    // Capture commands (Phase 7)
    captureScreenshot,
    captureVideo,
    // Style commands
    clearStyles,
    CommandRegistry,
    // Schema commands
    describeProperty,
    findAndStyleEdges,
    findAndStyleNodes,
    findNodes,
    // Algorithm commands
    listAlgorithms,
    // Query commands
    queryGraph,
    runAlgorithm,
    sampleData,
    // Camera commands
    setCameraPosition,
    setDimension,
    // Mode commands
    setImmersiveMode,
    // Layout commands
    setLayout,
    zoomToNodes,
} from "./commands";
export type {
    CommandContext,
    CommandExample,
    CommandResult,
    GraphCommand,
} from "./commands/types";

// Providers
export type {
    LlmProvider,
    LlmResponse,
    Message,
    ProviderOptions,
    ProviderType,
    StreamCallbacks,
    ToolCall,
    ToolDefinition,
    VercelProviderType,
} from "./providers";
export {
    createProvider,
    MockLlmProvider,
    VercelAiProvider,
} from "./providers";

// Keys (Phase 7)
export type {PersistenceConfig} from "./keys";
export {ApiKeyManager} from "./keys";

// Prompt Builder (Phase 3)
export type {SystemPromptOptions} from "./prompt/SystemPromptBuilder";
export {createSystemPromptBuilder, SystemPromptBuilder} from "./prompt/SystemPromptBuilder";

// Input Adapters (Phase 6)
export type {InputAdapter, InputCallback, InputOptions} from "./input";
export {TextInputAdapter, VoiceInputAdapter} from "./input";

// Schema Discovery (Phase 4-6)
export type {
    HistogramBin,
    NumericStatistics,
    PropertySummary,
    PropertyType,
    SchemaExtractorOptions,
    SchemaSummary,
} from "./schema";
export {
    formatSchemaForPrompt,
    SchemaExtractor,
    SchemaManager,
} from "./schema";
