import {
    Color3,
    Effect,
    Mesh,
    Scene,
    ShaderMaterial,
    Vector3,
    VertexData,
} from "@babylonjs/core";

export interface FilledArrowOptions {
    size: number; // Screen-space size in pixels
    color: string; // Hex color
    opacity?: number; // 0-1
}

/**
 * Renderer for filled arrow heads using uniform screen-space scaling
 *
 * Uses the SAME screen-space formula as CustomLineRenderer (* clipPos.w / resolution)
 * to guarantee perfect alignment between lines and filled arrows.
 *
 * Architecture:
 * - Standard polygon meshes (triangles, not quad-strips)
 * - Uniform scaling shader (not perpendicular expansion)
 * - Screen-space sizing formula matches CustomLineRenderer exactly
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Utility class with static state for shader registration
export class FilledArrowRenderer {
    private static shadersRegistered = false;

    // Shared callback optimization: Track all active materials
    private static activeMaterials = new Set<ShaderMaterial>();
    private static cameraCallbackRegistered = false;

    /**
     * Register filled arrow shaders
     */
    static registerShaders(): void {
        if (this.shadersRegistered) {
            return;
        }

        // Vertex Shader: Tangent Billboarding
        //
        // Tangent billboarding: Arrow aligns with line direction AND rotates around
        // the line axis to always show its face to the camera.
        //
        // Strategy:
        // 1. Extract arrow center position from world matrix
        // 2. Build camera-facing coordinate system:
        //    - forward = line direction (arrow points this way)
        //    - right = perpendicular to both line and camera direction
        //    - up = perpendicular to forward and right (faces camera)
        // 3. Transform arrow vertices using this coordinate system
        // 4. Apply perspective projection
        //
        // Benefits:
        // 1. Arrow points along line (forward direction)
        // 2. Arrow rotates to face camera (around line axis)
        // 3. Arrow visible from ANY camera angle (never edge-on)
        // 4. Arrow base stays fixed (zero gap with line)
        // 5. Natural perspective foreshortening
        Effect.ShadersStore.filledArrowVertexShader = `
precision highp float;

// Attributes
attribute vec3 position;      // Arrow geometry (XY plane, pointing along +X)

// Uniforms
uniform mat4 viewProjection;
uniform mat4 world;            // World matrix (for individual meshes)
uniform vec3 cameraPosition;
uniform vec3 lineDirection;    // Line direction (uniform for individual meshes)
uniform float size;

void main() {
    // Use world matrix directly (individual meshes)
    mat4 finalWorld = world;

    // Extract arrow center position from world matrix
    vec3 worldCenter = vec3(finalWorld[3][0], finalWorld[3][1], finalWorld[3][2]);

    // Build camera-facing coordinate system
    // This system is aligned with the line but rotates to face the camera
    vec3 forward = normalize(lineDirection);              // Arrow points along line
    vec3 toCamera = normalize(cameraPosition - worldCenter);
    vec3 right = normalize(cross(forward, toCamera));     // Perpendicular to line AND camera
    vec3 up = cross(right, forward);                      // Completes orthonormal basis, faces camera

    // Transform arrow vertex from local space to world space
    // Local space: position.x along +X (forward), position.y along +Y (up)
    // World space: aligned with line, facing camera
    vec3 worldOffset = position.x * forward + position.y * up + position.z * right;
    vec4 worldPos = vec4(worldCenter + worldOffset * size, 1.0);

    // Transform to clip space
    gl_Position = viewProjection * worldPos;
}
`;

        // Fragment Shader: Simple solid color
        Effect.ShadersStore.filledArrowFragmentShader = `
precision highp float;

// Uniforms
uniform vec3 color;
uniform float opacity;

void main() {
    gl_FragColor = vec4(color, opacity);
}
`;

        this.shadersRegistered = true;
    }

    /**
     * Register the shared camera position update callback
     * This callback updates ALL arrow materials at once, instead of having one callback per material.
     * This dramatically improves performance when rendering many arrows.
     */
    private static registerCameraCallback(scene: Scene): void {
        if (this.cameraCallbackRegistered) {
            return;
        }

        this.cameraCallbackRegistered = true;

        scene.onBeforeRenderObservable.add(() => {
            const camera = scene.activeCamera;
            if (!camera) {
                return;
            }

            // Query camera position once per frame
            const cameraPos = camera.globalPosition;

            // Update all active materials in one batch
            for (const material of this.activeMaterials) {
                try {
                    material.setVector3("cameraPosition", cameraPos);
                } catch {
                    // Material was disposed, remove from set
                    this.activeMaterials.delete(material);
                }
            }
        });
    }

    /**
     * Create a filled triangle arrow mesh
     *
     * Geometry is in XY plane pointing towards +X axis
     * Uses normalized dimensions - actual sizing handled by shader
     *
     * @param inverted If true, arrow points backward
     * @param scene Babylon.js scene
     */
    static createTriangle(
        inverted: boolean,
        scene: Scene,
    ): Mesh {
        const mesh = new Mesh("filled-triangle-arrow", scene);

        // Normalized dimensions
        const length = 1.0;
        const width = 0.8;

        // Tip at origin, base extends backward
        // This allows positionOffset: 0 to place tip exactly at sphere surface
        const tip = 0;
        const base = inverted ? length : -length;

        // XZ plane (normal in Y), pointing along X axis
        // Y=0 so the face normal points in ±Y, which maps to 'up' (toward camera)
        const positions = [
            tip,
            0,
            0, // Tip at origin
            base,
            0,
            -width / 2, // Bottom corner (at base)
            base,
            0,
            width / 2, // Top corner (at base)
        ];

        const indices = [0, 1, 2]; // One triangle

        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.applyToMesh(mesh);

        return mesh;
    }

    /**
     * Create a filled diamond arrow mesh
     *
     * Geometry is in XY plane with diamond shape
     * Uses normalized dimensions - actual sizing handled by shader
     *
     * @param scene Babylon.js scene
     */
    static createDiamond(scene: Scene): Mesh {
        const mesh = new Mesh("filled-diamond-arrow", scene);

        // Normalized dimensions
        const length = 1.0;
        const width = 0.8;

        // Front tip at origin, extends backward
        // This allows positionOffset: 0 to place front tip exactly at sphere surface
        // XZ plane (normal in Y) so face points toward camera
        const positions = [
            0,
            0,
            0, // Front tip at origin
            -length / 2,
            0,
            width / 2, // Top (at middle)
            -length,
            0,
            0, // Back tip
            -length / 2,
            0,
            -width / 2, // Bottom (at middle)
        ];

        const indices = [
            0,
            1,
            2, // Top half
            0,
            2,
            3, // Bottom half
        ];

        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.applyToMesh(mesh);

        return mesh;
    }

    /**
     * Create a filled box arrow mesh
     *
     * Geometry is in XY plane as a rectangle
     * Uses normalized dimensions - actual sizing handled by shader
     *
     * @param scene Babylon.js scene
     */
    static createBox(scene: Scene): Mesh {
        const mesh = new Mesh("filled-box-arrow", scene);

        // Normalized dimensions
        const length = 1.0;
        const width = 0.8;

        const halfWidth = width / 2;

        // Front edge at origin, extends backward
        // This allows positionOffset: 0 to place front edge exactly at sphere surface
        // XZ plane (normal in Y) so face points toward camera
        const positions = [
            -length,
            0,
            halfWidth, // Top-left (back)
            0,
            0,
            halfWidth, // Top-right at origin (front)
            0,
            0,
            -halfWidth, // Bottom-right at origin (front)
            -length,
            0,
            -halfWidth, // Bottom-left (back)
        ];

        const indices = [
            0,
            1,
            2, // First triangle
            0,
            2,
            3, // Second triangle
        ];

        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.applyToMesh(mesh);

        return mesh;
    }

    /**
     * Create a filled circle arrow mesh
     *
     * Geometry is in XY plane as a circle
     * Uses normalized dimensions - actual sizing handled by shader
     *
     * @param scene Babylon.js scene
     * @param segments Number of segments for circle smoothness (default: 32)
     */
    static createCircle(scene: Scene, segments = 32): Mesh {
        const mesh = new Mesh("filled-circle-arrow", scene);

        // Normalized radius
        const radius = 0.4; // Smaller than other shapes for "dot" appearance

        const positions: number[] = [0, 0, 0]; // Center point
        const indices: number[] = [];

        // Generate circle vertices in YZ plane (perpendicular to line direction)
        // This ensures the circle always faces the camera (tangent billboarding)
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            positions.push(
                0, // X = 0 (no extent along line)
                Math.cos(angle) * radius, // Y → up (toward camera)
                Math.sin(angle) * radius, // Z → right (perpendicular)
            );
        }

        // Generate triangle fan indices
        for (let i = 1; i <= segments; i++) {
            indices.push(
                0, // Center
                i, // Current point
                i + 1, // Next point
            );
        }

        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.applyToMesh(mesh);

        return mesh;
    }

    /**
     * Apply the filled arrow shader to a mesh
     *
     * Uses tangent billboarding: arrow aligns with line direction in screen space.
     * lineDirection is passed as a uniform (set via setLineDirection method).
     *
     * @param mesh Mesh to apply shader to
     * @param options Styling options
     * @param scene Babylon.js scene
     */
    static applyShader(mesh: Mesh, options: FilledArrowOptions, scene: Scene): Mesh {
        this.registerShaders();

        // Create shader material
        const shaderMaterial = new ShaderMaterial(
            "filledArrowMaterial",
            scene,
            {
                vertex: "filledArrow",
                fragment: "filledArrow",
            },
            {
                attributes: ["position"],
                uniforms: [
                    "viewProjection",
                    "cameraPosition",
                    "size",
                    "color",
                    "opacity",
                    "lineDirection", // Now a uniform instead of per-instance attribute
                ],
            },
        );

        // Set uniforms
        const colorObj = Color3.FromHexString(options.color);
        shaderMaterial.setVector3("color", new Vector3(colorObj.r, colorObj.g, colorObj.b));
        shaderMaterial.setFloat("size", options.size);
        shaderMaterial.setFloat("opacity", options.opacity ?? 1.0);

        // Initialize lineDirection to a default value (will be updated per-edge)
        shaderMaterial.setVector3("lineDirection", new Vector3(1, 0, 0));

        // Register material for shared camera position updates
        this.activeMaterials.add(shaderMaterial);
        this.registerCameraCallback(scene);

        shaderMaterial.backFaceCulling = false;
        mesh.material = shaderMaterial;

        // No thin instance support needed - each edge has its own mesh
        // Setting isVisible = false hides ALL thin instances, not just the base mesh.
        // Instead, we rely on the mesh being moved far away in EdgeMesh.createArrowHead()
        // via position.set(0, -10000, 0) to hide the base mesh template.

        // CRITICAL: Disable frustum culling for thin instances!
        // The base mesh is positioned far away (-10000), so the bounding box calculation
        // causes frustum culling to incorrectly hide instances that are actually on screen.
        mesh.alwaysSelectAsActiveMesh = true;

        return mesh;
    }

    /**
     * Set the line direction for a filled arrow mesh
     * This should be called every frame when the edge updates
     *
     * @param mesh Filled arrow mesh
     * @param direction Line direction vector (normalized)
     */
    static setLineDirection(mesh: Mesh, direction: Vector3): void {
        const material = mesh.material as ShaderMaterial;
        if (material) {
            material.setVector3("lineDirection", direction);
        }
    }
}
