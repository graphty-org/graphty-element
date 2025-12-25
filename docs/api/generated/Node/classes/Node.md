[@graphty/graphty-element](../../index.md) / [Node](../index.md) / Node

# Class: Node

Defined in: [src/Node.ts:28](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L28)

Represents a node in the graph visualization with its mesh, label, and associated data.
Manages node rendering, styling, drag behavior, and interactions with the layout engine.

## Constructors

### Constructor

> **new Node**(`graph`, `nodeId`, `styleId`, `data`, `opts`): `Node`

Defined in: [src/Node.ts:66](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L66)

Creates a new Node instance with mesh, label, and behaviors.

#### Parameters

##### graph

The parent graph or graph context that owns this node

[`GraphContext`](../../managers/interfaces/GraphContext.md) | [`Graph`](../../Graph/classes/Graph.md)

##### nodeId

[`NodeIdType`](../type-aliases/NodeIdType.md)

Unique identifier for this node

##### styleId

[`NodeStyleId`](../../Styles/type-aliases/NodeStyleId.md)

Style identifier determining the node's visual appearance

##### data

[`AdHocData`](../../config/type-aliases/AdHocData.md)\<`string` \| `number`\>

Custom data associated with this node

##### opts

`NodeOpts` = `{}`

Optional configuration options for the node

#### Returns

`Node`

## Properties

### algorithmResults

> **algorithmResults**: [`AdHocData`](../../config/type-aliases/AdHocData.md)

Defined in: [src/Node.ts:33](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L33)

***

### changeManager

> **changeManager**: `ChangeManager`

Defined in: [src/Node.ts:42](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L42)

***

### data

> **data**: [`AdHocData`](../../config/type-aliases/AdHocData.md)\<`string` \| `number`\>

Defined in: [src/Node.ts:32](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L32)

***

### dragging

> **dragging**: `boolean` = `false`

Defined in: [src/Node.ts:38](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L38)

***

### dragHandler?

> `optional` **dragHandler**: `NodeDragHandler`

Defined in: [src/Node.ts:37](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L37)

***

### id

> **id**: [`NodeIdType`](../type-aliases/NodeIdType.md)

Defined in: [src/Node.ts:31](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L31)

***

### label?

> `optional` **label**: `RichTextLabel`

Defined in: [src/Node.ts:36](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L36)

***

### mesh

> **mesh**: `AbstractMesh`

Defined in: [src/Node.ts:35](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L35)

***

### opts

> **opts**: `NodeOpts`

Defined in: [src/Node.ts:30](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L30)

***

### parentGraph

> **parentGraph**: [`GraphContext`](../../managers/interfaces/GraphContext.md) \| [`Graph`](../../Graph/classes/Graph.md)

Defined in: [src/Node.ts:29](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L29)

***

### pinOnDrag

> **pinOnDrag**: `boolean`

Defined in: [src/Node.ts:40](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L40)

***

### size

> **size**: `number`

Defined in: [src/Node.ts:41](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L41)

***

### styleId

> **styleId**: [`NodeStyleId`](../../Styles/type-aliases/NodeStyleId.md)

Defined in: [src/Node.ts:39](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L39)

***

### styleUpdates

> **styleUpdates**: [`AdHocData`](../../config/type-aliases/AdHocData.md)

Defined in: [src/Node.ts:34](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L34)

## Methods

### addCalculatedStyle()

> **addCalculatedStyle**(`cv`): `void`

Defined in: [src/Node.ts:123](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L123)

Adds a calculated style value to this node's change manager.

#### Parameters

##### cv

`CalculatedValue`

The calculated value to add to the node's styling system

#### Returns

`void`

***

### getPosition()

> **getPosition**(): `object`

Defined in: [src/Node.ts:418](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L418)

Gets the current 3D position of the node's mesh.

#### Returns

`object`

An object containing the x, y, and z coordinates of the node

##### x

> **x**: `number`

##### y

> **y**: `number`

##### z

> **z**: `number`

***

### isPinned()

> **isPinned**(): `boolean`

Defined in: [src/Node.ts:430](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L430)

Checks whether the node is currently pinned in place.

#### Returns

`boolean`

True if the node is pinned, false otherwise

***

### isSelected()

> **isSelected**(): `boolean`

Defined in: [src/Node.ts:439](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L439)

Checks whether the node is currently selected.

#### Returns

`boolean`

True if the node is selected, false otherwise

***

### pin()

> **pin**(): `void`

Defined in: [src/Node.ts:267](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L267)

Pins the node in place, preventing the layout engine from moving it.

#### Returns

`void`

***

### unpin()

> **unpin**(): `void`

Defined in: [src/Node.ts:274](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L274)

Unpins the node, allowing the layout engine to move it again.

#### Returns

`void`

***

### update()

> **update**(): `void`

Defined in: [src/Node.ts:131](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L131)

Updates the node's mesh position and style based on layout engine and style changes.
Handles mesh recreation if disposed and applies any pending style updates.

#### Returns

`void`

***

### updateStyle()

> **updateStyle**(`styleId`): `void`

Defined in: [src/Node.ts:177](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Node.ts#L177)

Updates the node's visual style by recreating the mesh with the specified style.
Preserves the node's position and reattaches behaviors and labels.

#### Parameters

##### styleId

[`NodeStyleId`](../../Styles/type-aliases/NodeStyleId.md)

The new style identifier to apply to the node

#### Returns

`void`
