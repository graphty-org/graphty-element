[@graphty/graphty-element](../../index.md) / [managers](../index.md) / RenderManager

# Class: RenderManager

Defined in: [src/managers/RenderManager.ts:39](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/RenderManager.ts#L39)

Manages Babylon.js scene, engine, and render loop

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new RenderManager**(`canvas`, `eventManager`, `config`): `RenderManager`

Defined in: [src/managers/RenderManager.ts:55](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/RenderManager.ts#L55)

Creates a new render manager for Babylon.js scene and rendering

#### Parameters

##### canvas

`HTMLCanvasElement`

HTML canvas element for rendering

##### eventManager

[`EventManager`](EventManager.md)

Event manager for emitting render events

##### config

[`RenderManagerConfig`](../interfaces/RenderManagerConfig.md) = `{}`

Optional render configuration

#### Returns

`RenderManager`

## Properties

### camera

> **camera**: `CameraManager`

Defined in: [src/managers/RenderManager.ts:42](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/RenderManager.ts#L42)

***

### engine

> **engine**: `Engine` \| `WebGPUEngine`

Defined in: [src/managers/RenderManager.ts:40](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/RenderManager.ts#L40)

***

### graphRoot

> **graphRoot**: `TransformNode`

Defined in: [src/managers/RenderManager.ts:43](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/RenderManager.ts#L43)

***

### scene

> **scene**: `Scene`

Defined in: [src/managers/RenderManager.ts:41](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/RenderManager.ts#L41)

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/RenderManager.ts:143](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/RenderManager.ts#L143)

Dispose the render manager and clean up resources

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### getRenderStats()

> **getRenderStats**(): `object`

Defined in: [src/managers/RenderManager.ts:234](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/RenderManager.ts#L234)

Get current render statistics

#### Returns

`object`

Current FPS and active mesh count

##### activeMeshes

> **activeMeshes**: `number`

##### fps

> **fps**: `number`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/RenderManager.ts:110](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/RenderManager.ts#L110)

Initialize the render manager and Babylon.js engine

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### setBackgroundColor()

> **setBackgroundColor**(`color`): `void`

Defined in: [src/managers/RenderManager.ts:216](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/RenderManager.ts#L216)

Update the background color

#### Parameters

##### color

`string`

Hex color string (e.g., "#FFFFFF")

#### Returns

`void`

***

### startRenderLoop()

> **startRenderLoop**(`updateCallback`): `void`

Defined in: [src/managers/RenderManager.ts:162](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/RenderManager.ts#L162)

Start the render loop with the provided update callback

#### Parameters

##### updateCallback

() => `void`

Function to call before each render frame

#### Returns

`void`

***

### stopRenderLoop()

> **stopRenderLoop**(): `void`

Defined in: [src/managers/RenderManager.ts:202](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/RenderManager.ts#L202)

Stop the render loop

#### Returns

`void`
