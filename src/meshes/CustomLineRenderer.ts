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

import {EDGE_CONSTANTS} from "../constants/meshConstants";

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
        // FIXED: Uses segmentStart/segmentEnd for consistent perpendicular calculation
        Effect.ShadersStore.customLineVertexShader = `
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

    // Transform vertex to clip space using finalWorld
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
    // When a line segment appears very small in screen space (< 0.001 NDC units),
    // normalizing the direction vector causes garbage values
    vec2 perpendicular;
    if (screenDirLength < 0.001) {
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

    // Calculate world-space line width for circular dot patterns
    // The line width in pixels (width) corresponds to a certain world-space distance
    // This depends on the depth (distance from camera) due to perspective
    // Scale factor empirically tuned to match typical viewing distances
    float avgResolution = (resolution.x + resolution.y) * 0.5;
    float scaleFactor = 0.01; // Empirically tuned for typical camera distances
    vWorldSpaceLineWidth = (width / avgResolution) * vertexClip.w * scaleFactor;

    // Pass to fragment shader
    vUV = uv;
    vDistance = distance;
}
`;

        // Fragment Shader: Pattern rendering
        // Updated to support 7 pattern types:
        // 0=solid, 1=dash, 2=dash-dot, 3=equal-dash, 4=sinewave, 5=zigzag, 6=dots
        Effect.ShadersStore.customLineFragmentShader = `
precision highp float;

// Varyings
varying vec2 vUV;
varying float vDistance;
varying float vWorldSpaceLineWidth;  // World-space line width for circular dots

// Uniforms
uniform vec3 color;
uniform float opacity;
uniform float pattern;        // 0-6 for different patterns
uniform float dashLength;
uniform float gapLength;
uniform float lineWidth;      // Width of the line for circular dots

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
        // Dash-dot pattern (dash, gap, dot, gap)
        float cycle = dashLength + gapLength + 0.1 + gapLength;
        float phase = mod(vDistance, cycle);

        if (phase < dashLength) {
            // In dash - keep pixel
        } else if (phase < dashLength + gapLength) {
            discard; // First gap
        } else if (phase < dashLength + gapLength + 0.1) {
            // In dot - keep pixel
        } else {
            discard; // Second gap
        }
    } else if (pattern == 3.0) {
        // Equal-dash pattern (dash and gap have same length)
        float cycle = dashLength * 2.0;
        float phase = mod(vDistance, cycle);
        if (phase > dashLength) {
            discard;
        }
    } else if (pattern == 6.0) {
        // Dot pattern - circular dots using distance field
        // Strategy: Make dots relative to line width to maintain visibility

        // Dot size as fraction of line width
        float dotSizeFraction = 0.45; // Dot radius = 45% of line radius (90% diameter)
        float dotRadius_world = vWorldSpaceLineWidth * dotSizeFraction;
        float dotDiameter = dotRadius_world * 2.0;

        // Spacing: dots spaced at regular intervals (in line-width units)
        float spacingMultiplier = 2.0; // Gap between dots in line-width units
        float gapSize = vWorldSpaceLineWidth * spacingMultiplier;
        float cycle = dotDiameter + gapSize;

        float phase = mod(vDistance, cycle);

        // First check: skip gaps
        if (phase > dotDiameter) {
            discard;
        }

        // Create circular dots using distance field
        // Center of dot in this cycle
        float dotCenterInCycle = dotRadius_world;

        // Distance from center along the line (in world units)
        float distAlongLine = abs(phase - dotCenterInCycle);

        // Distance from center across the line (in UV space: 0 to 1)
        // vUV.y ranges from 0 to 1, center is at 0.5
        float distAcrossLine_UV = abs(vUV.y - 0.5); // 0 to 0.5 in UV space

        // Convert UV-space distance to world-space using line width
        float distAcrossLine_world = distAcrossLine_UV * vWorldSpaceLineWidth;

        // Now both distances are in world units - create circular distance field
        float normalizedAlongLine = distAlongLine / dotRadius_world;
        float normalizedAcrossLine = distAcrossLine_world / dotRadius_world;

        // Create circular distance field
        vec2 normalizedDist = vec2(normalizedAlongLine, normalizedAcrossLine);
        float circularDist = length(normalizedDist);

        // Discard if outside the circular dot
        if (circularDist > 1.0) {
            discard;
        }
    }
    // Patterns 4 and 5 (sinewave, zigzag) use geometry modification, not shader discard
    // pattern == 0.0 or other values: solid (no discard)

    gl_FragColor = vec4(color, opacity);
}
`;

        // Point Sprite Vertex Shader for circular dots
        Effect.ShadersStore.circularDotVertexShader = `
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

        // Point Sprite Fragment Shader with perfect circles
        Effect.ShadersStore.circularDotFragmentShader = `
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

        // Generate base points (may be modified for geometric patterns)
        let {points} = options;

        // Apply geometric patterns by modifying points
        if (options.pattern === "sinewave") {
            points = this.createSinewaveGeometry(
                points,
                options.width * 0.5, // amplitude
                2.0, // frequency
            );
        } else if (options.pattern === "zigzag") {
            points = this.createZigzagGeometry(
                points,
                options.width * 0.5, // amplitude
                3.0, // frequency
            );
        }

        // Generate geometry from points
        const geometry = this.createLineGeometry(points);

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
        // Map pattern names to shader pattern codes
        const patternMap: Record<string, number> = {
            "solid": 0,
            "dash": 1,
            "dash-dot": 2,
            "equal-dash": 3,
            "sinewave": 4,
            "zigzag": 5,
            "dot": 6,
            "dots": 6, // Alias for dot
        };
        const patternValue = patternMap[options.pattern ?? "solid"] ?? 0;
        shaderMaterial.setFloat("pattern", patternValue);

        // Apply pattern-specific defaults
        const pattern = options.pattern ?? "solid";
        let {dashLength} = options;
        let {gapLength} = options;

        if (pattern === "dash" && !options.dashLength && !options.gapLength) {
            // Use dash-specific constants for short dashes
            dashLength = EDGE_CONSTANTS.DASH_LENGTH_MULTIPLIER;
            gapLength = EDGE_CONSTANTS.DASH_GAP_MULTIPLIER;
        }

        const finalDashLength = dashLength ?? 3.0;
        const finalGapLength = gapLength ?? 2.0;
        const finalLineWidth = options.width;

        shaderMaterial.setFloat("dashLength", finalDashLength);
        shaderMaterial.setFloat("gapLength", finalGapLength);
        shaderMaterial.setFloat("lineWidth", finalLineWidth);

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
    static createVeeArrowGeometry(length: number): LineGeometry {
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
     * @param _width Width between the arms at the base (unused - maintained for API compatibility)
     * @returns LineGeometry for use with CustomLineRenderer shader
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static createOpenArrowGeometry(length: number, _width: number): LineGeometry {
        // Open arrow is the same as vee arrow
        return this.createVeeArrowGeometry(length);
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
    static createCrowArrowGeometry(length: number): LineGeometry {
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
                    "pattern",
                    "dashLength",
                    "gapLength",
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
