/**
 * Test Setup for Mesh Testing
 *
 * Sets up the global environment for running Babylon.js NullEngine tests
 * in Node.js with necessary polyfills and configurations.
 */

// import {NullEngine} from "@babylonjs/core";

/**
 * Global setup function - runs once before all tests
 */
export function setup(): void {
    // Setup console for better test output
    console.warn("🧪 Setting up mesh testing environment...");

    // Polyfill for OffscreenCanvas (used by DynamicTexture)
    if (typeof OffscreenCanvas === "undefined") {
        (global as unknown).OffscreenCanvas = class MockOffscreenCanvas {
            width: number;
            height: number;

            constructor(width: number, height: number) {
                this.width = width;
                this.height = height;
            }

            getContext(contextType: string): unknown {
                if (contextType === "2d") {
                    return createMockCanvas2DContext();
                }

                return null;
            }

            convertToBlob(): Promise<Blob> {
                return Promise.resolve(new Blob());
            }
        };
    }

    // Polyfill for Canvas (fallback)
    if (typeof HTMLCanvasElement === "undefined") {
        (global as unknown).HTMLCanvasElement = class MockHTMLCanvasElement {
            width: number;
            height: number;

            constructor() {
                this.width = 300;
                this.height = 150;
            }

            getContext(contextType: string): unknown {
                if (contextType === "2d") {
                    return createMockCanvas2DContext();
                }

                return null;
            }

            toDataURL(): string {
                return "data:image/png;base64,";
            }
        };
    }

    // Polyfill for Image
    if (typeof Image === "undefined") {
        (global as unknown).Image = class MockImage {
            src = "";
            width = 0;
            height = 0;
            onload: (() => void) | null = null;
            onerror: (() => void) | null = null;

            constructor() {
                // Simulate async loading
                setTimeout(() => {
                    this.width = 100;
                    this.height = 100;
                    if (this.onload) {
                        this.onload();
                    }
                }, 0);
            }
        };
    }

    // Polyfill for document (minimal)
    if (typeof document === "undefined") {
        (global as unknown).document = {
            createElement: (tagName: string) => {
                if (tagName === "canvas") {
                    return new (global as unknown).HTMLCanvasElement();
                }

                return {
                    tagName: tagName.toUpperCase(),
                    style: {},
                    appendChild: () => {
                        // Mock DOM operation - no actual implementation needed for tests
                    },
                    removeChild: () => {
                        // Mock DOM operation - no actual implementation needed for tests
                    },
                };
            },
            body: {
                appendChild: () => {
                    // Mock DOM operation - no actual implementation needed for tests
                },
                removeChild: () => {
                    // Mock DOM operation - no actual implementation needed for tests
                },
            },
        };
    }

    // Polyfill for window (minimal)
    if (typeof window === "undefined") {
        (global as unknown).window = {
            ... global,
            location: {href: "http://localhost/"},
            navigator: {userAgent: "Node.js"},
            setTimeout: global.setTimeout,
            clearTimeout: global.clearTimeout,
            setInterval: global.setInterval,
            clearInterval: global.clearInterval,
        };
    }

    // Polyfill for performance
    if (typeof performance === "undefined") {
        (global as unknown).performance = {
            now: () => Date.now(),
            mark: () => {
                // Mock performance API - no actual implementation needed for tests
            },
            measure: () => {
                // Mock performance API - no actual implementation needed for tests
            },
            getEntriesByName: () => [],
            getEntriesByType: () => [],
        };
    }

    // Setup XMLHttpRequest for Babylon.js (if needed)
    if (typeof XMLHttpRequest === "undefined") {
        (global as unknown).XMLHttpRequest = class MockXMLHttpRequest {
            readyState = 0;
            status = 200;
            statusText = "OK";
            responseText = "";
            response = "";

            open(): void {
                // Mock XMLHttpRequest - no actual implementation needed for tests
            }
            send(): void {
                // Mock XMLHttpRequest - no actual implementation needed for tests
            }
            setRequestHeader(): void {
                // Mock XMLHttpRequest - no actual implementation needed for tests
            }
            addEventListener(): void {
                // Mock XMLHttpRequest - no actual implementation needed for tests
            }
            removeEventListener(): void {
                // Mock XMLHttpRequest - no actual implementation needed for tests
            }
        };
    }

    console.warn("✅ Mesh testing environment setup complete");
}

/**
 * Creates a mock 2D canvas context with all necessary methods
 */
function createMockCanvas2DContext(): unknown {
    const context = {
    // State properties
        fillStyle: "#000000",
        strokeStyle: "#000000",
        lineWidth: 1,
        font: "10px sans-serif",
        textAlign: "start" as CanvasTextAlign,
        textBaseline: "alphabetic" as CanvasTextBaseline,
        shadowColor: "rgba(0, 0, 0, 0)",
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        globalAlpha: 1,
        globalCompositeOperation: "source-over" as GlobalCompositeOperation,
        lineCap: "butt" as CanvasLineCap,
        lineJoin: "miter" as CanvasLineJoin,
        miterLimit: 10,
        lineDashOffset: 0,

        // Drawing methods
        fillRect: () => {
            // Mock canvas operation
        },
        strokeRect: () => {
            // Mock canvas operation
        },
        clearRect: () => {
            // Mock canvas operation
        },
        fillText: () => {
            // Mock canvas operation
        },
        strokeText: () => {
            // Mock canvas operation
        },

        // Path methods
        beginPath: () => {
            // Mock canvas operation
        },
        closePath: () => {
            // Mock canvas operation
        },
        moveTo: () => {
            // Mock canvas operation
        },
        lineTo: () => {
            // Mock canvas operation
        },
        arc: () => {
            // Mock canvas operation
        },
        arcTo: () => {
            // Mock canvas operation
        },
        quadraticCurveTo: () => {
            // Mock canvas operation
        },
        bezierCurveTo: () => {
            // Mock canvas operation
        },
        rect: () => {
            // Mock canvas operation
        },
        fill: () => {
            // Mock canvas operation
        },
        stroke: () => {
            // Mock canvas operation
        },
        clip: () => {
            // Mock canvas operation
        },

        // State methods
        save: () => {
            // Mock canvas operation
        },
        restore: () => {
            // Mock canvas operation
        },

        // Transform methods
        scale: () => {
            // Mock canvas operation
        },
        rotate: () => {
            // Mock canvas operation
        },
        translate: () => {
            // Mock canvas operation
        },
        transform: () => {
            // Mock canvas operation
        },
        setTransform: () => {
            // Mock canvas operation
        },
        resetTransform: () => {
            // Mock canvas operation
        },

        // Image methods
        drawImage: () => {
            // Mock canvas operation
        },
        createImageData: () => ({data: new Uint8ClampedArray(4), width: 1, height: 1}),
        getImageData: () => ({data: new Uint8ClampedArray(4), width: 1, height: 1}),
        putImageData: () => {
            // Mock canvas operation
        },

        // Gradient methods
        createLinearGradient: () => ({
            addColorStop: () => {
                // Mock gradient operation
            },
        }),
        createRadialGradient: () => ({
            addColorStop: () => {
                // Mock gradient operation
            },
        }),
        createPattern: () => null,

        // Text measurement
        measureText: (text: string) => ({
            width: text.length * 8, // Rough approximation
            actualBoundingBoxLeft: 0,
            actualBoundingBoxRight: text.length * 8,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 2,
            fontBoundingBoxAscent: 10,
            fontBoundingBoxDescent: 2,
            alphabeticBaseline: 0,
            emHeightAscent: 10,
            emHeightDescent: 2,
            hangingBaseline: 8,
            ideographicBaseline: -2,
        }),

        // Line dash methods
        getLineDash: () => [],
        setLineDash: () => {
            // Mock canvas operation
        },

        // Pixel manipulation
        isPointInPath: () => false,
        isPointInStroke: () => false,

        // Focus methods (HTML5)
        drawFocusIfNeeded: () => {
            // Mock canvas operation
        },
        scrollPathIntoView: () => {
            // Mock canvas operation
        },

        // Canvas dimensions (these would be set by the canvas)
        canvas: {
            width: 300,
            height: 150,
        },
    };

    return context as unknown as CanvasRenderingContext2D;
}

/**
 * Cleanup function - runs after all tests
 */
export function teardown(): void {
    console.warn("🧹 Cleaning up mesh testing environment");

    // Clean up any global modifications
    // (NullEngine should clean up automatically)
}

// Auto-setup when this module is imported
setup();
