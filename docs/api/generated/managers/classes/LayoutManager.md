[@graphty/graphty-element](../../index.md) / [managers](../index.md) / LayoutManager

# Class: LayoutManager

Defined in: [src/managers/LayoutManager.ts:29](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L29)

Manages layout engines and their lifecycle
Coordinates layout updates and transitions

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new LayoutManager**(`eventManager`, `dataManager`, `styles`): `LayoutManager`

Defined in: [src/managers/LayoutManager.ts:45](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L45)

#### Parameters

##### eventManager

[`EventManager`](EventManager.md)

##### dataManager

[`DataManager`](DataManager.md)

##### styles

[`Styles`](../../Styles/classes/Styles.md)

#### Returns

`LayoutManager`

## Properties

### layoutEngine?

> `optional` **layoutEngine**: [`LayoutEngine`](../../layout/LayoutEngine/classes/LayoutEngine.md)

Defined in: [src/managers/LayoutManager.ts:30](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L30)

## Accessors

### edges

#### Get Signature

> **get** **edges**(): `Iterable`\<[`Edge`](../../Edge/classes/Edge.md)\>

Defined in: [src/managers/LayoutManager.ts:267](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L267)

Get edges from layout engine

##### Returns

`Iterable`\<[`Edge`](../../Edge/classes/Edge.md)\>

***

### isSettled

#### Get Signature

> **get** **isSettled**(): `boolean`

Defined in: [src/managers/LayoutManager.ts:242](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L242)

Check if layout has settled

##### Returns

`boolean`

***

### layoutType

#### Get Signature

> **get** **layoutType**(): `string` \| `undefined`

Defined in: [src/managers/LayoutManager.ts:274](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L274)

Get current layout type

##### Returns

`string` \| `undefined`

***

### nodes

#### Get Signature

> **get** **nodes**(): `Iterable`\<[`Node`](../../Node/classes/Node.md)\>

Defined in: [src/managers/LayoutManager.ts:260](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L260)

Get nodes from layout engine

##### Returns

`Iterable`\<[`Node`](../../Node/classes/Node.md)\>

***

### running

#### Get Signature

> **get** **running**(): `boolean`

Defined in: [src/managers/LayoutManager.ts:34](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L34)

##### Returns

`boolean`

#### Set Signature

> **set** **running**(`value`): `void`

Defined in: [src/managers/LayoutManager.ts:38](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L38)

##### Parameters

###### value

`boolean`

##### Returns

`void`

## Methods

### applyTemplateLayout()

> **applyTemplateLayout**(`layoutType?`, `layoutOptions?`): `Promise`\<`void`\>

Defined in: [src/managers/LayoutManager.ts:320](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L320)

Apply layout from style template if specified

#### Parameters

##### layoutType?

`string`

##### layoutOptions?

`object`

#### Returns

`Promise`\<`void`\>

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/LayoutManager.ts:70](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L70)

Dispose of all resources held by the manager

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### getEdgePath()

> **getEdgePath**(`edge`): \[`number`, `number`, `number`\][] \| `undefined`

Defined in: [src/managers/LayoutManager.ts:231](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L231)

Get edge path from layout engine

#### Parameters

##### edge

[`Edge`](../../Edge/classes/Edge.md)

#### Returns

\[`number`, `number`, `number`\][] \| `undefined`

***

### getNodePosition()

> **getNodePosition**(`node`): \[`number`, `number`, `number`\] \| `undefined`

Defined in: [src/managers/LayoutManager.ts:219](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L219)

Get node position from layout engine

#### Parameters

##### node

[`Node`](../../Node/classes/Node.md)

#### Returns

\[`number`, `number`, `number`\] \| `undefined`

***

### getStats()

> **getStats**(): `object`

Defined in: [src/managers/LayoutManager.ts:364](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L364)

Get layout statistics

#### Returns

`object`

##### edgeCount

> **edgeCount**: `number`

##### isRunning

> **isRunning**: `boolean`

##### isSettled

> **isSettled**: `boolean`

##### layoutType

> **layoutType**: `string` \| `undefined`

##### nodeCount

> **nodeCount**: `number`

***

### hasLayoutEngine()

> **hasLayoutEngine**(): `boolean`

Defined in: [src/managers/LayoutManager.ts:386](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L386)

Check if layout engine is currently set

#### Returns

`boolean`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/LayoutManager.ts:65](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L65)

Initialize the manager

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### setGraphContext()

> **setGraphContext**(`context`): `void`

Defined in: [src/managers/LayoutManager.ts:54](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L54)

Set the GraphContext for error reporting

#### Parameters

##### context

[`GraphContext`](../interfaces/GraphContext.md)

#### Returns

`void`

***

### setLayout()

> **setLayout**(`type`, `opts`): `Promise`\<`void`\>

Defined in: [src/managers/LayoutManager.ts:203](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L203)

Public method for setting layout
This goes through the queue when called from Graph

#### Parameters

##### type

`string`

##### opts

`object` = `{}`

#### Returns

`Promise`\<`void`\>

***

### step()

> **step**(): `void`

Defined in: [src/managers/LayoutManager.ts:210](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L210)

Step the layout engine forward

#### Returns

`void`

***

### updateLayoutDimension()

> **updateLayoutDimension**(`twoD`): `Promise`\<`void`\>

Defined in: [src/managers/LayoutManager.ts:281](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L281)

Update layout dimension when 2D/3D mode changes

#### Parameters

##### twoD

`boolean`

#### Returns

`Promise`\<`void`\>

***

### updatePositions()

> **updatePositions**(`nodes`): `Promise`\<`void`\>

Defined in: [src/managers/LayoutManager.ts:394](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L394)

Update positions for newly added nodes
This is called when nodes are added to an existing layout

#### Parameters

##### nodes

[`Node`](../../Node/classes/Node.md)[]

#### Returns

`Promise`\<`void`\>

***

### updateStyles()

> **updateStyles**(`styles`): `void`

Defined in: [src/managers/LayoutManager.ts:61](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/LayoutManager.ts#L61)

Update the styles reference when a new style template is loaded

#### Parameters

##### styles

[`Styles`](../../Styles/classes/Styles.md)

#### Returns

`void`
