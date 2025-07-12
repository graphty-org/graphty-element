import {assert, beforeEach, describe, test, vi} from "vitest";

import {type ContentArea, type PointerOptions, PointerRenderer} from "../src/meshes/PointerRenderer";

describe("PointerRenderer", () => {
    let renderer: PointerRenderer;
    let mockCtx: CanvasRenderingContext2D;
    let canvasCommands: string[];

    beforeEach(() => {
        renderer = new PointerRenderer();
        canvasCommands = [];

        // Mock Canvas 2D context to track drawing commands
        mockCtx = {
            moveTo: vi.fn((x: number, y: number) => {
                canvasCommands.push(`moveTo(${x}, ${y})`);
            }),
            lineTo: vi.fn((x: number, y: number) => {
                canvasCommands.push(`lineTo(${x}, ${y})`);
            }),
            quadraticCurveTo: vi.fn((cpx: number, cpy: number, x: number, y: number) => {
                canvasCommands.push(`quadraticCurveTo(${cpx}, ${cpy}, ${x}, ${y})`);
            }),
        } as unknown as CanvasRenderingContext2D;
    });

    describe("Speech Bubble Path Creation", () => {
        const contentArea: ContentArea = {
            x: 10,
            y: 10,
            width: 100,
            height: 50,
        };

        const defaultPointerOptions: PointerOptions = {
            width: 20,
            height: 10,
            offset: 0,
            direction: "bottom",
            curved: false,
        };

        test("creates bottom pointer correctly", () => {
            renderer.createSpeechBubblePath(mockCtx, contentArea, 5, defaultPointerOptions);

            // Should start with moveTo for top-left corner
            assert.include(canvasCommands[0], "moveTo(15, 10)"); // contentX + radius, contentY

            // Should include pointer drawing commands
            assert.isTrue(canvasCommands.some((cmd) => cmd.includes("lineTo(60, 70)"))); // pointer tip
            assert.isTrue(canvasCommands.length > 10); // Should have many drawing commands
        });

        test("creates top pointer correctly", () => {
            const topPointerOptions: PointerOptions = {
                ... defaultPointerOptions,
                direction: "top",
            };

            renderer.createSpeechBubblePath(mockCtx, contentArea, 5, topPointerOptions);

            // Should include pointer going upward
            assert.isTrue(canvasCommands.some((cmd) => cmd.includes("lineTo(60, 0)"))); // pointer tip above content
            assert.isTrue(canvasCommands.length > 10);
        });

        test("creates left pointer correctly", () => {
            const leftPointerOptions: PointerOptions = {
                ... defaultPointerOptions,
                direction: "left",
            };

            renderer.createSpeechBubblePath(mockCtx, contentArea, 5, leftPointerOptions);

            // Should include pointer going left
            assert.isTrue(canvasCommands.some((cmd) => cmd.includes("lineTo(0, 35)"))); // pointer tip to the left
            assert.isTrue(canvasCommands.length > 10);
        });

        test("creates right pointer correctly", () => {
            const rightPointerOptions: PointerOptions = {
                ... defaultPointerOptions,
                direction: "right",
            };

            renderer.createSpeechBubblePath(mockCtx, contentArea, 5, rightPointerOptions);

            // Should include pointer going right
            assert.isTrue(canvasCommands.some((cmd) => cmd.includes("lineTo(120, 35)"))); // pointer tip to the right
            assert.isTrue(canvasCommands.length > 10);
        });

        test("defaults to bottom pointer for unknown direction", () => {
            const autoPointerOptions: PointerOptions = {
                ... defaultPointerOptions,
                direction: "auto",
            };

            renderer.createSpeechBubblePath(mockCtx, contentArea, 5, autoPointerOptions);

            // Should behave like bottom pointer
            assert.include(canvasCommands[0], "moveTo(15, 10)");
            assert.isTrue(canvasCommands.some((cmd) => cmd.includes("lineTo(60, 70)")));
        });

        test("applies pointer offset correctly", () => {
            const offsetPointerOptions: PointerOptions = {
                ... defaultPointerOptions,
                offset: 20, // Shift pointer 20 pixels to the right
            };

            renderer.createSpeechBubblePath(mockCtx, contentArea, 5, offsetPointerOptions);

            // Pointer should be offset from center (60) by 20 pixels (to 80)
            assert.isTrue(canvasCommands.some((cmd) => cmd.includes("lineTo(80, 70)")));
        });

        test("creates curved pointer when curved option is true", () => {
            const curvedPointerOptions: PointerOptions = {
                ... defaultPointerOptions,
                curved: true,
            };

            renderer.createSpeechBubblePath(mockCtx, contentArea, 5, curvedPointerOptions);

            // Should use quadraticCurveTo for pointer
            assert.isTrue(canvasCommands.some((cmd) => cmd.includes("quadraticCurveTo")));
        });

        test("creates straight pointer when curved option is false", () => {
            const straightPointerOptions: PointerOptions = {
                ... defaultPointerOptions,
                curved: false,
            };

            renderer.createSpeechBubblePath(mockCtx, contentArea, 5, straightPointerOptions);

            // Count quadraticCurveTo calls - should be 4 for corners only, not pointer
            const curveCommands = canvasCommands.filter((cmd) => cmd.includes("quadraticCurveTo"));
            assert.equal(curveCommands.length, 4); // Only corner curves
        });

        test("handles different pointer sizes", () => {
            const largePointerOptions: PointerOptions = {
                ... defaultPointerOptions,
                width: 40,
                height: 20,
            };

            renderer.createSpeechBubblePath(mockCtx, contentArea, 5, largePointerOptions);

            // Should create larger pointer
            assert.isTrue(canvasCommands.some((cmd) => cmd.includes("lineTo(60, 80)"))); // height 20 instead of 10
            assert.isTrue(canvasCommands.some((cmd) => cmd.includes("lineTo(80, 60)"))); // width 40/2 = 20 from center
        });

        test("respects content boundaries with large pointer", () => {
            const largePointerOptions: PointerOptions = {
                ... defaultPointerOptions,
                width: 200, // Wider than content
                offset: -80, // Far left offset
            };

            renderer.createSpeechBubblePath(mockCtx, contentArea, 5, largePointerOptions);

            // Pointer should be clamped to content boundaries
            assert.isTrue(canvasCommands.some((cmd) => cmd.includes("lineTo(15, 60)"))); // Clamped to contentX + radius
        });
    });

    describe("Speech Bubble Path CCW (Counter-Clockwise)", () => {
        const contentArea: ContentArea = {
            x: 20,
            y: 20,
            width: 80,
            height: 40,
        };

        const defaultPointerOptions: PointerOptions = {
            width: 16,
            height: 8,
            offset: 0,
            direction: "bottom",
            curved: false,
        };

        test("creates CCW path correctly", () => {
            renderer.createSpeechBubblePathCCW(mockCtx, contentArea, 5, defaultPointerOptions);

            // CCW should start differently from CW
            assert.include(canvasCommands[0], "lineTo(20, 25)"); // Should start with lineTo, not moveTo
            assert.isTrue(canvasCommands.length > 10);
        });

        test("creates all directions in CCW", () => {
            const directions: PointerOptions["direction"][] = ["top", "bottom", "left", "right"];

            for (const direction of directions) {
                canvasCommands = []; // Reset for each test
                const options: PointerOptions = {
                    ... defaultPointerOptions,
                    direction,
                };

                renderer.createSpeechBubblePathCCW(mockCtx, contentArea, 5, options);

                assert.isTrue(canvasCommands.length > 5, `${direction} direction should create path commands`);
            }
        });

        test("handles curved CCW pointer", () => {
            const curvedOptions: PointerOptions = {
                ... defaultPointerOptions,
                curved: true,
                direction: "top",
            };

            renderer.createSpeechBubblePathCCW(mockCtx, contentArea, 5, curvedOptions);

            // Should include quadratic curves for both corners and pointer
            const curveCommands = canvasCommands.filter((cmd) => cmd.includes("quadraticCurveTo"));
            assert.isTrue(curveCommands.length >= 4); // At least 4 corner curves
        });
    });

    describe("Edge Cases and Error Handling", () => {
        test("handles zero radius", () => {
            const contentArea: ContentArea = {x: 0, y: 0, width: 50, height: 50};
            const options: PointerOptions = {
                width: 10,
                height: 5,
                offset: 0,
                direction: "bottom",
                curved: false,
            };

            renderer.createSpeechBubblePath(mockCtx, contentArea, 0, options);

            // Should still create a path without errors
            assert.isTrue(canvasCommands.length > 0);
        });

        test("handles very small content area", () => {
            const smallContentArea: ContentArea = {x: 0, y: 0, width: 5, height: 5};
            const options: PointerOptions = {
                width: 10,
                height: 5,
                offset: 0,
                direction: "bottom",
                curved: false,
            };

            renderer.createSpeechBubblePath(mockCtx, smallContentArea, 2, options);

            // Should handle small content without errors
            assert.isTrue(canvasCommands.length > 0);
        });

        test("handles negative offset", () => {
            const contentArea: ContentArea = {x: 10, y: 10, width: 100, height: 50};
            const options: PointerOptions = {
                width: 20,
                height: 10,
                offset: -30,
                direction: "bottom",
                curved: false,
            };

            renderer.createSpeechBubblePath(mockCtx, contentArea, 5, options);

            // Should handle negative offset without errors
            assert.isTrue(canvasCommands.length > 0);
        });

        test("handles zero pointer dimensions", () => {
            const contentArea: ContentArea = {x: 10, y: 10, width: 100, height: 50};
            const options: PointerOptions = {
                width: 0,
                height: 0,
                offset: 0,
                direction: "bottom",
                curved: false,
            };

            renderer.createSpeechBubblePath(mockCtx, contentArea, 5, options);

            // Should create path even with zero pointer dimensions
            assert.isTrue(canvasCommands.length > 0);
        });
    });

    describe("Canvas Context Integration", () => {
        test("calls correct canvas methods", () => {
            const contentArea: ContentArea = {x: 0, y: 0, width: 50, height: 30};
            const options: PointerOptions = {
                width: 10,
                height: 5,
                offset: 0,
                direction: "bottom",
                curved: true,
            };

            renderer.createSpeechBubblePath(mockCtx, contentArea, 3, options);

            // Verify correct methods were called
            assert.isTrue((mockCtx.moveTo as ReturnType<typeof vi.fn>).mock.calls.length >= 1);
            assert.isTrue((mockCtx.lineTo as ReturnType<typeof vi.fn>).mock.calls.length >= 1);
            assert.isTrue((mockCtx.quadraticCurveTo as ReturnType<typeof vi.fn>).mock.calls.length >= 1);
        });

        test("does not call invalid canvas methods", () => {
            const contentArea: ContentArea = {x: 0, y: 0, width: 50, height: 30};
            const options: PointerOptions = {
                width: 10,
                height: 5,
                offset: 0,
                direction: "bottom",
                curved: false,
            };

            // Add a spy for an invalid method to ensure it's not called
            const invalidMethod = vi.fn();
            (mockCtx as unknown as Record<string, unknown>).invalidMethod = invalidMethod;

            renderer.createSpeechBubblePath(mockCtx, contentArea, 3, options);

            assert.equal(invalidMethod.mock.calls.length, 0);
        });
    });

    describe("Pointer Position Calculations", () => {
        test("calculates center position correctly for bottom pointer", () => {
            const contentArea: ContentArea = {x: 50, y: 50, width: 100, height: 60};
            const options: PointerOptions = {
                width: 20,
                height: 10,
                offset: 15, // Offset from center
                direction: "bottom",
                curved: false,
            };

            renderer.createSpeechBubblePath(mockCtx, contentArea, 5, options);

            // Center should be at contentX + contentWidth/2 + offset = 50 + 50 + 15 = 115
            assert.isTrue(canvasCommands.some((cmd) => cmd.includes("lineTo(115, 120)"))); // pointer tip
        });

        test("calculates center position correctly for top pointer", () => {
            const contentArea: ContentArea = {x: 30, y: 40, width: 80, height: 50};
            const options: PointerOptions = {
                width: 16,
                height: 8,
                offset: -10, // Negative offset
                direction: "top",
                curved: false,
            };

            renderer.createSpeechBubblePath(mockCtx, contentArea, 4, options);

            // Center should be at contentX + contentWidth/2 + offset = 30 + 40 + (-10) = 60
            assert.isTrue(canvasCommands.some((cmd) => cmd.includes("lineTo(60, 32)"))); // pointer tip
        });
    });
});
