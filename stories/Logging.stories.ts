import type {Meta} from "@storybook/web-components-vite";

const meta: Meta = {
    title: "Logging",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
# Logging System

The graphty-element logging system provides configurable, hierarchical logging for debugging and development.

## URL Parameter Configuration

Enable logging via URL parameters:

| Parameter | Example | Description |
|-----------|---------|-------------|
| \`graphty-element-logging=true\` | Enable all modules | Turns on logging for all modules at default level |
| \`graphty-element-logging=layout,xr\` | Enable specific modules | Only log from specified modules |
| \`graphty-element-logging=layout:debug,xr:trace\` | Per-module levels | Set different log levels per module |
| \`graphty-element-log-level=debug\` | Set global level | Override the default log level |

## Log Levels

From least to most verbose:

1. **silent** - No logging
2. **error** - Errors only
3. **warn** - Warnings and above
4. **info** - Info and above
5. **debug** - Debug and above
6. **trace** - All messages

## Programmatic Usage

\`\`\`typescript
import { GraphtyLogger, LogLevel } from "@graphty/graphty-element";

// Configure logging
await GraphtyLogger.configure({
    enabled: true,
    level: LogLevel.DEBUG,
    modules: "*", // or ["layout", "xr"]
    format: { timestamp: true, module: true }
});

// Get a logger for a specific module
const logger = GraphtyLogger.getLogger(["graphty", "myModule"]);
logger.info("Message", { data: "value" });
logger.debug("Debug info");
logger.error("Something went wrong", error);
\`\`\`
`,
            },
        },
    },
};

export default meta;
