[@graphty/graphty-element](../../index.md) / [managers](../index.md) / UpdateManager

# Class: UpdateManager

Defined in: [src/managers/UpdateManager.ts:37](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/UpdateManager.ts#L37)

Manages the update loop logic for the graph
Coordinates updates across nodes, edges, layout, and camera

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new UpdateManager**(`eventManager`, `statsManager`, `layoutManager`, `dataManager`, `styleManager`, `camera`, `graphContext`, `config`): `UpdateManager`

Defined in: [src/managers/UpdateManager.ts:57](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/UpdateManager.ts#L57)

Creates a new update manager

#### Parameters

##### eventManager

[`EventManager`](EventManager.md)

Event manager for emitting update events

##### statsManager

[`StatsManager`](StatsManager.md)

Stats manager for performance tracking

##### layoutManager

[`LayoutManager`](LayoutManager.md)

Layout manager for graph layout

##### dataManager

[`DataManager`](DataManager.md)

Data manager for nodes and edges

##### styleManager

[`StyleManager`](StyleManager.md)

Style manager for styling

##### camera

`CameraManager`

Camera manager for view control

##### graphContext

[`GraphContext`](../interfaces/GraphContext.md)

Graph context for accessing shared resources

##### config

[`UpdateManagerConfig`](../interfaces/UpdateManagerConfig.md) = `{}`

Optional configuration

#### Returns

`UpdateManager`

## Accessors

### zoomToFitCompleted

#### Get Signature

> **get** **zoomToFitCompleted**(): `boolean`

Defined in: [src/managers/UpdateManager.ts:409](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/UpdateManager.ts#L409)

Check if zoom to fit has been completed

##### Returns

`boolean`

True if zoom to fit has completed at least once

## Methods

### disableZoomToFit()

> **disableZoomToFit**(): `void`

Defined in: [src/managers/UpdateManager.ts:107](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/UpdateManager.ts#L107)

Disable zoom to fit

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/UpdateManager.ts:86](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/UpdateManager.ts#L86)

Dispose the update manager

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### enableZoomToFit()

> **enableZoomToFit**(): `void`

Defined in: [src/managers/UpdateManager.ts:93](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/UpdateManager.ts#L93)

Enable zoom to fit on next update

#### Returns

`void`

***

### getRenderFrameCount()

> **getRenderFrameCount**(): `number`

Defined in: [src/managers/UpdateManager.ts:123](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/UpdateManager.ts#L123)

Get the current render frame count

#### Returns

`number`

Total number of frames rendered

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/UpdateManager.ts:78](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/UpdateManager.ts#L78)

Initialize the update manager

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### isZoomToFitEnabled()

> **isZoomToFitEnabled**(): `boolean`

Defined in: [src/managers/UpdateManager.ts:115](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/UpdateManager.ts#L115)

Get current zoom to fit state

#### Returns

`boolean`

True if zoom to fit is enabled

***

### renderFixedFrames()

> **renderFixedFrames**(`count`): `void`

Defined in: [src/managers/UpdateManager.ts:132](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/UpdateManager.ts#L132)

Render a fixed number of frames (for testing)
This ensures deterministic rendering similar to Babylon.js testing approach

#### Parameters

##### count

`number`

Number of frames to render

#### Returns

`void`

***

### update()

> **update**(): `void`

Defined in: [src/managers/UpdateManager.ts:146](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/UpdateManager.ts#L146)

Update the graph for the current frame

#### Returns

`void`

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [src/managers/UpdateManager.ts:417](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/UpdateManager.ts#L417)

Update configuration

#### Parameters

##### config

`Partial`\<[`UpdateManagerConfig`](../interfaces/UpdateManagerConfig.md)\>

Partial configuration to merge

#### Returns

`void`
