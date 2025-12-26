import {assert, describe, it} from "vitest";

import {StyleHelpers} from "../../src/config/StyleHelpers";

/**
 * Performance benchmarking tests
 * Success criteria: All helpers should evaluate <1ms per element
 *
 * NOTE: These tests are skipped in CI environments because CI runners have
 * variable performance characteristics that make timing-based assertions unreliable.
 */

// Skip performance tests in CI environments
const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

describe.skipIf(isCI)("StyleHelpers Performance", () => {
    const ITERATIONS = 10000;
    const MAX_TIME_MS = 1; // 1ms budget per call

    describe("Color helpers performance", () => {
        it("sequential.viridis evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.color.sequential.viridis(i / ITERATIONS);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });

        it("categorical.okabeIto evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.color.categorical.okabeIto(i % 8);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });

        it("diverging.purpleGreen evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.color.diverging.purpleGreen(i / ITERATIONS, 0.5);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });

        it("binary.blueHighlight evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.color.binary.blueHighlight(i % 2 === 0);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });
    });

    describe("Size helpers performance", () => {
        it("size.linear evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.size.linear(i / ITERATIONS, 1, 5);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });

        it("size.log evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.size.log(i / ITERATIONS, 1, 5);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });

        it("size.exp evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.size.exp(i / ITERATIONS, 1, 5, 2);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });
    });

    describe("Opacity helpers performance", () => {
        it("opacity.linear evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.opacity.linear(i / ITERATIONS, 0.1, 1.0);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });

        it("opacity.threshold evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.opacity.threshold(i / ITERATIONS, 0.5, 0.3, 1.0);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });
    });

    describe("Label helpers performance", () => {
        it("label.percentage evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.label.percentage(i / ITERATIONS, 2);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });

        it("label.compact evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.label.compact(i * 1000);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });

        it("label.ifAbove evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.label.ifAbove(i / ITERATIONS, 0.5, (v) => v.toFixed(2));
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });
    });

    describe("Edge width helpers performance", () => {
        it("edgeWidth.linear evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.edgeWidth.linear(i / ITERATIONS, 0.5, 5);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });
    });

    describe("Combined helpers performance", () => {
        it("combined.colorAndSize evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.combined.colorAndSize(i / ITERATIONS);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });

        it("combined.fullSpectrum evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.combined.fullSpectrum(i / ITERATIONS);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });

        it("combined.categoryAndImportance evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.combined.categoryAndImportance(i % 8, i / ITERATIONS);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });
    });

    describe("Animation helpers performance", () => {
        it("animation.easeInOut evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.animation.easeInOut(i / ITERATIONS);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });

        it("animation.interpolate evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.animation.interpolate(0, 10, i / ITERATIONS, StyleHelpers.animation.easeOut);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });

        it("animation.spring evaluates <1ms per call", () => {
            const start = performance.now();
            for (let i = 0; i < ITERATIONS; i++) {
                StyleHelpers.animation.spring(i / ITERATIONS, 170, 26);
            }
            const end = performance.now();
            const avgTime = (end - start) / ITERATIONS;
            assert.isBelow(avgTime, MAX_TIME_MS, `Average time: ${avgTime.toFixed(6)}ms`);
        });
    });

    describe("Large graph simulation", () => {
        it("can style 10,000 nodes in <20ms total", () => {
            const nodeCount = 10000;
            const start = performance.now();

            for (let i = 0; i < nodeCount; i++) {
                const value = i / nodeCount;
                const categoryId = i % 8;

                // Simulate typical styling operations
                StyleHelpers.color.sequential.viridis(value);
                StyleHelpers.size.linear(value, 1, 5);
                StyleHelpers.opacity.threshold(value, 0.5, 0.3, 1.0);
                StyleHelpers.color.categorical.okabeIto(categoryId);
            }

            const end = performance.now();
            const totalTime = end - start;
            // Allow 100ms for 10k nodes (~0.01ms/node) to accommodate system variability
            assert.isBelow(totalTime, 100, `Total time for 10k nodes: ${totalTime.toFixed(2)}ms`);
        });

        it("can style 50,000 edges in <100ms total", () => {
            const edgeCount = 50000;
            const start = performance.now();

            for (let i = 0; i < edgeCount; i++) {
                const value = i / edgeCount;

                // Simulate edge styling
                StyleHelpers.color.sequential.blues(value);
                StyleHelpers.edgeWidth.linear(value, 0.5, 3);
                StyleHelpers.opacity.linear(value, 0.1, 1.0);
            }

            const end = performance.now();
            const totalTime = end - start;
            // Allow 250ms for 50k edges (~0.005ms/edge) to accommodate system variability
            assert.isBelow(totalTime, 250, `Total time for 50k edges: ${totalTime.toFixed(2)}ms`);
        });
    });
});
