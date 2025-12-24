[@graphty/graphty-element](../../../index.md) / [algorithms/Algorithm](../index.md) / Algorithm

# Abstract Class: Algorithm\<TOptions\>

Defined in: [src/algorithms/Algorithm.ts:95](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L95)

Base class for all graph algorithms

## Example

```typescript
// Algorithm with options
interface PageRankOptions {
    dampingFactor: number;
    maxIterations: number;
}

class PageRankAlgorithm extends Algorithm\<PageRankOptions\> {
    static optionsSchema: OptionsSchema = {
        dampingFactor: { type: 'number', default: 0.85, ... },
        maxIterations: { type: 'integer', default: 100, ... }
    };

    async run(): Promise<void> {
        const { dampingFactor, maxIterations } = this.options;
        // ... use options
    }
}
```

## Type Parameters

### TOptions

`TOptions` *extends* `Record`\<`string`, `unknown`\> = `Record`\<`string`, `unknown`\>

The options type for this algorithm (defaults to empty object)

## Constructors

### Constructor

> **new Algorithm**\<`TOptions`\>(`g`, `options?`): `Algorithm`\<`TOptions`\>

Defined in: [src/algorithms/Algorithm.ts:150](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L150)

Creates a new algorithm instance

#### Parameters

##### g

[`Graph`](../../../Graph/classes/Graph.md)

The graph to run the algorithm on

##### options?

`Partial`\<`TOptions`\>

Optional configuration options (uses schema defaults if not provided)

#### Returns

`Algorithm`\<`TOptions`\>

## Properties

### namespace

> `static` **namespace**: `string`

Defined in: [src/algorithms/Algorithm.ts:97](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L97)

***

### ~~optionsSchema~~

> `static` **optionsSchema**: `OptionsSchema` = `{}`

Defined in: [src/algorithms/Algorithm.ts:108](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L108)

Options schema for this algorithm

Subclasses should override this to define their configurable options.
An empty schema means the algorithm has no configurable options.

#### Deprecated

Use zodOptionsSchema instead for new implementations

***

### suggestedStyles?

> `static` `optional` **suggestedStyles**: [`SuggestedStylesProvider`](../../../config/type-aliases/SuggestedStylesProvider.md)

Defined in: [src/algorithms/Algorithm.ts:98](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L98)

***

### type

> `static` **type**: `string`

Defined in: [src/algorithms/Algorithm.ts:96](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L96)

***

### zodOptionsSchema?

> `static` `optional` **zodOptionsSchema**: [`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

Defined in: [src/algorithms/Algorithm.ts:116](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L116)

NEW: Zod-based options schema with rich metadata for UI generation.

Override in subclasses to define algorithm-specific options.
This is the new unified system that provides both validation and UI metadata.

## Accessors

### namespace

#### Get Signature

> **get** **namespace**(): `string`

Defined in: [src/algorithms/Algorithm.ts:177](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L177)

##### Returns

`string`

***

### results

#### Get Signature

> **get** **results**(): [`AdHocData`](../../../config/type-aliases/AdHocData.md)

Defined in: [src/algorithms/Algorithm.ts:181](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L181)

##### Returns

[`AdHocData`](../../../config/type-aliases/AdHocData.md)

***

### type

#### Get Signature

> **get** **type**(): `string`

Defined in: [src/algorithms/Algorithm.ts:173](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L173)

##### Returns

`string`

## Methods

### addEdgeResult()

> **addEdgeResult**(`edge`, `resultName`, `result`): `void`

Defined in: [src/algorithms/Algorithm.ts:229](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L229)

#### Parameters

##### edge

[`Edge`](../../../Edge/classes/Edge.md)

##### resultName

`string`

##### result

`unknown`

#### Returns

`void`

***

### addGraphResult()

> **addGraphResult**(`resultName`, `result`): `void`

Defined in: [src/algorithms/Algorithm.ts:234](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L234)

#### Parameters

##### resultName

`string`

##### result

`unknown`

#### Returns

`void`

***

### addNodeResult()

> **addNodeResult**(`nodeId`, `resultName`, `result`): `void`

Defined in: [src/algorithms/Algorithm.ts:217](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L217)

#### Parameters

##### nodeId

`string` | `number`

##### resultName

`string`

##### result

`unknown`

#### Returns

`void`

***

### get()

> `static` **get**(`g`, `namespace`, `type`): `Algorithm`\<`Record`\<`string`, `unknown`\>\> \| `null`

Defined in: [src/algorithms/Algorithm.ts:251](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L251)

#### Parameters

##### g

[`Graph`](../../../Graph/classes/Graph.md)

##### namespace

`string`

##### type

`string`

#### Returns

`Algorithm`\<`Record`\<`string`, `unknown`\>\> \| `null`

***

### getClass()

> `static` **getClass**(`namespace`, `type`): `AlgorithmClass` & [`AlgorithmStatics`](../interfaces/AlgorithmStatics.md) \| `null`

Defined in: [src/algorithms/Algorithm.ts:260](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L260)

#### Parameters

##### namespace

`string`

##### type

`string`

#### Returns

`AlgorithmClass` & [`AlgorithmStatics`](../interfaces/AlgorithmStatics.md) \| `null`

***

### ~~getOptionsSchema()~~

> `static` **getOptionsSchema**(): `OptionsSchema`

Defined in: [src/algorithms/Algorithm.ts:284](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L284)

Get the options schema for this algorithm

#### Returns

`OptionsSchema`

The options schema, or an empty object if no options defined

#### Deprecated

Use getZodOptionsSchema() instead

***

### getRegisteredAlgorithms()

> `static` **getRegisteredAlgorithms**(`namespace?`): `string`[]

Defined in: [src/algorithms/Algorithm.ts:324](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L324)

Get all registered algorithm names.

#### Parameters

##### namespace?

`string`

Optional namespace to filter by

#### Returns

`string`[]

Array of algorithm names in "namespace:type" format

***

### getSuggestedStyles()

> `static` **getSuggestedStyles**(): [`SuggestedStylesConfig`](../../../config/interfaces/SuggestedStylesConfig.md) \| `null`

Defined in: [src/algorithms/Algorithm.ts:274](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L274)

Get suggested styles for this algorithm

#### Returns

[`SuggestedStylesConfig`](../../../config/interfaces/SuggestedStylesConfig.md) \| `null`

***

### getZodOptionsSchema()

> `static` **getZodOptionsSchema**(): [`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

Defined in: [src/algorithms/Algorithm.ts:305](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L305)

Get the Zod-based options schema for this algorithm.

#### Returns

[`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

The Zod options schema, or an empty object if no schema defined

***

### ~~hasOptions()~~

> `static` **hasOptions**(): `boolean`

Defined in: [src/algorithms/Algorithm.ts:295](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L295)

Check if this algorithm has configurable options

#### Returns

`boolean`

true if the algorithm has at least one option defined

#### Deprecated

Use hasZodOptions() instead

***

### hasSuggestedStyles()

> `static` **hasSuggestedStyles**(): `boolean`

Defined in: [src/algorithms/Algorithm.ts:267](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L267)

Check if this algorithm has suggested styles

#### Returns

`boolean`

***

### hasZodOptions()

> `static` **hasZodOptions**(): `boolean`

Defined in: [src/algorithms/Algorithm.ts:314](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L314)

Check if this algorithm has a Zod-based options schema.

#### Returns

`boolean`

true if the algorithm has a Zod options schema defined

***

### register()

> `static` **register**\<`T`\>(`cls`): `T`

Defined in: [src/algorithms/Algorithm.ts:242](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L242)

#### Type Parameters

##### T

`T` *extends* `AlgorithmClass`

#### Parameters

##### cls

`T`

#### Returns

`T`

***

### run()

> `abstract` **run**(`g`): `Promise`\<`void`\>

Defined in: [src/algorithms/Algorithm.ts:204](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/algorithms/Algorithm.ts#L204)

#### Parameters

##### g

[`Graph`](../../../Graph/classes/Graph.md)

#### Returns

`Promise`\<`void`\>
