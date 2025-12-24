# Feature Design: Documentation System

## Overview
- **User Value**: Easy-to-navigate, comprehensive documentation for both Web Component users (HTML/declarative) and JavaScript API users (programmatic control), enabling faster adoption and reduced support burden
- **Technical Value**: Auto-generated API reference from source code ensures documentation stays in sync with implementation, enforced JSDoc standards improve code quality, and centralized documentation reduces maintenance overhead

## Requirements

### Documentation Goals
1. **Two documentation sets**: Lit Web Component API and JavaScript Graph API
2. **Auto-generated from JSDoc**: TypeDoc for TypeScript/JSDoc extraction
3. **User-friendly navigation**: Modern documentation framework with search
4. **GitHub Pages deployment**: Integrate with existing Storybook publishing
5. **ESLint JSDoc rules**: Enforce documentation quality
6. **Links to Storybook stories**: Connect API docs to interactive examples
7. **README.md updates**: Badges and links, remove duplicate content

### API Review Goals
1. **Feature-to-API mapping**: Ensure all features are accessible via APIs
2. **Lit/JS API parity**: Web component attributes match Graph class methods
3. **Consistent eventing**: Complete and uniform event coverage
4. **Extensibility APIs**: Clear patterns for custom layouts, algorithms, data sources
5. **App-building completeness**: All functionality needed for wrapping UI around graphty-element

---

## Current State Analysis

### Existing JSDoc Coverage

**Good Coverage:**
- `graphty-element.ts`: Properties have JSDoc with `@example` blocks
- `Graph.ts`: Many methods have JSDoc with examples
- Core classes (`Node`, `Edge`, `Styles`): Basic documentation

**Gaps:**
- Many Manager classes lack comprehensive JSDoc
- Event types documented in TypeScript but not JSDoc
- Configuration schemas documented in Zod but not JSDoc
- No `@since` tags for version tracking
- Inconsistent `@param` and `@returns` coverage

### API Parity Analysis

| Feature | Web Component (Graphty) | JS API (Graph) | Parity |
|---------|------------------------|----------------|--------|
| Set nodes | `nodeData` property | `addNodes()` | Partial - property replaces, method adds |
| Set edges | `edgeData` property | `addEdges()` | Partial - same as above |
| Set layout | `layout` attribute | `setLayout()` | ✅ |
| Layout config | `layoutConfig` property | `setLayout(type, opts)` | ✅ |
| View mode | `viewMode` attribute | `setViewMode()`, `getViewMode()` | ✅ |
| Style template | `styleTemplate` property | `setStyleTemplate()` | ✅ |
| XR config | `xr` property | `setXRConfig()`, `getXRConfig()` | ✅ |
| Camera state | N/A | `getCameraState()`, `setCameraState()` | ❌ Missing on element |
| Camera presets | N/A | `saveCameraPreset()`, `loadCameraPreset()` | ❌ Missing on element |
| Screenshot | `captureScreenshot()` | `captureScreenshot()` | ✅ |
| Video capture | `captureAnimation()` | `captureAnimation()` | ✅ |
| Selection | N/A | `selectNode()`, `deselectNode()`, `getSelectedNode()` | ❌ Missing on element |
| Data loading | `dataSource` + `dataSourceConfig` | `loadFromUrl()`, `loadFromFile()` | Partial |
| Algorithms | N/A | `runAlgorithm()`, `applySuggestedStyles()` | ❌ Missing on element |
| Zoom to fit | N/A | `zoomToFit()` | ❌ Missing on element |
| Wait for settled | N/A | `waitForSettled()` | ❌ Missing on element |
| Node/Edge counts | N/A | `getNodeCount()`, `getEdgeCount()` | ❌ Missing on element |
| Batch operations | N/A | `batchOperations()` | ❌ Missing on element |

### Event Coverage Analysis

**Events forwarded to DOM:**
- All graph events are forwarded via `asyncFirstUpdated()` using `eventManager.onGraphEvent`
- Users can use standard `addEventListener()` on the element

**Missing Direct Access:**
- No convenience event handler properties (e.g., `ongraphsettled`)
- No typed event map for TypeScript users

### Extensibility API Analysis

| Extension Type | Registration API | Documentation |
|---------------|------------------|---------------|
| Custom Layouts | `LayoutEngine.register()` | Basic example in README |
| Custom Data Sources | `DataSource.register()` | Basic example in README |
| Custom Algorithms | `Algorithm.register()` | Not documented |
| Style Layers | `StyleManager.addLayer()` | Not documented |

---

## Proposed Solution

### Documentation Framework Recommendation

**Recommended: TypeDoc + VitePress**

| Option | Pros | Cons |
|--------|------|------|
| TypeDoc + VitePress | Vue-based (Vite ecosystem match), fast HMR, modern aesthetic, TypeScript-first | Requires two tools |
| TypeDoc + Docusaurus | React-based, more features, versioning built-in, larger ecosystem | Heavier, React not Vue/Lit |
| TypeDoc standalone | Simple, one tool, direct HTML output | Less customizable, basic navigation |

**Rationale:**
1. **VitePress** aligns with the Vite-based build system already in use
2. **TypeDoc with `typedoc-plugin-markdown`** generates Markdown that VitePress consumes
3. **Unified documentation site** can host both API docs and hand-written guides
4. **Search built-in** via VitePress's local search or Algolia
5. **GitHub Pages compatible** with static output

### Documentation Architecture

```
docs/
├── .vitepress/
│   └── config.ts           # VitePress configuration
├── guide/
│   ├── getting-started.md  # Quick start guide
│   ├── installation.md     # Installation instructions
│   ├── web-component.md    # Lit Web Component usage
│   ├── javascript-api.md   # Graph class usage
│   ├── styling.md          # Styling system guide
│   ├── layouts.md          # Layout algorithms guide
│   ├── algorithms.md       # Graph algorithms guide
│   ├── data-sources.md     # Data loading guide
│   ├── events.md           # Event system guide
│   ├── vr-ar.md           # VR/AR mode guide
│   └── extending/
│       ├── custom-layouts.md
│       ├── custom-algorithms.md
│       └── custom-data-sources.md
├── api/                    # Auto-generated by TypeDoc
│   ├── classes/
│   ├── interfaces/
│   ├── types/
│   └── modules/
├── storybook/              # Link or embed Storybook
└── index.md                # Landing page
```

### User Interface/API

**Documentation Site Navigation:**
```
Graphty Documentation
├── Guide
│   ├── Getting Started
│   ├── Installation
│   ├── Web Component API
│   ├── JavaScript API
│   ├── Styling
│   ├── Layouts
│   ├── Algorithms
│   ├── Data Sources
│   ├── Events
│   └── VR/AR
├── Extending
│   ├── Custom Layouts
│   ├── Custom Algorithms
│   └── Custom Data Sources
├── API Reference
│   ├── Graphty (Web Component)
│   ├── Graph (Core Class)
│   ├── Node
│   ├── Edge
│   ├── Styles
│   ├── Managers
│   └── Types
├── Examples
│   └── [Link to Storybook]
└── Changelog
```

### Technical Architecture

**Components:**

1. **TypeDoc Configuration** (`typedoc.json`)
   - Entry point: `index.ts`
   - Plugin: `typedoc-plugin-markdown`
   - Output: `docs/api/`
   - Custom theme for VitePress compatibility

2. **VitePress Configuration** (`.vitepress/config.ts`)
   - Sidebar navigation
   - Search configuration
   - Theme customization
   - GitHub edit links

3. **ESLint JSDoc Plugin** (updates to `eslint.config.js`)
   - `eslint-plugin-jsdoc` with TypeScript preset
   - Rules for `@param`, `@returns`, `@example`, `@since`

4. **GitHub Actions Workflow** (`.github/workflows/docs.yml`)
   - Build TypeDoc → VitePress
   - Deploy to GitHub Pages
   - Coordinate with Storybook deployment

**Data Model:**

No new data structures required. Documentation is generated from:
- JSDoc comments in source files
- Markdown files in `docs/` directory
- VitePress configuration

**Integration Points:**

1. **Storybook**: Link from API docs to relevant stories
2. **GitHub Pages**: Deploy alongside Storybook (subdirectory or subdomain)
3. **ESLint**: Enforce JSDoc quality in CI
4. **package.json**: Add doc generation scripts

### Implementation Approach

#### Phase 1: ESLint JSDoc Rules (1-2 days)
1. Install `eslint-plugin-jsdoc`
2. Configure TypeScript-aware JSDoc rules:
   ```javascript
   import jsdoc from "eslint-plugin-jsdoc";

   // In eslint.config.js
   jsdoc.configs['flat/recommended-typescript'],
   {
       rules: {
           "jsdoc/require-description": "warn",
           "jsdoc/require-param-description": "warn",
           "jsdoc/require-returns-description": "warn",
           "jsdoc/require-example": "off", // Enable later
           "jsdoc/no-types": "error", // TypeScript handles types
       }
   }
   ```
3. Fix existing JSDoc issues (iteratively)

#### Phase 2: JSDoc Enhancement (3-5 days)
1. Add JSDoc to all public API methods in `Graph.ts`
2. Add JSDoc to all properties in `graphty-element.ts`
3. Add JSDoc to Manager classes with public methods
4. Add `@since` tags for version tracking
5. Add `@example` blocks for common use cases
6. Add `@link` references to related methods

#### Phase 3: TypeDoc Setup (1 day)
1. Install dependencies:
   ```bash
   npm install -D typedoc typedoc-plugin-markdown
   ```
2. Create `typedoc.json`:
   ```json
   {
       "entryPoints": ["./index.ts"],
       "entryPointStrategy": "expand",
       "out": "./docs/api",
       "plugin": ["typedoc-plugin-markdown"],
       "readme": "none",
       "excludePrivate": true,
       "excludeProtected": true,
       "excludeInternal": true
   }
   ```
3. Add npm scripts:
   ```json
   "docs:api": "typedoc",
   "docs:dev": "vitepress dev docs",
   "docs:build": "npm run docs:api && vitepress build docs"
   ```

#### Phase 4: VitePress Setup (1-2 days)
1. Install VitePress:
   ```bash
   npm install -D vitepress
   ```
2. Create `.vitepress/config.ts` with navigation
3. Create initial guide pages (migrate from README.md)
4. Configure theme and search

#### Phase 5: GitHub Pages Deployment (1 day)
1. Create `.github/workflows/docs.yml`:
   ```yaml
   name: Deploy Documentation

   on:
     push:
       branches: [master]
     workflow_dispatch:

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci
         - run: npm run docs:build
         - uses: actions/upload-pages-artifact@v3
           with:
             path: docs/.vitepress/dist

     deploy:
       needs: build
       permissions:
         pages: write
         id-token: write
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - uses: actions/deploy-pages@v4
           id: deployment
   ```
2. Configure GitHub Pages to use Actions
3. Coordinate with existing Storybook deployment (use subdirectory: `/storybook/`)

#### Phase 6: README.md Updates (0.5 days)
1. Add badges:
   - Documentation link
   - API reference link
   - TypeDoc version
2. Remove duplicate content (move to docs site)
3. Keep README focused on quick start and links

#### Phase 7: API Parity Improvements (2-3 days)
1. Add missing methods to `Graphty` class:
   - `selectNode()`, `deselectNode()`, `getSelectedNode()`, `isNodeSelected()`
   - `zoomToFit()`
   - `waitForSettled()`
   - `getNodeCount()`, `getEdgeCount()`
   - `runAlgorithm()`, `applySuggestedStyles()`
2. Consider adding convenience event properties:
   - `ongraphsettled`, `onerror`, `onselectionchanged`

---

## Acceptance Criteria

### Documentation
- [ ] ESLint JSDoc plugin configured and passing
- [ ] All public methods in `Graph.ts` have JSDoc with `@param`, `@returns`, `@example`
- [ ] All properties in `graphty-element.ts` have JSDoc with `@example`
- [ ] TypeDoc generates API reference successfully
- [ ] VitePress documentation site builds without errors
- [ ] Documentation deploys to GitHub Pages on push to master
- [ ] Search functionality works in documentation site
- [ ] All guide pages complete (getting started, installation, web component, js api, styling, layouts, algorithms, data sources, events, vr/ar)
- [ ] Extending guides complete (custom layouts, algorithms, data sources)
- [ ] Links from API docs to Storybook stories work

### README.md
- [ ] Documentation badge links to docs site
- [ ] API reference badge links to API docs
- [ ] Storybook badge links to Storybook
- [ ] CI/CD badge present
- [ ] Coverage badge present
- [ ] Quick start section remains
- [ ] Detailed documentation moved to docs site

### API Parity
- [ ] `selectNode()` available on Graphty element
- [ ] `deselectNode()` available on Graphty element
- [ ] `getSelectedNode()` available on Graphty element
- [ ] `zoomToFit()` available on Graphty element
- [ ] `waitForSettled()` available on Graphty element
- [ ] `getNodeCount()` available on Graphty element
- [ ] `getEdgeCount()` available on Graphty element
- [ ] `runAlgorithm()` available on Graphty element

---

## Technical Considerations

### Performance
- **Impact**: Documentation generation adds ~30s to CI build
- **Mitigation**: Only rebuild docs on source changes, cache node_modules

### Security
- **Considerations**: No sensitive data in documentation
- **Measures**: Standard GitHub Pages security, no dynamic content

### Compatibility
- **Backward compatibility**: No breaking changes to existing APIs
- **Browser support**: VitePress requires ES2015+ browsers (already required by Graphty)

### Testing
- **Strategy**:
  - TypeDoc build in CI ensures JSDoc is valid
  - VitePress build ensures documentation compiles
  - Manual review for content accuracy
  - Link checker for broken links

---

## Risks and Mitigation

### Risk: JSDoc enforcement breaks existing CI
**Mitigation**:
- Start with `warn` level, not `error`
- Exclude test files from JSDoc requirements
- Incrementally fix issues over multiple PRs

### Risk: TypeDoc fails on complex types
**Mitigation**:
- Use `@internal` tag for complex internal types
- Test TypeDoc output early in implementation
- Have fallback to simpler type documentation

### Risk: VitePress/Storybook deployment conflict
**Mitigation**:
- Use separate deploy jobs
- Documentation at root, Storybook at `/storybook/` path
- Test deployment in staging environment first

### Risk: Documentation becomes stale
**Mitigation**:
- Auto-generation from source ensures API docs stay current
- CI failure on JSDoc issues prevents undocumented code
- Regular content reviews in release process

---

## Future Enhancements

1. **Versioned documentation**: Multiple versions for different releases
2. **Interactive playground**: Embed live code examples
3. **API changelog**: Auto-generate from git history
4. **Internationalization**: Multi-language documentation
5. **Video tutorials**: Embedded walkthrough videos
6. **Discord/community integration**: Chat widget for support
7. **TypeScript playground integration**: Try API in browser
8. **Custom Elements Manifest**: Generate CEM for IDE integration
9. **Visual API explorer**: Interactive graph of API relationships

---

## Implementation Estimate

| Phase | Description | Effort |
|-------|-------------|--------|
| 1 | ESLint JSDoc Rules | 1-2 days |
| 2 | JSDoc Enhancement | 3-5 days |
| 3 | TypeDoc Setup | 1 day |
| 4 | VitePress Setup | 1-2 days |
| 5 | GitHub Pages Deployment | 1 day |
| 6 | README.md Updates | 0.5 days |
| 7 | API Parity Improvements | 2-3 days |
| **Total** | | **10-15 days** |

---

## Appendix: API Gap Details

### Missing Web Component Methods

The following methods should be added to `Graphty` class for full parity:

```typescript
// Selection
selectNode(nodeId: string | number): boolean
deselectNode(): void
getSelectedNode(): Node | null
isNodeSelected(nodeId: string | number): boolean

// Utilities
zoomToFit(): void
waitForSettled(): Promise<void>
getNodeCount(): number
getEdgeCount(): number

// Algorithms
runAlgorithm(namespace: string, type: string, options?: RunAlgorithmOptions): Promise<void>
applySuggestedStyles(algorithmKey: string | string[], options?: ApplySuggestedStylesOptions): boolean
getSuggestedStyles(algorithmKey: string): SuggestedStylesConfig | null

// Batch operations
batchOperations(fn: () => Promise<void> | void): Promise<void>
```

### Event Handler Properties (Optional Enhancement)

```typescript
// Optional convenience properties
ongraphsettled?: (event: CustomEvent<GraphSettledEvent>) => void
onerror?: (event: CustomEvent<GraphErrorEvent>) => void
onselectionchanged?: (event: CustomEvent<SelectionChangedEvent>) => void
ondataloaded?: (event: CustomEvent<GraphDataLoadedEvent>) => void
ondataadded?: (event: CustomEvent<GraphDataAddedEvent>) => void
```

### Custom Elements Manifest

The project already uses `vite-plugin-cem` for Custom Elements Manifest generation. This should be:
1. Documented in the docs site
2. Referenced from package.json with `"customElements"` field
3. Published to npm alongside the package
