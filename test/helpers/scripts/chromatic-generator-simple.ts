#!/usr/bin/env node
/**
 * Simple Chromatic generator that creates test stories without importing the source files
 * This avoids ESM/CommonJS compatibility issues
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../../..");

interface ArgTypeConfig {
    control?: string | {type: string, min?: number, max?: number, options?: string[]};
    options?: string[];
    name: string;
}

interface StoryConfig {
    fileName: string;
    title: string;
    argTypes: Record<string, ArgTypeConfig>;
    stories: string[];
}

// Manually define the story configurations based on what we know about the stories
const storyConfigs: StoryConfig[] = [
    {
        fileName: "NodeStyles",
        title: "Styles/Node",
        argTypes: {
            nodeColor: {control: "color", name: "texture.color"},
            nodeShape: {control: "select", options: [
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
                "geodesic",
            ], name: "shape.type"},
            nodeSize: {control: {type: "range", min: 0.1, max: 10}, name: "shape.size"},
            nodeWireframe: {control: "boolean", name: "effect.wireframe"},
            nodeLabelEnabled: {control: "boolean", name: "label.enabled"},
            advancedNodeColor: {control: "color", name: "texture.color.value"},
            advancedNodeOpacity: {control: {type: "range", min: 0.1, max: 1}, name: "texture.color.opacity"},
        },
        stories: ["Default", "Color", "Shape", "Size", "Wireframe", "Label", "Opacity"],
    },
    {
        fileName: "EdgeStyles",
        title: "Styles/Edge",
        argTypes: {
            edgeLineWidth: {control: {type: "range", min: 0.1, max: 10}, name: "line.width"},
            edgeLineColor: {control: "color", name: "line.color"},
            edgeArrowForward: {control: "boolean", name: "arrow.forward"},
            edgeArrowBackward: {control: "boolean", name: "arrow.backward"},
            edgeLineOpacity: {control: {type: "range", min: 0.1, max: 1}, name: "line.opacity"},
            edgeLineDashed: {control: "boolean", name: "line.dashed"},
            edgeLabelEnabled: {control: "boolean", name: "label.enabled"},
        },
        stories: ["Default", "Width", "NormalArrowHead"],
    },
    {
        fileName: "LabelStyles",
        title: "Styles/Label",
        argTypes: {
            labelEnabled: {control: "boolean", name: "label.enabled"},
            labelPosition: {control: "select", options: ["center", "above", "below"], name: "label.position"},
            labelFontSize: {control: {type: "range", min: 8, max: 24}, name: "label.style.fontSize"},
            labelColor: {control: "color", name: "label.style.color"},
            labelBackgroundColor: {control: "color", name: "label.style.backgroundColor"},
            labelFontFamily: {control: "text", name: "label.style.fontFamily"},
        },
        stories: ["Default",
            "Enabled",
            "TextPath",
            "StaticText",
            "FontType",
            "FontSize",
            "FontWeight",
            "TextColor",
            "BackgroundColor",
            "CornerRadius",
            "Location",
            "Margin",
            "AttachOffset",
            "LineHeight",
            "TextOutline",
            "TextShadow",
            "Border",
            "BackgroundGradient",
            "Pointer",
            "Animation",
            "Badge",
            "SmartOverflow",
            "MaxNumber",
            "OverflowSuffix",
            "TextAlign",
            "DepthFade",
            "EmojiLabels",
            "UnicodeText"],
    },
    {
        fileName: "GraphStyles",
        title: "Styles/Graph",
        argTypes: {
            skybox: {control: "text", name: "graph.background.skybox"},
            background: {control: "color", name: "graph.background.color"},
            fog: {control: "boolean", name: "graph.environment.fog"},
            ground: {control: "boolean", name: "graph.environment.ground"},
            groundColor: {control: "color", name: "graph.environment.groundColor"},
            mode2D: {control: "boolean", name: "graph.mode2D"},
        },
        stories: ["Default", "Skybox", "BackgroundColor", "Layers"],
    },
    {
        fileName: "Layout",
        title: "Layout/3D",
        argTypes: {
            d3AlphaMin: {control: {type: "range", min: 0.001, max: 0.5}, name: "graph.layoutOptions.alphaMin"},
            d3AlphaDecay: {control: {type: "range", min: 0.01, max: 0.99}, name: "graph.layoutOptions.alphaDecay"},
            d3ChargeStrength: {control: {type: "range", min: -1000, max: 0}, name: "graph.layoutOptions.chargeStrength"},
            d3LinkDistance: {control: {type: "range", min: 10, max: 200}, name: "graph.layoutOptions.linkDistance"},
        },
        stories: ["ngraph", "D3", "Circular", "Random", "Spring", "KamadaKawai", "ForceAtlas2"],
    },
    {
        fileName: "Layout2D",
        title: "Layout/2D",
        argTypes: {
            springK: {control: {type: "number"}, name: "graph.layoutOptions.k"},
            springLength: {control: {type: "range", min: 10, max: 200}, name: "graph.layoutOptions.restLength"},
            springMaxIterations: {control: {type: "number"}, name: "graph.layoutOptions.maxIterations"},
            multipartiteAlign: {control: {type: "select", options: ["vertical", "horizontal"]}, name: "graph.layoutOptions.align"},
            bipartiteAlign: {control: {type: "select", options: ["vertical", "horizontal"]}, name: "graph.layoutOptions.align"},
            bfsAlign: {control: {type: "select", options: ["vertical", "horizontal"]}, name: "graph.layoutOptions.align"},
        },
        stories: ["Spiral",
            "Circular",
            "Shell",
            "Random",
            "Spring",
            "Planar",
            "KamadaKawai",
            "ForceAtlas2",
            "Arf",
            "Bfs",
            "Bipartite",
            "Multipartite"],
    },
];

class SimpleChromaticGenerator {
    private outputDir = path.join(PROJECT_ROOT, "stories/auto-generated");

    async generate(): Promise<void> {
        // console.log("Starting Chromatic story generation (simple mode)...");

        // Ensure output directory exists
        await this.ensureDirectory(this.outputDir);

        // Process each story configuration
        for (const config of storyConfigs) {
            await this.processStoryConfig(config);
        }

        // console.log("Chromatic story generation complete!");
    }

    private async ensureDirectory(dir: string): Promise<void> {
        try {
            await fs.mkdir(dir, {recursive: true});
        } catch {
            // Directory might already exist
        }
    }

    private async processStoryConfig(config: StoryConfig): Promise<void> {
        // console.log(`Processing ${config.fileName}...`);

        try {
            // Generate variations for each parameter
            const variationSets = this.generateVariationSets(config.argTypes);

            // Generate the test file content
            const content = this.generateTestFileContent(config, variationSets);

            // Determine output path
            const outputPath = this.getOutputPath(config);

            // Write the generated file
            await this.writeGeneratedFile(outputPath, content);
        } catch (error) {
            console.error(`Error processing ${config.fileName}:`, error);
        }
    }

    private generateVariationSets(argTypes: Record<string, ArgTypeConfig>): {parameterName: string, variations: {name: string, value: unknown}[]}[] {
        const variationSets: {parameterName: string, variations: {name: string, value: unknown}[]}[] = [];

        for (const [paramName, argType] of Object.entries(argTypes)) {
            const variations = this.generateVariations(paramName, argType);
            if (variations.length > 0) {
                variationSets.push({
                    parameterName: paramName,
                    variations,
                });
            }
        }

        return variationSets;
    }

    private generateVariations(paramName: string, argType: ArgTypeConfig): {name: string, value: unknown}[] {
        const {control, options} = argType;

        // Handle different control types
        if (typeof control === "object" && control.type === "range") {
            const {min = 0, max = 100} = control;
            const mid = (min + max) / 2;
            return [
                {name: `min_${String(min).replace(/\./g, "_")}`, value: min},
                {name: `mid_${String(mid).replace(/\./g, "_")}`, value: mid},
                {name: `max_${String(max).replace(/\./g, "_")}`, value: max},
            ];
        }

        if (control === "select" || (typeof control === "object" && control.type === "select")) {
            const opts = options ?? (typeof control === "object" ? control.options : undefined);
            if (opts) {
                return opts.map((opt: string) => ({
                    name: String(opt).replace(/[^a-zA-Z0-9_]/g, "_"),
                    value: opt,
                }));
            }
        }

        if (control === "boolean") {
            return [
                {name: "true", value: true},
                {name: "false", value: false},
            ];
        }

        if (control === "color") {
            return [
                {name: "hex", value: "#FF5733"},
                {name: "named", value: "blue"},
                {name: "rgb", value: "rgb(128, 256, 0)"},
                {name: "rgba", value: "rgba(255, 0, 0, 0.5)"},
            ];
        }

        if (control === "text" || control === "string") {
            return [{name: "default", value: "Test Value"}];
        }

        if (control === "number" || typeof control === "number") {
            return [
                {name: "value_1", value: 1},
                {name: "value_10", value: 10},
                {name: "value_100", value: 100},
            ];
        }

        return [];
    }

    private generateTestFileContent(config: StoryConfig, variationSets: {parameterName: string, variations: {name: string, value: unknown}[]}[]): string {
        const {fileName, title, stories} = config;

        let content = `// AUTO-GENERATED FILE - DO NOT EDIT
// Source: stories/human/${fileName}.stories.ts
// Generated: ${new Date().toISOString()}

import {Meta, StoryObj} from "@storybook/web-components-vite";
import * as OriginalStories from "../../human/${fileName}.stories";

const meta: Meta = {
    ...OriginalStories.default,
    title: "Chromatic/Auto/${title}",
    tags: ["!dev", "chromatic-auto"],
    parameters: {
        chromatic: {delay: 2000},
        controls: {hideNoControlsWarning: true},
    },
};

export default meta;

type Story = StoryObj;

`;

        // Generate variations for each story
        for (const storyName of stories) {
            // If no variations, create a single test that duplicates the original
            if (variationSets.length === 0) {
                content += `export const ${storyName}_default: Story = {
    ...OriginalStories.${storyName},
};\n\n`;
                continue;
            }

            // Generate a variation for each parameter
            for (const variationSet of variationSets) {
                for (const variation of variationSet.variations) {
                    const exportName = `${storyName}_${variationSet.parameterName}_${variation.name}`;
                    const validExportName = exportName.replace(/[^a-zA-Z0-9_]/g, "_");

                    content += `export const ${validExportName}: Story = {
    ...OriginalStories.${storyName},
    args: {
        ...OriginalStories.${storyName}.args,
        ${variationSet.parameterName}: ${JSON.stringify(variation.value)},
    },
};\n\n`;
                }
            }
        }

        return content;
    }

    private getOutputPath(config: StoryConfig): string {
        const {fileName, title} = config;

        // Determine subdirectory based on story title
        let subDir = "";
        if (title.includes("Node")) {
            subDir = "node";
        } else if (title.includes("Edge")) {
            subDir = "edge";
        } else if (title.includes("Layout")) {
            subDir = "layout";
        } else if (title.includes("Graph")) {
            subDir = "graph";
        } else if (title.includes("Label")) {
            subDir = "label";
        } else {
            subDir = "misc";
        }

        return path.join(this.outputDir, subDir, `${fileName}.stories.ts`);
    }

    private async writeGeneratedFile(outputPath: string, content: string): Promise<void> {
        // Ensure the directory exists
        const dir = path.dirname(outputPath);
        await this.ensureDirectory(dir);

        // Write the file
        await fs.writeFile(outputPath, content, "utf8");
        // console.log(`Generated: ${path.relative(PROJECT_ROOT, outputPath)}`);
    }
}

// Run the generator
if (import.meta.url === `file://${__filename}`) {
    const generator = new SimpleChromaticGenerator();
    generator.generate().catch(console.error);
}
