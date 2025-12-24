[@graphty/graphty-element](../../index.md) / [managers](../index.md) / GraphContext

# Interface: GraphContext

Defined in: [src/managers/GraphContext.ts:17](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L17)

GraphContext provides controlled access to graph services
This interface allows Node and Edge classes to access required services
without direct dependency on the Graph class, eliminating circular dependencies

## Methods

### getConfig()

> **getConfig**(): [`GraphContextConfig`](GraphContextConfig.md)

Defined in: [src/managers/GraphContext.ts:61](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L61)

Get graph-level configuration options

#### Returns

[`GraphContextConfig`](GraphContextConfig.md)

***

### getDataManager()

> **getDataManager**(): [`DataManager`](../classes/DataManager.md)

Defined in: [src/managers/GraphContext.ts:26](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L26)

Get the DataManager for node/edge operations

#### Returns

[`DataManager`](../classes/DataManager.md)

***

### getLayoutManager()

> **getLayoutManager**(): [`LayoutManager`](../classes/LayoutManager.md)

Defined in: [src/managers/GraphContext.ts:31](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L31)

Get the LayoutManager for layout operations

#### Returns

[`LayoutManager`](../classes/LayoutManager.md)

***

### getMeshCache()

> **getMeshCache**(): `MeshCache`

Defined in: [src/managers/GraphContext.ts:36](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L36)

Get the MeshCache for mesh creation and caching

#### Returns

`MeshCache`

***

### getScene()

> **getScene**(): `Scene`

Defined in: [src/managers/GraphContext.ts:41](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L41)

Get the Babylon.js Scene

#### Returns

`Scene`

***

### getSelectionManager()?

> `optional` **getSelectionManager**(): [`SelectionManager`](../classes/SelectionManager.md) \| `undefined`

Defined in: [src/managers/GraphContext.ts:89](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L89)

Get SelectionManager for node selection operations
Optional method for selection functionality

#### Returns

[`SelectionManager`](../classes/SelectionManager.md) \| `undefined`

***

### getStatsManager()

> **getStatsManager**(): [`StatsManager`](../classes/StatsManager.md)

Defined in: [src/managers/GraphContext.ts:46](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L46)

Get the StatsManager for performance monitoring

#### Returns

[`StatsManager`](../classes/StatsManager.md)

***

### getStyleManager()

> **getStyleManager**(): [`StyleManager`](../classes/StyleManager.md)

Defined in: [src/managers/GraphContext.ts:21](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L21)

Get the StyleManager for style operations

#### Returns

[`StyleManager`](../classes/StyleManager.md)

***

### getXRConfig()?

> `optional` **getXRConfig**(): [`XRConfig`](../../config/interfaces/XRConfig.md) \| `undefined`

Defined in: [src/managers/GraphContext.ts:77](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L77)

Get XR configuration
Optional method for XR-specific functionality

#### Returns

[`XRConfig`](../../config/interfaces/XRConfig.md) \| `undefined`

***

### getXRSessionManager()?

> `optional` **getXRSessionManager**(): `XRSessionManager` \| `undefined`

Defined in: [src/managers/GraphContext.ts:83](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L83)

Get XR session manager
Optional method for XR-specific functionality

#### Returns

`XRSessionManager` \| `undefined`

***

### is2D()

> **is2D**(): `boolean`

Defined in: [src/managers/GraphContext.ts:51](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L51)

Check if the graph is in 2D mode

#### Returns

`boolean`

***

### isRunning()

> **isRunning**(): `boolean`

Defined in: [src/managers/GraphContext.ts:66](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L66)

Check if the layout is running

#### Returns

`boolean`

***

### needsRayUpdate()

> **needsRayUpdate**(): `boolean`

Defined in: [src/managers/GraphContext.ts:56](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L56)

Check if ray updates are needed (for edge arrows)

#### Returns

`boolean`

***

### setRunning()

> **setRunning**(`running`): `void`

Defined in: [src/managers/GraphContext.ts:71](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L71)

Set the running state

#### Parameters

##### running

`boolean`

#### Returns

`void`
