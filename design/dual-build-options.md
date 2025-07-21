# Dual Build Options: Storybook vs Chromatic

This document explores different approaches for maintaining separate builds - one for human documentation/visualization (Storybook) and one for visual regression testing (Chromatic).

## Current State Analysis

Currently, the project uses:
- Mixed story files (some `.stories.ts`, some `.chromatic.stories.ts`)
- Chromatic modes for theme/viewport combinations
- `["!dev"]` tags to exclude Chromatic stories from development
- Shared helpers and utilities between story types

## Option 1: Separate Story Directory Trees

### Structure
```
stories/
├── human/              # Human documentation stories
│   ├── Components.stories.ts
│   ├── Layout.stories.ts
│   └── Styling.stories.ts
├── chromatic/          # Visual regression test stories
│   ├── Components.chromatic.ts
│   ├── Layout.chromatic.ts
│   └── Styling.chromatic.ts
└── shared/             # Shared utilities
    ├── helpers.ts
    └── data.ts
```

### Implementation
- Two separate Storybook configs: `.storybook-human/` and `.storybook-chromatic/`
- Different story patterns in each config
- Chromatic stories import and test all variations from human stories

### Pros
- Complete separation of concerns
- No story pollution in human docs
- Independent configuration and optimization

### Cons
- Duplicate configuration maintenance
- More complex build pipeline
- Potential for drift between the two

---

## Option 2: Build-time Story Filtering

### Implementation
```typescript
// Environment-based story inclusion
const meta = {
  title: 'Components/Graph',
  component: 'graphty-element',
  tags: process.env.BUILD_TARGET === 'chromatic' ? ['chromatic'] : ['human']
};

// Conditional story export
export const BasicGraph = process.env.BUILD_TARGET === 'human' 
  ? humanStoryConfig 
  : chromaticTestConfig;
```

### Build Scripts
```json
{
  "scripts": {
    "storybook:human": "BUILD_TARGET=human storybook dev",
    "storybook:chromatic": "BUILD_TARGET=chromatic storybook dev",
    "build-storybook:human": "BUILD_TARGET=human storybook build",
    "build-storybook:chromatic": "BUILD_TARGET=chromatic storybook build"
  }
}
```

### Pros
- Single source of truth for stories
- Shared configuration and utilities
- Environment-driven differentiation

### Cons
- Stories become more complex with conditional logic
- Harder to debug/develop individual builds
- Risk of breaking both builds with single change

---

## Option 3: Meta-based Story Filtering with Enhanced Tags

### Implementation
```typescript
// Enhanced tagging system
const humanMeta = {
  title: 'Components/Graph',
  tags: ['human', 'documentation', 'interactive'],
  parameters: {
    docs: { page: CustomDocPage },
    controls: { expanded: true }
  }
};

const chromaticMeta = {
  title: 'Visual Tests/Graph',
  tags: ['chromatic', 'test', '!dev', '!autodocs'],
  parameters: {
    chromatic: { delay: 1000 },
    controls: { hideNoControlsWarning: true }
  }
};
```

### Configuration
```typescript
// .storybook/main.ts
export default {
  stories: [
    process.env.STORYBOOK_MODE === 'chromatic'
      ? '../stories/**/*.chromatic.@(js|ts)'
      : '../stories/**/*.stories.@(js|ts)'
  ]
};
```

### Pros
- Leverages existing Storybook filtering
- Clean separation via configuration
- Easy to extend with more build types

### Cons
- Still requires maintaining separate story files
- Configuration complexity increases

---

## Option 4: Programmatic Story Generation

### Implementation
```typescript
// Base story definitions
const baseStories = {
  BasicGraph: { data: catSocialNetwork, layout: 'force' },
  CircularGraph: { data: catSocialNetwork, layout: 'circular' },
  StyledGraph: { data: catSocialNetwork, styles: customStyles }
};

// Human stories (rich, interactive)
export const BasicGraph = createHumanStory(baseStories.BasicGraph, {
  controls: { expanded: true },
  docs: { page: CustomDocPage }
});

// Chromatic stories (comprehensive testing)
export const BasicGraphTests = createChromaticTestSuite(baseStories.BasicGraph, {
  themes: ['light', 'dark'],
  viewports: ['mobile', 'desktop'],
  variations: {
    nodeCount: [10, 50, 100],
    layouts: ['force', 'circular', 'random']
  }
});
```

### Helper Functions
```typescript
function createChromaticTestSuite(baseConfig, testMatrix) {
  return Object.entries(testMatrix).reduce((stories, [key, values]) => {
    values.forEach(value => {
      stories[`${key}_${value}`] = {
        ...baseConfig,
        [key]: value,
        parameters: { chromatic: { delay: 500 } }
      };
    });
    return stories;
  }, {});
}
```

### Pros
- Single source of truth for story logic
- Automatic comprehensive testing
- Reduces duplication significantly

### Cons
- More complex helper functions
- Less explicit control over individual tests
- Harder to debug specific test cases

---

## Option 5: Monorepo-style Package Separation

### Structure
```
packages/
├── storybook-human/
│   ├── .storybook/
│   ├── stories/
│   └── package.json
├── storybook-chromatic/
│   ├── .storybook/
│   ├── stories/
│   └── package.json
└── shared-stories/
    ├── base-stories.ts
    ├── helpers.ts
    └── data.ts
```

### Implementation
- Human package imports and enhances base stories
- Chromatic package imports and tests all variations
- Shared package contains core story logic
- Independent deployment and versioning

### Pros
- Complete independence
- Easy to optimize each build separately
- Clear ownership and responsibility

### Cons
- Significant restructuring required
- More complex CI/CD pipeline
- Potential for package version mismatches

---

## Recommended Approach: Option 4 + Enhanced Helpers

Based on the current codebase structure and requirements, I recommend **Option 4 (Programmatic Story Generation)** with enhanced helper functions:

### Implementation Plan

1. **Create Base Story Definitions**
   ```typescript
   // stories/base/component-definitions.ts
   export const graphStoryDefinitions = {
     basic: { data: catSocialNetwork, layout: 'force' },
     styled: { data: catSocialNetwork, styles: advancedStyles },
     large: { data: largeSocialNetwork, layout: 'force' }
   };
   ```

2. **Enhanced Helper Functions**
   ```typescript
   // stories/helpers/story-generators.ts
   export function createHumanStory(definition, enhancements = {}) {
     return templateCreator({
       ...definition,
       controls: { expanded: true },
       docs: { page: CustomDocPage },
       ...enhancements
     });
   }

   export function createChromaticSuite(definition, testMatrix) {
     // Generate comprehensive test variations
   }
   ```

3. **Story File Structure**
   ```typescript
   // stories/Components.stories.ts (Human-focused)
   export const BasicGraph = createHumanStory(graphDefinitions.basic);
   
   // stories/Components.chromatic.ts (Test-focused)
   export const BasicGraphTests = createChromaticSuite(graphDefinitions.basic, {
     themes: ['light', 'dark'],
     nodeShapes: ['circle', 'square', 'triangle'],
     nodeSizes: ['small', 'medium', 'large']
   });
   ```

### Benefits of This Approach
- Maintains current project structure
- Eliminates duplication while preserving control
- Scales well as the component library grows
- Easy to add new test dimensions
- Compatible with existing Chromatic setup

### Migration Path
1. Extract current story configurations into base definitions
2. Create enhanced helper functions
3. Migrate existing stories to use new generators
4. Add comprehensive test matrices for Chromatic stories
5. Configure separate build commands for each use case

This approach provides the best balance of maintainability, scalability, and separation of concerns while working within the existing project structure.