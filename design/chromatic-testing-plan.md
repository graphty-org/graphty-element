# Chromatic Testing Plan for Graphty

## Problem Statement

The current approach for Chromatic testing has two main issues:
1. Stories tagged with `["!dev"]` still appear in Storybook (the tag doesn't work as intended)
2. Chromatic modes aren't working correctly - all variations render the same shape

## Root Cause Analysis

### Issue 1: Tag Visibility
The `["!dev"]` tag pattern isn't a built-in Storybook feature for hiding stories. Storybook's tag system is primarily for categorization and filtering, not for visibility control.

### Issue 2: Chromatic Modes
The `chromatic.modes` feature expects the args to be merged with the story's base args, but the current implementation might be overwriting the entire args object, or there's a timing issue with how the component updates.

## Proposed Solution

### 1. Story Organization Pattern

Create a clear separation between human-readable stories and Chromatic test stories using a combination of:
- **Naming convention**: Use `.chromatic.ts` suffix for Chromatic-only test files
- **Directory structure**: Organize stories into subdirectories
- **Shared test configurations**: Extract common test scenarios into reusable modules

### 2. Implementation Approach

#### A. File Structure
```
stories/
├── node/
│   ├── NodeStyles.stories.ts        # Human-readable stories
│   └── NodeStyles.chromatic.ts      # Chromatic-only tests
├── edge/
│   ├── EdgeStyles.stories.ts
│   └── EdgeStyles.chromatic.ts
├── layout/
│   ├── Layout.stories.ts
│   └── Layout.chromatic.ts
└── test-scenarios/                  # Shared test configurations
    ├── node-variations.ts
    ├── edge-variations.ts
    └── layout-variations.ts
```

#### B. Exclude Chromatic Stories from Storybook

Update `.storybook/main.ts` to exclude chromatic test files:
```typescript
export default {
  stories: [
    "../stories/**/*.stories.ts",
    // Explicitly exclude chromatic test files
    "!../stories/**/*.chromatic.ts"
  ],
  // ... rest of config
};
```

#### C. Shared Test Scenarios

Create reusable test configurations in `stories/test-scenarios/`:

```typescript
// node-variations.ts
export const nodeShapeVariations = [
  { name: 'box', args: { shape: { type: 'box' } } },
  { name: 'sphere', args: { shape: { type: 'sphere' } } },
  // ... all shapes
];

export const nodeColorVariations = [
  { name: 'red', args: { texture: { color: 'red' } } },
  { name: 'blue', args: { texture: { color: 'blue' } } },
  // ... more colors
];

export const nodeSizeVariations = [
  { name: 'small', args: { shape: { size: 0.5 } } },
  { name: 'medium', args: { shape: { size: 1 } } },
  { name: 'large', args: { shape: { size: 3 } } },
];
```

#### D. Chromatic Test Story Generator

Create a utility to generate Chromatic test stories:

```typescript
// stories/chromatic-helpers.ts
import type { Story } from '@storybook/web-components-vite';

interface VariationTest {
  name: string;
  args: Record<string, any>;
}

export function createChromaticStory(
  baseStory: Story,
  variations: VariationTest[],
  options?: {
    delay?: number;
    viewports?: string[];
  }
): Story {
  // Generate a single story that tests all variations
  return {
    ...baseStory,
    play: async ({ canvasElement }) => {
      const graphty = canvasElement.querySelector('graphty-element');
      
      for (const variation of variations) {
        // Apply variation args
        Object.assign(graphty, variation.args);
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, options?.delay || 500));
        
        // Take snapshot with variation name
        await new Promise(resolve => {
          graphty.addEventListener('graph-settled', resolve, { once: true });
        });
      }
    },
    parameters: {
      chromatic: {
        delay: options?.delay || 500,
        viewports: options?.viewports || [1200],
      },
    },
  };
}

// Alternative: Use Chromatic modes (if we can fix the issue)
export function createChromaticModesStory(
  baseStory: Story,
  variations: VariationTest[],
  options?: {
    delay?: number;
  }
): Story {
  const modes: Record<string, any> = {};
  
  variations.forEach(({ name, args }) => {
    modes[name] = {
      args: {
        ...baseStory.args,
        styleTemplate: templateCreator({
          nodeStyle: args,
        }),
      },
    };
  });
  
  return {
    ...baseStory,
    parameters: {
      chromatic: {
        modes,
        delay: options?.delay || 500,
      },
    },
  };
}
```

#### E. Example Implementation

Human-readable story (`stories/node/NodeStyles.stories.ts`):
```typescript
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { nodeShapes, renderFn, templateCreator } from '../helpers';

const meta: Meta = {
  title: 'Styles/Node',
  component: 'graphty-element',
  render: renderFn,
  argTypes: {
    nodeColor: { control: 'color', table: { category: 'Texture' }, name: 'texture.color' },
    nodeShape: { control: 'select', options: nodeShapes, table: { category: 'Shape' }, name: 'shape.type' },
    // ... other controls
  },
  args: {
    // Default args
  },
};

export default meta;

export const Shape: StoryObj = {
  args: {
    styleTemplate: templateCreator({ nodeStyle: { shape: { type: 'box' } } }),
  },
};

export const Color: StoryObj = {
  args: {
    styleTemplate: templateCreator({ nodeStyle: { texture: { color: 'red' } } }),
  },
};
```

Chromatic test story (`stories/node/NodeStyles.chromatic.ts`):
```typescript
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { createChromaticModesStory } from '../chromatic-helpers';
import { nodeShapeVariations, nodeColorVariations, nodeSizeVariations } from '../test-scenarios/node-variations';
import meta from './NodeStyles.stories';

// Reuse the same meta configuration
export default meta;

// Test all shapes
export const AllShapes = createChromaticModesStory(
  meta.args,
  nodeShapeVariations,
  { delay: 500 }
);

// Test color variations
export const AllColors = createChromaticModesStory(
  meta.args,
  nodeColorVariations,
  { delay: 500 }
);

// Test size variations
export const AllSizes = createChromaticModesStory(
  meta.args,
  nodeSizeVariations,
  { delay: 500 }
);

// Test combinations
export const ShapeColorCombinations = createChromaticModesStory(
  meta.args,
  [
    { name: 'box-red', args: { shape: { type: 'box' }, texture: { color: 'red' } } },
    { name: 'sphere-blue', args: { shape: { type: 'sphere' }, texture: { color: 'blue' } } },
    // ... more combinations
  ],
  { delay: 500 }
);
```

### 3. Migration Strategy

1. **Phase 1**: Create the new directory structure and helper utilities
2. **Phase 2**: Move existing Chromatic test stories to `.chromatic.ts` files
3. **Phase 3**: Update `.storybook/main.ts` to exclude chromatic files
4. **Phase 4**: Refactor existing stories to use the new pattern
5. **Phase 5**: Update CI/CD to run both regular and chromatic stories

### 4. Benefits

1. **Clear Separation**: Human-readable stories vs. automated test stories
2. **No Duplication**: Shared test scenarios and reusable utilities
3. **Maintainability**: Changes to test variations in one place
4. **Scalability**: Easy to add new test scenarios
5. **Performance**: Chromatic only runs necessary test stories
6. **Developer Experience**: Storybook UI remains clean and focused

### 5. Alternative Approaches Considered

1. **Custom Storybook Addon**: Create an addon to filter stories based on tags
   - Pros: More integrated solution
   - Cons: Additional complexity, maintenance burden

2. **Environment Variables**: Use env vars to conditionally export stories
   - Pros: Simple implementation
   - Cons: Requires different builds for dev vs. Chromatic

3. **Single File with Conditional Exports**: Keep all stories in one file
   - Pros: Everything in one place
   - Cons: Files become large and hard to maintain

### 6. Implementation Checklist

- [ ] Create directory structure for organized stories
- [ ] Implement `chromatic-helpers.ts` with utility functions
- [ ] Create test scenario modules in `test-scenarios/`
- [ ] Update `.storybook/main.ts` to exclude `.chromatic.ts` files
- [ ] Migrate existing Chromatic test stories
- [ ] Test that Chromatic modes work correctly
- [ ] Update documentation
- [ ] Update CI configuration if needed

### 7. Debugging the Current Issue

Before implementing the new structure, we should debug why the current approach isn't working:

1. **Tag Issue**: Verify if Storybook is configured to respect the `!dev` tag
2. **Modes Issue**: Add logging to see what args are being passed to each mode
3. **Timing Issue**: Ensure the graph fully renders before Chromatic takes screenshots

```typescript
// Debug version of ChromaticAllShapes
export const ChromaticAllShapesDebug = {
  ...AllShapesStory,
  play: async ({ canvasElement }) => {
    console.log('Starting Chromatic shape tests');
    const graphty = canvasElement.querySelector('graphty-element');
    console.log('Current style:', graphty.style);
  },
  parameters: {
    chromatic: {
      modes: {
        box: {
          args: {
            styleTemplate: templateCreator({ nodeStyle: { shape: { type: 'box' } } }),
          },
        },
        sphere: {
          args: {
            styleTemplate: templateCreator({ nodeStyle: { shape: { type: 'sphere' } } }),
          },
        },
      },
      delay: 1000, // Increase delay for debugging
    },
  },
};
```

This plan provides a comprehensive solution that addresses both immediate issues while establishing a scalable pattern for future Chromatic testing needs.