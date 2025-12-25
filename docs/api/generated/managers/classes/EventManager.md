[@graphty/graphty-element](../../index.md) / [managers](../index.md) / EventManager

# Class: EventManager

Defined in: [src/managers/EventManager.ts:29](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L29)

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

> **get** **onGraphError**(): `Observable`\<[`GraphErrorEvent`](../../events/interfaces/GraphErrorEvent.md)\>

Defined in: [src/managers/EventManager.ts:48](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L48)

Gets the graph error observable for direct subscription

##### Returns

`Observable`\<[`GraphErrorEvent`](../../events/interfaces/GraphErrorEvent.md)\>

Observable for graph error events

***

### onGraphEvent

#### Get Signature

> **get** **onGraphEvent**(): `Observable`\<[`GraphEvent`](../../events/type-aliases/GraphEvent.md)\>

Defined in: [src/managers/EventManager.ts:40](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L40)

Gets the graph event observable for direct subscription

##### Returns

`Observable`\<[`GraphEvent`](../../events/type-aliases/GraphEvent.md)\>

Observable for graph events

## Methods

### addListener()

> **addListener**(`type`, `callback`): `symbol`

Defined in: [src/managers/EventManager.ts:380](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L380)

Add a listener for a specific event type
Returns a symbol that can be used to remove the listener

#### Parameters

##### type

[`EventType`](../../events/type-aliases/EventType.md)

Event type to listen for

##### callback

[`EventCallbackType`](../../events/type-aliases/EventCallbackType.md)

Callback function to invoke when event occurs

#### Returns

`symbol`

Symbol ID that can be used to remove the listener

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/EventManager.ts:78](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L78)

Disposes of the event manager and cleans up all resources

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### emitDataAdded()

> **emitDataAdded**(`dataType`, `count`, `shouldStartLayout`, `shouldZoomToFit`): `void`

Defined in: [src/managers/EventManager.ts:157](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L157)

Emits a data added event when nodes or edges are added

#### Parameters

##### dataType

Type of data added (nodes or edges)

`"nodes"` | `"edges"`

##### count

`number`

Number of items added

##### shouldStartLayout

`boolean`

Whether layout should be started

##### shouldZoomToFit

`boolean`

Whether to zoom to fit the data

#### Returns

`void`

***

### emitDataLoadingComplete()

> **emitDataLoadingComplete**(`format`, `nodesLoaded`, `edgesLoaded`, `duration`, `errors`, `warnings`, `success`): `void`

Defined in: [src/managers/EventManager.ts:304](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L304)

Emits a data loading complete event when import finishes

#### Parameters

##### format

`string`

Data format that was loaded

##### nodesLoaded

`number`

Number of nodes loaded

##### edgesLoaded

`number`

Number of edges loaded

##### duration

`number`

Time taken to load in milliseconds

##### errors

`number`

Number of errors encountered

##### warnings

`number`

Number of warnings encountered

##### success

`boolean`

Whether loading was successful

#### Returns

`void`

***

### emitDataLoadingError()

> **emitDataLoadingError**(`error`, `context`, `format`, `details`): `void`

Defined in: [src/managers/EventManager.ts:244](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L244)

Emits a data loading error event when an error occurs during import

#### Parameters

##### error

`Error`

Error object

##### context

Error context category

`"detection"` | `"validation"` | `"parsing"`

##### format

Data format being loaded

`string` | `undefined`

##### details

Error details

###### canContinue

`boolean`

Whether loading can continue after this error

###### edgeId?

`string`

Edge ID related to error

###### line?

`number`

Line number where error occurred

###### nodeId?

`unknown`

Node ID related to error

#### Returns

`void`

***

### emitDataLoadingErrorSummary()

> **emitDataLoadingErrorSummary**(`format`, `totalErrors`, `message`, `detailedReport`, `primaryCategory?`, `suggestion?`): `void`

Defined in: [src/managers/EventManager.ts:274](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L274)

Emits a summary of all data loading errors after import completes

#### Parameters

##### format

`string`

Data format that was loaded

##### totalErrors

`number`

Total number of errors encountered

##### message

`string`

Summary message describing errors

##### detailedReport

`string`

Detailed error report

##### primaryCategory?

`string`

Primary error category

##### suggestion?

`string`

Suggested fix for the errors

#### Returns

`void`

***

### emitDataLoadingProgress()

> **emitDataLoadingProgress**(`format`, `bytesProcessed`, `totalBytes`, `nodesLoaded`, `edgesLoaded`, `chunksProcessed`): `void`

Defined in: [src/managers/EventManager.ts:212](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L212)

Emits a data loading progress event during data import

#### Parameters

##### format

`string`

Data format being loaded

##### bytesProcessed

`number`

Number of bytes processed so far

##### totalBytes

Total bytes to process (if known)

`number` | `undefined`

##### nodesLoaded

`number`

Number of nodes loaded so far

##### edgesLoaded

`number`

Number of edges loaded so far

##### chunksProcessed

`number`

Number of data chunks processed

#### Returns

`void`

***

### emitEdgeEvent()

> **emitEdgeEvent**(`type`, `eventData`): `void`

Defined in: [src/managers/EventManager.ts:366](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L366)

Emits an edge event

#### Parameters

##### type

Edge event type

`"edge-update-after"` | `"edge-update-before"` | `"edge-add-before"` | `"edge-click"`

##### eventData

`Omit`\<[`EdgeEvent`](../../events/type-aliases/EdgeEvent.md), `"type"`\>

Event data (excluding type field)

#### Returns

`void`

***

### emitGraphDataLoaded()

> **emitGraphDataLoaded**(`graph`, `chunksLoaded`, `dataSourceType`): `void`

Defined in: [src/managers/EventManager.ts:134](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L134)

Emits a data loaded event when data has been loaded from a source

#### Parameters

##### graph

Graph or GraphContext instance

[`GraphContext`](../interfaces/GraphContext.md) | [`Graph`](../../Graph/classes/Graph.md)

##### chunksLoaded

`number`

Number of data chunks loaded

##### dataSourceType

`string`

Type of data source used

#### Returns

`void`

***

### emitGraphError()

> **emitGraphError**(`graph`, `error`, `context`, `details?`): `void`

Defined in: [src/managers/EventManager.ts:112](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L112)

Emits a graph error event

#### Parameters

##### graph

Graph or GraphContext instance where the error occurred

[`GraphContext`](../interfaces/GraphContext.md) | [`Graph`](../../Graph/classes/Graph.md) | `null`

##### error

`Error`

Error object

##### context

Error context category

`"xr"` | `"layout"` | `"init"` | `"data-loading"` | `"algorithm"` | `"other"`

##### details?

`Record`\<`string`, `unknown`\>

Additional error details

#### Returns

`void`

***

### emitGraphEvent()

> **emitGraphEvent**(`type`, `data`): `void`

Defined in: [src/managers/EventManager.ts:196](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L196)

Emits a generic graph event for custom internal events

#### Parameters

##### type

`string`

Event type identifier

##### data

`Record`\<`string`, `unknown`\>

Event data payload

#### Returns

`void`

***

### emitGraphSettled()

> **emitGraphSettled**(`graph`): `void`

Defined in: [src/managers/EventManager.ts:97](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L97)

Emits a graph settled event when the graph layout has stabilized

#### Parameters

##### graph

[`Graph`](../../Graph/classes/Graph.md)

Graph instance that has settled

#### Returns

`void`

***

### emitLayoutInitialized()

> **emitLayoutInitialized**(`layoutType`, `shouldZoomToFit`): `void`

Defined in: [src/managers/EventManager.ts:178](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L178)

Emits a layout initialized event when a layout is ready

#### Parameters

##### layoutType

`string`

Type of layout that was initialized

##### shouldZoomToFit

`boolean`

Whether to zoom to fit after initialization

#### Returns

`void`

***

### emitNodeEvent()

> **emitNodeEvent**(`type`, `eventData`): `void`

Defined in: [src/managers/EventManager.ts:354](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L354)

Emits a node event

#### Parameters

##### type

Node event type

`"node-update-after"` | `"node-update-before"` | `"node-add-before"` | `"node-click"` | `"node-hover"` | `"node-drag-start"` | `"node-drag-end"`

##### eventData

`Omit`\<[`NodeEvent`](../../events/type-aliases/NodeEvent.md), `"type"`\>

Event data (excluding type field)

#### Returns

`void`

***

### emitSelectionChanged()

> **emitSelectionChanged**(`previousNode`, `currentNode`): `void`

Defined in: [src/managers/EventManager.ts:333](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L333)

Emits a selection changed event when node selection changes

#### Parameters

##### previousNode

Previously selected node (or null)

[`Node`](../../Node/classes/Node.md) | `null`

##### currentNode

Currently selected node (or null)

[`Node`](../../Node/classes/Node.md) | `null`

#### Returns

`void`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/EventManager.ts:70](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L70)

Initializes the event manager

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### listenerCount()

> **listenerCount**(): `number`

Defined in: [src/managers/EventManager.ts:480](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L480)

Get the total number of registered listeners

#### Returns

`number`

Number of active listeners

***

### once()

> **once**(`type`, `callback`): `symbol`

Defined in: [src/managers/EventManager.ts:490](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L490)

Add a one-time listener that automatically removes itself after firing

#### Parameters

##### type

[`EventType`](../../events/type-aliases/EventType.md)

Event type to listen for

##### callback

[`EventCallbackType`](../../events/type-aliases/EventCallbackType.md)

Callback function to invoke when event occurs

#### Returns

`symbol`

Symbol ID that can be used to remove the listener

***

### removeListener()

> **removeListener**(`id`): `boolean`

Defined in: [src/managers/EventManager.ts:465](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L465)

Remove a listener by its ID

#### Parameters

##### id

`symbol`

Symbol ID returned from addListener

#### Returns

`boolean`

True if listener was removed, false if not found

***

### waitFor()

> **waitFor**(`type`, `timeout?`): `Promise`\<[`NodeEvent`](../../events/type-aliases/NodeEvent.md) \| [`GraphEvent`](../../events/type-aliases/GraphEvent.md) \| [`EdgeEvent`](../../events/type-aliases/EdgeEvent.md) \| [`AiEvent`](../../events/type-aliases/AiEvent.md)\>

Defined in: [src/managers/EventManager.ts:505](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L505)

Wait for a specific event to occur
Returns a promise that resolves with the event

#### Parameters

##### type

[`EventType`](../../events/type-aliases/EventType.md)

Event type to wait for

##### timeout?

`number`

Optional timeout in milliseconds

#### Returns

`Promise`\<[`NodeEvent`](../../events/type-aliases/NodeEvent.md) \| [`GraphEvent`](../../events/type-aliases/GraphEvent.md) \| [`EdgeEvent`](../../events/type-aliases/EdgeEvent.md) \| [`AiEvent`](../../events/type-aliases/AiEvent.md)\>

Promise that resolves with the event or rejects on timeout

***

### withRetry()

> **withRetry**\<`T`\>(`operation`, `context`, `graph`, `details?`): `Promise`\<`T`\>

Defined in: [src/managers/EventManager.ts:533](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/EventManager.ts#L533)

Execute an async operation with automatic retry on failure
Emits error events for each failure

#### Type Parameters

##### T

`T`

#### Parameters

##### operation

() => `Promise`\<`T`\>

Async operation to execute

##### context

Error context category

`"xr"` | `"layout"` | `"init"` | `"data-loading"` | `"algorithm"` | `"other"`

##### graph

Graph or GraphContext instance

[`GraphContext`](../interfaces/GraphContext.md) | [`Graph`](../../Graph/classes/Graph.md) | `null`

##### details?

`Record`\<`string`, `unknown`\>

Additional error details

#### Returns

`Promise`\<`T`\>

Promise that resolves with operation result or rejects after all retries fail
