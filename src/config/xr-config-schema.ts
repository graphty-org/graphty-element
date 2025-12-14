import {z} from "zod";

/**
 * Zod schema for XR configuration validation
 *
 * This schema validates and provides type-safe defaults for all XR-related configuration.
 * Used by graphty-element to ensure configuration is valid before initializing XR features.
 *
 * Example usage:
 * ```typescript
 * import { xrConfigSchema } from "./config/xr-config-schema";
 *
 * const userConfig = { enabled: true };
 * const validatedConfig = xrConfigSchema.parse(userConfig);
 * // validatedConfig now has all defaults applied
 * ```
 */

export const xrConfigSchema = z
    .object({
    /**
     * Enable/disable XR functionality globally
     * @default true
     */
        enabled: z.boolean().default(true),

        /**
     * XR UI button configuration
     */
        ui: z
            .object({
                /**
         * Show VR/AR entry buttons
         * @default true
         */
                enabled: z.boolean().default(true),

                /**
         * Button position on screen
         * @default "bottom-right"
         */
                position: z
                    .enum(["bottom-left", "bottom-right", "top-left", "top-right"])
                    .default("bottom-right"),

                /**
         * Duration to show "not available" message (ms)
         * @default 5000
         */
                unavailableMessageDuration: z.number().positive().default(5000),

                /**
         * Show "VR / AR NOT AVAILABLE" warning when XR is not available
         * When false, no message is displayed if AR/VR aren't available
         * @default false
         */
                showAvailabilityWarning: z.boolean().default(false),
            })
            .default({}),

        /**
     * VR mode configuration
     */
        vr: z
            .object({
                /**
         * Enable VR mode
         * @default true
         */
                enabled: z.boolean().default(true),

                /**
         * WebXR reference space type for VR
         * - "local": Seated/standing experience, no room bounds
         * - "local-floor": Floor-level origin, no room bounds
         * - "bounded-floor": Room-scale with bounds
         * - "unbounded": Unlimited tracking space
         * @default "local-floor"
         */
                referenceSpaceType: z
                    .enum(["local", "local-floor", "bounded-floor", "unbounded"])
                    .default("local-floor"),

                /**
         * Optional WebXR features to request
         * @default []
         */
                optionalFeatures: z.array(z.string()).default([]),
            })
            .default({}),

        /**
     * AR mode configuration
     */
        ar: z
            .object({
                /**
         * Enable AR mode
         * @default true
         */
                enabled: z.boolean().default(true),

                /**
         * WebXR reference space type for AR
         * @default "local-floor"
         */
                referenceSpaceType: z
                    .enum(["local", "local-floor", "bounded-floor", "unbounded"])
                    .default("local-floor"),

                /**
         * Optional WebXR features to request
         * @default ["hit-test"]
         */
                optionalFeatures: z.array(z.string()).default(["hit-test"]),
            })
            .default({}),

        /**
     * XR input and interaction configuration
     */
        input: z
            .object({
                /**
         * Enable hand tracking
         * @default true
         */
                handTracking: z.boolean().default(true),

                /**
         * Enable motion controllers
         * @default true
         */
                controllers: z.boolean().default(true),

                /**
         * Enable near interaction (touch/grab)
         * @default true
         */
                nearInteraction: z.boolean().default(true),

                /**
         * Enable physics-based interactions
         * @default false
         */
                physics: z.boolean().default(false),

                /**
         * Z-axis movement amplification factor
         * Multiplies Z-axis delta during drag to make depth manipulation practical in VR
         *
         * Example: With zAxisAmplification = 10, moving controller 0.1 units in Z
         * will move the node 1.0 units in Z
         *
         * @default 10.0
         */
                zAxisAmplification: z.number().positive().default(10.0),

                /**
         * Enable Z-axis amplification in desktop mode
         * Normally amplification only applies in XR mode, but this can enable it for desktop too
         *
         * @default false
         */
                enableZAmplificationInDesktop: z.boolean().default(false),
            })
            .default({}),

        /**
     * Teleportation configuration
     */
        teleportation: z
            .object({
                /**
         * Enable teleportation system
         * @default false
         */
                enabled: z.boolean().default(false),

                /**
         * Teleportation animation duration (ms)
         * @default 200
         */
                easeTime: z.number().positive().default(200),
            })
            .default({}),
    })
    .default({});

/**
 * Inferred TypeScript type from the schema
 * Use this type for XR configuration objects
 */
export type XRConfig = z.infer<typeof xrConfigSchema>;

/**
 * Type for partial XR configuration (user input)
 * All fields are optional since defaults will be applied
 */
export type PartialXRConfig = z.input<typeof xrConfigSchema>;
