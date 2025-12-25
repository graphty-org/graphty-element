/**
 * All valid ViewMode values as a const array
 * Used for runtime validation and Storybook controls
 */
export const VIEW_MODE_VALUES = ["2d", "3d", "ar", "vr"] as const;

/**
 * ViewMode type definition
 *
 * Defines the different viewing modes for the graph visualization:
 * - "2d": Orthographic camera, fixed top-down view, pan/zoom input
 * - "3d": Perspective camera, orbit controls, full 3D interaction
 * - "ar": Augmented reality mode using WebXR
 * - "vr": Virtual reality mode using WebXR
 */
export type ViewMode = (typeof VIEW_MODE_VALUES)[number];

/**
 * Default view mode is 3D
 */
export const DEFAULT_VIEW_MODE: ViewMode = "3d";

/**
 * Type guard to check if a string is a valid ViewMode
 * @param value - String value to check
 * @returns True if value is a valid ViewMode
 */
export function isViewMode(value: string): value is ViewMode {
    return (VIEW_MODE_VALUES as readonly string[]).includes(value);
}
