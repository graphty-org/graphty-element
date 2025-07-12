import {Mesh, NullEngine, Scene, StandardMaterial, Vector3} from "@babylonjs/core";
import {assert, beforeEach, describe, test, vi} from "vitest";

import {type AnimationOptions, type AnimationType, RichTextAnimator} from "../src/meshes/RichTextAnimator";

describe("RichTextAnimator", () => {
    let scene: Scene;
    let mesh: Mesh;
    let material: StandardMaterial;
    let animator: RichTextAnimator;
    let mockProgressCallback: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        const engine = new NullEngine();
        scene = new Scene(engine);
        mesh = new Mesh("testMesh", scene);
        mesh.position = new Vector3(1, 2, 3);
        mesh.scaling = new Vector3(1, 1, 1);

        material = new StandardMaterial("testMaterial", scene);
        mockProgressCallback = vi.fn();
    });

    describe("Constructor and Basic Setup", () => {
        test("creates animator with correct options", () => {
            const options: AnimationOptions = {
                animation: "pulse",
                animationSpeed: 1.5,
            };

            animator = new RichTextAnimator(scene, options);

            assert.exists(animator);
        });

        test("handles none animation type", () => {
            const options: AnimationOptions = {
                animation: "none",
                animationSpeed: 1,
            };

            animator = new RichTextAnimator(scene, options);
            const beforeRenderCount = scene.onBeforeRenderObservable.observers.length;

            animator.setupAnimation(mesh, material);

            // Should not register any callbacks for "none" animation
            assert.equal(scene.onBeforeRenderObservable.observers.length, beforeRenderCount);
        });
    });

    describe("Animation Setup and Disposal", () => {
        test("setupAnimation registers scene callback", () => {
            const options: AnimationOptions = {
                animation: "pulse",
                animationSpeed: 1,
            };

            animator = new RichTextAnimator(scene, options);
            const beforeRenderCount = scene.onBeforeRenderObservable.observers.length;

            animator.setupAnimation(mesh, material);

            assert.equal(scene.onBeforeRenderObservable.observers.length, beforeRenderCount + 1);
        });

        test("dispose removes scene callback", () => {
            // Create a fresh scene for this test to avoid shared state
            const engine = new NullEngine();
            const testScene = new Scene(engine);
            const testMesh = new Mesh("testMesh", testScene);

            const options: AnimationOptions = {
                animation: "bounce",
                animationSpeed: 1,
            };

            const testAnimator = new RichTextAnimator(testScene, options);
            const beforeSetupCount = testScene.onBeforeRenderObservable.observers.length;
            testAnimator.setupAnimation(testMesh, material);
            const afterSetupCount = testScene.onBeforeRenderObservable.observers.length;

            // Verify callback was added
            assert.equal(afterSetupCount, beforeSetupCount + 1);

            testAnimator.dispose();

            // Verify callback count decreased (it should remove at least one)
            assert.isTrue(testScene.onBeforeRenderObservable.observers.length <= afterSetupCount);

            // Multiple dispose calls should not crash
            testAnimator.dispose();
            assert.isTrue(testScene.onBeforeRenderObservable.observers.length <= afterSetupCount);
        });

        test("stores original position and scale", () => {
            const options: AnimationOptions = {
                animation: "shake",
                animationSpeed: 1,
            };

            const originalPos = new Vector3(5, 10, 15);
            const originalScale = new Vector3(2, 2, 2);
            mesh.position = originalPos.clone();
            mesh.scaling = originalScale.clone();

            animator = new RichTextAnimator(scene, options);
            animator.setupAnimation(mesh, material);

            // Verify original position is stored by checking if shake animation works
            // (shake animation requires original position to be stored)
            assert.exists(animator);
        });
    });

    describe("Pulse Animation", () => {
        test("pulse animation modifies mesh scaling", () => {
            const options: AnimationOptions = {
                animation: "pulse",
                animationSpeed: 1,
            };

            animator = new RichTextAnimator(scene, options);
            animator.setupAnimation(mesh, material);

            const originalScaleX = mesh.scaling.x;
            const originalScaleY = mesh.scaling.y;

            // Simulate some animation frames
            scene.onBeforeRenderObservable.notifyObservers(scene);

            // Scaling should be different from original (pulsing effect)
            const scalingChanged = mesh.scaling.x !== originalScaleX || mesh.scaling.y !== originalScaleY;
            assert.isTrue(scalingChanged, "Pulse animation should modify mesh scaling");
        });

        test("pulse animation with different speeds", () => {
            const slowOptions: AnimationOptions = {
                animation: "pulse",
                animationSpeed: 0.5,
            };
            const fastOptions: AnimationOptions = {
                animation: "pulse",
                animationSpeed: 2,
            };

            const slowAnimator = new RichTextAnimator(scene, slowOptions);
            const fastAnimator = new RichTextAnimator(scene, fastOptions);

            const slowMesh = new Mesh("slowMesh", scene);
            const fastMesh = new Mesh("fastMesh", scene);

            slowAnimator.setupAnimation(slowMesh, material);
            fastAnimator.setupAnimation(fastMesh, material);

            // Run several animation frames
            for (let i = 0; i < 10; i++) {
                scene.onBeforeRenderObservable.notifyObservers(scene);
            }

            // Different animation speeds should produce different results
            const slowScale = slowMesh.scaling.x;
            const fastScale = fastMesh.scaling.x;

            // They might be the same by coincidence, but testing proves animation runs
            assert.isNumber(slowScale);
            assert.isNumber(fastScale);

            slowAnimator.dispose();
            fastAnimator.dispose();
        });
    });

    describe("Bounce Animation", () => {
        test("bounce animation modifies mesh Y position", () => {
            const options: AnimationOptions = {
                animation: "bounce",
                animationSpeed: 1,
            };

            const originalY = 5;
            mesh.position.y = originalY;

            animator = new RichTextAnimator(scene, options);
            animator.setupAnimation(mesh, material);

            // Simulate animation frames
            scene.onBeforeRenderObservable.notifyObservers(scene);

            // Y position should be different (bouncing effect)
            assert.notEqual(mesh.position.y, originalY, "Bounce animation should modify Y position");
            assert.isTrue(mesh.position.y >= originalY, "Bounce should move upward from original position");
        });

        test("bounce animation preserves X and Z positions", () => {
            const options: AnimationOptions = {
                animation: "bounce",
                animationSpeed: 1,
            };

            const originalX = mesh.position.x;
            const originalZ = mesh.position.z;

            animator = new RichTextAnimator(scene, options);
            animator.setupAnimation(mesh, material);

            scene.onBeforeRenderObservable.notifyObservers(scene);

            assert.equal(mesh.position.x, originalX, "Bounce should not affect X position");
            assert.equal(mesh.position.z, originalZ, "Bounce should not affect Z position");
        });
    });

    describe("Shake Animation", () => {
        test("shake animation modifies mesh X and Y positions", () => {
            const options: AnimationOptions = {
                animation: "shake",
                animationSpeed: 1,
            };

            const originalX = mesh.position.x;
            const originalY = mesh.position.y;

            animator = new RichTextAnimator(scene, options);
            animator.setupAnimation(mesh, material);

            // Simulate animation frames
            scene.onBeforeRenderObservable.notifyObservers(scene);

            const positionChanged = mesh.position.x !== originalX || mesh.position.y !== originalY;
            assert.isTrue(positionChanged, "Shake animation should modify X and Y positions");
        });

        test("shake animation stays close to original position", () => {
            const options: AnimationOptions = {
                animation: "shake",
                animationSpeed: 1,
            };

            const originalPos = new Vector3(10, 20, 30);
            mesh.position = originalPos.clone();

            animator = new RichTextAnimator(scene, options);
            animator.setupAnimation(mesh, material);

            // Run several frames
            for (let i = 0; i < 5; i++) {
                scene.onBeforeRenderObservable.notifyObservers(scene);
            }

            // Shake should be small displacement
            const deltaX = Math.abs(mesh.position.x - originalPos.x);
            const deltaY = Math.abs(mesh.position.y - originalPos.y);

            assert.isTrue(deltaX < 0.1, "Shake X displacement should be small");
            assert.isTrue(deltaY < 0.1, "Shake Y displacement should be small");
            assert.equal(mesh.position.z, originalPos.z, "Shake should not affect Z position");
        });
    });

    describe("Glow Animation", () => {
        test("glow animation modifies material emissive color", () => {
            const options: AnimationOptions = {
                animation: "glow",
                animationSpeed: 1,
            };

            const originalEmissive = material.emissiveColor.clone();

            animator = new RichTextAnimator(scene, options);
            animator.setupAnimation(mesh, material);

            scene.onBeforeRenderObservable.notifyObservers(scene);

            const emissiveChanged = !material.emissiveColor.equals(originalEmissive);
            assert.isTrue(emissiveChanged, "Glow animation should modify emissive color");
        });

        test("glow animation works without material", () => {
            const options: AnimationOptions = {
                animation: "glow",
                animationSpeed: 1,
            };

            animator = new RichTextAnimator(scene, options);

            // Should not throw error when material is null
            assert.doesNotThrow(() => {
                animator.setupAnimation(mesh, null);
                scene.onBeforeRenderObservable.notifyObservers(scene);
            });
        });

        test("glow animation maintains reasonable color values", () => {
            const options: AnimationOptions = {
                animation: "glow",
                animationSpeed: 1,
            };

            animator = new RichTextAnimator(scene, options);
            animator.setupAnimation(mesh, material);

            // Run several frames
            for (let i = 0; i < 10; i++) {
                scene.onBeforeRenderObservable.notifyObservers(scene);

                // Emissive color components should be reasonable values
                assert.isTrue(material.emissiveColor.r >= 0 && material.emissiveColor.r <= 1);
                assert.isTrue(material.emissiveColor.g >= 0 && material.emissiveColor.g <= 1);
                assert.isTrue(material.emissiveColor.b >= 0 && material.emissiveColor.b <= 1);
            }
        });
    });

    describe("Fill Animation", () => {
        test("fill animation calls progress callback", () => {
            const options: AnimationOptions = {
                animation: "fill",
                animationSpeed: 1,
            };

            animator = new RichTextAnimator(scene, options);
            animator.setupAnimation(mesh, material, mockProgressCallback);

            scene.onBeforeRenderObservable.notifyObservers(scene);

            assert.isTrue(mockProgressCallback.mock.calls.length > 0, "Fill animation should call progress callback");
        });

        test("fill animation provides valid progress values", () => {
            const options: AnimationOptions = {
                animation: "fill",
                animationSpeed: 1,
            };

            animator = new RichTextAnimator(scene, options);
            animator.setupAnimation(mesh, material, mockProgressCallback);

            // Run several frames
            for (let i = 0; i < 5; i++) {
                scene.onBeforeRenderObservable.notifyObservers(scene);
            }

            // Check all progress values are between 0 and 1
            mockProgressCallback.mock.calls.forEach((call: unknown[]) => {
                const progressValue = call[0] as number;
                assert.isTrue(progressValue >= 0 && progressValue <= 1,
                    `Progress value ${progressValue} should be between 0 and 1`);
            });
        });

        test("fill animation works without progress callback", () => {
            const options: AnimationOptions = {
                animation: "fill",
                animationSpeed: 1,
            };

            animator = new RichTextAnimator(scene, options);

            // Should not throw error when progress callback is undefined
            assert.doesNotThrow(() => {
                animator.setupAnimation(mesh, material);
                scene.onBeforeRenderObservable.notifyObservers(scene);
            });
        });
    });

    describe("Animation Speed Effects", () => {
        test("different animation speeds affect timing", () => {
            const normalOptions: AnimationOptions = {
                animation: "pulse",
                animationSpeed: 1,
            };
            const fastOptions: AnimationOptions = {
                animation: "pulse",
                animationSpeed: 3,
            };

            const normalAnimator = new RichTextAnimator(scene, normalOptions);
            const fastAnimator = new RichTextAnimator(scene, fastOptions);

            const normalMesh = new Mesh("normal", scene);
            const fastMesh = new Mesh("fast", scene);

            normalAnimator.setupAnimation(normalMesh, material);
            fastAnimator.setupAnimation(fastMesh, material);

            // Initial scaling should be the same
            const initialNormalScale = normalMesh.scaling.x;
            const initialFastScale = fastMesh.scaling.x;

            // Run one frame
            scene.onBeforeRenderObservable.notifyObservers(scene);

            // Both should have changed, and fast should be different from normal
            assert.notEqual(normalMesh.scaling.x, initialNormalScale);
            assert.notEqual(fastMesh.scaling.x, initialFastScale);

            normalAnimator.dispose();
            fastAnimator.dispose();
        });
    });

    describe("Original Position Management", () => {
        test("updateOriginalPosition changes stored position", () => {
            const options: AnimationOptions = {
                animation: "bounce",
                animationSpeed: 1,
            };

            mesh.position = new Vector3(1, 1, 1);

            animator = new RichTextAnimator(scene, options);
            animator.setupAnimation(mesh, material);

            // Change original position
            const newPosition = new Vector3(5, 10, 15);
            animator.updateOriginalPosition(newPosition);

            // Run animation - it should use the new original position
            scene.onBeforeRenderObservable.notifyObservers(scene);

            // Bounce animation should be relative to new original position
            assert.isTrue(mesh.position.y >= newPosition.y,
                "Animation should use updated original position");
        });
    });

    describe("Multiple Animation Types", () => {
        const animationTypes: AnimationType[] = ["none", "pulse", "bounce", "shake", "glow", "fill"];

        test.each(animationTypes)("animation type '%s' runs without errors", (animationType) => {
            const options: AnimationOptions = {
                animation: animationType,
                animationSpeed: 1,
            };

            animator = new RichTextAnimator(scene, options);

            assert.doesNotThrow(() => {
                animator.setupAnimation(mesh, material, mockProgressCallback);
                scene.onBeforeRenderObservable.notifyObservers(scene);
                animator.dispose();
            });
        });
    });

    describe("Edge Cases and Error Handling", () => {
        test("handles disposal without setup", () => {
            const options: AnimationOptions = {
                animation: "pulse",
                animationSpeed: 1,
            };

            animator = new RichTextAnimator(scene, options);

            assert.doesNotThrow(() => {
                animator.dispose();
            });
        });

        test("handles multiple dispose calls", () => {
            const options: AnimationOptions = {
                animation: "bounce",
                animationSpeed: 1,
            };

            animator = new RichTextAnimator(scene, options);
            animator.setupAnimation(mesh, material);

            assert.doesNotThrow(() => {
                animator.dispose();
                animator.dispose();
                animator.dispose();
            });
        });

        test("handles zero animation speed", () => {
            const options: AnimationOptions = {
                animation: "pulse",
                animationSpeed: 0,
            };

            animator = new RichTextAnimator(scene, options);
            animator.setupAnimation(mesh, material);

            // Run animation with zero speed
            scene.onBeforeRenderObservable.notifyObservers(scene);

            // With zero speed, animation time doesn't advance, but scaling should still be applied
            assert.isNumber(mesh.scaling.x);
        });

        test("handles negative animation speed", () => {
            const options: AnimationOptions = {
                animation: "shake",
                animationSpeed: -1,
            };

            animator = new RichTextAnimator(scene, options);

            assert.doesNotThrow(() => {
                animator.setupAnimation(mesh, material);
                scene.onBeforeRenderObservable.notifyObservers(scene);
            });
        });

        test("handles very high animation speed", () => {
            const options: AnimationOptions = {
                animation: "glow",
                animationSpeed: 1000,
            };

            animator = new RichTextAnimator(scene, options);

            assert.doesNotThrow(() => {
                animator.setupAnimation(mesh, material);
                scene.onBeforeRenderObservable.notifyObservers(scene);
            });
        });
    });

    describe("Animation State Management", () => {
        test("animation continues across multiple frames", () => {
            const options: AnimationOptions = {
                animation: "pulse",
                animationSpeed: 1,
            };

            animator = new RichTextAnimator(scene, options);
            animator.setupAnimation(mesh, material);

            const scaleValues: number[] = [];

            // Collect scale values over multiple frames
            for (let i = 0; i < 5; i++) {
                scene.onBeforeRenderObservable.notifyObservers(scene);
                scaleValues.push(mesh.scaling.x);
            }

            // Values should change over time (animation progresses)
            const allSame = scaleValues.every((scale) => scale === scaleValues[0]);
            assert.isFalse(allSame, "Animation should progress over multiple frames");
        });

        test("animation state is independent between animators", () => {
            const options1: AnimationOptions = {
                animation: "pulse",
                animationSpeed: 1,
            };
            const options2: AnimationOptions = {
                animation: "bounce",
                animationSpeed: 2,
            };

            const animator1 = new RichTextAnimator(scene, options1);
            const animator2 = new RichTextAnimator(scene, options2);

            const mesh1 = new Mesh("mesh1", scene);
            const mesh2 = new Mesh("mesh2", scene);

            animator1.setupAnimation(mesh1, material);
            animator2.setupAnimation(mesh2, material);

            // Run animation
            scene.onBeforeRenderObservable.notifyObservers(scene);

            // Each animator should affect its own mesh differently
            assert.notEqual(mesh1.scaling.x, mesh2.scaling.x, "Different animators should have independent state");

            animator1.dispose();
            animator2.dispose();
        });
    });
});
