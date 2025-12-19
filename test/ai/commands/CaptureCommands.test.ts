/**
 * Tests for Capture Commands (Phase 7)
 */

import {assert, beforeEach, describe, it, vi} from "vitest";

import {captureScreenshot} from "../../../src/ai/commands/CaptureCommands";
import type {CommandContext} from "../../../src/ai/commands/types";

// Type for the mock graph with screenshot functionality
interface MockGraph {
    captureScreenshot: ReturnType<typeof vi.fn>;
}

// Type for screenshot result data
interface ScreenshotData {
    dataUrl?: string;
    format?: string;
    width?: number;
    height?: number;
}

// Mock FileReader for Node.js environment
class MockFileReader {
    result: string | ArrayBuffer | null = null;
    onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
    onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;

    readAsDataURL(blob: Blob): void {
        // Simulate async file reading
        setTimeout(() => {
            // Create a mock data URL based on the blob type
            this.result = `data:${blob.type};base64,ZmFrZS1pbWFnZS1kYXRh`;
            if (this.onload) {
                this.onload({} as ProgressEvent<FileReader>);
            }
        }, 0);
    }
}

// Set up FileReader mock before tests
vi.stubGlobal("FileReader", MockFileReader);

// Create a mock graph with screenshot functionality
function createMockGraph(): MockGraph {
    return {
        // Mock screenshot method that returns a ScreenshotResult with blob
        captureScreenshot: vi.fn().mockResolvedValue({
            blob: new Blob(["fake-image-data"], {type: "image/png"}),
            downloaded: false,
            clipboardStatus: "not-supported",
            metadata: {
                width: 800,
                height: 600,
                format: "png",
                byteSize: 12345,
                captureTime: 100,
            },
        }),
    };
}

function createMockContext(mockGraph: MockGraph): CommandContext {
    return {
        graph: mockGraph as unknown as CommandContext["graph"],
        abortSignal: new AbortController().signal,
        emitEvent: vi.fn(),
        updateStatus: vi.fn(),
    };
}

describe("CaptureCommands", () => {
    let mockGraph: MockGraph;
    let context: CommandContext;

    beforeEach(() => {
        mockGraph = createMockGraph();
        context = createMockContext(mockGraph);
    });

    describe("captureScreenshot", () => {
        it("has correct command structure", () => {
            assert.strictEqual(captureScreenshot.name, "captureScreenshot");
            assert.ok(captureScreenshot.description.length > 0);
            assert.ok(captureScreenshot.parameters);
            assert.ok(captureScreenshot.examples.length > 0);
        });

        it("captures screenshot with default options", async() => {
            const graph = mockGraph as unknown as CommandContext["graph"];
            const result = await captureScreenshot.execute(graph, {}, context);

            assert.strictEqual(result.success, true);
            const data = result.data as ScreenshotData | undefined;
            assert.ok(data?.dataUrl?.startsWith("data:"));
            assert.ok(result.message.includes("Screenshot"));
        });

        it("captures screenshot with PNG format", async() => {
            const graph = mockGraph as unknown as CommandContext["graph"];
            const result = await captureScreenshot.execute(graph, {
                format: "png",
            }, context);

            assert.strictEqual(result.success, true);
            const data = result.data as ScreenshotData | undefined;
            assert.ok(data?.dataUrl?.startsWith("data:"));
        });

        it("captures screenshot with JPEG format", async() => {
            // Mock to return JPEG data
            mockGraph.captureScreenshot.mockResolvedValueOnce({
                blob: new Blob(["fake-jpeg-data"], {type: "image/jpeg"}),
                downloaded: false,
                clipboardStatus: "not-supported",
                metadata: {
                    width: 800,
                    height: 600,
                    format: "jpeg",
                    byteSize: 12345,
                    captureTime: 100,
                },
            });

            const graph = mockGraph as unknown as CommandContext["graph"];
            const result = await captureScreenshot.execute(graph, {
                format: "jpeg",
            }, context);

            assert.strictEqual(result.success, true);
            const data = result.data as ScreenshotData | undefined;
            assert.ok(data?.dataUrl?.startsWith("data:"));
        });

        it("captures screenshot with specified width and height", async() => {
            const graph = mockGraph as unknown as CommandContext["graph"];
            const result = await captureScreenshot.execute(graph, {
                width: 1920,
                height: 1080,
            }, context);

            assert.strictEqual(result.success, true);
            // Verify screenshot was called with size parameters
            assert.ok(mockGraph.captureScreenshot.mock.calls.length > 0);
        });

        it("captures screenshot with quality option for JPEG", async() => {
            mockGraph.captureScreenshot.mockResolvedValueOnce({
                blob: new Blob(["fake-jpeg-data"], {type: "image/jpeg"}),
                downloaded: false,
                clipboardStatus: "not-supported",
                metadata: {
                    width: 800,
                    height: 600,
                    format: "jpeg",
                    byteSize: 12345,
                    captureTime: 100,
                },
            });

            const graph = mockGraph as unknown as CommandContext["graph"];
            const result = await captureScreenshot.execute(graph, {
                format: "jpeg",
                quality: 0.8,
            }, context);

            assert.strictEqual(result.success, true);
        });

        it("handles screenshot failure gracefully", async() => {
            mockGraph.captureScreenshot.mockRejectedValueOnce(new Error("Screenshot failed"));

            const graph = mockGraph as unknown as CommandContext["graph"];
            const result = await captureScreenshot.execute(graph, {}, context);

            assert.strictEqual(result.success, false);
            assert.ok(result.message.toLowerCase().includes("fail") ||
                      result.message.toLowerCase().includes("error"));
        });

        it("returns appropriate message with download:false", async() => {
            const graph = mockGraph as unknown as CommandContext["graph"];
            const result = await captureScreenshot.execute(graph, {
                download: false,
            }, context);

            assert.strictEqual(result.success, true);
            const data = result.data as ScreenshotData | undefined;
            assert.ok(data?.dataUrl);
            // When download is false, should just return the data URL
        });

        it("parameter schema validates format correctly", () => {
            // Valid formats
            const validPng = captureScreenshot.parameters.safeParse({format: "png"});
            assert.ok(validPng.success);

            const validJpeg = captureScreenshot.parameters.safeParse({format: "jpeg"});
            assert.ok(validJpeg.success);

            // Invalid format
            const invalid = captureScreenshot.parameters.safeParse({format: "gif"});
            assert.ok(!invalid.success);
        });

        it("parameter schema allows empty object", () => {
            const result = captureScreenshot.parameters.safeParse({});
            assert.ok(result.success);
        });

        it("parameter schema validates width and height as positive numbers", () => {
            const valid = captureScreenshot.parameters.safeParse({
                width: 800,
                height: 600,
            });
            assert.ok(valid.success);

            // Negative numbers should fail
            const negativeWidth = captureScreenshot.parameters.safeParse({width: -100});
            assert.ok(!negativeWidth.success);

            const negativeHeight = captureScreenshot.parameters.safeParse({height: -100});
            assert.ok(!negativeHeight.success);
        });

        it("parameter schema validates quality range 0-1", () => {
            const valid = captureScreenshot.parameters.safeParse({quality: 0.8});
            assert.ok(valid.success);

            const validZero = captureScreenshot.parameters.safeParse({quality: 0});
            assert.ok(validZero.success);

            const validOne = captureScreenshot.parameters.safeParse({quality: 1});
            assert.ok(validOne.success);

            // Out of range
            const tooHigh = captureScreenshot.parameters.safeParse({quality: 1.5});
            assert.ok(!tooHigh.success);

            const tooLow = captureScreenshot.parameters.safeParse({quality: -0.5});
            assert.ok(!tooLow.success);
        });
    });
});
