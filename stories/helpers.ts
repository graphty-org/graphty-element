/**
 * Enhanced helpers that integrate loader-based event waiting
 * This approach prevents race conditions while maintaining backwards compatibility
 */

import type {Meta} from "@storybook/web-components-vite";
import isChromatic from "chromatic/isChromatic";
import lodash from "lodash";
// eslint-disable-next-line @typescript-eslint/unbound-method
const {set: deepSet, merge} = lodash;

import {type AdHocData, type CalculatedStyleConfig, type StyleLayerType, type StyleSchema, StyleTemplate} from "../src/config";
import type {Graphty} from "../src/graphty-element";

// Global storage for event promises set up by decorators
const eventWaitingState = new WeakMap<HTMLElement, {
    promises: Map<string, Promise<void>>;
    resolvers: Map<string, () => void>;
}>();

/**
 * Set up event listeners for a graphty-element to capture events early.
 * This prevents race conditions where events fire before play() can attach listeners.
 */
function setupEventListenersForElement(element: HTMLElement): void {
    // Skip if already set up
    if (eventWaitingState.has(element)) {
        return;
    }

    // Create promise infrastructure for this element
    const promises = new Map<string, Promise<void>>();
    const resolvers = new Map<string, () => void>();

    // Set up promises for common events
    // Note: skybox-loaded is optional and only fires if a skybox is configured
    const events = ["graph-settled", "data-loaded"];
    events.forEach((eventName) => {
        let resolver: (() => void) | undefined;
        const promise = new Promise<void>((resolve) => {
            resolver = resolve;
        });
        promises.set(eventName, promise);
        resolvers.set(eventName, resolver as () => void);

        // Attach listener immediately
        element.addEventListener(eventName, () => {
            if (resolver) {
                resolver();
            }
        }, {once: true});
    });

    // Store state for this element
    eventWaitingState.set(element, {promises, resolvers});
}

/**
 * Enhanced decorator that sets up event listeners before elements are rendered
 * This decorator should be added to the meta configuration
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const eventWaitingDecorator = (story: any): any => {
    // Set up mutation observer to catch graphty-element creation
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeName === "GRAPHTY-ELEMENT") {
                    // Direct match - element was added directly to DOM
                    setupEventListenersForElement(node as HTMLElement);
                } else if (node instanceof Element) {
                    // Check descendants - handles stories that wrap graphty-element in a container
                    // This is critical for stories like Selection that return a container div
                    const graphtyElements = node.querySelectorAll("graphty-element");
                    graphtyElements.forEach((el) => {
                        setupEventListenersForElement(el as HTMLElement);
                    });
                }
            });
        });
    });

    observer.observe(document.body, {childList: true, subtree: true});

    // Run the story
    const result = story();

    // Clean up observer after a short delay
    setTimeout(() => {
        observer.disconnect();
    }, 100);

    return result;
};

// Helper to wait for data to load - useful for URL-based data sources
export async function waitForDataLoaded(canvasElement: HTMLElement): Promise<void> {
    const graphtyElement = canvasElement.querySelector("graphty-element");
    if (!graphtyElement) {
        return;
    }

    const state = eventWaitingState.get(graphtyElement as HTMLElement);
    if (state?.promises.has("data-loaded")) {
        const dataPromise = state.promises.get("data-loaded");
        if (!dataPromise) {
            return;
        }

        // Timeout for network requests (5 seconds - inline data loads instantly)
        const timeoutPromise = new Promise<void>((resolve) => {
            setTimeout(() => {
                // Data may already be loaded (e.g., inline data) or failed
                resolve();
            }, 5000);
        });

        await Promise.race([dataPromise, timeoutPromise]);
    } else {
        // Fallback: wait for data-loaded event with timeout
        await new Promise<void>((resolve) => {
            let resolved = false;

            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve();
                }
            }, 5000);

            const handleDataLoaded = (): void => {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve();
                }
            };

            graphtyElement.addEventListener("data-loaded", handleDataLoaded, {once: true});
        });
    }
}

// Helper to wait for graph to settle - now uses pre-attached listeners
// For URL-based data sources, this function first waits for data to load
export async function waitForGraphSettled(canvasElement: HTMLElement): Promise<void> {
    const graphtyElement = canvasElement.querySelector("graphty-element");
    if (!graphtyElement) {
        return;
    }

    // First, wait for data to load (important for URL-based data sources)
    // This ensures the layout has a chance to run before we wait for settling
    await waitForDataLoaded(canvasElement);

    // For static layouts, the settled event may fire immediately on the first render
    // We need to give the render loop a chance to run
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check if we have pre-attached promises
    const state = eventWaitingState.get(graphtyElement as HTMLElement);
    if (state?.promises.has("graph-settled")) {
        // Get the settled promise
        const settledPromise = state.promises.get("graph-settled");
        if (!settledPromise) {
            return;
        }

        // Longer timeout for physics-based layouts to settle (5 seconds)
        const timeoutPromise = new Promise<void>((resolve) => {
            setTimeout(() => {
                // For static layouts, this is not an error - they may have already settled
                resolve();
            }, 5000);
        });

        await Promise.race([settledPromise, timeoutPromise]);
    } else {
        // Fallback to original implementation if decorator wasn't used

        // Give the graph a moment to initialize and potentially fire the event
        await new Promise((resolve) => setTimeout(resolve, 100));

        await new Promise<void>((resolve) => {
            let settled = false;

            // Longer timeout for physics-based layouts (5 seconds)
            const timeout = setTimeout(() => {
                if (!settled) {
                    // Not a warning - static layouts may have already settled
                    settled = true;
                    resolve();
                }
            }, 5000);

            const handleSettled = (): void => {
                if (!settled) {
                    settled = true;
                    clearTimeout(timeout);
                    resolve();
                }
            };

            graphtyElement.addEventListener("graph-settled", handleSettled, {once: true});
        });
    }

    // Render a fixed number of frames after settling to ensure Babylon.js completes rendering
    // Only needed for Chromatic visual testing - skip for regular tests to improve performance
    if (isChromatic()) {
        // Access private updateManager for Chromatic rendering - using type assertion since this is test-only code
        const {graph} = graphtyElement as Graphty;
        const updateMgr = (graph as unknown as {updateManager: {renderFixedFrames: (n: number) => void}}).updateManager;
        updateMgr.renderFixedFrames(30); // 30 frames = 0.5s at 60fps
    }
}

// Helper to wait for skybox to load - only call this if your story actually uses a skybox
export async function waitForSkyboxLoaded(canvasElement: HTMLElement): Promise<void> {
    const graphtyElement = canvasElement.querySelector("graphty-element");
    if (!graphtyElement) {
        // No element to wait for
        return;
    }

    // Since skybox-loaded is not in the default decorator events, we always use direct listener
    await new Promise<void>((resolve) => {
        let resolved = false;

        // Short timeout - if skybox hasn't loaded quickly, it's probably not configured
        const timeout = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                // This is only called by stories that explicitly configure a skybox,
                // so a timeout here might indicate a real issue
                console.warn("[Warning] skybox-loaded event timeout (2s) - skybox may have failed to load");
                resolve();
            }
        }, 2000);

        const handleSkyboxLoaded = (): void => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                resolve();
            }
        };

        graphtyElement.addEventListener("skybox-loaded", handleSkyboxLoaded, {once: true});

        // Check if the skybox might have already loaded
        // Give it a tiny delay to see if the event fires immediately
        setTimeout(() => {
            if (!resolved) {
                // Still waiting - skybox is probably loading
            }
        }, 10);
    });
}

// Re-export all the original helpers unchanged
export interface TemplateOpts {
    nodeStyle?: Record<string, unknown>;
    nodeSelector?: string;
    nodeCalculatedStyle?: CalculatedStyleConfig;
    edgeStyle?: Record<string, unknown>;
    edgeSelector?: string;
    edgeCalculatedStyle?: CalculatedStyleConfig;
    algorithms?: string[];
    graph?: Record<string, unknown>;
    layers?: StyleLayerType[];
    behavior?: Record<string, unknown>;
    data?: Record<string, unknown>;
}

export function templateCreator(opts: TemplateOpts): StyleSchema {
    const config = {
        graphtyTemplate: true,
        majorVersion: "1",
        graph: {
            addDefaultStyle: true,
        },
        // Add default behavior with preSteps for Chromatic testing
        // Most layouts don't need preSteps (they compute to completion immediately)
        // Only physics-based layouts (ngraph, d3) need preSteps
        behavior: {
            layout: {
                preSteps: isChromatic() ? 2000 : 0, // 2000 for Chromatic visual tests, 0 for regular tests
            },
        },
    } as unknown as AdHocData;

    if (opts.nodeStyle) {
        deepSet(config, "layers[0].node.style", opts.nodeStyle);
        deepSet(config, "layers[0].node.selector", opts.nodeSelector ?? "");
    }

    if (opts.nodeCalculatedStyle) {
        deepSet(config, "layers[0].node.calculatedStyle", opts.nodeCalculatedStyle);
        deepSet(config, "layers[0].node.selector", opts.nodeSelector ?? "");
        deepSet(config, "layers[0].node.style", opts.nodeStyle ?? {});
    }

    if (opts.edgeStyle) {
        deepSet(config, "layers[0].edge.style", opts.edgeStyle);
        deepSet(config, "layers[0].edge.selector", opts.edgeSelector ?? "");
    }

    if (opts.edgeCalculatedStyle) {
        deepSet(config, "layers[0].edge.calculatedStyle", opts.edgeCalculatedStyle);
        deepSet(config, "layers[0].edge.selector", opts.edgeSelector ?? "");
        deepSet(config, "layers[0].edge.style", opts.edgeStyle ?? {});
    }

    if (opts.algorithms) {
        deepSet(config, "data.algorithms", opts.algorithms);
    }

    if (opts.layers) {
        deepSet(config, "layers", opts.layers);
    }

    if (opts.graph) {
        // Merge with existing graph config instead of overwriting
        config.graph = {... config.graph, ... opts.graph};
    }

    if (opts.behavior) {
        // Merge behavior options instead of replacing them entirely
        // This preserves the default preSteps setting for Chromatic
        config.behavior = merge({}, config.behavior, opts.behavior);
    }

    if (opts.data) {
        // Merge with any existing data config
        config.data = {... config.data, ... opts.data};
    }

    const template = StyleTemplate.parse(config);

    return template;
}

export const nodeData = [
    {id: 0},
    {id: 1},
    {id: 2},
    {id: 3},
    {id: 4},
    {id: 5},
];

export const edgeData = [
    {src: 0, dst: 1},
    {src: 0, dst: 2},
    {src: 2, dst: 3},
    {src: 3, dst: 0},
    {src: 3, dst: 4},
    {src: 3, dst: 5},
];

type RenderArg1 = Parameters<NonNullable<Meta["render"]>>[0];
type RenderArg2 = Parameters<NonNullable<Meta["render"]>>[1];

export const renderFn = (args: RenderArg1, storyConfig: RenderArg2): Element => {
    const g = document.createElement("graphty-element") as Graphty;

    // Set runAlgorithmsOnLoad BEFORE setting data, because data loading triggers
    // the algorithm-run operation which checks this property
    if (args.runAlgorithmsOnLoad !== undefined) {
        g.runAlgorithmsOnLoad = args.runAlgorithmsOnLoad;
    }

    // Process styleTemplate to apply argTypes modifications
    const t = args.styleTemplate;

    // if argTypes have a name like "texture.color", apply that value to the node style
    for (const arg of Object.getOwnPropertyNames(args)) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const name = storyConfig.argTypes[arg]?.name;

        // if the arg has a name...
        if (name) {
            const val = args[arg];

            // Map control names to the correct template paths
            if (name.startsWith("label.")) {
                // For label properties, check if we're using nodeStyle or layers
                const labelProp = name.substring(6); // Remove "label." prefix
                if (t.nodeStyle) {
                    deepSet(t, `nodeStyle.label.${labelProp}`, val);
                } else if (t.layers) {
                    deepSet(t, `layers[0].node.style.label.${labelProp}`, val);
                }
            } else if (name.startsWith("texture.") || name.startsWith("shape.") || name.startsWith("effect.")) {
                // For other node properties
                if (t.nodeStyle) {
                    deepSet(t, `nodeStyle.${name}`, val);
                } else if (t.layers) {
                    deepSet(t, `layers[0].node.style.${name}`, val);
                }
            } else if (name.startsWith("line.") || name.startsWith("arrowHead.") || name.startsWith("arrowTail.") || name.startsWith("tooltip.")) {
                // For edge properties (including tail and tooltip)
                if (t.edgeStyle) {
                    deepSet(t, `edgeStyle.${name}`, val);
                } else if (t.layers) {
                    deepSet(t, `layers[0].edge.style.${name}`, val);
                }
            } else if (name.startsWith("graph.layoutOptions.")) {
                // For layout options
                const configKey = name.substring(20); // Remove "graph.layoutOptions." prefix
                if (val !== undefined) {
                    deepSet(t, `graph.layoutOptions.${configKey}`, val);
                }
            } else if (!["dataSource", "dataSourceConfig", "layout", "layoutConfig", "styleTemplate", "nodeData", "edgeData", "runAlgorithmsOnLoad", "onGraphSettled", "onSkyboxLoaded", "xr"].includes(arg)) {
                // For other properties, apply directly (but skip component-level props and event handlers)
                deepSet(t, name, val);
            }
        }
    }

    // Set styleTemplate BEFORE adding data, because the trigger checks algorithms in the template
    g.styleTemplate = t;

    // Now add data - this will trigger data-add operation which checks for algorithms
    if (args.dataSource) {
        // Set dataSourceConfig BEFORE dataSource, because setting dataSource
        // triggers addDataFromSource which needs the config
        g.dataSourceConfig = args.dataSourceConfig;
        g.dataSource = args.dataSource;
    } else {
        // Use story-specific data if provided, otherwise use defaults
        g.nodeData = args.nodeData ?? nodeData;
        g.edgeData = args.edgeData ?? edgeData;
    }

    // Set layout properties if provided
    // IMPORTANT: Set layoutConfig BEFORE layout so that when layout triggers
    // setLayout(), it already has access to the seed value for deterministic layouts
    if (args.layoutConfig) {
        g.layoutConfig = args.layoutConfig;
    }

    if (args.layout) {
        g.layout = args.layout;
    }

    // Set XR config if provided
    if (args.xr) {
        g.xr = args.xr;
    }

    return g;
};

/**
 * Decorator that enables remote logging for XR debugging.
 * Logs are sent to the server specified in VITE_REMOTE_LOG_URL env var (default: https://localhost:9077/log)
 * Start the server with: npm run dev:xr
 *
 * Usage:
 * ```
 * export default {
 *     decorators: [eventWaitingDecorator, remoteLoggingDecorator],
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const remoteLoggingDecorator = (story: any): any => {
    // Only enable in browser environment
    if (typeof window !== "undefined") {
        enableRemoteLoggingInBrowser();
    }

    return story();
};

/**
 * Enable remote logging in the browser.
 * Intercepts console.log/warn/error/info and sends to remote server.
 */
function enableRemoteLoggingInBrowser(): void {
    // Don't enable twice
    if ((window as unknown as {__remoteLoggingEnabled?: boolean}).__remoteLoggingEnabled) {
        return;
    }

    (window as unknown as {__remoteLoggingEnabled?: boolean}).__remoteLoggingEnabled = true;

    // Use VITE_REMOTE_LOG_URL env var or fall back to localhost
    const SERVER_URL = (import.meta.env.VITE_REMOTE_LOG_URL as string | undefined) ?? "https://localhost:9077/log";
    const SESSION_ID = `storybook-${Date.now().toString(36)}`;
    const LOG_BUFFER: {time: string, level: string, message: string}[] = [];
    let flushTimer: ReturnType<typeof setTimeout> | null = null;

    // Throttling for repeated messages
    const lastMessages = new Map<string, number>();
    const THROTTLE_MS = 5000;
    const THROTTLE_PATTERNS = [/Max number of touches/, /Max touches exceeded/];

    function shouldThrottle(message: string): boolean {
        for (const pattern of THROTTLE_PATTERNS) {
            if (pattern.test(message)) {
                const key = pattern.source;
                const lastTime = lastMessages.get(key) ?? 0;
                const now = Date.now();
                if (now - lastTime < THROTTLE_MS) {
                    return true;
                }

                lastMessages.set(key, now);
                return false;
            }
        }
        return false;
    }

    function flushLogs(): void {
        if (LOG_BUFFER.length === 0) {
            return;
        }

        const logsToSend = LOG_BUFFER.splice(0, LOG_BUFFER.length);
        fetch(SERVER_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({sessionId: SESSION_ID, logs: logsToSend}),
        }).catch(() => {
            // Put logs back on failure
            LOG_BUFFER.unshift(... logsToSend);
        });
    }

    function formatArgs(args: unknown[]): string {
        return args.map((arg) => {
            if (typeof arg === "object" && arg !== null) {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch {
                    return "[Circular or non-serializable object]";
                }
            }

            return String(arg);
        }).join(" ");
    }

    function queueLog(level: string, args: unknown[]): void {
        const message = formatArgs(args);
        if (shouldThrottle(message)) {
            return;
        }

        LOG_BUFFER.push({
            time: new Date().toISOString(),
            level,
            message,
        });
        if (flushTimer) {
            clearTimeout(flushTimer);
        }

        flushTimer = setTimeout(flushLogs, 100);
    }

    // Store original console methods and override them with remote logging wrappers
    // This is intentional - the remote logging system intercepts console.* calls
    /* eslint-disable no-console */
    const originalConsole = {
        log: console.log.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        info: console.info.bind(console),
    };

    // Override console methods
    console.log = (... args: unknown[]) => {
        originalConsole.log(... args);
        queueLog("LOG", args);
    };
    console.warn = (... args: unknown[]) => {
        originalConsole.warn(... args);
        queueLog("WARN", args);
    };
    console.error = (... args: unknown[]) => {
        originalConsole.error(... args);
        queueLog("ERROR", args);
    };
    console.info = (... args: unknown[]) => {
        originalConsole.info(... args);
        queueLog("INFO", args);
    };

    originalConsole.log(`[RemoteLogging] Enabled with session: ${SESSION_ID}`);
    /* eslint-enable no-console */
}

export const nodeShapes = [
    "box",
    "sphere",
    "cylinder",
    "cone",
    "capsule",
    "torus-knot",
    "tetrahedron",
    "octahedron",
    "dodecahedron",
    "icosahedron",
    "rhombicuboctahedron",
    "triangular_prism",
    "pentagonal_prism",
    "hexagonal_prism",
    "square_pyramid",
    "pentagonal_pyramid",
    "triangular_dipyramid",
    "pentagonal_dipyramid",
    "elongated_square_dipyramid",
    "elongated_pentagonal_dipyramid",
    "elongated_pentagonal_cupola",
    "goldberg",
    "icosphere",
    "geodesic",
] as const;

