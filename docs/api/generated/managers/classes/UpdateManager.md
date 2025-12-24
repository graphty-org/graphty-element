[@graphty/graphty-element](../../index.md) / [managers](../index.md) / UpdateManager

# Class: UpdateManager

Defined in: [src/managers/UpdateManager.ts:37](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/UpdateManager.ts#L37)

Manages the update loop logic for the graph
Coordinates updates across nodes, edges, layout, and camera

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new UpdateManager**(`eventManager`, `statsManager`, `layoutManager`, `dataManager`, `styleManager`, `camera`, `graphContext`, `config`): `UpdateManager`

Defined in: [src/managers/UpdateManager.ts:46](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/UpdateManager.ts#L46)

#### Parameters

##### eventManager

[`EventManager`](EventManager.md)

##### statsManager

[`StatsManager`](StatsManager.md)

##### layoutManager

[`LayoutManager`](LayoutManager.md)

##### dataManager

[`DataManager`](DataManager.md)

##### styleManager

[`StyleManager`](StyleManager.md)

##### camera

`CameraManager`

##### graphContext

[`GraphContext`](../interfaces/GraphContext.md)

##### config

[`UpdateManagerConfig`](../interfaces/UpdateManagerConfig.md) = `{}`

#### Returns

`UpdateManager`

## Accessors

### zoomToFitCompleted

#### Get Signature

> **get** **zoomToFitCompleted**(): `boolean`

Defined in: [src/managers/UpdateManager.ts:371](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/UpdateManager.ts#L371)

Check if zoom to fit has been completed

##### Returns

`boolean`

## Methods

### disableZoomToFit()

> **disableZoomToFit**(): `void`

Defined in: [src/managers/UpdateManager.ts:89](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/UpdateManager.ts#L89)

Disable zoom to fit

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/UpdateManager.ts:68](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/UpdateManager.ts#L68)

Dispose of all resources held by the manager

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### enableZoomToFit()

> **enableZoomToFit**(): `void`

Defined in: [src/managers/UpdateManager.ts:75](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/UpdateManager.ts#L75)

Enable zoom to fit on next update

#### Returns

`void`

***

### getRenderFrameCount()

> **getRenderFrameCount**(): `number`

Defined in: [src/managers/UpdateManager.ts:103](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/UpdateManager.ts#L103)

Get the current render frame count

#### Returns

`number`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/UpdateManager.ts:63](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/UpdateManager.ts#L63)

Initialize the manager

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### isZoomToFitEnabled()

> **isZoomToFitEnabled**(): `boolean`

Defined in: [src/managers/UpdateManager.ts:96](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/UpdateManager.ts#L96)

Get current zoom to fit state

#### Returns

`boolean`

***

### renderFixedFrames()

> **renderFixedFrames**(`count`): `void`

Defined in: [src/managers/UpdateManager.ts:111](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/UpdateManager.ts#L111)

Render a fixed number of frames (for testing)
This ensures deterministic rendering similar to Babylon.js testing approach

#### Parameters

##### count

`number`

#### Returns

`void`

***

### update()

> **update**(): `void`

Defined in: [src/managers/UpdateManager.ts:122](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/UpdateManager.ts#L122)

#### Returns

`void`

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [src/managers/UpdateManager.ts:378](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/UpdateManager.ts#L378)

Update configuration

#### Parameters

##### config

`Partial`\<[`UpdateManagerConfig`](../interfaces/UpdateManagerConfig.md)\>

#### Returns

`void`
