[@graphty/graphty-element](../../index.md) / [managers](../index.md) / OperationQueueManager

# Class: OperationQueueManager

Defined in: [src/managers/OperationQueueManager.ts:53](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L53)

Manages a queue of graph operations with dependency resolution and batching
Ensures operations execute in the correct order based on their dependencies

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new OperationQueueManager**(`eventManager`, `options`): `OperationQueueManager`

Defined in: [src/managers/OperationQueueManager.ts:142](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L142)

Creates a new operation queue manager

#### Parameters

##### eventManager

[`EventManager`](EventManager.md)

Event manager for emitting operation events

##### options

Queue configuration options

###### autoStart?

`boolean`

Whether to auto-start the queue (default: true)

###### concurrency?

`number`

Maximum concurrent operations (default: 1)

###### interval?

`number`

Time interval in milliseconds

###### intervalCap?

`number`

Maximum operations per interval

#### Returns

`OperationQueueManager`

## Properties

### hasLayoutEngine()?

> `optional` **hasLayoutEngine**: () => `boolean`

Defined in: [src/managers/OperationQueueManager.ts:90](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L90)

#### Returns

`boolean`

***

### onOperationQueued()?

> `optional` **onOperationQueued**: (`category`, `description?`) => `void`

Defined in: [src/managers/OperationQueueManager.ts:87](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L87)

#### Parameters

##### category

[`OperationCategory`](../type-aliases/OperationCategory.md)

##### description?

`string`

#### Returns

`void`

## Methods

### cancelByCategory()

> **cancelByCategory**(`category`): `number`

Defined in: [src/managers/OperationQueueManager.ts:913](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L913)

Cancel all operations of a specific category

#### Parameters

##### category

[`OperationCategory`](../type-aliases/OperationCategory.md)

The operation category to cancel

#### Returns

`number`

Number of operations cancelled

***

### cancelOperation()

> **cancelOperation**(`operationId`): `boolean`

Defined in: [src/managers/OperationQueueManager.ts:871](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L871)

Cancel a specific operation

#### Parameters

##### operationId

`string`

ID of the operation to cancel

#### Returns

`boolean`

True if the operation was cancelled, false otherwise

***

### clear()

> **clear**(): `void`

Defined in: [src/managers/OperationQueueManager.ts:723](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L723)

Clear all pending operations

#### Returns

`void`

***

### clearCategoryCompleted()

> **clearCategoryCompleted**(`category`): `void`

Defined in: [src/managers/OperationQueueManager.ts:904](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L904)

Clear completed status for a category
This is useful when a category needs to be re-executed
(e.g., setStyleTemplate is called explicitly, overriding initial styles)

#### Parameters

##### category

[`OperationCategory`](../type-aliases/OperationCategory.md)

The operation category to clear

#### Returns

`void`

***

### disableBatching()

> **disableBatching**(): `void`

Defined in: [src/managers/OperationQueueManager.ts:745](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L745)

Disable batching (execute operations immediately)

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/OperationQueueManager.ts:194](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L194)

Dispose the operation queue and cancel all active operations

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### enableBatching()

> **enableBatching**(): `void`

Defined in: [src/managers/OperationQueueManager.ts:752](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L752)

Enable batching to group operations before execution

#### Returns

`void`

***

### enterBatchMode()

> **enterBatchMode**(): `void`

Defined in: [src/managers/OperationQueueManager.ts:761](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L761)

Enter batch mode - operations will be queued but not executed

#### Returns

`void`

***

### exitBatchMode()

> **exitBatchMode**(): `Promise`\<`void`\>

Defined in: [src/managers/OperationQueueManager.ts:769](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L769)

Exit batch mode - execute all batched operations in dependency order

#### Returns

`Promise`\<`void`\>

***

### getActiveOperations()

> **getActiveOperations**(): `string`[]

Defined in: [src/managers/OperationQueueManager.ts:941](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L941)

Get all active operation IDs

#### Returns

`string`[]

Array of active operation IDs

***

### getOperationController()

> **getOperationController**(`operationId`): `AbortController` \| `undefined`

Defined in: [src/managers/OperationQueueManager.ts:862](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L862)

Get the AbortController for a specific operation

#### Parameters

##### operationId

`string`

ID of the operation

#### Returns

`AbortController` \| `undefined`

The AbortController or undefined if not found

***

### getOperationProgress()

> **getOperationProgress**(`operationId`): `OperationProgress` \| `undefined`

Defined in: [src/managers/OperationQueueManager.ts:933](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L933)

Get current progress for an operation

#### Parameters

##### operationId

`string`

ID of the operation

#### Returns

`OperationProgress` \| `undefined`

Progress information or undefined if not found

***

### getStats()

> **getStats**(): `object`

Defined in: [src/managers/OperationQueueManager.ts:694](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L694)

Get queue statistics

#### Returns

`object`

Current queue state including pending operations, size, and pause status

##### isPaused

> **isPaused**: `boolean`

##### pending

> **pending**: `number`

##### size

> **size**: `number`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/OperationQueueManager.ts:187](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L187)

Initialize the operation queue manager

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### isInBatchMode()

> **isInBatchMode**(): `boolean`

Defined in: [src/managers/OperationQueueManager.ts:801](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L801)

Check if currently in batch mode

#### Returns

`boolean`

True if in batch mode, false otherwise

***

### markCategoryCompleted()

> **markCategoryCompleted**(`category`): `void`

Defined in: [src/managers/OperationQueueManager.ts:894](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L894)

Mark a category as completed (for satisfying cross-batch dependencies)
This is useful when a category's requirements are met through other means
(e.g., style-init is satisfied by constructor initialization)

#### Parameters

##### category

[`OperationCategory`](../type-aliases/OperationCategory.md)

The operation category to mark as completed

#### Returns

`void`

***

### pause()

> **pause**(): `void`

Defined in: [src/managers/OperationQueueManager.ts:709](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L709)

Pause/resume queue execution

#### Returns

`void`

***

### queueOperation()

> **queueOperation**(`category`, `execute`, `options?`): `string`

Defined in: [src/managers/OperationQueueManager.ts:217](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L217)

Queue an operation for execution
Returns the operation ID

#### Parameters

##### category

[`OperationCategory`](../type-aliases/OperationCategory.md)

Category of the operation

##### execute

(`context`) => `void` \| `Promise`\<`void`\>

Function to execute for this operation

##### options?

`Partial`\<`OperationMetadata`\>

Optional metadata for the operation

#### Returns

`string`

The unique operation ID

***

### queueOperationAsync()

> **queueOperationAsync**(`category`, `execute`, `options?`): `Promise`\<`void`\>

Defined in: [src/managers/OperationQueueManager.ts:813](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L813)

Queue an operation and get a promise for its completion
Used for batch mode operations

#### Parameters

##### category

[`OperationCategory`](../type-aliases/OperationCategory.md)

Category of the operation

##### execute

(`context`) => `void` \| `Promise`\<`void`\>

Function to execute for this operation

##### options?

`Partial`\<`OperationMetadata`\>

Optional metadata for the operation

#### Returns

`Promise`\<`void`\>

Promise that resolves when the operation completes

***

### registerTrigger()

> **registerTrigger**(`category`, `trigger`): `void`

Defined in: [src/managers/OperationQueueManager.ts:950](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L950)

Register a custom trigger for a specific operation category

#### Parameters

##### category

[`OperationCategory`](../type-aliases/OperationCategory.md)

Operation category to trigger on

##### trigger

(`metadata?`) => \{ `category`: [`OperationCategory`](../type-aliases/OperationCategory.md); `description?`: `string`; `execute`: (`context`) => `void` \| `Promise`\<`void`\>; \} \| `null`

Function that returns trigger configuration or null

#### Returns

`void`

***

### resume()

> **resume**(): `void`

Defined in: [src/managers/OperationQueueManager.ts:716](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L716)

Resume queue execution after being paused

#### Returns

`void`

***

### waitForCompletion()

> **waitForCompletion**(): `Promise`\<`void`\>

Defined in: [src/managers/OperationQueueManager.ts:680](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/OperationQueueManager.ts#L680)

Wait for all queued operations to complete

#### Returns

`Promise`\<`void`\>
