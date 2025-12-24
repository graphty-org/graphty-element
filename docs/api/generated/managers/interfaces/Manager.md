[@graphty/graphty-element](../../index.md) / [managers](../index.md) / Manager

# Interface: Manager

Defined in: [src/managers/interfaces.ts:9](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/interfaces.ts#L9)

Base interface for all manager classes

## Extended by

- [`QueueableManager`](QueueableManager.md)

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/interfaces.ts:18](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/interfaces.ts#L18)

Dispose of all resources held by the manager

#### Returns

`void`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/interfaces.ts:13](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/interfaces.ts#L13)

Initialize the manager

#### Returns

`Promise`\<`void`\>
