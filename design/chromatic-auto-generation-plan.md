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
1. Imports existing human-focused story files at runtime
2. Reads their argTypes directly from the meta export
3. Generates comprehensive Chromatic test files that import and extend the originals
4. Tests every story with every possible parameter variation based on argTypes

## Current State Analysis

### Existing Story Structure
```typescript
// stories/human/NodeStyles.stories.ts
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

#### 1.1 Create Runtime Story Analyzer
```typescript
// stories/helpers/chromatic-generator.ts
interface StoryModule {
  default: Meta<any>;
  [key: string]: Story<any> | Meta<any>;
}

class StoryAnalyzer {
  async analyzeStoryFile(filePath: string): Promise<StoryAnalysis> {
    // Import the story module dynamically
    const storyModule = await import(filePath) as StoryModule;
    
    // Extract meta and stories directly from the module
    const meta = storyModule.default;
    const stories = Object.entries(storyModule)
      .filter(([key]) => key !== 'default')
      .reduce((acc, [key, value]) => {
        acc[key] = value as Story<any>;
        return acc;
      }, {} as Record<string, Story<any>>);
    
    return {
      filePath,
      meta,
      stories,
      argTypes: meta.argTypes || {}
    };
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

##### Parameter Generation Rules

The variation generator follows these rules based on parameter types:

1. **Number with range (min/max)**
   - Generate 3 test values: minimum, middle, and maximum
   - Example: range 0-10 generates tests for 0, 5, and 10
   - Example: range 0.1-2.0 generates tests for 0.1, 1.05, and 2.0

2. **Select/Options list (enumeration)**
   - Generate a test for each member of the list
   - Example: options ['sphere', 'cube', 'cylinder'] generates 3 tests

3. **Number without range**
   - Generate 3 test values using sensible defaults
   - Example: small (1), medium (10), large (100)
   - Can be configured per parameter in config file

4. **Boolean**
   - Generate 2 tests: true and false
   - Example: wireframe generates wireframe_true and wireframe_false

5. **Color**
   - Generate 3 test formats: hex, named color, and rgb
   - Example: generates #FF0000, "red", and "rgb(255, 0, 0)"
   - Additional test for rgba with transparency: "rgba(255, 0, 0, 0.5)"

6. **Text/String**
   - Use the default value from the story
   - If no default, use a standard test string
   - Example: "Test Label" or story's default value

7. **No parameters**
   - Generate a single test that duplicates the original story
   - Ensures even parameterless stories get visual regression testing

8. **Object/Complex types**
   - Recursively apply rules to nested properties
   - Example: { color: 'red', size: 10 } generates combinations

9. **Array types**
   - Generate tests with empty, single item, and multiple items
   - Example: [], ['item1'], ['item1', 'item2', 'item3']

10. **Date/Time**
    - Generate past, present, and future dates
    - Example: yesterday, today, tomorrow

```typescript
// Example implementation
class VariationGenerator {
  generateVariations(argType: ArgTypeInfo): VariationSet {
    const { control, options, min, max, defaultValue } = argType;
    
    switch (control.type || control) {
      case 'range':
        return this.generateRangeVariations(min, max);
      
      case 'select':
      case 'radio':
        return this.generateSelectVariations(options);
      
      case 'boolean':
        return this.generateBooleanVariations();
      
      case 'color':
        return this.generateColorVariations(defaultValue);
      
      case 'text':
      case 'string':
        return this.generateTextVariations(defaultValue);
      
      case 'number':
        return min !== undefined && max !== undefined
          ? this.generateRangeVariations(min, max)
          : this.generateNumberVariations();
      
      case 'date':
        return this.generateDateVariations();
      
      case 'object':
        return this.generateObjectVariations(argType);
      
      case 'array':
        return this.generateArrayVariations(argType);
      
      default:
        return this.generateDefaultVariations(defaultValue);
    }
  }
  
  private generateRangeVariations(min: number, max: number): VariationSet {
    const middle = (min + max) / 2;
    return {
      parameterPath: this.path,
      variations: [
        { name: `min_${min}`, value: min },
        { name: `mid_${middle}`, value: middle },
        { name: `max_${max}`, value: max }
      ]
    };
  }
  
  private generateColorVariations(defaultValue?: string): VariationSet {
    return {
      parameterPath: this.path,
      variations: [
        { name: 'hex', value: '#FF5733' },
        { name: 'named', value: 'blue' },
        { name: 'rgb', value: 'rgb(128, 256, 0)' },
        { name: 'rgba', value: 'rgba(255, 0, 0, 0.5)' }
      ]
    };
  }
}
```

#### 1.3 Create Test File Generator
```typescript
// stories/helpers/chromatic-generator.ts (continued)
class ChromaticTestGenerator {
  generateTestFile(analysis: StoryAnalysis, variations: VariationSet[]): string {
    // Generate TypeScript file that imports original stories
    // Create test stories for each variation combination
    // Use argTypes to determine how to apply variations
    
    const imports = `
import * as OriginalStories from '../../human/${path.basename(analysis.filePath)}';
import { templateCreator } from '../../helpers/helpers';
`;
    
    const metaExport = `
const meta = {
  ...OriginalStories.default,
  title: \`Chromatic/Auto/\${OriginalStories.default.title}\`,
  tags: ['!dev', 'chromatic-auto'],
  parameters: {
    chromatic: { delay: 2000 },
    controls: { hideNoControlsWarning: true }
  }
};
export default meta;
`;
    
    // Generate story variations based on argTypes
    const storyExports = this.generateStoryVariations(analysis, variations);
    
    return imports + metaExport + storyExports;
  }
}
```

### Phase 2: Configuration System

#### 2.1 Configuration File
```json
// chromatic-generation.config.json
{
  "sourcePattern": "stories/human/*.stories.ts",
  "outputDirectory": "stories/auto-generated",
  "exclude": ["**/auto-generated/**", "**/*.chromatic.*"],
  "parameterGeneration": {
    "defaults": {
      "numberWithoutRange": [1, 10, 100],
      "textDefault": "Test Value",
      "dateOffsets": [-86400000, 0, 86400000]  // -1 day, today, +1 day
    },
    "overrides": {
      "shape.size": [0.5, 1, 2, 5],
      "texture.color.opacity": [0.2, 0.5, 0.8, 1],
      "label.fontSize": [8, 14, 24]
    }
  },
  "storiesPerFile": 100,  // Split large outputs
  "testDelay": 2000,      // Chromatic delay
  "combinationTesting": {
    "enabled": false,     // Test parameter combinations
    "maxCombinations": 10 // Limit to prevent explosion
  }
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
├── human/                    # All human-focused stories (flat structure)
│   ├── NodeStyles.stories.ts
│   ├── EdgeStyles.stories.ts
│   ├── LabelStyles.stories.ts
│   ├── Layout.stories.ts
│   ├── GraphStyles.stories.ts
│   ├── Calculated.stories.ts
│   ├── Data.stories.ts
│   └── ...
├── auto-generated/           # Generated files (gitignored)
│   ├── index.ts             # Barrel export
│   ├── node/                # Organized by category
│   │   ├── NodeStyles.chromatic.ts
│   │   └── NodeStyles-variations.chromatic.ts
│   ├── edge/
│   │   ├── EdgeStyles.chromatic.ts
│   │   └── EdgeStyles-variations.chromatic.ts
│   ├── layout/
│   │   └── Layout.chromatic.ts
│   └── ...
└── helpers/                 # Shared utilities
    ├── helpers.ts          # Existing helper functions
    └── chromatic-generator.ts  # Generation script
```

#### 3.2 Generated File Format
```typescript
// stories/auto-generated/node/NodeStyles.chromatic.ts
// AUTO-GENERATED FILE - DO NOT EDIT
// Source: stories/human/NodeStyles.stories.ts
// Generated: 2025-07-21T10:00:00Z

import { Meta, StoryObj } from '@storybook/web-components-vite';
import * as OriginalStories from '../../human/NodeStyles.stories';
import { templateCreator } from '../../helpers/helpers';

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
    "../stories/human/*.stories.@(js|jsx|mjs|ts|tsx)",
    // Include generated stories only in Chromatic builds
    process.env.CHROMATIC && "../stories/auto-generated/**/*.chromatic.@(js|ts)"
  ].filter(Boolean),
};
```

#### 4.3 Git Configuration
```gitignore
# .gitignore
# Auto-generated Chromatic test stories
stories/auto-generated/
```

### Phase 5: Advanced Features

#### 5.1 ArgType-Based Generation
```typescript
// Generate variations based on argType definitions
const generateFromArgType = (argType: ArgType, paramName: string) => {
  // Read control type and options directly from argType
  const { control, options, min, max } = argType;
  
  if (control === 'select' && options) {
    return options.map(opt => ({ name: opt, value: opt }));
  }
  
  if (control === 'boolean') {
    return [
      { name: 'true', value: true },
      { name: 'false', value: false }
    ];
  }
  
  if (control?.type === 'range' && min !== undefined && max !== undefined) {
    const mid = (min + max) / 2;
    return [
      { name: `min_${min}`, value: min },
      { name: `mid_${mid}`, value: mid },
      { name: `max_${max}`, value: max }
    ];
  }
  
  // Default case
  return [{ name: 'default', value: argType.defaultValue }];
};
```

#### 5.2 Parameter Path Mapping
```typescript
// Map argType names (from story) to styleTemplate paths
const mapParameterToStyleTemplate = (paramName: string, value: any) => {
  // Handle nested paths like "texture.color"
  const path = argType.name || paramName;
  const segments = path.split('.');
  
  let result = {};
  let current = result;
  
  // Build nested object structure
  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      current[segment] = value;
    } else {
      current[segment] = {};
      current = current[segment];
    }
  });
  
  // Wrap in appropriate style layer
  if (path.startsWith('node')) {
    return { nodeStyle: result };
  } else if (path.startsWith('edge')) {
    return { edgeStyle: result };
  }
  
  return result;
};
```

## Implementation Steps

### Step 1: Basic Generator (Week 1)
1. Create stories/helpers/chromatic-generator.ts script
2. Import story modules and read argTypes directly
3. Generate test files in stories/auto-generated/ with appropriate subdirectories
4. Test with NodeStyles.stories.ts from stories/human/

### Step 2: Enhanced Generator (Week 2)
1. Handle all argType control types properly
2. Support nested parameter paths (e.g., "texture.color")
3. Implement parameter mapping to styleTemplate
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

### Risk 3: Runtime Import Complexity
**Mitigation**: Use dynamic imports with proper error handling

### Risk 4: Chromatic Test Limits
**Mitigation**: Configure story batching and priority testing

## Alternative Approaches Considered

1. **Runtime Generation**: Generate stories at Storybook runtime
   - Rejected: Complexity and performance concerns

2. **Webpack Plugin**: Generate during build
   - Rejected: Tight coupling to build system

3. **Manual Mapping**: Maintain variation mappings manually
   - Rejected: Defeats purpose of automation

## Parameter Type Coverage Summary

The automated generation system covers all common Storybook parameter types:

1. **Number with range** → 3 tests (min, mid, max)
2. **Select/Options** → N tests (one per option)
3. **Number without range** → 3 tests (configurable defaults)
4. **Boolean** → 2 tests (true, false)
5. **Color** → 4 tests (hex, named, rgb, rgba)
6. **Text/String** → 1 test (default or standard value)
7. **No parameters** → 1 test (exact copy)
8. **Object** → Recursive application of rules
9. **Array** → 3 tests (empty, single, multiple)
10. **Date** → 3 tests (past, present, future)

This comprehensive coverage ensures that every visual aspect of the component is tested across its full range of possible values, catching regressions that might only appear at edge cases or specific parameter combinations.

## Conclusion

This approach provides a clean separation between human-focused documentation and comprehensive visual testing while maintaining a single source of truth. The automated generation ensures complete test coverage without the maintenance burden of duplicate stories.

## Migration Plan

### Phase 1: Directory Restructuring
1. Create `stories/human/` directory
2. Move all existing `*.stories.ts` files to `stories/human/` (flat structure)
3. Keep `stories/helpers/` for shared utilities
4. Add `stories/auto-generated/` to `.gitignore`

### Phase 2: Implementation
1. Create `stories/helpers/chromatic-generator.ts`
2. Test generator with one story file
3. Generate all chromatic tests to `stories/auto-generated/`
4. Verify Chromatic tests pass

### Phase 3: Cleanup
1. Remove any existing `*.chromatic.stories.ts` files
2. Update documentation to reflect new structure
3. Update CI/CD pipelines if needed

## Next Steps

1. Review and approve this plan
2. Restructure directories as specified
3. Create proof-of-concept with NodeStyles.stories.ts
4. Iterate based on feedback
5. Implement full solution for all stories

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

- [Storybook Args](https://storybook.js.org/docs/react/writing-stories/args)
- [Storybook ArgTypes](https://storybook.js.org/docs/react/api/argtypes)
- [Chromatic Documentation](https://www.chromatic.com/docs/test)
- Current implementation in `stories/node/NodeStyles.chromatic.stories.ts`