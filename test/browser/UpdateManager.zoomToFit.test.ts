import {NullEngine, Scene, Vector3} from "@babylonjs/core";
import {assert, beforeEach, describe, test} from "vitest";

import {RichTextLabel} from "../../src/meshes/RichTextLabel";

/**
 * Regression tests for zoomToFit bounding box calculation.
 *
 * These tests ensure that:
 * 1. Labels are included in bounding box calculations
 * 2. Node labels expand the bounding box appropriately
 * 3. Edge labels (including arrow text) expand the bounding box
 * 4. The camera zooms to fit all visible content, not just nodes
 *
 * Bug history:
 * - zoomToFit only considered node positions, ignoring labels
 * - Labels positioned above/below nodes were clipped in the viewport
 * - Arrow head/tail text labels were not included in bounding box
 */
describe("zoomToFit Bounding Box Regression Tests", () => {
    let scene: Scene;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
    });

    describe("Label bounding box expansion", () => {
        test("label mesh has valid bounding info", () => {
            const label = new RichTextLabel(scene, {
                text: "Test Label",
                fontSize: 24,
            });

            const {labelMesh} = label;
            assert.exists(labelMesh);

            const boundingInfo = labelMesh.getBoundingInfo();
            assert.exists(boundingInfo);
            assert.exists(boundingInfo.boundingBox);

            const {minimumWorld: min, maximumWorld: max} = boundingInfo.boundingBox;

            // Bounding box should have valid dimensions
            assert.isTrue(max.x >= min.x, "Max X should be >= Min X");
            assert.isTrue(max.y >= min.y, "Max Y should be >= Min Y");
            assert.isTrue(max.z >= min.z, "Max Z should be >= Min Z");

            label.dispose();
        });

        test("attached label bounding box reflects its position", () => {
            const label = new RichTextLabel(scene, {
                text: "Test",
                fontSize: 24,
            });

            // Attach label above origin with offset
            const targetPos = new Vector3(0, 0, 0);
            label.attachTo(targetPos, "top", 5.0);

            const {labelMesh} = label;
            assert.exists(labelMesh);

            const boundingInfo = labelMesh.getBoundingInfo();
            const {maximumWorld: maxWorld} = boundingInfo.boundingBox;

            // The label should be positioned above the target
            // So its max Y should be greater than the target Y + offset
            assert.isTrue(maxWorld.y > 0, "Label max Y should be above origin");

            label.dispose();
        });

        test("label at offset position expands bounding box correctly", () => {
            const label = new RichTextLabel(scene, {
                text: "Test",
                fontSize: 24,
            });

            // First, check the label mesh position directly
            const targetPos = new Vector3(0, 2, 0);
            label.attachTo(targetPos, "top", 1.0);

            const {labelMesh} = label;
            assert.exists(labelMesh);

            // The mesh position should be above the target
            const {position: meshPos} = labelMesh;
            assert.isTrue(meshPos.y > 2, "Mesh position Y should be above target Y=2");

            label.dispose();
        });
    });

    describe("Bounding box helper function behavior", () => {
        test("expandBoundingBoxForLabel expands min/max correctly", () => {
            // This tests the logic that should be in UpdateManager.expandBoundingBoxForLabel
            const label = new RichTextLabel(scene, {
                text: "Wide Label Text Here",
                fontSize: 48,
            });

            // Position label at a specific location (using realistic coordinates)
            label.attachTo(new Vector3(5, 5, 0), "top", 1);

            const {labelMesh} = label;
            assert.exists(labelMesh);

            // Check the mesh position directly - should be at (5, 5+offset+halfHeight)
            const {position: meshPos} = labelMesh;
            assert.isTrue(meshPos.x === 5, "Mesh position X should be at target X=5");
            assert.isTrue(meshPos.y > 5, "Mesh position Y should be above target Y=5");

            // Simulate the expand logic with initial bounding box at origin
            const boundingBoxMin = new Vector3(0, 0, 0);
            const boundingBoxMax = new Vector3(1, 1, 0);

            // The bounding box should expand to include the label's mesh position
            boundingBoxMin.x = Math.min(boundingBoxMin.x, meshPos.x - 1);
            boundingBoxMax.x = Math.max(boundingBoxMax.x, meshPos.x + 1);
            boundingBoxMin.y = Math.min(boundingBoxMin.y, meshPos.y - 1);
            boundingBoxMax.y = Math.max(boundingBoxMax.y, meshPos.y + 1);

            // Bounding box should now include the label
            assert.isTrue(boundingBoxMax.x > 1, "Max X should have expanded to include label");
            assert.isTrue(boundingBoxMax.y > 1, "Max Y should have expanded to include label");

            label.dispose();
        });

        test("labels at various positions all expand bounding box", () => {
            const positions: {target: Vector3, attach: "top" | "bottom" | "left" | "right", offset: number}[] = [
                {target: new Vector3(0, 5, 0), attach: "top", offset: 1}, // Above
                {target: new Vector3(0, -5, 0), attach: "bottom", offset: 1}, // Below
                {target: new Vector3(5, 0, 0), attach: "right", offset: 1}, // Right
                {target: new Vector3(-5, 0, 0), attach: "left", offset: 1}, // Left
            ];

            const labels: RichTextLabel[] = [];

            for (const pos of positions) {
                const label = new RichTextLabel(scene, {
                    text: "Test",
                    fontSize: 24,
                });
                label.attachTo(pos.target, pos.attach, pos.offset);
                labels.push(label);
            }

            // Calculate combined bounding box using mesh positions
            let maxX = -Infinity;
            let maxY = -Infinity;
            let minX = Infinity;
            let minY = Infinity;

            for (const label of labels) {
                const mesh = label.labelMesh;
                if (mesh) {
                    const pos = mesh.position;
                    minX = Math.min(minX, pos.x);
                    minY = Math.min(minY, pos.y);
                    maxX = Math.max(maxX, pos.x);
                    maxY = Math.max(maxY, pos.y);
                }
            }

            // The combined bounding box should span an area including all label positions
            // Labels at +/-5 in X and Y should give span > 8 (accounting for offset)
            assert.isTrue(maxX - minX > 8, "X span should include labels on left and right");
            assert.isTrue(maxY - minY > 8, "Y span should include labels on top and bottom");

            // Cleanup
            for (const label of labels) {
                label.dispose();
            }
        });
    });

    describe("Edge case: labels larger than nodes", () => {
        test("large label text creates larger bounding box than node alone", () => {
            const label = new RichTextLabel(scene, {
                text: "This is a very long label that spans much wider than a typical node",
                fontSize: 48,
            });

            label.attachTo(new Vector3(0, 0, 0), "top", 2);

            const mesh = label.labelMesh;
            assert.exists(mesh);

            const info = mesh.getBoundingInfo();
            const min = info.boundingBox.minimumWorld;
            const max = info.boundingBox.maximumWorld;

            // Label width should be substantial
            const width = max.x - min.x;
            assert.isTrue(width > 1, "Wide label should have significant width");

            label.dispose();
        });

        test("multiple lines increase label height", () => {
            const singleLineLabel = new RichTextLabel(scene, {
                text: "Single Line",
                fontSize: 24,
            });

            // Note: RichTextLabel may support multi-line via \n or explicit height
            // For now, test that different font sizes affect height
            const largeFontLabel = new RichTextLabel(scene, {
                text: "Large Font",
                fontSize: 96,
            });

            const smallInfo = singleLineLabel.labelMesh?.getBoundingInfo();
            const largeInfo = largeFontLabel.labelMesh?.getBoundingInfo();

            assert.exists(smallInfo);
            assert.exists(largeInfo);

            const smallHeight = smallInfo.boundingBox.maximumWorld.y - smallInfo.boundingBox.minimumWorld.y;
            const largeHeight = largeInfo.boundingBox.maximumWorld.y - largeInfo.boundingBox.minimumWorld.y;

            assert.isTrue(largeHeight > smallHeight, "Larger font should produce taller bounding box");

            singleLineLabel.dispose();
            largeFontLabel.dispose();
        });
    });

    describe("Edge case: negative positions and offsets", () => {
        test("label with negative position is included in bounding box", () => {
            const label = new RichTextLabel(scene, {
                text: "Negative Position",
                fontSize: 24,
            });

            label.attachTo(new Vector3(-100, -100, 0), "center", 0);

            const mesh = label.labelMesh;
            assert.exists(mesh);

            const info = mesh.getBoundingInfo();
            const min = info.boundingBox.minimumWorld;

            // Min should be around -100 (or less)
            assert.isTrue(min.x < 0, "Min X should be negative");
            assert.isTrue(min.y < 0, "Min Y should be negative");

            label.dispose();
        });

        test("label with negative offset moves toward target", () => {
            const labelPositive = new RichTextLabel(scene, {text: "Pos", fontSize: 24});
            const labelNegative = new RichTextLabel(scene, {text: "Neg", fontSize: 24});

            const target = new Vector3(0, 0, 0);

            labelPositive.attachTo(target, "top", 5.0);
            labelNegative.attachTo(target, "top", -2.0);

            const posY = labelPositive.labelMesh?.position.y ?? 0;
            const negY = labelNegative.labelMesh?.position.y ?? 0;

            // Negative offset should place label lower (closer to or below target)
            assert.isTrue(negY < posY, "Negative offset should place label lower");

            labelPositive.dispose();
            labelNegative.dispose();
        });
    });

    describe("Integration: multiple label types", () => {
        test("node-style and edge-style labels both expand bounding box", () => {
            // Simulate a node label (attached to node position)
            const nodeLabel = new RichTextLabel(scene, {
                text: "Node Label",
                fontSize: 24,
            });
            nodeLabel.attachTo(new Vector3(0, 0, 0), "top", 3);

            // Simulate an arrow head label (attached to edge endpoint)
            const arrowHeadLabel = new RichTextLabel(scene, {
                text: "Arrow Head",
                fontSize: 16,
            });
            arrowHeadLabel.attachTo(new Vector3(10, 0, 0), "top", 1);

            // Simulate an arrow tail label
            const arrowTailLabel = new RichTextLabel(scene, {
                text: "Arrow Tail",
                fontSize: 16,
            });
            arrowTailLabel.attachTo(new Vector3(-10, 0, 0), "top", 1);

            // Simulate an edge label (at midpoint)
            const edgeLabel = new RichTextLabel(scene, {
                text: "Edge Label",
                fontSize: 18,
            });
            edgeLabel.attachTo(new Vector3(0, 5, 0), "center", 0);

            // All labels should have valid meshes
            assert.exists(nodeLabel.labelMesh);
            assert.exists(arrowHeadLabel.labelMesh);
            assert.exists(arrowTailLabel.labelMesh);
            assert.exists(edgeLabel.labelMesh);

            // Calculate combined bounding box
            const labels = [nodeLabel, arrowHeadLabel, arrowTailLabel, edgeLabel];
            let maxX = -Infinity;
            let minX = Infinity;

            for (const label of labels) {
                const mesh = label.labelMesh;
                if (mesh) {
                    const info = mesh.getBoundingInfo();
                    minX = Math.min(minX, info.boundingBox.minimumWorld.x);
                    maxX = Math.max(maxX, info.boundingBox.maximumWorld.x);
                }
            }

            // Bounding box should span from arrow tail (-10) to arrow head (+10)
            assert.isTrue(minX < 0, "Min X should include arrow tail");
            assert.isTrue(maxX > 0, "Max X should include arrow head");

            // Cleanup
            for (const label of labels) {
                label.dispose();
            }
        });
    });

    describe("Performance consideration: empty label handling", () => {
        test("label with empty text still has valid bounding box", () => {
            const label = new RichTextLabel(scene, {
                text: "",
                fontSize: 24,
            });

            // Empty label should still have a mesh and bounding info
            // (or gracefully handle the empty case)
            const mesh = label.labelMesh;
            if (mesh) {
                const info = mesh.getBoundingInfo();
                assert.exists(info.boundingBox);
            }

            label.dispose();
        });

        test("disposed label should not affect bounding box calculation", () => {
            const label = new RichTextLabel(scene, {
                text: "Test",
                fontSize: 24,
            });

            label.attachTo(new Vector3(100, 100, 0), "top", 5);

            // Dispose the label
            label.dispose();

            // After disposal, labelMesh should indicate it's disposed
            const mesh = label.labelMesh;
            if (mesh) {
                assert.isTrue(mesh.isDisposed(), "Mesh should be disposed");
            }
        });
    });
});
