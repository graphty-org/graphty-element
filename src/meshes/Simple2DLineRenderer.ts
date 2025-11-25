import {Color3, Mesh, Scene, StandardMaterial, Vector3, VertexData} from "@babylonjs/core";

/**
 * Renderer for simple 2D solid lines in world-space
 *
 * Creates rectangular meshes in the XY plane using StandardMaterial.
 * In 2D orthographic mode, the camera looks down at the XY plane,
 * so lines are simple rectangles positioned and rotated in that plane.
 *
 * This enables proper world-space zoom behavior where lines scale
 * proportionally with the camera zoom level.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Simple2DLineRenderer {
    /**
     * Create a 2D line mesh
     *
     * Creates a simple rectangle in the XY plane, positioned at the midpoint
     * and rotated to align with the line direction.
     *
     * @param start - Start position of the line
     * @param end - End position of the line
     * @param width - Width of the line in world units
     * @param color - Hex color string (e.g., "#ff0000")
     * @param opacity - Opacity value 0-1
     * @param scene - Babylon.js scene
     * @returns Mesh representing the 2D line
     */
    static create(
        start: Vector3,
        end: Vector3,
        width: number,
        color: string,
        opacity: number,
        scene: Scene,
    ): Mesh {
        const mesh = new Mesh("line-2d", scene);

        // Calculate line properties
        const direction = end.subtract(start);
        const length = direction.length();

        // Create unit rectangle geometry (1x1 in XY plane, centered at origin)
        this.createUnitRectangle(mesh);

        // Create StandardMaterial
        const material = new StandardMaterial(`line-2d-material-${Date.now()}`, scene);
        const colorObj = Color3.FromHexString(color);
        material.emissiveColor = colorObj; // Self-illuminated (no lighting needed)
        material.alpha = opacity;
        material.disableLighting = true; // Disable lighting for consistent flat appearance
        material.backFaceCulling = false; // Visible from both sides
        mesh.material = material;

        // Position at midpoint
        const midpoint = start.add(end).scale(0.5);
        mesh.position = midpoint;

        // Scale: length in X direction, width in Y direction
        mesh.scaling = new Vector3(length, width, 1);

        // Rotate to align with line direction in XY plane
        // Calculate angle from +X axis to the line direction (in XY plane only)
        const angle = Math.atan2(direction.y, direction.x);
        mesh.rotation.z = angle; // Rotate around Z axis

        // Store metadata
        mesh.metadata = mesh.metadata ?? {};
        mesh.metadata.is2DLine = true;
        mesh.metadata.lineWidth = width;

        return mesh;
    }

    /**
     * Update line positions
     *
     * Updates the mesh position, scaling, and rotation when line endpoints change.
     *
     * @param mesh - Mesh to update
     * @param start - New start position
     * @param end - New end position
     */
    static updatePositions(mesh: Mesh, start: Vector3, end: Vector3): void {
        // Calculate line properties
        const direction = end.subtract(start);
        const length = direction.length();

        // Get current width from mesh metadata
        const width = mesh.metadata?.lineWidth ?? 0.1;

        // Update position to midpoint
        const midpoint = start.add(end).scale(0.5);
        mesh.position = midpoint;

        // Update scaling (length in X, width in Y)
        mesh.scaling = new Vector3(length, width, 1);

        // Update rotation to align with line direction in XY plane
        const angle = Math.atan2(direction.y, direction.x);
        mesh.rotation.z = angle;
    }

    /**
     * Create a unit rectangle (1x1) centered at the origin in the XY plane
     *
     * This geometry will be scaled and rotated to match the line's length and direction.
     *
     * @param mesh - Mesh to apply geometry to
     */
    private static createUnitRectangle(mesh: Mesh): void {
        // Create a 1x1 rectangle centered at origin in the XY plane
        // Vertices: from -0.5 to +0.5 in both X and Y, Z=0
        const positions = [
            0.5,
            0.5,
            0, // Top-right
            0.5,
            -0.5,
            0, // Bottom-right
            -0.5,
            -0.5,
            0, // Bottom-left
            -0.5,
            0.5,
            0, // Top-left
        ];

        // Two triangles to form the rectangle
        const indices = [
            0,
            1,
            2, // First triangle
            0,
            2,
            3, // Second triangle
        ];

        // Normals pointing in +Z direction (toward camera in 2D orthographic view)
        const normals = [
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
        ];

        // Apply vertex data
        const vertexData = new VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;

        vertexData.applyToMesh(mesh);
    }
}
