[@graphty/graphty-element](../../index.md) / [managers](../index.md) / Manager

# Interface: Manager

Defined in: [src/managers/interfaces.ts:9](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/interfaces.ts#L9)

Base interface for all manager classes

## Extended by

- [`QueueableManager`](QueueableManager.md)

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/interfaces.ts:18](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/interfaces.ts#L18)

Dispose of all resources held by the manager

#### Returns

`void`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/interfaces.ts:13](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/interfaces.ts#L13)

Initialize the manager

#### Returns

`Promise`\<`void`\>
