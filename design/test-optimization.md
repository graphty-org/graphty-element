# Test Optimization Design Document

## Problem Statement

We have 4,000+ tests that take 20+ minutes to run. Testing is critical for this AI-assisted development project since we risk regressions from AI lacking context. We need to accelerate testing without risking regressions.

---

## Current State

| Metric | Value |
|--------|-------|
| Total test files | 271 |
| Total tests | ~4,000 |
| Total runtime | ~20 minutes |
| Test levels | Unit (Node.js), Browser, Interactions, Storybook, Visual (Chromatic) |

### Test Distribution

| Level | Files | Tests | Time |
|-------|-------|-------|------|
| Unit (default) | 163 | 2,971 | ~10s |
| Browser | 77 | 1,326 | ~4.5 min |
| Interactions | 20 | 232 | ~2 min |
| Storybook | 30 | 150 | ~4 min |
| Visual (Chromatic) | - | - | ~3-5 min |

---

## Optimization Strategies

### 1. Test Sharding (CI Parallelization) ✅ IMPLEMENTED

**Status**: Implemented in `.github/workflows/ci.yml`

**Approach**: Split tests across parallel CI runners using GitHub Actions matrix strategy.

**Implementation**:
```yaml
strategy:
  matrix:
    shard: [default, browser, storybook, visual]
```

**Results**:
| Before | After | Improvement |
|--------|-------|-------------|
| ~20 min sequential | ~6 min parallel | **3-4x faster** |

**References**:
- [Vitest sharding docs](https://vitest.dev/guide/cli.html)
- [GitHub Actions matrix](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)

---

### 2. Test Parameterization

**Status**: Not implemented

**Approach**: Convert similar tests to parameterized tests using `test.each()`.

**Opportunity Analysis**:

| File Pattern | Current Tests | After | Reduction |
|--------------|---------------|-------|-----------|
| Direction tests (2d/3d/xr) | 48 | 12 | 75% |
| Style helper performance | 17 | 6 | 65% |
| Algorithm metadata tests | 180+ | 60 | 67% |
| PointerRenderer | 21 | 10 | 52% |

**Example Transformation**:
```javascript
// BEFORE: 8 separate tests
test("W key pans up", () => { /* ... */ });
test("S key pans down", () => { /* ... */ });
test("A key pans left", () => { /* ... */ });
test("D key pans right", () => { /* ... */ });
// ... 4 more arrow key tests

// AFTER: 1 parameterized test
test.each([
  ["W", "y", 1],
  ["S", "y", -1],
  ["A", "x", -1],
  ["D", "x", 1],
  ["ArrowUp", "y", 1],
  ["ArrowDown", "y", -1],
  ["ArrowLeft", "x", -1],
  ["ArrowRight", "x", 1],
])("%s key pans %s axis by %i", (key, axis, direction) => {
  // Single test implementation
});
```

**High-Priority Files**:
1. `test/interactions/unit/2d-direction.test.ts` (16→4 tests)
2. `test/interactions/unit/3d-direction.test.ts` (16→4 tests)
3. `test/interactions/unit/xr-direction.test.ts` (16→4 tests)
4. `test/style-helpers/style-helpers-performance.test.ts` (17→6 tests)
5. `test/PointerRenderer.test.ts` (21→10 tests)

**Estimated Impact**: ~100-150 tests reduced, ~2-3 min saved

**References**:
- [Vitest test.each](https://vitest.dev/api/#test-each)
- [Parameterized testing with Vitest](https://medium.com/@maffelu/parameterized-testing-with-vitest-d755a1c353c4)

---

### 3. Shared Test Fixtures

**Status**: Not implemented

**Approach**: Create reusable fixtures for common test setup patterns.

**Pattern Found**: 20+ browser test files have identical setup:
```javascript
let container: HTMLElement;
let graph: Graph;

beforeEach(() => {
  container = document.createElement("div");
  container.style.width = "800px";
  container.style.height = "600px";
  document.body.appendChild(container);
  graph = new Graph(container);
});

afterEach(() => {
  graph.dispose();
  container.remove();
});
```

**Proposed Solution**:
```javascript
// test/helpers/graph-fixture.ts
export async function withGraph(
  testFn: (graph: Graph, container: HTMLElement) => Promise<void>,
  options?: { width?: number; height?: number }
) {
  const container = document.createElement("div");
  container.style.width = `${options?.width ?? 800}px`;
  container.style.height = `${options?.height ?? 600}px`;
  document.body.appendChild(container);
  const graph = new Graph(container);

  try {
    await graph.init();
    await testFn(graph, container);
  } finally {
    graph.dispose();
    container.remove();
  }
}

// Usage:
test("my test", () => withGraph(async (graph) => {
  await graph.addNodes([{ id: "1" }]);
  assert.equal(graph.nodeCount, 1);
}));
```

**Files Affected**: 20+ browser test files

**Estimated Impact**: Reduced boilerplate, easier maintenance, ~30s saved from faster setup

**References**:
- [Playwright Fixtures](https://playwright.dev/docs/test-fixtures)
- [Vitest fixtures pattern](https://vitest.dev/guide/test-context.html)

---

### 4. Worker-Scoped Fixtures (Browser Tests)

**Status**: Not implemented

**Approach**: Share expensive setup (browser context, authentication) across tests in the same worker.

**Current Problem**: Each browser test file creates fresh browser context.

**Proposed Solution**:
```javascript
// vitest.config.ts - browser project
{
  test: {
    // Use worker-scoped setup
    globalSetup: './test/browser-global-setup.ts',
    setupFiles: ['./test/browser-worker-setup.ts'],
  }
}

// test/browser-worker-setup.ts
let sharedScene: Scene;
let sharedEngine: Engine;

beforeAll(async () => {
  sharedEngine = new Engine(canvas);
  sharedScene = new Scene(sharedEngine);
});

afterAll(() => {
  sharedScene.dispose();
  sharedEngine.dispose();
});
```

**Estimated Impact**: ~30-60s saved from reduced browser/engine initialization

**References**:
- [Playwright worker-scoped fixtures](https://playwright.dev/docs/test-fixtures#worker-scoped-fixtures)
- [Vitest globalSetup](https://vitest.dev/config/#globalsetup)

---

### 5. Test Level Promotion (Browser → Unit)

**Status**: Not implemented

**Approach**: Move tests that use NullEngine from browser project to unit project.

**Candidates Identified**:

| File | Tests | Why Promotable |
|------|-------|----------------|
| test/browser/Edge.label.test.ts | 12 | NullEngine, config testing |
| test/browser/Edge.tooltip.test.ts | 8 | NullEngine, config testing |
| test/browser/Edge.arrowText.test.ts | 10 | NullEngine, config testing |
| test/browser/input-manager.test.ts | 6 | Mock input system |
| test/browser/UpdateManager.zoomToFit.test.ts | 5 | NullEngine + mock camera |
| test/browser/PatternedLineRenderer.test.ts | 4 | Geometry calculations |
| **Total** | **45** | |

**Implementation**:
1. Move files to `test/unit/` or update vitest.config.ts includes
2. Verify no DOM dependencies
3. Remove from browser project excludes

**Estimated Impact**: ~45 tests move from 4.5 min shard to 10s shard = **~60-90s saved**

---

### 6. Algorithm Test Consolidation

**Status**: Not implemented

**Approach**: Create shared test utilities for the 22+ algorithm test files that have identical patterns.

**Pattern Found**: Every algorithm test file contains:
- "has suggested styles defined" test
- "returns correct category" test
- "uses StyleHelpers for color mapping" test
- "has correct namespace and type" test
- "is retrievable via Algorithm.getClass" test

**Proposed Solution**:
```javascript
// test/helpers/algorithm-test-utils.ts
export function createAlgorithmTests(
  AlgorithmClass: typeof Algorithm,
  config: {
    namespace: string;
    type: string;
    category: "node-metric" | "edge-metric" | "community" | "path";
  }
) {
  describe("Algorithm Metadata", () => {
    test("has correct namespace and type", () => {
      assert.equal(AlgorithmClass.namespace, config.namespace);
      assert.equal(AlgorithmClass.type, config.type);
    });

    test("is retrievable via Algorithm.getClass", () => {
      const retrieved = Algorithm.getClass(config.namespace, config.type);
      assert.equal(retrieved, AlgorithmClass);
    });
  });

  describe("Suggested Styles", () => {
    test("has valid suggested styles", () => {
      assert.isTrue(AlgorithmClass.hasSuggestedStyles());
      const styles = AlgorithmClass.getSuggestedStyles();
      assert.equal(styles.category, config.category);
      assert.isArray(styles.layers);
      assert.isTrue(styles.layers.length > 0);
    });
  });
}

// Usage in algorithm test file:
import { createAlgorithmTests } from "../helpers/algorithm-test-utils";
import { PageRankAlgorithm } from "../../src/algorithms/centrality/PageRankAlgorithm";

createAlgorithmTests(PageRankAlgorithm, {
  namespace: "centrality",
  type: "pagerank",
  category: "node-metric",
});

// Algorithm-specific tests only
describe("PageRank Specific", () => {
  test("calculates pagerank scores correctly", () => { /* ... */ });
});
```

**Files Affected**: 22+ algorithm test files

**Estimated Impact**: ~80 tests consolidated into shared utilities

---

### 7. Multiple Assertions Per Logical Concept

**Status**: Not implemented

**Approach**: Combine related assertions that verify the same logical concept.

**Pattern Found**:
```javascript
// BEFORE: 3 tests
test("mesh exists", () => { assert.exists(mesh); });
test("mesh not disposed", () => { assert.isFalse(mesh.isDisposed); });
test("mesh has vertices", () => { assert.isAbove(mesh.vertices.length, 0); });

// AFTER: 1 test
test("mesh is valid", () => {
  assert.exists(mesh);
  assert.isFalse(mesh.isDisposed);
  assert.isAbove(mesh.vertices.length, 0);
});
```

**Guidance**: Only combine when:
- Assertions verify the same object/concept
- Failure of one assertion doesn't make others meaningless
- Tests are sequential in the same describe block

**References**:
- [Stack Overflow: Multiple assertions are fine](https://stackoverflow.blog/2022/11/03/multiple-assertions-per-test-are-fine/)
- [Grouping Assertions in Tests](https://ardalis.com/grouping-assertions-in-tests/)

---

### 8. Mutation Testing (Stryker)

**Status**: Not implemented (Research phase)

**Approach**: Use mutation testing to identify truly redundant tests.

**How It Works**:
1. Stryker introduces small changes ("mutants") to source code
2. Runs tests to see which ones catch the mutants
3. Tests that kill the same mutants may be duplicates

**Mutation Types Relevant to Our Codebase**:

| Mutation Type | Occurrences in src/ | Relevance |
|---------------|---------------------|-----------|
| Comparisons (<, >, ===) | 1,581 | High |
| Boolean logic (&&, \|\|) | 740 | High |
| Optional chaining (?.) | 341 | High |
| Array methods | 139 | Medium |
| Arithmetic | 111 | Medium |

**Setup**:
```bash
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner

npx stryker init
```

**Configuration** (stryker.config.json):
```json
{
  "testRunner": "vitest",
  "mutate": ["src/**/*.ts", "!src/**/*.d.ts"],
  "reporters": ["html", "progress"],
  "incremental": true,
  "incrementalFile": ".stryker-cache/incremental.json"
}
```

**Caveats**:
- **Slow**: Runs full test suite per mutant (hours for large codebases)
- **Incremental mode**: Only tests changed code
- **Primary purpose**: Finding weak tests, not duplicates

**When to Use**:
- After other optimizations are complete
- For validating test quality, not reducing count
- In incremental mode on PRs

**References**:
- [Stryker Mutator](https://stryker-mutator.io/)
- [Automatically detecting redundant tests](https://lakitna.medium.com/automatically-detecting-redundant-tests-be9151fdd855)

---

### 9. Coverage-Based Analysis

**Status**: Partially implemented (scripts created)

**Approach**: Use coverage data to identify overlapping test coverage.

**Scripts Created**:
- `scripts/analyze-test-coverage-overlap.ts`
- `scripts/analyze-test-purposes.ts`

**Limitations**:
- Coverage tells you WHAT ran, not WHETHER it was verified
- Two tests covering same lines may test different behaviors
- High false-positive rate for redundancy detection

**Best Used For**:
- Identifying untested code
- Finding code tested at multiple levels
- NOT for identifying duplicate tests (use mutation testing instead)

**References**:
- [Academic paper on test redundancy detection](https://www.hindawi.com/journals/ase/2010/932686/)

---

### 10. AI-Powered Test Optimization

**Status**: Research phase

**Commercial Tools**:

| Tool | Purpose | Relevance |
|------|---------|-----------|
| [Launchable](https://www.launchableinc.com/) | ML-based test selection for CI | High - claims 80% of tests are pointless per change |
| [UTRefactor](https://www.promptlayer.com/research-papers/context-enhanced-llm-based-framework-for-automatic-test-refactoring) | LLM-based test refactoring | Medium - experimental |
| [Testim](https://www.testim.io/) | Self-healing tests | Low - for E2E tests |

**Using Claude Code for Analysis**:

Claude Code can scan the codebase and identify:
1. Parameterization candidates (similar test patterns)
2. Shared setup opportunities (duplicate beforeEach)
3. Test level promotion candidates (NullEngine in browser tests)
4. Near-duplicate tests (similar assertions)

**Prompt for Analysis**:
```
Scan test files and identify:
1. Tests that could be parameterized with test.each
2. Heavy beforeEach blocks that could be shared
3. Browser tests using NullEngine that could be unit tests
4. Multiple assertions that could be combined
```

---

### 11. Smart Test Selection (CI Optimization)

**Status**: Not implemented

**Approach**: Only run tests affected by changed files.

**Vitest Support**:
```bash
# Run only tests for changed files
vitest run --changed HEAD~1

# Run tests related to specific files
vitest run --related src/Graph.ts
```

**GitHub Actions Integration**:
```yaml
- name: Get changed files
  id: changed
  uses: tj-actions/changed-files@v40

- name: Run affected tests
  run: vitest run --related ${{ steps.changed.outputs.all_changed_files }}
```

**Considerations**:
- Works well for unit tests
- Less reliable for integration tests
- Should still run full suite on main branch

**References**:
- [Vitest CLI --changed](https://vitest.dev/guide/cli.html)

---

## Implementation Roadmap

### Phase 1: Quick Wins (1-2 days)
**Goal**: Reduce test count by ~100, save ~2-3 minutes

1. [ ] Parameterize `test/interactions/unit/2d-direction.test.ts`
2. [ ] Parameterize `test/interactions/unit/3d-direction.test.ts`
3. [ ] Parameterize `test/interactions/unit/xr-direction.test.ts`
4. [ ] Parameterize `test/style-helpers/style-helpers-performance.test.ts`
5. [ ] Parameterize `test/PointerRenderer.test.ts`

### Phase 2: Algorithm Consolidation (2-3 days)
**Goal**: Reduce ~80 tests, improve maintainability

1. [ ] Create `test/helpers/algorithm-test-utils.ts`
2. [ ] Apply to centrality algorithm tests (6 files)
3. [ ] Apply to community algorithm tests (4 files)
4. [ ] Apply to remaining algorithm tests (12 files)

### Phase 3: Browser Optimizations (2-3 days)
**Goal**: Save ~60-90 seconds

1. [ ] Create shared Graph fixture
2. [ ] Promote NullEngine tests to unit level
3. [ ] Implement worker-scoped fixtures for browser tests

### Phase 4: Advanced (Future)
**Goal**: Continuous optimization

1. [ ] Set up Stryker for incremental mutation testing
2. [ ] Evaluate Launchable for smart test selection
3. [ ] Implement changed-file test selection in CI

---

## Metrics to Track

| Metric | Current | Target |
|--------|---------|--------|
| Total tests | ~4,000 | ~3,000 |
| CI time (total) | ~20 min | ~10 min |
| Unit shard time | ~10s | ~10s |
| Browser shard time | ~4.5 min | ~3 min |
| Storybook shard time | ~4 min | ~3 min |

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Losing coverage during consolidation | Run coverage before/after each change |
| Breaking tests during refactoring | Make atomic commits, run full suite after each change |
| Parameterized tests harder to debug | Include descriptive test names with `%s` formatting |
| Shared fixtures causing test pollution | Use proper cleanup in afterEach/afterAll |

---

## References

### Test Optimization
- [Martin Fowler: Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Kent C. Dodds: Write tests. Not too many. Mostly integration.](https://kentcdodds.com/blog/write-tests)
- [Software Testing Anti-patterns](https://blog.codepipes.com/testing/software-testing-antipatterns.html)

### Tools
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Fixtures](https://playwright.dev/docs/test-fixtures)
- [Stryker Mutator](https://stryker-mutator.io/)
- [Launchable](https://www.launchableinc.com/)

### Academic Research
- [Test Suite Minimization Techniques](https://link.springer.com/chapter/10.1007/978-3-030-35510-4_4)
- [Test Redundancy Detection](https://www.hindawi.com/journals/ase/2010/932686/)

---

## Appendix: File-by-File Opportunities

See `tmp/test-optimization-report.md` for detailed file-by-file analysis.
