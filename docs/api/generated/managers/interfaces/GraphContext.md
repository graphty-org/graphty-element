[@graphty/graphty-element](../../index.md) / [managers](../index.md) / GraphContext

# Interface: GraphContext

Defined in: [src/managers/GraphContext.ts:18](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L18)

GraphContext provides controlled access to graph services
This interface allows Node and Edge classes to access required services
without direct dependency on the Graph class, eliminating circular dependencies

## Methods

### getConfig()

> **getConfig**(): [`GraphContextConfig`](GraphContextConfig.md)

Defined in: [src/managers/GraphContext.ts:62](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L62)

Get graph-level configuration options

#### Returns

[`GraphContextConfig`](GraphContextConfig.md)

***

### getDataManager()

> **getDataManager**(): [`DataManager`](../classes/DataManager.md)

Defined in: [src/managers/GraphContext.ts:27](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L27)

Get the DataManager for node/edge operations

#### Returns

[`DataManager`](../classes/DataManager.md)

***

### getEventManager()?

> `optional` **getEventManager**(): [`EventManager`](../classes/EventManager.md) \| `undefined`

Defined in: [src/managers/GraphContext.ts:97](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L97)

Get EventManager for emitting events
Optional method for event emission

#### Returns

[`EventManager`](../classes/EventManager.md) \| `undefined`

#### Since

1.5.0

***

### getLayoutManager()

> **getLayoutManager**(): [`LayoutManager`](../classes/LayoutManager.md)

Defined in: [src/managers/GraphContext.ts:32](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L32)

Get the LayoutManager for layout operations

#### Returns

[`LayoutManager`](../classes/LayoutManager.md)

***

### getMeshCache()

> **getMeshCache**(): `MeshCache`

Defined in: [src/managers/GraphContext.ts:37](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L37)

Get the MeshCache for mesh creation and caching

#### Returns

`MeshCache`

***

### getScene()

> **getScene**(): `Scene`

Defined in: [src/managers/GraphContext.ts:42](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L42)

Get the Babylon.js Scene

#### Returns

`Scene`

***

### getSelectionManager()?

> `optional` **getSelectionManager**(): [`SelectionManager`](../classes/SelectionManager.md) \| `undefined`

Defined in: [src/managers/GraphContext.ts:90](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L90)

Get SelectionManager for node selection operations
Optional method for selection functionality

#### Returns

[`SelectionManager`](../classes/SelectionManager.md) \| `undefined`

***

### getStatsManager()

> **getStatsManager**(): [`StatsManager`](../classes/StatsManager.md)

Defined in: [src/managers/GraphContext.ts:47](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L47)

Get the StatsManager for performance monitoring

#### Returns

[`StatsManager`](../classes/StatsManager.md)

***

### getStyleManager()

> **getStyleManager**(): [`StyleManager`](../classes/StyleManager.md)

Defined in: [src/managers/GraphContext.ts:22](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L22)

Get the StyleManager for style operations

#### Returns

[`StyleManager`](../classes/StyleManager.md)

***

### getXRConfig()?

> `optional` **getXRConfig**(): [`XRConfig`](../../config/interfaces/XRConfig.md) \| `undefined`

Defined in: [src/managers/GraphContext.ts:78](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L78)

Get XR configuration
Optional method for XR-specific functionality

#### Returns

[`XRConfig`](../../config/interfaces/XRConfig.md) \| `undefined`

***

### getXRSessionManager()?

> `optional` **getXRSessionManager**(): `XRSessionManager` \| `undefined`

Defined in: [src/managers/GraphContext.ts:84](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L84)

Get XR session manager
Optional method for XR-specific functionality

#### Returns

`XRSessionManager` \| `undefined`

***

### is2D()

> **is2D**(): `boolean`

Defined in: [src/managers/GraphContext.ts:52](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L52)

Check if the graph is in 2D mode

#### Returns

`boolean`

***

### isRunning()

> **isRunning**(): `boolean`

Defined in: [src/managers/GraphContext.ts:67](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L67)

Check if the layout is running

#### Returns

`boolean`

***

### needsRayUpdate()

> **needsRayUpdate**(): `boolean`

Defined in: [src/managers/GraphContext.ts:57](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L57)

Check if ray updates are needed (for edge arrows)

#### Returns

`boolean`

***

### setRunning()

> **setRunning**(`running`): `void`

Defined in: [src/managers/GraphContext.ts:72](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/GraphContext.ts#L72)

Set the running state

#### Parameters

##### running

`boolean`

#### Returns

`void`
