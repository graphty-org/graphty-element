/**
 * Simple Real Mesh Integration Tests
 *
 * Basic tests that actually call the real mesh classes to ensure code coverage.
 * Focused on successful execution rather than complex scenarios.
 */

import {MeshBuilder, NullEngine, Scene, Vector3} from "@babylonjs/core";
import {afterEach, assert, beforeEach, describe, test} from "vitest";

import {EdgeMesh} from "../../src/meshes/EdgeMesh";
import {MeshCache} from "../../src/meshes/MeshCache";
import {NodeMesh} from "../../src/meshes/NodeMesh";
import {RichTextLabel} from "../../src/meshes/RichTextLabel";

type NodeShapeType = "box" | "sphere" | "cylinder" | "cone" | "capsule" | "torus-knot" | "tetrahedron" | "octahedron" | "dodecahedron" | "icosahedron" | "rhombicuboctahedron" | "triangular-prism" | "pentagonal-prism" | "hexagonal-prism" | "square-pyramid" | "pentagonal-pyramid" | "triangular-dipyramid" | "pentagonal-dipyramid" | "elongated-square-dipyramid" | "elongated-pentagonal-dipyramid" | "elongated-pentagonal-cupola" | "goldberg" | "icosphere" | "geodesic";

describe("Simple Real Mesh Tests", () => {
    let engine: NullEngine;
    let scene: Scene;
    let meshCache: MeshCache;

    beforeEach(() => {
        engine = new NullEngine();
        scene = new Scene(engine);
        meshCache = new MeshCache();
    });

    afterEach(() => {
        scene.dispose();
    // Skip engine disposal to avoid DOM issues
    });

    describe("NodeMesh Coverage", () => {
        test("creates basic sphere mesh", () => {
            const options = {
                styleId: "test-sphere",
                is2D: false,
                size: 1,
            };

            const createOptions = {
                shape: {type: "sphere" as const, size: 1},
                texture: {color: "#FF0000"},
                effect: {wireframe: false},
            };

            const mesh = NodeMesh.create(meshCache, options, createOptions, scene);
            assert.isNotNull(mesh);
        });

        test("creates box mesh with 2D mode", () => {
            const options = {
                styleId: "test-box-2d",
                is2D: true,
                size: 2,
            };

            const createOptions = {
                shape: {type: "box" as const, size: 2},
                texture: {color: "#00FF00"},
                effect: {wireframe: false},
            };

            const mesh = NodeMesh.create(meshCache, options, createOptions, scene);
            assert.isNotNull(mesh);
        });

        test("handles wireframe and color object", () => {
            const options = {
                styleId: "test-wireframe",
                is2D: false,
                size: 1,
            };

            const createOptions = {
                shape: {type: "cylinder" as const, size: 1},
                texture: {
                    color: {
                        colorType: "solid" as const,
                        value: "#0000FF",
                        opacity: 0.7,
                    },
                },
                effect: {wireframe: true},
            };

            const mesh = NodeMesh.create(meshCache, options, createOptions, scene);
            assert.isNotNull(mesh);
            assert.equal(mesh.visibility, 0.7);
        });

        test("tests extractColor method with edge cases", () => {
            // Test ##FFFFFF case
            const options1 = {
                styleId: "test-color-edge",
                is2D: false,
                size: 1,
            };

            const createOptions1 = {
                shape: {type: "tetrahedron" as const, size: 1},
                texture: {color: "##FFFFFF"},
                effect: {wireframe: false},
            };

            const mesh1 = NodeMesh.create(meshCache, options1, createOptions1, scene);
            assert.isNotNull(mesh1);
        });

        test("creates all 26 node shapes", () => {
            const shapes = [
                // Basic shapes
                "box",
                "sphere",
                "cylinder",
                "cone",
                "capsule",
                "torus-knot",

                // Polyhedrons
                "tetrahedron",
                "octahedron",
                "dodecahedron",
                "icosahedron",
                "rhombicuboctahedron",

                // Prisms
                "triangular-prism",
                "pentagonal-prism",
                "hexagonal-prism",

                // Pyramids
                "square-pyramid",
                "pentagonal-pyramid",

                // Dipyramids
                "triangular-dipyramid",
                "pentagonal-dipyramid",
                "elongated-square-dipyramid",
                "elongated-pentagonal-dipyramid",

                // Complex shapes
                "elongated-pentagonal-cupola",
                "goldberg",
                "icosphere",
                "geodesic",
            ];

            shapes.forEach((shape) => {
                const options = {
                    styleId: `test-${shape}`,
                    is2D: false,
                    size: 1,
                };

                const createOptions = {
                    shape: {type: shape as NodeShapeType, size: 1},
                    texture: {color: "#FFFFFF"},
                    effect: {wireframe: false},
                };

                const mesh = NodeMesh.create(meshCache, options, createOptions, scene);
                assert.isNotNull(mesh, `Failed to create ${shape}`);
            });
        });
    });

    describe("EdgeMesh Coverage", () => {
        test("creates static edge", () => {
            const options = {
                styleId: "test-static-edge",
                width: 2,
                color: "#FF0000",
            };

            const style = {
                enabled: true,
                line: {},
            };

            const mesh = EdgeMesh.create(meshCache, options, style, scene);
            assert.isNotNull(mesh);
        });

        test("creates animated edge", () => {
            const options = {
                styleId: "test-animated-edge",
                width: 3,
                color: "#00FF00",
            };

            const style = {
                enabled: true,
                line: {animationSpeed: 1.5},
            };

            const mesh = EdgeMesh.create(meshCache, options, style, scene);
            assert.isNotNull(mesh);
        });

        test("creates arrow heads", () => {
            const arrowOptions = {
                type: "normal",
                width: 2,
                color: "#0000FF",
            };

            const arrow = EdgeMesh.createArrowHead(
                meshCache,
                "test-arrow",
                arrowOptions,
                scene,
            );

            assert.isNotNull(arrow);
        });

        test("handles none arrow type", () => {
            const arrowOptions = {
                type: "none",
                width: 2,
                color: "#0000FF",
            };

            const arrow = EdgeMesh.createArrowHead(
                meshCache,
                "test-arrow-none",
                arrowOptions,
                scene,
            );

            assert.isNull(arrow);
        });

        test("calculates arrow dimensions", () => {
            const width = EdgeMesh.calculateArrowWidth(5);
            const length = EdgeMesh.calculateArrowLength(5);

            assert.isNumber(width);
            assert.isNumber(length);
            assert.isTrue(width > 0);
            assert.isTrue(length > 0);
        });

        test("transforms mesh with proper Vector3", () => {
            const options = {
                styleId: "test-transform",
                width: 1,
                color: "#000000",
            };

            const style = {enabled: true, line: {}};
            const mesh = EdgeMesh.create(meshCache, options, style, scene);

            const srcPoint = new Vector3(0, 0, 0);
            const dstPoint = new Vector3(5, 3, 2);

            EdgeMesh.transformMesh(mesh, srcPoint, dstPoint);

            assert.isNotNull(mesh.position);
            assert.isNotNull(mesh.scaling);
        });
    });

    describe("RichTextLabel Coverage", () => {
        test("creates basic label", () => {
            const options = {
                text: "Test Label",
                font: "Arial",
                fontSize: 24,
                textColor: "#000000",
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label);
            assert.isNotNull(label.labelMesh);
        });

        test("creates label with background", () => {
            const options = {
                text: "Background Test",
                backgroundColor: "#FFFFFF",
                backgroundPadding: 10,
                cornerRadius: 5,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label);
            assert.isNotNull(label.labelMesh);
        });

        test("creates label with borders", () => {
            const options = {
                text: "Border Test",
                borders: [
                    {width: 2, color: "#FF0000", spacing: 0},
                ],
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label);
            assert.isNotNull(label.labelMesh);
        });

        test("creates label with empty text", () => {
            const options = {
                text: "",
                fontSize: 12,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label);
        });

        test("updates label text", () => {
            const options = {
                text: "Initial Text",
                fontSize: 16,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label);

            // Test setText method
            label.setText("Updated Text");
            assert.isNotNull(label.labelMesh);
        });

        test("attaches label to position", () => {
            const options = {
                text: "Attached Label",
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            const position = new Vector3(1, 2, 3);

            label.attachTo(position, "top", 1.0);
            assert.isNotNull(label.labelMesh);
        });

        test("handles badge properties", () => {
            const options = {
                text: "Badge Label",
                badge: "notification" as const,
                fontSize: 16,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles progress bar", () => {
            const options = {
                text: "Progress",
                progress: 0.75,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles gradient backgrounds", () => {
            const options = {
                text: "Gradient Test",
                backgroundGradient: true,
                backgroundGradientType: "radial" as const,
                backgroundGradientDirection: "horizontal" as const,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles text shadows", () => {
            const options = {
                text: "Shadow Text",
                textShadow: true,
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowBlur: 8,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("creates pointer with different directions", () => {
            const directions = ["top", "bottom", "left", "right", "auto"] as const;

            directions.forEach((direction) => {
                const options = {
                    text: `Pointer ${direction}`,
                    pointer: true,
                    pointerDirection: direction,
                    fontSize: 12,
                };

                const label = RichTextLabel.createLabel(scene, options);
                assert.isNotNull(label.labelMesh, `Failed for direction: ${direction}`);
            });
        });

        test("handles animation types", () => {
            const animations = ["none", "glow", "pulse", "bounce"] as const;

            animations.forEach((animation) => {
                const options = {
                    text: `Animation ${animation}`,
                    animation,
                    animationSpeed: 2.0,
                    fontSize: 12,
                };

                const label = RichTextLabel.createLabel(scene, options);
                assert.isNotNull(label.labelMesh, `Failed for animation: ${animation}`);
            });
        });

        test("handles depth fading", () => {
            const options = {
                text: "Depth Fade",
                depthFadeEnabled: true,
                depthFadeNear: 10,
                depthFadeFar: 100,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles smart overflow", () => {
            const options = {
                text: "9999",
                smartOverflow: true,
                maxNumber: 999,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("disposes resources properly", () => {
            const options = {
                text: "Dispose Test",
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);

            // Test dispose
            label.dispose();

            // After dispose, labelMesh should still exist but internal resources cleaned up
            assert.isNotNull(label.labelMesh);
        });

        test("updates progress value", () => {
            const options = {
                text: "Progress Update",
                progress: 0.3,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);

            // Test progress update
            label.setProgress(0.8);
            assert.isNotNull(label.labelMesh);
        });

        test("starts and stops animation", () => {
            const options = {
                text: "Animation Control",
                animation: "pulse" as const,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);

            // Test animation control
            label.startAnimation();
            // Note: RichTextLabel doesn't have stopAnimation method, only dispose stops it

            assert.isNotNull(label.labelMesh);
        });
    });

    describe("RichTextParser Coverage", () => {
        test("parses rich text with all tag types", () => {
            const options = {
                text: "<bold>Bold</bold> <italic>Italic</italic> <color='#FF0000'>Red</color> <size='20'>Big</size> <font='Arial'>Arial</font> <bg='#FFFF00'>Yellow BG</bg>",
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles nested tags", () => {
            const options = {
                text: "<bold><italic>Bold and Italic</italic></bold> <color='#00FF00'><size='18'>Green and Big</size></color>",
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles closing tags without opening", () => {
            const options = {
                text: "Normal </bold> text </italic> here",
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles tags with empty or missing values", () => {
            const options = {
                text: "<color=''>Empty color</color> <size>No size value</size> <bg>No bg value</bg>",
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles multi-line rich text", () => {
            const options = {
                text: "<bold>Line 1</bold>\n<italic>Line 2</italic>\n<color='#0000FF'>Line 3</color>",
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles text without any tags", () => {
            const options = {
                text: "Just plain text without any formatting",
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("measures text with outline", () => {
            const options = {
                text: "Text with outline",
                textOutline: true,
                textOutlineWidth: 3,
                textOutlineColor: "#000000",
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });
    });

    describe("RichTextLabel Advanced Coverage", () => {
        test("handles large text that exceeds max texture size", () => {
            // Create very long text that might trigger texture size limits
            const longText = `${"A".repeat(500)}\n${"B".repeat(500)}`;
            const options = {
                text: longText,
                fontSize: 96, // Large font to trigger size limits
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles gradient background with all directions", () => {
            const directions = ["vertical", "horizontal", "diagonal"] as const;

            directions.forEach((direction) => {
                const options = {
                    text: `Gradient ${direction}`,
                    backgroundGradient: true,
                    backgroundGradientDirection: direction,
                    backgroundGradientColors: ["#FF0000", "#00FF00", "#0000FF"],
                    fontSize: 14,
                };

                const label = RichTextLabel.createLabel(scene, options);
                assert.isNotNull(label.labelMesh, `Failed for direction: ${direction}`);
            });
        });

        test("handles complex background with object color type", () => {
            const options = {
                text: "Complex Background",
                backgroundColor: {
                    colorType: "gradient" as const,
                    direction: 0,
                    colors: ["#FF0000", "#00FF00"],
                },
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles rounded rect with borders and pointer", () => {
            const options = {
                text: "Rounded with Pointer",
                cornerRadius: 15,
                borders: [
                    {width: 2, color: "#FF0000", spacing: 1},
                    {width: 3, color: "#00FF00", spacing: 2},
                ],
                pointer: true,
                pointerDirection: "bottom" as const,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles margin properties", () => {
            const options = {
                text: "With Margins",
                marginTop: 10,
                marginBottom: 15,
                marginLeft: 20,
                marginRight: 25,
                backgroundColor: "#CCCCCC",
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles smart sizing", () => {
            const options = {
                text: "S",
                _smartSizing: true,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles progress bar rendering", () => {
            const options = {
                text: "75%",
                progress: 0.75,
                _progressBar: true,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);

            // Update progress to test _updateProgressBarOnly
            label.setProgress(0.9);
        });

        test("handles billboard modes", () => {
            const modes = [0, 1, 2, 4, 7]; // Different billboard mode constants

            modes.forEach((mode) => {
                const options = {
                    text: `Billboard ${mode}`,
                    billboardMode: mode,
                    fontSize: 14,
                };

                const label = RichTextLabel.createLabel(scene, options);
                assert.isNotNull(label.labelMesh, `Failed for billboard mode: ${mode}`);
            });
        });

        test("handles attachment to mesh", () => {
            const targetMesh = MeshBuilder.CreateBox("target", {size: 1}, scene);

            const options = {
                text: "Attached to Mesh",
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);

            // Test all attach positions
            const positions = ["top", "bottom", "left", "right", "center", "top-left", "top-right", "bottom-left", "bottom-right"] as const;
            positions.forEach((pos) => {
                label.attachTo(targetMesh, pos, 1.0);
                assert.isNotNull(label.labelMesh);
            });
        });

        test("handles text with special renderer features", () => {
            const options = {
                text: "Text with shadows and outline",
                textShadow: true,
                textShadowColor: "rgba(0,0,0,0.8)",
                textShadowBlur: 6,
                textShadowOffsetX: 2,
                textShadowOffsetY: 2,
                textOutline: true,
                textOutlineWidth: 2,
                textOutlineColor: "#FFFFFF",
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles badge with special behaviors", () => {
            const options = {
                text: "99+",
                badge: "count" as const,
                _removeText: true,
                _paddingRatio: 0.5,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles icon rendering", () => {
            const options = {
                text: "With Icon",
                icon: "⚡",
                iconPosition: "left" as const,
                iconSpacing: 5,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles max texture size constraints", () => {
            const options = {
                text: "Very Large Label",
                fontSize: 1000, // Extremely large to test size constraints
                resolution: 2048,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles autoSize disabled", () => {
            const options = {
                text: "Fixed Size",
                autoSize: false,
                resolution: 256,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });

        test("handles smart overflow with values below 1000", () => {
            const options = {
                text: "500",
                smartOverflow: true,
                maxNumber: 999,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);
        });
    });

    describe("RichTextAnimator Coverage", () => {
        test("handles all animation types", () => {
            const animations = ["none", "pulse", "bounce", "shake", "glow", "fill"] as const;

            animations.forEach((animation) => {
                const options = {
                    text: `Test ${animation}`,
                    animation,
                    animationSpeed: 1.5,
                    fontSize: 14,
                };

                const label = RichTextLabel.createLabel(scene, options);
                assert.isNotNull(label.labelMesh, `Failed for animation: ${animation}`);

                // For non-none animations, start the animation to trigger animator methods
                if (animation !== "none") {
                    label.startAnimation();
                }
            });
        });

        test("handles fill animation with progress callback", () => {
            const options = {
                text: "Fill Animation",
                animation: "fill" as const,
                animationSpeed: 2.0,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);

            // Start animation to trigger fill-specific logic
            label.startAnimation();
        });

        test("handles animation with progress bar", () => {
            const options = {
                text: "Progress Animation",
                animation: "pulse" as const,
                progress: 0.6,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);

            // Start animation
            label.startAnimation();

            // Update progress to trigger _progressBar updates
            label.setProgress(0.9);
        });

        test("handles glow animation with material effects", () => {
            const options = {
                text: "Glow Test",
                animation: "glow" as const,
                animationSpeed: 3.0,
                fontSize: 14,
            };

            const label = RichTextLabel.createLabel(scene, options);
            assert.isNotNull(label.labelMesh);

            // Start glow animation to test material changes
            label.startAnimation();
        });
    });

    describe("MeshCache Coverage", () => {
        test("tracks cache hits and misses", () => {
            const cache = new MeshCache();

            // Initial state
            assert.equal(cache.hits, 0);
            assert.equal(cache.misses, 0);
            assert.equal(cache.size(), 0);

            // First call should be a miss
            const instance1 = cache.get("test-key", () => {
                return MeshBuilder.CreateBox("test-box", {size: 1}, scene);
            });

            assert.equal(cache.hits, 0);
            assert.equal(cache.misses, 1);
            assert.equal(cache.size(), 1);
            assert.isNotNull(instance1);

            // Second call with same key should be a hit
            const instance2 = cache.get("test-key", () => {
                return MeshBuilder.CreateBox("should-not-create", {size: 1}, scene);
            });

            assert.equal(cache.hits, 1);
            assert.equal(cache.misses, 1);
            assert.equal(cache.size(), 1);
            assert.isNotNull(instance2);

            // Different key should be another miss
            cache.get("different-key", () => {
                return MeshBuilder.CreateSphere("test-sphere", {diameter: 1}, scene);
            });

            assert.equal(cache.hits, 1);
            assert.equal(cache.misses, 2);
            assert.equal(cache.size(), 2);
        });

        test("reset clears hit/miss counters but keeps cache", () => {
            const cache = new MeshCache();

            cache.get("key1", () => MeshBuilder.CreateBox("box1", {size: 1}, scene));
            cache.get("key1", () => MeshBuilder.CreateBox("box2", {size: 1}, scene));

            assert.equal(cache.hits, 1);
            assert.equal(cache.misses, 1);
            assert.equal(cache.size(), 1);

            cache.reset();

            assert.equal(cache.hits, 0);
            assert.equal(cache.misses, 0);
            assert.equal(cache.size(), 1); // Cache still has the mesh
        });

        test("clear disposes meshes and resets everything", () => {
            const cache = new MeshCache();

            cache.get("key1", () => MeshBuilder.CreateBox("box1", {size: 1}, scene));
            cache.get("key2", () => MeshBuilder.CreateSphere("sphere1", {diameter: 1}, scene));

            assert.equal(cache.size(), 2);
            assert.equal(cache.hits, 0);
            assert.equal(cache.misses, 2);

            cache.clear();

            assert.equal(cache.size(), 0);
            assert.equal(cache.hits, 0);
            assert.equal(cache.misses, 0);
        });

        test("creates instances with correct naming", () => {
            const cache = new MeshCache();

            const instance1 = cache.get("test-mesh", () => {
                return MeshBuilder.CreateBox("original", {size: 1}, scene);
            });

            const instance2 = cache.get("test-mesh", () => {
                return MeshBuilder.CreateBox("should-not-create", {size: 1}, scene);
            });

            // Both should be instances of the same mesh
            assert.isTrue(instance1.name.includes("test-mesh"));
            assert.isTrue(instance2.name.includes("test-mesh"));
            assert.notEqual(instance1, instance2); // Different instances
        });

        test("positions cached mesh far away", () => {
            const cache = new MeshCache();

            cache.get("positioned-mesh", () => {
                const mesh = MeshBuilder.CreateBox("box", {size: 1}, scene);
                mesh.position.set(100, 100, 100); // Set initial position
                return mesh;
            });

            // The original mesh should be positioned at (0, -10000, 0)
            const cachedMesh = cache.meshCacheMap.get("positioned-mesh");
            assert.isNotNull(cachedMesh);
            if (cachedMesh) {
                assert.equal(cachedMesh.position.x, 0);
                assert.equal(cachedMesh.position.y, -10000);
                assert.equal(cachedMesh.position.z, 0);
            } else {
                assert.fail("Cached mesh should not be null");
            }
        });
    });
});
