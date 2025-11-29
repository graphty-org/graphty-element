import {ScreenshotError, ScreenshotErrorCode} from "./ScreenshotError.js";
import type {ClipboardStatus} from "./types.js";

export interface ClipboardResult {
    status: ClipboardStatus;
    error?: Error;
}

/**
 * Copy image to clipboard. Accepts either a Blob or a Promise<Blob>.
 * When using Promise<Blob>, the clipboard write starts immediately (preserving user gesture),
 * and the promise resolves asynchronously.
 */
export async function copyToClipboard(
    blobOrPromise: Blob | Promise<Blob>,
): Promise<ClipboardResult> {
    // Check if we're in a secure context
    if (!window.isSecureContext) {
        return {
            status: "not-secure-context",
            error: new ScreenshotError(
                "Clipboard API requires a secure context (HTTPS)",
                ScreenshotErrorCode.CLIPBOARD_NOT_SECURE_CONTEXT,
            ),
        };
    }

    // Check if clipboard API is available
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!navigator.clipboard) {
        return {
            status: "not-supported",
            error: new ScreenshotError(
                "Clipboard API not supported in this browser",
                ScreenshotErrorCode.CLIPBOARD_NOT_SUPPORTED,
            ),
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!navigator.clipboard.write) {
        return {
            status: "not-supported",
            error: new ScreenshotError(
                "Clipboard write API not supported in this browser",
                ScreenshotErrorCode.CLIPBOARD_NOT_SUPPORTED,
            ),
        };
    }

    // Check clipboard-write permission
    try {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (navigator.permissions?.query) {
            const permission = await navigator.permissions.query({
                // @ts-expect-error - clipboard-write is not yet in TypeScript types
                name: "clipboard-write",
            });

            if (permission.state === "denied") {
                return {
                    status: "permission-denied",
                    error: new ScreenshotError(
                        "Clipboard permission is denied. Please allow clipboard access in browser settings.",
                        ScreenshotErrorCode.CLIPBOARD_PERMISSION_DENIED,
                    ),
                };
            }
        }
    } catch {
        // Permission query not supported, continue anyway
    }

    try {
        // Resolve blob type - if it's a Promise, we need to determine the MIME type upfront
        const blobPromise = blobOrPromise instanceof Blob ?
            Promise.resolve(blobOrPromise) :
            blobOrPromise;

        // For promises, we assume PNG format (most common for screenshots)
        // The promise will provide the actual blob with correct type
        const mimeType = blobOrPromise instanceof Blob ? blobOrPromise.type : "image/png";

        // Create ClipboardItem with promise - this allows clipboard write to start
        // immediately while blob is still being generated
        const clipboardItem = new ClipboardItem({
            [mimeType]: blobPromise,
        });

        // Start clipboard write immediately (preserves user gesture context)
        await navigator.clipboard.write([clipboardItem]);

        return {status: "success"};
    } catch (error) {
    // Check if it's a permission error
        if (error instanceof Error && error.name === "NotAllowedError") {
            return {
                status: "permission-denied",
                error: new ScreenshotError(
                    "Clipboard permission denied. This may be due to browser security policies. Try clicking the button again, or check your browser's clipboard permissions.",
                    ScreenshotErrorCode.CLIPBOARD_PERMISSION_DENIED,
                    error,
                ),
            };
        }

        // Other error
        return {
            status: "failed",
            error: new ScreenshotError(
                "Failed to write to clipboard",
                ScreenshotErrorCode.CLIPBOARD_WRITE_FAILED,
                error,
            ),
        };
    }
}
