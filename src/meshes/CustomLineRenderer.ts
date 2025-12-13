import {
    Color3,
    Effect,
    Mesh,
    Scene,
    ShaderMaterial,
    Vector2,
    Vector3,
    VertexData,
} from "@babylonjs/core";

export interface LineGeometry {
    positions: number[]; // Vertex positions (center line)
    directions: number[]; // Tangent directions
    sides: number[]; // -1 or +1 for perpendicular offset
    distances: number[]; // Cumulative distance for patterns
    uvs: number[]; // UV coordinates
    indices: number[]; // Triangle indices
}

export interface CustomLineOptions {
    points: Vector3[]; // Path points
    width: number; // Line width in pixels
    color: string; // Line color (hex)
    opacity?: number; // Opacity 0-1
    pattern?: string; // solid, dash, dot, etc.
    dashLength?: number; // For dash pattern
    gapLength?: number; // For dash pattern
}

/**
 * Custom line rendering system
 *
 * Replaces GreasedLine with a custom quad-strip mesh approach that gives
 * complete control over rendering, patterns, and arrowhead integration.
 *
 * Architecture:
 * - Geometry: Quad strip along path (2 triangles per segment)
 * - Vertex Shader: Screen-space width expansion
 * - Fragment Shader: Pattern rendering (dash, dot, etc.)
 *
 * Performance:
 * - Supports thousands of edges via mesh instancing
 * - Cached geometry for static edges
 * - LOD support for distant edges
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Utility class with static state for shader registration
export class CustomLineRenderer {
    private static shadersRegistered = false;

    // Shared callback optimization: Track all active materials
    private static activeMaterials = new Set<ShaderMaterial>();
    private static registeredScene: Scene | null = null;

    /**
     * Register custom line shaders
     */
    static registerShaders(): void {
        if (this.shadersRegistered) {
            return;
        }

        // Vertex Shader: Screen-space width expansion
        // This matches the formula we learned from GreasedLine and dot arrowhead work
        // Updated to support instancing (required for BabylonJS mesh caching)
        Effect.ShadersStore.customLineVertexShader = `
precision highp float;

// Attributes
attribute vec3 position;      // Actual vertex position (start or end of segment)
attribute vec3 direction;     // Segment direction vector (full length from start to end)
attribute float side;         // -1 or +1 for left/right
attribute float distance;     // Distance along line (for patterns)
attribute vec2 uv;

// Uniforms
uniform mat4 world;
uniform mat4 viewProjection;
uniform mat4 projection;
uniform vec2 resolution;
uniform float width;

// Varyings
varying vec2 vUV;
varying float vDistance;

// Instance support - BabylonJS include provides finalWorld matrix
#include<instancesDeclaration>

void main() {
    // Compute finalWorld matrix (handles both instanced and non-instanced meshes)
    #include<instancesVertex>

    // Transform vertex to clip space using finalWorld
    vec4 vertexClip = viewProjection * finalWorld * vec4(position, 1.0);

    // Calculate screen-space direction from segment start to end
    // direction vector goes from this vertex's pair's start to end
    vec4 dirEndClip = viewProjection * finalWorld * vec4(position + direction, 1.0);

    // Calculate line direction in screen space (after perspective divide)
    vec2 vertexScreen = vertexClip.xy / vertexClip.w;
    vec2 dirEndScreen = dirEndClip.xy / dirEndClip.w;
    vec2 screenDir = normalize(dirEndScreen - vertexScreen);

    // Perpendicular in screen space (rotate 90 degrees)
    vec2 perpendicular = vec2(-screenDir.y, screenDir.x);

    // Calculate offset in screen space
    // Half-width because we offset in both directions
    vec2 offset = perpendicular * width * 0.5 * side;

    // Apply screen-space sizing with perspective tapering
    // NOTE: Removed * vertexClip.w to enable perspective tapering
    // GPU will apply perspective divide (/= w), making distant lines smaller
    // Divide by resolution to convert from pixels to NDC (-1 to +1)
    offset /= resolution;

    // Apply offset in clip space
    gl_Position = vertexClip;
    gl_Position.xy += offset;

    // Pass to fragment shader
    vUV = uv;
    vDistance = distance;
}
`;

        // Fragment Shader: Pattern rendering
        Effect.ShadersStore.customLineFragmentShader = `
precision highp float;

// Varyings
varying vec2 vUV;
varying float vDistance;

// Uniforms
uniform vec3 color;
uniform float opacity;
uniform float pattern;        // 0=solid, 1=dash, 2=dot, etc.
uniform float dashLength;
uniform float gapLength;

void main() {
    // Apply patterns based on distance along line
    if (pattern == 1.0) {
        // Dash pattern
        float cycle = dashLength + gapLength;
        float phase = mod(vDistance, cycle);
        if (phase > dashLength) {
            discard;
        }
    } else if (pattern == 2.0) {
        // Dot pattern
        float dotCycle = gapLength;
        float dotPhase = mod(vDistance, dotCycle);
        if (dotPhase > 0.1) { // Small dot size
            discard;
        }
    }
    // pattern == 0.0 or other values: solid (no discard)

    gl_FragColor = vec4(color, opacity);
}
`;

        this.shadersRegistered = true;
    }

    /**
     * Register the shared resolution update callback
     * This callback updates ALL line materials at once, instead of having one callback per material.
     * This dramatically improves performance when rendering many edges.
     */
    private static registerResolutionCallback(scene: Scene): void {
        // If already registered on this scene, skip
        if (this.registeredScene === scene) {
            return;
        }

        // Track which scene we're registered on
        this.registeredScene = scene;

        const engine = scene.getEngine();

        scene.onBeforeRenderObservable.add(() => {
            // Query resolution once per frame
            const renderWidth = engine.getRenderWidth();
            const renderHeight = engine.getRenderHeight();
            const resolution = new Vector2(renderWidth, renderHeight);

            // Update all active materials in one batch
            for (const material of this.activeMaterials) {
                try {
                    material.setVector2("resolution", resolution);
                } catch {
                    // Material was disposed, remove from set
                    this.activeMaterials.delete(material);
                }
            }
        });
    }

    /**
     * Generate line geometry from path points
     *
     * Creates a quad strip mesh:
     * - Each segment has 2 vertices on each side (4 total)
     * - Vertices share positions but have different 'side' attributes
     * - Shader expands vertices perpendicular to line direction
     *
     * @param points Path points (minimum 2)
     * @returns Line geometry ready for mesh creation
     */
    static createLineGeometry(points: Vector3[]): LineGeometry {
        if (points.length < 2) {
            throw new Error("Line requires at least 2 points");
        }

        const positions: number[] = [];
        const directions: number[] = [];
        const sides: number[] = [];
        const distances: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        let cumulativeDistance = 0;

        // Generate quad strip
        // For n points, we create n-1 segments
        // Each segment needs 4 vertices (2 at start, 2 at end)
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];

            // Calculate segment direction (FULL vector, not normalized)
            const direction = p1.subtract(p0);
            const segmentLength = direction.length();

            // Add start vertices (at p0)
            this.addVertexPair(
                positions, directions, sides, distances, uvs, p0, direction, cumulativeDistance,
            );

            // Add end vertices (at p1)
            cumulativeDistance += segmentLength;
            this.addVertexPair(
                positions, directions, sides, distances, uvs, p1, direction, cumulativeDistance,
            );

            // Add indices for two triangles forming a quad
            const baseIndex = i * 4; // 4 vertices per segment
            indices.push(
                baseIndex,
                baseIndex + 1,
                baseIndex + 2, // First triangle
                baseIndex + 1,
                baseIndex + 3,
                baseIndex + 2, // Second triangle
            );
        }

        return {
            positions,
            directions,
            sides,
            distances,
            uvs,
            indices,
        };
    }

    /**
     * Add a pair of vertices (left and right of center line)
     *
     * Vertices are positioned along the segment at the specified position
     * Direction vector is used by shader to calculate screen-space perpendicular
     * Shader will offset them perpendicular based on 'side' attribute
     */
    private static addVertexPair(
        positions: number[],
        directions: number[],
        sides: number[],
        distances: number[],
        uvs: number[],
        actualPosition: Vector3, // Actual 3D position (start or end)
        direction: Vector3,
        distance: number,
    ): void {
        // Left vertex (side = -1)
        positions.push(actualPosition.x, actualPosition.y, actualPosition.z);
        directions.push(direction.x, direction.y, direction.z);
        sides.push(-1.0);
        distances.push(distance);
        uvs.push(0, 0);

        // Right vertex (side = +1)
        positions.push(actualPosition.x, actualPosition.y, actualPosition.z);
        directions.push(direction.x, direction.y, direction.z);
        sides.push(1.0);
        distances.push(distance);
        uvs.push(1, 0);
    }

    /**
     * Create a custom line mesh
     *
     * @param options Line configuration
     * @param scene Babylon.js scene
     * @returns Mesh with custom line shader
     */
    static create(
        options: CustomLineOptions,
        scene: Scene,
    ): Mesh {
        this.registerShaders();

        // Generate geometry
        const geometry = this.createLineGeometry(options.points);

        // Create mesh
        const mesh = new Mesh("custom-line", scene);

        // Set standard vertex data (positions, indices)
        const vertexData = new VertexData();
        vertexData.positions = geometry.positions;
        vertexData.indices = geometry.indices;
        vertexData.uvs = geometry.uvs;
        vertexData.applyToMesh(mesh);

        // Set custom attributes using numeric indices
        // These map to the attribute locations in the shader
        mesh.setVerticesData("direction", geometry.directions, false, 3);
        mesh.setVerticesData("side", geometry.sides, false, 1);
        mesh.setVerticesData("distance", geometry.distances, false, 1);

        // Create shader material
        const shaderMaterial = new ShaderMaterial(
            "customLineMaterial",
            scene,
            {
                vertex: "customLine",
                fragment: "customLine",
            },
            {
                attributes: ["position", "direction", "side", "distance", "uv"],
                uniforms: [
                    "world",
                    "viewProjection",
                    "projection",
                    "resolution",
                    "width",
                    "color",
                    "opacity",
                    "pattern",
                    "dashLength",
                    "gapLength",
                ],
                defines: ["#define INSTANCES"], // Enable instancing support
            },
        );

        // Set color uniform
        const colorObj = Color3.FromHexString(options.color);
        shaderMaterial.setVector3("color", new Vector3(colorObj.r, colorObj.g, colorObj.b));

        // Set width uniform (in pixels)
        shaderMaterial.setFloat("width", options.width);

        // Set opacity
        shaderMaterial.setFloat("opacity", options.opacity ?? 1.0);

        // Pattern uniforms
        const patternMap: Record<string, number> = {
            solid: 0,
            dash: 1,
            dot: 2,
        };
        shaderMaterial.setFloat("pattern", patternMap[options.pattern ?? "solid"] ?? 0);
        shaderMaterial.setFloat("dashLength", options.dashLength ?? 3.0);
        shaderMaterial.setFloat("gapLength", options.gapLength ?? 2.0);

        // Register material for shared resolution updates
        this.activeMaterials.add(shaderMaterial);
        this.registerResolutionCallback(scene);

        // Disable backface culling for double-sided rendering
        shaderMaterial.backFaceCulling = false;

        mesh.material = shaderMaterial;

        return mesh;
    }

    /**
     * Create a straight line between two points (optimized common case)
     *
     * This is the most common use case for edges in graphs
     */
    static createStraightLine(
        src: Vector3,
        dst: Vector3,
        width: number,
        color: string,
        scene: Scene,
        opacity?: number,
    ): Mesh {
        return this.create(
            {
                points: [src, dst],
                width,
                color,
                opacity,
            },
            scene,
        );
    }

    /**
     * Create triangular arrow geometry (normal or inverted)
     *
     * Returns LineGeometry that can be fed into the same shader as lines.
     * This ensures perfect alignment between arrows and lines.
     *
     * @param length Length of the arrow from tip to base
     * @param width Width of the arrow at the base
     * @param inverted If true, arrow points backward (inverted triangle)
     * @returns LineGeometry for use with CustomLineRenderer shader
     */
    static createTriangularArrowGeometry(
        length: number,
        width: number,
        inverted: boolean,
    ): LineGeometry {
        const tip = inverted ? -length : length;
        const base = inverted ? 0 : 0;

        const points = [
            new Vector3(0, 0, tip), // Tip
            new Vector3(-width / 2, 0, base), // Left corner
            new Vector3(width / 2, 0, base), // Right corner
            new Vector3(0, 0, tip), // Close triangle
        ];

        // Use SAME createLineGeometry as lines!
        // This ensures arrow uses identical shader
        return this.createLineGeometry(points);
    }

    /**
     * Create diamond arrow geometry
     *
     * Generates a diamond (rhombus) shape for arrow heads.
     *
     * @param length Length of the diamond (front tip to back tip)
     * @param width Width of the diamond at the widest point
     * @returns LineGeometry for use with CustomLineRenderer shader
     */
    static createDiamondArrowGeometry(length: number, width: number): LineGeometry {
        // Arrow points in +X direction to match filled arrow orientation
        const points = [
            new Vector3(0, 0, 0), // Front tip at origin
            new Vector3(-length, -width / 2, 0), // Left
            new Vector3(-2 * length, 0, 0), // Back tip
            new Vector3(-length, width / 2, 0), // Right
            new Vector3(0, 0, 0), // Close diamond
        ];

        return this.createLineGeometry(points);
    }

    /**
     * Create box arrow geometry
     *
     * Generates a rectangular box shape for arrow heads.
     *
     * @param length Length of the box
     * @param width Width of the box
     * @returns LineGeometry for use with CustomLineRenderer shader
     */
    static createBoxArrowGeometry(length: number, width: number): LineGeometry {
        const halfLength = length / 2;
        const halfWidth = width / 2;

        const points = [
            new Vector3(-halfWidth, 0, halfLength), // Top-left
            new Vector3(halfWidth, 0, halfLength), // Top-right
            new Vector3(halfWidth, 0, -halfLength), // Bottom-right
            new Vector3(-halfWidth, 0, -halfLength), // Bottom-left
            new Vector3(-halfWidth, 0, halfLength), // Close box
        ];

        return this.createLineGeometry(points);
    }

    /**
     * Create tee arrow geometry (perpendicular line)
     *
     * Generates a simple perpendicular line for tee-style arrow heads.
     *
     * @param width Width of the perpendicular line
     * @returns LineGeometry for use with CustomLineRenderer shader
     */
    static createTeeArrowGeometry(width: number): LineGeometry {
        // Perpendicular line in XY plane (perpendicular to +X direction)
        // Arrow points in +X, so tee is along Y axis
        const points = [
            new Vector3(0, -width / 2, 0), // Bottom endpoint
            new Vector3(0, width / 2, 0), // Top endpoint
        ];

        return this.createLineGeometry(points);
    }

    /**
     * Create vee arrow geometry (V-shaped arrow)
     *
     * Generates a V-shaped arrow pointing forward.
     *
     * @param length Length of each arm of the V
     * @param width Width between the arms at the base
     * @returns LineGeometry for use with CustomLineRenderer shader
     */
    static createVeeArrowGeometry(length: number, width: number): LineGeometry {
        // Use 60-degree angle to calculate proper vee width
        const angle = (60 * Math.PI) / 180; // ARROW_VEE_ANGLE = 60 degrees
        const veeWidth = Math.tan(angle) * length;

        // Arrow in XY plane with tip at origin, pointing in +X direction
        // (arms extend backward in -X direction)
        const points = [
            new Vector3(-length, -veeWidth / 2, 0), // Left arm base
            new Vector3(0, 0, 0), // Tip at origin
            new Vector3(-length, veeWidth / 2, 0), // Right arm base
        ];

        return this.createLineGeometry(points);
    }

    /**
     * Create open arrow geometry (V-shaped, similar to vee)
     *
     * Generates a V-shaped arrow, alias for vee arrow.
     *
     * @param length Length of each arm of the V
     * @param width Width between the arms at the base
     * @returns LineGeometry for use with CustomLineRenderer shader
     */
    static createOpenArrowGeometry(length: number, width: number): LineGeometry {
        // Open arrow is the same as vee arrow
        return this.createVeeArrowGeometry(length, width);
    }

    /**
     * Create half-open arrow geometry (one-sided V)
     *
     * Generates a half V-shaped arrow with only one arm.
     *
     * @param length Length of the arm
     * @param width Width offset of the arm
     * @returns LineGeometry for use with CustomLineRenderer shader
     */
    static createHalfOpenArrowGeometry(length: number, width: number): LineGeometry {
        // ARROW_HALF_OPEN_RATIO = 0.5 (one arm is half length)
        const ratio = 0.5;

        // Arrow in XY plane with tip at origin, pointing in +X direction
        // (arms extend backward in -X direction)
        const points = [
            new Vector3(-length, -width / 2, 0), // Left arm (full length)
            new Vector3(0, 0, 0), // Tip at origin
            new Vector3(-length * ratio, width / 2, 0), // Right arm (half length)
        ];

        return this.createLineGeometry(points);
    }

    /**
     * Create crow arrow geometry (multi-line arrow)
     *
     * Generates a crow-foot style arrow with three lines.
     *
     * @param length Length of the lines
     * @param width Width between the outer lines
     * @returns LineGeometry for use with CustomLineRenderer shader
     */
    static createCrowArrowGeometry(length: number, width: number): LineGeometry {
        // Use 30-degree angle to calculate proper crow spread
        const angle = (30 * Math.PI) / 180; // ARROW_CROW_FORK_ANGLE = 30 degrees
        const spread = Math.tan(angle) * length;

        // Arrow in XY plane with tip at origin, pointing in +X direction
        // Three-pronged crow's foot (all prongs meet at origin, extend in -X)
        const points = [
            // Left prong (bottom)
            new Vector3(-length, -spread, 0),
            new Vector3(0, 0, 0),
            // Center prong
            new Vector3(-length, 0, 0),
            new Vector3(0, 0, 0),
            // Right prong (top)
            new Vector3(-length, spread, 0),
            new Vector3(0, 0, 0),
        ];

        return this.createLineGeometry(points);
    }

    /**
     * Create open normal arrow geometry (hollow triangle)
     *
     * Generates a triangular outline for open-normal-style arrow heads.
     * Note: This creates the same path as triangular arrow but without closing,
     * so it renders as an outline when used with thin line width.
     *
     * @param length Length of the arrow from tip to base
     * @param width Width of the arrow at the base
     * @returns LineGeometry for use with CustomLineRenderer shader
     */
    static createOpenNormalArrowGeometry(length: number, width: number): LineGeometry {
        // Arrow in XY plane with tip at origin, pointing in +X direction
        // Triangle outline (tip at origin, base in -X)
        const points = [
            new Vector3(0, 0, 0), // Tip at origin
            new Vector3(-length, -width / 2, 0), // Left corner (bottom)
            new Vector3(-length, width / 2, 0), // Right corner (top)
            new Vector3(0, 0, 0), // Back to tip to close outline
        ];

        return this.createLineGeometry(points);
    }

    /**
     * Create open-diamond arrow geometry (hollow diamond)
     *
     * Generates a diamond outline for open-diamond-style arrow heads.
     *
     * @param length Length of the diamond (front tip to back tip)
     * @param width Width of the diamond at the widest point
     * @returns LineGeometry for use with CustomLineRenderer shader
     */
    static createOpenDiamondArrowGeometry(length: number, width: number): LineGeometry {
        // Same as diamond geometry - the outline effect comes from thin line width
        return this.createDiamondArrowGeometry(length, width);
    }

    /**
     * Create mesh from LineGeometry
     *
     * This is used for both lines and arrows - they use the SAME shader!
     * Guarantees perfect alignment between lines and arrow heads.
     *
     * @param geometry LineGeometry from createLineGeometry() or arrow generators
     * @param options Styling options (width, color, opacity)
     * @param scene Babylon.js scene
     * @returns Mesh with CustomLineRenderer shader material
     */
    static createFromGeometry(
        geometry: LineGeometry,
        options: {width: number, color: string, opacity?: number},
        scene: Scene,
    ): Mesh {
        this.registerShaders();

        const mesh = new Mesh("custom-line-geometry", scene);

        // Set vertex data
        const vertexData = new VertexData();
        vertexData.positions = geometry.positions;
        vertexData.indices = geometry.indices;
        vertexData.uvs = geometry.uvs;
        vertexData.applyToMesh(mesh);

        // Set custom attributes
        mesh.setVerticesData("direction", geometry.directions, false, 3);
        mesh.setVerticesData("side", geometry.sides, false, 1);
        mesh.setVerticesData("distance", geometry.distances, false, 1);

        // Create shader material (SAME shader used for lines!)
        const shaderMaterial = new ShaderMaterial(
            "customLineMaterial",
            scene,
            {
                vertex: "customLine",
                fragment: "customLine",
            },
            {
                attributes: ["position", "direction", "side", "distance", "uv"],
                uniforms: [
                    "world",
                    "viewProjection",
                    "projection",
                    "resolution",
                    "width",
                    "color",
                    "opacity",
                    "pattern",
                    "dashLength",
                    "gapLength",
                ],
                defines: ["#define INSTANCES"], // Enable instancing
            },
        );

        // Set uniforms
        const colorObj = Color3.FromHexString(options.color);
        console.log("CustomLineRenderer.createFromGeometry: Setting uniforms:", {
            color: options.color,
            width: options.width,
            opacity: options.opacity ?? 1.0,
        });
        shaderMaterial.setVector3("color", new Vector3(colorObj.r, colorObj.g, colorObj.b));
        shaderMaterial.setFloat("width", options.width);
        shaderMaterial.setFloat("opacity", options.opacity ?? 1.0);

        // Pattern uniforms (arrows are always solid)
        shaderMaterial.setFloat("pattern", 0); // 0 = solid
        shaderMaterial.setFloat("dashLength", 3.0); // Default (unused for solid)
        shaderMaterial.setFloat("gapLength", 2.0); // Default (unused for solid)
        console.log("CustomLineRenderer.createFromGeometry: All uniforms set");

        // Register material for shared resolution updates
        this.activeMaterials.add(shaderMaterial);
        this.registerResolutionCallback(scene);

        shaderMaterial.backFaceCulling = false;
        mesh.material = shaderMaterial;

        return mesh;
    }
}
