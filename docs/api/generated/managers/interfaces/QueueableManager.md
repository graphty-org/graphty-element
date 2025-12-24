[@graphty/graphty-element](../../index.md) / [managers](../index.md) / QueueableManager

# Interface: QueueableManager

Defined in: [src/managers/interfaces.ts:24](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/interfaces.ts#L24)

Interface for managers that can queue operations

## Extends

- [`Manager`](Manager.md)

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/interfaces.ts:18](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/interfaces.ts#L18)

Dispose of all resources held by the manager

#### Returns

`void`

#### Inherited from

[`Manager`](Manager.md).[`dispose`](Manager.md#dispose)

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/interfaces.ts:13](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/interfaces.ts#L13)

Initialize the manager

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Manager`](Manager.md).[`init`](Manager.md#init)

***

### queueOperation()?

> `optional` **queueOperation**(`category`, `fn`): `string`

Defined in: [src/managers/interfaces.ts:31](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/interfaces.ts#L31)

Queue an operation for execution

#### Parameters

##### category

[`OperationCategory`](../type-aliases/OperationCategory.md)

The category of operation

##### fn

() => `void` \| `Promise`\<`void`\>

The function to execute

#### Returns

`string`

The operation ID
