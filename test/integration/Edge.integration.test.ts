/**
 * Edge Integration Tests
 *
 * Tests the complete edge creation workflow including line, arrows,
 * positioning, and transformation. Uses NullEngine for headless rendering.
 */

import {
    AbstractMesh,
    Mesh,
    NullEngine,
    Scene,
    Vector3,
} from "@babylonjs/core";
import {assert, beforeEach, describe, test, vi} from "vitest";

import type {EdgeStyleConfig} from "../../src/config";
import type {PatternedLineMesh} from "../../src/meshes/PatternedLineMesh";
import {asData} from "../helpers/testSetup";

/**
 * Helper to check if a mesh is disposed, handling both AbstractMesh (method) and PatternedLineMesh (property)
 */
function isDisposed(mesh: AbstractMesh | PatternedLineMesh): boolean {
    if ("isDisposed" in mesh) {
        if (typeof mesh.isDisposed === "function") {
            return mesh.isDisposed();
        }

        return mesh.isDisposed;
    }

    return false;
}
import {Edge} from "../../src/Edge";
import {DataManager} from "../../src/managers/DataManager";
import {EventManager} from "../../src/managers/EventManager";
import type {GraphContext} from "../../src/managers/GraphContext";
import {LayoutManager} from "../../src/managers/LayoutManager";
import {StatsManager} from "../../src/managers/StatsManager";
import {StyleManager} from "../../src/managers/StyleManager";
import {EdgeMesh} from "../../src/meshes/EdgeMesh";
import {MeshCache} from "../../src/meshes/MeshCache";
import {Node} from "../../src/Node";
import {EdgeStyleId, Styles} from "../../src/Styles";

/**
 * Create a minimal GraphContext mock for testing Edge creation
 */
function createMockGraphContext(
    scene: Scene,
    meshCache: MeshCache,
    styles: Styles,
    nodes: Map<string | number, Node>,
): GraphContext {
    const eventManager = new EventManager();
    const statsManager = new StatsManager(eventManager);
    const styleManager = new StyleManager(eventManager, styles);
    const dataManager = new DataManager(eventManager, styles);

    // Populate node cache with test nodes
    for (const [id, node] of nodes) {
        dataManager.nodeCache.set(id, node);
    }

    const layoutManager = new LayoutManager(eventManager, dataManager, styles);

    return {
        getStyleManager: () => styleManager,
        getDataManager: () => dataManager,
        getLayoutManager: () => layoutManager,
        getMeshCache: () => meshCache,
        getScene: () => scene,
        getStatsManager: () => statsManager,
        is2D: () => false,
        needsRayUpdate: () => true,
        getConfig: () => ({}),
        isRunning: () => false,
        setRunning: vi.fn(),
    };
}

/**
 * Create a minimal Styles object for testing
 */
function createMinimalStyles(): Styles {
    return new Styles({
        graphtyTemplate: true,
        majorVersion: "1",
        layers: [],
        graph: {
            addDefaultStyle: true,
            background: {
                backgroundType: "color",
                color: "#000000",
            },
            startingCameraDistance: 100,
            layout: "none",
            twoD: false,
        },
        behavior: {
            layout: {
                type: "none",
                preSteps: 0,
                stepMultiplier: 1,
                minDelta: 0.001,
                zoomStepInterval: 100,
            },
            node: {
                pinOnDrag: false,
            },
        },
        data: {
            knownFields: {
                nodeIdPath: "id",
                nodeWeightPath: null,
                nodeTimePath: null,
                edgeSrcIdPath: "source",
                edgeDstIdPath: "target",
                edgeWeightPath: null,
                edgeTimePath: null,
            },
        },
    });
}

/**
 * Create a mock Node for testing Edge creation
 */
function createMockNode(
    scene: Scene,
    id: string,
    position: Vector3,
): Node {
    // Create a minimal node mesh - use Mesh since AbstractMesh is abstract
    const mesh = new Mesh(`node-${id}`, scene);
    mesh.position = position.clone();
    // Set bounding info for ray intersection calculations
    mesh.getBoundingInfo().boundingSphere.radiusWorld = 0.5;

    // Create a minimal Node-like object (we can't use the real Node constructor
    // because it requires a full GraphContext, but we just need the mesh and id)
    const mockNode = {
        id,
        mesh,
        data: {id},
    } as unknown as Node;

    return mockNode;
}

/**
 * Get or create a style ID for the given edge style config
 */
function getStyleId(config: EdgeStyleConfig): EdgeStyleId {
    return Styles.getEdgeIdForStyle(config);
}

describe("Edge Integration", () => {
    let engine: NullEngine;
    let scene: Scene;
    let meshCache: MeshCache;
    let styles: Styles;

    // Pre-defined style configurations
    let defaultStyleId: EdgeStyleId;
    let arrowHeadStyleId: EdgeStyleId;
    let arrowTailStyleId: EdgeStyleId;
    let bidirectionalStyleId: EdgeStyleId;
    let initialStyleId: EdgeStyleId;
    let updatedStyleId: EdgeStyleId;
    let styleAId: EdgeStyleId;
    let styleBId: EdgeStyleId;

    beforeEach(() => {
        engine = new NullEngine();
        scene = new Scene(engine);
        meshCache = new MeshCache();
        styles = createMinimalStyles();

        // Create style IDs using the proper API
        defaultStyleId = getStyleId({
            line: {width: 0.5, color: "#A9A9A9"},
            enabled: true,
        });

        arrowHeadStyleId = getStyleId({
            line: {width: 0.5, color: "#FF0000"},
            arrowHead: {type: "normal", size: 1, color: "#FF0000", opacity: 1},
            enabled: true,
        });

        arrowTailStyleId = getStyleId({
            line: {width: 0.5, color: "#00FF00"},
            arrowTail: {type: "tee", size: 1, color: "#00FF00", opacity: 1},
            enabled: true,
        });

        bidirectionalStyleId = getStyleId({
            line: {width: 0.5, color: "#0000FF"},
            arrowHead: {type: "normal", size: 1, color: "#FF0000", opacity: 1},
            arrowTail: {type: "inverted", size: 1, color: "#00FF00", opacity: 1},
            enabled: true,
        });

        initialStyleId = getStyleId({
            line: {width: 0.5, color: "#FF0000"},
            enabled: true,
        });

        updatedStyleId = getStyleId({
            line: {width: 1.0, color: "#00FF00"},
            arrowHead: {type: "diamond", size: 1.5, color: "#00FF00", opacity: 1},
            enabled: true,
        });

        styleAId = getStyleId({
            line: {width: 0.5, color: "#FF0000"},
            arrowHead: {type: "normal", size: 1, color: "#FF0000", opacity: 1},
            enabled: true,
        });

        styleBId = getStyleId({
            line: {width: 1.0, color: "#0000FF"},
            arrowHead: {type: "box", size: 1, color: "#0000FF", opacity: 1},
            enabled: true,
        });
    });

    describe("Complete Edge Creation", () => {
        test("creates edge with line mesh", () => {
            const srcNode = createMockNode(scene, "src", new Vector3(0, 0, 0));
            const dstNode = createMockNode(scene, "dst", new Vector3(5, 0, 0));

            const nodes = new Map<string | number, Node>();
            nodes.set("src", srcNode);
            nodes.set("dst", dstNode);

            const context = createMockGraphContext(scene, meshCache, styles, nodes);

            const edge = new Edge(context, "src", "dst", defaultStyleId, asData({}));

            assert.exists(edge.mesh);
            assert.isFalse(isDisposed(edge.mesh));
            assert.equal(edge.srcId, "src");
            assert.equal(edge.dstId, "dst");
            assert.equal(edge.id, "src:dst");
        });

        test("creates edge with arrowHead when configured", () => {
            const srcNode = createMockNode(scene, "src", new Vector3(0, 0, 0));
            const dstNode = createMockNode(scene, "dst", new Vector3(5, 0, 0));

            const nodes = new Map<string | number, Node>();
            nodes.set("src", srcNode);
            nodes.set("dst", dstNode);

            const context = createMockGraphContext(scene, meshCache, styles, nodes);
            const edge = new Edge(context, "src", "dst", arrowHeadStyleId, asData({}));

            assert.exists(edge.mesh);
            assert.exists(edge.arrowMesh);
            assert.isFalse(isDisposed(edge.arrowMesh));
        });

        test("creates edge with arrowTail when configured", () => {
            const srcNode = createMockNode(scene, "src", new Vector3(0, 0, 0));
            const dstNode = createMockNode(scene, "dst", new Vector3(5, 0, 0));

            const nodes = new Map<string | number, Node>();
            nodes.set("src", srcNode);
            nodes.set("dst", dstNode);

            const context = createMockGraphContext(scene, meshCache, styles, nodes);
            const edge = new Edge(context, "src", "dst", arrowTailStyleId, asData({}));

            assert.exists(edge.mesh);
            assert.exists(edge.arrowTailMesh);
            assert.isFalse(isDisposed(edge.arrowTailMesh));
        });

        test("creates edge with bidirectional arrows", () => {
            const srcNode = createMockNode(scene, "src", new Vector3(0, 0, 0));
            const dstNode = createMockNode(scene, "dst", new Vector3(5, 0, 0));

            const nodes = new Map<string | number, Node>();
            nodes.set("src", srcNode);
            nodes.set("dst", dstNode);

            const context = createMockGraphContext(scene, meshCache, styles, nodes);
            const edge = new Edge(context, "src", "dst", bidirectionalStyleId, asData({}));

            assert.exists(edge.mesh);
            assert.exists(edge.arrowMesh);
            assert.exists(edge.arrowTailMesh);
            assert.isFalse(isDisposed(edge.arrowMesh));
            assert.isFalse(isDisposed(edge.arrowTailMesh));
        });

        test("updates edge style correctly", () => {
            const srcNode = createMockNode(scene, "src", new Vector3(0, 0, 0));
            const dstNode = createMockNode(scene, "dst", new Vector3(5, 0, 0));

            const nodes = new Map<string | number, Node>();
            nodes.set("src", srcNode);
            nodes.set("dst", dstNode);

            const context = createMockGraphContext(scene, meshCache, styles, nodes);
            const edge = new Edge(context, "src", "dst", initialStyleId, asData({}));

            assert.equal(edge.styleId, initialStyleId);
            assert.isNull(edge.arrowMesh);

            // Update style
            edge.updateStyle(updatedStyleId);

            assert.equal(edge.styleId, updatedStyleId);
            assert.exists(edge.arrowMesh);
        });

        test("disposes edge resources when style changes", () => {
            const srcNode = createMockNode(scene, "src", new Vector3(0, 0, 0));
            const dstNode = createMockNode(scene, "dst", new Vector3(5, 0, 0));

            const nodes = new Map<string | number, Node>();
            nodes.set("src", srcNode);
            nodes.set("dst", dstNode);

            const context = createMockGraphContext(scene, meshCache, styles, nodes);
            const edge = new Edge(context, "src", "dst", styleAId, asData({}));

            const oldMesh = edge.mesh;
            const oldArrowMesh = edge.arrowMesh;

            // Update style triggers disposal of old meshes
            edge.updateStyle(styleBId);

            // Old meshes should be disposed
            assert.isTrue(isDisposed(oldMesh));
            assert.exists(oldArrowMesh);
            assert.isTrue(isDisposed(oldArrowMesh));

            // New meshes should exist and not be disposed
            assert.isFalse(isDisposed(edge.mesh));
            assert.exists(edge.arrowMesh);
            assert.isFalse(isDisposed(edge.arrowMesh));
        });
    });

    describe("Arrow Positioning", () => {
        test("arrow positions are calculated using getArrowGeometry", () => {
            // Test the static arrow geometry lookup
            const normalGeometry = EdgeMesh.getArrowGeometry("normal");
            assert.equal(normalGeometry.positioningMode, "tip");
            assert.equal(normalGeometry.needsRotation, false);
            assert.equal(normalGeometry.positionOffset, 0);

            const dotGeometry = EdgeMesh.getArrowGeometry("dot");
            assert.equal(dotGeometry.positioningMode, "center");
            assert.equal(dotGeometry.needsRotation, false);

            const invertedGeometry = EdgeMesh.getArrowGeometry("inverted");
            assert.equal(invertedGeometry.positioningMode, "tip");
            assert.equal(invertedGeometry.positionOffset, 1.0);
        });

        test("calculateArrowPosition handles tip-based arrows", () => {
            const surfacePoint = new Vector3(10, 0, 0);
            const direction = new Vector3(1, 0, 0);
            const arrowLength = 0.5;
            const geometry = EdgeMesh.getArrowGeometry("normal");

            const position = EdgeMesh.calculateArrowPosition(
                surfacePoint,
                direction,
                arrowLength,
                geometry,
            );

            // Tip-based arrow with offset=0: position at surface
            assert.closeTo(position.x, surfacePoint.x, 0.001);
            assert.closeTo(position.y, surfacePoint.y, 0.001);
            assert.closeTo(position.z, surfacePoint.z, 0.001);
        });

        test("calculateArrowPosition handles center-based arrows", () => {
            const surfacePoint = new Vector3(10, 0, 0);
            const direction = new Vector3(1, 0, 0);
            const arrowLength = 1.0;
            const geometry = EdgeMesh.getArrowGeometry("dot");

            const position = EdgeMesh.calculateArrowPosition(
                surfacePoint,
                direction,
                arrowLength,
                geometry,
            );

            // Center-based arrow: position center back by radius (half of length)
            const expectedX = surfacePoint.x - (arrowLength / 2);
            assert.closeTo(position.x, expectedX, 0.001);
        });

        test("calculateArrowPosition handles inverted arrows with offset", () => {
            const surfacePoint = new Vector3(10, 0, 0);
            const direction = new Vector3(1, 0, 0);
            const arrowLength = 0.5;
            const geometry = EdgeMesh.getArrowGeometry("inverted");

            const position = EdgeMesh.calculateArrowPosition(
                surfacePoint,
                direction,
                arrowLength,
                geometry,
            );

            // Inverted arrow: offset = 1.0 (full arrow length)
            const expectedX = surfacePoint.x - (arrowLength * geometry.positionOffset);
            assert.closeTo(position.x, expectedX, 0.001);
        });

        test("calculateLineEndpoint creates gap for arrows", () => {
            const surfacePoint = new Vector3(10, 0, 0);
            const direction = new Vector3(1, 0, 0);
            const arrowLength = 0.5;
            const geometry = EdgeMesh.getArrowGeometry("normal");

            const lineEndpoint = EdgeMesh.calculateLineEndpoint(
                surfacePoint,
                direction,
                arrowLength,
                geometry,
            );

            // Line should end at surface minus arrow length
            const expectedX = surfacePoint.x - arrowLength;
            assert.closeTo(lineEndpoint.x, expectedX, 0.001);
        });

        test("calculateLineEndpoint respects scaleFactor", () => {
            const surfacePoint = new Vector3(10, 0, 0);
            const direction = new Vector3(1, 0, 0);
            const arrowLength = 1.0;
            const geometry = EdgeMesh.getArrowGeometry("sphere-dot");

            const lineEndpoint = EdgeMesh.calculateLineEndpoint(
                surfacePoint,
                direction,
                arrowLength,
                geometry,
            );

            // sphere-dot has scaleFactor 0.25, so gap = arrowLength * 0.25
            const actualSize = arrowLength * (geometry.scaleFactor ?? 1.0);
            const expectedX = surfacePoint.x - actualSize;
            assert.closeTo(lineEndpoint.x, expectedX, 0.001);
        });
    });

    describe("Edge Transformation", () => {
        test("transformMesh positions line at midpoint", () => {
            const srcPoint = new Vector3(0, 0, 0);
            const dstPoint = new Vector3(10, 0, 0);

            const options = {styleId: "transform-test", width: 0.5, color: "#FF0000"};
            const style = {line: {width: 0.5, color: "#FF0000"}, enabled: true};
            const mesh = EdgeMesh.create(meshCache, options, style, scene);

            EdgeMesh.transformMesh(mesh as AbstractMesh, srcPoint, dstPoint);

            // Midpoint should be at (5, 0, 0)
            assert.closeTo(mesh.position.x, 5, 0.001);
            assert.closeTo(mesh.position.y, 0, 0.001);
            assert.closeTo(mesh.position.z, 0, 0.001);
        });

        test("transformMesh scales line to correct length", () => {
            const srcPoint = new Vector3(0, 0, 0);
            const dstPoint = new Vector3(3, 4, 0);

            const options = {styleId: "scale-test", width: 0.5, color: "#FF0000"};
            const style = {line: {width: 0.5, color: "#FF0000"}, enabled: true};
            const mesh = EdgeMesh.create(meshCache, options, style, scene);

            EdgeMesh.transformMesh(mesh as AbstractMesh, srcPoint, dstPoint);

            // Length = sqrt(3² + 4²) = 5
            assert.closeTo(mesh.scaling.z, 5, 0.001);
        });

        test("transformMesh handles 3D coordinates", () => {
            const srcPoint = new Vector3(0, 0, 0);
            const dstPoint = new Vector3(1, 2, 2);

            const options = {styleId: "3d-test", width: 0.5, color: "#FF0000"};
            const style = {line: {width: 0.5, color: "#FF0000"}, enabled: true};
            const mesh = EdgeMesh.create(meshCache, options, style, scene);

            EdgeMesh.transformMesh(mesh as AbstractMesh, srcPoint, dstPoint);

            // Midpoint should be at (0.5, 1, 1)
            assert.closeTo(mesh.position.x, 0.5, 0.001);
            assert.closeTo(mesh.position.y, 1, 0.001);
            assert.closeTo(mesh.position.z, 1, 0.001);

            // Length = sqrt(1² + 2² + 2²) = 3
            assert.closeTo(mesh.scaling.z, 3, 0.001);
        });

        test("transformMesh handles negative coordinates", () => {
            const srcPoint = new Vector3(-5, -5, -5);
            const dstPoint = new Vector3(5, 5, 5);

            const options = {styleId: "negative-test", width: 0.5, color: "#FF0000"};
            const style = {line: {width: 0.5, color: "#FF0000"}, enabled: true};
            const mesh = EdgeMesh.create(meshCache, options, style, scene);

            EdgeMesh.transformMesh(mesh as AbstractMesh, srcPoint, dstPoint);

            // Midpoint should be at origin
            assert.closeTo(mesh.position.x, 0, 0.001);
            assert.closeTo(mesh.position.y, 0, 0.001);
            assert.closeTo(mesh.position.z, 0, 0.001);

            // Length = sqrt(10² + 10² + 10²) = sqrt(300)
            assert.closeTo(mesh.scaling.z, Math.sqrt(300), 0.001);
        });

        test("transformMesh orients line correctly (lookAt)", () => {
            const srcPoint = new Vector3(0, 0, 0);
            const dstPoint = new Vector3(5, 0, 0);

            const options = {styleId: "orient-test", width: 0.5, color: "#FF0000"};
            const style = {line: {width: 0.5, color: "#FF0000"}, enabled: true};
            const mesh = EdgeMesh.create(meshCache, options, style, scene);

            EdgeMesh.transformMesh(mesh as AbstractMesh, srcPoint, dstPoint);

            // After lookAt(dstPoint), the mesh's Z scale is stretched along the edge direction
            // The scaling.z is set to the edge length, which is 5
            assert.closeTo(mesh.scaling.z, 5, 0.001);

            // Verify the position is at midpoint
            assert.closeTo(mesh.position.x, 2.5, 0.001);
            assert.closeTo(mesh.position.y, 0, 0.001);
            assert.closeTo(mesh.position.z, 0, 0.001);
        });
    });

    describe("Edge Ray Updates", () => {
        test("ray is created during edge construction", () => {
            const srcNode = createMockNode(scene, "src", new Vector3(0, 0, 0));
            const dstNode = createMockNode(scene, "dst", new Vector3(5, 0, 0));

            const nodes = new Map<string | number, Node>();
            nodes.set("src", srcNode);
            nodes.set("dst", dstNode);

            const context = createMockGraphContext(scene, meshCache, styles, nodes);
            const edge = new Edge(context, "src", "dst", defaultStyleId, asData({}));

            assert.exists(edge.ray);
            // Ray direction should point from source to destination
            assert.closeTo(edge.ray.direction.x, 5, 0.001);
            assert.closeTo(edge.ray.direction.y, 0, 0.001);
            assert.closeTo(edge.ray.direction.z, 0, 0.001);
        });
    });

    describe("Error Handling", () => {
        test("throws error when source node doesn't exist", () => {
            const dstNode = createMockNode(scene, "dst", new Vector3(5, 0, 0));

            const nodes = new Map<string | number, Node>();
            nodes.set("dst", dstNode);

            const context = createMockGraphContext(scene, meshCache, styles, nodes);

            assert.throws(
                () => new Edge(context, "src", "dst", defaultStyleId, asData({})),
                /Node 'src' hasn't been created yet/,
            );
        });

        test("throws error when destination node doesn't exist", () => {
            const srcNode = createMockNode(scene, "src", new Vector3(0, 0, 0));

            const nodes = new Map<string | number, Node>();
            nodes.set("src", srcNode);

            const context = createMockGraphContext(scene, meshCache, styles, nodes);

            assert.throws(
                () => new Edge(context, "src", "dst", defaultStyleId, asData({})),
                /Node 'dst' hasn't been created yet/,
            );
        });
    });
});
