/**
 * Type declarations for Playwright tests
 */

export interface GraphtyTestElement extends HTMLElement {
    graph?: {
        engine?: {
            stopRenderLoop(): void;
            _gl?: WebGLRenderingContext;
        };
        scene?: {
            render(): void;
            isReady(): boolean;
        };
        layoutManager?: {
            currentEngine?: {
                isSettled?(): boolean;
            };
        };
        performanceMonitor?: {
            renderLoopState?: string;
        };
    };
}

declare global {
    interface Window {
        testSuccessful?: boolean;
    }
}
