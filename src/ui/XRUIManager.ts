export type XRSessionMode = "immersive-vr" | "immersive-ar";

export interface XRUIConfig {
    enabled: boolean;
    position: "bottom-left" | "bottom-right" | "top-left" | "top-right";
    unavailableMessageDuration: number;
    showAvailabilityWarning: boolean;
}

/**
 * Manages the rendering and positioning of XR UI buttons.
 * Handles button creation, styling, and user interaction callbacks.
 * Styling is done via CSS custom properties and ::part() selectors.
 */
export class XRUIManager {
    private container: HTMLElement;
    private overlay: HTMLElement | null = null;
    private config: XRUIConfig;
    private unavailableTimeout: NodeJS.Timeout | null = null;
    private styleElement: HTMLStyleElement | null = null;

    /**
     * Callback function triggered when user clicks an XR button
     */
    public onEnterXR: ((mode: XRSessionMode) => void) | null = null;

    /**
     * Creates a new XRUIManager instance and initializes UI buttons
     * @param container - The HTML element to contain the XR UI
     * @param vrAvailable - Whether VR is available on this device
     * @param arAvailable - Whether AR is available on this device
     * @param config - UI configuration options
     */
    constructor(
        container: HTMLElement,
        vrAvailable: boolean,
        arAvailable: boolean,
        config: XRUIConfig,
    ) {
        this.container = container;
        this.config = config;

        if (!config.enabled) {
            return;
        }

        this.injectDefaultStyles();
        this.createOverlay();

        if (!vrAvailable && !arAvailable) {
            if (config.showAvailabilityWarning) {
                this.showUnavailableMessage();
            }
        } else {
            if (vrAvailable) {
                this.createButton("VR", "immersive-vr");
            }

            if (arAvailable) {
                this.createButton("AR", "immersive-ar");
            }
        }
    }

    /**
     * Create the overlay container with proper positioning
     */
    private createOverlay(): void {
        this.overlay = document.createElement("div");
        this.overlay.className = `xr-button-overlay xr-position-${this.config.position}`;
        this.overlay.setAttribute("part", "xr-overlay");

        this.container.appendChild(this.overlay);
    }

    /**
     * Create a button for entering XR mode
     * @param label - Button text label
     * @param mode - XR session mode for this button
     * @returns The created button element
     */
    private createButton(label: string, mode: XRSessionMode): HTMLButtonElement {
        const button = document.createElement("button");
        button.className = "webxr-button webxr-available";
        button.setAttribute("data-xr-mode", mode);
        button.setAttribute("part", `xr-button xr-${mode === "immersive-vr" ? "vr" : "ar"}-button`);
        button.textContent = label;

        // Add click handler
        button.addEventListener("click", () => {
            if (this.onEnterXR) {
                this.onEnterXR(mode);
            }
        });

        this.overlay?.appendChild(button);
        return button;
    }

    /**
     * Show the "not available" message
     */
    private showUnavailableMessage(): void {
        const message = document.createElement("div");
        message.className = "webxr-button webxr-not-available";
        message.setAttribute("part", "xr-button xr-unavailable-message");
        message.textContent = "VR / AR NOT AVAILABLE";

        this.overlay?.appendChild(message);

        // Auto-remove after timeout
        if (this.config.unavailableMessageDuration > 0) {
            this.unavailableTimeout = setTimeout(() => {
                message.remove();
            }, this.config.unavailableMessageDuration);
        }
    }

    /**
     * Inject default CSS styles with custom properties
     */
    private injectDefaultStyles(): void {
        const css = `
        .webxr-button {
            font-family: var(--xr-button-font-family, 'Verdana', sans-serif);
            font-size: var(--xr-button-font-size, 1em);
            font-weight: var(--xr-button-font-weight, bold);
            color: var(--xr-button-color, white);
            border: var(--xr-button-border-width, 2px) solid var(--xr-button-border-color, white);
            padding: var(--xr-button-padding, 4px 16px);
            margin-left: var(--xr-button-margin-left, 10px);
            border-radius: var(--xr-button-border-radius, 8px);
            cursor: pointer;
        }

        .webxr-available {
            background: var(--xr-available-bg, black);
            box-shadow: var(--xr-available-box-shadow, 0 0 0 0px white, 0 0 0 2px black);
        }

        .webxr-presenting {
            background: var(--xr-presenting-bg, red);
        }

        .webxr-presenting::before {
            content: var(--xr-presenting-prefix, "EXIT ");
        }

        .webxr-not-available {
            background: var(--xr-unavailable-bg, grey);
            box-shadow: var(--xr-unavailable-box-shadow, 0 0 0 0px white, 0 0 0 2px grey);
        }

        .webxr-available:hover {
            transform: var(--xr-available-hover-transform, scale(1.05));
        }

        .webxr-available:active {
            background-color: var(--xr-available-active-bg, rgba(51,51,51,1));
        }

        .webxr-available:focus {
            background-color: var(--xr-available-focus-bg, rgba(51,51,51,1));
        }

        .xr-button-overlay {
            position: absolute;
            display: flex;
            gap: var(--xr-overlay-gap, 10px);
            z-index: var(--xr-overlay-z-index, 1000);
            flex-direction: row;
        }

        .xr-position-bottom-left {
            bottom: var(--xr-overlay-offset-vertical, 20px);
            left: var(--xr-overlay-offset-horizontal, 20px);
        }

        .xr-position-bottom-right {
            bottom: var(--xr-overlay-offset-vertical, 20px);
            right: var(--xr-overlay-offset-horizontal, 20px);
        }

        .xr-position-top-left {
            top: var(--xr-overlay-offset-vertical, 20px);
            left: var(--xr-overlay-offset-horizontal, 20px);
        }

        .xr-position-top-right {
            top: var(--xr-overlay-offset-vertical, 20px);
            right: var(--xr-overlay-offset-horizontal, 20px);
        }
        `;

        this.styleElement = document.createElement("style");
        this.styleElement.textContent = css;
        this.container.appendChild(this.styleElement);
    }

    /**
     * Clean up resources and remove UI elements
     */
    public dispose(): void {
        if (this.unavailableTimeout) {
            clearTimeout(this.unavailableTimeout);
            this.unavailableTimeout = null;
        }

        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }

        if (this.styleElement) {
            this.styleElement.remove();
            this.styleElement = null;
        }

        this.onEnterXR = null;
    }
}
