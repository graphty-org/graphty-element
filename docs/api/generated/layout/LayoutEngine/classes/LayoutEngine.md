[@graphty/graphty-element](../../../index.md) / [layout/LayoutEngine](../index.md) / LayoutEngine

# Abstract Class: LayoutEngine

Defined in: [src/layout/LayoutEngine.ts:33](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L33)

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

Defined in: [src/layout/LayoutEngine.ts:36](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L36)

***

### maxDimensions

> `static` **maxDimensions**: `number`

Defined in: [src/layout/LayoutEngine.ts:35](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L35)

***

### type

> `static` **type**: `string`

Defined in: [src/layout/LayoutEngine.ts:34](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L34)

***

### zodOptionsSchema?

> `static` `optional` **zodOptionsSchema**: [`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

Defined in: [src/layout/LayoutEngine.ts:44](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L44)

NEW: Zod-based options schema for unified validation and UI metadata

Subclasses should override this to define their configurable options
using the new Zod-based schema system.

## Accessors

### edges

#### Get Signature

> **get** `abstract` **edges**(): `Iterable`\<[`Edge`](../../../Edge/classes/Edge.md)\>

Defined in: [src/layout/LayoutEngine.ts:59](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L59)

##### Returns

`Iterable`\<[`Edge`](../../../Edge/classes/Edge.md)\>

***

### isSettled

#### Get Signature

> **get** `abstract` **isSettled**(): `boolean`

Defined in: [src/layout/LayoutEngine.ts:60](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L60)

##### Returns

`boolean`

***

### nodes

#### Get Signature

> **get** `abstract` **nodes**(): `Iterable`\<[`Node`](../../../Node/classes/Node.md)\>

Defined in: [src/layout/LayoutEngine.ts:58](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L58)

##### Returns

`Iterable`\<[`Node`](../../../Node/classes/Node.md)\>

***

### type

#### Get Signature

> **get** **type**(): `string`

Defined in: [src/layout/LayoutEngine.ts:74](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L74)

##### Returns

`string`

## Methods

### addEdge()

> `abstract` **addEdge**(`e`): `void`

Defined in: [src/layout/LayoutEngine.ts:49](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L49)

#### Parameters

##### e

[`Edge`](../../../Edge/classes/Edge.md)

#### Returns

`void`

***

### addEdges()

> **addEdges**(`edges`): `void`

Defined in: [src/layout/LayoutEngine.ts:68](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L68)

#### Parameters

##### edges

[`Edge`](../../../Edge/classes/Edge.md)[]

#### Returns

`void`

***

### addNode()

> `abstract` **addNode**(`n`): `void`

Defined in: [src/layout/LayoutEngine.ts:48](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L48)

#### Parameters

##### n

[`Node`](../../../Node/classes/Node.md)

#### Returns

`void`

***

### addNodes()

> **addNodes**(`nodes`): `void`

Defined in: [src/layout/LayoutEngine.ts:62](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L62)

#### Parameters

##### nodes

[`Node`](../../../Node/classes/Node.md)[]

#### Returns

`void`

***

### get()

> `static` **get**(`type`, `opts`): `LayoutEngine` \| `null`

Defined in: [src/layout/LayoutEngine.ts:85](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L85)

#### Parameters

##### type

`string`

##### opts

`object` = `{}`

#### Returns

`LayoutEngine` \| `null`

***

### getClass()

> `static` **getClass**(`type`): `LayoutEngineClass` & [`LayoutEngineStatics`](../interfaces/LayoutEngineStatics.md) \| `null`

Defined in: [src/layout/LayoutEngine.ts:142](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L142)

Get a layout class by type

#### Parameters

##### type

`string`

#### Returns

`LayoutEngineClass` & [`LayoutEngineStatics`](../interfaces/LayoutEngineStatics.md) \| `null`

***

### getEdgePosition()

> `abstract` **getEdgePosition**(`e`): [`EdgePosition`](../interfaces/EdgePosition.md)

Defined in: [src/layout/LayoutEngine.ts:52](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L52)

#### Parameters

##### e

[`Edge`](../../../Edge/classes/Edge.md)

#### Returns

[`EdgePosition`](../interfaces/EdgePosition.md)

***

### getNodePosition()

> `abstract` **getNodePosition**(`n`): [`Position`](../interfaces/Position.md)

Defined in: [src/layout/LayoutEngine.ts:50](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L50)

#### Parameters

##### n

[`Node`](../../../Node/classes/Node.md)

#### Returns

[`Position`](../interfaces/Position.md)

***

### getOptionsForDimension()

> `static` **getOptionsForDimension**(`dimension`): `object` \| `null`

Defined in: [src/layout/LayoutEngine.ts:94](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L94)

#### Parameters

##### dimension

`2` | `3`

#### Returns

`object` \| `null`

***

### getOptionsForDimensionByType()

> `static` **getOptionsForDimensionByType**(`type`, `dimension`): `object` \| `null`

Defined in: [src/layout/LayoutEngine.ts:105](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L105)

#### Parameters

##### type

`string`

##### dimension

`2` | `3`

#### Returns

`object` \| `null`

***

### getRegisteredTypes()

> `static` **getRegisteredTypes**(): `string`[]

Defined in: [src/layout/LayoutEngine.ts:135](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L135)

Get a list of all registered layout types

#### Returns

`string`[]

***

### getZodOptionsSchema()

> `static` **getZodOptionsSchema**(): [`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

Defined in: [src/layout/LayoutEngine.ts:119](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L119)

Get the Zod-based options schema for this layout

#### Returns

[`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

The options schema, or an empty object if no schema defined

***

### hasZodOptions()

> `static` **hasZodOptions**(): `boolean`

Defined in: [src/layout/LayoutEngine.ts:128](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L128)

Check if this layout has a Zod-based options schema

#### Returns

`boolean`

true if the layout has options defined

***

### init()

> `abstract` **init**(): `Promise`\<`void`\>

Defined in: [src/layout/LayoutEngine.ts:47](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L47)

#### Returns

`Promise`\<`void`\>

***

### pin()

> `abstract` **pin**(`n`): `void`

Defined in: [src/layout/LayoutEngine.ts:55](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L55)

#### Parameters

##### n

[`Node`](../../../Node/classes/Node.md)

#### Returns

`void`

***

### register()

> `static` **register**\<`T`\>(`cls`): `T`

Defined in: [src/layout/LayoutEngine.ts:78](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L78)

#### Type Parameters

##### T

`T` *extends* `LayoutEngineClass`

#### Parameters

##### cls

`T`

#### Returns

`T`

***

### setNodePosition()

> `abstract` **setNodePosition**(`n`, `p`): `void`

Defined in: [src/layout/LayoutEngine.ts:51](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L51)

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

Defined in: [src/layout/LayoutEngine.ts:54](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L54)

#### Returns

`void`

***

### unpin()

> `abstract` **unpin**(`n`): `void`

Defined in: [src/layout/LayoutEngine.ts:56](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/layout/LayoutEngine.ts#L56)

#### Parameters

##### n

[`Node`](../../../Node/classes/Node.md)

#### Returns

`void`
