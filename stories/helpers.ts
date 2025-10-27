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
                    const element = node as HTMLElement;

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

// Helper to wait for graph to settle - now uses pre-attached listeners
export async function waitForGraphSettled(canvasElement: HTMLElement): Promise<void> {
    const graphtyElement = canvasElement.querySelector("graphty-element");
    if (!graphtyElement) {
        console.info("[Info] No graphty-element found in canvas element");
        return;
    }

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

        const timeoutPromise = new Promise<void>((resolve) => {
            setTimeout(() => {
                // For static layouts, this is not an error - they may have already settled
                console.info("[Info] graph-settled event wait completed (timeout)");
                resolve();
            }, 500); // Much shorter timeout since static layouts settle immediately
        });

        await Promise.race([settledPromise, timeoutPromise]);
    } else {
        // Fallback to original implementation if decorator wasn't used
        console.info("[Info] Event waiting decorator not active, using fallback approach");

        // Give the graph a moment to initialize and potentially fire the event
        await new Promise((resolve) => setTimeout(resolve, 100));

        await new Promise<void>((resolve) => {
            let settled = false;

            const timeout = setTimeout(() => {
                if (!settled) {
                    // Not a warning - static layouts may have already settled
                    console.info("[Info] graph-settled event wait completed (timeout)");
                    settled = true;
                    resolve();
                }
            }, 500); // Much shorter timeout

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
        const graph = (graphtyElement as Graphty & {["#graph"]?: {updateManager?: {renderFixedFrames: (count: number) => void}}})["#graph"];
        if (graph?.updateManager) {
            graph.updateManager.renderFixedFrames(30); // 30 frames = 0.5s at 60fps
        }
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
            } else if (name.startsWith("graph.layoutOptions.")) {
                // For layout options
                const configKey = name.substring(20); // Remove "graph.layoutOptions." prefix
                if (val !== undefined) {
                    deepSet(t, `graph.layoutOptions.${configKey}`, val);
                }
            } else if (!["dataSource", "dataSourceConfig", "layout", "layoutConfig", "styleTemplate", "nodeData", "edgeData", "runAlgorithmsOnLoad", "onGraphSettled", "onSkyboxLoaded"].includes(arg)) {
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
    if (args.layout) {
        g.layout = args.layout;
    }

    if (args.layoutConfig) {
        g.layoutConfig = args.layoutConfig;
    }

    return g;
};

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
    "elongated_square_dypyramid",
    "elongated_pentagonal_dipyramid",
    "elongated_pentagonal_cupola",
    "goldberg",
    "icosphere",
    "geodesic",
];

