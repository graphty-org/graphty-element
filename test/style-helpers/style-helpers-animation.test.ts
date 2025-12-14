import {assert, describe, it} from "vitest";

import * as animation from "../../src/utils/styleHelpers/animation";

describe("Animation Helpers", () => {
    describe("Easing Functions", () => {
        describe("linear", () => {
            it("returns same value as input", () => {
                assert.strictEqual(animation.linear(0), 0);
                assert.strictEqual(animation.linear(0.5), 0.5);
                assert.strictEqual(animation.linear(1), 1);
            });
        });

        describe("easeIn", () => {
            it("starts slow and ends fast", () => {
                assert.strictEqual(animation.easeIn(0), 0);
                assert.strictEqual(animation.easeIn(1), 1);
                // At 0.5, quadratic ease-in should be 0.25
                assert.strictEqual(animation.easeIn(0.5), 0.25);
            });
        });

        describe("easeOut", () => {
            it("starts fast and ends slow", () => {
                assert.strictEqual(animation.easeOut(0), 0);
                assert.strictEqual(animation.easeOut(1), 1);
                // At 0.5, ease-out should be 0.75
                assert.strictEqual(animation.easeOut(0.5), 0.75);
            });
        });

        describe("easeInOut", () => {
            it("eases both start and end", () => {
                assert.strictEqual(animation.easeInOut(0), 0);
                assert.strictEqual(animation.easeInOut(1), 1);
                assert.strictEqual(animation.easeInOut(0.5), 0.5);
            });

            it("accelerates in first half", () => {
                const at25 = animation.easeInOut(0.25);
                assert.isBelow(at25, 0.25);
            });

            it("decelerates in second half", () => {
                const at75 = animation.easeInOut(0.75);
                assert.isAbove(at75, 0.75);
            });
        });

        describe("cubic easing", () => {
            it("easeInCubic is slower than easeIn", () => {
                const quadratic = animation.easeIn(0.5);
                const cubic = animation.easeInCubic(0.5);
                assert.isBelow(cubic, quadratic);
            });

            it("easeOutCubic returns correct values", () => {
                assert.strictEqual(animation.easeOutCubic(0), 0);
                assert.strictEqual(animation.easeOutCubic(1), 1);
            });

            it("easeInOutCubic is symmetric", () => {
                assert.strictEqual(animation.easeInOutCubic(0.5), 0.5);
            });
        });

        describe("easeOutElastic", () => {
            it("returns 0 at start and 1 at end", () => {
                assert.strictEqual(animation.easeOutElastic(0), 0);
                assert.strictEqual(animation.easeOutElastic(1), 1);
            });

            it("overshoots 1.0 during animation", () => {
                // Elastic should overshoot at some point
                let hasOvershoot = false;
                for (let t = 0.1; t < 1; t += 0.1) {
                    if (animation.easeOutElastic(t) > 1.0) {
                        hasOvershoot = true;
                        break;
                    }
                }
                assert.isTrue(hasOvershoot, "Elastic easing should overshoot");
            });
        });

        describe("easeOutBounce", () => {
            it("returns 0 at start and 1 at end", () => {
                assert.approximately(animation.easeOutBounce(0), 0, 0.01);
                assert.approximately(animation.easeOutBounce(1), 1, 0.01);
            });

            it("bounces (non-monotonic)", () => {
                const values: number[] = [];
                for (let t = 0; t <= 1; t += 0.1) {
                    values.push(animation.easeOutBounce(t));
                }
                // Check that it's not strictly increasing (has bounces)
                let hasDecrease = false;
                for (let i = 1; i < values.length; i++) {
                    if (values[i] < values[i - 1]) {
                        hasDecrease = true;
                        break;
                    }
                }
                assert.isTrue(hasDecrease, "Bounce easing should have decreases");
            });
        });
    });

    describe("interpolate", () => {
        it("interpolates linearly by default", () => {
            assert.strictEqual(animation.interpolate(0, 10, 0), 0);
            assert.strictEqual(animation.interpolate(0, 10, 0.5), 5);
            assert.strictEqual(animation.interpolate(0, 10, 1), 10);
        });

        it("works with negative values", () => {
            assert.strictEqual(animation.interpolate(-10, 10, 0.5), 0);
        });

        it("applies easing function", () => {
            const result = animation.interpolate(0, 10, 0.5, animation.easeIn);
            assert.strictEqual(result, 2.5); // easeIn(0.5) = 0.25, so 0 + 10 * 0.25 = 2.5
        });

        it("clamps progress to [0, 1]", () => {
            assert.strictEqual(animation.interpolate(0, 10, -0.5), 0);
            assert.strictEqual(animation.interpolate(0, 10, 1.5), 10);
        });

        it("works with custom easing", () => {
            const customEasing = (t: number): number => t * t * t;
            const result = animation.interpolate(0, 8, 0.5, customEasing);
            assert.strictEqual(result, 1); // 0.5^3 = 0.125, so 0 + 8 * 0.125 = 1
        });
    });

    describe("stepped", () => {
        it("returns first value at start", () => {
            const values = ["a", "b", "c"];
            assert.strictEqual(animation.stepped(values, 0), "a");
        });

        it("returns last value at end", () => {
            const values = ["a", "b", "c"];
            assert.strictEqual(animation.stepped(values, 1), "c");
        });

        it("steps through values", () => {
            const values = ["a", "b", "c"];
            assert.strictEqual(animation.stepped(values, 0.1), "a");
            assert.strictEqual(animation.stepped(values, 0.4), "b");
            assert.strictEqual(animation.stepped(values, 0.7), "c");
        });

        it("works with numeric values", () => {
            const values = [1, 2, 3, 4, 5];
            assert.strictEqual(animation.stepped(values, 0.5), 3);
        });

        it("applies easing", () => {
            const values = ["a", "b", "c"];
            const result = animation.stepped(values, 0.5, animation.easeIn);
            // easeIn(0.5) = 0.25, which should map to index 0
            assert.strictEqual(result, "a");
        });
    });

    describe("pulse", () => {
        it("starts at 0", () => {
            assert.approximately(animation.pulse(0), 0, 0.01);
        });

        it("ends at 0", () => {
            assert.approximately(animation.pulse(1), 0, 0.01);
        });

        it("peaks at 1 in the middle", () => {
            assert.approximately(animation.pulse(0.5), 1, 0.01);
        });

        it("is always between 0 and 1", () => {
            for (let t = 0; t <= 1; t += 0.1) {
                const value = animation.pulse(t);
                assert.isAtLeast(value, 0);
                assert.isAtMost(value, 1);
            }
        });

        it("supports multiple pulses per cycle", () => {
            // With frequency 2, should peak twice
            assert.approximately(animation.pulse(0.25, 2), 1, 0.01);
            assert.approximately(animation.pulse(0.75, 2), 1, 0.01);
        });
    });

    describe("wave", () => {
        it("oscillates smoothly", () => {
            const value1 = animation.wave(0.25);
            const value2 = animation.wave(0.75);
            assert.isAbove(value1, 0);
            assert.isBelow(value2, 1);
        });

        it("respects amplitude", () => {
            const fullAmplitude = animation.wave(0.25, 1, 1, 0.5);
            const halfAmplitude = animation.wave(0.25, 1, 0.5, 0.5);
            assert.isAbove(Math.abs(fullAmplitude - 0.5), Math.abs(halfAmplitude - 0.5));
        });

        it("respects offset", () => {
            const highOffset = animation.wave(0, 1, 0, 0.8);
            const lowOffset = animation.wave(0, 1, 0, 0.2);
            assert.approximately(highOffset, 0.8, 0.01);
            assert.approximately(lowOffset, 0.2, 0.01);
        });

        it("supports multiple waves per cycle", () => {
            const value1 = animation.wave(0, 2, 1, 0.5);
            const value2 = animation.wave(0.5, 2, 1, 0.5);
            // Should complete one full cycle by 0.5
            assert.approximately(value1, value2, 0.01);
        });
    });

    describe("delayedStart", () => {
        it("returns 0 before delay", () => {
            assert.strictEqual(animation.delayedStart(0.3, 0.5), 0);
        });

        it("starts after delay", () => {
            const result = animation.delayedStart(0.6, 0.5);
            assert.isAbove(result, 0);
        });

        it("reaches 1 at end", () => {
            assert.strictEqual(animation.delayedStart(1, 0.5), 1);
        });

        it("applies easing after delay", () => {
            const linear = animation.delayedStart(0.75, 0.5, animation.linear);
            const easeIn = animation.delayedStart(0.75, 0.5, animation.easeIn);
            assert.isBelow(easeIn, linear);
        });
    });

    describe("stagger", () => {
        it("first element starts immediately", () => {
            const result = animation.stagger(0.1, 0, 10, 0.1);
            assert.isAbove(result, 0);
        });

        it("later elements have delayed start", () => {
            const first = animation.stagger(0.1, 0, 10, 0.1);
            const second = animation.stagger(0.1, 1, 10, 0.1);
            assert.isAbove(first, second);
        });

        it("all elements reach 1 at end", () => {
            const first = animation.stagger(1, 0, 10, 0.1);
            const last = animation.stagger(1, 9, 10, 0.1);
            assert.strictEqual(first, 1);
            assert.strictEqual(last, 1);
        });

        it("handles single element", () => {
            const result = animation.stagger(0.5, 0, 1, 0.1);
            assert.approximately(result, 0.5, 0.01);
        });

        it("applies easing", () => {
            const result = animation.stagger(0.6, 0, 10, 0.1, animation.easeOut);
            assert.isAbove(result, 0);
        });
    });

    describe("spring", () => {
        it("starts at 0 and ends at 1", () => {
            assert.approximately(animation.spring(0), 0, 0.01);
            assert.approximately(animation.spring(1), 1, 0.01);
        });

        it("overshoots with low damping", () => {
            let hasOvershoot = false;
            for (let t = 0.1; t < 1; t += 0.05) {
                if (animation.spring(t, 200, 10) > 1.0) {
                    hasOvershoot = true;
                    break;
                }
            }
            assert.isTrue(hasOvershoot, "Spring with low damping should overshoot");
        });

        it("does not overshoot with high damping", () => {
            let hasOvershoot = false;
            for (let t = 0; t <= 1; t += 0.05) {
                if (animation.spring(t, 170, 100) > 1.0) {
                    hasOvershoot = true;
                    break;
                }
            }
            assert.isFalse(hasOvershoot, "Spring with high damping should not overshoot");
        });

        it("clamps input to [0, 1]", () => {
            assert.approximately(animation.spring(-0.5), 0, 0.01);
        });
    });

    describe("Integration tests", () => {
        it("can combine interpolate with easing", () => {
            const size = animation.interpolate(1, 5, 0.5, animation.easeInOut);
            assert.strictEqual(size, 3); // At 0.5, easeInOut returns 0.5
        });

        it("can create pulsing opacity", () => {
            const opacity = animation.pulse(0.5);
            assert.approximately(opacity, 1, 0.01);
        });

        it("can create staggered animations", () => {
            const progress = 0.5;
            const sizes = [];
            for (let i = 0; i < 5; i++) {
                const nodeProgress = animation.stagger(progress, i, 5, 0.1, animation.easeOut);
                sizes.push(animation.interpolate(1, 5, nodeProgress));
            }
            // Earlier elements should be larger (more progressed)
            assert.isAbove(sizes[0], sizes[4]);
        });
    });
});
