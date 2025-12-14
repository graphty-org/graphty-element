# Code Review Report - 11/27/2025

## Executive Summary

- **Files reviewed**: ~50+ files
- **Critical issues**: 0
- **High priority issues**: 4
- **Medium priority issues**: 6
- **Low priority issues**: 8

The codebase is well-structured with consistent patterns. The algorithm implementations and style helper system are professionally designed with good documentation. The main findings relate to opportunities to use style helpers more consistently and some performance/correctness improvements.

---

## Critical Issues (Fix Immediately)

No critical issues found. The code has no security vulnerabilities, data loss risks, or severe correctness problems.

---

## High Priority Issues (Fix Soon)

### 1. Hardcoded Colors Instead of Style Helpers

**Files**:
- `src/algorithms/DijkstraAlgorithm.ts:27-28,46-47,52-53`
- `src/algorithms/KruskalAlgorithm.ts:27,44`
- `src/algorithms/PrimAlgorithm.ts:36,53`
- `src/algorithms/MinCutAlgorithm.ts:32,50,65,80`
- `src/algorithms/MaxFlowAlgorithm.ts:60,65,79,84`
- `src/algorithms/BipartiteMatchingAlgorithm.ts:28,44,60,75`

**Description**: These algorithms use hardcoded hex color values in their `suggestedStyles` instead of using the StyleHelpers and palette system defined in the color-palettes-specification.md. This violates the established pattern where all colors should come from the preferred colorblind-safe palettes.

**Example**: `src/algorithms/DijkstraAlgorithm.ts:27`
```typescript
// Problem code - hardcoded color
line: {
    color: "#e74c3c",  // Hardcoded red
    width: 3,
},
```

**Fix**: Use style helpers for binary highlighting:
```typescript
// Option 1: Use binary color helpers for boolean conditions
calculatedStyle: {
    inputs: ["algorithmResults.graphty.dijkstra.isInPath"],
    output: "style.line.color",
    expr: "{ return StyleHelpers.color.binary.blueHighlight(arguments[0]) }",
},

// Option 2: For static styles, use colors from the palette constants
// Import from palettes and use Okabe-Ito blue (#0072B2) instead of arbitrary red
```

**Affected Colors to Replace**:

| Current | Palette Alternative | Usage |
|---------|-------------------|-------|
| `#e74c3c` (red) | `#D55E00` (Okabe-Ito vermillion) or use binary helper | Path highlighting |
| `#27ae60` (green) | `#009E73` (Okabe-Ito bluish green) | MST edges, source nodes |
| `#95a5a6` (gray) | `#999999` (standard muted gray) | Non-highlighted elements |
| `#3498db` (blue) | `#0072B2` (Okabe-Ito blue) | Partition colors |
| `#9b59b6` (purple) | `#CC79A7` (Okabe-Ito reddish purple) | Matched edges |
| `#e67e22` (orange) | `#E69F00` (Okabe-Ito orange) | Warning/cut edges |

---

### 2. DegreeAlgorithm Has Incorrect In/Out Degree Logic

**Files**: `src/algorithms/DegreeAlgorithm.ts:48-51`

**Description**: The algorithm swaps in-degree and out-degree. For a directed edge `srcId → dstId`, the source node should have out-degree increased, and the destination node should have in-degree increased. The current code does the opposite.

**Example**: `src/algorithms/DegreeAlgorithm.ts:47-52`
```typescript
// Problem code - in/out degree swapped
for (const e of g.getDataManager().edges.values()) {
    incrementMap(inDegreeMap, e.srcId);   // Wrong: srcId should be outDegree
    incrementMap(outDegreeMap, e.dstId);  // Wrong: dstId should be inDegree
    incrementMap(degreeMap, e.srcId);
    incrementMap(degreeMap, e.dstId);
}
```

**Fix**:
```typescript
for (const e of g.getDataManager().edges.values()) {
    incrementMap(outDegreeMap, e.srcId);  // Correct: source has outgoing edge
    incrementMap(inDegreeMap, e.dstId);   // Correct: destination has incoming edge
    incrementMap(degreeMap, e.srcId);
    incrementMap(degreeMap, e.dstId);
}
```

---

### 3. DijkstraAlgorithm Performance Issue - Redundant Path Calculations

**Files**: `src/algorithms/DijkstraAlgorithm.ts:96-99`

**Description**: The algorithm runs a full Dijkstra computation for each node to calculate distances, resulting in O(n²) Dijkstra runs. A single Dijkstra run from the source already computes distances to all nodes.

**Example**: `src/algorithms/DijkstraAlgorithm.ts:93-100`
```typescript
// Problem code - runs Dijkstra n times
for (const nodeId of nodes) {
    const isInPath = pathNodeSet.has(nodeId);
    this.addNodeResult(nodeId, "isInPath", isInPath);

    // This runs full Dijkstra again for each node!
    const distanceResult = this.dijkstra(source, nodeId);
    this.addNodeResult(nodeId, "distance", distanceResult.distance);
}
```

**Fix**: Store distances from the initial Dijkstra run:
```typescript
// Store all distances from a single run
const { path, distances } = this.dijkstraWithAllDistances(source);

for (const nodeId of nodes) {
    const isInPath = pathNodeSet.has(nodeId);
    this.addNodeResult(nodeId, "isInPath", isInPath);
    this.addNodeResult(nodeId, "distance", distances.get(nodeId) ?? Infinity);
}
```

---

### 4. Potential NaN Division in Normalization

**Files**:
- `src/algorithms/DegreeAlgorithm.ts:54-56`
- `src/algorithms/DegreeAlgorithm.ts:65-67`

**Description**: When there are no edges, `Math.max(...inDegreeMap.values())` returns `-Infinity` because the iterator is empty. Then division by `-Infinity` produces `0`, but this is fragile. When there are nodes but no edges, `maxDegree` will be 0, causing division by zero (NaN).

**Example**: `src/algorithms/DegreeAlgorithm.ts:54-67`
```typescript
// Problem: maxDegree can be 0 if no edges, causing NaN
const maxDegree = Math.max(... degreeMap.values());
// ...
this.addNodeResult(n.id, "degreePct", degree / maxDegree);  // NaN if maxDegree is 0
```

**Fix**:
```typescript
const maxInDegree = Math.max(0, ... inDegreeMap.values());
const maxOutDegree = Math.max(0, ... outDegreeMap.values());
const maxDegree = Math.max(0, ... degreeMap.values());

// Use safe division
this.addNodeResult(n.id, "degreePct", maxDegree > 0 ? degree / maxDegree : 0);
```

---

## Medium Priority Issues (Technical Debt)

### 1. Duplicate Code: Louvain and Leiden Algorithms Share Identical Methods

**Files**:
- `src/algorithms/LouvainAlgorithm.ts`
- `src/algorithms/LeidenAlgorithm.ts`

**Description**: Both files contain identical implementations of:
- `calculateModularity()`
- `nodeModularityContribution()`
- `getNeighborCommunities()`
- `extractCommunities()`
- `getTotalEdgeWeight()`
- `getNodeDegree()`

**Impact**: ~200 lines of duplicated code. Changes need to be made in two places.

**Recommendation**: Extract a shared `CommunityDetectionBase` class or utility module with these common methods.

---

### 2. Repeated Adjacency List Building Pattern

**Files**: Multiple algorithm files

**Description**: At least 5 algorithms implement their own `buildAdjacencyList()` or `buildDirectedAdjacency()` methods with nearly identical code.

**Affected Files**:
- `DijkstraAlgorithm.ts:197-220`
- `DFSAlgorithm.ts:164-188`
- `ConnectedComponentsAlgorithm.ts:126-153`
- `StronglyConnectedComponentsAlgorithm.ts:151-172`

**Recommendation**: Create a shared utility function in `algorithms/utils/`:
```typescript
export function buildAdjacencyList(
    graph: Graph,
    options?: { directed?: boolean }
): Map<string | number, (string | number)[]>
```

---

### 3. Test Mock Pattern Has eslint-disable Comment

**Files**:
- `test/style-helpers/suggested-styles.test.ts:14`
- `test/algorithms/algorithm.test.ts:11`

**Description**: Tests use `// eslint-disable-next-line @typescript-eslint/no-explicit-any` for mock graph objects. While this is acceptable in test code per the project guidelines, the mocks could be typed better.

**Example**: `test/algorithms/algorithm.test.ts:11`
```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mockGraph(opts: MockGraphOpts = {}): Promise<any> {
```

**Recommendation**: Create a proper `MockGraph` type interface that satisfies the algorithm requirements. This would improve test maintainability.

---

### 4. Inconsistent Edge/Node Type Handling (string vs number)

**Files**: Multiple algorithm files

**Description**: Node IDs are typed as `number | string` throughout, but there's inconsistent handling with some places calling `String(nodeId)` for comparisons and others using direct equality. This can cause bugs when numeric IDs are compared with string keys.

**Example**: `src/algorithms/ConnectedComponentsAlgorithm.ts:105-109`
```typescript
// Uses String() for lookup but stores original type
const neighborNode = nodes.find((n) => String(n) === neighborStr);
if (neighborNode !== undefined) {
    queue.push(neighborNode);
}
```

**Recommendation**: Standardize on string keys internally for all Map operations, converting early and consistently.

---

### 5. Missing Graph-Level Results in Some Algorithms

**Files**:
- `src/algorithms/DegreeAlgorithm.ts`
- `src/algorithms/PageRankAlgorithm.ts`

**Description**: These algorithms don't store graph-level results (like `maxDegree`, `convergenceIterations`) which other algorithms do store. This inconsistency makes the API less predictable.

**Recommendation**: Add graph-level metadata to all algorithms consistently:
```typescript
// Add to DegreeAlgorithm.run()
this.addGraphResult("maxInDegree", maxInDegree);
this.addGraphResult("maxOutDegree", maxOutDegree);
this.addGraphResult("maxDegree", maxDegree);
```

---


## Low Priority Issues (Nice to Have)

### 1. Comments Say "Unweighted for now" in Multiple Files

Multiple algorithms have `const weight = 1; // Unweighted for now` comments. If weighted edges are planned, consider creating a utility function to extract edge weights.

**Files**: `LouvainAlgorithm.ts:194`, `LeidenAlgorithm.ts:313`, `DijkstraAlgorithm.ts:207`

---

### 2. Extra Semicolon in DegreeAlgorithm

**File**: `src/algorithms/DegreeAlgorithm.ts:40`
```typescript
let num = m.get(idx); ;  // Extra semicolon
```

---

### 3. Animation Helpers Could Use Performance.now() Example

**File**: `src/utils/styleHelpers/animation/index.ts`

The animation helpers are well-documented but don't show how to get the `progress` value in practice. Consider adding a usage note about `performance.now()` or a frame counter.

---

### 4. Missing Return Type on Some Private Methods

Some private methods in algorithm classes don't have explicit return type annotations, relying on inference.

---

### 5. Palette Files Lack Index Export

**Files**: `src/config/palettes/*.ts`

There's no `src/config/palettes/index.ts` to export all palettes together, making imports more verbose.

---

### 6. Style Expression Strings Are Not Validated

The `expr` field in `calculatedStyle` contains JavaScript code as a string. There's no validation that the referenced `StyleHelpers` methods actually exist, which could cause runtime errors.

---


### y. Test Data Files Imported at Runtime

**Files**: `test/algorithms/*.test.ts`

Test files use dynamic imports for test data (`await import(opts.dataPath)`). Consider using static imports for better type checking.

---

## Positive Findings

1. **Excellent Documentation**: The color-palettes-specification.md is comprehensive and research-backed with proper citations.

2. **Consistent Pattern for Algorithm Registration**: All algorithms properly auto-register at module load time, following the pattern documented in CLAUDE.md.

3. **Thorough JSDoc Comments**: Style helpers have extensive JSDoc with examples, making the API discoverable.

4. **Colorblind-Safe Defaults**: The default palettes (Viridis, Okabe-Ito) are all colorblind-safe as specified.

5. **Clean Separation of Concerns**: Palette definitions are separate from the helper functions that use them, making it easy to add new palettes.

6. **Proper Normalization**: Most algorithms correctly normalize values to [0,1] range for visualization, using min-max normalization for better visual differentiation.

7. **Defensive Input Handling**: Style helpers properly clamp input values to [0,1] range.

---

## Recommendations

1. **Highest Impact**: Replace all hardcoded colors in algorithm `suggestedStyles` with StyleHelpers or palette constants. This ensures colorblind safety and visual consistency.

2. **Second Priority**: Fix the DegreeAlgorithm in/out degree swap - this is an algorithmic correctness issue.

3. **Third Priority**: Fix the DijkstraAlgorithm O(n²) performance issue by reusing distances from a single run.

4. **Fourth Priority**: Extract common community detection code from Louvain/Leiden to reduce duplication.

5. **Future Enhancement**: Consider adding a validation step for `suggestedStyles` that warns when hardcoded colors are used instead of StyleHelpers.
