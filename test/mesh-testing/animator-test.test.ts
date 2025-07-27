/**
 * RichTextAnimator Tests
 *
 * Comprehensive tests for the RichTextAnimator class including all animation types
 * and edge cases. Uses manual callback triggering to test time-based animations.
 */

import {Color3, Mesh, NullEngine, Scene, StandardMaterial, Vector3} from "@babylonjs/core";
import {afterEach, assert, beforeEach, describe, test, vi} from "vitest";

import {RichTextAnimator} from "../../src/meshes/RichTextAnimator";

describe("RichTextAnimator Tests", () => {
    let engine: NullEngine;
    let scene: Scene;
    let mesh: Mesh;
    let material: StandardMaterial;
    let registeredCallbacks: (() => void)[] = [];

    beforeEach(() => {
        engine = new NullEngine();
        scene = new Scene(engine);

        // Mock scene render callbacks
        registeredCallbacks = [];
        scene.registerBeforeRender = vi.fn((callback: () => void) => {
            registeredCallbacks.push(callback);
        });
        scene.unregisterBeforeRender = vi.fn((callback: () => void) => {
            const index = registeredCallbacks.indexOf(callback);
            if (index > -1) {
                registeredCallbacks.splice(index, 1);
            }
        });

        // Create test mesh and material
        mesh = new Mesh("testMesh", scene);
        mesh.position = new Vector3(0, 0, 0);
        mesh.scaling = new Vector3(1, 1, 1);

        material = new StandardMaterial("testMaterial", scene);
        material.emissiveColor = new Color3(0, 0, 0);
    });

    afterEach(() => {
        scene.dispose();
    // Skip engine disposal to avoid DOM issues
    });

    describe("Animation Setup", () => {
        test("setupAnimation with none type does nothing", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "none",
                animationSpeed: 1,
            });

            animator.setupAnimation(mesh, material);

            assert.equal(registeredCallbacks.length, 0);
            assert.isNull((animator as unknown as {originalPosition: unknown}).originalPosition);
            assert.isNull((animator as unknown as {originalScale: unknown}).originalScale);
        });

        test("setupAnimation stores original position and scale", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "pulse",
                animationSpeed: 1,
            });

            mesh.position = new Vector3(5, 10, 15);
            mesh.scaling = new Vector3(2, 3, 4);

            animator.setupAnimation(mesh, material);

            assert.equal(registeredCallbacks.length, 1);

            const originalPos = (animator as unknown as {originalPosition: Vector3}).originalPosition;
            const {originalScale} = (animator as unknown as {originalScale: Vector3});

            assert.deepEqual(originalPos, new Vector3(5, 10, 15));
            assert.deepEqual(originalScale, new Vector3(2, 3, 4));
        });
    });

    describe("Pulse Animation", () => {
        test("animates scale with sine wave", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "pulse",
                animationSpeed: 1,
            });

            animator.setupAnimation(mesh, material);

            // The pulse animation uses: scale = 1 + (Math.sin(animationTime * 3) * 0.1)
            // Set animation time directly to test specific points
            (animator as unknown as {animationTime: number}).animationTime = 0;
            (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown) => void}).updateAnimation(mesh, material);
            assert.approximately(mesh.scaling.x, 1, 0.001); // 1 + sin(0 * 3) * 0.1 = 1 + 0 * 0.1 = 1

            (animator as unknown as {animationTime: number}).animationTime = Math.PI / 6; // sin(PI/6 * 3) = sin(PI/2) = 1
            (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown) => void}).updateAnimation(mesh, material);
            assert.approximately(mesh.scaling.x, 1.1, 0.001); // 1 + sin(PI/2) * 0.1 = 1 + 1 * 0.1 = 1.1

            (animator as unknown as {animationTime: number}).animationTime = Math.PI / 3; // sin(PI/3 * 3) = sin(PI) = 0
            (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown) => void}).updateAnimation(mesh, material);
            assert.approximately(mesh.scaling.x, 1, 0.001); // 1 + sin(PI) * 0.1 = 1 + 0 * 0.1 = 1
        });

        test("respects animation speed", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "pulse",
                animationSpeed: 2,
            });

            animator.setupAnimation(mesh, material);

            // Initial animationTime should be 0
            assert.equal((animator as unknown as {animationTime: number}).animationTime, 0);

            // Simulate 10 frames at 60fps (0.016s per frame)
            for (let i = 0; i < 10; i++) {
                registeredCallbacks[0]();
            }

            // Animation time should be 10 * 0.016 * 2 = 0.32
            assert.approximately((animator as unknown as {animationTime: number}).animationTime, 0.32, 0.001);
        });
    });

    describe("Bounce Animation", () => {
        test("animates Y position with bounce effect", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "bounce",
                animationSpeed: 1,
            });

            mesh.position.y = 5;
            animator.setupAnimation(mesh, material);

            // The bounce animation uses: bounce = Math.abs(Math.sin(animationTime * 2)) * 0.3
            // Test bounce at peak (abs(sin) = 1)
            (animator as unknown as {animationTime: number}).animationTime = Math.PI / 4; // sin(PI/4 * 2) = sin(PI/2) = 1
            (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown) => void}).updateAnimation(mesh, material);

            assert.approximately(mesh.position.y, 5.3, 0.001); // 5 + Math.abs(1) * 0.3 = 5.3

            // Test bounce at bottom (abs(sin) = 0)
            (animator as unknown as {animationTime: number}).animationTime = 0;
            (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown) => void}).updateAnimation(mesh, material);

            assert.approximately(mesh.position.y, 5, 0.001); // 5 + Math.abs(0) * 0.3 = 5
        });
    });

    describe("Shake Animation", () => {
        test("animates X and Y position with shake effect", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "shake",
                animationSpeed: 1,
            });

            mesh.position = new Vector3(10, 20, 30);
            animator.setupAnimation(mesh, material);

            const originalX = 10;
            const originalY = 20;

            // Test multiple frames to ensure shaking
            let maxDeviationX = 0;
            let maxDeviationY = 0;

            for (let i = 0; i < 100; i++) {
                (animator as unknown as {animationTime: number}).animationTime = i * 0.1;
                (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown) => void}).updateAnimation(mesh, material);

                maxDeviationX = Math.max(maxDeviationX, Math.abs(mesh.position.x - originalX));
                maxDeviationY = Math.max(maxDeviationY, Math.abs(mesh.position.y - originalY));
            }

            // Should have some shake but limited to 0.02
            assert.isTrue(maxDeviationX > 0);
            assert.isTrue(maxDeviationX <= 0.02);
            assert.isTrue(maxDeviationY > 0);
            assert.isTrue(maxDeviationY <= 0.02);
        });
    });

    describe("Glow Animation", () => {
        test("animates material emissive color", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "glow",
                animationSpeed: 1,
            });

            animator.setupAnimation(mesh, material);

            // The glow animation uses: glow = 0.65 + (Math.sin(glowTime * 2) * 0.35)
            // Test at different glow intensities
            (animator as unknown as {animationTime: number}).animationTime = 0; // sin(0 * 2) = 0, glow = 0.65 + 0 * 0.35 = 0.65
            (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown) => void}).updateAnimation(mesh, material);

            assert.approximately(material.emissiveColor.r, 0.65, 0.001);
            assert.approximately(material.emissiveColor.g, 0.65, 0.001);
            assert.approximately(material.emissiveColor.b, 0.65, 0.001);

            // For speed 1, effectiveSpeed = max(1.5, 1) = 1.5
            // glowTime = animationTime * (1.5 / 1) = animationTime * 1.5
            // At animationTime = PI/4, glowTime = PI/4 * 1.5 = 3*PI/8
            // glow = 0.65 + sin(3*PI/8 * 2) * 0.35 = 0.65 + sin(3*PI/4) * 0.35
            (animator as unknown as {animationTime: number}).animationTime = Math.PI / 4;
            (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown) => void}).updateAnimation(mesh, material);

            const expectedGlow = 0.65 + (Math.sin(3 * Math.PI / 4) * 0.35);
            assert.approximately(material.emissiveColor.r, expectedGlow, 0.001);
        });

        test("enforces minimum speed of 1.5", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "glow",
                animationSpeed: 0.5, // Less than 1.5
            });

            animator.setupAnimation(mesh, material);

            // Animation should use effective speed of 1.5, not 0.5
            // The glow animation adjusts time with effectiveSpeed/animationSpeed ratio
            (animator as unknown as {animationTime: number}).animationTime = 1;
            (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown) => void}).updateAnimation(mesh, material);

            // Verify the glow calculation uses adjusted time
            // glowTime = animationTime * (effectiveSpeed / animationSpeed) = 1 * (1.5 / 0.5) = 3
            const expectedGlow = 0.65 + (Math.sin(3 * 2) * 0.35); // 0.65 + sin(6) * 0.35
            assert.approximately(material.emissiveColor.r, expectedGlow, 0.001);
        });

        test("handles null material gracefully", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "glow",
                animationSpeed: 1,
            });

            animator.setupAnimation(mesh, null);

            // Should not throw
            assert.doesNotThrow(() => {
                (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown) => void}).updateAnimation(mesh, null);
            });
        });
    });

    describe("Fill Animation", () => {
        test("calls progress callback with sawtooth wave values", () => {
            const progressValues: number[] = [];
            const progressCallback = (value: number): void => {
                progressValues.push(value);
            };

            const animator = new RichTextAnimator(scene, {
                animation: "fill",
                animationSpeed: 1,
            });

            animator.setupAnimation(mesh, material, progressCallback);

            // Test sawtooth pattern (0 to 1 over 4 seconds)
            const testTimes = [0, 1, 2, 3, 3.999, 4, 5];
            const expectedValues = [0, 0.25, 0.5, 0.75, 0.99975, 0, 0.25];

            testTimes.forEach((time, index) => {
                progressValues.length = 0; // Clear previous values
                (animator as unknown as {animationTime: number}).animationTime = time;
                (animator as unknown as {lastFillUpdate: number}).lastFillUpdate = 0; // Reset throttle
                (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown, callback?: unknown) => void}).updateAnimation(mesh, material, progressCallback);

                assert.approximately(progressValues[progressValues.length - 1], expectedValues[index], 0.001);
            });
        });

        test("throttles updates to 30 FPS", () => {
            let callCount = 0;
            const progressCallback = (): void => {
                callCount++;
            };

            const animator = new RichTextAnimator(scene, {
                animation: "fill",
                animationSpeed: 1,
            });

            animator.setupAnimation(mesh, material, progressCallback);

            // Mock performance.now
            let currentTime = 1000; // Start at 1000 to avoid issues with lastFillUpdate = 0
            global.performance = {
                now: () => currentTime,
            } as unknown as Performance;

            // First call should work - need to call updateAnimation directly for fill callback
            (animator as unknown as {lastFillUpdate: number}).lastFillUpdate = 0; // Reset to 0 so first call goes through
            (animator as unknown as {animationTime: number}).animationTime = 1;
            (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown, callback?: unknown) => void}).updateAnimation(mesh, material, progressCallback);
            assert.equal(callCount, 1);

            // Call again within 33ms - should be throttled
            currentTime = 1020;
            (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown, callback?: unknown) => void}).updateAnimation(mesh, material, progressCallback);
            assert.equal(callCount, 1);

            // Call after 33ms - should work
            currentTime = 1040;
            (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown, callback?: unknown) => void}).updateAnimation(mesh, material, progressCallback);
            assert.equal(callCount, 2);
        });

        test("handles missing progress callback", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "fill",
                animationSpeed: 1,
            });

            animator.setupAnimation(mesh, material); // No callback

            // Should not throw
            assert.doesNotThrow(() => {
                (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown) => void}).updateAnimation(mesh, material);
            });
        });
    });

    describe("Update Original Position", () => {
        test("updates stored original position", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "bounce",
                animationSpeed: 1,
            });

            animator.setupAnimation(mesh, material);

            const newPosition = new Vector3(100, 200, 300);
            animator.updateOriginalPosition(newPosition);

            assert.deepEqual((animator as unknown as {originalPosition: Vector3}).originalPosition, newPosition);

            // Original vector should not be affected
            newPosition.x = 999;
            assert.equal((animator as unknown as {originalPosition: Vector3}).originalPosition.x, 100);
        });
    });

    describe("Dispose", () => {
        test("unregisters scene callback", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "pulse",
                animationSpeed: 1,
            });

            animator.setupAnimation(mesh, material);
            assert.equal(registeredCallbacks.length, 1);

            animator.dispose();

            assert.equal(registeredCallbacks.length, 0);
            assert.isNull((animator as unknown as {sceneCallback: unknown}).sceneCallback);
        });

        test("handles multiple dispose calls", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "pulse",
                animationSpeed: 1,
            });

            animator.setupAnimation(mesh, material);

            animator.dispose();
            animator.dispose(); // Should not throw

            assert.equal(registeredCallbacks.length, 0);
        });

        test("dispose without setup does nothing", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "pulse",
                animationSpeed: 1,
            });

            // No setup, just dispose
            assert.doesNotThrow(() => {
                animator.dispose();
            });
        });
    });

    describe("Edge Cases", () => {
        test("handles unknown animation type", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "unknown" as "none" | "pulse" | "bounce" | "shake" | "glow" | "fill",
                animationSpeed: 1,
            });

            animator.setupAnimation(mesh, material);

            // Should not throw when updating
            assert.doesNotThrow(() => {
                (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown) => void}).updateAnimation(mesh, material);
            });
        });

        test("handles very high animation speeds", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "pulse",
                animationSpeed: 1000,
            });

            animator.setupAnimation(mesh, material);

            // Single frame should advance time significantly
            registeredCallbacks[0]();

            assert.approximately((animator as unknown as {animationTime: number}).animationTime, 16, 0.001); // 0.016 * 1000
        });

        test("preserves Z position in bounce animation", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "bounce",
                animationSpeed: 1,
            });

            mesh.position = new Vector3(1, 2, 3);
            animator.setupAnimation(mesh, material);

            registeredCallbacks[0]();

            assert.equal(mesh.position.x, 1);
            assert.equal(mesh.position.z, 3);
        });

        test("only animates X and Y scale in pulse animation", () => {
            const animator = new RichTextAnimator(scene, {
                animation: "pulse",
                animationSpeed: 1,
            });

            mesh.scaling = new Vector3(1, 1, 2);
            animator.setupAnimation(mesh, material);

            // Store original Z scale
            const originalZ = mesh.scaling.z;

            // Run animation
            (animator as unknown as {animationTime: number}).animationTime = Math.PI / 6; // Should produce scale of 1.1
            (animator as unknown as {updateAnimation: (mesh: unknown, material: unknown) => void}).updateAnimation(mesh, material);

            // X and Y should be animated, Z should remain unchanged
            assert.approximately(mesh.scaling.x, 1.1, 0.001);
            assert.approximately(mesh.scaling.y, 1.1, 0.001);
            assert.equal(mesh.scaling.z, originalZ); // Z unchanged
        });
    });
});
