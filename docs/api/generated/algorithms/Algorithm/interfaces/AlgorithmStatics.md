[@graphty/graphty-element](../../../index.md) / [algorithms/Algorithm](../index.md) / AlgorithmStatics

# Interface: AlgorithmStatics

Defined in: [src/algorithms/Algorithm.ts:19](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L19)

Interface for Algorithm class static members
Exported for use in type annotations when referencing algorithm classes

## Properties

### namespace

> **namespace**: `string`

Defined in: [src/algorithms/Algorithm.ts:21](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L21)

***

### optionsSchema

> **optionsSchema**: `OptionsSchema`

Defined in: [src/algorithms/Algorithm.ts:22](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L22)

***

### suggestedStyles?

> `optional` **suggestedStyles**: [`SuggestedStylesProvider`](../../../config/type-aliases/SuggestedStylesProvider.md)

Defined in: [src/algorithms/Algorithm.ts:23](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L23)

***

### type

> **type**: `string`

Defined in: [src/algorithms/Algorithm.ts:20](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L20)

***

### zodOptionsSchema?

> `optional` **zodOptionsSchema**: [`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

Defined in: [src/algorithms/Algorithm.ts:31](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L31)

NEW: Zod-based options schema for unified validation and UI metadata

## Methods

### ~~getOptionsSchema()~~

> **getOptionsSchema**(): `OptionsSchema`

Defined in: [src/algorithms/Algorithm.ts:25](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L25)

#### Returns

`OptionsSchema`

#### Deprecated

Use getZodOptionsSchema() instead

***

### getSuggestedStyles()

> **getSuggestedStyles**(): [`SuggestedStylesConfig`](../../../config/interfaces/SuggestedStylesConfig.md) \| `null`

Defined in: [src/algorithms/Algorithm.ts:29](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L29)

#### Returns

[`SuggestedStylesConfig`](../../../config/interfaces/SuggestedStylesConfig.md) \| `null`

***

### getZodOptionsSchema()

> **getZodOptionsSchema**(): [`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

Defined in: [src/algorithms/Algorithm.ts:33](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L33)

Get the Zod-based options schema for this algorithm

#### Returns

[`OptionsSchema`](../../../config/type-aliases/OptionsSchema.md)

***

### ~~hasOptions()~~

> **hasOptions**(): `boolean`

Defined in: [src/algorithms/Algorithm.ts:27](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L27)

#### Returns

`boolean`

#### Deprecated

Use hasZodOptions() instead

***

### hasSuggestedStyles()

> **hasSuggestedStyles**(): `boolean`

Defined in: [src/algorithms/Algorithm.ts:28](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L28)

#### Returns

`boolean`

***

### hasZodOptions()

> **hasZodOptions**(): `boolean`

Defined in: [src/algorithms/Algorithm.ts:35](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/algorithms/Algorithm.ts#L35)

Check if this algorithm has a Zod-based options schema

#### Returns

`boolean`
