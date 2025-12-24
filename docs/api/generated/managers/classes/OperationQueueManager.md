[@graphty/graphty-element](../../index.md) / [managers](../index.md) / OperationQueueManager

# Class: OperationQueueManager

Defined in: [src/managers/OperationQueueManager.ts:49](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L49)

Base interface for all manager classes

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new OperationQueueManager**(`eventManager`, `options`): `OperationQueueManager`

Defined in: [src/managers/OperationQueueManager.ts:129](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L129)

#### Parameters

##### eventManager

[`EventManager`](EventManager.md)

##### options

###### autoStart?

`boolean`

###### concurrency?

`number`

###### interval?

`number`

###### intervalCap?

`number`

#### Returns

`OperationQueueManager`

## Properties

### hasLayoutEngine()?

> `optional` **hasLayoutEngine**: () => `boolean`

Defined in: [src/managers/OperationQueueManager.ts:86](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L86)

#### Returns

`boolean`

***

### onOperationQueued()?

> `optional` **onOperationQueued**: (`category`, `description?`) => `void`

Defined in: [src/managers/OperationQueueManager.ts:83](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L83)

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

Defined in: [src/managers/OperationQueueManager.ts:856](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L856)

Cancel all operations of a specific category

#### Parameters

##### category

[`OperationCategory`](../type-aliases/OperationCategory.md)

#### Returns

`number`

***

### cancelOperation()

> **cancelOperation**(`operationId`): `boolean`

Defined in: [src/managers/OperationQueueManager.ts:818](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L818)

Cancel a specific operation

#### Parameters

##### operationId

`string`

#### Returns

`boolean`

***

### clear()

> **clear**(): `void`

Defined in: [src/managers/OperationQueueManager.ts:683](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L683)

Clear all pending operations

#### Returns

`void`

***

### clearCategoryCompleted()

> **clearCategoryCompleted**(`category`): `void`

Defined in: [src/managers/OperationQueueManager.ts:849](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L849)

Clear completed status for a category
This is useful when a category needs to be re-executed
(e.g., setStyleTemplate is called explicitly, overriding initial styles)

#### Parameters

##### category

[`OperationCategory`](../type-aliases/OperationCategory.md)

#### Returns

`void`

***

### disableBatching()

> **disableBatching**(): `void`

Defined in: [src/managers/OperationQueueManager.ts:705](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L705)

Disable batching (execute operations immediately)

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/OperationQueueManager.ts:175](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L175)

Dispose of all resources held by the manager

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### enableBatching()

> **enableBatching**(): `void`

Defined in: [src/managers/OperationQueueManager.ts:709](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L709)

#### Returns

`void`

***

### enterBatchMode()

> **enterBatchMode**(): `void`

Defined in: [src/managers/OperationQueueManager.ts:718](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L718)

Enter batch mode - operations will be queued but not executed

#### Returns

`void`

***

### exitBatchMode()

> **exitBatchMode**(): `Promise`\<`void`\>

Defined in: [src/managers/OperationQueueManager.ts:726](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L726)

Exit batch mode - execute all batched operations in dependency order

#### Returns

`Promise`\<`void`\>

***

### getActiveOperations()

> **getActiveOperations**(): `string`[]

Defined in: [src/managers/OperationQueueManager.ts:881](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L881)

Get all active operation IDs

#### Returns

`string`[]

***

### getOperationController()

> **getOperationController**(`operationId`): `AbortController` \| `undefined`

Defined in: [src/managers/OperationQueueManager.ts:811](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L811)

Get the AbortController for a specific operation

#### Parameters

##### operationId

`string`

#### Returns

`AbortController` \| `undefined`

***

### getOperationProgress()

> **getOperationProgress**(`operationId`): `OperationProgress` \| `undefined`

Defined in: [src/managers/OperationQueueManager.ts:874](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L874)

Get current progress for an operation

#### Parameters

##### operationId

`string`

#### Returns

`OperationProgress` \| `undefined`

***

### getStats()

> **getStats**(): `object`

Defined in: [src/managers/OperationQueueManager.ts:657](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L657)

Get queue statistics

#### Returns

`object`

##### isPaused

> **isPaused**: `boolean`

##### pending

> **pending**: `number`

##### size

> **size**: `number`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/OperationQueueManager.ts:171](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L171)

Initialize the manager

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### isInBatchMode()

> **isInBatchMode**(): `boolean`

Defined in: [src/managers/OperationQueueManager.ts:757](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L757)

Check if currently in batch mode

#### Returns

`boolean`

***

### markCategoryCompleted()

> **markCategoryCompleted**(`category`): `void`

Defined in: [src/managers/OperationQueueManager.ts:840](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L840)

Mark a category as completed (for satisfying cross-batch dependencies)
This is useful when a category's requirements are met through other means
(e.g., style-init is satisfied by constructor initialization)

#### Parameters

##### category

[`OperationCategory`](../type-aliases/OperationCategory.md)

#### Returns

`void`

***

### pause()

> **pause**(): `void`

Defined in: [src/managers/OperationQueueManager.ts:672](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L672)

Pause/resume queue execution

#### Returns

`void`

***

### queueOperation()

> **queueOperation**(`category`, `execute`, `options?`): `string`

Defined in: [src/managers/OperationQueueManager.ts:194](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L194)

Queue an operation for execution
Returns the operation ID

#### Parameters

##### category

[`OperationCategory`](../type-aliases/OperationCategory.md)

##### execute

(`context`) => `void` \| `Promise`\<`void`\>

##### options?

`Partial`\<`OperationMetadata`\>

#### Returns

`string`

***

### queueOperationAsync()

> **queueOperationAsync**(`category`, `execute`, `options?`): `Promise`\<`void`\>

Defined in: [src/managers/OperationQueueManager.ts:765](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L765)

Queue an operation and get a promise for its completion
Used for batch mode operations

#### Parameters

##### category

[`OperationCategory`](../type-aliases/OperationCategory.md)

##### execute

(`context`) => `void` \| `Promise`\<`void`\>

##### options?

`Partial`\<`OperationMetadata`\>

#### Returns

`Promise`\<`void`\>

***

### registerTrigger()

> **registerTrigger**(`category`, `trigger`): `void`

Defined in: [src/managers/OperationQueueManager.ts:888](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L888)

Register a custom trigger for a specific operation category

#### Parameters

##### category

[`OperationCategory`](../type-aliases/OperationCategory.md)

##### trigger

(`metadata?`) => \{ `category`: [`OperationCategory`](../type-aliases/OperationCategory.md); `description?`: `string`; `execute`: (`context`) => `void` \| `Promise`\<`void`\>; \} \| `null`

#### Returns

`void`

***

### resume()

> **resume**(): `void`

Defined in: [src/managers/OperationQueueManager.ts:676](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L676)

#### Returns

`void`

***

### waitForCompletion()

> **waitForCompletion**(): `Promise`\<`void`\>

Defined in: [src/managers/OperationQueueManager.ts:644](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/OperationQueueManager.ts#L644)

Wait for all queued operations to complete

#### Returns

`Promise`\<`void`\>
