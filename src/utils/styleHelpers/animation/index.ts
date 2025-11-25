/**
 * Animation helpers for smooth transitions and animated visual changes
 *
 * These helpers provide easing functions and interpolation utilities
 * for creating smooth visual transitions.
 */

/**
 * Easing function type
 */
export type EasingFunction = (t: number) => number;

/**
 * Linear easing (no acceleration)
 * @param t - Time value (0-1)
 * @returns Eased value (0-1)
 */
export function linear(t: number): number {
    return t;
}

/**
 * Ease-in (quadratic) - slow start, fast end
 * @param t - Time value (0-1)
 * @returns Eased value (0-1)
 */
export function easeIn(t: number): number {
    return t * t;
}

/**
 * Ease-out (quadratic) - fast start, slow end
 * @param t - Time value (0-1)
 * @returns Eased value (0-1)
 */
export function easeOut(t: number): number {
    return t * (2 - t);
}

/**
 * Ease-in-out (quadratic) - slow start and end
 * @param t - Time value (0-1)
 * @returns Eased value (0-1)
 */
export function easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + ((4 - (2 * t)) * t);
}

/**
 * Ease-in (cubic) - very slow start
 * @param t - Time value (0-1)
 * @returns Eased value (0-1)
 */
export function easeInCubic(t: number): number {
    return t * t * t;
}

/**
 * Ease-out (cubic) - very slow end
 * @param t - Time value (0-1)
 * @returns Eased value (0-1)
 */
export function easeOutCubic(t: number): number {
    const t1 = t - 1;
    return ((t1 * t1) * t1) + 1;
}

/**
 * Ease-in-out (cubic) - very slow start and end
 * @param t - Time value (0-1)
 * @returns Eased value (0-1)
 */
export function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (((t - 1) * ((2 * t) - 2)) * ((2 * t) - 2)) + 1;
}

/**
 * Elastic ease-out - bouncy overshoot effect
 * @param t - Time value (0-1)
 * @returns Eased value (may exceed 1.0 temporarily)
 */
export function easeOutElastic(t: number): number {
    if (t === 0 || t === 1) {
        return t;
    }

    const p = 0.3;
    const s = p / 4;
    return (Math.pow(2, -10 * t) * Math.sin((((t - s) * (2 * Math.PI)) / p))) + 1;
}

/**
 * Bounce ease-out - bouncing ball effect
 * @param t - Time value (0-1)
 * @returns Eased value (0-1)
 */
export function easeOutBounce(t: number): number {
    if (t < (1 / 2.75)) {
        return 7.5625 * t * t;
    } else if (t < (2 / 2.75)) {
        const t2 = t - (1.5 / 2.75);
        return (7.5625 * t2 * t2) + 0.75;
    } else if (t < (2.5 / 2.75)) {
        const t2 = t - (2.25 / 2.75);
        return (7.5625 * t2 * t2) + 0.9375;
    }

    const t2 = t - (2.625 / 2.75);
    return (7.5625 * t2 * t2) + 0.984375;
}

/**
 * Interpolate between two numeric values with easing
 *
 * @param from - Start value
 * @param to - End value
 * @param progress - Progress (0-1)
 * @param easing - Easing function (default: linear)
 * @returns Interpolated value
 *
 * @example
 * // Smooth size transition from 1 to 5
 * interpolate(1, 5, 0.5, easeInOut) // → 3
 */
export function interpolate(
    from: number,
    to: number,
    progress: number,
    easing: EasingFunction = linear,
): number {
    const t = Math.max(0, Math.min(1, progress)); // Clamp to [0, 1]
    const easedProgress = easing(t);
    return from + ((to - from) * easedProgress);
}

/**
 * Create a stepped animation that cycles through discrete values
 *
 * @param values - Array of values to cycle through
 * @param progress - Progress (0-1)
 * @param easing - Easing function (default: linear)
 * @returns Current value from the array
 *
 * @example
 * // Cycle through colors
 * const colors = ["#FF0000", "#00FF00", "#0000FF"];
 * stepped(colors, 0.33, linear) // → "#00FF00"
 */
export function stepped<T>(values: T[], progress: number, easing: EasingFunction = linear): T {
    const t = Math.max(0, Math.min(1, progress));
    const easedProgress = easing(t);
    const index = Math.floor(easedProgress * values.length);
    return values[Math.min(index, values.length - 1)];
}

/**
 * Pulse animation - oscillates between 0 and 1
 *
 * @param progress - Progress (0-1 repeats infinitely)
 * @param frequency - Number of pulses per cycle (default: 1)
 * @returns Value oscillating between 0 and 1
 *
 * @example
 * // Pulsing opacity (0 → 1 → 0)
 * pulse(0.5) // → 1.0 (at peak)
 * pulse(0.0) // → 0.0 (at start)
 * pulse(1.0) // → 0.0 (at end)
 */
export function pulse(progress: number, frequency = 1): number {
    const angle = (progress * frequency) % 1;
    return Math.sin(angle * Math.PI);
}

/**
 * Wave animation - smooth oscillation
 *
 * @param progress - Progress (0-1 repeats infinitely)
 * @param frequency - Number of waves per cycle (default: 1)
 * @param amplitude - Wave amplitude 0-1 (default: 1)
 * @param offset - Vertical offset 0-1 (default: 0.5)
 * @returns Oscillating value
 *
 * @example
 * // Gentle size oscillation between 0.5 and 1.5
 * const size = 1 + wave(time, 1, 0.5, 0);
 */
export function wave(
    progress: number,
    frequency = 1,
    amplitude = 1,
    offset = 0.5,
): number {
    const angle = (progress * frequency) % 1;
    return offset + (amplitude * Math.sin(angle * 2 * Math.PI));
}

/**
 * Delayed start - begins after a delay
 *
 * @param progress - Progress (0-1)
 * @param delay - Delay before starting (0-1)
 * @param easing - Easing function (default: linear)
 * @returns Delayed progress value (0-1)
 *
 * @example
 * // Start animation halfway through
 * delayedStart(0.6, 0.5, easeOut) // → ~0.2 (adjusted for delay)
 */
export function delayedStart(
    progress: number,
    delay: number,
    easing: EasingFunction = linear,
): number {
    if (progress < delay) {
        return 0;
    }

    const adjustedProgress = (progress - delay) / (1 - delay);
    return easing(adjustedProgress);
}

/**
 * Stagger - offset animation for multiple elements
 *
 * @param progress - Global progress (0-1)
 * @param elementIndex - Index of this element
 * @param totalElements - Total number of elements
 * @param staggerDelay - Delay between elements (0-1, default: 0.1)
 * @param easing - Easing function (default: linear)
 * @returns Per-element progress (0-1)
 *
 * @example
 * // Animate 10 nodes with slight delay between each
 * for (let i = 0; i < 10; i++) {
 *   const nodeProgress = stagger(globalTime, i, 10, 0.05);
 *   node.size = interpolate(1, 5, nodeProgress, easeOut);
 * }
 */
export function stagger(
    progress: number,
    elementIndex: number,
    totalElements: number,
    staggerDelay = 0.1,
    easing: EasingFunction = linear,
): number {
    const delay = (elementIndex / Math.max(1, (totalElements - 1))) * staggerDelay;
    return delayedStart(progress, delay, easing);
}

/**
 * Spring animation - damped oscillation
 *
 * @param progress - Progress (0-1)
 * @param stiffness - Spring stiffness (default: 170)
 * @param damping - Damping coefficient (default: 26)
 * @returns Spring-eased value (may overshoot 1.0)
 *
 * @example
 * // Bouncy entrance animation
 * const size = interpolate(0, 5, spring(progress, 200, 20));
 */
export function spring(progress: number, stiffness = 170, damping = 26): number {
    const t = Math.max(0, Math.min(1, progress));
    const w = Math.sqrt(stiffness);
    const zeta = damping / (2 * Math.sqrt(stiffness));

    if (zeta < 1) {
        // Underdamped
        const wd = w * Math.sqrt(1 - (zeta * zeta));
        return 1 - (Math.exp((-zeta * w) * t) * Math.cos(wd * t));
    }

    // Critically damped or overdamped
    return 1 - Math.exp((-w) * t);
}
