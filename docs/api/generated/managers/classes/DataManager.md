[@graphty/graphty-element](../../index.md) / [managers](../index.md) / DataManager

# Class: DataManager

Defined in: [src/managers/DataManager.ts:31](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L31)

Manages all data operations for nodes and edges
Handles CRUD operations, caching, and data source loading

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new DataManager**(`eventManager`, `styles`): `DataManager`

Defined in: [src/managers/DataManager.ts:64](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L64)

Creates an instance of DataManager

#### Parameters

##### eventManager

[`EventManager`](EventManager.md)

Event manager for emitting data events

##### styles

[`Styles`](../../Styles/classes/Styles.md)

Styles instance for applying styles to data

#### Returns

`DataManager`

## Properties

### edgeCache

> **edgeCache**: [`EdgeMap`](../../Edge/classes/EdgeMap.md)

Defined in: [src/managers/DataManager.ts:36](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L36)

***

### edges

> **edges**: `Map`\<`string` \| `number`, [`Edge`](../../Edge/classes/Edge.md)\>

Defined in: [src/managers/DataManager.ts:34](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L34)

***

### graphResults?

> `optional` **graphResults**: [`AdHocData`](../../config/type-aliases/AdHocData.md)

Defined in: [src/managers/DataManager.ts:40](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L40)

***

### meshCache

> **meshCache**: `MeshCache`

Defined in: [src/managers/DataManager.ts:43](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L43)

***

### nodeCache

> **nodeCache**: `Map`\<[`NodeIdType`](../../Node/type-aliases/NodeIdType.md), [`Node`](../../Node/classes/Node.md)\>

Defined in: [src/managers/DataManager.ts:35](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L35)

***

### nodes

> **nodes**: `Map`\<`string` \| `number`, [`Node`](../../Node/classes/Node.md)\>

Defined in: [src/managers/DataManager.ts:33](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L33)

## Methods

### addDataFromSource()

> **addDataFromSource**(`type`, `opts`): `Promise`\<`void`\>

Defined in: [src/managers/DataManager.ts:459](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L459)

Loads data from a registered data source

#### Parameters

##### type

`string`

Data source type identifier

##### opts

`object` = `{}`

Options to pass to the data source

#### Returns

`Promise`\<`void`\>

***

### addEdge()

> **addEdge**(`edge`, `srcIdPath?`, `dstIdPath?`): `void`

Defined in: [src/managers/DataManager.ts:342](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L342)

Adds a single edge to the graph

#### Parameters

##### edge

[`AdHocData`](../../config/type-aliases/AdHocData.md)

Edge data object

##### srcIdPath?

`string`

JMESPath expression to extract source node ID from data

##### dstIdPath?

`string`

JMESPath expression to extract destination node ID from data

#### Returns

`void`

***

### addEdges()

> **addEdges**(`edges`, `srcIdPath?`, `dstIdPath?`): `void`

Defined in: [src/managers/DataManager.ts:352](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L352)

Adds multiple edges to the graph

#### Parameters

##### edges

`Record`\<`string` \| `number`, `unknown`\>[]

Array of edge data objects

##### srcIdPath?

`string`

JMESPath expression to extract source node ID from data

##### dstIdPath?

`string`

JMESPath expression to extract destination node ID from data

#### Returns

`void`

***

### addNode()

> **addNode**(`node`, `idPath?`): `void`

Defined in: [src/managers/DataManager.ts:177](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L177)

Adds a single node to the graph

#### Parameters

##### node

[`AdHocData`](../../config/type-aliases/AdHocData.md)

Node data object

##### idPath?

`string`

JMESPath expression to extract node ID from data

#### Returns

`void`

***

### addNodes()

> **addNodes**(`nodes`, `idPath?`): `void`

Defined in: [src/managers/DataManager.ts:186](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L186)

Adds multiple nodes to the graph

#### Parameters

##### nodes

`Record`\<`string` \| `number`, `unknown`\>[]

Array of node data objects

##### idPath?

`string`

JMESPath expression to extract node ID from data

#### Returns

`void`

***

### applyStylesToExistingEdges()

> **applyStylesToExistingEdges**(): `void`

Defined in: [src/managers/DataManager.ts:104](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L104)

Apply styles to all existing edges

#### Returns

`void`

***

### applyStylesToExistingNodes()

> **applyStylesToExistingNodes**(): `void`

Defined in: [src/managers/DataManager.ts:85](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L85)

Apply styles to all existing nodes

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: [src/managers/DataManager.ts:591](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L591)

Clear all data

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/DataManager.ts:156](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L156)

Disposes of the data manager and cleans up all resources

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### getEdge()

> **getEdge**(`edgeId`): [`Edge`](../../Edge/classes/Edge.md) \| `undefined`

Defined in: [src/managers/DataManager.ts:415](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L415)

Gets an edge by its ID

#### Parameters

##### edgeId

Edge identifier

`string` | `number`

#### Returns

[`Edge`](../../Edge/classes/Edge.md) \| `undefined`

Edge instance or undefined if not found

***

### getEdgeBetween()

> **getEdgeBetween**(`srcNodeId`, `dstNodeId`): [`Edge`](../../Edge/classes/Edge.md) \| `undefined`

Defined in: [src/managers/DataManager.ts:425](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L425)

Gets an edge between two nodes

#### Parameters

##### srcNodeId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

Source node identifier

##### dstNodeId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

Destination node identifier

#### Returns

[`Edge`](../../Edge/classes/Edge.md) \| `undefined`

Edge instance or undefined if not found

***

### getNode()

> **getNode**(`nodeId`): [`Node`](../../Node/classes/Node.md) \| `undefined`

Defined in: [src/managers/DataManager.ts:305](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L305)

Gets a node by its ID

#### Parameters

##### nodeId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

Node identifier

#### Returns

[`Node`](../../Node/classes/Node.md) \| `undefined`

Node instance or undefined if not found

***

### getStats()

> **getStats**(): `object`

Defined in: [src/managers/DataManager.ts:621](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L621)

Get statistics about the data

#### Returns

`object`

Object containing node count, edge count, and cached mesh count

##### cachedMeshes

> **cachedMeshes**: `number`

##### edgeCount

> **edgeCount**: `number`

##### nodeCount

> **nodeCount**: `number`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/DataManager.ts:148](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L148)

Initializes the data manager

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### removeEdge()

> **removeEdge**(`edgeId`): `boolean`

Defined in: [src/managers/DataManager.ts:434](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L434)

Removes an edge from the graph

#### Parameters

##### edgeId

Edge identifier to remove

`string` | `number`

#### Returns

`boolean`

True if the edge was removed, false if not found

***

### removeNode()

> **removeNode**(`nodeId`): `boolean`

Defined in: [src/managers/DataManager.ts:314](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L314)

Removes a node from the graph

#### Parameters

##### nodeId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

Node identifier to remove

#### Returns

`boolean`

True if the node was removed, false if not found

***

### setGraphContext()

> **setGraphContext**(`context`): `void`

Defined in: [src/managers/DataManager.ts:127](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L127)

Set the GraphContext for creating nodes and edges

#### Parameters

##### context

[`GraphContext`](../interfaces/GraphContext.md)

GraphContext instance to use for node/edge creation

#### Returns

`void`

***

### setLayoutEngine()

> **setLayoutEngine**(`engine`): `void`

Defined in: [src/managers/DataManager.ts:140](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L140)

Set the layout engine reference for managing node and edge positions

#### Parameters

##### engine

Layout engine instance or undefined to clear

[`LayoutEngine`](../../layout/LayoutEngine/classes/LayoutEngine.md) | `undefined`

#### Returns

`void`

***

### startLabelAnimations()

> **startLabelAnimations**(): `void`

Defined in: [src/managers/DataManager.ts:611](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L611)

Start label animations for all nodes
Called when layout has settled

#### Returns

`void`

***

### updateStyles()

> **updateStyles**(`styles`): `void`

Defined in: [src/managers/DataManager.ts:75](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/DataManager.ts#L75)

Update the styles reference when styles change

#### Parameters

##### styles

[`Styles`](../../Styles/classes/Styles.md)

New styles instance to use

#### Returns

`void`
