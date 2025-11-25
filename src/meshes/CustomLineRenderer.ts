import {
    Color3,
    Effect,
    Mesh,
    MeshBuilder,
    Scene,
    ShaderMaterial,
    StandardMaterial,
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
    segmentStarts: number[]; // Segment start positions (for consistent perpendicular calculation)
    segmentEnds: number[]; // Segment end positions (for consistent perpendicular calculation)
}

export interface CustomLineOptions {
    points: Vector3[]; // Path points
    width: number; // Line width in pixels
    color: string; // Line color (hex)
    opacity?: number; // Opacity 0-1
    enableInstancing?: boolean; // Enable instancing support (required for mesh caching)
    // NOTE: Patterns are handled by PatternedLineMesh, not CustomLineRenderer
    // CustomLineRenderer only renders solid lines
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

        // CRITICAL FIX: Register shaders in BOTH shader stores
        // When running in Storybook, there are TWO instances of BabylonJS:
        // 1. The global BABYLON loaded via <script> tag
        // 2. The ES module import from @babylonjs/core
        // We need to register in both because ShaderMaterial might use either one
        const globalShaderStore = typeof window !== 'undefined' && (window as typeof globalThis & { BABYLON?: {Effect: typeof Effect} }).BABYLON?.Effect.ShadersStore;
        const moduleShaderStore = Effect.ShadersStore;

        // Vertex Shader: Screen-space width expansion
        // This matches the formula we learned from GreasedLine and dot arrowhead work
        // Updated to support instancing (required for BabylonJS mesh caching)
        // FIXED: Uses segmentStart/segmentEnd for consistent perpendicular calculation
        const vertexShaderCode = `
precision highp float;

// Attributes
attribute vec3 position;      // Actual vertex position (start or end of segment)
attribute vec3 direction;     // Segment direction vector (full length from start to end)
attribute float side;         // -1 or +1 for left/right
attribute float distance;     // Distance along line (for patterns)
attribute vec2 uv;
attribute vec3 segmentStart;  // Segment start position (for consistent perpendicular)
attribute vec3 segmentEnd;    // Segment end position (for consistent perpendicular)

// Uniforms
uniform mat4 world;
uniform mat4 viewProjection;
uniform mat4 projection;
uniform vec2 resolution;
uniform float width;

// Varyings
varying vec2 vUV;
varying float vDistance;
varying float vWorldSpaceLineWidth;  // World-space line width for circular dots

// Instance support - BabylonJS include provides finalWorld matrix
#include<instancesDeclaration>

void main() {
    // Compute finalWorld matrix (handles both instanced and non-instanced meshes)
    #include<instancesVertex>

    // Transform vertex to clip space using finalWorld (supports instancing)
    vec4 vertexClip = viewProjection * finalWorld * vec4(position, 1.0);

    // FIXED: Calculate screen-space direction using segment start/end
    // This ensures both start and end vertices use the SAME perpendicular direction
    vec4 segmentStartClip = viewProjection * finalWorld * vec4(segmentStart, 1.0);
    vec4 segmentEndClip = viewProjection * finalWorld * vec4(segmentEnd, 1.0);

    // Calculate line direction in screen space (after perspective divide)
    vec2 startScreen = segmentStartClip.xy / segmentStartClip.w;
    vec2 endScreen = segmentEndClip.xy / segmentEndClip.w;
    vec2 screenDirRaw = endScreen - startScreen;
    float screenDirLength = length(screenDirRaw);

    // Safety check: handle near-zero vectors to prevent numerical instability
    // When a line segment appears very small in screen space (< 0.000001 NDC units),
    // normalizing the direction vector causes garbage values
    // NOTE: Lowered threshold from 0.001 to 0.000001 to support bezier curves with many tiny segments
    vec2 perpendicular;
    if (screenDirLength < 0.000001) {
        // Fallback: line is degenerate in screen space, collapse to a point (zero width)
        perpendicular = vec2(0.0, 0.0);
    } else {
        vec2 screenDir = screenDirRaw / screenDirLength; // Safe normalize
        // Perpendicular in screen space (rotate 90 degrees)
        perpendicular = vec2(-screenDir.y, screenDir.x);
    }

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

    // Calculate world-space line width for patterns
    // We need to convert screen-space width (pixels) to world-space distance
    // Strategy: Calculate two points in NDC space separated by 'width' pixels,
    // then convert the distance to world-space units

    // First, convert vertexClip to NDC space
    vec2 point1NDC = vertexClip.xy / vertexClip.w;

    // Calculate offset for 'width' pixels in NDC space
    vec2 pixelOffset = perpendicular * width / resolution;

    // Add offset in NDC space (this is the correct approach)
    vec2 point2NDC = point1NDC + pixelOffset;

    // Measure screen-space distance in NDC units
    float screenSpaceDist = length(point2NDC - point1NDC);

    // Convert screen-space distance to world-space distance
    // Use the segment's world length vs screen length ratio
    vec3 worldSegmentDir = segmentEnd - segmentStart;
    float worldSegmentLength = length(worldSegmentDir);
    float screenSegmentLength = screenDirLength;

    // Calculate world units per NDC unit along the line direction
    float worldPerScreen = (screenSegmentLength > 0.001)
        ? worldSegmentLength / screenSegmentLength
        : 0.0;

    vWorldSpaceLineWidth = screenSpaceDist * worldPerScreen;

    // Pass to fragment shader
    vUV = uv;
    vDistance = distance;
}
`;
        // Register in both stores
        moduleShaderStore.customLineVertexShader = vertexShaderCode;
        if (globalShaderStore) {
            globalShaderStore.customLineVertexShader = vertexShaderCode;
        }

        // Fragment Shader: Pattern rendering
        // Updated to support 7 pattern types:
        // 0=solid, 1=dash, 2=dash-dot, 3=equal-dash, 4=sinewave, 5=zigzag, 6=dots
        const fragmentShaderCode = `
precision highp float;

// Varyings
varying vec2 vUV;
varying float vDistance;
varying float vWorldSpaceLineWidth;  // World-space line width for patterns

// Uniforms
uniform vec3 color;
uniform float opacity;

void main() {
    // NOTE: All patterns (dash, dot, sinewave, zigzag, etc.) are handled by PatternedLineMesh.
    // CustomLineRenderer only renders solid lines.

    // Simple solid line rendering
    gl_FragColor = vec4(color, opacity);
}
`;
        // Register in both stores
        moduleShaderStore.customLineFragmentShader = fragmentShaderCode;
        if (globalShaderStore) {
            globalShaderStore.customLineFragmentShader = fragmentShaderCode;
        }

        // Point Sprite Vertex Shader for circular dots
        const circularDotVertexShaderCode = `
precision highp float;

// Attributes
attribute vec3 position;

// Uniforms
uniform mat4 world;
uniform mat4 viewProjection;
uniform float pointSize;  // Size of points in pixels

void main(void) {
    vec4 worldPos = world * vec4(position, 1.0);
    gl_Position = viewProjection * worldPos;
    gl_PointSize = pointSize;
}
`;
        // Register in both stores
        moduleShaderStore.circularDotVertexShader = circularDotVertexShaderCode;
        if (globalShaderStore) {
            globalShaderStore.circularDotVertexShader = circularDotVertexShaderCode;
        }

        // Point Sprite Fragment Shader with perfect circles
        const circularDotFragmentShaderCode = `
precision highp float;

// Uniforms
uniform vec3 color;
uniform float opacity;

void main(void) {
    // gl_PointCoord gives position within point square (0,0 to 1,1)
    // Center is at (0.5, 0.5)
    vec2 coord = gl_PointCoord - vec2(0.5, 0.5);
    float dist = length(coord);

    // Discard fragments outside circle (radius 0.5)
    if (dist > 0.5) {
        discard;
    }

    // Optional: smooth edges for anti-aliasing
    float alpha = 1.0 - smoothstep(0.45, 0.5, dist);

    gl_FragColor = vec4(color, opacity * alpha);
}
`;
        // Register in both stores
        moduleShaderStore.circularDotFragmentShader = circularDotFragmentShaderCode;
        if (globalShaderStore) {
            globalShaderStore.circularDotFragmentShader = circularDotFragmentShaderCode;
        }

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
     * Calculate evenly-spaced dot positions along a line path
     *
     * @param points - Path points defining the line
     * @param dotRadius - Radius of each dot in world units
     * @returns Array of Vector3 positions where dots should be placed
     */
    private static calculateDotPositions(points: Vector3[], dotRadius: number): Vector3[] {
        if (points.length < 2) {
            return [];
        }

        const dotDiameter = dotRadius * 2;
        const spacing = dotDiameter; // Gap equals diameter for even spacing
        const cycle = dotDiameter + spacing;

        // Calculate cumulative distances along path
        const distances: number[] = [0];
        for (let i = 1; i < points.length; i++) {
            const segmentLength = Vector3.Distance(points[i - 1], points[i]);
            distances.push(distances[distances.length - 1] + segmentLength);
        }
        const totalLength = distances[distances.length - 1];

        // Calculate dot positions at regular intervals
        const dotPositions: Vector3[] = [];
        const numDots = Math.floor(totalLength / cycle);

        for (let i = 0; i < numDots; i++) {
            const targetDistance = (i * cycle) + dotRadius; // Center of each dot

            // Find which segment this distance falls on
            let segmentIndex = 0;
            for (let j = 1; j < distances.length; j++) {
                if (targetDistance <= distances[j]) {
                    segmentIndex = j - 1;
                    break;
                }
            }

            // Interpolate position within segment
            const segmentStart = distances[segmentIndex];
            const segmentEnd = distances[segmentIndex + 1];
            const segmentLength = segmentEnd - segmentStart;
            const t = (targetDistance - segmentStart) / segmentLength;

            const pos = Vector3.Lerp(points[segmentIndex], points[segmentIndex + 1], t);
            dotPositions.push(pos);
        }

        return dotPositions;
    }

    /**
     * Create circular dot meshes for dotted line pattern
     *
     * Creates small disc meshes at calculated positions along the line.
     * This approach guarantees perfect circular appearance.
     *
     * @param options Line configuration (uses points, color, opacity, width)
     * @param scene Babylon.js scene
     * @returns Parent mesh containing all dot disc meshes
     */
    private static createPointsForDots(
        options: CustomLineOptions,
        scene: Scene,
    ): Mesh {
        // console.log("createPointsForDots called with:", {
        //     points: options.points.length,
        //     width: options.width,
        //     color: options.color,
        //     pattern: options.pattern,
        // });

        // Calculate dot radius in world units
        const dotRadius = 0.1; // Fixed radius in world units for consistent appearance

        // Calculate dot positions along the path
        const dotPositions = this.calculateDotPositions(options.points, dotRadius);

        // console.log("calculateDotPositions returned:", {
        //     count: dotPositions.length,
        //     dotRadius,
        //     positions: dotPositions.map((p) => ({x: p.x, y: p.y, z: p.z})),
        // });

        // Create parent mesh to hold all dots
        const parentMesh = new Mesh("circular-dots", scene);

        if (dotPositions.length === 0) {
            return parentMesh;
        }

        // Create a shared material for all dots
        const material = new StandardMaterial("dotMaterial", scene);
        const colorObj = Color3.FromHexString(options.color);
        material.diffuseColor = colorObj;
        material.emissiveColor = colorObj; // Make dots self-illuminated
        material.alpha = options.opacity ?? 1.0;
        material.backFaceCulling = false;

        // Create a disc mesh for each dot position
        for (const position of dotPositions) {
            const disc = MeshBuilder.CreateDisc(
                "dot",
                {
                    radius: dotRadius,
                    tessellation: 16, // Enough segments for a smooth circle
                },
                scene,
            );
            disc.position = position;
            disc.material = material;
            disc.parent = parentMesh;

            // Orient disc to face camera (billboard effect)
            disc.billboardMode = Mesh.BILLBOARDMODE_ALL;
        }

        parentMesh.alwaysSelectAsActiveMesh = true;

        // console.log("createPointsForDots created parent mesh with", dotPositions.length, "disc dots");

        return parentMesh;
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
        const segmentStarts: number[] = [];
        const segmentEnds: number[] = [];

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
                positions, directions, sides, distances, uvs, segmentStarts, segmentEnds, p0, direction, cumulativeDistance, p0, p1,
            );

            // Add end vertices (at p1)
            cumulativeDistance += segmentLength;
            this.addVertexPair(
                positions, directions, sides, distances, uvs, segmentStarts, segmentEnds, p1, direction, cumulativeDistance, p0, p1,
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
            segmentStarts,
            segmentEnds,
        };
    }

    /**
     * Generate sinewave geometry along a path
     *
     * Creates a smooth wave pattern by interpolating points along the path
     * and offsetting them perpendicular to the line direction.
     *
     * @param points Path points (minimum 2)
     * @param amplitude Wave amplitude (perpendicular offset)
     * @param frequency Wave frequency (cycles per path length)
     * @returns Array of Vector3 points forming the wave
     */
    static createSinewaveGeometry(
        points: Vector3[],
        amplitude: number,
        frequency: number,
    ): Vector3[] {
        if (points.length < 2) {
            throw new Error("Sinewave requires at least 2 points");
        }

        const result: Vector3[] = [];
        const totalSegments = points.length - 1;

        for (let segIdx = 0; segIdx < totalSegments; segIdx++) {
            const p0 = points[segIdx];
            const p1 = points[segIdx + 1];
            const segmentDir = p1.subtract(p0);
            const segmentLength = segmentDir.length();
            const tangent = segmentDir.normalize();

            // Calculate perpendicular vector for wave oscillation
            // For 3D: use cross product with up vector, fallback to another axis if parallel
            let perpendicular: Vector3;
            const upVector = new Vector3(0, 1, 0);
            const crossWithUp = Vector3.Cross(tangent, upVector);

            if (crossWithUp.length() < 0.001) {
                // Tangent is parallel to up vector, use right vector instead
                const rightVector = new Vector3(1, 0, 0);
                perpendicular = Vector3.Cross(tangent, rightVector).normalize();
            } else {
                perpendicular = crossWithUp.normalize();
            }

            // Generate points along this segment with wave
            // Use 10 points per unit length for smooth curves
            const pointsPerSegment = Math.max(10, Math.ceil(segmentLength * 10));

            for (let i = 0; i <= pointsPerSegment; i++) {
                const t = i / pointsPerSegment;
                const basePoint = p0.add(segmentDir.scale(t));

                // Apply sine wave
                // waveT goes from 0 to 1 over the entire path
                const waveT = (segIdx + t) / totalSegments;
                const offset = Math.sin(waveT * frequency * Math.PI * 2) * amplitude;
                const finalPoint = basePoint.add(perpendicular.scale(offset));

                result.push(finalPoint);
            }
        }

        return result;
    }

    /**
     * Generate zigzag geometry along a path
     *
     * Creates an angular zigzag pattern by alternating perpendicular offsets.
     *
     * @param points Path points (minimum 2)
     * @param amplitude Zigzag amplitude (perpendicular offset)
     * @param frequency Zigzag frequency (number of zigs/zags)
     * @returns Array of Vector3 points forming the zigzag
     */
    static createZigzagGeometry(
        points: Vector3[],
        amplitude: number,
        frequency: number,
    ): Vector3[] {
        if (points.length < 2) {
            throw new Error("Zigzag requires at least 2 points");
        }

        const result: Vector3[] = [];
        const totalSegments = points.length - 1;

        for (let segIdx = 0; segIdx < totalSegments; segIdx++) {
            const p0 = points[segIdx];
            const p1 = points[segIdx + 1];
            const segmentDir = p1.subtract(p0);
            const tangent = segmentDir.normalize();

            // Calculate perpendicular vector for zigzag oscillation
            let perpendicular: Vector3;
            const upVector = new Vector3(0, 1, 0);
            const crossWithUp = Vector3.Cross(tangent, upVector);

            if (crossWithUp.length() < 0.001) {
                // Tangent is parallel to up vector, use right vector instead
                const rightVector = new Vector3(1, 0, 0);
                perpendicular = Vector3.Cross(tangent, rightVector).normalize();
            } else {
                perpendicular = crossWithUp.normalize();
            }

            // Generate zigzag points
            // frequency determines number of corners
            const pointsPerSegment = Math.max(4, Math.ceil(frequency * 2));

            for (let i = 0; i <= pointsPerSegment; i++) {
                const t = i / pointsPerSegment;
                const basePoint = p0.add(segmentDir.scale(t));

                // Alternate +/- for zigzag
                const offset = i % 2 === 0 ? amplitude : -amplitude;
                const finalPoint = basePoint.add(perpendicular.scale(offset));

                result.push(finalPoint);
            }
        }

        return result;
    }

    /**
     * Add a pair of vertices (left and right of center line)
     *
     * Vertices are positioned along the segment at the specified position
     * Both vertices store segment start/end to ensure consistent perpendicular calculation
     * Shader will offset them perpendicular based on 'side' attribute
     */
    private static addVertexPair(
        positions: number[],
        directions: number[],
        sides: number[],
        distances: number[],
        uvs: number[],
        segmentStarts: number[],
        segmentEnds: number[],
        actualPosition: Vector3, // Actual 3D position (start or end)
        direction: Vector3,
        distance: number,
        segmentStart: Vector3, // Segment start for consistent perpendicular
        segmentEnd: Vector3, // Segment end for consistent perpendicular
    ): void {
        // Left vertex (side = -1)
        positions.push(actualPosition.x, actualPosition.y, actualPosition.z);
        directions.push(direction.x, direction.y, direction.z);
        sides.push(-1.0);
        distances.push(distance);
        uvs.push(0, 0); // UV.y = 0 for left side
        segmentStarts.push(segmentStart.x, segmentStart.y, segmentStart.z);
        segmentEnds.push(segmentEnd.x, segmentEnd.y, segmentEnd.z);

        // Right vertex (side = +1)
        positions.push(actualPosition.x, actualPosition.y, actualPosition.z);
        directions.push(direction.x, direction.y, direction.z);
        sides.push(1.0);
        distances.push(distance);
        uvs.push(0, 1); // UV.y = 1 for right side (changed from 0)
        segmentStarts.push(segmentStart.x, segmentStart.y, segmentStart.z);
        segmentEnds.push(segmentEnd.x, segmentEnd.y, segmentEnd.z);
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

        // Generate geometry from points
        // NOTE: All patterns (dash, dot, sinewave, zigzag, etc.) are handled by PatternedLineMesh
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
        mesh.setVerticesData("segmentStart", geometry.segmentStarts, false, 3);
        mesh.setVerticesData("segmentEnd", geometry.segmentEnds, false, 3);

        // Create shader material
        // Build defines array based on instancing support
        const defines: string[] = [];
        if (options.enableInstancing) {
            defines.push("#define INSTANCES");
        }

        const shaderMaterial = new ShaderMaterial(
            "customLineMaterial",
            scene,
            {
                vertex: "customLine",
                fragment: "customLine",
            },
            {
                attributes: ["position", "direction", "side", "distance", "uv", "segmentStart", "segmentEnd"],
                uniforms: [
                    "world",
                    "viewProjection",
                    "projection",
                    "resolution",
                    "width",
                    "color",
                    "opacity",
                ],
                // Enable instancing only when requested (cached edges need it, bezier curves don't)
                defines: defines.length > 0 ? defines : undefined,
            },
        );

        // Set color uniform
        const colorObj = Color3.FromHexString(options.color);
        shaderMaterial.setVector3("color", new Vector3(colorObj.r, colorObj.g, colorObj.b));

        // Set width uniform (in pixels)
        shaderMaterial.setFloat("width", options.width);

        // Set opacity
        shaderMaterial.setFloat("opacity", options.opacity ?? 1.0);

        // NOTE: All patterns are handled by PatternedLineMesh
        // CustomLineRenderer only renders solid lines

        // Register material for shared resolution updates
        this.activeMaterials.add(shaderMaterial);
        this.registerResolutionCallback(scene);

        // Disable backface culling for double-sided rendering
        shaderMaterial.backFaceCulling = false;

        mesh.material = shaderMaterial;

        // CRITICAL: Disable frustum culling for line meshes
        // Line meshes can have incorrect bounding boxes due to screen-space expansion,
        // causing frustum culling to incorrectly hide lines that are actually on screen
        mesh.alwaysSelectAsActiveMesh = true;

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
        mesh.setVerticesData("segmentStart", geometry.segmentStarts, false, 3);
        mesh.setVerticesData("segmentEnd", geometry.segmentEnds, false, 3);

        // Create shader material (SAME shader used for lines!)
        const shaderMaterial = new ShaderMaterial(
            "customLineMaterial",
            scene,
            {
                vertex: "customLine",
                fragment: "customLine",
            },
            {
                attributes: ["position", "direction", "side", "distance", "uv", "segmentStart", "segmentEnd"],
                uniforms: [
                    "world",
                    "viewProjection",
                    "projection",
                    "resolution",
                    "width",
                    "color",
                    "opacity",
                ],
                defines: ["#define INSTANCES"], // Enable instancing
            },
        );

        // Set uniforms
        const colorObj = Color3.FromHexString(options.color);
        // console.log("CustomLineRenderer.createFromGeometry: Setting uniforms:", {
        //     color: options.color,
        //     width: options.width,
        //     opacity: options.opacity ?? 1.0,
        // });
        shaderMaterial.setVector3("color", new Vector3(colorObj.r, colorObj.g, colorObj.b));
        shaderMaterial.setFloat("width", options.width);
        shaderMaterial.setFloat("opacity", options.opacity ?? 1.0);

        // Pattern uniforms (arrows are always solid)
        shaderMaterial.setFloat("pattern", 0); // 0 = solid
        shaderMaterial.setFloat("dashLength", 3.0); // Default (unused for solid)
        shaderMaterial.setFloat("gapLength", 2.0); // Default (unused for solid)
        // console.log("CustomLineRenderer.createFromGeometry: All uniforms set");

        // Register material for shared resolution updates
        this.activeMaterials.add(shaderMaterial);
        this.registerResolutionCallback(scene);

        shaderMaterial.backFaceCulling = false;
        mesh.material = shaderMaterial;

        // CRITICAL: Disable frustum culling for line meshes
        // Line meshes can have incorrect bounding boxes due to screen-space expansion,
        // causing frustum culling to incorrectly hide lines that are actually on screen
        mesh.alwaysSelectAsActiveMesh = true;

        return mesh;
    }
}
