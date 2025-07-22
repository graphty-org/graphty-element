# Playwright Visual Testing Migration Plan

## Executive Summary

This document outlines the migration strategy from Chromatic to Playwright for visual regression testing of the graphty-element project. The migration aims to reduce costs while maintaining comprehensive visual testing coverage.

## Update: Approach Clarification

After analyzing various approaches including Babylon.js's patterns, this plan follows our current successful strategy:

1. **Human Stories as Source of Truth**: Stories in `/stories/human/` remain the single source of truth
2. **Generated Test Approach**: A generator script creates Playwright test files from story argTypes and parameters
3. **Utility-Based Architecture**: Centralized test utilities (inspired by Babylon.js) for consistent test execution
4. **Comprehensive Error Detection**: Multiple layers of error checking including WebGL errors and console monitoring
5. **Project-Based Organization**: Different test projects for different rendering engines
6. **Sophisticated Wait Strategies**: Proper handling of 3D rendering completion before screenshots

Key principle: We maintain the same architecture as our current Chromatic setup, but generate Playwright tests instead of Storybook stories.

## Current State Analysis

### Chromatic Setup
- **Cost Issue**: Generating 1000+ screenshots per test run, limited to 5000/month on free tier
- **Architecture**: Human stories in `/stories/human/`, auto-generated test variations in `/stories/auto-generated/`
- **Generator Script**: Creates comprehensive test variations from story argTypes
- **Integration**: Chromatic captures screenshots automatically from Storybook

### Key Strengths to Preserve
1. Separation of human documentation stories from test variations
2. Auto-generation of test cases from story metadata
3. Single source of truth for component variations
4. Gitignored generated files to avoid repository bloat

## Migration Strategy

### Phase 1: Infrastructure Setup

#### 1.1 Playwright Configuration (Enhanced with Babylon.js patterns)
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './test',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 4 : undefined,
  
  reporter: process.env.CI ? [
    ['line'],
    ['junit', { outputFile: 'junit.xml' }],
    ['html', { outputFolder: 'playwright-report' }]
  ] : 'html',
  
  use: {
    // Consistent viewport for visual tests
    viewport: { width: 1280, height: 720 },
    // Capture traces and videos on retry for debugging
    trace: 'on-first-retry',
    video: 'on-first-retry',
    // Device scale factor for consistent rendering
    deviceScaleFactor: 1,
  },
  
  // Multiple projects for different test scenarios (Babylon.js pattern)
  projects: [
    {
      name: 'webgl2-visual',
      testMatch: '**/*.visual.spec.ts',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: ['--use-angle=default', '--ignore-gpu-blacklist']
        }
      }
    },
    {
      name: 'webgl1-visual',
      testMatch: '**/*.visual.spec.ts',
      use: {
        browserName: 'chromium',
        launchOptions: {
          args: ['--use-angle=default', '--disable-webgl2']
        }
      }
    },
    {
      name: 'interaction',
      testMatch: '**/interaction.spec.ts',
      use: { browserName: 'chromium' }
    },
    {
      name: 'performance',
      testMatch: '**/performance.spec.ts',
      use: { browserName: 'chromium' }
    }
  ],
  
  // Snapshot path configuration (Babylon.js pattern)
  snapshotPathTemplate: '{testDir}/{testFileDir}/screenshots-baseline/{projectName}/{arg}{ext}'
});
```

#### 1.2 Screenshot Storage Strategy
- Store baseline screenshots in `test/visual/screenshots-baseline/`
- Store diff screenshots in `test/visual/screenshots-diff/` (gitignored)
- Store actual screenshots in `test/visual/screenshots-actual/` (gitignored)
- **Check baselines into git**: Yes, this is the standard approach for Playwright visual testing

#### 1.3 Directory Structure
```
test/
├── playwright/
│   ├── utils/
│   │   └── visual-test.utils.ts    # Core test utilities
│   ├── visual/
│   │   ├── screenshots-baseline/    # Committed to git
│   │   │   ├── webgl2-visual/
│   │   │   │   ├── node/
│   │   │   │   ├── edge/
│   │   │   │   └── layout/
│   │   │   └── webgl1-visual/
│   │   ├── screenshots-diff/        # Gitignored
│   │   └── screenshots-actual/      # Gitignored
│   ├── generated/                   # Generated test files (gitignored)
│   │   ├── node-styles.visual.spec.ts
│   │   ├── edge-styles.visual.spec.ts
│   │   └── layout.visual.spec.ts
│   ├── playwright-generator.ts      # Generator script (reads stories)
│   ├── interaction.spec.ts         # Manual interaction tests
│   └── performance.spec.ts         # Manual performance tests
├── playwright.config.ts
└── global-setup.ts                 # Optional: for future BrowserStack support
```

#### 1.4 Test Utilities
```typescript
// test/playwright/utils/visual-test.utils.ts
import { Page, test, expect } from '@playwright/test';

export interface TestVariation {
  name: string;
  args: Record<string, any>;
  description?: string;
}

export interface TestConfig {
  renderCount?: number;
  waitTime?: number;
  threshold?: number;
  errorRatio?: number;
  excludedProjects?: string[];
}

export interface TestEnvironment {
  baseUrl: string;
  projectName: string;
  defaultConfig: TestConfig;
}

// Generate a visual test for a story variation
export function createVisualTest(
  storyId: string,
  variation: TestVariation,
  env: TestEnvironment,
  config: TestConfig = {}
) {
  const mergedConfig = { ...env.defaultConfig, ...config };
  
  test(variation.name, async ({ page }) => {
    // Skip if excluded for this project
    if (mergedConfig.excludedProjects?.includes(env.projectName)) {
      test.skip();
      return;
    }
    
    await runVisualTest(page, storyId, variation, env, mergedConfig);
  });
}

// Core visual test runner
export async function runVisualTest(
  page: Page,
  storyId: string,
  variation: TestVariation,
  env: TestEnvironment,
  config: TestConfig
) {
  // Navigate to story with args
  const url = buildStoryUrl(env.baseUrl, storyId, variation.args);
  await page.goto(url);
  
  // Wait for component and Babylon.js to be ready
  await waitForGraphtyReady(page, config.renderCount || 5, config.waitTime);
  
  // Check for errors
  await checkForErrors(page);
  
  // Take screenshot
  const screenshotName = `${variation.name}.png`;
  await expect(page).toHaveScreenshot(screenshotName, {
    threshold: config.threshold || 0.02,
    maxDiffPixelRatio: config.errorRatio || 0.01,
    fullPage: false,
  });
}

// Wait for graphty-element and Babylon.js to be ready
export async function waitForGraphtyReady(
  page: Page,
  renderCount: number = 5,
  additionalWait: number = 0
) {
  // Wait for element
  await page.waitForSelector('graphty-element', { state: 'attached' });
  
  // Wait for Babylon.js engine
  await page.waitForFunction(() => {
    const element = document.querySelector('graphty-element') as any;
    return element?.graph?.engine && element.graph.scene;
  });
  
  // Render frames to ensure scene is stable
  for (let i = 0; i < renderCount; i++) {
    await page.evaluate(() => {
      const element = document.querySelector('graphty-element') as any;
      element.graph.engine.runRenderLoop(() => {
        element.graph.scene.render();
      });
    });
    await page.waitForTimeout(16); // One frame at 60fps
  }
  
  // Stop render loop for screenshot
  await page.evaluate(() => {
    const element = document.querySelector('graphty-element') as any;
    element.graph.engine.stopRenderLoop();
  });
  
  // Additional wait if specified
  if (additionalWait > 0) {
    await page.waitForTimeout(additionalWait);
  }
}

// Check for WebGL and console errors (Babylon.js pattern)
export async function checkForErrors(page: Page) {
  // Check for WebGL errors
  const hasGLError = await page.evaluate(() => {
    const element = document.querySelector('graphty-element') as any;
    if (!element?.graph?.engine?._gl) return false;
    
    const gl = element.graph.engine._gl;
    const error = gl.getError();
    return error !== gl.NO_ERROR;
  });
  
  if (hasGLError) {
    throw new Error('WebGL error detected during rendering');
  }
  
  // Check console for errors
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  if (errors.length > 0) {
    throw new Error(`Console errors detected: ${errors.join(', ')}`);
  }
}

// Build Storybook URL with args
function buildStoryUrl(baseUrl: string, storyId: string, args?: Record<string, any>): string {
  let url = `${baseUrl}/iframe.html?viewMode=story&id=${storyId}`;
  
  if (args) {
    const argsString = Object.entries(args)
      .map(([key, value]) => `${key}:${encodeURIComponent(JSON.stringify(value))}`)
      .join(';');
    url += `&args=${argsString}`;
  }
  
  return url;
}
```

### Phase 2: Generator Script Architecture

#### 2.1 Playwright Generator Overview
The generator reads human stories from `/stories/human/` and generates Playwright test files, following the same pattern as our current Chromatic setup:

```typescript
// test/playwright/playwright-generator.ts
import { glob } from 'glob';
import * as fs from 'fs/promises';
import * as path from 'path';
import { loadStoryModule, extractStoryMetadata } from './utils/story-parser';

interface GeneratorConfig {
  storiesGlob: string;  // './stories/human/**/*.stories.ts'
  outputDir: string;    // './test/playwright/generated/'
  baseUrl: string;      // 'http://dev.ato.ms:9025'
  defaultTestConfig: {
    renderCount: number;
    threshold: number;
    errorRatio: number;
  };
  variations: VariationConfig;
}

interface VariationConfig {
  range: { points: 'min-mid-max' | 'extremes' | number[] };
  select: 'all' | 'first-last' | string[];
  boolean: 'both' | 'true' | 'false';
  color: string[]; // ['hex', 'rgb', 'rgba', 'named']
  number: number[];
  text: string[];
}
```

#### 2.2 Key Features (Similar to Current Chromatic Generator)
1. **Dynamic Story Import**: Reads actual story files to extract argTypes
2. **Variation Generation**: Creates test variations based on control types
3. **TypeScript Output**: Generates type-safe Playwright test files
4. **Maintains Structure**: Preserves story organization in test output

#### 2.3 Generated Test File Structure
```typescript
// Example generated file: test/playwright/generated/node-styles.visual.spec.ts
import { test } from '@playwright/test';
import { createVisualTest, TestEnvironment } from '../utils/visual-test.utils';

const storyId = 'node-nodestyles--basic';
const env: TestEnvironment = {
  baseUrl: 'http://dev.ato.ms:9025',
  projectName: process.env.TEST_PROJECT_NAME || 'webgl2-visual',
  defaultConfig: {
    renderCount: 10,
    threshold: 0.02,
    errorRatio: 0.01
  }
};

test.describe('Node Styles Visual Tests', () => {
  // Test default story state
  createVisualTest(storyId, {
    name: 'default',
    args: {},
    description: 'Default node styling'
  }, env);

  // Test nodeColor variations
  test.describe('nodeColor variations', () => {
    createVisualTest(storyId, {
      name: 'nodeColor-hex-red',
      args: { nodeColor: '#ff0000' }
    }, env);
    
    createVisualTest(storyId, {
      name: 'nodeColor-rgb-green',
      args: { nodeColor: 'rgb(0,255,0)' }
    }, env);
    
    createVisualTest(storyId, {
      name: 'nodeColor-named-blue',
      args: { nodeColor: 'blue' }
    }, env);
    
    createVisualTest(storyId, {
      name: 'nodeColor-rgba-transparent',
      args: { nodeColor: 'rgba(255,0,0,0.5)' }
    }, env, { threshold: 0.04 }); // Override for transparency
  });

  // Test nodeSize variations
  test.describe('nodeSize variations', () => {
    createVisualTest(storyId, {
      name: 'nodeSize-min',
      args: { nodeSize: 10 }
    }, env);
    
    createVisualTest(storyId, {
      name: 'nodeSize-mid',
      args: { nodeSize: 55 }
    }, env);
    
    createVisualTest(storyId, {
      name: 'nodeSize-max',
      args: { nodeSize: 100 }
    }, env, { renderCount: 20 }); // More frames for large nodes
  });

  // Test nodeShape variations
  test.describe('nodeShape variations', () => {
    ['sphere', 'cube', 'cylinder', 'cone'].forEach(shape => {
      const config = shape === 'cube' ? { excludedProjects: ['webgl1-visual'] } : {};
      
      createVisualTest(storyId, {
        name: `nodeShape-${shape}`,
        args: { nodeShape: shape }
      }, env, config);
    });
  });
});
```

#### 2.4 Generator Implementation Pattern
```typescript
// test/playwright/playwright-generator.ts (key functions)
async function generateTestsFromStories() {
  const storyFiles = await glob('./stories/human/**/*.stories.ts');
  
  for (const storyFile of storyFiles) {
    const storyModule = await loadStoryModule(storyFile);
    const metadata = extractStoryMetadata(storyModule);
    
    if (!metadata.argTypes || Object.keys(metadata.argTypes).length === 0) {
      console.log(`Skipping ${storyFile} - no argTypes defined`);
      continue;
    }
    
    const testContent = generateTestFile(metadata, config);
    const outputPath = deriveOutputPath(storyFile);
    
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, testContent);
    
    console.log(`Generated tests for ${metadata.title}`);
  }
}

function generateVariations(argType: ArgType, config: VariationConfig): any[] {
  switch (argType.control.type) {
    case 'color':
      return generateColorVariations(config.color);
    case 'range':
      return generateRangeVariations(argType.control, config.range);
    case 'select':
      return generateSelectVariations(argType.options, config.select);
    case 'boolean':
      return config.boolean === 'both' ? [true, false] : [config.boolean === 'true'];
    case 'number':
      return config.number;
    case 'text':
      return config.text;
    default:
      return [argType.defaultValue];
  }
}
```

#### 2.5 Configuration File Support
The generator can be configured via a JSON file for consistency:

```json
// test/playwright/generator.config.json
{
  "storiesGlob": "./stories/human/**/*.stories.ts",
  "outputDir": "./test/playwright/generated/",
  "baseUrl": "http://dev.ato.ms:9025",
  "defaultTestConfig": {
    "renderCount": 10,
    "threshold": 0.02,
    "errorRatio": 0.01
  },
  "variations": {
    "range": { "points": "min-mid-max" },
    "select": "all",
    "boolean": "both",
    "color": ["hex", "rgb", "named", "rgba"],
    "number": [1, 10, 100],
    "text": ["Test Value", "Another Test", "Edge Case!@#$%"]
  },
  "excludeStories": ["**/Introduction.stories.ts"],
  "customVariations": {
    "node-nodestyles": {
      "nodeSize": [5, 30, 50, 100]
    }
  }
}

### Phase 3: Updating Baselines

#### 3.1 Initial Baseline Creation
```bash
# Generate all baseline screenshots
npm run test:visual:update

# This runs: playwright test --update-snapshots
```

#### 3.2 Selective Updates
```bash
# Update specific test
npx playwright test test/visual/node-styles.visual.spec.ts --update-snapshots

# Update with pattern
npx playwright test -g "node-color" --update-snapshots
```

#### 3.3 Review Process
1. Run tests: `npm run test:visual`
2. Review failures in HTML report: `npx playwright show-report`
3. Update baselines if changes are intentional
4. Commit updated baselines to git

### Phase 4: CI/CD Integration

#### 4.1 GitHub Actions Workflow
```yaml
name: Visual Tests
on: [push, pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test:visual:generate  # Generate test files
      - run: npm run storybook:ci &        # Start Storybook in background
      - run: npx wait-on http://dev.ato.ms:9025
      - run: npm run test:visual
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: visual-test-results
          path: test/playwright/visual/screenshots-diff/
```

#### 4.2 Local Development Workflow
```json
// package.json scripts
{
  "test:visual:generate": "tsx test/playwright/playwright-generator.ts",
  "test:visual": "npm run test:visual:generate && playwright test --project=webgl2-visual",
  "test:visual:all": "npm run test:visual:generate && playwright test",
  "test:visual:update": "npm run test:visual:generate && playwright test --project=webgl2-visual --update-snapshots",
  "test:visual:ui": "npm run test:visual:generate && playwright test --ui",
  "storybook:ci": "storybook dev -p 9025 --ci"
}
```

### Phase 5: Migration Steps

#### Step 1: Setup Playwright Infrastructure
1. Install Playwright: `npm install --save-dev @playwright/test`
2. Create `playwright.config.ts` with multi-project support
3. Set up directory structure as specified
4. Create utility files (`visual-test.utils.ts`)
5. Update `.gitignore`:
   ```
   test/playwright/visual/screenshots-diff/
   test/playwright/visual/screenshots-actual/
   test/playwright/generated/*.visual.spec.ts
   ```

#### Step 2: Port Generator Script
1. Start with `chromatic-generator-simple.ts` as base
2. Refactor to:
   - Read story files dynamically (not hardcoded)
   - Generate Playwright test files using utility functions
   - Support multi-project test generation
3. Create `generator.config.json` for configuration
4. Test with a single story file first

#### Step 3: Generate Initial Baselines
1. Run generator: `npm run test:visual:generate`
2. Start Storybook: `npm run storybook`
3. Create baselines: `npm run test:visual:update`
4. Review screenshots in `test/playwright/visual/screenshots-baseline/`
5. Commit baselines to git

#### Step 4: Parallel Testing Phase
1. Keep Chromatic running for comparison
2. Run both test suites on CI
3. Compare results and timing
4. Fix any discrepancies

#### Step 5: Full Migration
1. Update all npm scripts
2. Remove Chromatic configuration
3. Update documentation and CLAUDE.md
4. Remove `/stories/auto-generated/` references
5. Train team on new workflow

## Additional Considerations

### 1. Performance Optimization
- **Parallel Execution**: Playwright runs tests in parallel by default
- **Sharding**: For large test suites, use Playwright's sharding feature
- **Selective Testing**: Run only tests for changed components

### 2. Screenshot Consistency (Enhanced with Babylon.js patterns)
- **Wait Strategies**: Use `waitForGraphtyReady` utility function that ensures Babylon.js rendering is complete
- **Render Loop Control**: Run specific number of render frames before screenshot
- **WebGL Error Detection**: Check GL error state after each render
- **Scene Stability**: Stop render loop before taking screenshots
- **Animation Handling**: Ensure animations are disabled in Playwright config
- **Font Loading**: Wait for web fonts to load
- **Console Error Monitoring**: Capture and fail on console errors

### 3. Debugging Failed Tests
- **HTML Report**: Use Playwright's built-in HTML reporter
- **Trace Viewer**: Enable trace on failure for debugging
- **Local Reproduction**: Easy to run specific tests locally

### 4. Storage Optimization
- **Compression**: Use PNG compression for baselines
- **Selective Storage**: Only store baselines for stable tests
- **Git LFS**: Consider Git LFS for large screenshot collections

### 5. Test Organization
- **Naming Convention**: Use descriptive names matching story structure
- **Grouping**: Organize tests by component type (node, edge, label, etc.)
- **Tags**: Use test tags for selective execution

## Benefits of Playwright Approach

1. **Cost**: No external service fees
2. **Control**: Full control over test execution and storage
3. **Speed**: Tests run locally and in CI without external API calls
4. **Flexibility**: Custom wait conditions and test logic
5. **Integration**: Native TypeScript support and modern tooling

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Large repository size | Use Git LFS for screenshots if needed |
| Flaky tests | Implement proper wait conditions and retry logic |
| Platform differences | Use Docker containers for consistent rendering |
| Maintenance burden | Automate baseline updates in CI |

## Timeline

- **Week 1**: Infrastructure setup and generator port
- **Week 2**: Generate baselines and validate coverage
- **Week 3**: CI/CD integration and team training
- **Week 4**: Parallel run with Chromatic for validation
- **Week 5**: Full cutover and Chromatic deprecation

## Success Criteria

1. All existing visual tests migrated to Playwright
2. Test execution time under 10 minutes
3. False positive rate under 5%
4. Clear documentation and onboarding guide
5. Automated baseline update process

## Summary of Approach

This migration plan maintains our successful architecture while transitioning from Chromatic to Playwright:

1. **Human Stories Remain Source of Truth**: All test variations are generated from story argTypes
2. **Generated Test Files**: Similar to current Chromatic approach, but generating Playwright tests
3. **Utility Functions**: Centralized test utilities inspired by Babylon.js for consistent execution
4. **Multi-Project Support**: Test different WebGL configurations in parallel
5. **Comprehensive Error Detection**: WebGL error checking and console monitoring
6. **Proper 3D Rendering Support**: Wait strategies that ensure Babylon.js scenes are stable

## Key Benefits

1. **Familiar Architecture**: Same mental model as current Chromatic setup
2. **Type Safety**: Generated TypeScript files with full IDE support
3. **Cost Effective**: No external service fees
4. **Performance**: Local execution with parallel test support
5. **Debugging**: Playwright's excellent debugging tools
6. **Flexibility**: Easy to customize test generation per story

## Success Metrics

- Maintain 1000+ test coverage with <10 minute execution time
- Zero false positives from rendering timing issues
- Smooth migration path with parallel testing phase
- Clear documentation and team training

The result will be a cost-effective, maintainable visual testing solution that preserves our current workflow while leveraging Playwright's powerful testing capabilities.