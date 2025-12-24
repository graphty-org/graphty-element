[@graphty/graphty-element](../../../index.md) / [layout/LayoutEngine](../index.md) / SimpleLayoutEngine

# Abstract Class: SimpleLayoutEngine

Defined in: [src/layout/LayoutEngine.ts:153](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L153)

## Extends

- [`LayoutEngine`](LayoutEngine.md)

## Constructors

### Constructor

> **new SimpleLayoutEngine**(`opts`): `SimpleLayoutEngine`

Defined in: [src/layout/LayoutEngine.ts:161](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L161)

#### Parameters

##### opts

[`SimpleLayoutOpts`](../type-aliases/SimpleLayoutOpts.md) = `{}`

#### Returns

`SimpleLayoutEngine`

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`constructor`](LayoutEngine.md#constructor)

## Properties

### config?

> `optional` **config**: `Record`\<`string`, `unknown`\>

Defined in: [src/layout/LayoutEngine.ts:36](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L36)

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`config`](LayoutEngine.md#config)

***

### isSettled

> `readonly` **isSettled**: `true` = `true`

Defined in: [src/layout/LayoutEngine.ts:232](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L232)

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`isSettled`](LayoutEngine.md#issettled)

***

### maxDimensions

> `static` **maxDimensions**: `number`

Defined in: [src/layout/LayoutEngine.ts:35](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L35)

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`maxDimensions`](LayoutEngine.md#maxdimensions)

***

### positions

> **positions**: `Record`\<`string` \| `number`, `number`[]\> = `{}`

Defined in: [src/layout/LayoutEngine.ts:158](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L158)

***

### scalingFactor

> **scalingFactor**: `number` = `100`

Defined in: [src/layout/LayoutEngine.ts:159](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L159)

***

### stale

> **stale**: `boolean` = `true`

Defined in: [src/layout/LayoutEngine.ts:157](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L157)

***

### type

> `static` **type**: `string`

Defined in: [src/layout/LayoutEngine.ts:154](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L154)

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`type`](LayoutEngine.md#type)

***

### zodOptionsSchema?

> `static` `optional` **zodOptionsSchema**: [`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

Defined in: [src/layout/LayoutEngine.ts:44](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L44)

NEW: Zod-based options schema for unified validation and UI metadata

Subclasses should override this to define their configurable options
using the new Zod-based schema system.

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`zodOptionsSchema`](LayoutEngine.md#zodoptionsschema)

## Accessors

### edges

#### Get Signature

> **get** **edges**(): `Iterable`\<[`Edge`](../../../Edge/classes/Edge.md)\>

Defined in: [src/layout/LayoutEngine.ts:228](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L228)

##### Returns

`Iterable`\<[`Edge`](../../../Edge/classes/Edge.md)\>

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`edges`](LayoutEngine.md#edges)

***

### nodes

#### Get Signature

> **get** **nodes**(): `Iterable`\<[`Node`](../../../Node/classes/Node.md)\>

Defined in: [src/layout/LayoutEngine.ts:224](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L224)

##### Returns

`Iterable`\<[`Node`](../../../Node/classes/Node.md)\>

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`nodes`](LayoutEngine.md#nodes)

***

### type

#### Get Signature

> **get** **type**(): `string`

Defined in: [src/layout/LayoutEngine.ts:74](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L74)

##### Returns

`string`

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`type`](LayoutEngine.md#type-1)

## Methods

### addEdge()

> **addEdge**(`e`): `void`

Defined in: [src/layout/LayoutEngine.ts:186](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L186)

#### Parameters

##### e

[`Edge`](../../../Edge/classes/Edge.md)

#### Returns

`void`

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`addEdge`](LayoutEngine.md#addedge)

***

### addEdges()

> **addEdges**(`edges`): `void`

Defined in: [src/layout/LayoutEngine.ts:68](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L68)

#### Parameters

##### edges

[`Edge`](../../../Edge/classes/Edge.md)[]

#### Returns

`void`

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`addEdges`](LayoutEngine.md#addedges)

***

### addNode()

> **addNode**(`n`): `void`

Defined in: [src/layout/LayoutEngine.ts:181](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L181)

#### Parameters

##### n

[`Node`](../../../Node/classes/Node.md)

#### Returns

`void`

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`addNode`](LayoutEngine.md#addnode)

***

### addNodes()

> **addNodes**(`nodes`): `void`

Defined in: [src/layout/LayoutEngine.ts:62](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L62)

#### Parameters

##### nodes

[`Node`](../../../Node/classes/Node.md)[]

#### Returns

`void`

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`addNodes`](LayoutEngine.md#addnodes)

***

### doLayout()

> `abstract` **doLayout**(): `void`

Defined in: [src/layout/LayoutEngine.ts:234](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L234)

#### Returns

`void`

***

### get()

> `static` **get**(`type`, `opts`): [`LayoutEngine`](LayoutEngine.md) \| `null`

Defined in: [src/layout/LayoutEngine.ts:85](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L85)

#### Parameters

##### type

`string`

##### opts

`object` = `{}`

#### Returns

[`LayoutEngine`](LayoutEngine.md) \| `null`

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`get`](LayoutEngine.md#get)

***

### getClass()

> `static` **getClass**(`type`): `LayoutEngineClass` & [`LayoutEngineStatics`](../interfaces/LayoutEngineStatics.md) \| `null`

Defined in: [src/layout/LayoutEngine.ts:142](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L142)

Get a layout class by type

#### Parameters

##### type

`string`

#### Returns

`LayoutEngineClass` & [`LayoutEngineStatics`](../interfaces/LayoutEngineStatics.md) \| `null`

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`getClass`](LayoutEngine.md#getclass)

***

### getEdgePosition()

> **getEdgePosition**(`e`): [`EdgePosition`](../interfaces/EdgePosition.md)

Defined in: [src/layout/LayoutEngine.ts:202](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L202)

#### Parameters

##### e

[`Edge`](../../../Edge/classes/Edge.md)

#### Returns

[`EdgePosition`](../interfaces/EdgePosition.md)

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`getEdgePosition`](LayoutEngine.md#getedgeposition)

***

### getNodePosition()

> **getNodePosition**(`n`): [`Position`](../interfaces/Position.md)

Defined in: [src/layout/LayoutEngine.ts:191](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L191)

#### Parameters

##### n

[`Node`](../../../Node/classes/Node.md)

#### Returns

[`Position`](../interfaces/Position.md)

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`getNodePosition`](LayoutEngine.md#getnodeposition)

***

### getOptionsForDimension()

> `static` **getOptionsForDimension**(`dimension`): `object` \| `null`

Defined in: [src/layout/LayoutEngine.ts:167](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L167)

#### Parameters

##### dimension

`2` | `3`

#### Returns

`object` \| `null`

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`getOptionsForDimension`](LayoutEngine.md#getoptionsfordimension)

***

### getOptionsForDimensionByType()

> `static` **getOptionsForDimensionByType**(`type`, `dimension`): `object` \| `null`

Defined in: [src/layout/LayoutEngine.ts:105](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L105)

#### Parameters

##### type

`string`

##### dimension

`2` | `3`

#### Returns

`object` \| `null`

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`getOptionsForDimensionByType`](LayoutEngine.md#getoptionsfordimensionbytype)

***

### getRegisteredTypes()

> `static` **getRegisteredTypes**(): `string`[]

Defined in: [src/layout/LayoutEngine.ts:135](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L135)

Get a list of all registered layout types

#### Returns

`string`[]

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`getRegisteredTypes`](LayoutEngine.md#getregisteredtypes)

***

### getZodOptionsSchema()

> `static` **getZodOptionsSchema**(): [`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

Defined in: [src/layout/LayoutEngine.ts:119](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L119)

Get the Zod-based options schema for this layout

#### Returns

[`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

The options schema, or an empty object if no schema defined

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`getZodOptionsSchema`](LayoutEngine.md#getzodoptionsschema)

***

### hasZodOptions()

> `static` **hasZodOptions**(): `boolean`

Defined in: [src/layout/LayoutEngine.ts:128](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L128)

Check if this layout has a Zod-based options schema

#### Returns

`boolean`

true if the layout has options defined

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`hasZodOptions`](LayoutEngine.md#haszodoptions)

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/layout/LayoutEngine.ts:179](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L179)

#### Returns

`Promise`\<`void`\>

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`init`](LayoutEngine.md#init)

***

### pin()

> **pin**(): `void`

Defined in: [src/layout/LayoutEngine.ts:218](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L218)

#### Returns

`void`

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`pin`](LayoutEngine.md#pin)

***

### register()

> `static` **register**\<`T`\>(`cls`): `T`

Defined in: [src/layout/LayoutEngine.ts:78](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L78)

#### Type Parameters

##### T

`T` *extends* `LayoutEngineClass`

#### Parameters

##### cls

`T`

#### Returns

`T`

#### Inherited from

[`LayoutEngine`](LayoutEngine.md).[`register`](LayoutEngine.md#register)

***

### setNodePosition()

> **setNodePosition**(): `void`

Defined in: [src/layout/LayoutEngine.ts:200](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L200)

#### Returns

`void`

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`setNodePosition`](LayoutEngine.md#setnodeposition)

***

### step()

> **step**(): `void`

Defined in: [src/layout/LayoutEngine.ts:215](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L215)

#### Returns

`void`

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`step`](LayoutEngine.md#step)

***

### unpin()

> **unpin**(): `void`

Defined in: [src/layout/LayoutEngine.ts:221](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/layout/LayoutEngine.ts#L221)

#### Returns

`void`

#### Overrides

[`LayoutEngine`](LayoutEngine.md).[`unpin`](LayoutEngine.md#unpin)
