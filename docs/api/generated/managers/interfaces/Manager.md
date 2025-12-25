[@graphty/graphty-element](../../index.md) / [managers](../index.md) / Manager

# Interface: Manager

Defined in: [src/managers/interfaces.ts:9](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/interfaces.ts#L9)

Base interface for all manager classes

## Extended by

- [`QueueableManager`](QueueableManager.md)

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/interfaces.ts:18](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/interfaces.ts#L18)

Dispose of all resources held by the manager

#### Returns

`void`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/interfaces.ts:13](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/interfaces.ts#L13)

Initialize the manager

#### Returns

`Promise`\<`void`\>
