// WORKAROUND: Import InstancedMesh first to satisfy Babylon.js side-effect requirement
// See: https://github.com/graphty-org/graphty-element/issues/54
import "@babylonjs/core/Meshes/instancedMesh";

export type {StyleSchema, StyleSchemaV1} from "./src/config";
export {StyleTemplate} from "./src/config";
export {DataSource} from "./src/data/DataSource";
export {Edge} from "./src/Edge";
export {Graph} from "./src/Graph";
export {Graphty} from "./src/graphty-element";
export {LayoutEngine} from "./src/layout/LayoutEngine";
export {Node} from "./src/Node";
export {Styles} from "./src/Styles";

// Screenshot exports
export {ScreenshotError, ScreenshotErrorCode} from "./src/screenshot/ScreenshotError";
export type {
    CameraAnimationOptions,
    CameraState,
    ClipboardStatus,
    QualityEnhancementOptions,
    ScreenshotOptions,
    ScreenshotResult,
} from "./src/screenshot/types";

// Video capture exports
export {AnimationCancelledError} from "./src/video/MediaRecorderCapture";
export type {
    AnimationOptions,
    AnimationResult,
    CameraWaypoint,
} from "./src/video/VideoCapture";
