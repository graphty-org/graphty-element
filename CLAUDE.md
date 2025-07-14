# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Graphty is a Web Component library for 3D/2D graph visualization built with:

- **TypeScript** (ES2022, strict mode)
- **Lit** (Web Components framework)
- **Babylon.js** (3D rendering engine)
- **Vite** (build tool)

The main component `<graphty-element>` provides interactive graph visualizations with multiple layout algorithms and rich styling options.

## Essential Commands

### Development

```bash
npm install          # Install dependencies (also runs playwright install)
npm run dev         # Start Vite dev server
npm run storybook   # Start Storybook on port 9025
```

### Testing

```bash
npm test            # Run default Vitest tests
npm run test:visual # Run visual tests to see if rendering changed
npm run test:storybook # Run Storybook tests to see if functionality work
npm run test:all    # Run all tests (default + Storybook + Chromatic tests)
npm run coverage    # Run all tests with coverage
```

### Linting & Code Quality

```bash
npm run lint        # Run ESLint
npm run lint -- --fix # Run ESLint, fix auto-fixable errors
npm run lint:pkg    # Run knip (check unused dependencies/exports)
npm run lint:all    # Run both ESLint and knip
```

### Building

```bash
npm run build       # TypeScript + Vite build
npm run preview     # Preview production build
```

### Pre-commit Workflow

```bash
npm run ready:commit # Run lint, build, and test:all to prepare for commit
```

When preparing code for commit, you can ask Claude to "run ready:commit and fix
all errors" or "make it ready:commit". Claude will repeatedly run this command
and fix any lint, build, or test errors until everything passes. After
successfully completing, generate a commit comment for all current changes.

**IMPORTANT**: Never run `git commit` commands. The user will handle all git commits themselves.

## Architecture Overview

### Core Components

1. **graphty-element.ts** - Main Web Component entry point

   - Manages lifecycle and property bindings
   - Initializes Graph instance with configuration

2. **Graph.ts** - Central orchestrator

   - Integrates Babylon.js scene management
   - Coordinates nodes, edges, layouts, and styling
   - Manages render loop and performance tracking

3. **Node.ts / Edge.ts** - Graph elements

   - Node: 3D meshes with shapes, textures, drag behavior
   - Edge: GreasedLine rendering with arrow heads
   - Both use ChangeManager for reactive updates

4. **Layout System** - Plugin architecture

   - Abstract LayoutEngine base class
   - Registry pattern for dynamic layout registration
   - Implementations: Force-directed (D3/NGraph), Circular, Random, etc.

5. **Styling System** (Styles.ts)

   - CSS-like layer-based styling
   - JMESPath selectors for targeting elements
   - Cached computed styles for performance

6. **Data Sources** - Plugin system for data ingestion
   - Abstract DataSource with async generator pattern
   - Zod schema validation
   - Supports chunked loading for large graphs

### Key Design Patterns

- **Registry Pattern**: Used for layouts, data sources, and algorithms
- **Observable Pattern**: Event handling via graphObservable, nodeObservable, edgeObservable
- **Factory Pattern**: Node/Edge mesh creation
- **Plugin Architecture**: All major systems are extensible

### Performance Optimizations

- Mesh instancing via MeshCache
- Lazy ray updates for edge arrows
- Style caching
- Chunked data loading
- Render loop optimization with settled state detection

## Development Notes

- ESLint auto-fixes on save (VSCode configured)
- Commitizen enforces conventional commits
- Husky runs pre-commit hooks
- TypeScript strict mode is enabled
- Babylon.js is externalized in the build

### TypeScript Best Practices

- **NEVER** disable `@typescript-eslint/no-explicit-any` unless absolutely necessary
- When you encounter type issues, prefer:
  1. Creating proper type definitions
  2. Using type assertions with specific types (e.g., `as SpecificType`)
  3. Using generics or type parameters
  4. Creating type mappings or lookup types
- Only use `any` as a last resort when:
  - Interfacing with untyped third-party libraries
  - Dynamic property access that can't be properly typed
  - And even then, try to limit its scope as much as possible
- **DO NOT** use ESLint disable comments unless absolutely necessary

## Testing Approach

The project uses Vitest with two test projects:

- **default**: General unit/integration tests
- **storybook**: Storybook-specific tests

Tests run in the browser using Playwright. Coverage reports are generated in the `coverage/` directory.

When you write unit tests with vitest, prefer `assert` over `expect`.

## Architectural Insights

- **graphty-element wrapper principle**: 
  - graphty-element is a light wrapper around Graph
  - All logic and functionality should be in Graph.ts

## Core Architectural Principles

- **Stateless Design**:
  - The Graph is stateless, APIs may be called in any order and are expected to operate the same regardless of the order they are called in

## Design Philosophy

- **Modularity and Extensibility**:
  - This code is intended to be modular and extensible
  - Features like cameras, meshes, layouts, and algorithms are intended to be extendible by users

## Development Best Practices

- Always create unit tests when you write new core functionality