[@graphty/graphty-element](../../../index.md) / [layout/LayoutEngine](../index.md) / SimpleLayoutEngine

# Abstract Class: SimpleLayoutEngine

Defined in: [src/layout/LayoutEngine.ts:194](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L194)

Base class for simple static layout engines that compute positions synchronously

## Extends

- [`LayoutEngine`](LayoutEngine.md)

## Constructors

### Constructor

> **new SimpleLayoutEngine**(`opts`): `SimpleLayoutEngine`

Defined in: [src/layout/LayoutEngine.ts:206](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L206)

Create a simple layout engine

#### Parameters

##### opts

[`SimpleLayoutOpts`](../type-aliases/SimpleLayoutOpts.md) = `{}`

Configuration options including scalingFactor

#### Returns

`SimpleLayoutEngine`

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`constructor`](LayoutEngine.md#constructor)

## Properties

### config?

> `optional` **config**: `Record`\<`string`, `unknown`\>

Defined in: [src/layout/LayoutEngine.ts:39](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L39)

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`config`](LayoutEngine.md#config)

***

### isSettled

> `readonly` **isSettled**: `true` = `true`

Defined in: [src/layout/LayoutEngine.ts:341](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L341)

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`isSettled`](LayoutEngine.md#issettled)

***

### maxDimensions

> `static` **maxDimensions**: `number`

Defined in: [src/layout/LayoutEngine.ts:38](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L38)

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`maxDimensions`](LayoutEngine.md#maxdimensions)

***

### positions

> **positions**: `Record`\<`string` \| `number`, `number`[]\> = `{}`

Defined in: [src/layout/LayoutEngine.ts:199](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L199)

***

### scalingFactor

> **scalingFactor**: `number` = `100`

Defined in: [src/layout/LayoutEngine.ts:200](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L200)

***

### stale

> **stale**: `boolean` = `true`

Defined in: [src/layout/LayoutEngine.ts:198](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L198)

***

### type

> `static` **type**: `string`

Defined in: [src/layout/LayoutEngine.ts:195](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L195)

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`type`](LayoutEngine.md#type)

***

### zodOptionsSchema?

> `static` `optional` **zodOptionsSchema**: [`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

Defined in: [src/layout/LayoutEngine.ts:47](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L47)

NEW: Zod-based options schema for unified validation and UI metadata

Subclasses should override this to define their configurable options
using the new Zod-based schema system.

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`zodOptionsSchema`](LayoutEngine.md#zodoptionsschema)

## Accessors

### edges

#### Get Signature

> **get** **edges**(): `Iterable`\<[`Edge`](../../../Edge/classes/Edge.md)\>

Defined in: [src/layout/LayoutEngine.ts:337](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L337)

Get all edges in the layout

##### Returns

`Iterable`\<[`Edge`](../../../Edge/classes/Edge.md)\>

Iterable of edges

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`edges`](LayoutEngine.md#edges)

***

### nodes

#### Get Signature

> **get** **nodes**(): `Iterable`\<[`Node`](../../../Node/classes/Node.md)\>

Defined in: [src/layout/LayoutEngine.ts:329](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L329)

Get all nodes in the layout

##### Returns

`Iterable`\<[`Node`](../../../Node/classes/Node.md)\>

Iterable of nodes

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`nodes`](LayoutEngine.md#nodes)

***

### type

#### Get Signature

> **get** **type**(): `string`

Defined in: [src/layout/LayoutEngine.ts:89](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L89)

Get the type identifier for this layout engine

##### Returns

`string`

The layout engine type string

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`type`](LayoutEngine.md#type-1)

## Methods

### addEdge()

> **addEdge**(`e`): `void`

Defined in: [src/layout/LayoutEngine.ts:251](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L251)

Add an edge to the layout and mark positions as stale

#### Parameters

##### e

[`Edge`](../../../Edge/classes/Edge.md)

The edge to add

#### Returns

`void`

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`addEdge`](LayoutEngine.md#addedge)

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

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`addEdges`](LayoutEngine.md#addedges)

***

### addNode()

> **addNode**(`n`): `void`

Defined in: [src/layout/LayoutEngine.ts:242](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L242)

Add a node to the layout and mark positions as stale

#### Parameters

##### n

[`Node`](../../../Node/classes/Node.md)

The node to add

#### Returns

`void`

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`addNode`](LayoutEngine.md#addnode)

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

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`addNodes`](LayoutEngine.md#addnodes)

***

### doLayout()

> `abstract` **doLayout**(): `void`

Defined in: [src/layout/LayoutEngine.ts:343](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L343)

#### Returns

`void`

***

### get()

> `static` **get**(`type`, `opts`): [`LayoutEngine`](LayoutEngine.md) \| `null`

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

[`LayoutEngine`](LayoutEngine.md) \| `null`

A new layout engine instance or null if type not found

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`get`](LayoutEngine.md#get)

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

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`getClass`](LayoutEngine.md#getclass)

***

### getEdgePosition()

> **getEdgePosition**(`e`): [`EdgePosition`](../interfaces/EdgePosition.md)

Defined in: [src/layout/LayoutEngine.ts:284](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L284)

Get the position of an edge based on its endpoints

#### Parameters

##### e

[`Edge`](../../../Edge/classes/Edge.md)

The edge to get position for

#### Returns

[`EdgePosition`](../interfaces/EdgePosition.md)

The edge's source and destination positions

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`getEdgePosition`](LayoutEngine.md#getedgeposition)

***

### getNodePosition()

> **getNodePosition**(`n`): [`Position`](../interfaces/Position.md)

Defined in: [src/layout/LayoutEngine.ts:261](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L261)

Get the position of a node, computing layout if stale

#### Parameters

##### n

[`Node`](../../../Node/classes/Node.md)

The node to get position for

#### Returns

[`Position`](../interfaces/Position.md)

The node's position coordinates

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`getNodePosition`](LayoutEngine.md#getnodeposition)

***

### getOptionsForDimension()

> `static` **getOptionsForDimension**(`dimension`): `object` \| `null`

Defined in: [src/layout/LayoutEngine.ts:217](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L217)

Get dimension-specific options for simple layouts

#### Parameters

##### dimension

The desired dimension (2 or 3)

`2` | `3`

#### Returns

`object` \| `null`

Options object with dim parameter or null if unsupported

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`getOptionsForDimension`](LayoutEngine.md#getoptionsfordimension)

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

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`getOptionsForDimensionByType`](LayoutEngine.md#getoptionsfordimensionbytype)

***

### getRegisteredTypes()

> `static` **getRegisteredTypes**(): `string`[]

Defined in: [src/layout/LayoutEngine.ts:171](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L171)

Get a list of all registered layout types

#### Returns

`string`[]

Array of registered layout type identifiers

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`getRegisteredTypes`](LayoutEngine.md#getregisteredtypes)

***

### getZodOptionsSchema()

> `static` **getZodOptionsSchema**(): [`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

Defined in: [src/layout/LayoutEngine.ts:155](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L155)

Get the Zod-based options schema for this layout

#### Returns

[`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

The options schema, or an empty object if no schema defined

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`getZodOptionsSchema`](LayoutEngine.md#getzodoptionsschema)

***

### hasZodOptions()

> `static` **hasZodOptions**(): `boolean`

Defined in: [src/layout/LayoutEngine.ts:163](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L163)

Check if this layout has a Zod-based options schema

#### Returns

`boolean`

true if the layout has options defined

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`hasZodOptions`](LayoutEngine.md#haszodoptions)

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/layout/LayoutEngine.ts:234](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L234)

Initialize the layout engine

Simple layouts compute positions synchronously and don't require initialization.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`init`](LayoutEngine.md#init)

***

### pin()

> **pin**(): `void`

Defined in: [src/layout/LayoutEngine.ts:311](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L311)

Pin a node in place

Simple layouts are static and don't support interactive node pinning.

#### Returns

`void`

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`pin`](LayoutEngine.md#pin)

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

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`register`](LayoutEngine.md#register)

***

### setNodePosition()

> **setNodePosition**(): `void`

Defined in: [src/layout/LayoutEngine.ts:275](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L275)

Set node position

Simple layouts are static and recompute all positions from scratch,
so individual position setting is not supported.

#### Returns

`void`

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`setNodePosition`](LayoutEngine.md#setnodeposition)

***

### step()

> **step**(): `void`

Defined in: [src/layout/LayoutEngine.ts:302](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L302)

Step the layout animation

Simple layouts are static and don't animate, so stepping has no effect.

#### Returns

`void`

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`step`](LayoutEngine.md#step)

***

### unpin()

> **unpin**(): `void`

Defined in: [src/layout/LayoutEngine.ts:320](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/layout/LayoutEngine.ts#L320)

Unpin a node

Simple layouts are static and don't support interactive node pinning.

#### Returns

`void`

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`unpin`](LayoutEngine.md#unpin)
