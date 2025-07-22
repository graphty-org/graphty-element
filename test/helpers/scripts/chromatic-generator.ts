#!/usr/bin/env node
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../../..");

interface ArgType {
    control: string | {type: string; min?: number; max?: number; step?: number};
    options?: string[];
    name?: string;
    table?: {category: string};
    defaultValue?: any;
}

interface Meta {
    title: string;
    component: string;
    argTypes?: Record<string, ArgType>;
    [key: string]: any;
}

interface StoryModule {
    default: Meta;
    [key: string]: any;
}

interface Variation {
    name: string;
    value: any;
}

interface VariationSet {
    parameterPath: string;
    parameterName: string;
    variations: Variation[];
}

class ChromaticGenerator {
    private sourceDir = path.join(PROJECT_ROOT, "stories/human");
    private outputDir = path.join(PROJECT_ROOT, "stories/auto-generated");
    private config = {
        parameterGeneration: {
            defaults: {
                numberWithoutRange: [1, 10, 100],
                textDefault: "Test Value",
                dateOffsets: [-86400000, 0, 86400000],
            },
            overrides: {
                "shape.size": [0.5, 1, 2, 5],
                "texture.color.opacity": [0.2, 0.5, 0.8, 1],
                "label.fontSize": [8, 14, 24],
            },
        },
    };

    async generate(): Promise<void> {
        console.log("Starting Chromatic story generation...");

        // Ensure output directory exists
        await this.ensureDirectory(this.outputDir);

        // Find all story files
        const storyFiles = await this.findStoryFiles();
        console.log(`Found ${storyFiles.length} story files`);

        // Process each story file
        for (const storyFile of storyFiles) {
            await this.processStoryFile(storyFile);
        }

        console.log("Chromatic story generation complete!");
    }

    private async ensureDirectory(dir: string): Promise<void> {
        try {
            await fs.mkdir(dir, {recursive: true});
        } catch (error) {
            // Directory might already exist
        }
    }

    private async findStoryFiles(): Promise<string[]> {
        const files = await fs.readdir(this.sourceDir);
        return files
            .filter((file) => file.endsWith(".stories.ts"))
            .map((file) => path.join(this.sourceDir, file));
    }

    private async processStoryFile(filePath: string): Promise<void> {
        console.log(`Processing ${path.basename(filePath)}...`);

        try {
            // Import the story module dynamically
            const relativePath = path.relative(PROJECT_ROOT, filePath);
            const moduleUrl = `file://${path.join(PROJECT_ROOT, relativePath)}`;
            const storyModule = (await import(moduleUrl)) as StoryModule;

            // Extract meta and stories
            const meta = storyModule.default;
            const stories = Object.entries(storyModule)
                .filter(([key]) => key !== "default")
                .reduce((acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                }, {} as Record<string, any>);

            // Generate variations for each parameter
            const variationSets = this.generateVariationSets(meta.argTypes || {});

            // Generate the test file content
            const content = this.generateTestFileContent(filePath, meta, stories, variationSets);

            // Determine output path based on story title
            const outputPath = this.getOutputPath(filePath, meta.title);

            // Write the generated file
            await this.writeGeneratedFile(outputPath, content);
        } catch (error) {
            console.error(`Error processing ${filePath}:`, error);
        }
    }

    private generateVariationSets(argTypes: Record<string, ArgType>): VariationSet[] {
        const variationSets: VariationSet[] = [];

        for (const [paramName, argType] of Object.entries(argTypes)) {
            const variations = this.generateVariations(paramName, argType);
            if (variations.length > 0) {
                variationSets.push({
                    parameterPath: argType.name || paramName,
                    parameterName: paramName,
                    variations,
                });
            }
        }

        return variationSets;
    }

    private generateVariations(paramName: string, argType: ArgType): Variation[] {
        const {control, options} = argType;
        const paramPath = argType.name || paramName;

        // Check for overrides first
        if (this.config.parameterGeneration.overrides[paramPath]) {
            return this.config.parameterGeneration.overrides[paramPath].map((value) => ({
                name: String(value).replace(/\./g, "_").replace(/[^a-zA-Z0-9_]/g, ""),
                value,
            }));
        }

        // Handle different control types
        if (typeof control === "object" && control.type === "range") {
            return this.generateRangeVariations(control.min!, control.max!);
        }

        if (control === "select" && options) {
            return options.map((opt) => ({
                name: String(opt).replace(/[^a-zA-Z0-9_]/g, "_"),
                value: opt,
            }));
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
            return [{name: "default", value: argType.defaultValue || this.config.parameterGeneration.defaults.textDefault}];
        }

        if (control === "number") {
            return this.config.parameterGeneration.defaults.numberWithoutRange.map((value) => ({
                name: `value_${value}`,
                value,
            }));
        }

        // Default case - use the default value if available
        if (argType.defaultValue !== undefined) {
            return [{name: "default", value: argType.defaultValue}];
        }

        return [];
    }

    private generateRangeVariations(min: number, max: number): Variation[] {
        const mid = (min + max) / 2;
        return [
            {name: `min_${String(min).replace(/\./g, "_")}`, value: min},
            {name: `mid_${String(mid).replace(/\./g, "_")}`, value: mid},
            {name: `max_${String(max).replace(/\./g, "_")}`, value: max},
        ];
    }

    private generateTestFileContent(
        filePath: string,
        meta: Meta,
        stories: Record<string, any>,
        variationSets: VariationSet[]
    ): string {
        const fileName = path.basename(filePath, ".stories.ts");
        const relativeImportPath = `../../human/${fileName}.stories`;

        let content = `// AUTO-GENERATED FILE - DO NOT EDIT
// Source: stories/human/${fileName}.stories.ts
// Generated: ${new Date().toISOString()}

import {Meta, StoryObj} from "@storybook/web-components-vite";
import * as OriginalStories from "${relativeImportPath}";

const meta: Meta = {
    ...OriginalStories.default,
    title: \`Chromatic/Auto/\${OriginalStories.default.title}\`,
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
        for (const [storyName, story] of Object.entries(stories)) {
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

    private getOutputPath(sourcePath: string, storyTitle: string): string {
        const fileName = path.basename(sourcePath, ".stories.ts");
        
        // Determine subdirectory based on story title
        let subDir = "";
        if (storyTitle.includes("Node")) {
            subDir = "node";
        } else if (storyTitle.includes("Edge")) {
            subDir = "edge";
        } else if (storyTitle.includes("Layout")) {
            subDir = "layout";
        } else if (storyTitle.includes("Graph")) {
            subDir = "graph";
        } else if (storyTitle.includes("Label")) {
            subDir = "label";
        } else {
            subDir = "misc";
        }

        return path.join(this.outputDir, subDir, `${fileName}.chromatic.ts`);
    }

    private async writeGeneratedFile(outputPath: string, content: string): Promise<void> {
        // Ensure the directory exists
        const dir = path.dirname(outputPath);
        await this.ensureDirectory(dir);

        // Write the file
        await fs.writeFile(outputPath, content, "utf8");
        console.log(`Generated: ${path.relative(PROJECT_ROOT, outputPath)}`);
    }
}

// Run the generator
if (import.meta.url === `file://${__filename}`) {
    const generator = new ChromaticGenerator();
    generator.generate().catch(console.error);
}