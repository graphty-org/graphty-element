[@graphty/graphty-element](../../index.md) / [managers](../index.md) / LayoutManager

# Class: LayoutManager

Defined in: [src/managers/LayoutManager.ts:29](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L29)

Manages layout engines and their lifecycle
Coordinates layout updates and transitions

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new LayoutManager**(`eventManager`, `dataManager`, `styles`): `LayoutManager`

Defined in: [src/managers/LayoutManager.ts:58](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L58)

Creates an instance of LayoutManager

#### Parameters

##### eventManager

[`EventManager`](EventManager.md)

Event manager for emitting layout events

##### dataManager

[`DataManager`](DataManager.md)

Data manager for accessing nodes and edges

##### styles

[`Styles`](../../Styles/classes/Styles.md)

Styles instance for layout configuration

#### Returns

`LayoutManager`

## Properties

### layoutEngine?

> `optional` **layoutEngine**: [`LayoutEngine`](../../layout/LayoutEngine/classes/LayoutEngine.md)

Defined in: [src/managers/LayoutManager.ts:30](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L30)

## Accessors

### edges

#### Get Signature

> **get** **edges**(): `Iterable`\<[`Edge`](../../Edge/classes/Edge.md)\>

Defined in: [src/managers/LayoutManager.ts:301](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L301)

Get edges from layout engine

##### Returns

`Iterable`\<[`Edge`](../../Edge/classes/Edge.md)\>

Iterable of edges managed by the layout engine

***

### isSettled

#### Get Signature

> **get** **isSettled**(): `boolean`

Defined in: [src/managers/LayoutManager.ts:274](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L274)

Check if layout has settled

##### Returns

`boolean`

True if layout has settled, false otherwise

***

### layoutType

#### Get Signature

> **get** **layoutType**(): `string` \| `undefined`

Defined in: [src/managers/LayoutManager.ts:309](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L309)

Get current layout type

##### Returns

`string` \| `undefined`

Current layout type identifier or undefined if no layout is set

***

### nodes

#### Get Signature

> **get** **nodes**(): `Iterable`\<[`Node`](../../Node/classes/Node.md)\>

Defined in: [src/managers/LayoutManager.ts:293](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L293)

Get nodes from layout engine

##### Returns

`Iterable`\<[`Node`](../../Node/classes/Node.md)\>

Iterable of nodes managed by the layout engine

***

### running

#### Get Signature

> **get** **running**(): `boolean`

Defined in: [src/managers/LayoutManager.ts:38](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L38)

Gets the running state of the layout

##### Returns

`boolean`

True if layout is running, false otherwise

#### Set Signature

> **set** **running**(`value`): `void`

Defined in: [src/managers/LayoutManager.ts:45](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L45)

Sets the running state of the layout

##### Parameters

###### value

`boolean`

##### Returns

`void`

## Methods

### applyTemplateLayout()

> **applyTemplateLayout**(`layoutType?`, `layoutOptions?`): `Promise`\<`void`\>

Defined in: [src/managers/LayoutManager.ts:358](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L358)

Apply layout from style template if specified

#### Parameters

##### layoutType?

`string`

Layout type identifier from template

##### layoutOptions?

`object`

Layout options from template

#### Returns

`Promise`\<`void`\>

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/LayoutManager.ts:92](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L92)

Disposes of the layout manager and cleans up resources

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### getEdgePath()

> **getEdgePath**(`edge`): \[`number`, `number`, `number`\][] \| `undefined`

Defined in: [src/managers/LayoutManager.ts:262](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L262)

Get edge path from layout engine

#### Parameters

##### edge

[`Edge`](../../Edge/classes/Edge.md)

Edge to get path for

#### Returns

\[`number`, `number`, `number`\][] \| `undefined`

Edge path as array of [x, y, z] points or undefined if not available

***

### getNodePosition()

> **getNodePosition**(`node`): \[`number`, `number`, `number`\] \| `undefined`

Defined in: [src/managers/LayoutManager.ts:248](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L248)

Get node position from layout engine

#### Parameters

##### node

[`Node`](../../Node/classes/Node.md)

Node to get position for

#### Returns

\[`number`, `number`, `number`\] \| `undefined`

Node position as [x, y, z] or undefined if not available

***

### getStats()

> **getStats**(): `object`

Defined in: [src/managers/LayoutManager.ts:405](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L405)

Get layout statistics

#### Returns

`object`

Object containing layout statistics

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

Defined in: [src/managers/LayoutManager.ts:428](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L428)

Check if layout engine is currently set

#### Returns

`boolean`

True if layout engine is set, false otherwise

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/LayoutManager.ts:84](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L84)

Initializes the layout manager

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### setGraphContext()

> **setGraphContext**(`context`): `void`

Defined in: [src/managers/LayoutManager.ts:68](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L68)

Set the GraphContext for error reporting

#### Parameters

##### context

[`GraphContext`](../interfaces/GraphContext.md)

GraphContext instance

#### Returns

`void`

***

### setLayout()

> **setLayout**(`type`, `opts`): `Promise`\<`void`\>

Defined in: [src/managers/LayoutManager.ts:230](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L230)

Public method for setting layout
This goes through the queue when called from Graph

#### Parameters

##### type

`string`

Layout type identifier

##### opts

`object` = `{}`

Layout-specific options

#### Returns

`Promise`\<`void`\>

Promise that resolves when layout is set

***

### step()

> **step**(): `void`

Defined in: [src/managers/LayoutManager.ts:237](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L237)

Step the layout engine forward

#### Returns

`void`

***

### updateLayoutDimension()

> **updateLayoutDimension**(`twoD`): `Promise`\<`void`\>

Defined in: [src/managers/LayoutManager.ts:317](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L317)

Update layout dimension when 2D/3D mode changes

#### Parameters

##### twoD

`boolean`

Whether to use 2D mode

#### Returns

`Promise`\<`void`\>

***

### updatePositions()

> **updatePositions**(`nodes`): `Promise`\<`void`\>

Defined in: [src/managers/LayoutManager.ts:437](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L437)

Update positions for newly added nodes
This is called when nodes are added to an existing layout

#### Parameters

##### nodes

[`Node`](../../Node/classes/Node.md)[]

Array of nodes to update positions for

#### Returns

`Promise`\<`void`\>

***

### updateStyles()

> **updateStyles**(`styles`): `void`

Defined in: [src/managers/LayoutManager.ts:76](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/LayoutManager.ts#L76)

Update the styles reference when a new style template is loaded

#### Parameters

##### styles

[`Styles`](../../Styles/classes/Styles.md)

New styles instance

#### Returns

`void`
