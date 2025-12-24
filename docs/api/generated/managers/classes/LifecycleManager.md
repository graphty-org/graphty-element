[@graphty/graphty-element](../../index.md) / [managers](../index.md) / LifecycleManager

# Class: LifecycleManager

Defined in: [src/managers/LifecycleManager.ts:16](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LifecycleManager.ts#L16)

Manages the lifecycle of all other managers
Ensures proper initialization order and cleanup

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new LifecycleManager**(`managers`, `eventManager`, `initOrder`): `LifecycleManager`

Defined in: [src/managers/LifecycleManager.ts:21](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LifecycleManager.ts#L21)

#### Parameters

##### managers

`Map`\<`string`, [`Manager`](../interfaces/Manager.md)\>

##### eventManager

[`EventManager`](EventManager.md)

##### initOrder

`string`[]

#### Returns

`LifecycleManager`

## Methods

### addManager()

> **addManager**(`name`, `manager`, `position?`): `void`

Defined in: [src/managers/LifecycleManager.ts:229](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LifecycleManager.ts#L229)

Add a new manager to the lifecycle
TODO: This should only be done before init() is called

#### Parameters

##### name

`string`

##### manager

[`Manager`](../interfaces/Manager.md)

##### position?

`number`

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/LifecycleManager.ts:142](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LifecycleManager.ts#L142)

Dispose of all resources held by the manager

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### getManager()

> **getManager**(`name`): [`Manager`](../interfaces/Manager.md) \| `undefined`

Defined in: [src/managers/LifecycleManager.ts:246](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LifecycleManager.ts#L246)

Get a manager by name

#### Parameters

##### name

`string`

#### Returns

[`Manager`](../interfaces/Manager.md) \| `undefined`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/LifecycleManager.ts:27](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LifecycleManager.ts#L27)

Initialize the manager

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/LifecycleManager.ts:221](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LifecycleManager.ts#L221)

Check if all managers are initialized

#### Returns

`boolean`

***

### startGraph()

> **startGraph**(`updateCallback`): `void`

Defined in: [src/managers/LifecycleManager.ts:114](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LifecycleManager.ts#L114)

Start the graph system after initialization
This coordinates starting the render loop and other post-init setup

#### Parameters

##### updateCallback

() => `void`

#### Returns

`void`
