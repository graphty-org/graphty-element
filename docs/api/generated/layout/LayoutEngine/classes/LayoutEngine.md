[@graphty/graphty-element](../../../index.md) / [layout/LayoutEngine](../index.md) / LayoutEngine

# Abstract Class: LayoutEngine

Defined in: [src/layout/LayoutEngine.ts:36](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L36)

Base class for all layout engines

## Extended by

- [`SimpleLayoutEngine`](SimpleLayoutEngine.md)

## Constructors

### Constructor

> **new LayoutEngine**(): `LayoutEngine`

#### Returns

`LayoutEngine`

## Properties

### config?

> `optional` **config**: `Record`\<`string`, `unknown`\>

Defined in: [src/layout/LayoutEngine.ts:39](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L39)

***

### maxDimensions

> `static` **maxDimensions**: `number`

Defined in: [src/layout/LayoutEngine.ts:38](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L38)

***

### type

> `static` **type**: `string`

Defined in: [src/layout/LayoutEngine.ts:37](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L37)

***

### zodOptionsSchema?

> `static` `optional` **zodOptionsSchema**: [`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

Defined in: [src/layout/LayoutEngine.ts:47](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L47)

NEW: Zod-based options schema for unified validation and UI metadata

Subclasses should override this to define their configurable options
using the new Zod-based schema system.

## Accessors

### edges

#### Get Signature

> **get** `abstract` **edges**(): `Iterable`\<[`Edge`](../../../Edge/classes/Edge.md)\>

Defined in: [src/layout/LayoutEngine.ts:62](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L62)

##### Returns

`Iterable`\<[`Edge`](../../../Edge/classes/Edge.md)\>

***

### isSettled

#### Get Signature

> **get** `abstract` **isSettled**(): `boolean`

Defined in: [src/layout/LayoutEngine.ts:63](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L63)

##### Returns

`boolean`

***

### nodes

#### Get Signature

> **get** `abstract` **nodes**(): `Iterable`\<[`Node`](../../../Node/classes/Node.md)\>

Defined in: [src/layout/LayoutEngine.ts:61](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L61)

##### Returns

`Iterable`\<[`Node`](../../../Node/classes/Node.md)\>

***

### type

#### Get Signature

> **get** **type**(): `string`

Defined in: [src/layout/LayoutEngine.ts:89](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L89)

Get the type identifier for this layout engine

##### Returns

`string`

The layout engine type string

## Methods

### addEdge()

> `abstract` **addEdge**(`e`): `void`

Defined in: [src/layout/LayoutEngine.ts:52](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L52)

#### Parameters

##### e

[`Edge`](../../../Edge/classes/Edge.md)

#### Returns

`void`

***

### addEdges()

> **addEdges**(`edges`): `void`

Defined in: [src/layout/LayoutEngine.ts:79](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L79)

Add multiple edges to the layout engine

#### Parameters

##### edges

[`Edge`](../../../Edge/classes/Edge.md)[]

Array of edges to add

#### Returns

`void`

***

### addNode()

> `abstract` **addNode**(`n`): `void`

Defined in: [src/layout/LayoutEngine.ts:51](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L51)

#### Parameters

##### n

[`Node`](../../../Node/classes/Node.md)

#### Returns

`void`

***

### addNodes()

> **addNodes**(`nodes`): `void`

Defined in: [src/layout/LayoutEngine.ts:69](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L69)

Add multiple nodes to the layout engine

#### Parameters

##### nodes

[`Node`](../../../Node/classes/Node.md)[]

Array of nodes to add

#### Returns

`void`

***

### get()

> `static` **get**(`type`, `opts`): `LayoutEngine` \| `null`

Defined in: [src/layout/LayoutEngine.ts:111](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L111)

Get a layout engine instance by type

#### Parameters

##### type

`string`

The layout engine type identifier

##### opts

`object` = `{}`

Configuration options for the layout engine

#### Returns

`LayoutEngine` \| `null`

A new layout engine instance or null if type not found

***

### getClass()

> `static` **getClass**(`type`): `LayoutEngineClass` & [`LayoutEngineStatics`](../interfaces/LayoutEngineStatics.md) \| `null`

Defined in: [src/layout/LayoutEngine.ts:180](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L180)

Get a layout class by type

#### Parameters

##### type

`string`

The layout engine type identifier

#### Returns

`LayoutEngineClass` & [`LayoutEngineStatics`](../interfaces/LayoutEngineStatics.md) \| `null`

The layout engine class or null if not found

***

### getEdgePosition()

> `abstract` **getEdgePosition**(`e`): [`EdgePosition`](../interfaces/EdgePosition.md)

Defined in: [src/layout/LayoutEngine.ts:55](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L55)

#### Parameters

##### e

[`Edge`](../../../Edge/classes/Edge.md)

#### Returns

[`EdgePosition`](../interfaces/EdgePosition.md)

***

### getNodePosition()

> `abstract` **getNodePosition**(`n`): [`Position`](../interfaces/Position.md)

Defined in: [src/layout/LayoutEngine.ts:53](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L53)

#### Parameters

##### n

[`Node`](../../../Node/classes/Node.md)

#### Returns

[`Position`](../interfaces/Position.md)

***

### getOptionsForDimension()

> `static` **getOptionsForDimension**(`dimension`): `object` \| `null`

Defined in: [src/layout/LayoutEngine.ts:125](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L125)

Get dimension-specific options for this layout

#### Parameters

##### dimension

The desired dimension (2 or 3)

`2` | `3`

#### Returns

`object` \| `null`

Options object for the dimension or null if unsupported

***

### getOptionsForDimensionByType()

> `static` **getOptionsForDimensionByType**(`type`, `dimension`): `object` \| `null`

Defined in: [src/layout/LayoutEngine.ts:142](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L142)

Get dimension-specific options for a layout by type

#### Parameters

##### type

`string`

The layout engine type identifier

##### dimension

The desired dimension (2 or 3)

`2` | `3`

#### Returns

`object` \| `null`

Options object for the dimension or null if type not found or unsupported

***

### getRegisteredTypes()

> `static` **getRegisteredTypes**(): `string`[]

Defined in: [src/layout/LayoutEngine.ts:171](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L171)

Get a list of all registered layout types

#### Returns

`string`[]

Array of registered layout type identifiers

***

### getZodOptionsSchema()

> `static` **getZodOptionsSchema**(): [`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

Defined in: [src/layout/LayoutEngine.ts:155](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L155)

Get the Zod-based options schema for this layout

#### Returns

[`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

The options schema, or an empty object if no schema defined

***

### hasZodOptions()

> `static` **hasZodOptions**(): `boolean`

Defined in: [src/layout/LayoutEngine.ts:163](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L163)

Check if this layout has a Zod-based options schema

#### Returns

`boolean`

true if the layout has options defined

***

### init()

> `abstract` **init**(): `Promise`\<`void`\>

Defined in: [src/layout/LayoutEngine.ts:50](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L50)

#### Returns

`Promise`\<`void`\>

***

### pin()

> `abstract` **pin**(`n`): `void`

Defined in: [src/layout/LayoutEngine.ts:58](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L58)

#### Parameters

##### n

[`Node`](../../../Node/classes/Node.md)

#### Returns

`void`

***

### register()

> `static` **register**\<`T`\>(`cls`): `T`

Defined in: [src/layout/LayoutEngine.ts:98](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L98)

Register a layout engine class in the global registry

#### Type Parameters

##### T

`T` *extends* `LayoutEngineClass`

#### Parameters

##### cls

`T`

The layout engine class to register

#### Returns

`T`

The registered class for chaining

***

### setNodePosition()

> `abstract` **setNodePosition**(`n`, `p`): `void`

Defined in: [src/layout/LayoutEngine.ts:54](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L54)

#### Parameters

##### n

[`Node`](../../../Node/classes/Node.md)

##### p

[`Position`](../interfaces/Position.md)

#### Returns

`void`

***

### step()

> `abstract` **step**(): `void`

Defined in: [src/layout/LayoutEngine.ts:57](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L57)

#### Returns

`void`

***

### unpin()

> `abstract` **unpin**(`n`): `void`

Defined in: [src/layout/LayoutEngine.ts:59](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L59)

#### Parameters

##### n

[`Node`](../../../Node/classes/Node.md)

#### Returns

`void`
