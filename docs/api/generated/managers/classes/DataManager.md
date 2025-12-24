[@graphty/graphty-element](../../index.md) / [managers](../index.md) / DataManager

# Class: DataManager

Defined in: [src/managers/DataManager.ts:31](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L31)

Manages all data operations for nodes and edges
Handles CRUD operations, caching, and data source loading

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new DataManager**(`eventManager`, `styles`): `DataManager`

Defined in: [src/managers/DataManager.ts:59](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L59)

#### Parameters

##### eventManager

[`EventManager`](EventManager.md)

##### styles

[`Styles`](../../Styles/classes/Styles.md)

#### Returns

`DataManager`

## Properties

### edgeCache

> **edgeCache**: [`EdgeMap`](../../Edge/classes/EdgeMap.md)

Defined in: [src/managers/DataManager.ts:36](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L36)

***

### edges

> **edges**: `Map`\<`string` \| `number`, [`Edge`](../../Edge/classes/Edge.md)\>

Defined in: [src/managers/DataManager.ts:34](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L34)

***

### graphResults?

> `optional` **graphResults**: [`AdHocData`](../../config/type-aliases/AdHocData.md)

Defined in: [src/managers/DataManager.ts:40](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L40)

***

### meshCache

> **meshCache**: `MeshCache`

Defined in: [src/managers/DataManager.ts:43](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L43)

***

### nodeCache

> **nodeCache**: `Map`\<[`NodeIdType`](../../Node/type-aliases/NodeIdType.md), [`Node`](../../Node/classes/Node.md)\>

Defined in: [src/managers/DataManager.ts:35](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L35)

***

### nodes

> **nodes**: `Map`\<`string` \| `number`, [`Node`](../../Node/classes/Node.md)\>

Defined in: [src/managers/DataManager.ts:33](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L33)

## Methods

### addDataFromSource()

> **addDataFromSource**(`type`, `opts`): `Promise`\<`void`\>

Defined in: [src/managers/DataManager.ts:388](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L388)

#### Parameters

##### type

`string`

##### opts

`object` = `{}`

#### Returns

`Promise`\<`void`\>

***

### addEdge()

> **addEdge**(`edge`, `srcIdPath?`, `dstIdPath?`): `void`

Defined in: [src/managers/DataManager.ts:298](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L298)

#### Parameters

##### edge

[`AdHocData`](../../config/type-aliases/AdHocData.md)

##### srcIdPath?

`string`

##### dstIdPath?

`string`

#### Returns

`void`

***

### addEdges()

> **addEdges**(`edges`, `srcIdPath?`, `dstIdPath?`): `void`

Defined in: [src/managers/DataManager.ts:302](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L302)

#### Parameters

##### edges

`Record`\<`string` \| `number`, `unknown`\>[]

##### srcIdPath?

`string`

##### dstIdPath?

`string`

#### Returns

`void`

***

### addNode()

> **addNode**(`node`, `idPath?`): `void`

Defined in: [src/managers/DataManager.ts:154](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L154)

#### Parameters

##### node

[`AdHocData`](../../config/type-aliases/AdHocData.md)

##### idPath?

`string`

#### Returns

`void`

***

### addNodes()

> **addNodes**(`nodes`, `idPath?`): `void`

Defined in: [src/managers/DataManager.ts:158](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L158)

#### Parameters

##### nodes

`Record`\<`string` \| `number`, `unknown`\>[]

##### idPath?

`string`

#### Returns

`void`

***

### applyStylesToExistingEdges()

> **applyStylesToExistingEdges**(): `void`

Defined in: [src/managers/DataManager.ts:98](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L98)

Apply styles to all existing edges

#### Returns

`void`

***

### applyStylesToExistingNodes()

> **applyStylesToExistingNodes**(): `void`

Defined in: [src/managers/DataManager.ts:79](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L79)

Apply styles to all existing nodes

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: [src/managers/DataManager.ts:520](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L520)

Clear all data

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/DataManager.ts:138](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L138)

Dispose of all resources held by the manager

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### getEdge()

> **getEdge**(`edgeId`): [`Edge`](../../Edge/classes/Edge.md) \| `undefined`

Defined in: [src/managers/DataManager.ts:360](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L360)

#### Parameters

##### edgeId

`string` | `number`

#### Returns

[`Edge`](../../Edge/classes/Edge.md) \| `undefined`

***

### getEdgeBetween()

> **getEdgeBetween**(`srcNodeId`, `dstNodeId`): [`Edge`](../../Edge/classes/Edge.md) \| `undefined`

Defined in: [src/managers/DataManager.ts:364](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L364)

#### Parameters

##### srcNodeId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

##### dstNodeId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

#### Returns

[`Edge`](../../Edge/classes/Edge.md) \| `undefined`

***

### getNode()

> **getNode**(`nodeId`): [`Node`](../../Node/classes/Node.md) \| `undefined`

Defined in: [src/managers/DataManager.ts:272](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L272)

#### Parameters

##### nodeId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

#### Returns

[`Node`](../../Node/classes/Node.md) \| `undefined`

***

### getStats()

> **getStats**(): `object`

Defined in: [src/managers/DataManager.ts:549](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L549)

Get statistics about the data

#### Returns

`object`

##### cachedMeshes

> **cachedMeshes**: `number`

##### edgeCount

> **edgeCount**: `number`

##### nodeCount

> **nodeCount**: `number`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/DataManager.ts:133](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L133)

Initialize the manager

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### removeEdge()

> **removeEdge**(`edgeId`): `boolean`

Defined in: [src/managers/DataManager.ts:368](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L368)

#### Parameters

##### edgeId

`string` | `number`

#### Returns

`boolean`

***

### removeNode()

> **removeNode**(`nodeId`): `boolean`

Defined in: [src/managers/DataManager.ts:276](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L276)

#### Parameters

##### nodeId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

#### Returns

`boolean`

***

### setGraphContext()

> **setGraphContext**(`context`): `void`

Defined in: [src/managers/DataManager.ts:120](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L120)

Set the GraphContext for creating nodes and edges

#### Parameters

##### context

[`GraphContext`](../interfaces/GraphContext.md)

#### Returns

`void`

***

### setLayoutEngine()

> **setLayoutEngine**(`engine`): `void`

Defined in: [src/managers/DataManager.ts:129](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L129)

#### Parameters

##### engine

[`LayoutEngine`](../../layout/LayoutEngine/classes/LayoutEngine.md) | `undefined`

#### Returns

`void`

***

### startLabelAnimations()

> **startLabelAnimations**(): `void`

Defined in: [src/managers/DataManager.ts:540](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L540)

Start label animations for all nodes
Called when layout has settled

#### Returns

`void`

***

### updateStyles()

> **updateStyles**(`styles`): `void`

Defined in: [src/managers/DataManager.ts:69](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/DataManager.ts#L69)

Update the styles reference when styles change

#### Parameters

##### styles

[`Styles`](../../Styles/classes/Styles.md)

#### Returns

`void`
