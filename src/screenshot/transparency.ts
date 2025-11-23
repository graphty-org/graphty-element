import {type BaseTexture, Color4, type Mesh, type Scene} from "@babylonjs/core";

export interface BackgroundState {
    clearColor: Color4;
    skyboxEnabled: boolean;
    environmentTexture: BaseTexture | null;
    imageProcessingEnabled: boolean;
}

/**
 * Enables transparent background for screenshot capture
 * Saves the current state and disables all background layers
 */
export function enableTransparentBackground(
    scene: Scene,
    skybox: Mesh | null,
): BackgroundState {
    const original: BackgroundState = {
        clearColor: scene.clearColor.clone(),
        skyboxEnabled: skybox?.isEnabled() ?? false,
        environmentTexture: scene.environmentTexture,
        imageProcessingEnabled: scene.imageProcessingConfiguration.isEnabled,
    };

    // Disable ALL background layers
    scene.clearColor = new Color4(0, 0, 0, 0);

    if (skybox) {
        skybox.setEnabled(false);
    }

    scene.environmentTexture = null;
    scene.imageProcessingConfiguration.vignetteEnabled = false;

    return original;
}

/**
 * Restores the background state after screenshot capture
 */
export function restoreBackground(
    scene: Scene,
    skybox: Mesh | null,
    state: BackgroundState,
): void {
    scene.clearColor = state.clearColor;
    if (skybox) {
        skybox.setEnabled(state.skyboxEnabled);
    }

    scene.environmentTexture = state.environmentTexture;
    scene.imageProcessingConfiguration.isEnabled = state.imageProcessingEnabled;
}
