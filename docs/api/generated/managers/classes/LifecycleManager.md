[@graphty/graphty-element](../../index.md) / [managers](../index.md) / LifecycleManager

# Class: LifecycleManager

Defined in: [src/managers/LifecycleManager.ts:16](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LifecycleManager.ts#L16)

Manages the lifecycle of all other managers
Ensures proper initialization order and cleanup

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new LifecycleManager**(`managers`, `eventManager`, `initOrder`): `LifecycleManager`

Defined in: [src/managers/LifecycleManager.ts:27](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LifecycleManager.ts#L27)

Creates a new lifecycle manager for coordinating manager initialization and disposal

#### Parameters

##### managers

`Map`\<`string`, [`Manager`](../interfaces/Manager.md)\>

Map of manager names to manager instances

##### eventManager

[`EventManager`](EventManager.md)

Event manager for emitting lifecycle events

##### initOrder

`string`[]

Array of manager names defining initialization order

#### Returns

`LifecycleManager`

## Methods

### addManager()

> **addManager**(`name`, `manager`, `position?`): `void`

Defined in: [src/managers/LifecycleManager.ts:247](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LifecycleManager.ts#L247)

Add a new manager to the lifecycle
TODO: This should only be done before init() is called

#### Parameters

##### name

`string`

Unique name for the manager

##### manager

[`Manager`](../interfaces/Manager.md)

Manager instance to add

##### position?

`number`

Optional position in initialization order (defaults to end)

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/LifecycleManager.ts:155](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LifecycleManager.ts#L155)

Dispose all managers in reverse initialization order

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### getManager()

> **getManager**(`name`): [`Manager`](../interfaces/Manager.md) \| `undefined`

Defined in: [src/managers/LifecycleManager.ts:266](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LifecycleManager.ts#L266)

Get a manager by name

#### Parameters

##### name

`string`

Name of the manager to retrieve

#### Returns

[`Manager`](../interfaces/Manager.md) \| `undefined`

The manager instance or undefined if not found

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/LifecycleManager.ts:36](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LifecycleManager.ts#L36)

Initialize all managers in the specified order

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/managers/LifecycleManager.ts:236](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LifecycleManager.ts#L236)

Check if all managers are initialized

#### Returns

`boolean`

True if initialization is complete, false otherwise

***

### startGraph()

> **startGraph**(`updateCallback`): `void`

Defined in: [src/managers/LifecycleManager.ts:124](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LifecycleManager.ts#L124)

Start the graph system after initialization
This coordinates starting the render loop and other post-init setup

#### Parameters

##### updateCallback

() => `void`

Callback function to execute on each render frame

#### Returns

`void`
