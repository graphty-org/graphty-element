[@graphty/graphty-element](../../index.md) / [managers](../index.md) / RenderManager

# Class: RenderManager

Defined in: [src/managers/RenderManager.ts:39](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/RenderManager.ts#L39)

Manages Babylon.js scene, engine, and render loop

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new RenderManager**(`canvas`, `eventManager`, `config`): `RenderManager`

Defined in: [src/managers/RenderManager.ts:49](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/RenderManager.ts#L49)

#### Parameters

##### canvas

`HTMLCanvasElement`

##### eventManager

[`EventManager`](EventManager.md)

##### config

[`RenderManagerConfig`](../interfaces/RenderManagerConfig.md) = `{}`

#### Returns

`RenderManager`

## Properties

### camera

> **camera**: `CameraManager`

Defined in: [src/managers/RenderManager.ts:42](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/RenderManager.ts#L42)

***

### engine

> **engine**: `Engine` \| `WebGPUEngine`

Defined in: [src/managers/RenderManager.ts:40](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/RenderManager.ts#L40)

***

### graphRoot

> **graphRoot**: `TransformNode`

Defined in: [src/managers/RenderManager.ts:43](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/RenderManager.ts#L43)

***

### scene

> **scene**: `Scene`

Defined in: [src/managers/RenderManager.ts:41](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/RenderManager.ts#L41)

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/RenderManager.ts:131](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/RenderManager.ts#L131)

Dispose of all resources held by the manager

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### getRenderStats()

> **getRenderStats**(): `object`

Defined in: [src/managers/RenderManager.ts:219](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/RenderManager.ts#L219)

Get current render statistics

#### Returns

`object`

##### activeMeshes

> **activeMeshes**: `number`

##### fps

> **fps**: `number`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/RenderManager.ts:101](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/RenderManager.ts#L101)

Initialize the manager

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### setBackgroundColor()

> **setBackgroundColor**(`color`): `void`

Defined in: [src/managers/RenderManager.ts:202](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/RenderManager.ts#L202)

Update the background color

#### Parameters

##### color

`string`

#### Returns

`void`

***

### startRenderLoop()

> **startRenderLoop**(`updateCallback`): `void`

Defined in: [src/managers/RenderManager.ts:149](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/RenderManager.ts#L149)

Start the render loop with the provided update callback

#### Parameters

##### updateCallback

() => `void`

#### Returns

`void`

***

### stopRenderLoop()

> **stopRenderLoop**(): `void`

Defined in: [src/managers/RenderManager.ts:189](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/RenderManager.ts#L189)

Stop the render loop

#### Returns

`void`
