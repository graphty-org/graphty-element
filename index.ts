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
} from "./src/config/index";

// Style configuration values and helpers
export {
    CalculatedStyle,
    colorToHex,
    defaultEdgeStyle,
    defaultNodeStyle,
    EdgeStyle,
    NodeStyle,
    RichTextStyle,
    StyleHelpers,
    StyleTemplate,
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
    NodeEvent,
    NodeEventType,
    NodeGenericEvent,
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
    LayoutManager,
    OperationQueueManager,
    RenderManager,
    StatsManager,
    StyleManager,
    UpdateManager,
} from "./src/managers/index";

// GraphContext for custom node/edge implementations
export type {GraphContext, GraphContextConfig} from "./src/managers/index";

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

// =============================================================================
// Video capture exports
// =============================================================================
export {AnimationCancelledError} from "./src/video/MediaRecorderCapture";
export type {
    AnimationOptions,
    AnimationResult,
    CameraWaypoint,
} from "./src/video/VideoCapture";

// Camera presets
export {BUILTIN_PRESETS} from "./src/camera/presets";
