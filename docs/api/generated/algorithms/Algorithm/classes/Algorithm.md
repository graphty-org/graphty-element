[@graphty/graphty-element](../../../index.md) / [algorithms/Algorithm](../index.md) / Algorithm

# Abstract Class: Algorithm\<TOptions\>

Defined in: [src/algorithms/Algorithm.ts:93](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L93)

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

Defined in: [src/algorithms/Algorithm.ts:147](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L147)

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

Defined in: [src/algorithms/Algorithm.ts:95](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L95)

***

### ~~optionsSchema~~

> `static` **optionsSchema**: `OptionsSchema` = `{}`

Defined in: [src/algorithms/Algorithm.ts:105](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L105)

Options schema for this algorithm

Subclasses should override this to define their configurable options.
An empty schema means the algorithm has no configurable options.

#### Deprecated

Use zodOptionsSchema instead for new implementations

***

### suggestedStyles?

> `static` `optional` **suggestedStyles**: [`SuggestedStylesProvider`](../../../config/type-aliases/SuggestedStylesProvider.md)

Defined in: [src/algorithms/Algorithm.ts:96](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L96)

***

### type

> `static` **type**: `string`

Defined in: [src/algorithms/Algorithm.ts:94](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L94)

***

### zodOptionsSchema?

> `static` `optional` **zodOptionsSchema**: [`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

Defined in: [src/algorithms/Algorithm.ts:113](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L113)

NEW: Zod-based options schema with rich metadata for UI generation.

Override in subclasses to define algorithm-specific options.
This is the new unified system that provides both validation and UI metadata.

## Accessors

### namespace

#### Get Signature

> **get** **namespace**(): `string`

Defined in: [src/algorithms/Algorithm.ts:181](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L181)

Gets the algorithm namespace

##### Returns

`string`

The algorithm namespace identifier

***

### results

#### Get Signature

> **get** **results**(): [`AdHocData`](../../../config/type-aliases/AdHocData.md)

Defined in: [src/algorithms/Algorithm.ts:189](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L189)

Gets all algorithm results for nodes, edges, and graph

##### Returns

[`AdHocData`](../../../config/type-aliases/AdHocData.md)

An object containing node, edge, and graph results

***

### type

#### Get Signature

> **get** **type**(): `string`

Defined in: [src/algorithms/Algorithm.ts:173](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L173)

Gets the algorithm type

##### Returns

`string`

The algorithm type identifier

## Methods

### addEdgeResult()

> **addEdgeResult**(`edge`, `resultName`, `result`): `void`

Defined in: [src/algorithms/Algorithm.ts:249](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L249)

Adds a result value for a specific edge

#### Parameters

##### edge

[`Edge`](../../../Edge/classes/Edge.md)

The edge to add the result to

##### resultName

`string`

The name of the result field

##### result

`unknown`

The result value to store

#### Returns

`void`

***

### addGraphResult()

> **addGraphResult**(`resultName`, `result`): `void`

Defined in: [src/algorithms/Algorithm.ts:259](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L259)

Adds a result value for the graph

#### Parameters

##### resultName

`string`

The name of the result field

##### result

`unknown`

The result value to store

#### Returns

`void`

***

### addNodeResult()

> **addNodeResult**(`nodeId`, `resultName`, `result`): `void`

Defined in: [src/algorithms/Algorithm.ts:231](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L231)

Adds a result value for a specific node

#### Parameters

##### nodeId

The ID of the node to add the result to

`string` | `number`

##### resultName

`string`

The name of the result field

##### result

`unknown`

The result value to store

#### Returns

`void`

***

### get()

> `static` **get**(`g`, `namespace`, `type`): `Algorithm`\<`Record`\<`string`, `unknown`\>\> \| `null`

Defined in: [src/algorithms/Algorithm.ts:288](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L288)

Gets an algorithm instance from the registry

#### Parameters

##### g

[`Graph`](../../../Graph/classes/Graph.md)

The graph to run the algorithm on

##### namespace

`string`

The algorithm namespace

##### type

`string`

The algorithm type

#### Returns

`Algorithm`\<`Record`\<`string`, `unknown`\>\> \| `null`

A new instance of the algorithm, or null if not found

***

### getClass()

> `static` **getClass**(`namespace`, `type`): `AlgorithmClass` & [`AlgorithmStatics`](../interfaces/AlgorithmStatics.md) \| `null`

Defined in: [src/algorithms/Algorithm.ts:303](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L303)

Gets an algorithm class from the registry

#### Parameters

##### namespace

`string`

The algorithm namespace

##### type

`string`

The algorithm type

#### Returns

`AlgorithmClass` & [`AlgorithmStatics`](../interfaces/AlgorithmStatics.md) \| `null`

The algorithm class, or null if not found

***

### ~~getOptionsSchema()~~

> `static` **getOptionsSchema**(): `OptionsSchema`

Defined in: [src/algorithms/Algorithm.ts:328](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L328)

Get the options schema for this algorithm

#### Returns

`OptionsSchema`

The options schema, or an empty object if no options defined

#### Deprecated

Use getZodOptionsSchema() instead

***

### getRegisteredAlgorithms()

> `static` **getRegisteredAlgorithms**(`namespace?`): `string`[]

Defined in: [src/algorithms/Algorithm.ts:365](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L365)

Get all registered algorithm names.

#### Parameters

##### namespace?

`string`

Optional namespace to filter by

#### Returns

`string`[]

Array of algorithm names in "namespace:type" format

***

### getRegisteredTypes()

> `static` **getRegisteredTypes**(): `string`[]

Defined in: [src/algorithms/Algorithm.ts:388](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L388)

Get all registered algorithm types.
This method is provided for API consistency with DataSource.

#### Returns

`string`[]

Array of algorithm keys in "namespace:type" format

#### Since

1.5.0

#### Example

```typescript
const types = Algorithm.getRegisteredTypes();
console.log('Available algorithms:', types);
// ['graphty:betweenness', 'graphty:closeness', 'graphty:degree', ...]
```

***

### getSuggestedStyles()

> `static` **getSuggestedStyles**(): [`SuggestedStylesConfig`](../../../config/interfaces/SuggestedStylesConfig.md) \| `null`

Defined in: [src/algorithms/Algorithm.ts:319](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L319)

Get suggested styles for this algorithm

#### Returns

[`SuggestedStylesConfig`](../../../config/interfaces/SuggestedStylesConfig.md) \| `null`

The suggested styles configuration, or null if none defined

***

### getZodOptionsSchema()

> `static` **getZodOptionsSchema**(): [`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

Defined in: [src/algorithms/Algorithm.ts:347](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L347)

Get the Zod-based options schema for this algorithm.

#### Returns

[`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

The Zod options schema, or an empty object if no schema defined

***

### ~~hasOptions()~~

> `static` **hasOptions**(): `boolean`

Defined in: [src/algorithms/Algorithm.ts:338](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L338)

Check if this algorithm has configurable options

#### Returns

`boolean`

true if the algorithm has at least one option defined

#### Deprecated

Use hasZodOptions() instead

***

### hasSuggestedStyles()

> `static` **hasSuggestedStyles**(): `boolean`

Defined in: [src/algorithms/Algorithm.ts:311](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L311)

Check if this algorithm has suggested styles

#### Returns

`boolean`

true if suggested styles are defined

***

### hasZodOptions()

> `static` **hasZodOptions**(): `boolean`

Defined in: [src/algorithms/Algorithm.ts:355](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L355)

Check if this algorithm has a Zod-based options schema.

#### Returns

`boolean`

true if the algorithm has a Zod options schema defined

***

### register()

> `static` **register**\<`T`\>(`cls`): `T`

Defined in: [src/algorithms/Algorithm.ts:272](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L272)

Registers an algorithm class in the global registry

#### Type Parameters

##### T

`T` *extends* `AlgorithmClass`

#### Parameters

##### cls

`T`

The algorithm class to register

#### Returns

`T`

The registered algorithm class

***

### run()

> `abstract` **run**(`g`): `Promise`\<`void`\>

Defined in: [src/algorithms/Algorithm.ts:212](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L212)

#### Parameters

##### g

[`Graph`](../../../Graph/classes/Graph.md)

#### Returns

`Promise`\<`void`\>
