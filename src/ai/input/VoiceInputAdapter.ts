/**
 * VoiceInputAdapter - Web Speech API wrapper for voice input.
 * @module ai/input/VoiceInputAdapter
 */

import type {InputAdapter, InputCallback, InputOptions} from "./types";

// Web Speech API types (not available in all browsers)
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    length: number;
    isFinal: boolean;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

type SpeechRecognitionConstructor = new() => SpeechRecognition;

// Global type declaration for browser speech API
declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}

/**
 * Get the SpeechRecognition constructor if available.
 */
function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
    if (typeof window === "undefined") {
        return null;
    }

    return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

/** Callback for voice input start/error events */
export type VoiceStartCallback = (started: boolean, error?: string) => void;

/**
 * Voice input adapter using the Web Speech API.
 * Provides voice-to-text functionality with support for interim and final results.
 */
export class VoiceInputAdapter implements InputAdapter {
    readonly type = "voice" as const;

    private recognition: SpeechRecognition | null = null;
    private _isActive = false;
    private callbacks: InputCallback[] = [];
    private startCallbacks: VoiceStartCallback[] = [];
    private SpeechRecognitionCtor: SpeechRecognitionConstructor | null = null;

    constructor() {
        this.SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    }

    get isSupported(): boolean {
        return this.SpeechRecognitionCtor !== null;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    /**
     * Start listening for voice input.
     * @param options - Optional configuration for the voice input session
     */
    start(options?: InputOptions): void {
        if (!this.SpeechRecognitionCtor) {
            // Not supported, silently return
            return;
        }

        // Stop any existing recognition
        if (this.recognition) {
            this.stop();
        }

        // Create new recognition instance
        this.recognition = new this.SpeechRecognitionCtor();
        this.recognition.continuous = options?.continuous ?? false;
        this.recognition.interimResults = options?.interimResults ?? true;
        this.recognition.lang = options?.language ?? "en-US";

        // Set up event handlers
        this.recognition.onstart = () => {
            this._isActive = true;
            // Notify that recognition started successfully
            this.notifyStart(true);
        };

        this.recognition.onresult = (event: SpeechRecognitionEvent) => {
            this.handleResult(event);
        };

        this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error:", event.error, event.message);
            // Some errors (like "no-speech") don't stop recognition
            if (event.error === "aborted" || event.error === "not-allowed") {
                this._isActive = false;
                // Notify that recognition failed to start
                this.notifyStart(false, event.error);
            }
        };

        this.recognition.onend = () => {
            this._isActive = false;
        };

        // Start recognition
        try {
            this.recognition.start();
        } catch (error) {
            console.error("Failed to start speech recognition:", error);
            this._isActive = false;
        }
    }

    /**
     * Stop listening for voice input.
     */
    stop(): void {
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch {
                // Ignore errors when stopping
            }

            this.recognition = null;
        }

        this._isActive = false;
    }

    /**
     * Register a callback for input events.
     * @param callback - Function called when voice input is received
     */
    onInput(callback: InputCallback): void {
        this.callbacks.push(callback);
    }

    /**
     * Register a callback for start/error events.
     * Called when recognition successfully starts or fails to start.
     * @param callback - Function called with (started: boolean, error?: string)
     */
    onStart(callback: VoiceStartCallback): void {
        this.startCallbacks.push(callback);
    }

    /**
     * Clean up resources and remove all callbacks.
     */
    dispose(): void {
        this.stop();
        this.callbacks = [];
        this.startCallbacks = [];
    }

    /**
     * Notify start callbacks and clear them (one-shot).
     */
    private notifyStart(started: boolean, error?: string): void {
        for (const callback of this.startCallbacks) {
            callback(started, error);
        }
        // Clear start callbacks - they're one-shot per start attempt
        this.startCallbacks = [];
    }

    /**
     * Handle speech recognition results.
     */
    private handleResult(event: SpeechRecognitionEvent): void {
        // Process results starting from the new ones
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const {transcript} = result[0];
            const {isFinal} = result;

            // Notify all callbacks
            for (const callback of this.callbacks) {
                callback(transcript, isFinal);
            }
        }
    }
}
