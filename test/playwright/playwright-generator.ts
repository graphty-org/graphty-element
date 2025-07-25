#!/usr/bin/env node
/**
 * AST-based Playwright generator that parses story files to determine what to test
 * This uses the story's parameters.controls.include as the source of truth
 * 
 * Performance Optimizations:
 * - Pre-steps: Pre-calculates physics layouts to avoid expensive settlement detection
 * - Static layouts: Skip settlement entirely for deterministic layouts (circular, random, etc.)
 * - Render count: Minimal frames needed for visual stability
 * - Wait times: Eliminated unnecessary delays
 * 
 * Speed targets:
 * - Simple tests: 3-5 seconds
 * - Complex tests: 5-8 seconds
 * - Average: ~5-7 seconds
 * 
 * Trade-offs:
 * - Lower pre-steps = faster but potentially less deterministic
 * - Higher pre-steps = slower but more reliable
 * - Current values are optimized for ~5 second test execution
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {fileURLToPath} from "node:url";

import * as ts from "typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

/**
 * Performance Configuration
 * Adjust these values to balance speed vs reliability
 */
const PERFORMANCE_CONFIG = {
    // Pre-steps for physics layouts (higher = more deterministic but slower)
    preSteps: {
        // Style tests need pixel-perfect accuracy
        styleEdge: 1500,       // ~3s - Increased for faster settlement
        styleLabel: 1500,      // ~3s - Labels pre-calculated
        styleGraph: 1500,      // ~3s - Graph layers pre-calculated
        styleOther: 1200,      // ~3s - Other style tests
        layoutTest: 1000,      // ~2-3s - Layout tests
        
        // Specific physics engines - aggressive pre-calculation
        d3Force: 1000,         // ~2-3s - D3 force layout fully pre-calculated
        spring: 800,           // ~2-3s - Spring layouts
        forceAtlas: 800,       // ~2-3s - ForceAtlas2
        kamadaKawai: 200,      // ~2s - Faster convergence
    },
    
    // Render counts (lower = faster)
    renderCount: {
        static: 2,             // Static layouts need minimal frames
        physics: 1,            // Physics with pre-steps need only 1 frame
        physicsNoPreSteps: 5,  // Physics without pre-steps need more frames
    },
    
    // Thresholds for visual comparison
    threshold: {
        static: 0.02,          // Static layouts can be more strict
        physics: 0.035,        // Physics layouts need more tolerance
    }
};

interface StoryInfo {
    name: string;
    controls?: string[];
    args?: Record<string, any>;
}

interface StoryFileMetadata {
    fileName: string;
    title: string;
    stories: StoryInfo[];
    argTypes: Record<string, any>;
    metaArgs?: Record<string, any>;
}

class ASTPlaywrightGenerator {
    private outputDir = path.join(PROJECT_ROOT, "test/playwright/generated");
    private storiesDir = path.join(PROJECT_ROOT, "stories/human");
    private baseUrl = "http://dev.ato.ms:9025";
    private generateFastTests = true; // Enable fast test generation

    async generate(): Promise<void> {
        console.log("🚀 Starting AST-based Playwright test generation...");

        // Clean and create output directory
        try {
            await fs.rm(this.outputDir, {recursive: true});
        } catch {
            // Directory might not exist
        }
        await fs.mkdir(this.outputDir, {recursive: true});

        // Process each story file
        const storyFiles = await this.getStoryFiles();
        for (const file of storyFiles) {
            await this.processStoryFile(file);
        }

        console.log("✨ Playwright test generation complete!");
    }

    private async getStoryFiles(): Promise<string[]> {
        const files = await fs.readdir(this.storiesDir);
        return files
            .filter((f) => f.endsWith(".stories.ts"))
            .map((f) => path.join(this.storiesDir, f));
    }

    private async processStoryFile(filePath: string): Promise<void> {
        const fileName = path.basename(filePath, ".stories.ts");
        console.log(`📖 Processing ${fileName}...`);

        try {
            const content = await fs.readFile(filePath, "utf-8");
            const metadata = this.parseStoryFile(content, fileName);

            // Generate regular test file content
            const testContent = this.generateTestFileContent(metadata);
            const outputPath = path.join(this.outputDir, `${fileName}.visual.spec.ts`);
            await fs.writeFile(outputPath, testContent, "utf8");
            console.log(`  ✅ Generated ${path.relative(PROJECT_ROOT, outputPath)}`);
            
            // Generate fast test file if enabled
            if (this.generateFastTests) {
                const fastTestContent = this.generateFastTestFileContent(metadata);
                const fastOutputPath = path.join(this.outputDir, `${fileName}.fast.visual.spec.ts`);
                await fs.writeFile(fastOutputPath, fastTestContent, "utf8");
                console.log(`  ⚡ Generated ${path.relative(PROJECT_ROOT, fastOutputPath)}`);
            }
        } catch (error) {
            console.error(`  ❌ Error processing ${fileName}:`, error);
        }
    }

    private parseStoryFile(content: string, fileName: string): StoryFileMetadata {
        const sourceFile = ts.createSourceFile(
            fileName,
            content,
            ts.ScriptTarget.Latest,
            true,
        );

        const metadata: StoryFileMetadata = {
            fileName,
            title: "",
            stories: [],
            argTypes: {},
        };

        const visit = (node: ts.Node) => {
            // Find meta object
            if (ts.isVariableDeclaration(node) &&
                node.name.getText() === "meta" &&
                node.initializer &&
                ts.isObjectLiteralExpression(node.initializer)) {
                this.parseMetaObject(node.initializer, metadata);
            }

            // Find story exports
            if (ts.isVariableDeclaration(node) &&
                node.initializer &&
                ts.isObjectLiteralExpression(node.initializer)) {
                const storyName = node.name.getText();

                // Check if this looks like a story (uppercase first letter, not meta)
                if (storyName[0] === storyName[0].toUpperCase() && storyName !== "meta") {
                    const storyInfo = this.parseStoryObject(storyName, node.initializer);
                    metadata.stories.push(storyInfo);
                }
            }

            ts.forEachChild(node, visit);
        };

        visit(sourceFile);

        return metadata;
    }

    private parseMetaObject(metaObj: ts.ObjectLiteralExpression, metadata: StoryFileMetadata): void {
        metaObj.properties.forEach((prop) => {
            if (ts.isPropertyAssignment(prop)) {
                const propName = prop.name?.getText();

                if (propName === "title" && ts.isStringLiteral(prop.initializer)) {
                    metadata.title = prop.initializer.text;
                }

                if (propName === "argTypes" && ts.isObjectLiteralExpression(prop.initializer)) {
                    metadata.argTypes = this.parseArgTypes(prop.initializer);
                }

                // Extract args to get meta-level layout configuration
                if (propName === "args" && ts.isObjectLiteralExpression(prop.initializer)) {
                    metadata.metaArgs = this.extractArgs(prop.initializer);
                }
            }
        });
    }

    private parseStoryObject(name: string, storyObj: ts.ObjectLiteralExpression): StoryInfo {
        const storyInfo: StoryInfo = {name};

        storyObj.properties.forEach((prop) => {
            if (ts.isPropertyAssignment(prop)) {
                const propName = prop.name?.getText();

                if (propName === "parameters" && ts.isObjectLiteralExpression(prop.initializer)) {
                    const controls = this.extractControlsInclude(prop.initializer);
                    if (controls.length > 0) {
                        storyInfo.controls = controls;
                    }
                }

                // Extract args to check for layout
                if (propName === "args" && ts.isObjectLiteralExpression(prop.initializer)) {
                    storyInfo.args = this.extractArgs(prop.initializer);
                }
            }
        });

        return storyInfo;
    }

    private extractArgs(argsObj: ts.ObjectLiteralExpression): Record<string, any> {
        const args: Record<string, any> = {};
        
        argsObj.properties.forEach((prop) => {
            if (ts.isPropertyAssignment(prop)) {
                const propName = prop.name?.getText();
                if (propName && ts.isStringLiteral(prop.initializer)) {
                    args[propName] = prop.initializer.text;
                }
            }
        });
        
        return args;
    }

    private extractControlsInclude(parametersObj: ts.ObjectLiteralExpression): string[] {
        const controls: string[] = [];

        parametersObj.properties.forEach((prop) => {
            if (ts.isPropertyAssignment(prop) && prop.name?.getText() === "controls") {
                if (ts.isObjectLiteralExpression(prop.initializer)) {
                    prop.initializer.properties.forEach((controlProp) => {
                        if (ts.isPropertyAssignment(controlProp) &&
                            controlProp.name?.getText() === "include" &&
                            ts.isArrayLiteralExpression(controlProp.initializer)) {
                            controlProp.initializer.elements.forEach((element) => {
                                if (ts.isStringLiteral(element)) {
                                    controls.push(element.text);
                                }
                            });
                        }
                    });
                }
            }
        });

        return controls;
    }

    private parseArgTypes(argTypesObj: ts.ObjectLiteralExpression): Record<string, any> {
        const argTypes: Record<string, any> = {};

        argTypesObj.properties.forEach((prop) => {
            if (ts.isPropertyAssignment(prop)) {
                const argName = prop.name?.getText() || "";
                const argConfig: any = {};

                if (ts.isObjectLiteralExpression(prop.initializer)) {
                    prop.initializer.properties.forEach((configProp) => {
                        if (ts.isPropertyAssignment(configProp)) {
                            const configName = configProp.name?.getText();

                            if (configName === "control") {
                                if (ts.isStringLiteral(configProp.initializer)) {
                                    argConfig.control = configProp.initializer.text;
                                } else if (ts.isObjectLiteralExpression(configProp.initializer)) {
                                    argConfig.control = this.parseControlConfig(configProp.initializer);
                                }
                            }

                            if (configName === "name" && ts.isStringLiteral(configProp.initializer)) {
                                argConfig.name = configProp.initializer.text;
                            }

                            if (configName === "options" && ts.isArrayLiteralExpression(configProp.initializer)) {
                                argConfig.options = configProp.initializer.elements
                                    .filter(ts.isStringLiteral)
                                    .map((e) => e.text);
                            }
                        }
                    });
                }

                argTypes[argName] = argConfig;
            }
        });

        return argTypes;
    }

    private parseControlConfig(controlObj: ts.ObjectLiteralExpression): any {
        const control: any = {};

        controlObj.properties.forEach((prop) => {
            if (ts.isPropertyAssignment(prop)) {
                const propName = prop.name?.getText();

                if (propName === "type" && ts.isStringLiteral(prop.initializer)) {
                    control.type = prop.initializer.text;
                }

                if (propName === "min" && ts.isNumericLiteral(prop.initializer)) {
                    control.min = Number(prop.initializer.text);
                }

                if (propName === "max" && ts.isNumericLiteral(prop.initializer)) {
                    control.max = Number(prop.initializer.text);
                }

                if (propName === "step" && ts.isNumericLiteral(prop.initializer)) {
                    control.step = Number(prop.initializer.text);
                }

                if (propName === "options" && ts.isArrayLiteralExpression(prop.initializer)) {
                    control.options = prop.initializer.elements
                        .filter(ts.isStringLiteral)
                        .map((e) => e.text);
                }
            }
        });

        return control;
    }

    private generateTestFileContent(metadata: StoryFileMetadata): string {
        const {fileName, title, stories, argTypes} = metadata;
        const storyId = this.generateStoryId(title);

        let content = `// AUTO-GENERATED FILE - DO NOT EDIT
// Source: stories/human/${fileName}.stories.ts
// Generated: ${new Date().toISOString()}

import { test } from '@playwright/test';
import { createVisualTest, TestEnvironment } from '../utils/visual-test.utils';

test.describe('${title} Visual Tests', () => {
  const env: TestEnvironment = {
    baseUrl: '${this.baseUrl}',
    projectName: process.env.TEST_PROJECT_NAME || 'visual',
    defaultConfig: {
      renderCount: ${this.getDefaultRenderCount(title)},
      threshold: 0.035,
      errorRatio: 0.011,
      waitTime: ${this.getDefaultWaitTime(title)}
    }
  };

`;

        // Generate tests for each story
        for (const story of stories) {
            const storyNameKebab = this.toKebabCase(story.name);
            const testStoryId = `${storyId}--${storyNameKebab}`;

            content += `  test.describe('${story.name}', () => {\n`;

            // Default test - include story name to ensure unique screenshot
            const defaultTestName = story.controls && story.controls.length > 0 ? 'default' : storyNameKebab;
            content += `    createVisualTest('${testStoryId}', {
      name: '${defaultTestName}',
      args: {},
      description: 'Default ${story.name} state'
    }, env${this.getStoryOverrides(title, story, metadata.metaArgs)});\n`;

            // Generate variations based on controls.include
            if (story.controls && story.controls.length > 0) {
                content += this.generateControlVariations(testStoryId, story.controls, argTypes);
            }

            content += "  });\n\n";
        }

        content += "});\n";

        return content;
    }

    private generateFastTestFileContent(metadata: StoryFileMetadata): string {
        const {fileName, title, stories, argTypes} = metadata;
        const storyId = this.generateStoryId(title);

        let content = `// AUTO-GENERATED FILE - DO NOT EDIT
// Source: stories/human/${fileName}.stories.ts
// Generated: ${new Date().toISOString()}
// FAST MODE: Reuses page context for faster test execution

import { createReusedPageTest, reusePageTest } from '../utils/reuse-page-fast-test.utils';

createReusedPageTest('${title} Visual Tests (FAST)', '${this.baseUrl}', () => {
`;

        // Group tests by story for better batching
        for (const story of stories) {
            const storyNameKebab = this.toKebabCase(story.name);
            const testStoryId = `${storyId}--${storyNameKebab}`;

            content += `\n  // ${story.name} tests\n`;

            // Get pre-steps for this story
            const overrides = this.getFastStoryPreSteps(title, story, metadata.metaArgs);

            // Default test - include story name to ensure uniqueness
            const defaultTestName = `${storyNameKebab}-default`;
            content += `  reusePageTest('${defaultTestName}', '${testStoryId}', {}, ${overrides.preSteps || 0});\n`;

            // Generate variations
            if (story.controls && story.controls.length > 0) {
                content += this.generateSimpleFastControlVariations(testStoryId, storyNameKebab, story.controls, argTypes, overrides.preSteps || 0);
            }
        }

        content += "});\n";
        return content;
    }

    private generateControlVariations(storyId: string, controls: string[], argTypes: Record<string, any>): string {
        let content = "";

        for (const controlPath of controls) {
            // Map control path to argType key
            const argKey = this.findArgTypeKey(controlPath, argTypes);
            if (!argKey) {
                console.warn(`  ⚠️  Could not find argType for control: ${controlPath}`);
                continue;
            }

            const argType = argTypes[argKey];
            if (!argType) {
                continue;
            }

            const variations = this.generateVariationValues(argKey, argType);
            if (variations.length === 0) {
                continue;
            }

            content += `\n    // Test ${argKey} variations\n`;
            content += `    test.describe('${argKey} variations', () => {\n`;

            for (const variation of variations) {
                const testName = `${argKey}-${variation.name}`;
                const testConfig = this.getTestConfigOverrides(argType, variation.value);

                content += `      createVisualTest('${storyId}', {
        name: '${testName}',
        args: { ${argKey}: ${JSON.stringify(variation.value)} }
      }, env${testConfig ? `, ${JSON.stringify(testConfig)}` : ""});\n\n`;
            }

            content += "    });\n";
        }

        return content;
    }

    private findArgTypeKey(controlPath: string, argTypes: Record<string, any>): string | null {
        // Direct match
        if (argTypes[controlPath]) {
            return controlPath;
        }

        // Try to find by the 'name' property
        for (const [key, argType] of Object.entries(argTypes)) {
            if (argType.name === controlPath) {
                return key;
            }
        }

        // Try without dots (e.g., "texture.color" -> "textureColor")
        const camelCase = controlPath.replace(/\.(\w)/g, (_, letter) => letter.toUpperCase());
        if (argTypes[camelCase]) {
            return camelCase;
        }

        return null;
    }

    private generateVariationValues(paramName: string, argType: any): {name: string, value: any}[] {
        const {control} = argType;
        const argPath = argType.name || paramName;

        // Check for specific parameter overrides based on experimental insights
        const paramOverrides: Record<string, any[]> = {
            "shape.size": [0.5, 1, 2, 5],
            "texture.color.opacity": [0.2, 0.5, 0.8, 1],
            "label.fontSize": [8, 14, 24],
            "label.style.fontSize": [8, 14, 24],
            "line.width": [0.5, 1, 3, 5],
            "line.opacity": [0.3, 0.6, 1],
        };

        if (paramOverrides[argPath]) {
            return paramOverrides[argPath].map((value: any) => ({
                name: String(value).replace(/\./g, "-"),
                value,
            }));
        }

        // Handle different control types
        if (typeof control === "object" && control.type === "range") {
            const {min, max} = control;
            const mid = (min + max) / 2;
            
            // For certain parameters, use smarter values
            if (argPath.includes("opacity") || argPath.includes("alpha")) {
                return [
                    {name: "low", value: Math.max(min, 0.3)},
                    {name: "medium", value: 0.7},
                    {name: "high", value: max},
                ];
            }
            
            return [
                {name: "min", value: min},
                {name: "mid", value: mid},
                {name: "max", value: max},
            ];
        }

        if (control === "select" || (typeof control === "object" && control.type === "select")) {
            const options = argType.options || (typeof control === "object" ? control.options : undefined);
            if (options && options.length <= 5) {
                return options.slice(0, 5).map((opt: any) => ({
                    name: String(opt).replace(/[^a-zA-Z0-9]/g, "-"),
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
                {name: "hex-red", value: "#ff0000"},
                {name: "named-blue", value: "blue"},
                {name: "rgb-green", value: "rgb(0,255,0)"},
                {name: "rgba-transparent", value: "rgba(255,0,0,0.5)"},
            ];
        }

        return [];
    }

    private getTestConfigOverrides(argType: any, value: any): Record<string, any> | null {
        // Add more render frames for transparency
        if (typeof value === "string" && value.includes("rgba")) {
            return {threshold: 0.04};
        }

        return null;
    }

    private generateStoryId(title: string): string {
        return title.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
    }

    private toKebabCase(str: string): string {
        return str
            .replace(/([a-z])([A-Z])/g, "$1-$2")
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
    }

    private getDefaultRenderCount(title: string): number {
        const titleLower = title.toLowerCase();

        // Static layouts need minimal frames
        const staticLayouts = ["circular", "random", "spiral", "shell", "planar"];
        const isStaticLayout = staticLayouts.some((layout) => titleLower.includes(layout));

        if (isStaticLayout) {
            return 5;
        }

        // Physics layouts with pre-steps need fewer frames due to pre-calculation
        const physicsLayouts = ["ngraph", "d3", "spring", "forceatlas", "kamada"];
        const isPhysicsLayout = physicsLayouts.some((layout) => titleLower.includes(layout));

        if (isPhysicsLayout) {
            return 10; // Reduced from 50 - pre-steps handle most settling
        }

        // Style tests need minimal frames
        if (titleLower.includes("style")) {
            return 10;
        }

        return 10; // Reduced default from 15
    }

    private getDefaultWaitTime(title: string): number {
        const titleLower = title.toLowerCase();

        const staticLayouts = ["circular", "random", "spiral", "shell", "planar"];
        const isStaticLayout = staticLayouts.some((layout) => titleLower.includes(layout));

        if (isStaticLayout || titleLower.includes("style")) {
            return 0;
        }

        return 100;
    }

    private getStoryOverrides(title: string, story: StoryInfo, metaArgs?: Record<string, any>): string {
        const storyLower = story.name.toLowerCase();
        const overrides: Record<string, any> = {};

        // Check if story uses a specific layout (story args override meta args)
        const layout = story.args?.layout?.toLowerCase() || metaArgs?.layout?.toLowerCase();

        // Enhanced optimizations based on experimental findings
        // Static layouts - ultra-fast (3-4 second tests)
        // These layouts are deterministic and don't need physics simulation
        if (storyLower === "circular" || storyLower === "random" || storyLower === "spiral" || storyLower === "shell" || storyLower === "planar") {
            overrides.renderCount = PERFORMANCE_CONFIG.renderCount.static;
            overrides.skipSettlement = true; // Skip expensive position monitoring
            overrides.waitTime = 0; // No wait needed
            overrides.threshold = PERFORMANCE_CONFIG.threshold.static;
        } 
        // Physics layouts - optimized pre-steps from experiments
        // NGraph is the most common physics layout, used by default in many tests
        else if (storyLower === "ngraph" || layout === "ngraph") {
            overrides.renderCount = PERFORMANCE_CONFIG.renderCount.physics;
            
            // Style tests need higher pre-steps for pixel-perfect determinism
            // Pre-steps run the physics simulation before rendering, ensuring stable positions
            if (title.toLowerCase().includes("style")) {
                if (title.includes("Edge")) {
                    overrides.preSteps = PERFORMANCE_CONFIG.preSteps.styleEdge;
                } else if (title.includes("Label") || title.includes("Graph")) {
                    overrides.preSteps = PERFORMANCE_CONFIG.preSteps.styleLabel;
                } else {
                    overrides.preSteps = PERFORMANCE_CONFIG.preSteps.styleOther;
                }
            } else {
                overrides.preSteps = PERFORMANCE_CONFIG.preSteps.layoutTest;
            }
            
            overrides.waitTime = 0; // No additional wait needed with pre-steps
        } 
        // D3 Force layout - common physics layout
        else if (storyLower === "d3" || storyLower === "d3-force" || layout === "d3" || layout === "d3-force") {
            overrides.renderCount = PERFORMANCE_CONFIG.renderCount.physics;
            overrides.preSteps = PERFORMANCE_CONFIG.preSteps.d3Force;
            overrides.waitTime = 0;
        } 
        // Spring/Springy layouts - need moderate pre-steps
        else if (storyLower === "spring" || storyLower === "springy" || layout === "spring" || layout === "springy") {
            overrides.renderCount = PERFORMANCE_CONFIG.renderCount.physicsNoPreSteps;
            overrides.preSteps = PERFORMANCE_CONFIG.preSteps.spring;
            overrides.waitTime = 0;
        } 
        // ForceAtlas2 - complex physics layout
        else if (storyLower === "forceatlas2" || storyLower === "forceatlas" || layout === "forceatlas2" || layout === "forceatlas") {
            overrides.renderCount = PERFORMANCE_CONFIG.renderCount.physicsNoPreSteps;
            overrides.preSteps = PERFORMANCE_CONFIG.preSteps.forceAtlas;
            overrides.waitTime = 0;
        } 
        // Kamada-Kawai / ARF - lighter physics layouts
        else if (storyLower === "kamadakawai" || storyLower === "arf" || layout === "kamadakawai" || layout === "arf") {
            overrides.renderCount = PERFORMANCE_CONFIG.renderCount.physicsNoPreSteps;
            overrides.preSteps = PERFORMANCE_CONFIG.preSteps.kamadaKawai;
            overrides.waitTime = 0;
        }
        // Style tests without specific layout - minimal frames needed
        else if (title.toLowerCase().includes("style")) {
            overrides.renderCount = 10;
            overrides.waitTime = 0;
            // Note: Most style tests use ngraph by default and are handled above
        }

        if (Object.keys(overrides).length > 0) {
            return `, ${JSON.stringify(overrides)}`;
        }

        return "";
    }

    private generateFastControlVariations(storyId: string, controls: string[], argTypes: Record<string, any>): string {
        let content = "";

        for (const controlPath of controls) {
            const argKey = this.findArgTypeKey(controlPath, argTypes);
            if (!argKey) {
                continue;
            }

            const argType = argTypes[argKey];
            if (!argType) {
                continue;
            }

            const variations = this.generateVariationValues(argKey, argType);
            if (variations.length === 0) {
                continue;
            }

            content += `\n  // ${argKey} variations - batched for speed\n`;
            
            // Batch similar variations together
            for (const variation of variations) {
                // Include story name in test name to ensure uniqueness
                const storyName = storyId.split('--').pop();
                const testName = `${storyName}-${argKey}-${variation.name}`;
                const testConfig = this.getFastTestConfigOverrides(argType, variation.value);

                content += `  createFastVisualTest('${storyId}', {
    name: '${testName}',
    args: { ${argKey}: ${JSON.stringify(variation.value)} }
  }, env${testConfig ? `, ${JSON.stringify(testConfig)}` : ""});\n`;
            }
        }

        return content;
    }

    private getFastStoryPreSteps(title: string, story: StoryInfo, metaArgs?: Record<string, any>): { preSteps?: number } {
        const overrides: { preSteps?: number } = {};
        const storyLower = story.name.toLowerCase();
        const layout = story.args?.layout?.toLowerCase() || metaArgs?.layout?.toLowerCase();

        // Determine pre-steps based on layout type
        if (storyLower === "ngraph" || layout === "ngraph") {
            if (title.toLowerCase().includes("style")) {
                if (title.includes("Edge")) {
                    overrides.preSteps = PERFORMANCE_CONFIG.preSteps.styleEdge;
                } else if (title.includes("Label") || title.includes("Graph")) {
                    overrides.preSteps = PERFORMANCE_CONFIG.preSteps.styleLabel;
                } else {
                    overrides.preSteps = PERFORMANCE_CONFIG.preSteps.styleOther;
                }
            } else {
                overrides.preSteps = PERFORMANCE_CONFIG.preSteps.layoutTest;
            }
        } 
        else if (storyLower === "d3" || storyLower === "d3-force" || layout === "d3" || layout === "d3-force") {
            overrides.preSteps = PERFORMANCE_CONFIG.preSteps.d3Force;
        } 
        else if (storyLower === "spring" || storyLower === "springy" || layout === "spring" || layout === "springy") {
            overrides.preSteps = PERFORMANCE_CONFIG.preSteps.spring;
        } 
        else if (storyLower === "forceatlas2" || storyLower === "forceatlas" || layout === "forceatlas2" || layout === "forceatlas") {
            overrides.preSteps = PERFORMANCE_CONFIG.preSteps.forceAtlas;
        } 
        else if (storyLower === "kamadakawai" || storyLower === "arf" || layout === "kamadakawai" || layout === "arf") {
            overrides.preSteps = PERFORMANCE_CONFIG.preSteps.kamadaKawai;
        }
        else if (this.isStaticLayout(storyLower) || this.isStaticLayout(layout)) {
            overrides.preSteps = 0;
        }

        return overrides;
    }

    private generateSimpleFastControlVariations(storyId: string, storyName: string, controls: string[], argTypes: Record<string, any>, defaultPreSteps: number): string {
        let content = "";

        for (const controlPath of controls) {
            const argKey = this.findArgTypeKey(controlPath, argTypes);
            if (!argKey) {
                continue;
            }

            const argType = argTypes[argKey];
            if (!argType) {
                continue;
            }

            const variations = this.generateVariationValues(argKey, argType);
            if (variations.length === 0) {
                continue;
            }

            content += `\n  // ${argKey} variations\n`;
            
            for (const variation of variations) {
                const testName = `${storyName}-${argKey}-${variation.name}`;
                content += `  reusePageTest('${testName}', '${storyId}', { ${argKey}: ${JSON.stringify(variation.value)} }, ${defaultPreSteps});\n`;
            }
        }

        return content;
    }

    private getFastStoryOverrides(title: string, story: StoryInfo, metaArgs?: Record<string, any>): string {
        const overrides: Record<string, any> = {};
        const layout = story.args?.layout?.toLowerCase() || metaArgs?.layout?.toLowerCase();
        
        // Fast mode uses minimal render counts since we're reusing WebGL context
        if (this.isStaticLayout(story.name.toLowerCase()) || this.isStaticLayout(layout)) {
            overrides.renderCount = 1; // Single frame for static
            overrides.skipSettlement = true;
            overrides.preSteps = 0;
        } else if (this.isPhysicsLayout(story.name.toLowerCase()) || this.isPhysicsLayout(layout)) {
            // Reduce pre-steps in fast mode since context is warm
            overrides.renderCount = 1;
            overrides.preSteps = this.getFastPreSteps(title, story.name, layout);
        }

        if (Object.keys(overrides).length > 0) {
            return `, ${JSON.stringify(overrides)}`;
        }
        return "";
    }

    private getFastTestConfigOverrides(argType: any, value: any): Record<string, any> | null {
        // Minimal overrides for fast mode
        if (typeof value === "string" && value.includes("rgba")) {
            return {threshold: 0.04, renderCount: 1};
        }
        return null;
    }

    private isStaticLayout(name?: string): boolean {
        if (!name) return false;
        const staticLayouts = ["circular", "random", "spiral", "shell", "planar"];
        return staticLayouts.some(layout => name.includes(layout));
    }

    private isPhysicsLayout(name?: string): boolean {
        if (!name) return false;
        const physicsLayouts = ["ngraph", "d3", "spring", "forceatlas", "kamada", "arf"];
        return physicsLayouts.some(layout => name.includes(layout));
    }

    private getFastPreSteps(title: string, storyName: string, layout?: string): number {
        // Reduced pre-steps for fast mode (warm context)
        const titleLower = title.toLowerCase();
        const storyLower = storyName.toLowerCase();
        
        if (titleLower.includes("style")) {
            return 500; // Reduced from 1200-1500
        } else if (storyLower === "d3" || layout === "d3") {
            return 400; // Reduced from 1000
        } else if (storyLower.includes("spring") || layout === "spring") {
            return 300; // Reduced from 800
        } else if (storyLower.includes("forceatlas") || layout === "forceatlas") {
            return 300; // Reduced from 800
        } else if (storyLower.includes("kamada") || layout === "kamada") {
            return 100; // Reduced from 200
        }
        return 200; // Default
    }
}

// Run the generator
if (import.meta.url === `file://${__filename}`) {
    const generator = new ASTPlaywrightGenerator();
    generator.generate().catch(console.error);
}
