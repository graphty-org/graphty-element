[@graphty/graphty-element](../../index.md) / [managers](../index.md) / DefaultGraphContext

# Class: DefaultGraphContext

Defined in: [src/managers/GraphContext.ts:122](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L122)

Default implementation of GraphContext
This can be used by Graph to provide services to Node/Edge

## Implements

- [`GraphContext`](../interfaces/GraphContext.md)

## Constructors

### Constructor

> **new DefaultGraphContext**(`styleManager`, `dataManager`, `layoutManager`, `meshCache`, `scene`, `statsManager`, `config`, `rayUpdateNeeded`): `DefaultGraphContext`

Defined in: [src/managers/GraphContext.ts:123](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L123)

#### Parameters

##### styleManager

[`StyleManager`](StyleManager.md)

##### dataManager

[`DataManager`](DataManager.md)

##### layoutManager

[`LayoutManager`](LayoutManager.md)

##### meshCache

`MeshCache`

##### scene

`Scene`

##### statsManager

[`StatsManager`](StatsManager.md)

##### config

[`GraphContextConfig`](../interfaces/GraphContextConfig.md)

##### rayUpdateNeeded

`boolean` = `true`

#### Returns

`DefaultGraphContext`

## Methods

### getConfig()

> **getConfig**(): [`GraphContextConfig`](../interfaces/GraphContextConfig.md)

Defined in: [src/managers/GraphContext.ts:173](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L173)

Get graph-level configuration options

#### Returns

[`GraphContextConfig`](../interfaces/GraphContextConfig.md)

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`getConfig`](../interfaces/GraphContext.md#getconfig)

***

### getDataManager()

> **getDataManager**(): [`DataManager`](DataManager.md)

Defined in: [src/managers/GraphContext.ts:138](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L138)

Get the DataManager for node/edge operations

#### Returns

[`DataManager`](DataManager.md)

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`getDataManager`](../interfaces/GraphContext.md#getdatamanager)

***

### getLayoutManager()

> **getLayoutManager**(): [`LayoutManager`](LayoutManager.md)

Defined in: [src/managers/GraphContext.ts:142](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L142)

Get the LayoutManager for layout operations

#### Returns

[`LayoutManager`](LayoutManager.md)

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`getLayoutManager`](../interfaces/GraphContext.md#getlayoutmanager)

***

### getMeshCache()

> **getMeshCache**(): `MeshCache`

Defined in: [src/managers/GraphContext.ts:146](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L146)

Get the MeshCache for mesh creation and caching

#### Returns

`MeshCache`

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`getMeshCache`](../interfaces/GraphContext.md#getmeshcache)

***

### getScene()

> **getScene**(): `Scene`

Defined in: [src/managers/GraphContext.ts:150](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L150)

Get the Babylon.js Scene

#### Returns

`Scene`

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`getScene`](../interfaces/GraphContext.md#getscene)

***

### getStatsManager()

> **getStatsManager**(): [`StatsManager`](StatsManager.md)

Defined in: [src/managers/GraphContext.ts:154](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L154)

Get the StatsManager for performance monitoring

#### Returns

[`StatsManager`](StatsManager.md)

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`getStatsManager`](../interfaces/GraphContext.md#getstatsmanager)

***

### getStyleManager()

> **getStyleManager**(): [`StyleManager`](StyleManager.md)

Defined in: [src/managers/GraphContext.ts:134](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L134)

Get the StyleManager for style operations

#### Returns

[`StyleManager`](StyleManager.md)

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`getStyleManager`](../interfaces/GraphContext.md#getstylemanager)

***

### is2D()

> **is2D**(): `boolean`

Defined in: [src/managers/GraphContext.ts:158](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L158)

Check if the graph is in 2D mode

#### Returns

`boolean`

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`is2D`](../interfaces/GraphContext.md#is2d)

***

### isRunning()

> **isRunning**(): `boolean`

Defined in: [src/managers/GraphContext.ts:184](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L184)

Check if the layout is running

#### Returns

`boolean`

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`isRunning`](../interfaces/GraphContext.md#isrunning)

***

### needsRayUpdate()

> **needsRayUpdate**(): `boolean`

Defined in: [src/managers/GraphContext.ts:165](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L165)

Check if ray updates are needed (for edge arrows)

#### Returns

`boolean`

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`needsRayUpdate`](../interfaces/GraphContext.md#needsrayupdate)

***

### setRayUpdateNeeded()

> **setRayUpdateNeeded**(`needed`): `void`

Defined in: [src/managers/GraphContext.ts:169](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L169)

#### Parameters

##### needed

`boolean`

#### Returns

`void`

***

### setRunning()

> **setRunning**(`running`): `void`

Defined in: [src/managers/GraphContext.ts:188](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L188)

Set the running state

#### Parameters

##### running

`boolean`

#### Returns

`void`

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`setRunning`](../interfaces/GraphContext.md#setrunning)

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [src/managers/GraphContext.ts:180](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/GraphContext.ts#L180)

Update configuration

#### Parameters

##### config

`Partial`\<[`GraphContextConfig`](../interfaces/GraphContextConfig.md)\>

#### Returns

`void`
