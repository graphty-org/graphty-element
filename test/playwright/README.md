# Playwright Visual Tests

This directory contains the Playwright visual testing infrastructure for the Graphty component library.

## Structure

- `playwright-generator.ts` - The main test generator that parses story files using TypeScript AST to generate visual tests based on `parameters.controls.include`
- `generated/` - Auto-generated test files (do not edit manually)
- `utils/` - Utility functions for visual testing
- `global-setup.ts` / `global-teardown.ts` - Playwright setup/teardown hooks
- `setup/` - Additional setup configuration
- `interaction/` - Interaction tests (if any)
- `performance/` - Performance tests (if any)
- `experimental-backup~/` - Backup of experimental files from previous iterations

## Usage

1. **Generate tests**: `npm run test:visual:generate`
   - This runs the AST-based generator that reads story files and creates tests based on their `parameters.controls.include`

2. **Run visual tests**: `npm run test:visual`
   - Generates tests and runs them

3. **Update snapshots**: `npm run test:visual:update`
   - Updates baseline screenshots when visual changes are intentional

## How It Works

The test generator (`playwright-generator.ts`) uses TypeScript's compiler API to:
1. Parse story files in `stories/human/`
2. Extract `parameters.controls.include` from each story
3. Map control names to their argTypes
4. Generate appropriate test variations for each control type
5. Apply optimizations for different layout types (static vs physics-based)

## Notes

- Tests are generated based on what each story actually uses, not a hardcoded list
- The generator cleans the `generated/` folder before each run to ensure no stale tests
- Different layout types have different optimization settings (pre-steps, render counts, etc.)