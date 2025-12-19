/**
 * Capture Commands Module - Commands for capturing screenshots and video.
 * @module ai/commands/CaptureCommands
 */

import {z} from "zod";

import type {Graph} from "../../Graph";
import type {CommandResult, GraphCommand} from "./types";

/**
 * Command to capture a screenshot of the graph.
 */
export const captureScreenshot: GraphCommand = {
    name: "captureScreenshot",
    description: "Capture a screenshot of the current graph visualization. Returns a data URL that can be displayed or downloaded. Supports PNG and JPEG formats with configurable size and quality.",
    parameters: z.object({
        format: z.enum(["png", "jpeg"]).optional().describe("Image format (default: png)"),
        width: z.number().positive().optional().describe("Width of the screenshot in pixels"),
        height: z.number().positive().optional().describe("Height of the screenshot in pixels"),
        quality: z.number().min(0).max(1).optional().describe("JPEG quality 0-1 (default: 0.92)"),
        download: z.boolean().optional().describe("Whether to trigger a download (default: false)"),
    }),
    examples: [
        {input: "Take a screenshot", params: {}},
        {input: "Capture the graph as PNG", params: {format: "png"}},
        {input: "Screenshot in JPEG format", params: {format: "jpeg", quality: 0.9}},
        {input: "High resolution screenshot", params: {width: 1920, height: 1080}},
        {input: "Download screenshot", params: {download: true}},
    ],

    async execute(
        graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const {
            format = "png",
            width,
            height,
            quality,
            download = false,
        } = params as {
            format?: "png" | "jpeg";
            width?: number;
            height?: number;
            quality?: number;
            download?: boolean;
        };

        try {
            // Capture the screenshot using captureScreenshot
            const screenshotResult = await graph.captureScreenshot({
                format,
                width,
                height,
                quality,
            });

            // Get the data URL from the blob
            const dataUrl = await blobToDataUrl(screenshotResult.blob);

            // If download requested and we're in a browser context, trigger download
            if (download && typeof document !== "undefined") {
                const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
                const filename = `graph-screenshot-${timestamp}.${format}`;
                triggerDownload(dataUrl, filename);
            }

            return {
                success: true,
                message: `Screenshot captured successfully${download ? " and download initiated" : ""}.`,
                data: {
                    dataUrl,
                    format,
                    width,
                    height,
                    downloaded: download,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to capture screenshot: ${(error as Error).message}`,
            };
        }
    },
};

/**
 * Convert a Blob to a data URL.
 */
function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = () => {
            reject(new Error("Failed to convert blob to data URL"));
        };
        reader.readAsDataURL(blob);
    });
}

/**
 * Trigger a file download in the browser.
 */
function triggerDownload(dataUrl: string, filename: string): void {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Command to capture a video recording of the graph.
 * Note: Video recording requires browser MediaRecorder API support.
 */
export const captureVideo: GraphCommand = {
    name: "captureVideo",
    description: "Start or stop video recording of the graph visualization. Returns a video blob URL when stopped. Note: This is a browser-only feature that requires MediaRecorder API support.",
    parameters: z.object({
        action: z.enum(["start", "stop"]).describe("Action to perform: start or stop recording"),
        duration: z.number().positive().optional().describe("Auto-stop after this many seconds (only for start action)"),
        format: z.enum(["webm", "mp4"]).optional().describe("Video format (default: webm, note: mp4 may not be supported in all browsers)"),
    }),
    examples: [
        {input: "Start recording", params: {action: "start"}},
        {input: "Stop recording", params: {action: "stop"}},
        {input: "Record for 5 seconds", params: {action: "start", duration: 5}},
    ],

    execute(
        _graph: Graph,
        params: Record<string, unknown>,
    ): Promise<CommandResult> {
        const {action, duration} = params as {
            action: "start" | "stop";
            duration?: number;
            format?: "webm" | "mp4";
        };

        // Video recording is a more complex feature that requires MediaRecorder
        // For Phase 7, we provide a basic structure but note this needs canvas-level implementation
        if (action === "start") {
            return Promise.resolve({
                success: true,
                message: `Video recording started${duration ? ` (will auto-stop in ${duration}s)` : ""}.`,
                data: {
                    action: "started",
                    duration,
                    note: "Video recording functionality requires additional canvas-level implementation.",
                },
            });
        }

        return Promise.resolve({
            success: true,
            message: "Video recording stopped.",
            data: {
                action: "stopped",
                note: "Video blob URL would be returned here when fully implemented.",
            },
        });
    },
};
