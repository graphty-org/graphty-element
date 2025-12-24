[@graphty/graphty-element](../../index.md) / [managers](../index.md) / EventManager

# Class: EventManager

Defined in: [src/managers/EventManager.ts:29](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L29)

Centralized event management for the Graph system
Handles all graph, node, and edge events with type safety

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new EventManager**(): `EventManager`

#### Returns

`EventManager`

## Accessors

### onGraphError

#### Get Signature

> **get** **onGraphError**(): `Observable`\<`GraphErrorEvent`\>

Defined in: [src/managers/EventManager.ts:40](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L40)

##### Returns

`Observable`\<`GraphErrorEvent`\>

***

### onGraphEvent

#### Get Signature

> **get** **onGraphEvent**(): `Observable`\<`GraphEvent`\>

Defined in: [src/managers/EventManager.ts:36](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L36)

##### Returns

`Observable`\<`GraphEvent`\>

## Methods

### addListener()

> **addListener**(`type`, `callback`): `symbol`

Defined in: [src/managers/EventManager.ts:274](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L274)

Add a listener for a specific event type
Returns a symbol that can be used to remove the listener

#### Parameters

##### type

`EventType`

##### callback

`EventCallbackType`

#### Returns

`symbol`

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/EventManager.ts:63](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L63)

Dispose of all resources held by the manager

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### emitDataAdded()

> **emitDataAdded**(`dataType`, `count`, `shouldStartLayout`, `shouldZoomToFit`): `void`

Defined in: [src/managers/EventManager.ts:118](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L118)

#### Parameters

##### dataType

`"nodes"` | `"edges"`

##### count

`number`

##### shouldStartLayout

`boolean`

##### shouldZoomToFit

`boolean`

#### Returns

`void`

***

### emitDataLoadingComplete()

> **emitDataLoadingComplete**(`format`, `nodesLoaded`, `edgesLoaded`, `duration`, `errors`, `warnings`, `success`): `void`

Defined in: [src/managers/EventManager.ts:216](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L216)

#### Parameters

##### format

`string`

##### nodesLoaded

`number`

##### edgesLoaded

`number`

##### duration

`number`

##### errors

`number`

##### warnings

`number`

##### success

`boolean`

#### Returns

`void`

***

### emitDataLoadingError()

> **emitDataLoadingError**(`error`, `context`, `format`, `details`): `void`

Defined in: [src/managers/EventManager.ts:175](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L175)

#### Parameters

##### error

`Error`

##### context

`"detection"` | `"validation"` | `"parsing"`

##### format

`string` | `undefined`

##### details

###### canContinue

`boolean`

###### edgeId?

`string`

###### line?

`number`

###### nodeId?

`unknown`

#### Returns

`void`

***

### emitDataLoadingErrorSummary()

> **emitDataLoadingErrorSummary**(`format`, `totalErrors`, `message`, `detailedReport`, `primaryCategory?`, `suggestion?`): `void`

Defined in: [src/managers/EventManager.ts:196](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L196)

#### Parameters

##### format

`string`

##### totalErrors

`number`

##### message

`string`

##### detailedReport

`string`

##### primaryCategory?

`string`

##### suggestion?

`string`

#### Returns

`void`

***

### emitDataLoadingProgress()

> **emitDataLoadingProgress**(`format`, `bytesProcessed`, `totalBytes`, `nodesLoaded`, `edgesLoaded`, `chunksProcessed`): `void`

Defined in: [src/managers/EventManager.ts:154](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L154)

#### Parameters

##### format

`string`

##### bytesProcessed

`number`

##### totalBytes

`number` | `undefined`

##### nodesLoaded

`number`

##### edgesLoaded

`number`

##### chunksProcessed

`number`

#### Returns

`void`

***

### emitEdgeEvent()

> **emitEdgeEvent**(`type`, `eventData`): `void`

Defined in: [src/managers/EventManager.ts:263](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L263)

#### Parameters

##### type

`"edge-update-after"` | `"edge-update-before"` | `"edge-add-before"`

##### eventData

`Omit`\<`EdgeEvent`, `"type"`\>

#### Returns

`void`

***

### emitGraphDataLoaded()

> **emitGraphDataLoaded**(`graph`, `chunksLoaded`, `dataSourceType`): `void`

Defined in: [src/managers/EventManager.ts:102](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L102)

#### Parameters

##### graph

[`GraphContext`](../interfaces/GraphContext.md) | [`Graph`](../../Graph/classes/Graph.md)

##### chunksLoaded

`number`

##### dataSourceType

`string`

#### Returns

`void`

***

### emitGraphError()

> **emitGraphError**(`graph`, `error`, `context`, `details?`): `void`

Defined in: [src/managers/EventManager.ts:86](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L86)

#### Parameters

##### graph

[`GraphContext`](../interfaces/GraphContext.md) | [`Graph`](../../Graph/classes/Graph.md) | `null`

##### error

`Error`

##### context

`"xr"` | `"layout"` | `"init"` | `"data-loading"` | `"algorithm"` | `"other"`

##### details?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### emitGraphEvent()

> **emitGraphEvent**(`type`, `data`): `void`

Defined in: [src/managers/EventManager.ts:147](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L147)

#### Parameters

##### type

`string`

##### data

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### emitGraphSettled()

> **emitGraphSettled**(`graph`): `void`

Defined in: [src/managers/EventManager.ts:78](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L78)

#### Parameters

##### graph

[`Graph`](../../Graph/classes/Graph.md)

#### Returns

`void`

***

### emitLayoutInitialized()

> **emitLayoutInitialized**(`layoutType`, `shouldZoomToFit`): `void`

Defined in: [src/managers/EventManager.ts:134](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L134)

#### Parameters

##### layoutType

`string`

##### shouldZoomToFit

`boolean`

#### Returns

`void`

***

### emitNodeEvent()

> **emitNodeEvent**(`type`, `eventData`): `void`

Defined in: [src/managers/EventManager.ts:256](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L256)

#### Parameters

##### type

`"node-update-after"` | `"node-update-before"` | `"node-add-before"`

##### eventData

`Omit`\<`NodeEvent`, `"type"`\>

#### Returns

`void`

***

### emitSelectionChanged()

> **emitSelectionChanged**(`previousNode`, `currentNode`): `void`

Defined in: [src/managers/EventManager.ts:240](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L240)

#### Parameters

##### previousNode

[`Node`](../../Node/classes/Node.md) | `null`

##### currentNode

[`Node`](../../Node/classes/Node.md) | `null`

#### Returns

`void`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/EventManager.ts:58](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L58)

Initialize the manager

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### listenerCount()

> **listenerCount**(): `number`

Defined in: [src/managers/EventManager.ts:371](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L371)

Get the total number of registered listeners

#### Returns

`number`

***

### once()

> **once**(`type`, `callback`): `symbol`

Defined in: [src/managers/EventManager.ts:378](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L378)

Add a one-time listener that automatically removes itself after firing

#### Parameters

##### type

`EventType`

##### callback

`EventCallbackType`

#### Returns

`symbol`

***

### removeListener()

> **removeListener**(`id`): `boolean`

Defined in: [src/managers/EventManager.ts:357](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L357)

Remove a listener by its ID

#### Parameters

##### id

`symbol`

#### Returns

`boolean`

***

### waitFor()

> **waitFor**(`type`, `timeout?`): `Promise`\<`GraphEvent` \| `NodeEvent` \| `EdgeEvent` \| `AiEvent`\>

Defined in: [src/managers/EventManager.ts:390](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L390)

Wait for a specific event to occur
Returns a promise that resolves with the event

#### Parameters

##### type

`EventType`

##### timeout?

`number`

#### Returns

`Promise`\<`GraphEvent` \| `NodeEvent` \| `EdgeEvent` \| `AiEvent`\>

***

### withRetry()

> **withRetry**\<`T`\>(`operation`, `context`, `graph`, `details?`): `Promise`\<`T`\>

Defined in: [src/managers/EventManager.ts:413](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/EventManager.ts#L413)

Execute an async operation with automatic retry on failure
Emits error events for each failure

#### Type Parameters

##### T

`T`

#### Parameters

##### operation

() => `Promise`\<`T`\>

##### context

`"xr"` | `"layout"` | `"init"` | `"data-loading"` | `"algorithm"` | `"other"`

##### graph

[`GraphContext`](../interfaces/GraphContext.md) | [`Graph`](../../Graph/classes/Graph.md) | `null`

##### details?

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`T`\>
