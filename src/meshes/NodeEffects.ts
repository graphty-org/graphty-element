import {
    AbstractMesh,
    Color3,
    HighlightLayer,
    Mesh,
    Scene,
} from "@babylonjs/core";

import type {NodeStyleConfig} from "../config";

/**
 * Default outline configuration for selection highlight.
 */
const DEFAULT_OUTLINE_COLOR = "#FFFF00";

/**
 * Manages visual effects for node meshes.
 * Currently supports:
 * - Outline effect using Babylon.js HighlightLayer
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class NodeEffects {
    private static readonly HIGHLIGHT_LAYER_NAME = "graphty-selection-highlight";

    /**
     * Check if a HighlightLayer has been disposed.
     * HighlightLayer doesn't have an isDisposed property, so we check if it's still in the scene.
     * @param layer - The highlight layer to check
     * @param scene - The Babylon.js scene
     * @returns True if the layer has been disposed
     */
    private static isLayerDisposed(layer: HighlightLayer, scene: Scene): boolean {
        return !scene.effectLayers.includes(layer);
    }

    /**
     * Get or create the HighlightLayer for selection outlines.
     * The layer is stored on scene.metadata for reuse.
     * @param scene - The Babylon.js scene
     * @returns The highlight layer for the scene
     */
    private static getOrCreateHighlightLayer(scene: Scene): HighlightLayer {
        // Check if layer already exists on scene metadata
        const existingLayer = scene.metadata?.highlightLayer as HighlightLayer | undefined;
        if (existingLayer && !this.isLayerDisposed(existingLayer, scene)) {
            return existingLayer;
        }

        // Create new highlight layer
        const highlightLayer = new HighlightLayer(this.HIGHLIGHT_LAYER_NAME, scene, {
            isStroke: true,
            blurHorizontalSize: 0.5,
            blurVerticalSize: 0.5,
        });

        // Store on scene metadata
        scene.metadata = scene.metadata ?? {};
        scene.metadata.highlightLayer = highlightLayer;

        return highlightLayer;
    }

    /**
     * Apply outline effect to a mesh based on the style configuration.
     * If the style has an outline effect, the mesh is added to the HighlightLayer.
     * If not, the mesh is removed from the HighlightLayer.
     * @param mesh The mesh to apply the effect to
     * @param effect The effect configuration from the node style
     */
    static applyOutlineEffect(
        mesh: AbstractMesh,
        effect: NodeStyleConfig["effect"] | undefined,
    ): void {
        const scene = mesh.getScene();
        const highlightLayer = this.getOrCreateHighlightLayer(scene);

        // Cast to Mesh - our node meshes are always Mesh or InstancedMesh (which extends Mesh)
        const meshAsMesh = mesh as Mesh;

        if (effect?.outline) {
            // Extract outline color
            const colorValue = this.extractColorValue(effect.outline.color);
            const color = Color3.FromHexString(colorValue ?? DEFAULT_OUTLINE_COLOR);

            // Add mesh to highlight layer with the outline color
            // Note: HighlightLayer has issues with InstancedMesh, so we catch errors
            // and silently fail. For instanced meshes, use texture color changes instead.
            try {
                highlightLayer.addMesh(meshAsMesh, color);
            } catch {
                // Silently fail - this is expected for instanced meshes
            }
        } else {
            // Remove mesh from highlight layer if no outline effect
            try {
                highlightLayer.removeMesh(meshAsMesh);
            } catch {
                // Silently fail - mesh may not be in the layer
            }
        }
    }

    /**
     * Remove a mesh from the highlight layer.
     * Should be called when disposing a node.
     * @param mesh - The mesh to remove from highlighting
     */
    static removeFromHighlight(mesh: AbstractMesh): void {
        const scene = mesh.getScene();
        const existingLayer = scene.metadata?.highlightLayer as HighlightLayer | undefined;
        if (existingLayer && !this.isLayerDisposed(existingLayer, scene)) {
            existingLayer.removeMesh(mesh as Mesh);
        }
    }

    /**
     * Extract a color string from a color configuration.
     * @param color - Color configuration object or string
     * @returns Extracted color string or undefined
     */
    private static extractColorValue(color: unknown): string | undefined {
        if (typeof color === "string") {
            return color;
        }

        if (typeof color === "object" && color !== null) {
            const colorObj = color as {colorType?: string, value?: string};
            if (colorObj.colorType === "solid" && colorObj.value) {
                return colorObj.value;
            }
        }

        return undefined;
    }

    /**
     * Dispose the highlight layer for a scene.
     * Should be called when the graph is disposed.
     * @param scene - The Babylon.js scene
     */
    static disposeHighlightLayer(scene: Scene): void {
        const existingLayer = scene.metadata?.highlightLayer as HighlightLayer | undefined;
        if (existingLayer && !this.isLayerDisposed(existingLayer, scene)) {
            existingLayer.dispose();
            scene.metadata.highlightLayer = undefined;
        }
    }
}
