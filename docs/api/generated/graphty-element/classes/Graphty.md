[@graphty/graphty-element](../../index.md) / [graphty-element](../index.md) / Graphty

# Class: Graphty

Defined in: [src/graphty-element.ts:19](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L19)

Graphty creates a graph

## Extends

- `LitElement`

## Constructors

### Constructor

> **new Graphty**(): `Graphty`

Defined in: [src/graphty-element.ts:24](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L24)

#### Returns

`Graphty`

#### Overrides

`LitElement.constructor`

## Accessors

### dataSource

#### Get Signature

> **get** **dataSource**(): `string` \| `undefined`

Defined in: [src/graphty-element.ts:218](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L218)

The type of data source (e.g. "json"). See documentation for
data sources for more information.

##### Returns

`string` \| `undefined`

#### Set Signature

> **set** **dataSource**(`value`): `void`

Defined in: [src/graphty-element.ts:221](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L221)

##### Parameters

###### value

`string` | `undefined`

##### Returns

`void`

***

### dataSourceConfig

#### Get Signature

> **get** **dataSourceConfig**(): `Record`\<`string`, `unknown`\> \| `undefined`

Defined in: [src/graphty-element.ts:236](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L236)

The configuration for the data source. See documentation for
data sources for more information.

##### Returns

`Record`\<`string`, `unknown`\> \| `undefined`

#### Set Signature

> **set** **dataSourceConfig**(`value`): `void`

Defined in: [src/graphty-element.ts:239](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L239)

##### Parameters

###### value

`Record`\<`string`, `unknown`\> | `undefined`

##### Returns

`void`

***

### edgeData

#### Get Signature

> **get** **edgeData**(): `Record`\<`string`, `unknown`\>[] \| `undefined`

Defined in: [src/graphty-element.ts:198](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L198)

An array of objects describing the edge data.
The path to the source node ID and destination node ID are `src` and
`dst` (respectively) unless otherwise specified in `known-properties`.

##### Remarks

**Important**: Setting this property REPLACES all existing edges with the new data.
To add edges incrementally without replacing existing ones, use the
`graph.addEdges()` method instead.

##### Example

```typescript
// Replace all edges (this is what the property setter does)
element.edgeData = [{src: "1", dst: "2"}];

// Add edges incrementally (use the API method)
await element.graph.addEdges([{source: "2", target: "3"}], "source", "target");
```

##### Returns

`Record`\<`string`, `unknown`\>[] \| `undefined`

#### Set Signature

> **set** **edgeData**(`value`): `void`

Defined in: [src/graphty-element.ts:201](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L201)

##### Parameters

###### value

`Record`\<`string`, `unknown`\>[] | `undefined`

##### Returns

`void`

***

### edgeDstIdPath

#### Get Signature

> **get** **edgeDstIdPath**(): `string` \| `undefined`

Defined in: [src/graphty-element.ts:307](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L307)

Similar to the nodeIdPath property / node-id-path attribute, this is a
jmespath that describes where to find the desination node identifier for this edge.
Defaults to "dst", as in `{src: 42, dst: 31337}`

##### Returns

`string` \| `undefined`

#### Set Signature

> **set** **edgeDstIdPath**(`value`): `void`

Defined in: [src/graphty-element.ts:310](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L310)

##### Parameters

###### value

`string` | `undefined`

##### Returns

`void`

***

### edgeSrcIdPath

#### Get Signature

> **get** **edgeSrcIdPath**(): `string` \| `undefined`

Defined in: [src/graphty-element.ts:287](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L287)

Similar to the nodeIdPath property / node-id-path attribute, this is a
jmespath that describes where to find the source node identifier for this edge.
Defaults to "src", as in `{src: 42, dst: 31337}`

##### Returns

`string` \| `undefined`

#### Set Signature

> **set** **edgeSrcIdPath**(`value`): `void`

Defined in: [src/graphty-element.ts:290](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L290)

##### Parameters

###### value

`string` | `undefined`

##### Returns

`void`

***

### enableDetailedProfiling

#### Get Signature

> **get** **enableDetailedProfiling**(): `boolean` \| `undefined`

Defined in: [src/graphty-element.ts:472](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L472)

Enable detailed performance profiling.
When enabled, hierarchical timing and advanced statistics will be collected.
Access profiling data via graph.getStatsManager().getSnapshot() or
graph.getStatsManager().reportDetailed().

##### Returns

`boolean` \| `undefined`

#### Set Signature

> **set** **enableDetailedProfiling**(`value`): `void`

Defined in: [src/graphty-element.ts:475](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L475)

##### Parameters

###### value

`boolean` | `undefined`

##### Returns

`void`

***

### graph

#### Get Signature

> **get** **graph**(): [`Graph`](../../Graph/classes/Graph.md)

Defined in: [src/graphty-element.ts:905](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L905)

Get the underlying Graph instance for debugging purposes

##### Returns

[`Graph`](../../Graph/classes/Graph.md)

***

### layout

#### Get Signature

> **get** **layout**(): `string` \| `undefined`

Defined in: [src/graphty-element.ts:326](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L326)

Specifies which type of layout to use. See the layout documentation for
more information.

##### Returns

`string` \| `undefined`

#### Set Signature

> **set** **layout**(`value`): `void`

Defined in: [src/graphty-element.ts:329](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L329)

##### Parameters

###### value

`string` | `undefined`

##### Returns

`void`

***

### layout2d

#### Get Signature

> **get** **layout2d**(): `boolean` \| `undefined`

Defined in: [src/graphty-element.ts:401](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L401)

##### Deprecated

Use viewMode instead. layout2d: true is equivalent to viewMode: "2d"
Specifies that the layout should be rendered in two dimensions (as
opposed to 3D)

##### Returns

`boolean` \| `undefined`

#### Set Signature

> **set** **layout2d**(`value`): `void`

Defined in: [src/graphty-element.ts:413](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L413)

##### Parameters

###### value

`boolean` | `undefined`

##### Returns

`void`

***

### layoutConfig

#### Get Signature

> **get** **layoutConfig**(): `Record`\<`string`, `unknown`\> \| `undefined`

Defined in: [src/graphty-element.ts:348](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L348)

Specifies which type of layout to use. See the layout documentation for
more information.

##### Returns

`Record`\<`string`, `unknown`\> \| `undefined`

#### Set Signature

> **set** **layoutConfig**(`value`): `void`

Defined in: [src/graphty-element.ts:351](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L351)

##### Parameters

###### value

`Record`\<`string`, `unknown`\> | `undefined`

##### Returns

`void`

***

### nodeData

#### Get Signature

> **get** **nodeData**(): `Record`\<`string`, `unknown`\>[] \| `undefined`

Defined in: [src/graphty-element.ts:163](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L163)

An array of objects describing the node data.
The path to the unique ID for the node is `.id` unless
otherwise specified in `known-properties`.

##### Remarks

**Important**: Setting this property REPLACES all existing nodes with the new data.
To add nodes incrementally without replacing existing ones, use the
`graph.addNodes()` method instead.

##### Example

```typescript
// Replace all nodes (this is what the property setter does)
element.nodeData = [{id: "1"}, {id: "2"}];

// Add nodes incrementally (use the API method)
await element.graph.addNodes([{id: "3"}, {id: "4"}]);
```

##### Returns

`Record`\<`string`, `unknown`\>[] \| `undefined`

#### Set Signature

> **set** **nodeData**(`value`): `void`

Defined in: [src/graphty-element.ts:166](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L166)

##### Parameters

###### value

`Record`\<`string`, `unknown`\>[] | `undefined`

##### Returns

`void`

***

### nodeIdPath

#### Get Signature

> **get** **nodeIdPath**(): `string` \| `undefined`

Defined in: [src/graphty-element.ts:267](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L267)

A jmespath string that can be used to select the unique node identifier
for each node. Defaults to "id", as in `{id: 42}` is the identifier of
the node.

##### Returns

`string` \| `undefined`

#### Set Signature

> **set** **nodeIdPath**(`value`): `void`

Defined in: [src/graphty-element.ts:270](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L270)

##### Parameters

###### value

`string` | `undefined`

##### Returns

`void`

***

### runAlgorithmsOnLoad

#### Get Signature

> **get** **runAlgorithmsOnLoad**(): `boolean` \| `undefined`

Defined in: [src/graphty-element.ts:449](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L449)

Whether or not to run all algorithims in a style template when the
template is loaded

##### Returns

`boolean` \| `undefined`

#### Set Signature

> **set** **runAlgorithmsOnLoad**(`value`): `void`

Defined in: [src/graphty-element.ts:452](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L452)

##### Parameters

###### value

`boolean` | `undefined`

##### Returns

`void`

***

### styleTemplate

#### Get Signature

> **get** **styleTemplate**(): \{ `behavior`: \{ `fetchEdges?`: `Function`; `fetchNodes?`: `Function`; `layout`: \{ `minDelta`: `number`; `preSteps`: `number`; `stepMultiplier`: `number`; `type`: `string`; `zoomStepInterval`: `number`; \}; `node`: \{ `pinOnDrag`: `boolean`; \}; \}; `data`: \{ `algorithms?`: `string`[]; `knownFields`: \{ `edgeDstIdPath`: `string`; `edgeSrcIdPath`: `string`; `edgeTimePath`: `string` \| `null`; `edgeWeightPath`: `string` \| `null`; `nodeIdPath`: `string`; `nodeTimePath`: `string` \| `null`; `nodeWeightPath`: `string` \| `null`; \}; \}; `graph`: \{ `addDefaultStyle`: `boolean`; `background`: \{ `backgroundType`: `"color"`; `color`: `string` \| `undefined`; \} \| \{ `backgroundType`: `"skybox"`; `data`: `string`; \}; `effects?`: \{ `depthOfField?`: `number`; `motionBlur?`: `number`; `screenSpaceReflections?`: `boolean`; \}; `layout?`: `string`; `layoutOptions?`: \{\[`key`: `string`\]: `unknown`; \}; `startingCameraDistance`: `number`; `twoD`: `boolean`; `viewMode`: `"2d"` \| `"3d"` \| `"ar"` \| `"vr"`; \}; `graphtyTemplate`: `true`; `layers`: `object`[]; `majorVersion`: `"1"`; `metadata?`: \{ `templateCreationTimestamp?`: `string`; `templateCreator?`: `string`; `templateModificationTimestamp?`: `string`; `templateName?`: `string`; \}; \} \| `undefined`

Defined in: [src/graphty-element.ts:429](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L429)

Styles and configuration for the graph visualization

##### Returns

\{ `behavior`: \{ `fetchEdges?`: `Function`; `fetchNodes?`: `Function`; `layout`: \{ `minDelta`: `number`; `preSteps`: `number`; `stepMultiplier`: `number`; `type`: `string`; `zoomStepInterval`: `number`; \}; `node`: \{ `pinOnDrag`: `boolean`; \}; \}; `data`: \{ `algorithms?`: `string`[]; `knownFields`: \{ `edgeDstIdPath`: `string`; `edgeSrcIdPath`: `string`; `edgeTimePath`: `string` \| `null`; `edgeWeightPath`: `string` \| `null`; `nodeIdPath`: `string`; `nodeTimePath`: `string` \| `null`; `nodeWeightPath`: `string` \| `null`; \}; \}; `graph`: \{ `addDefaultStyle`: `boolean`; `background`: \{ `backgroundType`: `"color"`; `color`: `string` \| `undefined`; \} \| \{ `backgroundType`: `"skybox"`; `data`: `string`; \}; `effects?`: \{ `depthOfField?`: `number`; `motionBlur?`: `number`; `screenSpaceReflections?`: `boolean`; \}; `layout?`: `string`; `layoutOptions?`: \{\[`key`: `string`\]: `unknown`; \}; `startingCameraDistance`: `number`; `twoD`: `boolean`; `viewMode`: `"2d"` \| `"3d"` \| `"ar"` \| `"vr"`; \}; `graphtyTemplate`: `true`; `layers`: `object`[]; `majorVersion`: `"1"`; `metadata?`: \{ `templateCreationTimestamp?`: `string`; `templateCreator?`: `string`; `templateModificationTimestamp?`: `string`; `templateName?`: `string`; \}; \} \| `undefined`

#### Set Signature

> **set** **styleTemplate**(`value`): `void`

Defined in: [src/graphty-element.ts:432](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L432)

##### Parameters

###### value

\{ `behavior`: \{ `fetchEdges?`: `Function`; `fetchNodes?`: `Function`; `layout`: \{ `minDelta`: `number`; `preSteps`: `number`; `stepMultiplier`: `number`; `type`: `string`; `zoomStepInterval`: `number`; \}; `node`: \{ `pinOnDrag`: `boolean`; \}; \}; `data`: \{ `algorithms?`: `string`[]; `knownFields`: \{ `edgeDstIdPath`: `string`; `edgeSrcIdPath`: `string`; `edgeTimePath`: `string` \| `null`; `edgeWeightPath`: `string` \| `null`; `nodeIdPath`: `string`; `nodeTimePath`: `string` \| `null`; `nodeWeightPath`: `string` \| `null`; \}; \}; `graph`: \{ `addDefaultStyle`: `boolean`; `background`: \{ `backgroundType`: `"color"`; `color`: `string` \| `undefined`; \} \| \{ `backgroundType`: `"skybox"`; `data`: `string`; \}; `effects?`: \{ `depthOfField?`: `number`; `motionBlur?`: `number`; `screenSpaceReflections?`: `boolean`; \}; `layout?`: `string`; `layoutOptions?`: \{\[`key`: `string`\]: `unknown`; \}; `startingCameraDistance`: `number`; `twoD`: `boolean`; `viewMode`: `"2d"` \| `"3d"` \| `"ar"` \| `"vr"`; \}; `graphtyTemplate`: `true`; `layers`: `object`[]; `majorVersion`: `"1"`; `metadata?`: \{ `templateCreationTimestamp?`: `string`; `templateCreator?`: `string`; `templateModificationTimestamp?`: `string`; `templateName?`: `string`; \}; \} | `undefined`

##### Returns

`void`

***

### viewMode

#### Get Signature

> **get** **viewMode**(): `"2d"` \| `"3d"` \| `"ar"` \| `"vr"` \| `undefined`

Defined in: [src/graphty-element.ts:380](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L380)

View mode controls how the graph is rendered and displayed.
- "2d": Orthographic camera, fixed top-down view
- "3d": Perspective camera with orbit controls (default)
- "ar": Augmented reality mode using WebXR
- "vr": Virtual reality mode using WebXR

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

Defined in: [src/graphty-element.ts:383](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L383)

##### Parameters

###### value

`"2d"` | `"3d"` | `"ar"` | `"vr"` | `undefined`

##### Returns

`void`

***

### xr

#### Get Signature

> **get** **xr**(): \{ `ar?`: \{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \}; `enabled?`: `boolean`; `input?`: \{ `controllers?`: `boolean`; `enableZAmplificationInDesktop?`: `boolean`; `handTracking?`: `boolean`; `nearInteraction?`: `boolean`; `physics?`: `boolean`; `zAxisAmplification?`: `number`; \}; `teleportation?`: \{ `easeTime?`: `number`; `enabled?`: `boolean`; \}; `ui?`: \{ `enabled?`: `boolean`; `position?`: `"top-right"` \| `"top-left"` \| `"bottom-left"` \| `"bottom-right"`; `showAvailabilityWarning?`: `boolean`; `unavailableMessageDuration?`: `number`; \}; `vr?`: \{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \}; \} \| `undefined`

Defined in: [src/graphty-element.ts:507](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L507)

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

Defined in: [src/graphty-element.ts:510](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L510)

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

#### asyncFirstUpdated()

> **asyncFirstUpdated**(): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:86](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L86)

##### Returns

`Promise`\<`void`\>

***

#### canCaptureScreenshot()

> **canCaptureScreenshot**(`options?`): `Promise`\<`CapabilityCheck`\>

Defined in: [src/graphty-element.ts:573](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L573)

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

#### cancelAnimationCapture()

> **cancelAnimationCapture**(): `boolean`

Defined in: [src/graphty-element.ts:644](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L644)

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

Defined in: [src/graphty-element.ts:606](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L606)

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

Defined in: [src/graphty-element.ts:548](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L548)

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

#### estimateAnimationCapture()

> **estimateAnimationCapture**(`options`): `Promise`\<`CaptureEstimate`\>

Defined in: [src/graphty-element.ts:682](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L682)

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

#### exportCameraPresets()

> **exportCameraPresets**(): `Record`\<`string`, `CameraState`\>

Defined in: [src/graphty-element.ts:889](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L889)

Export user-defined presets as JSON
Available from Phase 5 onwards

##### Returns

`Record`\<`string`, `CameraState`\>

Record of user-defined preset names to their state

***

#### getCameraPresets()

> **getCameraPresets**(): `Record`\<`string`, `CameraState` \| \{ `builtin`: `true`; \}\>

Defined in: [src/graphty-element.ts:880](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L880)

Get all camera presets (built-in + user-defined)
Available from Phase 5 onwards

##### Returns

`Record`\<`string`, `CameraState` \| \{ `builtin`: `true`; \}\>

Record of preset names to their state (built-in presets are marked)

***

#### getCameraState()

> **getCameraState**(): `CameraState`

Defined in: [src/graphty-element.ts:778](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L778)

Get current camera state (supports both 2D and 3D)

##### Returns

`CameraState`

Current camera state including position, target, zoom, etc.

***

#### getViewMode()

> **getViewMode**(): `"2d"` \| `"3d"` \| `"ar"` \| `"vr"`

Defined in: [src/graphty-element.ts:700](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L700)

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

#### importCameraPresets()

> **importCameraPresets**(`presets`): `void`

Defined in: [src/graphty-element.ts:898](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L898)

Import user-defined presets from JSON
Available from Phase 5 onwards

##### Parameters

###### presets

`Record`\<`string`, `CameraState`\>

Record of preset names to their state

##### Returns

`void`

***

#### isAnimationCapturing()

> **isAnimationCapturing**(): `boolean`

Defined in: [src/graphty-element.ts:654](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L654)

Phase 7: Check if animation capture is in progress
Available from Phase 7 onwards.

##### Returns

`boolean`

true if a capture is currently running

***

#### isARSupported()

> **isARSupported**(): `Promise`\<`boolean`\>

Defined in: [src/graphty-element.ts:766](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L766)

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

#### isVRSupported()

> **isVRSupported**(): `Promise`\<`boolean`\>

Defined in: [src/graphty-element.ts:743](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L743)

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

#### loadCameraPreset()

> **loadCameraPreset**(`name`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:871](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L871)

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

#### resetCamera()

> **resetCamera**(`options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:852](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L852)

Reset camera to default position

##### Parameters

###### options?

`CameraAnimationOptions`

Animation options

##### Returns

`Promise`\<`void`\>

Promise that resolves when the reset is applied (or animation completes)

***

#### saveCameraPreset()

> **saveCameraPreset**(`name`): `void`

Defined in: [src/graphty-element.ts:861](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L861)

Save current camera state as a named preset
Available from Phase 5 onwards

##### Parameters

###### name

`string`

Name for the preset

##### Returns

`void`

***

#### setCameraPan()

> **setCameraPan**(`pan`, `options?`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:840](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L840)

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

Defined in: [src/graphty-element.ts:801](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L801)

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

Defined in: [src/graphty-element.ts:788](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L788)

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

Defined in: [src/graphty-element.ts:814](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L814)

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

Defined in: [src/graphty-element.ts:827](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L827)

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

#### setViewMode()

> **setViewMode**(`mode`): `Promise`\<`void`\>

Defined in: [src/graphty-element.ts:720](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L720)

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

### lifecycle

#### connectedCallback()

> **connectedCallback**(): `void`

Defined in: [src/graphty-element.ts:34](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L34)

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

Defined in: [src/graphty-element.ts:117](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L117)

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

Defined in: [src/graphty-element.ts:113](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L113)

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

Defined in: [src/graphty-element.ts:76](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/graphty-element.ts#L76)

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
