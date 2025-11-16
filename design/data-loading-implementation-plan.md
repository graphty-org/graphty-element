# Data Loading Implementation Plan - SIMPLIFIED

## Status Overview

### ✅ COMPLETED (Phases 1-5)

**Phase 1-4: Core Infrastructure & Essential Formats** ✅ **DONE**
- Format detection (`format-detection.ts`)
- `loadFromFile()` method
- DataSource architecture
- GraphML, CSV, GML, GEXF, DOT parsers
- Basic JSON support
- Event system
- Storybook stories for core formats

**Phase 5: CSV Variants** ✅ **DONE**
- CSV variant detection (`csv-variant-detection.ts`)
- Neo4j, Gephi, Cytoscape, adjacency-list support
- Storybook stories: CsvNeo4j, CsvGephi, CsvCytoscape, CsvAdjacencyList

**Total Completed**: ~8-10 days of work ✅

---

## 🔲 REMAINING WORK (Phases 6-10)

### **Phase 6: Complete Storybook Story Coverage**
**Duration**: 1-2 days
**Priority**: HIGH
**Status**: 🔲 Partially complete

**What's Missing:**

#### 6.1: JSON Variant Stories (1 day)
Create Storybook stories demonstrating different JSON formats using existing JsonDataSource with JMESPath:

1. **JsonD3** - D3.js format (nodes + links)
   ```typescript
   {
     "nodes": [{"id": "n1"}],
     "links": [{"source": "n1", "target": "n2"}]
   }
   ```

2. **JsonCytoscapeJs** - Cytoscape.js format
   ```typescript
   {
     "elements": {
       "nodes": [{"data": {"id": "a"}}],
       "edges": [{"data": {"source": "a", "target": "b"}}]
     }
   }
   ```

3. **JsonSigma** - Sigma.js/Graphology format (uses "key" not "id")
   ```typescript
   {
     "nodes": [{"key": "n1", "attributes": {...}}],
     "edges": [{"source": "n1", "target": "n2"}]
   }
   ```

4. **JsonVisJs** - Vis.js format (uses "from"/"to")
   ```typescript
   {
     "nodes": [{"id": 1}],
     "edges": [{"from": 1, "to": 2}]
   }
   ```

5. **JsonNetworkX** - NetworkX node-link
   ```typescript
   {
     "nodes": [{"id": "A"}],
     "links": [{"source": "A", "target": "B"}]
   }
   ```

#### 6.2: CSV Paired Files Story (0.5 day)
Story demonstrating separate nodes.csv + edges.csv files (Gephi-style).

Code for this already exists in CSVDataSource (nodeFile/edgeFile params), just need the story.

**Deliverables**:
- 5 JSON variant stories in `stories/Data.stories.ts`
- 1 CSV paired files story
- All stories verified working in Storybook

---

### **Phase 7: Pajek NET Parser**
**Duration**: 1.5-2 days
**Priority**: MEDIUM
**Status**: 🔲 Not started

**Implementation**:
- Create `src/data/PajekDataSource.ts`
- Parse *Vertices, *Arcs, *Edges sections
- Handle 1-indexed node IDs
- Extract coordinates (x, y, z)
- Support mixed graphs (directed arcs + undirected edges)
- Tests
- Storybook story

**Deliverables**:
- PajekDataSource class
- Unit tests
- Integration test with real Pajek file
- Storybook story (Pajek)

---

### **Phase 8: yFiles GraphML Support**
**Duration**: 1.5-2 days
**Priority**: MEDIUM
**Status**: 🔲 Not started

**Enhancement to GraphMLDataSource**:
- Parse yFiles namespace (`xmlns:y="http://www.yworks.com/xml/graphml"`)
- Extract visual properties:
  - `y:ShapeNode` → geometry, fill color, border, shape, label
  - `y:PolyLineEdge` → line style, color, width, arrows
- Map yFiles shapes to Graphty shapes
- Color normalization

**Deliverables**:
- Enhanced GraphMLDataSource with yFiles support
- Tests for yFiles parsing
- Storybook story (GraphMLYFiles)

---

### **Phase 9: User-Friendly Error Handling**
**Duration**: 1.5-2 days
**Priority**: HIGH
**Status**: 🔲 Not started

**Implementation**:
- Create `src/data/ErrorAggregator.ts`:
  - Error grouping/deduplication
  - User-friendly summary messages
  - Detailed error reports
  - Actionable suggestions
- Integrate into all DataSource classes
- Add `data-loading-error-summary` event
- Documentation with UI examples

**Example Error Messages**:
```
Before: "Error parsing line 42: undefined"
After:  "Found 23 errors in CSV file (mostly missing 'source' column)
         Suggestion: Check that your CSV has a 'source' or 'src' column"
```

**Deliverables**:
- ErrorAggregator utility class
- Integration into all DataSources
- Enhanced error events
- Documentation: `docs/error-handling.md`
- Tests for error scenarios

---

### **Phase 10: Optional Advanced Formats**
**Duration**: Variable (1-2 days each)
**Priority**: LOW
**Status**: 🔲 Not started

**Only implement if requested:**

#### Tier 3 Formats (Medium Priority):
- GraphSON (TinkerPop graph databases)
- XGMML (Cytoscape XML)
- UCINET DL (social network analysis)
- SIF (Simple Interaction Format)
- Excel/XLSX (spreadsheet import)

#### Tier 4 Formats (Specialized):
- RDF/Turtle (semantic web)
- BioPAX (biological pathways)
- SBML (systems biology)

**Note**: Only implement these if there's a specific user request or use case.

---

## Recommended Execution Order

### **Start with Phase 9** (Error Handling)
**Why first**: All subsequent work will benefit from improved error handling

### **Then Phase 6** (Storybook Stories)
**Why second**: Complete testing/documentation infrastructure before adding new formats

### **Then Phase 7** (Pajek)
**Why third**: Most requested new format, academic use case

### **Then Phase 8** (yFiles)
**Why fourth**: Enhancement to existing format, professional use case

### **Finally Phase 10** (if needed)
**Why last**: Optional, only if specific request

---

## Clean Timeline

| Phase | Duration | Status | Priority |
|-------|----------|--------|----------|
| 1-5: Core + CSV Variants | 8-10 days | ✅ **COMPLETE** | - |
| **6: Storybook Coverage** | **1-2 days** | 🔲 **50% done** | **HIGH** |
| **7: Pajek NET** | **1.5-2 days** | 🔲 **Not started** | **MEDIUM** |
| **8: yFiles GraphML** | **1.5-2 days** | 🔲 **Not started** | **MEDIUM** |
| **9: Error Handling** | **1.5-2 days** | 🔲 **Not started** | **HIGH** |
| **10: Advanced Formats** | **Variable** | 🔲 **Optional** | **LOW** |

**Remaining Core Work**: 6-8 days (Phases 6-9)
**Optional Work**: Variable (Phase 10)

---

## Quick Start Guide

### **You can safely start with Phase 9** (Error Handling)

This is the recommended starting point because:
1. ✅ No dependencies on other phases
2. ✅ Benefits all existing and future DataSources
3. ✅ High priority for production use
4. ✅ Clear, self-contained work

### **Then proceed in order: 9 → 6 → 7 → 8 → (10 if needed)**

---

## What's Already Done - Don't Duplicate

### ✅ Already Implemented:
- ✅ Format detection
- ✅ JSON, GraphML, CSV, GML, GEXF, DOT parsers
- ✅ CSV variant detection (Neo4j, Gephi, Cytoscape, adjacency-list)
- ✅ 12 Storybook stories (all core formats + CSV variants)
- ✅ Basic error collection (errorLimit in DataSources)
- ✅ Progress events
- ✅ Chunked loading

### ❌ NOT Implemented (Don't Duplicate):
- ❌ JSON variant auto-detection
- ❌ Pajek NET parser
- ❌ yFiles GraphML parsing
- ❌ ErrorAggregator utility
- ❌ User-friendly error messages
- ❌ Error summary events
- ❌ JSON variant stories
- ❌ CSV paired files story

---

## Success Criteria (Phases 6-9)

When all remaining phases are complete:

**Functional**:
- [ ] All major format variants have Storybook stories
- [ ] Pajek NET files can be loaded
- [ ] yFiles-styled GraphML preserves visual properties
- [ ] Error messages are user-friendly and actionable
- [ ] Error summaries don't overwhelm the UI

**Technical**:
- [ ] All new code has tests
- [ ] No ESLint/TypeScript errors
- [ ] Documentation updated
- [ ] All Storybook stories pass

**User Experience**:
- [ ] Clear error messages with suggestions
- [ ] No format selection needed for common variants
- [ ] Visual properties preserved from yFiles
- [ ] Comprehensive examples in Storybook

---

## Phase Details for Immediate Work

### Phase 9: Error Handling (Start Here)

**Step 1**: Create ErrorAggregator (0.5 day)
```typescript
// src/data/ErrorAggregator.ts
export class ErrorAggregator {
  addError(error: DataLoadingError): boolean
  getSummary(): ErrorSummary
  getUserFriendlyMessage(): string
  getDetailedReport(): string
}
```

**Step 2**: Integrate into DataSources (0.5 day)
- Add to CSVDataSource, GraphMLDataSource, etc.
- Replace manual error tracking
- Add helpful suggestions

**Step 3**: Add Events (0.5 day)
- New event: `data-loading-error-summary`
- Emit at end of loading with summary

**Step 4**: Documentation (0.5 day)
- `docs/error-handling.md`
- UI examples
- Best practices

**Tests**: Error scenarios, grouping, suggestions

---

## Notes

- This plan consolidates the original messy plan into clear, non-overlapping phases
- Phases 1-5 are DONE (even though original plan said only 1-4)
- CSV variants were implemented but not marked complete - now corrected
- Removed all duplicates (old Phase 11 was duplicate of Phase 7)
- Simplified Phase 10 JSON variants to just stories (no auto-detection needed yet)
- Clear priority and execution order
- You can start immediately with Phase 9

**Total remaining work**: 6-8 days core + optional advanced formats
