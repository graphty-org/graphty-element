# Chromatic Auto-Generation Plan

## Executive Summary

This plan outlines a comprehensive approach to automatically generate Chromatic visual regression test stories from existing Storybook stories. The goal is to maintain a single source of truth (human-focused stories) while automatically generating exhaustive test variations for Chromatic.

## Problem Statement

Currently, the project maintains:
- **Human-focused stories** (`*.stories.ts`) - Interactive documentation with controls
- **Chromatic test stories** (`*.chromatic.stories.ts`) - Comprehensive visual tests

This creates:
- Duplication of story logic
- Maintenance burden when updating stories
- Risk of human and test stories diverging
- Manual effort to ensure comprehensive test coverage

## Proposed Solution

Create an automated build process that:
1. Reads existing human-focused story files
2. Analyzes their parameters and controls
3. Generates comprehensive Chromatic test files that import and extend the originals
4. Tests every story with every possible parameter variation

## Current State Analysis

### Existing Story Structure
```typescript
// stories/node/NodeStyles.stories.ts
export default meta = {
  title: "Styles/Node",
  component: "graphty-element",
  argTypes: {
    nodeColor: {control: "color", name: "texture.color"},
    nodeShape: {control: "select", options: nodeShapes, name: "shape.type"},
    nodeSize: {control: {type: "range", min: 0.1, max: 10}, name: "shape.size"},
    nodeWireframe: {control: "boolean", name: "effect.wireframe"},
  }
};

export const Default: Story = {};
export const Color: Story = { args: { styleTemplate: templateCreator({nodeStyle: {texture: {color: "red"}}}) }};
export const Shape: Story = { args: { styleTemplate: templateCreator({nodeStyle: {shape: {type: "box"}}}) }};
```

### Existing Test Variations
```typescript
// stories/test-scenarios/node-variations.ts
export const nodeShapeVariations = [
  {name: "box", args: {shape: {type: "box"}}},
  {name: "sphere", args: {shape: {type: "sphere"}}},
  // ... 12 more shapes
];

export const nodeColorVariations = [
  {name: "red", args: {texture: {color: "red"}}},
  {name: "blue", args: {texture: {color: "blue"}}},
  // ... more colors
];
```

## Implementation Plan

### Phase 1: Core Generator Script

#### 1.1 Create AST-based Story Analyzer
```typescript
// scripts/chromatic-generator/story-analyzer.ts
interface StoryAnalysis {
  filePath: string;
  metaExport: {
    title: string;
    component: string;
    argTypes: Record<string, ArgTypeInfo>;
  };
  storyExports: Record<string, StoryInfo>;
}

class StoryAnalyzer {
  async analyzeStoryFile(filePath: string): Promise<StoryAnalysis> {
    // Use TypeScript compiler API to parse story files
    // Extract meta information and story exports
    // Return structured analysis
  }
}
```

#### 1.2 Create Variation Generator
```typescript
// scripts/chromatic-generator/variation-generator.ts
interface VariationSet {
  parameterPath: string;
  variations: Array<{name: string, value: any}>;
}

class VariationGenerator {
  generateVariations(argType: ArgTypeInfo): VariationSet {
    // Based on control type, generate appropriate variations
    // Use existing test-scenarios as baseline
    // Allow configuration overrides
  }
}
```

#### 1.3 Create Test File Generator
```typescript
// scripts/chromatic-generator/test-generator.ts
class ChromaticTestGenerator {
  generateTestFile(analysis: StoryAnalysis, variations: VariationSet[]): string {
    // Generate TypeScript file that imports original stories
    // Create test stories for each variation combination
    // Include proper typing and meta information
  }
}
```

### Phase 2: Configuration System

#### 2.1 Configuration File
```json
// chromatic-generation.config.json
{
  "sourcePattern": "stories/**/*.stories.ts",
  "outputDirectory": "stories/chromatic-auto",
  "exclude": ["**/chromatic/**", "**/*.chromatic.*"],
  "variations": {
    "color": ["red", "blue", "green", "yellow", "purple", "#FF1493"],
    "boolean": [true, false],
    "shape.type": ["box", "sphere", "cylinder", "cone", "geodesic"],
    "shape.size": [0.5, 1, 2, 5],
    "texture.color.opacity": [0.2, 0.5, 0.8, 1]
  },
  "storiesPerFile": 100,  // Split large outputs
  "testDelay": 2000       // Chromatic delay
}
```

#### 2.2 Parameter Mapping
```typescript
// Map story parameters to style template paths
const parameterMapping = {
  "texture.color": (value) => ({nodeStyle: {texture: {color: value}}}),
  "shape.type": (value) => ({nodeStyle: {shape: {type: value}}}),
  "shape.size": (value) => ({nodeStyle: {shape: {size: value}}}),
  "effect.wireframe": (value) => ({nodeStyle: {effect: {wireframe: value}}}),
};
```

### Phase 3: Generated File Structure

#### 3.1 Output Directory Structure
```
stories/
├── chromatic-auto/           # Generated files (gitignored)
│   ├── index.ts             # Barrel export
│   ├── NodeStyles.test.ts   # Generated from NodeStyles.stories.ts
│   ├── EdgeStyles.test.ts   # Generated from EdgeStyles.stories.ts
│   └── ...
├── node/                    # Original stories (unchanged)
│   └── NodeStyles.stories.ts
└── edge/
    └── EdgeStyles.stories.ts
```

#### 3.2 Generated File Format
```typescript
// stories/chromatic-auto/NodeStyles.test.ts
// AUTO-GENERATED FILE - DO NOT EDIT
// Source: stories/node/NodeStyles.stories.ts
// Generated: 2025-07-21T10:00:00Z

import { Meta, StoryObj } from '@storybook/web-components-vite';
import * as OriginalStories from '../node/NodeStyles.stories';
import { templateCreator } from '../helpers';

const meta: Meta = {
  ...OriginalStories.default,
  title: `Chromatic/Auto/${OriginalStories.default.title}`,
  tags: ['!dev', 'chromatic-auto'],
  parameters: {
    chromatic: { delay: 2000 },
    controls: { hideNoControlsWarning: true }
  }
};

export default meta;

// Test: Default story with texture.color variations
export const Default_texture_color_red = {
  ...OriginalStories.Default,
  args: {
    ...OriginalStories.Default.args,
    styleTemplate: templateCreator({
      nodeStyle: {texture: {color: 'red'}}
    })
  }
};

export const Default_texture_color_blue = {
  ...OriginalStories.Default,
  args: {
    ...OriginalStories.Default.args,
    styleTemplate: templateCreator({
      nodeStyle: {texture: {color: 'blue'}}
    })
  }
};

// ... continue for all variations and all stories
```

### Phase 4: Integration

#### 4.1 Package.json Scripts
```json
{
  "scripts": {
    "generate:chromatic": "tsx scripts/generate-chromatic-stories.ts",
    "storybook": "storybook dev -p 9025",
    "storybook:chromatic": "npm run generate:chromatic && storybook dev -p 9025",
    "chromatic": "npm run generate:chromatic && chromatic --exit-zero-on-changes",
    "test:visual": "npm run generate:chromatic && npm run chromatic"
  }
}
```

#### 4.2 Storybook Configuration
```typescript
// .storybook/main.ts
export default {
  stories: [
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    // Include generated stories only in Chromatic builds
    process.env.CHROMATIC && "../stories/chromatic-auto/**/*.test.@(js|ts)"
  ].filter(Boolean),
};
```

#### 4.3 Git Configuration
```gitignore
# .gitignore
# Auto-generated Chromatic test stories
stories/chromatic-auto/
*.chromatic.auto.ts
*.chromatic.generated.ts
```

### Phase 5: Advanced Features

#### 5.1 Combination Testing
```typescript
// Generate stories that test multiple parameters together
export const ColorShape_red_box = {
  args: {
    styleTemplate: templateCreator({
      nodeStyle: {
        texture: {color: 'red'},
        shape: {type: 'box'}
      }
    })
  }
};
```

#### 5.2 Smart Variation Detection
```typescript
// Automatically detect enum values from TypeScript types
type NodeShape = 'box' | 'sphere' | 'cylinder';
// Generator extracts: ['box', 'sphere', 'cylinder']
```

#### 5.3 Incremental Generation
```typescript
// Only regenerate files that have changed
class IncrementalGenerator {
  async generate() {
    const cache = await this.loadCache();
    const files = await this.findStoryFiles();
    
    for (const file of files) {
      if (this.hasChanged(file, cache)) {
        await this.generateTestFile(file);
      }
    }
  }
}
```

## Implementation Steps

### Step 1: Basic Generator (Week 1)
1. Create simple script that reads story files
2. Parse exports and argTypes using regex/simple parsing
3. Generate basic test files with hardcoded variations
4. Test with NodeStyles.stories.ts

### Step 2: Enhanced Parser (Week 2)
1. Implement TypeScript AST parsing
2. Extract complete type information
3. Handle complex argTypes configurations
4. Support all existing story patterns

### Step 3: Configuration System (Week 3)
1. Create configuration file schema
2. Implement variation customization
3. Add parameter mapping system
4. Support output customization

### Step 4: Integration & Testing (Week 4)
1. Update build scripts
2. Configure Storybook for dual mode
3. Test with all existing stories
4. Document usage and maintenance

## Success Metrics

1. **Zero Manual Maintenance**: Generated files require no manual editing
2. **Complete Coverage**: Every parameter variation is tested
3. **Performance**: Generation completes in <30 seconds
4. **Reliability**: Generated stories pass all Chromatic tests
5. **Developer Experience**: Simple commands, clear output

## Risks and Mitigations

### Risk 1: Complex Story Patterns
**Mitigation**: Start with simple stories, progressively handle complexity

### Risk 2: Large Number of Generated Stories
**Mitigation**: Implement smart filtering and story grouping

### Risk 3: TypeScript Parsing Complexity
**Mitigation**: Fallback to simpler parsing for basic cases

### Risk 4: Chromatic Test Limits
**Mitigation**: Configure story batching and priority testing

## Alternative Approaches Considered

1. **Runtime Generation**: Generate stories at Storybook runtime
   - Rejected: Complexity and performance concerns

2. **Webpack Plugin**: Generate during build
   - Rejected: Tight coupling to build system

3. **Manual Mapping**: Maintain variation mappings manually
   - Rejected: Defeats purpose of automation

## Conclusion

This approach provides a clean separation between human-focused documentation and comprehensive visual testing while maintaining a single source of truth. The automated generation ensures complete test coverage without the maintenance burden of duplicate stories.

## Next Steps

1. Review and approve this plan
2. Create proof-of-concept with NodeStyles.stories.ts
3. Iterate based on feedback
4. Implement full solution
5. Migrate existing Chromatic stories to auto-generated approach

## Appendix: Example Usage

```bash
# Developer workflow
$ npm run dev                    # Normal development
$ npm run generate:chromatic     # Generate test stories
$ npm run chromatic             # Run visual tests

# CI workflow
$ npm ci
$ npm run generate:chromatic
$ npm run chromatic -- --auto-accept-changes
```

## References

- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [Storybook Args](https://storybook.js.org/docs/react/writing-stories/args)
- [Chromatic Documentation](https://www.chromatic.com/docs/test)
- Current implementation in `stories/node/NodeStyles.chromatic.stories.ts`