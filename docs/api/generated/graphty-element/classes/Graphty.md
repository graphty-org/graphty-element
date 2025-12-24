[@graphty/graphty-element](../../index.md) / [graphty-element](../index.md) / Graphty

# Class: Graphty

Defined in: [src/graphty-element.ts:19](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L19)

Graphty creates a graph

## Extends

- `LitElement`

## Constructors

### Constructor

> **new Graphty**(): `Graphty`

Defined in: [src/graphty-element.ts:24](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L24)

#### Returns

`Graphty`

#### Overrides

`LitElement.constructor`

## Accessors

### dataSource

#### Get Signature

> **get** **dataSource**(): `string` \| `undefined`

Defined in: [src/graphty-element.ts:244](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L244)

The type of data source (e.g. "json"). See documentation for
data sources for more information.

##### Returns

`string` \| `undefined`

#### Set Signature

> **set** **dataSource**(`value`): `void`

Defined in: [src/graphty-element.ts:247](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L247)

##### Parameters

###### value

`string` | `undefined`

##### Returns

`void`

***

### dataSourceConfig

#### Get Signature

> **get** **dataSourceConfig**(): `Record`\<`string`, `unknown`\> \| `undefined`

Defined in: [src/graphty-element.ts:262](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L262)

The configuration for the data source. See documentation for
data sources for more information.

##### Returns

`Record`\<`string`, `unknown`\> \| `undefined`

#### Set Signature

> **set** **dataSourceConfig**(`value`): `void`

Defined in: [src/graphty-element.ts:265](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L265)

##### Parameters

###### value

`Record`\<`string`, `unknown`\> | `undefined`

##### Returns

`void`

***

### edgeData

#### Get Signature

> **get** **edgeData**(): `Record`\<`string`, `unknown`\>[] \| `undefined`

Defined in: [src/graphty-element.ts:224](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L224)

Array of edge data objects defining connections between nodes.

##### Remarks

Setting this property replaces all existing edges. For incremental
updates, use the `graph.addEdges()` method instead.

Each edge object should have source and target fields (default: "source", "target").
Additional properties can be used for styling (e.g., weight, label).

##### Default Value

`[]`

##### Since

1.0.0

##### See

 - [nodeData](#nodedata) for node data
 - [edgeSrcIdPath](#edgesrcidpath) to customize source field
 - [edgeDstIdPath](#edgedstidpath) to customize target field

##### Examples

```html
<graphty-element
  edge-data='[{"source": "1", "target": "2"}, {"source": "2", "target": "3"}]'>
</graphty-element>
```

```typescript
element.edgeData = [
  { source: 'a', target: 'b', weight: 1.5 },
  { source: 'b', target: 'c', weight: 2.0 }
];
```

##### Returns

`Record`\<`string`, `unknown`\>[] \| `undefined`

#### Set Signature

> **set** **edgeData**(`value`): `void`

Defined in: [src/graphty-element.ts:227](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L227)

##### Parameters

###### value

`Record`\<`string`, `unknown`\>[] | `undefined`

##### Returns

`void`

***

### edgeDstIdPath

#### Get Signature

> **get** **edgeDstIdPath**(): `string` \| `undefined`

Defined in: [src/graphty-element.ts:333](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L333)

Similar to the nodeIdPath property / node-id-path attribute, this is a
jmespath that describes where to find the desination node identifier for this edge.
Defaults to "dst", as in `{src: 42, dst: 31337}`

##### Returns

`string` \| `undefined`

#### Set Signature

> **set** **edgeDstIdPath**(`value`): `void`

Defined in: [src/graphty-element.ts:336](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L336)

##### Parameters

###### value

`string` | `undefined`

##### Returns

`void`

***

### edgeSrcIdPath

#### Get Signature

> **get** **edgeSrcIdPath**(): `string` \| `undefined`

Defined in: [src/graphty-element.ts:313](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L313)

Similar to the nodeIdPath property / node-id-path attribute, this is a
jmespath that describes where to find the source node identifier for this edge.
Defaults to "src", as in `{src: 42, dst: 31337}`

##### Returns

`string` \| `undefined`

#### Set Signature

> **set** **edgeSrcIdPath**(`value`): `void`

Defined in: [src/graphty-element.ts:316](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L316)

##### Parameters

###### value

`string` | `undefined`

##### Returns

`void`

***

### enableDetailedProfiling

#### Get Signature

> **get** **enableDetailedProfiling**(): `boolean` \| `undefined`

Defined in: [src/graphty-element.ts:558](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L558)

Enable detailed performance profiling.
When enabled, hierarchical timing and advanced statistics will be collected.
Access profiling data via graph.getStatsManager().getSnapshot() or
graph.getStatsManager().reportDetailed().

##### Returns

`boolean` \| `undefined`

#### Set Signature

> **set** **enableDetailedProfiling**(`value`): `void`

Defined in: [src/graphty-element.ts:561](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L561)

##### Parameters

###### value

`boolean` | `undefined`

##### Returns

`void`

***

### graph

#### Get Signature

> **get** **graph**(): [`Graph`](../../Graph/classes/Graph.md)

Defined in: [src/graphty-element.ts:991](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L991)

Get the underlying Graph instance for debugging purposes

##### Returns

[`Graph`](../../Graph/classes/Graph.md)

***

### layout

#### Get Signature

> **get** **layout**(): `string` \| `undefined`

Defined in: [src/graphty-element.ts:377](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L377)

Layout algorithm to use for positioning nodes.

##### Remarks

Available layouts:
- `ngraph`: Force-directed (3D optimized, recommended)
- `d3-force`: Force-directed (2D)
- `circular`: Nodes arranged in a circle
- `grid`: Nodes arranged in a grid
- `hierarchical`: Tree/DAG layout
- `random`: Random positions
- `fixed`: Pre-defined positions from node data

##### Default Value

`'ngraph'`

##### Since

1.0.0

##### See

 - [layoutConfig](#layoutconfig) for layout-specific options
 - [Layout Examples](https://graphty-org.github.io/graphty-element/storybook/?path=/story/layout--default)

##### Example

```typescript
// Set force-directed layout
element.layout = 'ngraph';

// Set circular layout with config
element.layout = 'circular';
element.layoutConfig = { radius: 5 };
```

##### Returns

`string` \| `undefined`

#### Set Signature

> **set** **layout**(`value`): `void`

Defined in: [src/graphty-element.ts:380](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L380)

##### Parameters

###### value

`string` | `undefined`

##### Returns

`void`

***

### layout2d

#### Get Signature

> **get** **layout2d**(): `boolean` \| `undefined`

Defined in: [src/graphty-element.ts:461](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L461)

##### Deprecated

Use viewMode instead. layout2d: true is equivalent to viewMode: "2d"
Specifies that the layout should be rendered in two dimensions (as
opposed to 3D)

##### Returns

`boolean` \| `undefined`

#### Set Signature

> **set** **layout2d**(`value`): `void`

Defined in: [src/graphty-element.ts:473](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L473)

##### Parameters

###### value

`boolean` | `undefined`

##### Returns

`void`

***

### layoutConfig

#### Get Signature

> **get** **layoutConfig**(): `Record`\<`string`, `unknown`\> \| `undefined`

Defined in: [src/graphty-element.ts:399](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L399)

Specifies which type of layout to use. See the layout documentation for
more information.

##### Returns

`Record`\<`string`, `unknown`\> \| `undefined`

#### Set Signature

> **set** **layoutConfig**(`value`): `void`

Defined in: [src/graphty-element.ts:402](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L402)

##### Parameters

###### value

`Record`\<`string`, `unknown`\> | `undefined`

##### Returns

`void`

***

### nodeData

#### Get Signature

> **get** **nodeData**(): `Record`\<`string`, `unknown`\>[] \| `undefined`

Defined in: [src/graphty-element.ts:176](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L176)

Array of node data objects to visualize.

##### Remarks

Setting this property replaces all existing nodes. For incremental
updates, use the `graph.addNodes()` method instead.

Each node object should have an ID field (default: "id"). Additional
properties can be used in style selectors and accessed via `node.data`.

##### Default Value

`[]`

##### Since

1.0.0

##### See

 - [edgeData](#edgedata) for edge data
 - [Basic Examples](https://graphty-org.github.io/graphty-element/storybook/?path=/story/graphty--default)

##### Examples

```html
<graphty-element
  node-data='[{"id": "1", "label": "Node 1"}, {"id": "2", "label": "Node 2"}]'>
</graphty-element>
```

```typescript
const element = document.querySelector('graphty-element');
element.nodeData = [
  { id: 'a', label: 'Node A', category: 'primary' },
  { id: 'b', label: 'Node B', category: 'secondary' }
];
```

##### Returns

`Record`\<`string`, `unknown`\>[] \| `undefined`

#### Set Signature

> **set** **nodeData**(`value`): `void`

Defined in: [src/graphty-element.ts:179](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L179)

##### Parameters

###### value

`Record`\<`string`, `unknown`\>[] | `undefined`

##### Returns

`void`

***

### nodeIdPath

#### Get Signature

> **get** **nodeIdPath**(): `string` \| `undefined`

Defined in: [src/graphty-element.ts:293](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L293)

A jmespath string that can be used to select the unique node identifier
for each node. Defaults to "id", as in `{id: 42}` is the identifier of
the node.

##### Returns

`string` \| `undefined`

#### Set Signature

> **set** **nodeIdPath**(`value`): `void`

Defined in: [src/graphty-element.ts:296](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L296)

##### Parameters

###### value

`string` | `undefined`

##### Returns

`void`

***

### runAlgorithmsOnLoad

#### Get Signature

> **get** **runAlgorithmsOnLoad**(): `boolean` \| `undefined`

Defined in: [src/graphty-element.ts:535](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L535)

Whether or not to run all algorithims in a style template when the
template is loaded

##### Returns

`boolean` \| `undefined`

#### Set Signature

> **set** **runAlgorithmsOnLoad**(`value`): `void`

Defined in: [src/graphty-element.ts:538](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L538)

##### Parameters

###### value

`boolean` | `undefined`

##### Returns

`void`

***

### styleTemplate

#### Get Signature

> **get** **styleTemplate**(): \{ `behavior`: \{ `fetchEdges?`: `Function`; `fetchNodes?`: `Function`; `layout`: \{ `minDelta`: `number`; `preSteps`: `number`; `stepMultiplier`: `number`; `type`: `string`; `zoomStepInterval`: `number`; \}; `node`: \{ `pinOnDrag`: `boolean`; \}; \}; `data`: \{ `algorithms?`: `string`[]; `knownFields`: \{ `edgeDstIdPath`: `string`; `edgeSrcIdPath`: `string`; `edgeTimePath`: `string` \| `null`; `edgeWeightPath`: `string` \| `null`; `nodeIdPath`: `string`; `nodeTimePath`: `string` \| `null`; `nodeWeightPath`: `string` \| `null`; \}; \}; `graph`: \{ `addDefaultStyle`: `boolean`; `background`: \{ `backgroundType`: `"color"`; `color`: `string` \| `undefined`; \} \| \{ `backgroundType`: `"skybox"`; `data`: `string`; \}; `effects?`: \{ `depthOfField?`: `number`; `motionBlur?`: `number`; `screenSpaceReflections?`: `boolean`; \}; `layout?`: `string`; `layoutOptions?`: \{\[`key`: `string`\]: `unknown`; \}; `startingCameraDistance`: `number`; `twoD`: `boolean`; `viewMode`: `"2d"` \| `"3d"` \| `"ar"` \| `"vr"`; \}; `graphtyTemplate`: `true`; `layers`: `object`[]; `majorVersion`: `"1"`; `metadata?`: \{ `templateCreationTimestamp?`: `string`; `templateCreator?`: `string`; `templateModificationTimestamp?`: `string`; `templateName?`: `string`; \}; \} \| `undefined`

Defined in: [src/graphty-element.ts:515](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L515)

Style template configuration for the graph visualization.

##### Remarks

Style templates define the visual appearance of nodes, edges, and the graph
background. They can include colors, sizes, shapes, labels, and selection styles.

Templates can be:
- A string name (e.g., "default", "dark")
- A partial configuration object to override defaults
- A complete StyleSchema configuration

##### Default Value

`'default'`

##### Since

1.0.0

##### See

[Style Examples](https://graphty-org.github.io/graphty-element/storybook/?path=/story/graphstyles--default)

##### Example

```typescript
// Apply dark theme
element.styleTemplate = 'dark';

// Custom node colors
element.styleTemplate = {
  node: { color: '#ff6600', size: 1.5 },
  edge: { color: '#cccccc' }
};
```

##### Returns

\{ `behavior`: \{ `fetchEdges?`: `Function`; `fetchNodes?`: `Function`; `layout`: \{ `minDelta`: `number`; `preSteps`: `number`; `stepMultiplier`: `number`; `type`: `string`; `zoomStepInterval`: `number`; \}; `node`: \{ `pinOnDrag`: `boolean`; \}; \}; `data`: \{ `algorithms?`: `string`[]; `knownFields`: \{ `edgeDstIdPath`: `string`; `edgeSrcIdPath`: `string`; `edgeTimePath`: `string` \| `null`; `edgeWeightPath`: `string` \| `null`; `nodeIdPath`: `string`; `nodeTimePath`: `string` \| `null`; `nodeWeightPath`: `string` \| `null`; \}; \}; `graph`: \{ `addDefaultStyle`: `boolean`; `background`: \{ `backgroundType`: `"color"`; `color`: `string` \| `undefined`; \} \| \{ `backgroundType`: `"skybox"`; `data`: `string`; \}; `effects?`: \{ `depthOfField?`: `number`; `motionBlur?`: `number`; `screenSpaceReflections?`: `boolean`; \}; `layout?`: `string`; `layoutOptions?`: \{\[`key`: `string`\]: `unknown`; \}; `startingCameraDistance`: `number`; `twoD`: `boolean`; `viewMode`: `"2d"` \| `"3d"` \| `"ar"` \| `"vr"`; \}; `graphtyTemplate`: `true`; `layers`: `object`[]; `majorVersion`: `"1"`; `metadata?`: \{ `templateCreationTimestamp?`: `string`; `templateCreator?`: `string`; `templateModificationTimestamp?`: `string`; `templateName?`: `string`; \}; \} \| `undefined`

#### Set Signature

> **set** **styleTemplate**(`value`): `void`

Defined in: [src/graphty-element.ts:518](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L518)

##### Parameters

###### value

\{ `behavior`: \{ `fetchEdges?`: `Function`; `fetchNodes?`: `Function`; `layout`: \{ `minDelta`: `number`; `preSteps`: `number`; `stepMultiplier`: `number`; `type`: `string`; `zoomStepInterval`: `number`; \}; `node`: \{ `pinOnDrag`: `boolean`; \}; \}; `data`: \{ `algorithms?`: `string`[]; `knownFields`: \{ `edgeDstIdPath`: `string`; `edgeSrcIdPath`: `string`; `edgeTimePath`: `string` \| `null`; `edgeWeightPath`: `string` \| `null`; `nodeIdPath`: `string`; `nodeTimePath`: `string` \| `null`; `nodeWeightPath`: `string` \| `null`; \}; \}; `graph`: \{ `addDefaultStyle`: `boolean`; `background`: \{ `backgroundType`: `"color"`; `color`: `string` \| `undefined`; \} \| \{ `backgroundType`: `"skybox"`; `data`: `string`; \}; `effects?`: \{ `depthOfField?`: `number`; `motionBlur?`: `number`; `screenSpaceReflections?`: `boolean`; \}; `layout?`: `string`; `layoutOptions?`: \{\[`key`: `string`\]: `unknown`; \}; `startingCameraDistance`: `number`; `twoD`: `boolean`; `viewMode`: `"2d"` \| `"3d"` \| `"ar"` \| `"vr"`; \}; `graphtyTemplate`: `true`; `layers`: `object`[]; `majorVersion`: `"1"`; `metadata?`: \{ `templateCreationTimestamp?`: `string`; `templateCreator?`: `string`; `templateModificationTimestamp?`: `string`; `templateName?`: `string`; \}; \} | `undefined`

##### Returns

`void`

***

### viewMode

#### Get Signature

> **get** **viewMode**(): `"2d"` \| `"3d"` \| `"ar"` \| `"vr"` \| `undefined`

Defined in: [src/graphty-element.ts:440](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L440)

View mode controls how the graph is rendered and displayed.

##### Remarks

- `"2d"`: Orthographic camera, fixed top-down view
- `"3d"`: Perspective camera with orbit controls (default)
- `"ar"`: Augmented reality mode using WebXR
- `"vr"`: Virtual reality mode using WebXR

VR and AR modes require WebXR support in the browser.

##### Default Value

`'3d'`

##### Since

1.0.0

##### See

[View Mode Examples](https://graphty-org.github.io/graphty-element/storybook/?path=/story/viewmode--default)

##### Example

```typescript
element.viewMode = "2d";  // Switch to 2D orthographic view
element.viewMode = "3d";  // Switch to 3D perspective view
element.viewMode = "vr";  // Enter VR mode (requires WebXR support)
```

##### Returns

`"2d"` \| `"3d"` \| `"ar"` \| `"vr"` \| `undefined`

#### Set Signature

> **set** **viewMode**(`value`): `void`

Defined in: [src/graphty-element.ts:443](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L443)

##### Parameters

###### value

`"2d"` | `"3d"` | `"ar"` | `"vr"` | `undefined`

##### Returns

`void`

***

### xr

#### Get Signature

> **get** **xr**(): \{ `ar?`: \{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \}; `enabled?`: `boolean`; `input?`: \{ `controllers?`: `boolean`; `enableZAmplificationInDesktop?`: `boolean`; `handTracking?`: `boolean`; `nearInteraction?`: `boolean`; `physics?`: `boolean`; `zAxisAmplification?`: `number`; \}; `teleportation?`: \{ `easeTime?`: `number`; `enabled?`: `boolean`; \}; `ui?`: \{ `enabled?`: `boolean`; `position?`: `"top-right"` \| `"top-left"` \| `"bottom-left"` \| `"bottom-right"`; `showAvailabilityWarning?`: `boolean`; `unavailableMessageDuration?`: `number`; \}; `vr?`: \{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \}; \} \| `undefined`

Defined in: [src/graphty-element.ts:593](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L593)

XR (VR/AR) configuration.
Controls XR UI buttons, VR/AR mode settings, and input handling.

##### Example

```typescript
element.xr = {
  enabled: true,
  ui: {
    enabled: true,
    position: 'bottom-right',
    showAvailabilityWarning: true  // Show warning if XR unavailable
  },
  input: {
    handTracking: true,
    controllers: true
  }
};
```

##### Returns

\{ `ar?`: \{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \}; `enabled?`: `boolean`; `input?`: \{ `controllers?`: `boolean`; `enableZAmplificationInDesktop?`: `boolean`; `handTracking?`: `boolean`; `nearInteraction?`: `boolean`; `physics?`: `boolean`; `zAxisAmplification?`: `number`; \}; `teleportation?`: \{ `easeTime?`: `number`; `enabled?`: `boolean`; \}; `ui?`: \{ `enabled?`: `boolean`; `position?`: `"top-right"` \| `"top-left"` \| `"bottom-left"` \| `"bottom-right"`; `showAvailabilityWarning?`: `boolean`; `unavailableMessageDuration?`: `number`; \}; `vr?`: \{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \}; \}

###### ar?

> `optional` **ar**: `object`

AR mode configuration

###### ar.enabled?

> `optional` **enabled**: `boolean`

Enable AR mode

###### Default

```ts
true
```

###### ar.optionalFeatures?

> `optional` **optionalFeatures**: `string`[]

Optional WebXR features to request

###### Default

```ts
["hit-test"]
```

###### ar.referenceSpaceType?

> `optional` **referenceSpaceType**: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`

WebXR reference space type for AR

###### Default

```ts
"local-floor"
```

###### enabled?

> `optional` **enabled**: `boolean`

Enable/disable XR functionality globally

###### Default

```ts
true
```

###### input?

> `optional` **input**: `object`

XR input and interaction configuration

###### input.controllers?

> `optional` **controllers**: `boolean`

Enable motion controllers

###### Default

```ts
true
```

###### input.enableZAmplificationInDesktop?

> `optional` **enableZAmplificationInDesktop**: `boolean`

Enable Z-axis amplification in desktop mode
Normally amplification only applies in XR mode, but this can enable it for desktop too

###### Default

```ts
false
```

###### input.handTracking?

> `optional` **handTracking**: `boolean`

Enable hand tracking

###### Default

```ts
true
```

###### input.nearInteraction?

> `optional` **nearInteraction**: `boolean`

Enable near interaction (touch/grab)

###### Default

```ts
true
```

###### input.physics?

> `optional` **physics**: `boolean`

Enable physics-based interactions

###### Default

```ts
false
```

###### input.zAxisAmplification?

> `optional` **zAxisAmplification**: `number`

Z-axis movement amplification factor
Multiplies Z-axis delta during drag to make depth manipulation practical in VR

Example: With zAxisAmplification = 10, moving controller 0.1 units in Z
will move the node 1.0 units in Z

###### Default

```ts
10.0
```

###### teleportation?

> `optional` **teleportation**: `object`

Teleportation configuration

###### teleportation.easeTime?

> `optional` **easeTime**: `number`

Teleportation animation duration (ms)

###### Default

```ts
200
```

###### teleportation.enabled?

> `optional` **enabled**: `boolean`

Enable teleportation system

###### Default

```ts
false
```

###### ui?

> `optional` **ui**: `object`

XR UI button configuration

###### ui.enabled?

> `optional` **enabled**: `boolean`

Show VR/AR entry buttons

###### Default

```ts
true
```

###### ui.position?

> `optional` **position**: `"top-right"` \| `"top-left"` \| `"bottom-left"` \| `"bottom-right"`

Button position on screen

###### Default

```ts
"bottom-right"
```

###### ui.showAvailabilityWarning?

> `optional` **showAvailabilityWarning**: `boolean`

Show "VR / AR NOT AVAILABLE" warning when XR is not available
When false, no message is displayed if AR/VR aren't available

###### Default

```ts
false
```

###### ui.unavailableMessageDuration?

> `optional` **unavailableMessageDuration**: `number`

Duration to show "not available" message (ms)

###### Default

```ts
5000
```

###### vr?

> `optional` **vr**: `object`

VR mode configuration

###### vr.enabled?

> `optional` **enabled**: `boolean`

Enable VR mode

###### Default

```ts
true
```

###### vr.optionalFeatures?

> `optional` **optionalFeatures**: `string`[]

Optional WebXR features to request

###### Default

```ts
[]
```

###### vr.referenceSpaceType?

> `optional` **referenceSpaceType**: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`

WebXR reference space type for VR
- "local": Seated/standing experience, no room bounds
- "local-floor": Floor-level origin, no room bounds
- "bounded-floor": Room-scale with bounds
- "unbounded": Unlimited tracking space

###### Default

```ts
"local-floor"
```

`undefined`

#### Set Signature

> **set** **xr**(`value`): `void`

Defined in: [src/graphty-element.ts:596](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L596)

##### Parameters

###### value

\{ `ar?`: \{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \}; `enabled?`: `boolean`; `input?`: \{ `controllers?`: `boolean`; `enableZAmplificationInDesktop?`: `boolean`; `handTracking?`: `boolean`; `nearInteraction?`: `boolean`; `physics?`: `boolean`; `zAxisAmplification?`: `number`; \}; `teleportation?`: \{ `easeTime?`: `number`; `enabled?`: `boolean`; \}; `ui?`: \{ `enabled?`: `boolean`; `position?`: `"top-right"` \| `"top-left"` \| `"bottom-left"` \| `"bottom-right"`; `showAvailabilityWarning?`: `boolean`; `unavailableMessageDuration?`: `number`; \}; `vr?`: \{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \}; \}

###### ar?

\{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \} = `...`

AR mode configuration

###### ar.enabled?

`boolean` = `...`

Enable AR mode

**Default**

```ts
true
```

###### ar.optionalFeatures?

`string`[] = `...`

Optional WebXR features to request

**Default**

```ts
["hit-test"]
```

###### ar.referenceSpaceType?

`"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"` = `...`

WebXR reference space type for AR

**Default**

```ts
"local-floor"
```

###### enabled?

`boolean` = `...`

Enable/disable XR functionality globally

**Default**

```ts
true
```

###### input?

\{ `controllers?`: `boolean`; `enableZAmplificationInDesktop?`: `boolean`; `handTracking?`: `boolean`; `nearInteraction?`: `boolean`; `physics?`: `boolean`; `zAxisAmplification?`: `number`; \} = `...`

XR input and interaction configuration

###### input.controllers?

`boolean` = `...`

Enable motion controllers

**Default**

```ts
true
```

###### input.enableZAmplificationInDesktop?

`boolean` = `...`

Enable Z-axis amplification in desktop mode
Normally amplification only applies in XR mode, but this can enable it for desktop too

**Default**

```ts
false
```

###### input.handTracking?

`boolean` = `...`

Enable hand tracking

**Default**

```ts
true
```

###### input.nearInteraction?

`boolean` = `...`

Enable near interaction (touch/grab)

**Default**

```ts
true
```

###### input.physics?

`boolean` = `...`

Enable physics-based interactions

**Default**

```ts
false
```

###### input.zAxisAmplification?

`number` = `...`

Z-axis movement amplification factor
Multiplies Z-axis delta during drag to make depth manipulation practical in VR

Example: With zAxisAmplification = 10, moving controller 0.1 units in Z
will move the node 1.0 units in Z

**Default**

```ts
10.0
```

###### teleportation?

\{ `easeTime?`: `number`; `enabled?`: `boolean`; \} = `...`

Teleportation configuration

###### teleportation.easeTime?

`number` = `...`

Teleportation animation duration (ms)

**Default**

```ts
200
```

###### teleportation.enabled?

`boolean` = `...`

Enable teleportation system

**Default**

```ts
false
```

###### ui?

\{ `enabled?`: `boolean`; `position?`: `"top-right"` \| `"top-left"` \| `"bottom-left"` \| `"bottom-right"`; `showAvailabilityWarning?`: `boolean`; `unavailableMessageDuration?`: `number`; \} = `...`

XR UI button configuration

###### ui.enabled?

`boolean` = `...`

Show VR/AR entry buttons

**Default**

```ts
true
```

###### ui.position?

`"top-right"` \| `"top-left"` \| `"bottom-left"` \| `"bottom-right"` = `...`

Button position on screen

**Default**

```ts
"bottom-right"
```

###### ui.showAvailabilityWarning?

`boolean` = `...`

Show "VR / AR NOT AVAILABLE" warning when XR is not available
When false, no message is displayed if AR/VR aren't available

**Default**

```ts
false
```

###### ui.unavailableMessageDuration?

`number` = `...`

Duration to show "not available" message (ms)

**Default**

```ts
5000
```

###### vr?

\{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \} = `...`

VR mode configuration

###### vr.enabled?

`boolean` = `...`

Enable VR mode

**Default**

```ts
true
```

###### vr.optionalFeatures?

`string`[] = `...`

Optional WebXR features to request

**Default**

```ts
[]
```

###### vr.referenceSpaceType?

`"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"` = `...`

WebXR reference space type for VR
- "local": Seated/standing experience, no room bounds
- "local-floor": Floor-level origin, no room bounds
- "bounded-floor": Room-scale with bounds
- "unbounded": Unlimited tracking space

**Default**

```ts
"local-floor"
```

| `undefined`

##### Returns

`void`

## Methods

### Other

#### addDataFromSource()

> **addDataFromSource**(`type`, `opts?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1152](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1152)

Add data from a data source.

##### Parameters

###### type

`string`

Data source type (e.g., "json", "csv", "graphml")

###### opts?

`object`

Data source configuration options

##### Returns

`Promise`\<`void`\>

Promise that resolves when data is loaded

##### Since

1.5.0

##### Example

```typescript
await element.addDataFromSource('json', { url: 'https://example.com/data.json' });
```

***

#### addEdge()

> **addEdge**(`edge`, `srcIdPath?`, `dstIdPath?`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1061](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1061)

Add a single edge to the graph.

##### Parameters

###### edge

[`AdHocData`](../../config/type-aliases/AdHocData.md)\<`string`\>

Edge data object to add

###### srcIdPath?

`string`

Path to source node ID (default: "source")

###### dstIdPath?

`string`

Path to target node ID (default: "target")

###### options?

`QueueableOptions`

Queue options for operation ordering

##### Returns

`Promise`\<`void`\>

Promise that resolves when edge is added

##### Since

1.5.0

##### Example

```typescript
await element.addEdge({ source: 'a', target: 'b', weight: 1.5 });
```

***

#### addEdges()

> **addEdges**(`edges`, `srcIdPath?`, `dstIdPath?`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1088](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1088)

Add multiple edges to the graph.

##### Parameters

###### edges

[`AdHocData`](../../config/type-aliases/AdHocData.md)\<`string`\>[]

Array of edge data objects to add

###### srcIdPath?

`string`

Path to source node ID (default: "source")

###### dstIdPath?

`string`

Path to target node ID (default: "target")

###### options?

`QueueableOptions`

Queue options for operation ordering

##### Returns

`Promise`\<`void`\>

Promise that resolves when edges are added

##### Since

1.5.0

##### Example

```typescript
await element.addEdges([
  { source: 'a', target: 'b' },
  { source: 'b', target: 'c' }
]);
```

***

#### addListener()

> **addListener**(`type`, `callback`): `void`

Defined in: [src/graphty-element.ts:1572](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1572)

Subscribe to graph events (alias for on).

##### Parameters

###### type

[`EventType`](../../events/type-aliases/EventType.md)

Event type to listen for

###### callback

[`EventCallbackType`](../../events/type-aliases/EventCallbackType.md)

Callback function

##### Returns

`void`

##### Since

1.5.0

***

#### addNode()

> **addNode**(`node`, `idPath?`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1013](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1013)

Add a single node to the graph.

##### Parameters

###### node

[`AdHocData`](../../config/type-aliases/AdHocData.md)\<`string`\>

Node data object to add

###### idPath?

`string`

Key to use for node ID (default: "id")

###### options?

`QueueableOptions`

Queue options for operation ordering

##### Returns

`Promise`\<`void`\>

Promise that resolves when node is added

##### Since

1.5.0

##### Example

```typescript
await element.addNode({ id: 'node-1', label: 'First Node' });
```

***

#### addNodes()

> **addNodes**(`nodes`, `idPath?`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1038](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1038)

Add multiple nodes to the graph.

##### Parameters

###### nodes

[`AdHocData`](../../config/type-aliases/AdHocData.md)\<`string`\>[]

Array of node data objects to add

###### idPath?

`string`

Key to use for node IDs (default: "id")

###### options?

`QueueableOptions`

Queue options for operation ordering

##### Returns

`Promise`\<`void`\>

Promise that resolves when nodes are added

##### Since

1.5.0

##### Example

```typescript
await element.addNodes([
  { id: 'a', label: 'Node A' },
  { id: 'b', label: 'Node B' }
]);
```

***

#### aiCommand()

> **aiCommand**(`message`): `Promise`\<`ExecutionResult`\>

Defined in: [src/graphty-element.ts:2027](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L2027)

Send a command to the AI assistant.

##### Parameters

###### message

`string`

The command message

##### Returns

`Promise`\<`ExecutionResult`\>

Promise with the execution result

##### Since

1.5.0

##### Example

```typescript
const result = await element.aiCommand('Show me the most connected nodes');
console.log('AI response:', result.message);
```

***

#### applySuggestedStyles()

> **applySuggestedStyles**(`algorithmKey`, `options?`): `boolean`

Defined in: [src/graphty-element.ts:1386](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1386)

Apply suggested styles from an algorithm.

##### Parameters

###### algorithmKey

Algorithm key (e.g., "graphty:degree")

`string` | `string`[]

###### options?

[`ApplySuggestedStylesOptions`](../../config/interfaces/ApplySuggestedStylesOptions.md)

Options for applying styles

##### Returns

`boolean`

True if styles were applied, false otherwise

##### Since

1.5.0

##### Example

```typescript
await element.runAlgorithm('graphty', 'degree');
element.applySuggestedStyles('graphty:degree');
```

***

#### asyncFirstUpdated()

> **asyncFirstUpdated**(): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:86](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L86)

##### Returns

`Promise`\<`void`\>

***

#### batchOperations()

> **batchOperations**(`fn`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1536](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1536)

Execute multiple operations as a batch.

##### Parameters

###### fn

() => `void` \| `Promise`\<`void`\>

Function containing batch operations

##### Returns

`Promise`\<`void`\>

Promise that resolves when batch completes

##### Since

1.5.0

##### Example

```typescript
await element.batchOperations(async () => {
  await element.addNodes(nodes);
  await element.addEdges(edges);
  await element.setLayout('circular');
});
```

***

#### canCaptureScreenshot()

> **canCaptureScreenshot**(`options?`): `Promise`\<`CapabilityCheck`\>

Defined in: [src/graphty-element.ts:659](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L659)

Phase 6: Capability Check API
Check if screenshot can be captured with given options.
Available from Phase 6 onwards.

##### Parameters

###### options?

`ScreenshotOptions`

Screenshot options to validate

##### Returns

`Promise`\<`CapabilityCheck`\>

Promise\<CapabilityCheck\> - Result indicating whether screenshot is supported

##### Example

```typescript
const el = document.querySelector('graphty-element');

// Check if 4x multiplier is supported
const check = await el.canCaptureScreenshot({ multiplier: 4 });
if (!check.supported) {
  alert(`Cannot capture: ${check.reason}`);
} else if (check.warnings) {
  console.warn('Warnings:', check.warnings);
}
```

***

#### cancelAiCommand()

> **cancelAiCommand**(): `void`

Defined in: [src/graphty-element.ts:2065](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L2065)

Cancel the current AI command.

##### Returns

`void`

##### Since

1.5.0

***

#### cancelAnimationCapture()

> **cancelAnimationCapture**(): `boolean`

Defined in: [src/graphty-element.ts:730](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L730)

Phase 7: Cancel Animation Capture
Cancel an ongoing animation capture
Available from Phase 7 onwards.

##### Returns

`boolean`

true if a capture was cancelled, false if no capture was in progress

##### Example

```typescript
const el = document.querySelector("graphty-element");

// Start a 10-second capture
const capturePromise = el.captureAnimation({
  duration: 10000,
  fps: 30,
  cameraMode: 'stationary'
});

// Cancel after 2 seconds
setTimeout(() => {
  const wasCancelled = el.cancelAnimationCapture();
  console.log('Cancelled:', wasCancelled);
}, 2000);

// Handle the cancellation
try {
  await capturePromise;
} catch (error) {
  if (error.name === 'AnimationCancelledError') {
    console.log('Capture was cancelled by user');
  }
}
```

***

#### captureAnimation()

> **captureAnimation**(`options`): `Promise`\<`AnimationResult`\>

Defined in: [src/graphty-element.ts:692](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L692)

Phase 7: Video Capture API
Capture an animation as a video (stationary or animated camera)
Available from Phase 7 onwards.

##### Parameters

###### options

`AnimationOptions`

Animation capture options

##### Returns

`Promise`\<`AnimationResult`\>

Promise\<AnimationResult\> - Result with video blob and metadata

##### Example

```typescript
const el = document.querySelector('graphty-element');

// Basic 5-second video
const result = await el.captureAnimation({
  duration: 5000,
  fps: 30,
  cameraMode: 'stationary'
});

// With download
const result = await el.captureAnimation({
  duration: 10000,
  fps: 60,
  cameraMode: 'stationary',
  download: true,
  downloadFilename: 'my-video.webm'
});
```

***

#### captureScreenshot()

> **captureScreenshot**(`options?`): `Promise`\<`ScreenshotResult`\>

Defined in: [src/graphty-element.ts:634](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L634)

Capture a screenshot of the current graph visualization.

##### Parameters

###### options?

`ScreenshotOptions`

Screenshot options (format, resolution, destinations, etc.)

##### Returns

`Promise`\<`ScreenshotResult`\>

Promise resolving to ScreenshotResult with blob and metadata

##### Example

```typescript
const el = document.querySelector('graphty-element');

// Basic PNG screenshot
const result = await el.captureScreenshot();

// High-res JPEG with download
const result = await el.captureScreenshot({
  format: 'jpeg',
  multiplier: 2,
  destination: { download: true }
});

// Copy to clipboard
const result = await el.captureScreenshot({
  destination: { clipboard: true }
});
```

***

#### createApiKeyManager()

> `static` **createApiKeyManager**(): `ApiKeyManager`

Defined in: [src/graphty-element.ts:2122](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L2122)

Create an API key manager for persistent key storage.
This is a static method - the manager is not tied to any specific graph instance.

##### Returns

`ApiKeyManager`

The created API key manager

##### Since

1.5.0

##### Example

```typescript
const keyManager = Graphty.createApiKeyManager();
await keyManager.setKey('openai', 'your-api-key');
```

***

#### deselectNode()

> **deselectNode**(): `void`

Defined in: [src/graphty-element.ts:1305](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1305)

Deselect the currently selected node.

##### Returns

`void`

##### Since

1.5.0

##### Example

```typescript
element.deselectNode();
```

***

#### disableAiControl()

> **disableAiControl**(): `void`

Defined in: [src/graphty-element.ts:2010](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L2010)

Disable AI control for the graph.

##### Returns

`void`

##### Since

1.5.0

***

#### enableAiControl()

> **enableAiControl**(`config`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:2001](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L2001)

Enable AI control for the graph.

##### Parameters

###### config

`AiManagerConfig`

AI manager configuration

##### Returns

`Promise`\<`void`\>

Promise that resolves when AI is enabled

##### Since

1.5.0

##### Example

```typescript
await element.enableAiControl({
  provider: { type: 'openai', apiKey: 'your-api-key' }
});
```

***

#### estimateAnimationCapture()

> **estimateAnimationCapture**(`options`): `Promise`\<`CaptureEstimate`\>

Defined in: [src/graphty-element.ts:768](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L768)

Phase 7: Animation Capture Estimation
Estimate performance and potential issues for animation capture
Available from Phase 7 onwards.

##### Parameters

###### options

`Pick`\<`AnimationOptions`, `"duration"` \| `"fps"` \| `"width"` \| `"height"`\>

Animation options to estimate

##### Returns

`Promise`\<`CaptureEstimate`\>

Promise\<CaptureEstimate\> - Estimation result

##### Example

```typescript
const el = document.querySelector("graphty-element");

const estimate = await el.estimateAnimationCapture({
  duration: 5000,
  fps: 60,
  width: 3840,
  height: 2160
});

if (estimate.likelyToDropFrames) {
  console.warn(`May drop frames. Try ${estimate.recommendedFps}fps instead.`);
}
```

***

#### exitXR()

> **exitXR**(): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1658](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1658)

Exit XR (VR/AR) mode.

##### Returns

`Promise`\<`void`\>

Promise that resolves when XR session ends

##### Since

1.5.0

##### Example

```typescript
await element.exitXR();
```

***

#### exportCameraPresets()

> **exportCameraPresets**(): `Record`\<`string`, `CameraState`\>

Defined in: [src/graphty-element.ts:975](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L975)

Export user-defined presets as JSON
Available from Phase 5 onwards

##### Returns

`Record`\<`string`, `CameraState`\>

Record of user-defined preset names to their state

***

#### getAiManager()

> **getAiManager**(): `AiManager` \| `null`

Defined in: [src/graphty-element.ts:2075](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L2075)

Get the AI manager.

##### Returns

`AiManager` \| `null`

The AI manager, or null if not enabled

##### Since

1.5.0

***

#### getAiStatus()

> **getAiStatus**(): `AiStatus` \| `null`

Defined in: [src/graphty-element.ts:2037](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L2037)

Get the current AI status.

##### Returns

`AiStatus` \| `null`

The AI status, or null if AI is not enabled

##### Since

1.5.0

***

#### getApiKeyManager()

> **getApiKeyManager**(): `ApiKeyManager` \| `null`

Defined in: [src/graphty-element.ts:2105](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L2105)

Get the API key manager.

##### Returns

`ApiKeyManager` \| `null`

The API key manager, or null if not created

##### Since

1.5.0

***

#### getCameraController()

> **getCameraController**(): `CameraController` \| `null`

Defined in: [src/graphty-element.ts:1935](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1935)

Get the current camera controller.

##### Returns

`CameraController` \| `null`

The camera controller, or null if not available

##### Since

1.5.0

***

#### getCameraPresets()

> **getCameraPresets**(): `Record`\<`string`, `CameraState` \| \{ `builtin`: `true`; \}\>

Defined in: [src/graphty-element.ts:966](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L966)

Get all camera presets (built-in + user-defined)
Available from Phase 5 onwards

##### Returns

`Record`\<`string`, `CameraState` \| \{ `builtin`: `true`; \}\>

Record of preset names to their state (built-in presets are marked)

***

#### getCameraState()

> **getCameraState**(): `CameraState`

Defined in: [src/graphty-element.ts:864](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L864)

Get current camera state (supports both 2D and 3D)

##### Returns

`CameraState`

Current camera state including position, target, zoom, etc.

***

#### getDataManager()

> **getDataManager**(): [`DataManager`](../../managers/classes/DataManager.md)

Defined in: [src/graphty-element.ts:1830](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1830)

Get the DataManager for advanced data operations.

##### Returns

[`DataManager`](../../managers/classes/DataManager.md)

The DataManager instance

##### Since

1.5.0

***

#### getEdgeCount()

> **getEdgeCount**(): `number`

Defined in: [src/graphty-element.ts:1269](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1269)

Get the number of edges in the graph.

##### Returns

`number`

Number of edges

##### Since

1.5.0

##### Example

```typescript
console.log('Edge count:', element.getEdgeCount());
```

***

#### getEventManager()

> **getEventManager**(): [`EventManager`](../../managers/classes/EventManager.md)

Defined in: [src/graphty-element.ts:1886](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1886)

Get the EventManager for event operations.

##### Returns

[`EventManager`](../../managers/classes/EventManager.md)

The EventManager instance

##### Since

1.5.0

***

#### getLayoutManager()

> **getLayoutManager**(): [`LayoutManager`](../../managers/classes/LayoutManager.md)

Defined in: [src/graphty-element.ts:1840](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1840)

Get the LayoutManager for advanced layout operations.

##### Returns

[`LayoutManager`](../../managers/classes/LayoutManager.md)

The LayoutManager instance

##### Since

1.5.0

***

#### getMeshCache()

> **getMeshCache**(): `MeshCache`

Defined in: [src/graphty-element.ts:1906](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1906)

Get the MeshCache for mesh management.

##### Returns

`MeshCache`

The MeshCache instance

##### Since

1.5.0

***

#### getNode()

> **getNode**(`nodeId`): [`Node`](../../Node/classes/Node.md) \| `undefined`

Defined in: [src/graphty-element.ts:1223](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1223)

Get a node by its ID.

##### Parameters

###### nodeId

The ID of the node to get

`string` | `number`

##### Returns

[`Node`](../../Node/classes/Node.md) \| `undefined`

The node, or undefined if not found

##### Since

1.5.0

##### Example

```typescript
const node = element.getNode('node-1');
if (node) {
  console.log('Node data:', node.data);
}
```

***

#### getNodeCount()

> **getNodeCount**(): `number`

Defined in: [src/graphty-element.ts:1254](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1254)

Get the number of nodes in the graph.

##### Returns

`number`

Number of nodes

##### Since

1.5.0

##### Example

```typescript
console.log('Node count:', element.getNodeCount());
```

***

#### getNodeMesh()

> **getNodeMesh**(`nodeId`): `AbstractMesh` \| `null`

Defined in: [src/graphty-element.ts:1969](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1969)

Get a node's mesh by its ID.

##### Parameters

###### nodeId

`string`

The ID of the node

##### Returns

`AbstractMesh` \| `null`

The node's mesh, or null if not found

##### Since

1.5.0

##### Example

```typescript
const mesh = element.getNodeMesh('node-1');
if (mesh) {
  console.log('Node position:', mesh.position);
}
```

***

#### getNodes()

> **getNodes**(): [`Node`](../../Node/classes/Node.md)[]

Defined in: [src/graphty-element.ts:1239](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1239)

Get all nodes in the graph.

##### Returns

[`Node`](../../Node/classes/Node.md)[]

Array of all nodes

##### Since

1.5.0

##### Example

```typescript
const nodes = element.getNodes();
console.log('Total nodes:', nodes.length);
```

***

#### getScene()

> **getScene**(): `Scene`

Defined in: [src/graphty-element.ts:1896](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1896)

Get the Babylon.js Scene for advanced rendering operations.

##### Returns

`Scene`

The Babylon.js Scene

##### Since

1.5.0

***

#### getSelectedNode()

> **getSelectedNode**(): [`Node`](../../Node/classes/Node.md) \| `null`

Defined in: [src/graphty-element.ts:1323](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1323)

Get the currently selected node.

##### Returns

[`Node`](../../Node/classes/Node.md) \| `null`

The selected node, or null if no node is selected

##### Since

1.5.0

##### Example

```typescript
const selected = element.getSelectedNode();
if (selected) {
  console.log('Selected node:', selected.id);
}
```

***

#### getSelectionManager()

> **getSelectionManager**(): [`SelectionManager`](../../managers/classes/SelectionManager.md)

Defined in: [src/graphty-element.ts:1876](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1876)

Get the SelectionManager for selection operations.

##### Returns

[`SelectionManager`](../../managers/classes/SelectionManager.md)

The SelectionManager instance

##### Since

1.5.0

***

#### getStatsManager()

> **getStatsManager**(): [`StatsManager`](../../managers/classes/StatsManager.md)

Defined in: [src/graphty-element.ts:1866](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1866)

Get the StatsManager for performance statistics.

##### Returns

[`StatsManager`](../../managers/classes/StatsManager.md)

The StatsManager instance

##### Since

1.5.0

##### Example

```typescript
const stats = element.getStatsManager();
console.log('FPS:', stats.getSnapshot().fps);
```

***

#### getStyleManager()

> **getStyleManager**(): [`StyleManager`](../../managers/classes/StyleManager.md)

Defined in: [src/graphty-element.ts:1453](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1453)

Get the style manager for advanced style manipulation.

##### Returns

[`StyleManager`](../../managers/classes/StyleManager.md)

The style manager instance

##### Since

1.5.0

##### Example

```typescript
const styleManager = element.getStyleManager();
styleManager.addLayer({
  selector: '[?type == "important"]',
  styles: { node: { color: '#ff0000' } }
});
```

***

#### getStyles()

> **getStyles**(): [`Styles`](../../Styles/classes/Styles.md)

Defined in: [src/graphty-element.ts:1820](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1820)

Get the Styles object for direct style access.

##### Returns

[`Styles`](../../Styles/classes/Styles.md)

The Styles object

##### Since

1.5.0

##### Example

```typescript
const styles = element.getStyles();
console.log('Background color:', styles.config.graph.background.color);
```

***

#### getSuggestedStyles()

> **getSuggestedStyles**(`algorithmKey`): [`SuggestedStylesConfig`](../../config/interfaces/SuggestedStylesConfig.md) \| `null`

Defined in: [src/graphty-element.ts:1408](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1408)

Get suggested styles for an algorithm without applying them.

##### Parameters

###### algorithmKey

`string`

Algorithm key (e.g., "graphty:degree")

##### Returns

[`SuggestedStylesConfig`](../../config/interfaces/SuggestedStylesConfig.md) \| `null`

Suggested styles config, or null if none exist

##### Since

1.5.0

##### Example

```typescript
const styles = element.getSuggestedStyles('graphty:degree');
if (styles) {
  console.log('Available style layers:', styles.layers.length);
}
```

***

#### getUpdateManager()

> **getUpdateManager**(): [`UpdateManager`](../../managers/classes/UpdateManager.md)

Defined in: [src/graphty-element.ts:1850](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1850)

Get the UpdateManager for update scheduling.

##### Returns

[`UpdateManager`](../../managers/classes/UpdateManager.md)

The UpdateManager instance

##### Since

1.5.0

***

#### getViewMode()

> **getViewMode**(): `"2d"` \| `"3d"` \| `"ar"` \| `"vr"`

Defined in: [src/graphty-element.ts:786](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L786)

Get the current view mode.

##### Returns

`"2d"` \| `"3d"` \| `"ar"` \| `"vr"`

The current view mode ("2d", "3d", "ar", or "vr")

##### Example

```typescript
const mode = element.getViewMode();
console.log(`Current mode: ${mode}`); // "3d"
```

***

#### getVoiceAdapter()

> **getVoiceAdapter**(): `VoiceInputAdapter`

Defined in: [src/graphty-element.ts:2132](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L2132)

Get the voice input adapter.

##### Returns

`VoiceInputAdapter`

The voice input adapter

##### Since

1.5.0

***

#### getXRConfig()

> **getXRConfig**(): [`XRConfig`](../../config/interfaces/XRConfig.md) \| `undefined`

Defined in: [src/graphty-element.ts:1643](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1643)

Get the current XR configuration.

##### Returns

[`XRConfig`](../../config/interfaces/XRConfig.md) \| `undefined`

The current XR configuration, or undefined if not set

##### Since

1.5.0

***

#### getXRSessionManager()

> **getXRSessionManager**(): `XRSessionManager` \| `undefined`

Defined in: [src/graphty-element.ts:1979](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1979)

Get the XR session manager.

##### Returns

`XRSessionManager` \| `undefined`

The XR session manager, or undefined if not initialized

##### Since

1.5.0

***

#### importCameraPresets()

> **importCameraPresets**(`presets`): `void`

Defined in: [src/graphty-element.ts:984](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L984)

Import user-defined presets from JSON
Available from Phase 5 onwards

##### Parameters

###### presets

`Record`\<`string`, `CameraState`\>

Record of preset names to their state

##### Returns

`void`

***

#### is2D()

> **is2D**(): `boolean`

Defined in: [src/graphty-element.ts:1611](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1611)

Check if the graph is in 2D mode.

##### Returns

`boolean`

True if in 2D mode, false otherwise

##### Since

1.5.0

##### Example

```typescript
if (element.is2D()) {
  console.log('Graph is in 2D mode');
}
```

***

#### isAiEnabled()

> **isAiEnabled**(): `boolean`

Defined in: [src/graphty-element.ts:2085](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L2085)

Check if AI control is enabled.

##### Returns

`boolean`

True if AI is enabled

##### Since

1.5.0

***

#### isAnimationCapturing()

> **isAnimationCapturing**(): `boolean`

Defined in: [src/graphty-element.ts:740](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L740)

Phase 7: Check if animation capture is in progress
Available from Phase 7 onwards.

##### Returns

`boolean`

true if a capture is currently running

***

#### isARSupported()

> **isARSupported**(): `Promise`\<`boolean`\>

Defined in: [src/graphty-element.ts:852](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L852)

Check if AR mode is supported on this device/browser.
Returns true if WebXR is available and AR sessions are supported.

Use this to conditionally show/hide AR controls or display
appropriate messaging to users.

##### Returns

`Promise`\<`boolean`\>

Promise resolving to true if AR is supported

##### Example

```typescript
const arButton = document.querySelector('#ar-button');
const arSupported = await element.isARSupported();
if (!arSupported) {
  arButton.disabled = true;
  arButton.title = "AR not available on this device";
}
```

***

#### isNodeSelected()

> **isNodeSelected**(`nodeId`): `boolean`

Defined in: [src/graphty-element.ts:1341](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1341)

Check if a specific node is selected.

##### Parameters

###### nodeId

The ID of the node to check

`string` | `number`

##### Returns

`boolean`

True if the node is selected, false otherwise

##### Since

1.5.0

##### Example

```typescript
if (element.isNodeSelected('node-1')) {
  console.log('Node 1 is selected');
}
```

***

#### isRunning()

> **isRunning**(): `boolean`

Defined in: [src/graphty-element.ts:1733](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1733)

Check if the graph is running.

##### Returns

`boolean`

True if the graph is running, false otherwise

##### Since

1.5.0

##### Example

```typescript
if (element.isRunning()) {
  console.log('Graph is active');
}
```

***

#### isVoiceActive()

> **isVoiceActive**(): `boolean`

Defined in: [src/graphty-element.ts:2178](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L2178)

Check if voice input is active.

##### Returns

`boolean`

True if voice input is active

##### Since

1.5.0

***

#### isVRSupported()

> **isVRSupported**(): `Promise`\<`boolean`\>

Defined in: [src/graphty-element.ts:829](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L829)

Check if VR mode is supported on this device/browser.
Returns true if WebXR is available and VR sessions are supported.

Use this to conditionally show/hide VR controls or display
appropriate messaging to users.

##### Returns

`Promise`\<`boolean`\>

Promise resolving to true if VR is supported

##### Example

```typescript
const vrButton = document.querySelector('#vr-button');
const vrSupported = await element.isVRSupported();
if (!vrSupported) {
  vrButton.disabled = true;
  vrButton.title = "VR not available on this device";
}
```

***

#### listenerCount()

> **listenerCount**(): `number`

Defined in: [src/graphty-element.ts:1590](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1590)

Get the total number of registered event listeners.

##### Returns

`number`

Number of registered listeners

##### Since

1.5.0

##### Example

```typescript
console.log('Active listeners:', element.listenerCount());
```

***

#### loadCameraPreset()

> **loadCameraPreset**(`name`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:957](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L957)

Load a camera preset (built-in or user-defined)
Available from Phase 5 onwards

##### Parameters

###### name

`string`

Name of the preset to load

###### options?

`CameraAnimationOptions`

Animation options

##### Returns

`Promise`\<`void`\>

***

#### loadFromFile()

> **loadFromFile**(`file`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1196](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1196)

Load graph data from a File object.

##### Parameters

###### file

`File`

File object from file input

###### options?

Loading options

###### edgeDstIdPath?

`string`

###### edgeSrcIdPath?

`string`

###### format?

`string`

###### nodeIdPath?

`string`

##### Returns

`Promise`\<`void`\>

Promise that resolves when data is loaded

##### Since

1.5.0

##### Example

```typescript
const input = document.querySelector('input[type="file"]');
const file = input.files[0];
await element.loadFromFile(file);
```

***

#### loadFromUrl()

> **loadFromUrl**(`url`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1169](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1169)

Load graph data from a URL.

##### Parameters

###### url

`string`

URL to fetch graph data from

###### options?

Loading options

###### edgeDstIdPath?

`string`

###### edgeSrcIdPath?

`string`

###### format?

`string`

###### nodeIdPath?

`string`

##### Returns

`Promise`\<`void`\>

Promise that resolves when data is loaded

##### Since

1.5.0

##### Example

```typescript
await element.loadFromUrl('https://example.com/graph.json');
```

***

#### on()

> **on**(`type`, `callback`): `void`

Defined in: [src/graphty-element.ts:1558](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1558)

Subscribe to graph events.

##### Parameters

###### type

[`EventType`](../../events/type-aliases/EventType.md)

Event type to listen for

###### callback

[`EventCallbackType`](../../events/type-aliases/EventCallbackType.md)

Callback function

##### Returns

`void`

##### Since

1.5.0

##### Example

```typescript
element.on('graph-settled', () => {
  console.log('Graph layout has settled');
});
```

***

#### onAiStatusChange()

> **onAiStatusChange**(`callback`): () => `void`

Defined in: [src/graphty-element.ts:2056](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L2056)

Subscribe to AI status changes.

##### Parameters

###### callback

`StatusChangeCallback`

Callback function for status changes

##### Returns

Unsubscribe function

> (): `void`

###### Returns

`void`

##### Since

1.5.0

##### Example

```typescript
const unsubscribe = element.onAiStatusChange((status) => {
  console.log('AI state:', status.state);
});
// Later: unsubscribe();
```

***

#### removeNodes()

> **removeNodes**(`nodeIds`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1110](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1110)

Remove nodes from the graph.

##### Parameters

###### nodeIds

(`string` \| `number`)[]

Array of node IDs to remove

###### options?

`QueueableOptions`

Queue options for operation ordering

##### Returns

`Promise`\<`void`\>

Promise that resolves when nodes are removed

##### Since

1.5.0

##### Example

```typescript
await element.removeNodes(['node-1', 'node-2']);
```

***

#### resetCamera()

> **resetCamera**(`options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:938](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L938)

Reset camera to default position

##### Parameters

###### options?

`CameraAnimationOptions`

Animation options

##### Returns

`Promise`\<`void`\>

Promise that resolves when the reset is applied (or animation completes)

***

#### resolveCameraPreset()

> **resolveCameraPreset**(`preset`): `CameraState`

Defined in: [src/graphty-element.ts:1679](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1679)

Resolve a camera preset to a CameraState.

##### Parameters

###### preset

`string`

Preset name (e.g., "fitToGraph", "topView")

##### Returns

`CameraState`

The resolved camera state

##### Since

1.5.0

##### Example

```typescript
const state = element.resolveCameraPreset('topView');
await element.setCameraState(state, { animate: true });
```

***

#### retryLastAiCommand()

> **retryLastAiCommand**(): `Promise`\<`ExecutionResult`\>

Defined in: [src/graphty-element.ts:2095](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L2095)

Retry the last AI command that failed.

##### Returns

`Promise`\<`ExecutionResult`\>

Promise with the execution result

##### Since

1.5.0

***

#### runAlgorithm()

> **runAlgorithm**(`namespace`, `type`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1364](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1364)

Run a graph algorithm.

##### Parameters

###### namespace

`string`

Algorithm namespace (e.g., "graphty")

###### type

`string`

Algorithm type (e.g., "degree", "pagerank")

###### options?

`RunAlgorithmOptions`

Algorithm options

##### Returns

`Promise`\<`void`\>

Promise that resolves when algorithm completes

##### Since

1.5.0

##### Example

```typescript
await element.runAlgorithm('graphty', 'degree');
await element.runAlgorithm('graphty', 'pagerank', { applySuggestedStyles: true });
```

***

#### saveCameraPreset()

> **saveCameraPreset**(`name`): `void`

Defined in: [src/graphty-element.ts:947](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L947)

Save current camera state as a named preset
Available from Phase 5 onwards

##### Parameters

###### name

`string`

Name for the preset

##### Returns

`void`

***

#### screenToWorld()

> **screenToWorld**(`screenPos`): \{ `x`: `number`; `y`: `number`; `z`: `number`; \} \| `null`

Defined in: [src/graphty-element.ts:1778](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1778)

Convert screen coordinates to world coordinates.

##### Parameters

###### screenPos

Position in screen space

###### x

`number`

###### y

`number`

##### Returns

\{ `x`: `number`; `y`: `number`; `z`: `number`; \} \| `null`

Position in world space, or null if not found

##### Since

1.5.0

##### Example

```typescript
const worldPos = element.screenToWorld({ x: 100, y: 200 });
if (worldPos) {
  console.log('World position:', worldPos);
}
```

***

#### selectNode()

> **selectNode**(`nodeId`): `boolean`

Defined in: [src/graphty-element.ts:1291](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1291)

Select a node by its ID.

##### Parameters

###### nodeId

The ID of the node to select

`string` | `number`

##### Returns

`boolean`

True if the node was found and selected, false otherwise

##### Since

1.5.0

##### Example

```typescript
if (element.selectNode('node-1')) {
  console.log('Node selected');
}
```

***

#### setCameraMode()

> **setCameraMode**(`mode`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1922](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1922)

Set the camera mode.

##### Parameters

###### mode

`CameraKey`

Camera mode key

###### options?

`QueueableOptions`

Queue options

##### Returns

`Promise`\<`void`\>

Promise that resolves when camera mode is set

##### Since

1.5.0

***

#### setCameraPan()

> **setCameraPan**(`pan`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:926](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L926)

Set camera pan (2D)

##### Parameters

###### pan

Pan position \{x, y\}

###### x

`number`

###### y

`number`

###### options?

`CameraAnimationOptions`

Animation options

##### Returns

`Promise`\<`void`\>

Promise that resolves when the pan is applied (or animation completes)

***

#### setCameraPosition()

> **setCameraPosition**(`position`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:887](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L887)

Set camera position (3D)

##### Parameters

###### position

Target position \{x, y, z\}

###### x

`number`

###### y

`number`

###### z

`number`

###### options?

`CameraAnimationOptions`

Animation options

##### Returns

`Promise`\<`void`\>

Promise that resolves when the position is applied (or animation completes)

***

#### setCameraState()

> **setCameraState**(`state`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:874](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L874)

Set camera state (supports both 2D and 3D)

##### Parameters

###### state

Camera state to apply or preset name

`CameraState` | \{ `preset`: `string`; \}

###### options?

`CameraAnimationOptions`

Animation options

##### Returns

`Promise`\<`void`\>

Promise that resolves when the camera state is applied (or animation completes)

***

#### setCameraTarget()

> **setCameraTarget**(`target`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:900](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L900)

Set camera target (3D)

##### Parameters

###### target

Target point to look at \{x, y, z\}

###### x

`number`

###### y

`number`

###### z

`number`

###### options?

`CameraAnimationOptions`

Animation options

##### Returns

`Promise`\<`void`\>

Promise that resolves when the target is applied (or animation completes)

***

#### setCameraZoom()

> **setCameraZoom**(`zoom`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:913](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L913)

Set camera zoom (2D)

##### Parameters

###### zoom

`number`

Zoom level

###### options?

`CameraAnimationOptions`

Animation options

##### Returns

`Promise`\<`void`\>

Promise that resolves when the zoom is applied (or animation completes)

***

#### setData()

> **setData**(`data`): `void`

Defined in: [src/graphty-element.ts:1800](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1800)

Set graph data (both nodes and edges) at once.

##### Parameters

###### data

Object containing nodes and edges arrays

###### edges

`Record`\<`string`, `unknown`\>[]

###### nodes

`Record`\<`string`, `unknown`\>[]

##### Returns

`void`

##### Since

1.5.0

##### Example

```typescript
element.setData({
  nodes: [{ id: 'a' }, { id: 'b' }],
  edges: [{ source: 'a', target: 'b' }]
});
```

***

#### setInputEnabled()

> **setInputEnabled**(`enabled`): `void`

Defined in: [src/graphty-element.ts:1698](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1698)

Enable or disable user input.

##### Parameters

###### enabled

`boolean`

Whether input should be enabled

##### Returns

`void`

##### Since

1.5.0

##### Example

```typescript
element.setInputEnabled(false); // Disable interaction
```

***

#### setLayout()

> **setLayout**(`type`, `opts?`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1476](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1476)

Set the layout algorithm.

##### Parameters

###### type

`string`

Layout algorithm name

###### opts?

`object`

Layout-specific options

###### options?

`QueueableOptions`

Queue options

##### Returns

`Promise`\<`void`\>

Promise that resolves when layout is initialized

##### Since

1.5.0

##### Example

```typescript
await element.setLayout('circular', { radius: 5 });
await element.setLayout('ngraph', { springLength: 100 });
```

***

#### setRenderSettings()

> **setRenderSettings**(`settings`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1947](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1947)

Set render settings for advanced rendering control.

##### Parameters

###### settings

`Record`\<`string`, `unknown`\>

Render settings object

###### options?

`QueueableOptions`

Queue options

##### Returns

`Promise`\<`void`\>

Promise that resolves when settings are applied

##### Since

1.5.0

***

#### setStyleTemplate()

> **setStyleTemplate**(`template`, `options?`): `Promise`\<[`Styles`](../../Styles/classes/Styles.md)\>

Defined in: [src/graphty-element.ts:1431](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1431)

Set the style template.

##### Parameters

###### template

Style template configuration

###### behavior

\{ `fetchEdges?`: `Function`; `fetchNodes?`: `Function`; `layout`: \{ `minDelta`: `number`; `preSteps`: `number`; `stepMultiplier`: `number`; `type`: `string`; `zoomStepInterval`: `number`; \}; `node`: \{ `pinOnDrag`: `boolean`; \}; \} = `...`

###### behavior.fetchEdges?

`Function` = `...`

###### behavior.fetchNodes?

`Function` = `...`

###### behavior.layout

\{ `minDelta`: `number`; `preSteps`: `number`; `stepMultiplier`: `number`; `type`: `string`; `zoomStepInterval`: `number`; \} = `...`

###### behavior.layout.minDelta

`number` = `...`

###### behavior.layout.preSteps

`number` = `...`

###### behavior.layout.stepMultiplier

`number` = `...`

###### behavior.layout.type

`string` = `...`

###### behavior.layout.zoomStepInterval

`number` = `...`

###### behavior.node

\{ `pinOnDrag`: `boolean`; \} = `NodeBehaviorOpts`

###### behavior.node.pinOnDrag

`boolean` = `...`

###### data

\{ `algorithms?`: `string`[]; `knownFields`: \{ `edgeDstIdPath`: `string`; `edgeSrcIdPath`: `string`; `edgeTimePath`: `string` \| `null`; `edgeWeightPath`: `string` \| `null`; `nodeIdPath`: `string`; `nodeTimePath`: `string` \| `null`; `nodeWeightPath`: `string` \| `null`; \}; \} = `...`

###### data.algorithms?

`string`[] = `...`

###### data.knownFields

\{ `edgeDstIdPath`: `string`; `edgeSrcIdPath`: `string`; `edgeTimePath`: `string` \| `null`; `edgeWeightPath`: `string` \| `null`; `nodeIdPath`: `string`; `nodeTimePath`: `string` \| `null`; `nodeWeightPath`: `string` \| `null`; \} = `...`

###### data.knownFields.edgeDstIdPath

`string` = `...`

###### data.knownFields.edgeSrcIdPath

`string` = `...`

###### data.knownFields.edgeTimePath

`string` \| `null` = `...`

###### data.knownFields.edgeWeightPath

`string` \| `null` = `...`

###### data.knownFields.nodeIdPath

`string` = `...`

###### data.knownFields.nodeTimePath

`string` \| `null` = `...`

###### data.knownFields.nodeWeightPath

`string` \| `null` = `...`

###### graph

\{ `addDefaultStyle`: `boolean`; `background`: \{ `backgroundType`: `"color"`; `color`: `string` \| `undefined`; \} \| \{ `backgroundType`: `"skybox"`; `data`: `string`; \}; `effects?`: \{ `depthOfField?`: `number`; `motionBlur?`: `number`; `screenSpaceReflections?`: `boolean`; \}; `layout?`: `string`; `layoutOptions?`: \{\[`key`: `string`\]: `unknown`; \}; `startingCameraDistance`: `number`; `twoD`: `boolean`; `viewMode`: `"2d"` \| `"3d"` \| `"ar"` \| `"vr"`; \} = `...`

###### graph.addDefaultStyle

`boolean` = `...`

###### graph.background

\{ `backgroundType`: `"color"`; `color`: `string` \| `undefined`; \} \| \{ `backgroundType`: `"skybox"`; `data`: `string`; \} = `...`

###### graph.effects?

\{ `depthOfField?`: `number`; `motionBlur?`: `number`; `screenSpaceReflections?`: `boolean`; \} = `...`

###### graph.effects.depthOfField?

`number` = `...`

###### graph.effects.motionBlur?

`number` = `...`

###### graph.effects.screenSpaceReflections?

`boolean` = `...`

###### graph.layout?

`string` = `...`

###### graph.layoutOptions?

\{\[`key`: `string`\]: `unknown`; \} = `...`

###### graph.startingCameraDistance

`number` = `...`

###### graph.twoD

`boolean` = `...`

**Deprecated**

Use viewMode instead. twoD: true is equivalent to viewMode: "2d"

###### graph.viewMode

`"2d"` \| `"3d"` \| `"ar"` \| `"vr"` = `...`

View mode controls how the graph is rendered and displayed.
- "2d": Orthographic camera, fixed top-down view
- "3d": Perspective camera with orbit controls (default)
- "ar": Augmented reality mode using WebXR
- "vr": Virtual reality mode using WebXR

###### graphtyTemplate

`true` = `...`

###### layers

`object`[] = `...`

###### majorVersion

`"1"` = `...`

###### metadata?

\{ `templateCreationTimestamp?`: `string`; `templateCreator?`: `string`; `templateModificationTimestamp?`: `string`; `templateName?`: `string`; \} = `...`

###### metadata.templateCreationTimestamp?

`string` = `...`

###### metadata.templateCreator?

`string` = `...`

###### metadata.templateModificationTimestamp?

`string` = `...`

###### metadata.templateName?

`string` = `...`

###### options?

`QueueableOptions`

Queue options

##### Returns

`Promise`\<[`Styles`](../../Styles/classes/Styles.md)\>

Promise that resolves with the applied styles

##### Since

1.5.0

##### Example

```typescript
await element.setStyleTemplate({
  node: { color: '#ff6600', size: 1.5 }
});
```

***

#### setViewMode()

> **setViewMode**(`mode`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:806](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L806)

Set the view mode.
Changes the rendering dimension and camera system.

##### Parameters

###### mode

The view mode to set ("2d", "3d", "ar", or "vr")

`"2d"` | `"3d"` | `"ar"` | `"vr"`

##### Returns

`Promise`\<`void`\>

Promise that resolves when the mode switch is complete

##### Example

```typescript
// Switch to 2D orthographic view
await element.setViewMode("2d");

// Switch to VR mode
await element.setViewMode("vr");
```

***

#### setXRConfig()

> **setXRConfig**(`config`): `void`

Defined in: [src/graphty-element.ts:1633](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1633)

Set XR (VR/AR) configuration.

##### Parameters

###### config

XR configuration

\{ `ar?`: \{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \}; `enabled?`: `boolean`; `input?`: \{ `controllers?`: `boolean`; `enableZAmplificationInDesktop?`: `boolean`; `handTracking?`: `boolean`; `nearInteraction?`: `boolean`; `physics?`: `boolean`; `zAxisAmplification?`: `number`; \}; `teleportation?`: \{ `easeTime?`: `number`; `enabled?`: `boolean`; \}; `ui?`: \{ `enabled?`: `boolean`; `position?`: `"top-right"` \| `"top-left"` \| `"bottom-left"` \| `"bottom-right"`; `showAvailabilityWarning?`: `boolean`; `unavailableMessageDuration?`: `number`; \}; `vr?`: \{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \}; \}

XR configuration

###### ar?

\{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \} = `...`

AR mode configuration

###### ar.enabled?

`boolean` = `...`

Enable AR mode

**Default**

```ts
true
```

###### ar.optionalFeatures?

`string`[] = `...`

Optional WebXR features to request

**Default**

```ts
["hit-test"]
```

###### ar.referenceSpaceType?

`"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"` = `...`

WebXR reference space type for AR

**Default**

```ts
"local-floor"
```

###### enabled?

`boolean` = `...`

Enable/disable XR functionality globally

**Default**

```ts
true
```

###### input?

\{ `controllers?`: `boolean`; `enableZAmplificationInDesktop?`: `boolean`; `handTracking?`: `boolean`; `nearInteraction?`: `boolean`; `physics?`: `boolean`; `zAxisAmplification?`: `number`; \} = `...`

XR input and interaction configuration

###### input.controllers?

`boolean` = `...`

Enable motion controllers

**Default**

```ts
true
```

###### input.enableZAmplificationInDesktop?

`boolean` = `...`

Enable Z-axis amplification in desktop mode
Normally amplification only applies in XR mode, but this can enable it for desktop too

**Default**

```ts
false
```

###### input.handTracking?

`boolean` = `...`

Enable hand tracking

**Default**

```ts
true
```

###### input.nearInteraction?

`boolean` = `...`

Enable near interaction (touch/grab)

**Default**

```ts
true
```

###### input.physics?

`boolean` = `...`

Enable physics-based interactions

**Default**

```ts
false
```

###### input.zAxisAmplification?

`number` = `...`

Z-axis movement amplification factor
Multiplies Z-axis delta during drag to make depth manipulation practical in VR

Example: With zAxisAmplification = 10, moving controller 0.1 units in Z
will move the node 1.0 units in Z

**Default**

```ts
10.0
```

###### teleportation?

\{ `easeTime?`: `number`; `enabled?`: `boolean`; \} = `...`

Teleportation configuration

###### teleportation.easeTime?

`number` = `...`

Teleportation animation duration (ms)

**Default**

```ts
200
```

###### teleportation.enabled?

`boolean` = `...`

Enable teleportation system

**Default**

```ts
false
```

###### ui?

\{ `enabled?`: `boolean`; `position?`: `"top-right"` \| `"top-left"` \| `"bottom-left"` \| `"bottom-right"`; `showAvailabilityWarning?`: `boolean`; `unavailableMessageDuration?`: `number`; \} = `...`

XR UI button configuration

###### ui.enabled?

`boolean` = `...`

Show VR/AR entry buttons

**Default**

```ts
true
```

###### ui.position?

`"top-right"` \| `"top-left"` \| `"bottom-left"` \| `"bottom-right"` = `...`

Button position on screen

**Default**

```ts
"bottom-right"
```

###### ui.showAvailabilityWarning?

`boolean` = `...`

Show "VR / AR NOT AVAILABLE" warning when XR is not available
When false, no message is displayed if AR/VR aren't available

**Default**

```ts
false
```

###### ui.unavailableMessageDuration?

`number` = `...`

Duration to show "not available" message (ms)

**Default**

```ts
5000
```

###### vr?

\{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \} = `...`

VR mode configuration

###### vr.enabled?

`boolean` = `...`

Enable VR mode

**Default**

```ts
true
```

###### vr.optionalFeatures?

`string`[] = `...`

Optional WebXR features to request

**Default**

```ts
[]
```

###### vr.referenceSpaceType?

`"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"` = `...`

WebXR reference space type for VR
- "local": Seated/standing experience, no room bounds
- "local-floor": Floor-level origin, no room bounds
- "bounded-floor": Room-scale with bounds
- "unbounded": Unlimited tracking space

**Default**

```ts
"local-floor"
```

| `undefined`

##### Returns

`void`

##### Since

1.5.0

##### Example

```typescript
element.setXRConfig({
  enabled: true,
  ui: { enabled: true, position: 'bottom-right' }
});
```

***

#### shutdown()

> **shutdown**(): `void`

Defined in: [src/graphty-element.ts:1716](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1716)

Shut down the graph and release resources.

##### Returns

`void`

##### Since

1.5.0

##### Example

```typescript
element.shutdown();
```

***

#### startVoiceInput()

> **startVoiceInput**(`options?`): `boolean`

Defined in: [src/graphty-element.ts:2153](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L2153)

Start voice input for AI commands.

##### Parameters

###### options?

Voice input options

###### continuous?

`boolean`

###### interimResults?

`boolean`

###### language?

`string`

###### onStart?

(`started`, `error?`) => `void`

###### onTranscript?

(`text`, `isFinal`) => `void`

##### Returns

`boolean`

True if voice input started successfully

##### Since

1.5.0

##### Example

```typescript
const started = element.startVoiceInput({
  onTranscript: (text, isFinal) => {
    if (isFinal) element.aiCommand(text);
  },
  onStart: (started) => console.log('Voice started:', started)
});
```

***

#### stopVoiceInput()

> **stopVoiceInput**(): `void`

Defined in: [src/graphty-element.ts:2168](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L2168)

Stop voice input.

##### Returns

`void`

##### Since

1.5.0

***

#### updateNodes()

> **updateNodes**(`updates`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1132](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1132)

Update node data.

##### Parameters

###### updates

`object`[]

Array of update objects with id and properties to update

###### options?

`QueueableOptions`

Queue options for operation ordering

##### Returns

`Promise`\<`void`\>

Promise that resolves when nodes are updated

##### Since

1.5.0

##### Example

```typescript
await element.updateNodes([
  { id: 'node-1', label: 'Updated Label' }
]);
```

***

#### waitForSettled()

> **waitForSettled**(): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:1516](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1516)

Wait for all operations to complete and layout to stabilize.

##### Returns

`Promise`\<`void`\>

Promise that resolves when all operations are complete

##### Since

1.5.0

##### Example

```typescript
await element.addNodes(nodes);
await element.waitForSettled();
console.log('Graph is ready');
```

***

#### worldToScreen()

> **worldToScreen**(`worldPos`): `object`

Defined in: [src/graphty-element.ts:1759](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1759)

Convert world coordinates to screen coordinates.

##### Parameters

###### worldPos

Position in world space

###### x

`number`

###### y

`number`

###### z

`number`

##### Returns

`object`

Position in screen space

###### x

> **x**: `number`

###### y

> **y**: `number`

##### Since

1.5.0

##### Example

```typescript
const node = element.getNode('node-1');
const screenPos = element.worldToScreen({
  x: node.mesh.position.x,
  y: node.mesh.position.y,
  z: node.mesh.position.z
});
// Position a tooltip at screenPos
```

***

#### zoomToFit()

> **zoomToFit**(): `void`

Defined in: [src/graphty-element.ts:1499](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L1499)

Zoom the camera to fit all nodes in view.

##### Returns

`void`

##### Since

1.5.0

##### Example

```typescript
await element.waitForSettled();
element.zoomToFit();
```

### lifecycle

#### connectedCallback()

> **connectedCallback**(): `void`

Defined in: [src/graphty-element.ts:34](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L34)

Invoked when the component is added to the document's DOM.

In `connectedCallback()` you should setup tasks that should only occur when
the element is connected to the document. The most common of these is
adding event listeners to nodes external to the element, like a keydown
event handler added to the window.

```ts
connectedCallback() {
  super.connectedCallback();
  addEventListener('keydown', this._handleKeydown);
}
```

Typically, anything done in `connectedCallback()` should be undone when the
element is disconnected, in `disconnectedCallback()`.

##### Returns

`void`

##### Overrides

`LitElement.connectedCallback`

***

#### disconnectedCallback()

> **disconnectedCallback**(): `void`

Defined in: [src/graphty-element.ts:117](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L117)

Invoked when the component is removed from the document's DOM.

This callback is the main signal to the element that it may no longer be
used. `disconnectedCallback()` should ensure that nothing is holding a
reference to the element (such as event listeners added to nodes external
to the element), so that it is free to be garbage collected.

```ts
disconnectedCallback() {
  super.disconnectedCallback();
  window.removeEventListener('keydown', this._handleKeydown);
}
```

An element may be re-connected after being disconnected.

##### Returns

`void`

##### Overrides

`LitElement.disconnectedCallback`

### rendering

#### render()

> **render**(): `Element`

Defined in: [src/graphty-element.ts:113](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L113)

Invoked on each update to perform rendering tasks. This method may return
any value renderable by lit-html's `ChildPart` - typically a
`TemplateResult`. Setting properties inside this method will *not* trigger
the element to update.

##### Returns

`Element`

##### Overrides

`LitElement.render`

### updates

#### firstUpdated()

> **firstUpdated**(`changedProperties`): `void`

Defined in: [src/graphty-element.ts:76](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/graphty-element.ts#L76)

Invoked when the element is first updated. Implement to perform one time
work on the element after update.

```ts
firstUpdated() {
  this.renderRoot.getElementById('my-text-area').focus();
}
```

Setting properties inside this method will trigger the element to update
again after this update cycle completes.

##### Parameters

###### changedProperties

`Map`\<`string`, `unknown`\>

##### Returns

`void`

##### Overrides

`LitElement.firstUpdated`
