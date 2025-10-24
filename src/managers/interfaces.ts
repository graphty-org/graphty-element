import type {Engine, Scene, WebGPUEngine} from "@babylonjs/core";

import type {EventManager} from "./EventManager";
import type {OperationCategory} from "./OperationQueueManager";

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
 * Interface for managers that can queue operations
 */
export interface QueueableManager extends Manager {
    /**
     * Queue an operation for execution
     * @param category The category of operation
     * @param fn The function to execute
     * @returns The operation ID
     */
    queueOperation?(category: OperationCategory, fn: () => void | Promise<void>): string;
}

/**
 * Context provided to all managers for shared resources
 */
export interface ManagerContext {
    scene: Scene;
    engine: Engine | WebGPUEngine;
    canvas: HTMLCanvasElement;
    eventManager: EventManager;
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
