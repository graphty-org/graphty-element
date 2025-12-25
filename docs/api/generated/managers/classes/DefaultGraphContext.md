[@graphty/graphty-element](../../index.md) / [managers](../index.md) / DefaultGraphContext

# Class: DefaultGraphContext

Defined in: [src/managers/GraphContext.ts:130](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/GraphContext.ts#L130)

Default implementation of GraphContext
This can be used by Graph to provide services to Node/Edge

## Implements

- [`GraphContext`](../interfaces/GraphContext.md)

## Constructors

### Constructor

> **new DefaultGraphContext**(`styleManager`, `dataManager`, `layoutManager`, `meshCache`, `scene`, `statsManager`, `config`, `rayUpdateNeeded`): `DefaultGraphContext`

Defined in: [src/managers/GraphContext.ts:142](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/GraphContext.ts#L142)

Creates an instance of DefaultGraphContext

#### Parameters

##### styleManager

[`StyleManager`](StyleManager.md)

StyleManager instance for style operations

##### dataManager

[`DataManager`](DataManager.md)

DataManager instance for node/edge operations

##### layoutManager

[`LayoutManager`](LayoutManager.md)

LayoutManager instance for layout operations

##### meshCache

`MeshCache`

MeshCache instance for mesh creation and caching

##### scene

`Scene`

Babylon.js Scene instance

##### statsManager

[`StatsManager`](StatsManager.md)

StatsManager instance for performance monitoring

##### config

[`GraphContextConfig`](../interfaces/GraphContextConfig.md)

Graph-level configuration options

##### rayUpdateNeeded

`boolean` = `true`

Whether ray updates are needed for edge arrows

#### Returns

`DefaultGraphContext`

## Methods

### getConfig()

> **getConfig**(): [`GraphContextConfig`](../interfaces/GraphContextConfig.md)

Defined in: [src/managers/GraphContext.ts:232](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/GraphContext.ts#L232)

Get graph-level configuration options

#### Returns

[`GraphContextConfig`](../interfaces/GraphContextConfig.md)

GraphContextConfig instance

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`getConfig`](../interfaces/GraphContext.md#getconfig)

***

### getDataManager()

> **getDataManager**(): [`DataManager`](DataManager.md)

Defined in: [src/managers/GraphContext.ts:165](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/GraphContext.ts#L165)

Get the DataManager for node/edge operations

#### Returns

[`DataManager`](DataManager.md)

DataManager instance

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`getDataManager`](../interfaces/GraphContext.md#getdatamanager)

***

### getLayoutManager()

> **getLayoutManager**(): [`LayoutManager`](LayoutManager.md)

Defined in: [src/managers/GraphContext.ts:173](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/GraphContext.ts#L173)

Get the LayoutManager for layout operations

#### Returns

[`LayoutManager`](LayoutManager.md)

LayoutManager instance

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`getLayoutManager`](../interfaces/GraphContext.md#getlayoutmanager)

***

### getMeshCache()

> **getMeshCache**(): `MeshCache`

Defined in: [src/managers/GraphContext.ts:181](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/GraphContext.ts#L181)

Get the MeshCache for mesh creation and caching

#### Returns

`MeshCache`

MeshCache instance

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`getMeshCache`](../interfaces/GraphContext.md#getmeshcache)

***

### getScene()

> **getScene**(): `Scene`

Defined in: [src/managers/GraphContext.ts:189](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/GraphContext.ts#L189)

Get the Babylon.js Scene

#### Returns

`Scene`

Scene instance

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`getScene`](../interfaces/GraphContext.md#getscene)

***

### getStatsManager()

> **getStatsManager**(): [`StatsManager`](StatsManager.md)

Defined in: [src/managers/GraphContext.ts:197](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/GraphContext.ts#L197)

Get the StatsManager for performance monitoring

#### Returns

[`StatsManager`](StatsManager.md)

StatsManager instance

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`getStatsManager`](../interfaces/GraphContext.md#getstatsmanager)

***

### getStyleManager()

> **getStyleManager**(): [`StyleManager`](StyleManager.md)

Defined in: [src/managers/GraphContext.ts:157](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/GraphContext.ts#L157)

Get the StyleManager for style operations

#### Returns

[`StyleManager`](StyleManager.md)

StyleManager instance

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`getStyleManager`](../interfaces/GraphContext.md#getstylemanager)

***

### is2D()

> **is2D**(): `boolean`

Defined in: [src/managers/GraphContext.ts:205](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/GraphContext.ts#L205)

Check if the graph is in 2D mode

#### Returns

`boolean`

True if in 2D mode, false otherwise

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`is2D`](../interfaces/GraphContext.md#is2d)

***

### isRunning()

> **isRunning**(): `boolean`

Defined in: [src/managers/GraphContext.ts:248](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/GraphContext.ts#L248)

Check if the layout is running

#### Returns

`boolean`

True if layout is running, false otherwise

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`isRunning`](../interfaces/GraphContext.md#isrunning)

***

### needsRayUpdate()

> **needsRayUpdate**(): `boolean`

Defined in: [src/managers/GraphContext.ts:216](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/GraphContext.ts#L216)

Check if ray updates are needed for edge arrows

#### Returns

`boolean`

True if ray updates are needed, false otherwise

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`needsRayUpdate`](../interfaces/GraphContext.md#needsrayupdate)

***

### setRayUpdateNeeded()

> **setRayUpdateNeeded**(`needed`): `void`

Defined in: [src/managers/GraphContext.ts:224](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/GraphContext.ts#L224)

Set whether ray updates are needed for edge arrows

#### Parameters

##### needed

`boolean`

Whether ray updates are needed

#### Returns

`void`

***

### setRunning()

> **setRunning**(`running`): `void`

Defined in: [src/managers/GraphContext.ts:256](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/GraphContext.ts#L256)

Set the running state

#### Parameters

##### running

`boolean`

Whether layout should be running

#### Returns

`void`

#### Implementation of

[`GraphContext`](../interfaces/GraphContext.md).[`setRunning`](../interfaces/GraphContext.md#setrunning)

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [src/managers/GraphContext.ts:240](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/GraphContext.ts#L240)

Update configuration

#### Parameters

##### config

`Partial`\<[`GraphContextConfig`](../interfaces/GraphContextConfig.md)\>

Partial configuration to merge with existing config

#### Returns

`void`
