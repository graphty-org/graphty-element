import type {Engine, Scene, WebGPUEngine} from "@babylonjs/core";

import type {Stats} from "../Stats";
import type {EventManager} from "./EventManager";

/**
 * Base interface for all manager classes
 */
export interface Manager {
    /**
     * Initialize the manager
     */
    init(): Promise<void>;

    /**
     * Dispose of all resources held by the manager
     */
    dispose(): void;
}

/**
 * Context provided to all managers for shared resources
 */
export interface ManagerContext {
    scene: Scene;
    engine: Engine | WebGPUEngine;
    canvas: HTMLCanvasElement;
    eventManager: EventManager;
    stats: Stats;
}

/**
 * Configuration for manager initialization
 */
export interface ManagerConfig {
    /**
     * Whether to enable debug logging
     */
    debug?: boolean;
}
