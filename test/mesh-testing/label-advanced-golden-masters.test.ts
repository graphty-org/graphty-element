/**
 * Advanced Label Golden Master Tests
 *
 * Tests advanced label features including pointers, badges, animations, and complex
 * configurations to complete 100% coverage of RichTextLabel.ts advanced functionality.
 */

import {assert, describe, test} from "vitest";

import {LabelMeshFactory} from "./mesh-factory";

describe("Label Golden Masters - Advanced Features", () => {
    // Pointer configurations
    describe("Label Pointers", () => {
        test("creates label with bottom pointer", () => {
            const result = LabelMeshFactory.create({
                text: "Pointer Test",
                backgroundColor: "#FFFFFF",
                pointer: {
                    direction: "bottom",
                    width: 20,
                    height: 15,
                    curve: false,
                },
            });

            assert.isTrue(result.validation.isValid,
                `Bottom pointer validation failed: ${result.validation.errors.join(", ")}`);
            assert.isTrue(result.mesh.metadata.hasPointer);
            assert.equal(result.mesh.metadata.pointerDirection, "bottom");
            assert.equal(result.mesh.metadata.pointerWidth, 20);
            assert.equal(result.mesh.metadata.pointerHeight, 15);
        });

        test("creates pointers in all directions", () => {
            const directions = ["top", "bottom", "left", "right"];

            directions.forEach((direction) => {
                const result = LabelMeshFactory.create({
                    text: `${direction} pointer`,
                    backgroundColor: "#CCCCCC",
                    pointer: {
                        direction: direction,
                        width: 25,
                        height: 18,
                    },
                });

                assert.isTrue(result.validation.isValid);
                assert.isTrue(result.mesh.metadata.hasPointer);
                assert.equal(result.mesh.metadata.pointerDirection, direction);
            });
        });

        test("creates curved pointers", () => {
            const result = LabelMeshFactory.create({
                text: "Curved Pointer",
                backgroundColor: "#FF9900",
                pointer: {
                    direction: "bottom",
                    width: 30,
                    height: 20,
                    curve: true,
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.mesh.metadata.hasPointer);
            assert.isTrue(result.mesh.metadata.pointerCurve);
        });

        test("creates pointers with various sizes", () => {
            const sizes = [
                {width: 10, height: 8},
                {width: 20, height: 15},
                {width: 40, height: 30},
                {width: 60, height: 45},
            ];

            sizes.forEach((size) => {
                const result = LabelMeshFactory.create({
                    text: "Size Test",
                    backgroundColor: "#DDDDDD",
                    pointer: {
                        direction: "bottom",
                        width: size.width,
                        height: size.height,
                    },
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.pointerWidth, size.width);
                assert.equal(result.mesh.metadata.pointerHeight, size.height);
            });
        });
    });

    // Badge configurations - all 9 badge types
    describe("Label Badges", () => {
        const badgeTypes = LabelMeshFactory.BADGE_TYPES;

        badgeTypes.forEach((badgeType) => {
            test(`creates ${badgeType} badge`, () => {
                const result = LabelMeshFactory.create({
                    text: "Badge Test",
                    badge: {
                        type: badgeType,
                        count: badgeType === "count" ? 5 : undefined,
                        progress: badgeType === "progress" ? 0.75 : undefined,
                        icon: badgeType === "icon" ? "star" : undefined,
                    },
                });

                assert.isTrue(result.validation.isValid,
                    `${badgeType} badge validation failed: ${result.validation.errors.join(", ")}`);
                assert.isTrue(result.mesh.metadata.hasBadge);
                assert.equal(result.mesh.metadata.badgeType, badgeType);
            });
        });

        test("creates notification badge with count", () => {
            const counts = [1, 5, 99, 999];

            counts.forEach((count) => {
                const result = LabelMeshFactory.create({
                    text: "Notification",
                    badge: {
                        type: "notification",
                        count: count,
                    },
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.badgeType, "notification");
                assert.equal(result.mesh.metadata.badgeCount, count);
            });
        });

        test("creates progress badge with values", () => {
            const progressValues = [0, 0.25, 0.5, 0.75, 1.0];

            progressValues.forEach((progress) => {
                const result = LabelMeshFactory.create({
                    text: "Progress",
                    badge: {
                        type: "progress",
                        progress: progress,
                    },
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.badgeType, "progress");
                assert.equal(result.mesh.metadata.badgeProgress, progress);
            });
        });

        test("creates icon badges with various icons", () => {
            const icons = ["star", "heart", "warning", "info", "check"];

            icons.forEach((icon) => {
                const result = LabelMeshFactory.create({
                    text: "Icon Test",
                    badge: {
                        type: "icon",
                        icon: icon,
                    },
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.badgeType, "icon");
                assert.equal(result.mesh.metadata.badgeIcon, icon);
            });
        });

        test("creates count badge", () => {
            const result = LabelMeshFactory.create({
                text: "Items",
                badge: {
                    type: "count",
                    count: 42,
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.badgeType, "count");
            assert.equal(result.mesh.metadata.badgeCount, 42);
        });

        test("creates label-style badges", () => {
            const labelTypes = ["label", "label-success", "label-warning", "label-danger"];

            labelTypes.forEach((labelType) => {
                const result = LabelMeshFactory.create({
                    text: "Status",
                    badge: {
                        type: labelType,
                    },
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.badgeType, labelType);
            });
        });

        test("creates dot badge", () => {
            const result = LabelMeshFactory.create({
                text: "Status",
                badge: {
                    type: "dot",
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.badgeType, "dot");
        });
    });

    // Animation configurations
    describe("Label Animations", () => {
        test("creates label without animation", () => {
            const result = LabelMeshFactory.create({
                text: "Static Label",
            });

            assert.isTrue(result.validation.isValid);
            assert.isFalse(result.mesh.metadata.hasAnimation);
        });

        test("creates animated label", () => {
            const result = LabelMeshFactory.create({
                text: "Animated Label",
                animation: {
                    type: "fade",
                    speed: 1,
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.mesh.metadata.hasAnimation);
            assert.equal(result.mesh.metadata.animationType, "fade");
            assert.equal(result.mesh.metadata.animationSpeed, 1);
        });

        test("creates animations with different types", () => {
            const animationTypes = ["fade", "slide", "bounce", "pulse", "rotate"];

            animationTypes.forEach((animType) => {
                const result = LabelMeshFactory.create({
                    text: "Animation Test",
                    animation: {
                        type: animType,
                        speed: 1.5,
                    },
                });

                assert.isTrue(result.validation.isValid);
                assert.isTrue(result.mesh.metadata.hasAnimation);
                assert.equal(result.mesh.metadata.animationType, animType);
            });
        });

        test("creates animations with different speeds", () => {
            const speeds = [0.5, 1, 2, 3, 5];

            speeds.forEach((speed) => {
                const result = LabelMeshFactory.create({
                    text: "Speed Test",
                    animation: {
                        type: "pulse",
                        speed: speed,
                    },
                });

                assert.isTrue(result.validation.isValid);
                assert.equal(result.mesh.metadata.animationSpeed, speed);
            });
        });
    });

    // Complex combinations
    describe("Advanced Combinations", () => {
        test("creates label with pointer and badge", () => {
            const result = LabelMeshFactory.create({
                text: "Complex Label",
                backgroundColor: "#4CAF50",
                pointer: {
                    direction: "top",
                    width: 25,
                    height: 15,
                },
                badge: {
                    type: "notification",
                    count: 3,
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.mesh.metadata.hasPointer);
            assert.isTrue(result.mesh.metadata.hasBadge);
            assert.equal(result.mesh.metadata.pointerDirection, "top");
            assert.equal(result.mesh.metadata.badgeType, "notification");
        });

        test("creates animated label with pointer", () => {
            const result = LabelMeshFactory.create({
                text: "Animated Pointer",
                backgroundColor: "#FF5722",
                pointer: {
                    direction: "left",
                    width: 20,
                    height: 12,
                    curve: true,
                },
                animation: {
                    type: "bounce",
                    speed: 2,
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.mesh.metadata.hasPointer);
            assert.isTrue(result.mesh.metadata.hasAnimation);
            assert.isTrue(result.mesh.metadata.pointerCurve);
        });

        test("creates badge with animation", () => {
            const result = LabelMeshFactory.create({
                text: "Animated Badge",
                badge: {
                    type: "progress",
                    progress: 0.6,
                },
                animation: {
                    type: "pulse",
                    speed: 1.5,
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.isTrue(result.mesh.metadata.hasBadge);
            assert.isTrue(result.mesh.metadata.hasAnimation);
            assert.equal(result.mesh.metadata.badgeProgress, 0.6);
        });

        test("creates full-featured label with all advanced options", () => {
            const result = LabelMeshFactory.create({
                text: "Ultimate Label",
                font: "Arial",
                fontSize: 42,
                textColor: "#FFFFFF",
                backgroundColor: "#2196F3",
                backgroundPadding: 16,
                cornerRadius: 12,
                borders: [
                    {width: 2, color: "#1976D2", spacing: 0},
                    {width: 1, color: "#FFFFFF", spacing: 3},
                ],
                pointer: {
                    direction: "bottom",
                    width: 30,
                    height: 20,
                    curve: true,
                },
                badge: {
                    type: "notification",
                    count: 7,
                },
                animation: {
                    type: "fade",
                    speed: 1,
                },
                textOutline: {
                    color: "#0D47A1",
                    width: 1,
                },
                textShadow: {
                    color: "rgba(0,0,0,0.3)",
                    blur: 3,
                    offsetX: 2,
                    offsetY: 2,
                },
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.text, "Ultimate Label");
            assert.isTrue(result.mesh.metadata.hasPointer);
            assert.isTrue(result.mesh.metadata.hasBadge);
            assert.isTrue(result.mesh.metadata.hasAnimation);
            assert.equal((result.mesh.metadata.borders as unknown[]).length, 2);
            assert.equal(result.mesh.metadata.badgeCount, 7);
            assert.isTrue(result.mesh.metadata.pointerCurve);
        });
    });

    // Rich text parsing scenarios
    describe("Rich Text Content", () => {
        test("handles multi-line text", () => {
            const result = LabelMeshFactory.create({
                text: "Line 1\nLine 2\nLine 3",
                fontSize: 24,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.text, "Line 1\nLine 2\nLine 3");
        });

        test("handles special characters", () => {
            const result = LabelMeshFactory.create({
                text: "Special: @#$%^&*()[]{}|\\:\";'<>?,./",
                fontSize: 32,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.text, "Special: @#$%^&*()[]{}|\\:\";'<>?,./");
        });

        test("handles Unicode characters", () => {
            const result = LabelMeshFactory.create({
                text: "Unicode: 中文 العربية русский 🚀 ★ ♥",
                fontSize: 36,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.text, "Unicode: 中文 العربية русский 🚀 ★ ♥");
        });

        test("handles very long text content", () => {
            const longText = "This is a very long text content that should test the label system's ability to handle extensive text content with proper wrapping and dimension calculations. ".repeat(5);

            const result = LabelMeshFactory.create({
                text: longText,
                fontSize: 28,
                backgroundColor: "#F5F5F5",
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.text, longText);
            // Should calculate appropriate dimensions for long text
            assert.isAtLeast(result.mesh.metadata.contentWidth as number, 200);
        });
    });

    // Edge cases and error handling
    describe("Edge Cases", () => {
        test("handles zero font size gracefully", () => {
            const result = LabelMeshFactory.create({
                text: "Zero Size",
                fontSize: 0,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.fontSize, 0);
        });

        test("handles negative padding", () => {
            const result = LabelMeshFactory.create({
                text: "Negative Padding",
                backgroundPadding: -5,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal(result.mesh.metadata.backgroundPadding, -5);
        });

        test("handles empty badge configuration", () => {
            const result = LabelMeshFactory.create({
                text: "Empty Badge",
                badge: {},
            });

            assert.isTrue(result.validation.isValid);
            // Should handle empty badge config gracefully
        });

        test("handles invalid color formats", () => {
            const result = LabelMeshFactory.create({
                text: "Invalid Color",
                textColor: "not-a-color",
                backgroundColor: "also-invalid",
            });

            assert.isTrue(result.validation.isValid);
            // Should handle invalid colors gracefully
        });
    });

    // Performance and optimization scenarios
    describe("Performance Scenarios", () => {
        test("handles large number of borders efficiently", () => {
            const manyBorders = Array.from({length: 10}, (_, i) => ({
                width: 1,
                color: `#${(i * 25).toString(16).padStart(2, "0")}0000`,
                spacing: 1,
            }));

            const result = LabelMeshFactory.create({
                text: "Many Borders",
                borders: manyBorders,
            });

            assert.isTrue(result.validation.isValid);
            assert.equal((result.mesh.metadata.borders as unknown[]).length, 10);
        });

        test("handles maximum texture size scenarios", () => {
            const result = LabelMeshFactory.create({
                text: "Very Large Text Content ".repeat(50),
                fontSize: 72,
                backgroundPadding: 50,
            });

            assert.isTrue(result.validation.isValid);
            // Should handle large texture requirements
            assert.isDefined(result.mesh.metadata.textureWidth);
            assert.isDefined(result.mesh.metadata.textureHeight);
        });
    });
});
