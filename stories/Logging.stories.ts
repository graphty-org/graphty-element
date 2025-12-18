import type {Meta, StoryObj} from "@storybook/web-components-vite";
import {html} from "lit";

import type {Graphty} from "../src/graphty-element.js";
import {GraphtyLogger, LogLevel, parseLoggingURLParams} from "../src/logging/index.js";
import {edgeData, eventWaitingDecorator, nodeData, templateCreator, waitForGraphSettled} from "./helpers.js";

const meta: Meta = {
    title: "Logging",
    decorators: [eventWaitingDecorator],
    parameters: {
        layout: "fullscreen",
    },
    argTypes: {
        logLevel: {
            control: "select",
            options: ["silent", "error", "warn", "info", "debug", "trace"],
            description: "Log level to use",
        },
        modules: {
            control: "text",
            description: "Comma-separated list of modules to enable, or '*' for all",
        },
    },
    args: {
        logLevel: "debug",
        modules: "*",
    },
};

export default meta;
type Story = StoryObj;

const logLevelMap: Partial<Record<string, LogLevel>> = {
    silent: LogLevel.SILENT,
    error: LogLevel.ERROR,
    warn: LogLevel.WARN,
    info: LogLevel.INFO,
    debug: LogLevel.DEBUG,
    trace: LogLevel.TRACE,
};

/**
 * Interactive logging demo. Open the browser console to see log output.
 *
 * You can also enable logging via URL parameters:
 * - `?graphty-element-logging=true` - Enable all logging at default level
 * - `?graphty-element-logging=layout,xr` - Enable specific modules
 * - `?graphty-element-logging=layout:debug,xr:trace` - Enable modules with specific levels
 * - `?graphty-element-log-level=debug` - Set global log level
 */
export const Demo: Story = {
    render: (args) => {
        // Check URL params first - they override Storybook controls
        const urlParams = parseLoggingURLParams();

        // If URL explicitly disables logging (returns null when false), respect that
        // Otherwise use Storybook args
        const urlLevel = urlParams !== null ? urlParams.level : undefined;
        const level = urlLevel ?? logLevelMap[args.logLevel as string] ?? LogLevel.DEBUG;
        const modulesArg = args.modules as string;
        const modules = urlParams?.modules ?? (modulesArg === "*" ? "*" : modulesArg.split(",").map((m: string) => m.trim()));

        // URL params returning null means logging is disabled or not specified
        // If URL has graphty-element-logging=false, urlParams will be null
        // We need to check if the URL explicitly has the param set to false
        const urlSearchParams = new URLSearchParams(window.location.search);
        const loggingParamValue = urlSearchParams.get("graphty-element-logging");
        const explicitlyDisabled = loggingParamValue === "false";

        // Configure the logger and then log test messages
        void GraphtyLogger.configure({
            enabled: !explicitlyDisabled,
            level,
            modules,
            format: {timestamp: true, module: true},
        }).then(() => {
            if (explicitlyDisabled) {
                return; // Don't log if explicitly disabled
            }

            // Log test messages after configuration is complete
            const testLogger = GraphtyLogger.getLogger(["graphty", "test"]);
            testLogger.info("Logging demo initialized", {level: args.logLevel, modules: args.modules});
            testLogger.debug("This is a debug message");
            testLogger.trace("This is a trace message (only visible at trace level)");
        });

        return html`
            <div style="padding: 20px; font-family: system-ui, sans-serif;">
                <h2>Logging Demo</h2>
                <p>Open the browser console (F12) to see log output.</p>

                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3>Current Configuration:</h3>
                    <ul>
                        <li><strong>Level:</strong> ${args.logLevel}</li>
                        <li><strong>Modules:</strong> ${args.modules}</li>
                        <li><strong>Enabled:</strong> ${GraphtyLogger.isEnabled()}</li>
                    </ul>
                </div>

                <div style="background: #e8f4e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3>URL Parameter Examples:</h3>
                    <ul>
                        <li><code>?graphty-element-logging=true</code> - Enable all modules</li>
                        <li><code>?graphty-element-logging=layout,xr</code> - Enable specific modules</li>
                        <li><code>?graphty-element-logging=layout:debug,xr:trace</code> - Per-module levels</li>
                        <li><code>?graphty-element-log-level=debug</code> - Set global level</li>
                    </ul>
                </div>

                <div style="background: #e8e8f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3>Log Levels (from least to most verbose):</h3>
                    <ol>
                        <li><strong>silent</strong> - No logging</li>
                        <li><strong>error</strong> - Errors only</li>
                        <li><strong>warn</strong> - Warnings and above</li>
                        <li><strong>info</strong> - Info and above</li>
                        <li><strong>debug</strong> - Debug and above</li>
                        <li><strong>trace</strong> - All messages</li>
                    </ol>
                </div>
            </div>
        `;
    },
};

/**
 * Logging with a real graph. Watch the console for layout and rendering logs.
 */
export const WithGraph: Story = {
    render: (args) => {
        // Check URL params first
        const urlParams = parseLoggingURLParams();
        const urlSearchParams = new URLSearchParams(window.location.search);
        const loggingParamValue = urlSearchParams.get("graphty-element-logging");
        const explicitlyDisabled = loggingParamValue === "false";

        // Configure logging
        const urlLevel = urlParams !== null ? urlParams.level : undefined;
        const level = urlLevel ?? logLevelMap[args.logLevel as string] ?? LogLevel.DEBUG;
        const modulesArg = args.modules as string;
        const modules = urlParams?.modules ?? (modulesArg === "*" ? "*" : modulesArg.split(",").map((m: string) => m.trim()));

        void GraphtyLogger.configure({
            enabled: !explicitlyDisabled,
            level,
            modules,
            format: {timestamp: true, module: true},
        }).then(() => {
            if (explicitlyDisabled) {
                return;
            }

            const logger = GraphtyLogger.getLogger(["graphty", "story"]);
            logger.info("Creating graph with logging enabled");
        });

        const template = templateCreator({
            graph: {
                layout: "circular",
            },
        });

        const g = document.createElement("graphty-element") as Graphty;
        g.styleTemplate = template;
        g.nodeData = nodeData;
        g.edgeData = edgeData;

        return g;
    },
    play: async({canvasElement}) => {
        await waitForGraphSettled(canvasElement);

        const logger = GraphtyLogger.getLogger(["graphty", "story"]);
        logger.info("Graph has settled");
    },
};
