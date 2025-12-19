/**
 * TextInputAdapter - Text input adapter for streaming text support.
 * @module ai/input/TextInputAdapter
 */

import type {InputAdapter, InputCallback} from "./types";

/**
 * Text input adapter that wraps text input with streaming support.
 * Useful for "as-you-type" suggestions or preview functionality.
 */
export class TextInputAdapter implements InputAdapter {
    readonly type = "text" as const;
    readonly isSupported = true;

    private _isActive = false;
    private callbacks: InputCallback[] = [];

    get isActive(): boolean {
        return this._isActive;
    }

    /**
     * Start accepting text input.
     */
    start(): void {
        this._isActive = true;
    }

    /**
     * Stop accepting text input.
     */
    stop(): void {
        this._isActive = false;
    }

    /**
     * Register a callback for input events.
     * @param callback - Function called when input is received
     */
    onInput(callback: InputCallback): void {
        this.callbacks.push(callback);
    }

    /**
     * Submit final text input.
     * @param text - The complete input text
     */
    submitInput(text: string): void {
        if (!this._isActive) {
            return;
        }

        for (const callback of this.callbacks) {
            callback(text, true);
        }
    }

    /**
     * Submit interim (partial) text input.
     * @param text - The partial input text
     */
    submitInterim(text: string): void {
        if (!this._isActive) {
            return;
        }

        for (const callback of this.callbacks) {
            callback(text, false);
        }
    }

    /**
     * Clean up resources and remove all callbacks.
     */
    dispose(): void {
        this.stop();
        this.callbacks = [];
    }
}
