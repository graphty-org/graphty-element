import type {vi as vitestVi} from "vitest";

/**
 * Mock MediaRecorder for testing video capture functionality.
 * Simulates browser MediaRecorder behavior without requiring actual video encoding.
 */
export class MockMediaRecorder {
    ondataavailable: ((e: BlobEvent) => void) | null = null;
    onstop: (() => void) | null = null;
    onerror: ((e: Event) => void) | null = null;
    state: "inactive" | "recording" | "paused" = "inactive";
    mimeType: string;

    constructor(stream: MediaStream, options?: {mimeType?: string, videoBitsPerSecond?: number}) {
        this.mimeType = options?.mimeType ?? "video/webm";
    }

    start(): void {
        this.state = "recording";
    }

    stop(): void {
        this.state = "inactive";
        // Simulate data available
        const blob = new Blob(["mock video data"], {type: this.mimeType});
        this.ondataavailable?.({data: blob} as BlobEvent);
        setTimeout(() => this.onstop?.(), 0);
    }

    pause(): void {
        this.state = "paused";
    }

    resume(): void {
        this.state = "recording";
    }

    static isTypeSupported(type: string): boolean {
        // Simulate browser support
        return type.includes("webm") || type.includes("vp9") || type.includes("vp8");
    }
}

/**
 * Setup MockMediaRecorder as the global MediaRecorder
 * @param vi - The vitest vi object for stubbing globals
 */
export function setupMockMediaRecorder(vi: typeof vitestVi): void {
    vi.stubGlobal("MediaRecorder", MockMediaRecorder);
}

/**
 * Restore the original MediaRecorder
 * @param vi - The vitest vi object for stubbing globals
 * @param original - The original MediaRecorder to restore
 */
export function restoreMockMediaRecorder(
    vi: typeof vitestVi,
    original: typeof MediaRecorder,
): void {
    vi.stubGlobal("MediaRecorder", original);
}
