[@graphty/graphty-element](../../index.md) / [config](../index.md) / OptionDefinition

# Interface: OptionDefinition\<T\>

Defined in: [src/config/OptionsSchema.ts:36](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/OptionsSchema.ts#L36)

A single option definition: Zod schema + UI metadata

## Type Parameters

### T

`T` *extends* `z.ZodType` = `z.ZodType`

## Properties

### meta

> **meta**: [`OptionMeta`](OptionMeta.md)

Defined in: [src/config/OptionsSchema.ts:40](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/OptionsSchema.ts#L40)

UI metadata for display and organization

***

### schema

> **schema**: `T`

Defined in: [src/config/OptionsSchema.ts:38](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/OptionsSchema.ts#L38)

Zod schema for validation and type inference
