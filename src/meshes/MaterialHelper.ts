import {Color3, Mesh, Scene, StandardMaterial} from "@babylonjs/core";

import {type FilledArrowOptions, FilledArrowRenderer} from "./FilledArrowRenderer";

/**
 * Utility for applying 2D vs 3D materials to meshes
 *
 * This helper encapsulates the logic for choosing between:
 * - 2D materials: StandardMaterial with XY plane rotation (for orthographic mode)
 * - 3D materials: ShaderMaterial with billboarding (for perspective mode)
 *
 * All mesh geometry is identical - only materials and rotation differ.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class MaterialHelper {
    /**
     * Apply 2D material to a mesh
     *
     * Creates a StandardMaterial with flat shading and rotates the mesh
     * to lie in the XY plane (90° rotation around X-axis).
     *
     * @param mesh - Mesh to apply material to
     * @param color - Hex color string (e.g., "#ff0000")
     * @param opacity - Opacity value 0-1
     * @param scene - Babylon.js scene
     */
    static apply2DMaterial(mesh: Mesh, color: string, opacity: number, scene: Scene): void {
        const material = new StandardMaterial(`material-2d-${mesh.name}`, scene);

        // Convert hex color to Color3
        const colorObj = Color3.FromHexString(color);

        // Use emissiveColor for self-illumination (required when lighting is disabled)
        material.emissiveColor = colorObj;
        material.alpha = opacity;

        // Disable lighting for consistent appearance
        material.disableLighting = true;

        // Disable backface culling for 2D mode
        // In 2D, meshes are rotated 90° to XY plane and viewed from fixed camera angle
        // Backface culling doesn't work reliably with this setup, so render both sides
        material.backFaceCulling = false;

        // Apply material
        mesh.material = material;

        // Rotate to XY plane (90° around X-axis)
        // This makes the mesh face the camera in orthographic 2D mode
        mesh.rotation.x = Math.PI / 2;

        // Mark as 2D for later identification
        mesh.metadata = mesh.metadata ?? {};
        mesh.metadata.is2D = true;
    }

    /**
     * Apply 3D material to a mesh
     *
     * Delegates to FilledArrowRenderer.applyShader() to create a ShaderMaterial
     * with billboarding and screen-space scaling.
     *
     * @param mesh - Mesh to apply material to
     * @param options - Arrow options (size, color, opacity)
     * @param scene - Babylon.js scene
     */
    static apply3DMaterial(mesh: Mesh, options: FilledArrowOptions, scene: Scene): void {
        FilledArrowRenderer.applyShader(mesh, options, scene);
    }
}
