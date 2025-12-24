// WORKAROUND: Import InstancedMesh first to satisfy Babylon.js side-effect requirement
// See: https://github.com/graphty-org/graphty-element/issues/54
import "@babylonjs/core/Meshes/instancedMesh";
// IMPORTANT: Import graphty-element as a side-effect to ensure the @customElement decorator runs
// and registers the <graphty-element> custom element. This prevents tree-shaking from removing
// the custom element registration when consumers do `import "@graphty/graphty-element";`
import "./src/graphty-element";

// =============================================================================
// Core classes
// =============================================================================
export {Edge} from "./src/Edge";
export {Graph} from "./src/Graph";
export {Graphty} from "./src/graphty-element";
export type {NodeIdType} from "./src/Node";
export {Node} from "./src/Node";
export type {EdgeStyleId, NodeStyleId, StylesOpts} from "./src/Styles";
export {Styles} from "./src/Styles";

// =============================================================================
// Config - Styles, Templates, and Types
// =============================================================================
// Style configuration types
export type {
    AdHocData,
    AppliedEdgeStyleConfig,
    AppliedNodeStyleConfig,
    CalculatedStyleConfig,
    EdgeStyleConfig,
    ImageData,
    NodeStyleConfig,
    RichTextStyleType,
    StyleHelpersType,
    StyleLayerType,
    StyleSchema,
    StyleSchemaV1,
    // View mode types
    ViewMode,
    // XR configuration types
    XRConfig,
    XRInputConfig,
    XRModeConfig,
    XRTeleportationConfig,
    XRUIConfig,
} from "./src/config/index";

// XR partial config type (for setting XR options)
export type {PartialXRConfig} from "./src/config/xr-config-schema";

// Style configuration values and helpers
export {
    CalculatedStyle,
    colorToHex,
    DEFAULT_VIEW_MODE,
    defaultEdgeStyle,
    defaultNodeStyle,
    defaultRichTextLabelStyle,
    defaultXRConfig,
    EdgeStyle,
    isViewMode,
    NodeStyle,
    RichTextStyle,
    StyleHelpers,
    StyleTemplate,
    VIEW_MODE_VALUES,
} from "./src/config/index";

// Suggested styles API
export type {
    ApplySuggestedStylesOptions,
    SuggestedStyleLayer,
    SuggestedStyleLayerMetadata,
    SuggestedStylesConfig,
    SuggestedStylesProvider,
} from "./src/config/index";

// Color palettes for visualizations
export * from "./src/config/palettes/index";

// =============================================================================
// Layout Engine
// =============================================================================
export type {
    EdgePosition,
    Position,
    SimpleLayoutConfigType,
    SimpleLayoutOpts,
} from "./src/layout/LayoutEngine";
export {LayoutEngine, SimpleLayoutConfig, SimpleLayoutEngine} from "./src/layout/LayoutEngine";

// =============================================================================
// Data Sources
// =============================================================================
export type {
    BaseDataSourceConfig,
    DataSourceChunk,
} from "./src/data/DataSource";
export {DataSource} from "./src/data/DataSource";

// Error aggregation for data loading
export type {DataLoadingError, ErrorSummary} from "./src/data/index";
export {ErrorAggregator} from "./src/data/index";

// =============================================================================
// Algorithms
// =============================================================================
export {Algorithm} from "./src/algorithms/Algorithm";

// =============================================================================
// Events
// =============================================================================
export type {
    CameraStateChangedEvent,
    DataLoadingCompleteEvent,
    DataLoadingErrorEvent,
    DataLoadingErrorSummaryEvent,
    DataLoadingProgressEvent,
    EdgeAddEvent,
    EdgeClickEvent,
    EdgeEvent,
    EdgeEventType,
    EdgeGenericEvent,
    EventCallbackType,
    EventType,
    GraphDataAddedEvent,
    GraphDataLoadedEvent,
    GraphErrorEvent,
    GraphEvent,
    GraphEventType,
    GraphGenericEvent,
    GraphLayoutInitializedEvent,
    GraphSettledEvent,
    NodeAddEvent,
    NodeClickEvent,
    NodeDragEndEvent,
    NodeDragStartEvent,
    NodeEvent,
    NodeEventType,
    NodeGenericEvent,
    NodeHoverEvent,
} from "./src/events";

// =============================================================================
// Managers
// =============================================================================
export type {
    Manager,
    ManagerConfig,
    ManagerContext,
    QueueableManager,
} from "./src/managers/index";

// Export specific managers that may be useful for advanced integration
export {
    AlgorithmManager,
    DataManager,
    EventManager,
    InputManager,
    LayoutManager,
    OperationQueueManager,
    RenderManager,
    SelectionManager,
    StatsManager,
    StyleManager,
    UpdateManager,
} from "./src/managers/index";

// GraphContext for custom node/edge implementations
export type {GraphContext, GraphContextConfig} from "./src/managers/index";

// =============================================================================
// Operation Queue Types
// =============================================================================
export type {QueueableOptions, RunAlgorithmOptions} from "./src/utils/queue-migration";

// =============================================================================
// Constants
// =============================================================================
export {EDGE_CONSTANTS, PolyhedronType, SHAPE_CONSTANTS} from "./src/constants/meshConstants";

// =============================================================================
// Screenshot exports
// =============================================================================
export {ScreenshotError, ScreenshotErrorCode} from "./src/screenshot/ScreenshotError";
export type {
    CameraAnimationOptions,
    CameraState,
    ClipboardStatus,
    QualityEnhancementOptions,
    ScreenshotOptions,
    ScreenshotResult,
} from "./src/screenshot/types";

// Capability check for screenshot support
export type {CapabilityCheck} from "./src/screenshot/capability-check";

// =============================================================================
// Video capture exports
// =============================================================================
export {AnimationCancelledError} from "./src/video/MediaRecorderCapture";
export type {
    AnimationOptions,
    AnimationResult,
    CameraWaypoint,
} from "./src/video/VideoCapture";

// Video capture estimation
export type {CaptureEstimate} from "./src/video/estimation";

// Camera presets
export {BUILTIN_PRESETS} from "./src/camera/presets";

// =============================================================================
// Logging
// =============================================================================
export {
    // Storage
    clearLoggingConfig,
    // Configuration
    configureLogging,
    // Sinks
    type ConsoleSinkOptions,
    createConsoleSink,
    createRemoteSink,
    getLoggingConfig,
    // Core logger
    GraphtyLogger,
    type GraphtyLoggerConfig,
    isModuleEnabled,
    loadLoggingConfig,
    // Types
    LOG_LEVEL_NAMES,
    LOG_LEVEL_TO_NAME,
    type Logger,
    type LoggerConfig,
    LogLevel,
    type LogRecord,
    // URL parameters
    type ParsedLoggingParams,
    parseLoggingURLParams,
    parseLogLevel,
    type RemoteSinkOptions,
    resetLoggingConfig,
    saveLoggingConfig,
    type Sink,
} from "./src/logging/index";

// AI Provider exports
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
} from "./src/ai/providers";
export {createProvider, MockLlmProvider, VercelAiProvider} from "./src/ai/providers";

// AI Manager and Controller exports
export type {AiControllerOptions, ExecutionResult} from "./src/ai/AiController";
export {AiController} from "./src/ai/AiController";
export type {AiManagerConfig, KeyPersistenceConfig} from "./src/ai/AiManager";
export {AiManager} from "./src/ai/AiManager";

// AI Status exports
export type {
    AiStage,
    AiState,
    AiStatus,
    StatusChangeCallback,
    ToolCallStatus,
    ToolCallStatusType,
} from "./src/ai/AiStatus";
export {AiStatusManager} from "./src/ai/AiStatus";

// AI Key Management exports
export type {PersistenceConfig} from "./src/ai/keys";
export {ApiKeyManager} from "./src/ai/keys";

// AI Voice Input exports
export type {InputAdapter, InputCallback, InputOptions} from "./src/ai/input";
export {TextInputAdapter} from "./src/ai/input/TextInputAdapter";
export type {VoiceStartCallback} from "./src/ai/input/VoiceInputAdapter";
export {VoiceInputAdapter} from "./src/ai/input/VoiceInputAdapter";

// AI Command exports
export {CommandRegistry} from "./src/ai/commands/CommandRegistry";
export type {CommandContext, CommandExample, CommandResult, GraphCommand} from "./src/ai/commands/types";

// =============================================================================
// Colorblind Simulation Utilities
// =============================================================================
/**
 * Colorblind simulation utilities for accessibility testing.
 *
 * @remarks
 * These functions help test whether color palettes are accessible to users
 * with various forms of color vision deficiency.
 *
 * @see {@link https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-palettepicker--default | Palette Examples}
 */
export {
    areDistinguishableInGrayscale,
    colorDifference,
    isPaletteSafe,
    simulateDeuteranopia,
    simulateProtanopia,
    simulateTritanopia,
    toGrayscale,
} from "./src/utils/styleHelpers/accessibility/colorblindSimulation";
