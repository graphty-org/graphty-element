/**
 * This test scans all story files to detect non-deterministic patterns that would
 * cause visual regression failures in Chromatic. It checks for:
 *
 * 1. Math.random() usage without a seeded RNG - random data generation will produce
 *    different results each time, causing layout differences
 * 2. Physics-based layouts (ngraph, d3, forceatlas2, spring, random) without proper
 *    configuration:
 *    - Missing seed in layoutConfig
 *    - Missing preSteps in styleTemplate.behavior.layout
 *    - Missing waitForGraphSettled in play function
 */
import fs from "node:fs";
import path from "node:path";

import {assert, describe, test} from "vitest";

// Physics-based layouts that require seeds for deterministic results
const PHYSICS_LAYOUTS = ["ngraph", "d3", "forceatlas2", "spring", "random"];

// Layouts that don't support seeds but handle determinism through other means (e.g., diffThreshold)
// D3 force layout doesn't have seed support - it uses high diffThreshold instead
const LAYOUTS_WITHOUT_SEED_SUPPORT = ["d3"];

// Get all story files
function getStoryFiles(): string[] {
    const storiesDir = path.join(__dirname, "../../stories");
    const storyFiles: string[] = [];

    function walkDir(dir: string): void {
        const entries = fs.readdirSync(dir, {withFileTypes: true});
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walkDir(fullPath);
            } else if (entry.name.endsWith(".stories.ts")) {
                storyFiles.push(fullPath);
            }
        }
    }

    walkDir(storiesDir);
    return storyFiles;
}

interface DeterminismIssue {
    file: string;
    line: number;
    issue: string;
    severity: "error" | "warning";
}

// Check a file for determinism issues
function checkFileForDeterminismIssues(filePath: string): DeterminismIssue[] {
    const issues: DeterminismIssue[] = [];
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const relativePath = path.relative(path.join(__dirname, "../.."), filePath);

    // Check for Math.random() usage
    // This regex looks for Math.random() that is NOT inside a seededRandom function or similar
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Check for bare Math.random() calls
        if (line.includes("Math.random()")) {
            // Check if this is inside a seededRandom function definition (look at surrounding context)
            const contextStart = Math.max(0, i - 10);
            const contextEnd = Math.min(lines.length, i + 2);
            const context = lines.slice(contextStart, contextEnd).join("\n");

            // If we're inside a seeded random generator function, that's fine
            if (context.includes("seededRandom") || context.includes("createRng") || context.includes("seedrandom")) {
                continue;
            }

            issues.push({
                file: relativePath,
                line: lineNum,
                issue: "Math.random() used without seeded RNG - will produce non-deterministic results",
                severity: "error",
            });
        }
    }

    // Parse story exports and check physics-based layouts
    // Look for patterns like: export const StoryName: Story = { args: { layout: "ngraph" } }
    const storyPattern = /export\s+const\s+(\w+):\s*Story\s*=\s*\{/g;
    let match;

    while ((match = storyPattern.exec(content)) !== null) {
        const storyName = match[1];
        const storyStartIndex = match.index;

        // Find the story block by matching braces
        let braceCount = 0;
        let storyEndIndex = storyStartIndex;
        let foundFirstBrace = false;

        for (let i = storyStartIndex; i < content.length; i++) {
            if (content[i] === "{") {
                braceCount++;
                foundFirstBrace = true;
            } else if (content[i] === "}") {
                braceCount--;
            }

            if (foundFirstBrace && braceCount === 0) {
                storyEndIndex = i;
                break;
            }
        }

        const storyBlock = content.slice(storyStartIndex, storyEndIndex + 1);

        // Check if this story uses a physics-based layout
        const layoutMatch = /layout:\s*["'](\w+)["']/.exec(storyBlock);
        if (!layoutMatch) {
            continue;
        }

        const layout = layoutMatch[1];
        if (!PHYSICS_LAYOUTS.includes(layout)) {
            continue;
        }

        // Calculate line number of story definition
        const storyLineNum = content.slice(0, storyStartIndex).split("\n").length;

        // Check for seed in layoutConfig or aliased args
        // Storybook argTypes can map args like "randomSeed" or "ngraphSeed" to "graph.layoutOptions.seed"
        const hasSeed = /layoutConfig:\s*\{[^}]*seed:\s*\d+/s.test(storyBlock) ||
            /styleTemplate.*seed:\s*\d+/s.test(storyBlock) ||
            /layoutOptions:\s*\{[^}]*seed:\s*\d+/s.test(storyBlock) ||
            // Check for aliased seed args like ngraphSeed, randomSeed, springSeed, fa2Seed, d3Seed
            /ngraphSeed:\s*\d+/.test(storyBlock) ||
            /randomSeed:\s*\d+/.test(storyBlock) ||
            /springSeed:\s*\d+/.test(storyBlock) ||
            /fa2Seed:\s*\d+/.test(storyBlock) ||
            /d3Seed:\s*\d+/.test(storyBlock);

        // Skip seed check for layouts that don't support seeds (they handle determinism differently)
        if (!hasSeed && layout !== "fixed" && !LAYOUTS_WITHOUT_SEED_SUPPORT.includes(layout)) {
            issues.push({
                file: relativePath,
                line: storyLineNum,
                issue: `Story "${storyName}" uses physics layout "${layout}" without a seed - will produce non-deterministic layouts`,
                severity: "error",
            });
        }

        // Check for preSteps in behavior.layout
        // templateCreator includes default preSteps, so stories using it are covered
        const hasPreSteps = /preSteps:\s*\d+/.test(storyBlock) ||
            /preSteps:\s*isChromatic/.test(storyBlock) ||
            /templateCreator\s*\(/.test(storyBlock);

        if (!hasPreSteps) {
            issues.push({
                file: relativePath,
                line: storyLineNum,
                issue: `Story "${storyName}" uses physics layout "${layout}" without preSteps - will not settle before Chromatic capture`,
                severity: "error",
            });
        }

        // Check for play function with waitForGraphSettled
        const hasPlayFunction = /play:\s*async/.test(storyBlock);
        const hasWaitForSettled = storyBlock.includes("waitForGraphSettled");

        if (!hasPlayFunction || !hasWaitForSettled) {
            issues.push({
                file: relativePath,
                line: storyLineNum,
                issue: `Story "${storyName}" uses physics layout "${layout}" without waitForGraphSettled in play function - will not settle before Chromatic capture`,
                severity: "error",
            });
        }
    }

    return issues;
}

describe("Story Determinism", () => {
    const storyFiles = getStoryFiles();

    test("all story files should use deterministic patterns for Chromatic visual testing", () => {
        const allIssues: DeterminismIssue[] = [];

        for (const file of storyFiles) {
            const issues = checkFileForDeterminismIssues(file);
            allIssues.push(... issues);
        }

        // Filter to only errors for the assertion
        const errors = allIssues.filter((issue) => issue.severity === "error");

        if (errors.length > 0) {
            const errorMessages = errors.map(
                (issue) => `\n  ${issue.file}:${issue.line}\n    ${issue.issue}`,
            );
            assert.fail(
                `Found ${errors.length} determinism error(s) in stories:${errorMessages.join("")}\n\n` +
                "To fix these issues:\n" +
                "1. Replace Math.random() with a seeded RNG (e.g., seededRandom(42))\n" +
                "2. Add 'seed: 42' to layoutConfig for physics-based layouts\n" +
                "3. See stories/Layout.stories.ts for examples of correct patterns",
            );
        }

        // Also report warnings (but don't fail)
        const warnings = allIssues.filter((issue) => issue.severity === "warning");
        if (warnings.length > 0) {
            console.warn(`\nDeterminism warnings (${warnings.length}):`);
            for (const warning of warnings) {
                console.warn(`  ${warning.file}:${warning.line} - ${warning.issue}`);
            }
        }
    });

    test("checks all stories directory for files", () => {
        assert(storyFiles.length > 0, "Should find story files in stories/ directory");
    });
});
