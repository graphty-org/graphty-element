/**
 * Shared input utility functions for camera controllers.
 * Used by both 3D (OrbitInputController) and XR (XRInputHandler).
 */

/**
 * Apply deadzone to thumbstick/joystick input to prevent drift.
 * Remaps values from [threshold, 1] to [0, 1] for smooth start.
 * Also applies quadratic curve for smooth acceleration.
 *
 * @param value - Raw input value (-1 to 1)
 * @param threshold - Deadzone threshold (default 0.15)
 * @returns Adjusted value with deadzone and curve applied
 */
export function applyDeadzone(value: number, threshold = 0.15): number {
    if (Math.abs(value) < threshold) {
        return 0;
    }

    const sign = Math.sign(value);
    const magnitude = (Math.abs(value) - threshold) / (1 - threshold);

    // Apply quadratic curve for smooth acceleration
    return sign * Math.pow(magnitude, 2);
}
