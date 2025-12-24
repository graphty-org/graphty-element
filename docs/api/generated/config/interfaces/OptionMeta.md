[@graphty/graphty-element](../../index.md) / [config](../index.md) / OptionMeta

# Interface: OptionMeta

Defined in: [src/config/OptionsSchema.ts:20](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/OptionsSchema.ts#L20)

UI metadata for an option (not validation - that's Zod's job)

## Properties

### advanced?

> `optional` **advanced**: `boolean`

Defined in: [src/config/OptionsSchema.ts:26](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/OptionsSchema.ts#L26)

Hide in basic UI mode (show only in advanced settings)

***

### description

> **description**: `string`

Defined in: [src/config/OptionsSchema.ts:24](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/OptionsSchema.ts#L24)

Detailed description/help text

***

### group?

> `optional` **group**: `string`

Defined in: [src/config/OptionsSchema.ts:28](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/OptionsSchema.ts#L28)

Group related options together in UI

***

### label

> **label**: `string`

Defined in: [src/config/OptionsSchema.ts:22](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/OptionsSchema.ts#L22)

Human-readable label for UI display

***

### step?

> `optional` **step**: `number`

Defined in: [src/config/OptionsSchema.ts:30](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/OptionsSchema.ts#L30)

Suggested step increment for numeric sliders
