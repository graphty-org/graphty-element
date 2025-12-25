[@graphty/graphty-element](../../index.md) / [Edge](../index.md) / Edge

# Class: Edge

Defined in: [src/Edge.ts:45](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L45)

Represents a directed edge between two nodes in the graph visualization.
Handles rendering of edge lines, arrow heads/tails, and labels with support for various styles.

## Constructors

### Constructor

> **new Edge**(`graph`, `srcNodeId`, `dstNodeId`, `styleId`, `data`, `opts`): `Edge`

Defined in: [src/Edge.ts:99](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L99)

Creates a new Edge instance connecting two nodes.

#### Parameters

##### graph

The parent graph or graph context

[`GraphContext`](../../managers/interfaces/GraphContext.md) | [`Graph`](../../Graph/classes/Graph.md)

##### srcNodeId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

The ID of the source node

##### dstNodeId

[`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

The ID of the destination node

##### styleId

[`EdgeStyleId`](../../Styles/type-aliases/EdgeStyleId.md)

The style ID to apply to this edge

##### data

[`AdHocData`](../../config/type-aliases/AdHocData.md)

Custom data associated with the edge

##### opts

`EdgeOpts` = `{}`

Optional configuration options

#### Returns

`Edge`

## Properties

### algorithmResults

> **algorithmResults**: [`AdHocData`](../../config/type-aliases/AdHocData.md)

Defined in: [src/Edge.ts:54](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L54)

***

### arrowHeadText

> **arrowHeadText**: `RichTextLabel` \| `null` = `null`

Defined in: [src/Edge.ts:63](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L63)

***

### arrowMesh

> **arrowMesh**: `AbstractMesh` \| `null` = `null`

Defined in: [src/Edge.ts:57](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L57)

***

### arrowTailMesh

> **arrowTailMesh**: `AbstractMesh` \| `null` = `null`

Defined in: [src/Edge.ts:58](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L58)

***

### arrowTailText

> **arrowTailText**: `RichTextLabel` \| `null` = `null`

Defined in: [src/Edge.ts:64](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L64)

***

### changeManager

> **changeManager**: `ChangeManager`

Defined in: [src/Edge.ts:69](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L69)

***

### data

> **data**: [`AdHocData`](../../config/type-aliases/AdHocData.md)

Defined in: [src/Edge.ts:53](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L53)

***

### dstId

> **dstId**: [`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

Defined in: [src/Edge.ts:49](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L49)

***

### dstNode

> **dstNode**: [`Node`](../../Node/classes/Node.md)

Defined in: [src/Edge.ts:51](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L51)

***

### id

> **id**: `string`

Defined in: [src/Edge.ts:50](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L50)

***

### label

> **label**: `RichTextLabel` \| `null` = `null`

Defined in: [src/Edge.ts:62](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L62)

***

### mesh

> **mesh**: `AbstractMesh` \| `PatternedLineMesh`

Defined in: [src/Edge.ts:56](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L56)

***

### opts

> **opts**: `EdgeOpts`

Defined in: [src/Edge.ts:47](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L47)

***

### parentGraph

> **parentGraph**: [`GraphContext`](../../managers/interfaces/GraphContext.md) \| [`Graph`](../../Graph/classes/Graph.md)

Defined in: [src/Edge.ts:46](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L46)

***

### ray

> **ray**: `Ray`

Defined in: [src/Edge.ts:61](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L61)

***

### srcId

> **srcId**: [`NodeIdType`](../../Node/type-aliases/NodeIdType.md)

Defined in: [src/Edge.ts:48](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L48)

***

### srcNode

> **srcNode**: [`Node`](../../Node/classes/Node.md)

Defined in: [src/Edge.ts:52](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L52)

***

### styleId

> **styleId**: [`EdgeStyleId`](../../Styles/type-aliases/EdgeStyleId.md)

Defined in: [src/Edge.ts:59](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L59)

***

### styleUpdates

> **styleUpdates**: [`AdHocData`](../../config/type-aliases/AdHocData.md)

Defined in: [src/Edge.ts:55](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L55)

## Methods

### addCalculatedStyle()

> **addCalculatedStyle**(`cv`): `void`

Defined in: [src/Edge.ts:236](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L236)

Adds a calculated style value to this edge.

#### Parameters

##### cv

`CalculatedValue`

The calculated value to add

#### Returns

`void`

***

### getInterceptPoints()

> **getInterceptPoints**(): `InterceptPoint`

Defined in: [src/Edge.ts:845](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L845)

Calculates ray intersection points with source and destination node meshes.
Used to position edges at node surfaces rather than centers.

#### Returns

`InterceptPoint`

Intersection points for source, destination, and adjusted endpoint

***

### transformArrowCap()

> **transformArrowCap**(): `EdgeLine`

Defined in: [src/Edge.ts:591](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L591)

Calculates and applies transformations for arrow head and tail meshes.
Adjusts edge line endpoints to create gaps for arrows.

#### Returns

`EdgeLine`

Edge line positions adjusted for arrow placement

***

### transformEdgeMesh()

> **transformEdgeMesh**(`srcPoint`, `dstPoint`): `void`

Defined in: [src/Edge.ts:568](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L568)

Transforms the edge mesh to position it between source and destination points.
Handles different mesh types (solid, patterned, 2D, bezier).

#### Parameters

##### srcPoint

`Vector3`

The source point position

##### dstPoint

`Vector3`

The destination point position

#### Returns

`void`

***

### update()

> **update**(): `void`

Defined in: [src/Edge.ts:244](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L244)

Updates the edge's visual representation based on current node positions and style changes.
Performs dirty checking to skip updates when nodes haven't moved.

#### Returns

`void`

***

### updateRays()

> `static` **updateRays**(`g`): `void`

Defined in: [src/Edge.ts:527](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L527)

Updates ray directions for all edges in the graph to enable accurate mesh intersections.

#### Parameters

##### g

The graph or graph context containing the edges

[`GraphContext`](../../managers/interfaces/GraphContext.md) | [`Graph`](../../Graph/classes/Graph.md)

#### Returns

`void`

***

### updateStyle()

> **updateStyle**(`styleId`): `void`

Defined in: [src/Edge.ts:362](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Edge.ts#L362)

Updates the edge's style by changing its styleId and recreating visual elements.

#### Parameters

##### styleId

[`EdgeStyleId`](../../Styles/type-aliases/EdgeStyleId.md)

The new style ID to apply

#### Returns

`void`
