import {AbstractMesh, NullEngine, Scene} from "@babylonjs/core";

import type {AdHocData, EdgeStyleConfig, StyleSchemaV1} from "../../src/config";
import {Graph} from "../../src/Graph";
import type {DataManager} from "../../src/managers/DataManager";
import type {LayoutManager} from "../../src/managers/LayoutManager";
import type {PatternedLineMesh} from "../../src/meshes/PatternedLineMesh";

/**
 * Arrow style config type extracted from EdgeStyleConfig
 */
export type ArrowStyleConfig = NonNullable<EdgeStyleConfig["arrowHead"]>;

/**
 * Helper to check if a mesh is disposed.
 * Handles the difference between AbstractMesh (method) and PatternedLineMesh (property).
 */
export function isDisposed(mesh: AbstractMesh | PatternedLineMesh): boolean {
    if ("isDisposed" in mesh) {
        if (typeof mesh.isDisposed === "function") {
            return mesh.isDisposed();
        }

        return mesh.isDisposed;
    }

    return false;
}

/**
 * Type helper to access private Graph members in tests.
 * Uses Omit to remove the private members first, then re-add them as public.
 * This avoids TypeScript's intersection reduction to 'never'.
 */
export interface TestGraph extends Omit<Graph, "dataManager" | "layoutManager"> {
    dataManager: DataManager;
    layoutManager: LayoutManager;
}

/**
 * Cast a plain object to AdHocData for test purposes
 * This allows tests to pass simple objects to graph.addNode/addEdge
 */
export function asData<T extends Record<string, unknown>>(data: T): AdHocData & T {
    return data as AdHocData & T;
}

/**
 * Create a complete graph config with defaults filled in
 */
export function graphConfig(opts: {twoD?: boolean, addDefaultStyle?: boolean}): {
    addDefaultStyle: boolean;
    background: {backgroundType: "color", color: string};
    startingCameraDistance: number;
    twoD: boolean;
} {
    return {
        addDefaultStyle: opts.addDefaultStyle ?? true,
        background: {backgroundType: "color", color: "#2D2D2D"},
        startingCameraDistance: 30,
        twoD: opts.twoD ?? false,
    };
}

/**
 * Create a complete arrow config with defaults filled in
 */
export function arrowConfig(opts: {type: ArrowStyleConfig["type"], color?: string, size?: number, opacity?: number}): ArrowStyleConfig {
    return {
        type: opts.type,
        size: opts.size ?? 1.0,
        color: opts.color ?? "#FFFFFF",
        opacity: opts.opacity ?? 1.0,
    };
}

/**
 * Create a complete edge style config with defaults filled in
 */
export function edgeStyleConfig(opts: {
    lineType?: NonNullable<EdgeStyleConfig["line"]>["type"];
    lineColor?: string;
    arrowHead?: ArrowStyleConfig["type"];
    arrowHeadColor?: string;
}): EdgeStyleConfig {
    return {
        enabled: true,
        line: {
            type: opts.lineType ?? "solid",
            color: opts.lineColor ?? "#AAAAAA",
        },
        arrowHead: opts.arrowHead ? arrowConfig({type: opts.arrowHead, color: opts.arrowHeadColor}) : undefined,
    };
}

/**
 * Create a complete style template with all required properties
 */
export function styleTemplate(opts: {
    twoD?: boolean;
    addDefaultStyle?: boolean;
    layers?: StyleSchemaV1["layers"];
}): StyleSchemaV1 {
    return {
        graphtyTemplate: true,
        majorVersion: "1",
        graph: graphConfig({twoD: opts.twoD, addDefaultStyle: opts.addDefaultStyle}),
        layers: opts.layers ?? [],
        data: {
            knownFields: {
                nodeIdPath: "id",
                nodeWeightPath: null,
                nodeTimePath: null,
                edgeSrcIdPath: "src",
                edgeDstIdPath: "dst",
                edgeWeightPath: null,
                edgeTimePath: null,
            },
        },
        behavior: {
            layout: {
                type: "ngraph",
                preSteps: 0,
                stepMultiplier: 1,
                minDelta: 0,
                zoomStepInterval: 1,
            },
            node: {
                pinOnDrag: true,
            },
        },
    };
}

/**
 * Creates a test graph instance with NullEngine
 * This provides a real Graph instance without needing to render
 */
export async function createTestGraph(): Promise<Graph> {
    // Create a container element
    const container = document.createElement("div");
    container.id = "test-graph-container";
    document.body.appendChild(container);

    // Create graph instance
    const graph = new Graph(container);

    // Override engine creation to use NullEngine
    const graphWithEngine = graph as Graph & {createEngine: () => unknown, engine: unknown};
    const originalCreateEngine = graphWithEngine.createEngine;
    graphWithEngine.createEngine = function() {
        this.engine = new NullEngine();
        return this.engine;
    };

    // Initialize
    await graph.init();

    // Restore original method
    graphWithEngine.createEngine = originalCreateEngine;

    return graph;
}

/**
 * Creates a minimal test scene with NullEngine
 */
export function createTestScene(): Scene {
    const engine = new NullEngine();
    return new Scene(engine);
}

/**
 * Cleans up test graph instance
 */
export function cleanupTestGraph(graph: Graph): void {
    graph.shutdown();
    const container = document.getElementById("test-graph-container");
    if (container) {
        container.remove();
    }
}
