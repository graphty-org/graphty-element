/**
 * Mode Commands Module - Commands for VR/AR immersive modes.
 * @module ai/commands/ModeCommands
 */

import {z} from "zod";

import type {Graph} from "../../Graph";
import type {CommandResult, GraphCommand} from "./types";

/**
 * Immersive mode options.
 */
const ImmersiveModeSchema = z.enum(["vr", "ar", "exit"]).describe(
    "VR for virtual reality, AR for augmented reality, exit to return to normal view",
);

/**
 * Command to enter or exit VR/AR immersive modes (WebXR).
 */
export const setImmersiveMode: GraphCommand = {
    name: "setImmersiveMode",
    description: "Enter or exit VR/AR immersive modes using WebXR. Use 'vr' for virtual reality (headset), 'ar' for augmented reality (pass-through or mobile AR), or 'exit' to return to normal desktop view.",
    parameters: z.object({
        mode: ImmersiveModeSchema,
    }),
    examples: [
        {input: "Enter VR mode", params: {mode: "vr"}},
        {input: "Switch to AR", params: {mode: "ar"}},
        {input: "Exit immersive mode", params: {mode: "exit"}},
        {input: "Leave VR", params: {mode: "exit"}},
        {input: "Put me in virtual reality", params: {mode: "vr"}},
        {input: "Show augmented reality view", params: {mode: "ar"}},
        {input: "Go back to normal view", params: {mode: "exit"}},
    ],

    async execute(
        graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const {mode} = params as {mode: "vr" | "ar" | "exit"};

        try {
            if (mode === "exit") {
                // Exit immersive mode
                const exitFn = (graph as Graph & {exitImmersiveMode?: () => Promise<void>}).exitImmersiveMode;
                if (exitFn) {
                    await exitFn.call(graph);
                }

                return {
                    success: true,
                    message: "Exited immersive mode, returned to normal view.",
                };
            }

            // Check for XR helper
            const {getXRHelper} = (graph as Graph & {getXRHelper?: () => unknown});
            const xrHelper = getXRHelper?.call(graph) as {
                enterVR?: () => Promise<void>;
                enterAR?: () => Promise<void>;
            } | null;

            if (!xrHelper) {
                return {
                    success: false,
                    message: `WebXR is not available. ${mode.toUpperCase()} mode requires a WebXR-capable browser and device.`,
                };
            }

            if (mode === "vr") {
                const {enterVR} = xrHelper;
                if (!enterVR) {
                    return {
                        success: false,
                        message: "VR mode is not supported on this device or browser.",
                    };
                }

                await enterVR.call(xrHelper);
                return {
                    success: true,
                    message: "Entering VR mode. Put on your headset to view the graph in virtual reality.",
                };
            }

            // mode === "ar"
            const {enterAR} = xrHelper;
            if (!enterAR) {
                return {
                    success: false,
                    message: "AR mode is not supported on this device or browser.",
                };
            }

            await enterAR.call(xrHelper);
            return {
                success: true,
                message: "Entering AR mode. Point your device to see the graph in augmented reality.",
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to enter ${mode.toUpperCase()} mode: ${(error as Error).message}`,
            };
        }
    },
};
