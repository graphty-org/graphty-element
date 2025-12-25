[@graphty/graphty-element](../../index.md) / [Edge](../index.md) / EdgeMap

# Class: EdgeMap

Defined in: [src/Edge.ts:1055](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L1055)

A specialized map data structure for storing edges using source and destination node IDs.
Provides efficient lookup and management of edges in the graph.

## Constructors

### Constructor

> **new EdgeMap**(): `EdgeMap`

#### Returns

`EdgeMap`

## Properties

### map

> **map**: `Map`\<[`NodeIdType`](../../Node/type-aliases/NodeIdType.md), `Map`\<[`NodeIdType`](../../Node/type-aliases/NodeIdType.md), [`Edge`](Edge.md)\>\>

Defined in: [src/Edge.ts:1056](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L1056)

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Defined in: [src/Edge.ts:1112](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L1112)

Gets the total number of edges stored in the map.

##### Returns

`number`

The total count of all edges

## Methods

### clear()

> **clear**(): `void`

Defined in: [src/Edge.ts:1146](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L1146)

Removes all edges from the map.

#### Returns

`void`

***

### delete()

> **delete**(`srcId`, `dstId`): `boolean`

Defined in: [src/Edge.ts:1127](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L1127)

Removes an edge from the map.

#### Parameters

##### srcId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

The source node ID

##### dstId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

The destination node ID

#### Returns

`boolean`

True if the edge was removed, false if it didn't exist

***

### get()

> **get**(`srcId`, `dstId`): [`Edge`](Edge.md) \| `undefined`

Defined in: [src/Edge.ts:1099](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L1099)

Retrieves an edge from the map.

#### Parameters

##### srcId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

The source node ID

##### dstId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

The destination node ID

#### Returns

[`Edge`](Edge.md) \| `undefined`

The edge if found, undefined otherwise

***

### has()

> **has**(`srcId`, `dstId`): `boolean`

Defined in: [src/Edge.ts:1064](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L1064)

Checks if an edge exists between the specified source and destination nodes.

#### Parameters

##### srcId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

The source node ID

##### dstId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

The destination node ID

#### Returns

`boolean`

True if the edge exists, false otherwise

***

### set()

> **set**(`srcId`, `dstId`, `e`): `void`

Defined in: [src/Edge.ts:1079](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L1079)

Adds an edge to the map. Throws an error if the edge already exists.

#### Parameters

##### srcId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

The source node ID

##### dstId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

The destination node ID

##### e

[`Edge`](Edge.md)

The edge instance to store

#### Returns

`void`
