[@graphty/graphty-element](../../index.md) / [config](../index.md) / ConfigurableInfo

# Interface: ConfigurableInfo

Defined in: [src/config/OptionsSchema.ts:235](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/OptionsSchema.ts#L235)

Information about a configurable item (algorithm or layout)

## Properties

### category

> **category**: `"layout"` \| `"algorithm"`

Defined in: [src/config/OptionsSchema.ts:239](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/OptionsSchema.ts#L239)

Category: "algorithm" or "layout"

***

### hasOptions

> **hasOptions**: `boolean`

Defined in: [src/config/OptionsSchema.ts:243](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/OptionsSchema.ts#L243)

Whether this item has any configurable options

***

### optionsSchema

> **optionsSchema**: [`OptionsSchema`](../type-aliases/OptionsSchema.md)

Defined in: [src/config/OptionsSchema.ts:241](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/OptionsSchema.ts#L241)

Full options schema with metadata

***

### type

> **type**: `string`

Defined in: [src/config/OptionsSchema.ts:237](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/OptionsSchema.ts#L237)

Unique type identifier
