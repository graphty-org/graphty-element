[@graphty/graphty-element](../../index.md) / [managers](../index.md) / SelectionManager

# Class: SelectionManager

Defined in: [src/managers/SelectionManager.ts:51](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/SelectionManager.ts#L51)

Manages node selection state within the graph.

Features:
- Single node selection (one node selected at a time)
- Emits selection-changed events
- Manages selection style layer
- Updates node data with _selected property for style matching

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new SelectionManager**(`eventManager`): `SelectionManager`

Defined in: [src/managers/SelectionManager.ts:61](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/SelectionManager.ts#L61)

Creates a new selection manager

#### Parameters

##### eventManager

[`EventManager`](EventManager.md)

Event manager for emitting selection events

#### Returns

`SelectionManager`

## Methods

### deselect()

> **deselect**(): `void`

Defined in: [src/managers/SelectionManager.ts:172](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/SelectionManager.ts#L172)

Deselect the currently selected node.
Emits a selection-changed event if a node was selected.

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/SelectionManager.ts:76](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/SelectionManager.ts#L76)

Dispose the selection manager and clear selection

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### getSelectedNode()

> **getSelectedNode**(): [`Node`](../../Node/classes/Node.md) \| `null`

Defined in: [src/managers/SelectionManager.ts:107](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/SelectionManager.ts#L107)

Get the currently selected node.

#### Returns

[`Node`](../../Node/classes/Node.md) \| `null`

The selected node, or null if nothing is selected.

***

### getSelectionStyleLayer()

> **getSelectionStyleLayer**(): `object`

Defined in: [src/managers/SelectionManager.ts:190](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/SelectionManager.ts#L190)

Get the selection style layer.
This layer can be modified to customize the appearance of selected nodes.

#### Returns

`object`

The selection style layer configuration.

##### edge?

> `optional` **edge**: `object` = `AppliedEdgeStyle`

###### edge.calculatedStyle?

> `optional` **calculatedStyle**: `object`

###### edge.calculatedStyle.expr

> **expr**: `string`

###### edge.calculatedStyle.inputs

> **inputs**: `string`[]

###### edge.calculatedStyle.output

> **output**: `string` = `AllowedOuputPaths`

###### edge.selector

> **selector**: `string`

###### edge.style

> **style**: `object` = `EdgeStyle`

###### edge.style.arrowHead?

> `optional` **arrowHead**: `object`

###### edge.style.arrowHead.color?

> `optional` **color**: `string`

###### edge.style.arrowHead.opacity?

> `optional` **opacity**: `number`

###### edge.style.arrowHead.size?

> `optional` **size**: `number`

###### edge.style.arrowHead.text?

> `optional` **text**: `object`

###### edge.style.arrowHead.text.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

###### edge.style.arrowHead.text.animationSpeed?

> `optional` **animationSpeed**: `number`

###### edge.style.arrowHead.text.attachOffset?

> `optional` **attachOffset**: `number`

###### edge.style.arrowHead.text.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

###### edge.style.arrowHead.text.autoSize?

> `optional` **autoSize**: `boolean`

###### edge.style.arrowHead.text.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: ... \| ...; `value`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"radial-gradient"`; `opacity?`: ... \| ...; \}

###### edge.style.arrowHead.text.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

###### edge.style.arrowHead.text.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (... \| ...)[]

###### edge.style.arrowHead.text.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

###### edge.style.arrowHead.text.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

###### edge.style.arrowHead.text.backgroundPadding?

> `optional` **backgroundPadding**: `number`

###### edge.style.arrowHead.text.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

###### edge.style.arrowHead.text.billboardMode?

> `optional` **billboardMode**: `number`

###### edge.style.arrowHead.text.borderColor?

> `optional` **borderColor**: `string`

###### edge.style.arrowHead.text.borders?

> `optional` **borders**: `object`[]

###### edge.style.arrowHead.text.borderWidth?

> `optional` **borderWidth**: `number`

###### edge.style.arrowHead.text.cornerRadius?

> `optional` **cornerRadius**: `number`

###### edge.style.arrowHead.text.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

###### edge.style.arrowHead.text.depthFadeFar?

> `optional` **depthFadeFar**: `number`

###### edge.style.arrowHead.text.depthFadeNear?

> `optional` **depthFadeNear**: `number`

###### edge.style.arrowHead.text.enabled?

> `optional` **enabled**: `boolean`

###### edge.style.arrowHead.text.font?

> `optional` **font**: `string`

###### edge.style.arrowHead.text.fontSize?

> `optional` **fontSize**: `number`

###### edge.style.arrowHead.text.fontWeight?

> `optional` **fontWeight**: `string`

###### edge.style.arrowHead.text.icon?

> `optional` **icon**: `string`

###### edge.style.arrowHead.text.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

###### edge.style.arrowHead.text.lineHeight?

> `optional` **lineHeight**: `number`

###### edge.style.arrowHead.text.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

###### edge.style.arrowHead.text.marginBottom?

> `optional` **marginBottom**: `number`

###### edge.style.arrowHead.text.marginLeft?

> `optional` **marginLeft**: `number`

###### edge.style.arrowHead.text.marginRight?

> `optional` **marginRight**: `number`

###### edge.style.arrowHead.text.marginTop?

> `optional` **marginTop**: `number`

###### edge.style.arrowHead.text.maxNumber?

> `optional` **maxNumber**: `number`

###### edge.style.arrowHead.text.overflowSuffix?

> `optional` **overflowSuffix**: `string`

###### edge.style.arrowHead.text.pointer?

> `optional` **pointer**: `boolean`

###### edge.style.arrowHead.text.pointerCurve?

> `optional` **pointerCurve**: `boolean`

###### edge.style.arrowHead.text.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

###### edge.style.arrowHead.text.pointerHeight?

> `optional` **pointerHeight**: `number`

###### edge.style.arrowHead.text.pointerOffset?

> `optional` **pointerOffset**: `number`

###### edge.style.arrowHead.text.pointerWidth?

> `optional` **pointerWidth**: `number`

###### edge.style.arrowHead.text.position?

> `optional` **position**: `object`

###### edge.style.arrowHead.text.position.x

> **x**: `number`

###### edge.style.arrowHead.text.position.y

> **y**: `number`

###### edge.style.arrowHead.text.position.z

> **z**: `number`

###### edge.style.arrowHead.text.progress?

> `optional` **progress**: `number`

###### edge.style.arrowHead.text.resolution?

> `optional` **resolution**: `number`

###### edge.style.arrowHead.text.smartOverflow?

> `optional` **smartOverflow**: `boolean`

###### edge.style.arrowHead.text.text?

> `optional` **text**: `string`

###### edge.style.arrowHead.text.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

###### edge.style.arrowHead.text.textColor?

> `optional` **textColor**: `string`

###### edge.style.arrowHead.text.textOutline?

> `optional` **textOutline**: `boolean`

###### edge.style.arrowHead.text.textOutlineColor?

> `optional` **textOutlineColor**: `string`

###### edge.style.arrowHead.text.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

###### edge.style.arrowHead.text.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

###### edge.style.arrowHead.text.textPath?

> `optional` **textPath**: `string`

###### edge.style.arrowHead.text.textShadow?

> `optional` **textShadow**: `boolean`

###### edge.style.arrowHead.text.textShadowBlur?

> `optional` **textShadowBlur**: `number`

###### edge.style.arrowHead.text.textShadowColor?

> `optional` **textShadowColor**: `string`

###### edge.style.arrowHead.text.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

###### edge.style.arrowHead.text.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

###### edge.style.arrowHead.type?

> `optional` **type**: `"none"` \| `"dot"` \| `"normal"` \| `"inverted"` \| `"sphere-dot"` \| `"open-dot"` \| `"tee"` \| `"open-normal"` \| `"diamond"` \| `"open-diamond"` \| `"crow"` \| `"box"` \| `"half-open"` \| `"vee"`

###### edge.style.arrowTail?

> `optional` **arrowTail**: `object`

###### edge.style.arrowTail.color?

> `optional` **color**: `string`

###### edge.style.arrowTail.opacity?

> `optional` **opacity**: `number`

###### edge.style.arrowTail.size?

> `optional` **size**: `number`

###### edge.style.arrowTail.text?

> `optional` **text**: `object`

###### edge.style.arrowTail.text.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

###### edge.style.arrowTail.text.animationSpeed?

> `optional` **animationSpeed**: `number`

###### edge.style.arrowTail.text.attachOffset?

> `optional` **attachOffset**: `number`

###### edge.style.arrowTail.text.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

###### edge.style.arrowTail.text.autoSize?

> `optional` **autoSize**: `boolean`

###### edge.style.arrowTail.text.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: ... \| ...; `value`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"radial-gradient"`; `opacity?`: ... \| ...; \}

###### edge.style.arrowTail.text.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

###### edge.style.arrowTail.text.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (... \| ...)[]

###### edge.style.arrowTail.text.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

###### edge.style.arrowTail.text.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

###### edge.style.arrowTail.text.backgroundPadding?

> `optional` **backgroundPadding**: `number`

###### edge.style.arrowTail.text.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

###### edge.style.arrowTail.text.billboardMode?

> `optional` **billboardMode**: `number`

###### edge.style.arrowTail.text.borderColor?

> `optional` **borderColor**: `string`

###### edge.style.arrowTail.text.borders?

> `optional` **borders**: `object`[]

###### edge.style.arrowTail.text.borderWidth?

> `optional` **borderWidth**: `number`

###### edge.style.arrowTail.text.cornerRadius?

> `optional` **cornerRadius**: `number`

###### edge.style.arrowTail.text.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

###### edge.style.arrowTail.text.depthFadeFar?

> `optional` **depthFadeFar**: `number`

###### edge.style.arrowTail.text.depthFadeNear?

> `optional` **depthFadeNear**: `number`

###### edge.style.arrowTail.text.enabled?

> `optional` **enabled**: `boolean`

###### edge.style.arrowTail.text.font?

> `optional` **font**: `string`

###### edge.style.arrowTail.text.fontSize?

> `optional` **fontSize**: `number`

###### edge.style.arrowTail.text.fontWeight?

> `optional` **fontWeight**: `string`

###### edge.style.arrowTail.text.icon?

> `optional` **icon**: `string`

###### edge.style.arrowTail.text.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

###### edge.style.arrowTail.text.lineHeight?

> `optional` **lineHeight**: `number`

###### edge.style.arrowTail.text.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

###### edge.style.arrowTail.text.marginBottom?

> `optional` **marginBottom**: `number`

###### edge.style.arrowTail.text.marginLeft?

> `optional` **marginLeft**: `number`

###### edge.style.arrowTail.text.marginRight?

> `optional` **marginRight**: `number`

###### edge.style.arrowTail.text.marginTop?

> `optional` **marginTop**: `number`

###### edge.style.arrowTail.text.maxNumber?

> `optional` **maxNumber**: `number`

###### edge.style.arrowTail.text.overflowSuffix?

> `optional` **overflowSuffix**: `string`

###### edge.style.arrowTail.text.pointer?

> `optional` **pointer**: `boolean`

###### edge.style.arrowTail.text.pointerCurve?

> `optional` **pointerCurve**: `boolean`

###### edge.style.arrowTail.text.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

###### edge.style.arrowTail.text.pointerHeight?

> `optional` **pointerHeight**: `number`

###### edge.style.arrowTail.text.pointerOffset?

> `optional` **pointerOffset**: `number`

###### edge.style.arrowTail.text.pointerWidth?

> `optional` **pointerWidth**: `number`

###### edge.style.arrowTail.text.position?

> `optional` **position**: `object`

###### edge.style.arrowTail.text.position.x

> **x**: `number`

###### edge.style.arrowTail.text.position.y

> **y**: `number`

###### edge.style.arrowTail.text.position.z

> **z**: `number`

###### edge.style.arrowTail.text.progress?

> `optional` **progress**: `number`

###### edge.style.arrowTail.text.resolution?

> `optional` **resolution**: `number`

###### edge.style.arrowTail.text.smartOverflow?

> `optional` **smartOverflow**: `boolean`

###### edge.style.arrowTail.text.text?

> `optional` **text**: `string`

###### edge.style.arrowTail.text.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

###### edge.style.arrowTail.text.textColor?

> `optional` **textColor**: `string`

###### edge.style.arrowTail.text.textOutline?

> `optional` **textOutline**: `boolean`

###### edge.style.arrowTail.text.textOutlineColor?

> `optional` **textOutlineColor**: `string`

###### edge.style.arrowTail.text.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

###### edge.style.arrowTail.text.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

###### edge.style.arrowTail.text.textPath?

> `optional` **textPath**: `string`

###### edge.style.arrowTail.text.textShadow?

> `optional` **textShadow**: `boolean`

###### edge.style.arrowTail.text.textShadowBlur?

> `optional` **textShadowBlur**: `number`

###### edge.style.arrowTail.text.textShadowColor?

> `optional` **textShadowColor**: `string`

###### edge.style.arrowTail.text.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

###### edge.style.arrowTail.text.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

###### edge.style.arrowTail.type?

> `optional` **type**: `"none"` \| `"dot"` \| `"normal"` \| `"inverted"` \| `"sphere-dot"` \| `"open-dot"` \| `"tee"` \| `"open-normal"` \| `"diamond"` \| `"open-diamond"` \| `"crow"` \| `"box"` \| `"half-open"` \| `"vee"`

###### edge.style.enabled?

> `optional` **enabled**: `boolean`

###### edge.style.label?

> `optional` **label**: `object`

###### edge.style.label.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

###### edge.style.label.animationSpeed?

> `optional` **animationSpeed**: `number`

###### edge.style.label.attachOffset?

> `optional` **attachOffset**: `number`

###### edge.style.label.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

###### edge.style.label.autoSize?

> `optional` **autoSize**: `boolean`

###### edge.style.label.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

###### edge.style.label.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

###### edge.style.label.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

###### edge.style.label.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

###### edge.style.label.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

###### edge.style.label.backgroundPadding?

> `optional` **backgroundPadding**: `number`

###### edge.style.label.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

###### edge.style.label.billboardMode?

> `optional` **billboardMode**: `number`

###### edge.style.label.borderColor?

> `optional` **borderColor**: `string`

###### edge.style.label.borders?

> `optional` **borders**: `object`[]

###### edge.style.label.borderWidth?

> `optional` **borderWidth**: `number`

###### edge.style.label.cornerRadius?

> `optional` **cornerRadius**: `number`

###### edge.style.label.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

###### edge.style.label.depthFadeFar?

> `optional` **depthFadeFar**: `number`

###### edge.style.label.depthFadeNear?

> `optional` **depthFadeNear**: `number`

###### edge.style.label.enabled?

> `optional` **enabled**: `boolean`

###### edge.style.label.font?

> `optional` **font**: `string`

###### edge.style.label.fontSize?

> `optional` **fontSize**: `number`

###### edge.style.label.fontWeight?

> `optional` **fontWeight**: `string`

###### edge.style.label.icon?

> `optional` **icon**: `string`

###### edge.style.label.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

###### edge.style.label.lineHeight?

> `optional` **lineHeight**: `number`

###### edge.style.label.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

###### edge.style.label.marginBottom?

> `optional` **marginBottom**: `number`

###### edge.style.label.marginLeft?

> `optional` **marginLeft**: `number`

###### edge.style.label.marginRight?

> `optional` **marginRight**: `number`

###### edge.style.label.marginTop?

> `optional` **marginTop**: `number`

###### edge.style.label.maxNumber?

> `optional` **maxNumber**: `number`

###### edge.style.label.overflowSuffix?

> `optional` **overflowSuffix**: `string`

###### edge.style.label.pointer?

> `optional` **pointer**: `boolean`

###### edge.style.label.pointerCurve?

> `optional` **pointerCurve**: `boolean`

###### edge.style.label.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

###### edge.style.label.pointerHeight?

> `optional` **pointerHeight**: `number`

###### edge.style.label.pointerOffset?

> `optional` **pointerOffset**: `number`

###### edge.style.label.pointerWidth?

> `optional` **pointerWidth**: `number`

###### edge.style.label.position?

> `optional` **position**: `object`

###### edge.style.label.position.x

> **x**: `number`

###### edge.style.label.position.y

> **y**: `number`

###### edge.style.label.position.z

> **z**: `number`

###### edge.style.label.progress?

> `optional` **progress**: `number`

###### edge.style.label.resolution?

> `optional` **resolution**: `number`

###### edge.style.label.smartOverflow?

> `optional` **smartOverflow**: `boolean`

###### edge.style.label.text?

> `optional` **text**: `string`

###### edge.style.label.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

###### edge.style.label.textColor?

> `optional` **textColor**: `string`

###### edge.style.label.textOutline?

> `optional` **textOutline**: `boolean`

###### edge.style.label.textOutlineColor?

> `optional` **textOutlineColor**: `string`

###### edge.style.label.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

###### edge.style.label.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

###### edge.style.label.textPath?

> `optional` **textPath**: `string`

###### edge.style.label.textShadow?

> `optional` **textShadow**: `boolean`

###### edge.style.label.textShadowBlur?

> `optional` **textShadowBlur**: `number`

###### edge.style.label.textShadowColor?

> `optional` **textShadowColor**: `string`

###### edge.style.label.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

###### edge.style.label.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

###### edge.style.line?

> `optional` **line**: `object`

###### edge.style.line.animationSpeed?

> `optional` **animationSpeed**: `number`

###### edge.style.line.bezier?

> `optional` **bezier**: `boolean`

###### edge.style.line.color?

> `optional` **color**: `string`

###### edge.style.line.opacity?

> `optional` **opacity**: `number`

###### edge.style.line.type?

> `optional` **type**: `"solid"` \| `"dot"` \| `"diamond"` \| `"box"` \| `"star"` \| `"dash"` \| `"dash-dot"` \| `"sinewave"` \| `"zigzag"`

###### edge.style.line.width?

> `optional` **width**: `number`

###### edge.style.tooltip?

> `optional` **tooltip**: `object`

###### edge.style.tooltip.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

###### edge.style.tooltip.animationSpeed?

> `optional` **animationSpeed**: `number`

###### edge.style.tooltip.attachOffset?

> `optional` **attachOffset**: `number`

###### edge.style.tooltip.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

###### edge.style.tooltip.autoSize?

> `optional` **autoSize**: `boolean`

###### edge.style.tooltip.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

###### edge.style.tooltip.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

###### edge.style.tooltip.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

###### edge.style.tooltip.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

###### edge.style.tooltip.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

###### edge.style.tooltip.backgroundPadding?

> `optional` **backgroundPadding**: `number`

###### edge.style.tooltip.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

###### edge.style.tooltip.billboardMode?

> `optional` **billboardMode**: `number`

###### edge.style.tooltip.borderColor?

> `optional` **borderColor**: `string`

###### edge.style.tooltip.borders?

> `optional` **borders**: `object`[]

###### edge.style.tooltip.borderWidth?

> `optional` **borderWidth**: `number`

###### edge.style.tooltip.cornerRadius?

> `optional` **cornerRadius**: `number`

###### edge.style.tooltip.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

###### edge.style.tooltip.depthFadeFar?

> `optional` **depthFadeFar**: `number`

###### edge.style.tooltip.depthFadeNear?

> `optional` **depthFadeNear**: `number`

###### edge.style.tooltip.enabled?

> `optional` **enabled**: `boolean`

###### edge.style.tooltip.font?

> `optional` **font**: `string`

###### edge.style.tooltip.fontSize?

> `optional` **fontSize**: `number`

###### edge.style.tooltip.fontWeight?

> `optional` **fontWeight**: `string`

###### edge.style.tooltip.icon?

> `optional` **icon**: `string`

###### edge.style.tooltip.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

###### edge.style.tooltip.lineHeight?

> `optional` **lineHeight**: `number`

###### edge.style.tooltip.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

###### edge.style.tooltip.marginBottom?

> `optional` **marginBottom**: `number`

###### edge.style.tooltip.marginLeft?

> `optional` **marginLeft**: `number`

###### edge.style.tooltip.marginRight?

> `optional` **marginRight**: `number`

###### edge.style.tooltip.marginTop?

> `optional` **marginTop**: `number`

###### edge.style.tooltip.maxNumber?

> `optional` **maxNumber**: `number`

###### edge.style.tooltip.overflowSuffix?

> `optional` **overflowSuffix**: `string`

###### edge.style.tooltip.pointer?

> `optional` **pointer**: `boolean`

###### edge.style.tooltip.pointerCurve?

> `optional` **pointerCurve**: `boolean`

###### edge.style.tooltip.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

###### edge.style.tooltip.pointerHeight?

> `optional` **pointerHeight**: `number`

###### edge.style.tooltip.pointerOffset?

> `optional` **pointerOffset**: `number`

###### edge.style.tooltip.pointerWidth?

> `optional` **pointerWidth**: `number`

###### edge.style.tooltip.position?

> `optional` **position**: `object`

###### edge.style.tooltip.position.x

> **x**: `number`

###### edge.style.tooltip.position.y

> **y**: `number`

###### edge.style.tooltip.position.z

> **z**: `number`

###### edge.style.tooltip.progress?

> `optional` **progress**: `number`

###### edge.style.tooltip.resolution?

> `optional` **resolution**: `number`

###### edge.style.tooltip.smartOverflow?

> `optional` **smartOverflow**: `boolean`

###### edge.style.tooltip.text?

> `optional` **text**: `string`

###### edge.style.tooltip.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

###### edge.style.tooltip.textColor?

> `optional` **textColor**: `string`

###### edge.style.tooltip.textOutline?

> `optional` **textOutline**: `boolean`

###### edge.style.tooltip.textOutlineColor?

> `optional` **textOutlineColor**: `string`

###### edge.style.tooltip.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

###### edge.style.tooltip.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

###### edge.style.tooltip.textPath?

> `optional` **textPath**: `string`

###### edge.style.tooltip.textShadow?

> `optional` **textShadow**: `boolean`

###### edge.style.tooltip.textShadowBlur?

> `optional` **textShadowBlur**: `number`

###### edge.style.tooltip.textShadowColor?

> `optional` **textShadowColor**: `string`

###### edge.style.tooltip.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

###### edge.style.tooltip.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

##### metadata?

> `optional` **metadata**: `object`

###### metadata.name

> **name**: `string`

##### node?

> `optional` **node**: `object` = `AppliedNodeStyle`

###### node.calculatedStyle?

> `optional` **calculatedStyle**: `object`

###### node.calculatedStyle.expr

> **expr**: `string`

###### node.calculatedStyle.inputs

> **inputs**: `string`[]

###### node.calculatedStyle.output

> **output**: `string` = `AllowedOuputPaths`

###### node.selector

> **selector**: `string`

###### node.style

> **style**: `object` = `NodeStyle`

###### node.style.effect?

> `optional` **effect**: `object`

###### node.style.effect.flatShaded?

> `optional` **flatShaded**: `boolean`

###### node.style.effect.glow?

> `optional` **glow**: `object`

###### node.style.effect.glow.color?

> `optional` **color**: `string`

###### node.style.effect.glow.strength?

> `optional` **strength**: `number`

###### node.style.effect.outline?

> `optional` **outline**: `object`

###### node.style.effect.outline.color?

> `optional` **color**: `string`

###### node.style.effect.outline.width?

> `optional` **width**: `number`

###### node.style.effect.wireframe?

> `optional` **wireframe**: `boolean`

###### node.style.enabled?

> `optional` **enabled**: `boolean`

###### node.style.label?

> `optional` **label**: `object`

###### node.style.label.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

###### node.style.label.animationSpeed?

> `optional` **animationSpeed**: `number`

###### node.style.label.attachOffset?

> `optional` **attachOffset**: `number`

###### node.style.label.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

###### node.style.label.autoSize?

> `optional` **autoSize**: `boolean`

###### node.style.label.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

###### node.style.label.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

###### node.style.label.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

###### node.style.label.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

###### node.style.label.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

###### node.style.label.backgroundPadding?

> `optional` **backgroundPadding**: `number`

###### node.style.label.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

###### node.style.label.billboardMode?

> `optional` **billboardMode**: `number`

###### node.style.label.borderColor?

> `optional` **borderColor**: `string`

###### node.style.label.borders?

> `optional` **borders**: `object`[]

###### node.style.label.borderWidth?

> `optional` **borderWidth**: `number`

###### node.style.label.cornerRadius?

> `optional` **cornerRadius**: `number`

###### node.style.label.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

###### node.style.label.depthFadeFar?

> `optional` **depthFadeFar**: `number`

###### node.style.label.depthFadeNear?

> `optional` **depthFadeNear**: `number`

###### node.style.label.enabled?

> `optional` **enabled**: `boolean`

###### node.style.label.font?

> `optional` **font**: `string`

###### node.style.label.fontSize?

> `optional` **fontSize**: `number`

###### node.style.label.fontWeight?

> `optional` **fontWeight**: `string`

###### node.style.label.icon?

> `optional` **icon**: `string`

###### node.style.label.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

###### node.style.label.lineHeight?

> `optional` **lineHeight**: `number`

###### node.style.label.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

###### node.style.label.marginBottom?

> `optional` **marginBottom**: `number`

###### node.style.label.marginLeft?

> `optional` **marginLeft**: `number`

###### node.style.label.marginRight?

> `optional` **marginRight**: `number`

###### node.style.label.marginTop?

> `optional` **marginTop**: `number`

###### node.style.label.maxNumber?

> `optional` **maxNumber**: `number`

###### node.style.label.overflowSuffix?

> `optional` **overflowSuffix**: `string`

###### node.style.label.pointer?

> `optional` **pointer**: `boolean`

###### node.style.label.pointerCurve?

> `optional` **pointerCurve**: `boolean`

###### node.style.label.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

###### node.style.label.pointerHeight?

> `optional` **pointerHeight**: `number`

###### node.style.label.pointerOffset?

> `optional` **pointerOffset**: `number`

###### node.style.label.pointerWidth?

> `optional` **pointerWidth**: `number`

###### node.style.label.position?

> `optional` **position**: `object`

###### node.style.label.position.x

> **x**: `number`

###### node.style.label.position.y

> **y**: `number`

###### node.style.label.position.z

> **z**: `number`

###### node.style.label.progress?

> `optional` **progress**: `number`

###### node.style.label.resolution?

> `optional` **resolution**: `number`

###### node.style.label.smartOverflow?

> `optional` **smartOverflow**: `boolean`

###### node.style.label.text?

> `optional` **text**: `string`

###### node.style.label.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

###### node.style.label.textColor?

> `optional` **textColor**: `string`

###### node.style.label.textOutline?

> `optional` **textOutline**: `boolean`

###### node.style.label.textOutlineColor?

> `optional` **textOutlineColor**: `string`

###### node.style.label.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

###### node.style.label.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

###### node.style.label.textPath?

> `optional` **textPath**: `string`

###### node.style.label.textShadow?

> `optional` **textShadow**: `boolean`

###### node.style.label.textShadowBlur?

> `optional` **textShadowBlur**: `number`

###### node.style.label.textShadowColor?

> `optional` **textShadowColor**: `string`

###### node.style.label.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

###### node.style.label.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

###### node.style.shape?

> `optional` **shape**: `object`

###### node.style.shape.size?

> `optional` **size**: `number`

###### node.style.shape.type?

> `optional` **type**: `"box"` \| `"sphere"` \| `"cylinder"` \| `"cone"` \| `"capsule"` \| `"torus-knot"` \| `"tetrahedron"` \| `"octahedron"` \| `"dodecahedron"` \| `"icosahedron"` \| `"rhombicuboctahedron"` \| `"triangular_prism"` \| `"pentagonal_prism"` \| `"hexagonal_prism"` \| `"square_pyramid"` \| `"pentagonal_pyramid"` \| `"triangular_dipyramid"` \| `"pentagonal_dipyramid"` \| `"elongated_square_dipyramid"` \| `"elongated_pentagonal_dipyramid"` \| `"elongated_pentagonal_cupola"` \| `"goldberg"` \| `"icosphere"` \| `"geodesic"`

###### node.style.texture?

> `optional` **texture**: `object`

###### node.style.texture.color?

> `optional` **color**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

###### node.style.texture.icon?

> `optional` **icon**: `string`

###### node.style.texture.image?

> `optional` **image**: `string`

###### node.style.tooltip?

> `optional` **tooltip**: `object`

###### node.style.tooltip.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

###### node.style.tooltip.animationSpeed?

> `optional` **animationSpeed**: `number`

###### node.style.tooltip.attachOffset?

> `optional` **attachOffset**: `number`

###### node.style.tooltip.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

###### node.style.tooltip.autoSize?

> `optional` **autoSize**: `boolean`

###### node.style.tooltip.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

###### node.style.tooltip.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

###### node.style.tooltip.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

###### node.style.tooltip.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

###### node.style.tooltip.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

###### node.style.tooltip.backgroundPadding?

> `optional` **backgroundPadding**: `number`

###### node.style.tooltip.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

###### node.style.tooltip.billboardMode?

> `optional` **billboardMode**: `number`

###### node.style.tooltip.borderColor?

> `optional` **borderColor**: `string`

###### node.style.tooltip.borders?

> `optional` **borders**: `object`[]

###### node.style.tooltip.borderWidth?

> `optional` **borderWidth**: `number`

###### node.style.tooltip.cornerRadius?

> `optional` **cornerRadius**: `number`

###### node.style.tooltip.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

###### node.style.tooltip.depthFadeFar?

> `optional` **depthFadeFar**: `number`

###### node.style.tooltip.depthFadeNear?

> `optional` **depthFadeNear**: `number`

###### node.style.tooltip.enabled?

> `optional` **enabled**: `boolean`

###### node.style.tooltip.font?

> `optional` **font**: `string`

###### node.style.tooltip.fontSize?

> `optional` **fontSize**: `number`

###### node.style.tooltip.fontWeight?

> `optional` **fontWeight**: `string`

###### node.style.tooltip.icon?

> `optional` **icon**: `string`

###### node.style.tooltip.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

###### node.style.tooltip.lineHeight?

> `optional` **lineHeight**: `number`

###### node.style.tooltip.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

###### node.style.tooltip.marginBottom?

> `optional` **marginBottom**: `number`

###### node.style.tooltip.marginLeft?

> `optional` **marginLeft**: `number`

###### node.style.tooltip.marginRight?

> `optional` **marginRight**: `number`

###### node.style.tooltip.marginTop?

> `optional` **marginTop**: `number`

###### node.style.tooltip.maxNumber?

> `optional` **maxNumber**: `number`

###### node.style.tooltip.overflowSuffix?

> `optional` **overflowSuffix**: `string`

###### node.style.tooltip.pointer?

> `optional` **pointer**: `boolean`

###### node.style.tooltip.pointerCurve?

> `optional` **pointerCurve**: `boolean`

###### node.style.tooltip.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

###### node.style.tooltip.pointerHeight?

> `optional` **pointerHeight**: `number`

###### node.style.tooltip.pointerOffset?

> `optional` **pointerOffset**: `number`

###### node.style.tooltip.pointerWidth?

> `optional` **pointerWidth**: `number`

###### node.style.tooltip.position?

> `optional` **position**: `object`

###### node.style.tooltip.position.x

> **x**: `number`

###### node.style.tooltip.position.y

> **y**: `number`

###### node.style.tooltip.position.z

> **z**: `number`

###### node.style.tooltip.progress?

> `optional` **progress**: `number`

###### node.style.tooltip.resolution?

> `optional` **resolution**: `number`

###### node.style.tooltip.smartOverflow?

> `optional` **smartOverflow**: `boolean`

###### node.style.tooltip.text?

> `optional` **text**: `string`

###### node.style.tooltip.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

###### node.style.tooltip.textColor?

> `optional` **textColor**: `string`

###### node.style.tooltip.textOutline?

> `optional` **textOutline**: `boolean`

###### node.style.tooltip.textOutlineColor?

> `optional` **textOutlineColor**: `string`

###### node.style.tooltip.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

###### node.style.tooltip.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

###### node.style.tooltip.textPath?

> `optional` **textPath**: `string`

###### node.style.tooltip.textShadow?

> `optional` **textShadow**: `boolean`

###### node.style.tooltip.textShadowBlur?

> `optional` **textShadowBlur**: `number`

###### node.style.tooltip.textShadowColor?

> `optional` **textShadowColor**: `string`

###### node.style.tooltip.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

###### node.style.tooltip.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/SelectionManager.ts:69](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/SelectionManager.ts#L69)

Initialize the selection manager

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### isSelected()

> **isSelected**(`node`): `boolean`

Defined in: [src/managers/SelectionManager.ts:116](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/SelectionManager.ts#L116)

Check if a specific node is currently selected.

#### Parameters

##### node

[`Node`](../../Node/classes/Node.md)

The node to check.

#### Returns

`boolean`

True if the node is selected, false otherwise.

***

### onNodeRemoved()

> **onNodeRemoved**(`node`): `void`

Defined in: [src/managers/SelectionManager.ts:217](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/SelectionManager.ts#L217)

Handle node removal.
Should be called when a node is removed from the graph.
If the removed node was selected, the selection is cleared.

#### Parameters

##### node

[`Node`](../../Node/classes/Node.md)

The node being removed.

#### Returns

`void`

***

### select()

> **select**(`node`): `void`

Defined in: [src/managers/SelectionManager.ts:126](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/SelectionManager.ts#L126)

Select a node.
If another node is currently selected, it will be deselected first.
Emits a selection-changed event.

#### Parameters

##### node

[`Node`](../../Node/classes/Node.md)

The node to select.

#### Returns

`void`

***

### selectById()

> **selectById**(`nodeId`): `boolean`

Defined in: [src/managers/SelectionManager.ts:153](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/SelectionManager.ts#L153)

Select a node by its ID.
Requires DataManager to be set via setDataManager().

#### Parameters

##### nodeId

The ID of the node to select.

`string` | `number`

#### Returns

`boolean`

True if the node was found and selected, false if not found.

***

### setDataManager()

> **setDataManager**(`dataManager`): `void`

Defined in: [src/managers/SelectionManager.ts:90](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/SelectionManager.ts#L90)

Set the DataManager reference.
Required for selectById() functionality.

#### Parameters

##### dataManager

[`DataManager`](DataManager.md)

The data manager instance

#### Returns

`void`

***

### setSelectionStyleLayer()

> **setSelectionStyleLayer**(`layer`): `void`

Defined in: [src/managers/SelectionManager.ts:199](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/SelectionManager.ts#L199)

Update the selection style layer.
Use this to customize the appearance of selected nodes.

#### Parameters

##### layer

The new selection style layer configuration.

###### edge?

\{ `calculatedStyle?`: \{ `expr`: `string`; `inputs`: `string`[]; `output`: `string`; \}; `selector`: `string`; `style`: \{ `arrowHead?`: \{ `color?`: `string`; `opacity?`: `number`; `size?`: `number`; `text?`: \{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: ... \| ...; `value`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"radial-gradient"`; `opacity?`: ... \| ...; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (... \| ...)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \}; `type?`: `"none"` \| `"dot"` \| `"normal"` \| `"inverted"` \| `"sphere-dot"` \| `"open-dot"` \| `"tee"` \| `"open-normal"` \| `"diamond"` \| `"open-diamond"` \| `"crow"` \| `"box"` \| `"half-open"` \| `"vee"`; \}; `arrowTail?`: \{ `color?`: `string`; `opacity?`: `number`; `size?`: `number`; `text?`: \{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: ... \| ...; `value`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"radial-gradient"`; `opacity?`: ... \| ...; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (... \| ...)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \}; `type?`: `"none"` \| `"dot"` \| `"normal"` \| `"inverted"` \| `"sphere-dot"` \| `"open-dot"` \| `"tee"` \| `"open-normal"` \| `"diamond"` \| `"open-diamond"` \| `"crow"` \| `"box"` \| `"half-open"` \| `"vee"`; \}; `enabled?`: `boolean`; `label?`: \{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (`string` \| `undefined`)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \}; `line?`: \{ `animationSpeed?`: `number`; `bezier?`: `boolean`; `color?`: `string`; `opacity?`: `number`; `type?`: `"solid"` \| `"dot"` \| `"diamond"` \| `"box"` \| `"star"` \| `"dash"` \| `"dash-dot"` \| `"sinewave"` \| `"zigzag"`; `width?`: `number`; \}; `tooltip?`: \{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (`string` \| `undefined`)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \}; \}; \} = `AppliedEdgeStyle`

###### edge.calculatedStyle?

\{ `expr`: `string`; `inputs`: `string`[]; `output`: `string`; \} = `...`

###### edge.calculatedStyle.expr

`string` = `...`

###### edge.calculatedStyle.inputs

`string`[] = `...`

###### edge.calculatedStyle.output

`string` = `AllowedOuputPaths`

###### edge.selector

`string` = `...`

###### edge.style

\{ `arrowHead?`: \{ `color?`: `string`; `opacity?`: `number`; `size?`: `number`; `text?`: \{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: ... \| ...; `value`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"radial-gradient"`; `opacity?`: ... \| ...; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (... \| ...)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \}; `type?`: `"none"` \| `"dot"` \| `"normal"` \| `"inverted"` \| `"sphere-dot"` \| `"open-dot"` \| `"tee"` \| `"open-normal"` \| `"diamond"` \| `"open-diamond"` \| `"crow"` \| `"box"` \| `"half-open"` \| `"vee"`; \}; `arrowTail?`: \{ `color?`: `string`; `opacity?`: `number`; `size?`: `number`; `text?`: \{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: ... \| ...; `value`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"radial-gradient"`; `opacity?`: ... \| ...; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (... \| ...)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \}; `type?`: `"none"` \| `"dot"` \| `"normal"` \| `"inverted"` \| `"sphere-dot"` \| `"open-dot"` \| `"tee"` \| `"open-normal"` \| `"diamond"` \| `"open-diamond"` \| `"crow"` \| `"box"` \| `"half-open"` \| `"vee"`; \}; `enabled?`: `boolean`; `label?`: \{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (`string` \| `undefined`)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \}; `line?`: \{ `animationSpeed?`: `number`; `bezier?`: `boolean`; `color?`: `string`; `opacity?`: `number`; `type?`: `"solid"` \| `"dot"` \| `"diamond"` \| `"box"` \| `"star"` \| `"dash"` \| `"dash-dot"` \| `"sinewave"` \| `"zigzag"`; `width?`: `number`; \}; `tooltip?`: \{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (`string` \| `undefined`)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \}; \} = `EdgeStyle`

###### edge.style.arrowHead?

\{ `color?`: `string`; `opacity?`: `number`; `size?`: `number`; `text?`: \{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: ... \| ...; `value`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"radial-gradient"`; `opacity?`: ... \| ...; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (... \| ...)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \}; `type?`: `"none"` \| `"dot"` \| `"normal"` \| `"inverted"` \| `"sphere-dot"` \| `"open-dot"` \| `"tee"` \| `"open-normal"` \| `"diamond"` \| `"open-diamond"` \| `"crow"` \| `"box"` \| `"half-open"` \| `"vee"`; \} = `...`

###### edge.style.arrowHead.color?

`string` = `...`

###### edge.style.arrowHead.opacity?

`number` = `...`

###### edge.style.arrowHead.size?

`number` = `...`

###### edge.style.arrowHead.text?

\{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: ... \| ...; `value`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"radial-gradient"`; `opacity?`: ... \| ...; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (... \| ...)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \} = `...`

###### edge.style.arrowHead.text.animation?

`"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"` = `...`

###### edge.style.arrowHead.text.animationSpeed?

`number` = `...`

###### edge.style.arrowHead.text.attachOffset?

`number` = `...`

###### edge.style.arrowHead.text.attachPosition?

`"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` = `...`

###### edge.style.arrowHead.text.autoSize?

`boolean` = `...`

###### edge.style.arrowHead.text.backgroundColor?

`string` \| \{ `colorType`: `"solid"`; `opacity?`: ... \| ...; `value`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"radial-gradient"`; `opacity?`: ... \| ...; \} = `...`

###### edge.style.arrowHead.text.backgroundGradient?

`boolean` = `...`

###### edge.style.arrowHead.text.backgroundGradientColors?

(... \| ...)[] = `...`

###### edge.style.arrowHead.text.backgroundGradientDirection?

`"vertical"` \| `"horizontal"` \| `"diagonal"` = `...`

###### edge.style.arrowHead.text.backgroundGradientType?

`"linear"` \| `"radial"` = `...`

###### edge.style.arrowHead.text.backgroundPadding?

`number` = `...`

###### edge.style.arrowHead.text.badge?

`"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"` = `...`

###### edge.style.arrowHead.text.billboardMode?

`number` = `...`

###### edge.style.arrowHead.text.borderColor?

`string` = `...`

###### edge.style.arrowHead.text.borders?

`object`[] = `...`

###### edge.style.arrowHead.text.borderWidth?

`number` = `...`

###### edge.style.arrowHead.text.cornerRadius?

`number` = `...`

###### edge.style.arrowHead.text.depthFadeEnabled?

`boolean` = `...`

###### edge.style.arrowHead.text.depthFadeFar?

`number` = `...`

###### edge.style.arrowHead.text.depthFadeNear?

`number` = `...`

###### edge.style.arrowHead.text.enabled?

`boolean` = `...`

###### edge.style.arrowHead.text.font?

`string` = `...`

###### edge.style.arrowHead.text.fontSize?

`number` = `...`

###### edge.style.arrowHead.text.fontWeight?

`string` = `...`

###### edge.style.arrowHead.text.icon?

`string` = `...`

###### edge.style.arrowHead.text.iconPosition?

`"left"` \| `"right"` = `...`

###### edge.style.arrowHead.text.lineHeight?

`number` = `...`

###### edge.style.arrowHead.text.location?

`"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"` = `...`

###### edge.style.arrowHead.text.marginBottom?

`number` = `...`

###### edge.style.arrowHead.text.marginLeft?

`number` = `...`

###### edge.style.arrowHead.text.marginRight?

`number` = `...`

###### edge.style.arrowHead.text.marginTop?

`number` = `...`

###### edge.style.arrowHead.text.maxNumber?

`number` = `...`

###### edge.style.arrowHead.text.overflowSuffix?

`string` = `...`

###### edge.style.arrowHead.text.pointer?

`boolean` = `...`

###### edge.style.arrowHead.text.pointerCurve?

`boolean` = `...`

###### edge.style.arrowHead.text.pointerDirection?

`"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"` = `...`

###### edge.style.arrowHead.text.pointerHeight?

`number` = `...`

###### edge.style.arrowHead.text.pointerOffset?

`number` = `...`

###### edge.style.arrowHead.text.pointerWidth?

`number` = `...`

###### edge.style.arrowHead.text.position?

\{ `x`: `number`; `y`: `number`; `z`: `number`; \} = `...`

###### edge.style.arrowHead.text.position.x

`number` = `...`

###### edge.style.arrowHead.text.position.y

`number` = `...`

###### edge.style.arrowHead.text.position.z

`number` = `...`

###### edge.style.arrowHead.text.progress?

`number` = `...`

###### edge.style.arrowHead.text.resolution?

`number` = `...`

###### edge.style.arrowHead.text.smartOverflow?

`boolean` = `...`

###### edge.style.arrowHead.text.text?

`string` = `...`

###### edge.style.arrowHead.text.textAlign?

`"left"` \| `"center"` \| `"right"` = `...`

###### edge.style.arrowHead.text.textColor?

`string` = `...`

###### edge.style.arrowHead.text.textOutline?

`boolean` = `...`

###### edge.style.arrowHead.text.textOutlineColor?

`string` = `...`

###### edge.style.arrowHead.text.textOutlineJoin?

`"round"` \| `"bevel"` \| `"miter"` = `...`

###### edge.style.arrowHead.text.textOutlineWidth?

`number` = `...`

###### edge.style.arrowHead.text.textPath?

`string` = `...`

###### edge.style.arrowHead.text.textShadow?

`boolean` = `...`

###### edge.style.arrowHead.text.textShadowBlur?

`number` = `...`

###### edge.style.arrowHead.text.textShadowColor?

`string` = `...`

###### edge.style.arrowHead.text.textShadowOffsetX?

`number` = `...`

###### edge.style.arrowHead.text.textShadowOffsetY?

`number` = `...`

###### edge.style.arrowHead.type?

`"none"` \| `"dot"` \| `"normal"` \| `"inverted"` \| `"sphere-dot"` \| `"open-dot"` \| `"tee"` \| `"open-normal"` \| `"diamond"` \| `"open-diamond"` \| `"crow"` \| `"box"` \| `"half-open"` \| `"vee"` = `...`

###### edge.style.arrowTail?

\{ `color?`: `string`; `opacity?`: `number`; `size?`: `number`; `text?`: \{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: ... \| ...; `value`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"radial-gradient"`; `opacity?`: ... \| ...; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (... \| ...)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \}; `type?`: `"none"` \| `"dot"` \| `"normal"` \| `"inverted"` \| `"sphere-dot"` \| `"open-dot"` \| `"tee"` \| `"open-normal"` \| `"diamond"` \| `"open-diamond"` \| `"crow"` \| `"box"` \| `"half-open"` \| `"vee"`; \} = `...`

###### edge.style.arrowTail.color?

`string` = `...`

###### edge.style.arrowTail.opacity?

`number` = `...`

###### edge.style.arrowTail.size?

`number` = `...`

###### edge.style.arrowTail.text?

\{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: ... \| ...; `value`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"radial-gradient"`; `opacity?`: ... \| ...; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (... \| ...)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \} = `...`

###### edge.style.arrowTail.text.animation?

`"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"` = `...`

###### edge.style.arrowTail.text.animationSpeed?

`number` = `...`

###### edge.style.arrowTail.text.attachOffset?

`number` = `...`

###### edge.style.arrowTail.text.attachPosition?

`"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` = `...`

###### edge.style.arrowTail.text.autoSize?

`boolean` = `...`

###### edge.style.arrowTail.text.backgroundColor?

`string` \| \{ `colorType`: `"solid"`; `opacity?`: ... \| ...; `value`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: ... \| ...; \} \| \{ `colors`: ...[]; `colorType`: `"radial-gradient"`; `opacity?`: ... \| ...; \} = `...`

###### edge.style.arrowTail.text.backgroundGradient?

`boolean` = `...`

###### edge.style.arrowTail.text.backgroundGradientColors?

(... \| ...)[] = `...`

###### edge.style.arrowTail.text.backgroundGradientDirection?

`"vertical"` \| `"horizontal"` \| `"diagonal"` = `...`

###### edge.style.arrowTail.text.backgroundGradientType?

`"linear"` \| `"radial"` = `...`

###### edge.style.arrowTail.text.backgroundPadding?

`number` = `...`

###### edge.style.arrowTail.text.badge?

`"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"` = `...`

###### edge.style.arrowTail.text.billboardMode?

`number` = `...`

###### edge.style.arrowTail.text.borderColor?

`string` = `...`

###### edge.style.arrowTail.text.borders?

`object`[] = `...`

###### edge.style.arrowTail.text.borderWidth?

`number` = `...`

###### edge.style.arrowTail.text.cornerRadius?

`number` = `...`

###### edge.style.arrowTail.text.depthFadeEnabled?

`boolean` = `...`

###### edge.style.arrowTail.text.depthFadeFar?

`number` = `...`

###### edge.style.arrowTail.text.depthFadeNear?

`number` = `...`

###### edge.style.arrowTail.text.enabled?

`boolean` = `...`

###### edge.style.arrowTail.text.font?

`string` = `...`

###### edge.style.arrowTail.text.fontSize?

`number` = `...`

###### edge.style.arrowTail.text.fontWeight?

`string` = `...`

###### edge.style.arrowTail.text.icon?

`string` = `...`

###### edge.style.arrowTail.text.iconPosition?

`"left"` \| `"right"` = `...`

###### edge.style.arrowTail.text.lineHeight?

`number` = `...`

###### edge.style.arrowTail.text.location?

`"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"` = `...`

###### edge.style.arrowTail.text.marginBottom?

`number` = `...`

###### edge.style.arrowTail.text.marginLeft?

`number` = `...`

###### edge.style.arrowTail.text.marginRight?

`number` = `...`

###### edge.style.arrowTail.text.marginTop?

`number` = `...`

###### edge.style.arrowTail.text.maxNumber?

`number` = `...`

###### edge.style.arrowTail.text.overflowSuffix?

`string` = `...`

###### edge.style.arrowTail.text.pointer?

`boolean` = `...`

###### edge.style.arrowTail.text.pointerCurve?

`boolean` = `...`

###### edge.style.arrowTail.text.pointerDirection?

`"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"` = `...`

###### edge.style.arrowTail.text.pointerHeight?

`number` = `...`

###### edge.style.arrowTail.text.pointerOffset?

`number` = `...`

###### edge.style.arrowTail.text.pointerWidth?

`number` = `...`

###### edge.style.arrowTail.text.position?

\{ `x`: `number`; `y`: `number`; `z`: `number`; \} = `...`

###### edge.style.arrowTail.text.position.x

`number` = `...`

###### edge.style.arrowTail.text.position.y

`number` = `...`

###### edge.style.arrowTail.text.position.z

`number` = `...`

###### edge.style.arrowTail.text.progress?

`number` = `...`

###### edge.style.arrowTail.text.resolution?

`number` = `...`

###### edge.style.arrowTail.text.smartOverflow?

`boolean` = `...`

###### edge.style.arrowTail.text.text?

`string` = `...`

###### edge.style.arrowTail.text.textAlign?

`"left"` \| `"center"` \| `"right"` = `...`

###### edge.style.arrowTail.text.textColor?

`string` = `...`

###### edge.style.arrowTail.text.textOutline?

`boolean` = `...`

###### edge.style.arrowTail.text.textOutlineColor?

`string` = `...`

###### edge.style.arrowTail.text.textOutlineJoin?

`"round"` \| `"bevel"` \| `"miter"` = `...`

###### edge.style.arrowTail.text.textOutlineWidth?

`number` = `...`

###### edge.style.arrowTail.text.textPath?

`string` = `...`

###### edge.style.arrowTail.text.textShadow?

`boolean` = `...`

###### edge.style.arrowTail.text.textShadowBlur?

`number` = `...`

###### edge.style.arrowTail.text.textShadowColor?

`string` = `...`

###### edge.style.arrowTail.text.textShadowOffsetX?

`number` = `...`

###### edge.style.arrowTail.text.textShadowOffsetY?

`number` = `...`

###### edge.style.arrowTail.type?

`"none"` \| `"dot"` \| `"normal"` \| `"inverted"` \| `"sphere-dot"` \| `"open-dot"` \| `"tee"` \| `"open-normal"` \| `"diamond"` \| `"open-diamond"` \| `"crow"` \| `"box"` \| `"half-open"` \| `"vee"` = `...`

###### edge.style.enabled?

`boolean` = `...`

###### edge.style.label?

\{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (`string` \| `undefined`)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \} = `...`

###### edge.style.label.animation?

`"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"` = `...`

###### edge.style.label.animationSpeed?

`number` = `...`

###### edge.style.label.attachOffset?

`number` = `...`

###### edge.style.label.attachPosition?

`"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` = `...`

###### edge.style.label.autoSize?

`boolean` = `...`

###### edge.style.label.backgroundColor?

`string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \} = `...`

###### edge.style.label.backgroundGradient?

`boolean` = `...`

###### edge.style.label.backgroundGradientColors?

(`string` \| `undefined`)[] = `...`

###### edge.style.label.backgroundGradientDirection?

`"vertical"` \| `"horizontal"` \| `"diagonal"` = `...`

###### edge.style.label.backgroundGradientType?

`"linear"` \| `"radial"` = `...`

###### edge.style.label.backgroundPadding?

`number` = `...`

###### edge.style.label.badge?

`"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"` = `...`

###### edge.style.label.billboardMode?

`number` = `...`

###### edge.style.label.borderColor?

`string` = `...`

###### edge.style.label.borders?

`object`[] = `...`

###### edge.style.label.borderWidth?

`number` = `...`

###### edge.style.label.cornerRadius?

`number` = `...`

###### edge.style.label.depthFadeEnabled?

`boolean` = `...`

###### edge.style.label.depthFadeFar?

`number` = `...`

###### edge.style.label.depthFadeNear?

`number` = `...`

###### edge.style.label.enabled?

`boolean` = `...`

###### edge.style.label.font?

`string` = `...`

###### edge.style.label.fontSize?

`number` = `...`

###### edge.style.label.fontWeight?

`string` = `...`

###### edge.style.label.icon?

`string` = `...`

###### edge.style.label.iconPosition?

`"left"` \| `"right"` = `...`

###### edge.style.label.lineHeight?

`number` = `...`

###### edge.style.label.location?

`"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"` = `...`

###### edge.style.label.marginBottom?

`number` = `...`

###### edge.style.label.marginLeft?

`number` = `...`

###### edge.style.label.marginRight?

`number` = `...`

###### edge.style.label.marginTop?

`number` = `...`

###### edge.style.label.maxNumber?

`number` = `...`

###### edge.style.label.overflowSuffix?

`string` = `...`

###### edge.style.label.pointer?

`boolean` = `...`

###### edge.style.label.pointerCurve?

`boolean` = `...`

###### edge.style.label.pointerDirection?

`"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"` = `...`

###### edge.style.label.pointerHeight?

`number` = `...`

###### edge.style.label.pointerOffset?

`number` = `...`

###### edge.style.label.pointerWidth?

`number` = `...`

###### edge.style.label.position?

\{ `x`: `number`; `y`: `number`; `z`: `number`; \} = `...`

###### edge.style.label.position.x

`number` = `...`

###### edge.style.label.position.y

`number` = `...`

###### edge.style.label.position.z

`number` = `...`

###### edge.style.label.progress?

`number` = `...`

###### edge.style.label.resolution?

`number` = `...`

###### edge.style.label.smartOverflow?

`boolean` = `...`

###### edge.style.label.text?

`string` = `...`

###### edge.style.label.textAlign?

`"left"` \| `"center"` \| `"right"` = `...`

###### edge.style.label.textColor?

`string` = `...`

###### edge.style.label.textOutline?

`boolean` = `...`

###### edge.style.label.textOutlineColor?

`string` = `...`

###### edge.style.label.textOutlineJoin?

`"round"` \| `"bevel"` \| `"miter"` = `...`

###### edge.style.label.textOutlineWidth?

`number` = `...`

###### edge.style.label.textPath?

`string` = `...`

###### edge.style.label.textShadow?

`boolean` = `...`

###### edge.style.label.textShadowBlur?

`number` = `...`

###### edge.style.label.textShadowColor?

`string` = `...`

###### edge.style.label.textShadowOffsetX?

`number` = `...`

###### edge.style.label.textShadowOffsetY?

`number` = `...`

###### edge.style.line?

\{ `animationSpeed?`: `number`; `bezier?`: `boolean`; `color?`: `string`; `opacity?`: `number`; `type?`: `"solid"` \| `"dot"` \| `"diamond"` \| `"box"` \| `"star"` \| `"dash"` \| `"dash-dot"` \| `"sinewave"` \| `"zigzag"`; `width?`: `number`; \} = `...`

###### edge.style.line.animationSpeed?

`number` = `...`

###### edge.style.line.bezier?

`boolean` = `...`

###### edge.style.line.color?

`string` = `...`

###### edge.style.line.opacity?

`number` = `...`

###### edge.style.line.type?

`"solid"` \| `"dot"` \| `"diamond"` \| `"box"` \| `"star"` \| `"dash"` \| `"dash-dot"` \| `"sinewave"` \| `"zigzag"` = `...`

###### edge.style.line.width?

`number` = `...`

###### edge.style.tooltip?

\{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (`string` \| `undefined`)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \} = `...`

###### edge.style.tooltip.animation?

`"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"` = `...`

###### edge.style.tooltip.animationSpeed?

`number` = `...`

###### edge.style.tooltip.attachOffset?

`number` = `...`

###### edge.style.tooltip.attachPosition?

`"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` = `...`

###### edge.style.tooltip.autoSize?

`boolean` = `...`

###### edge.style.tooltip.backgroundColor?

`string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \} = `...`

###### edge.style.tooltip.backgroundGradient?

`boolean` = `...`

###### edge.style.tooltip.backgroundGradientColors?

(`string` \| `undefined`)[] = `...`

###### edge.style.tooltip.backgroundGradientDirection?

`"vertical"` \| `"horizontal"` \| `"diagonal"` = `...`

###### edge.style.tooltip.backgroundGradientType?

`"linear"` \| `"radial"` = `...`

###### edge.style.tooltip.backgroundPadding?

`number` = `...`

###### edge.style.tooltip.badge?

`"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"` = `...`

###### edge.style.tooltip.billboardMode?

`number` = `...`

###### edge.style.tooltip.borderColor?

`string` = `...`

###### edge.style.tooltip.borders?

`object`[] = `...`

###### edge.style.tooltip.borderWidth?

`number` = `...`

###### edge.style.tooltip.cornerRadius?

`number` = `...`

###### edge.style.tooltip.depthFadeEnabled?

`boolean` = `...`

###### edge.style.tooltip.depthFadeFar?

`number` = `...`

###### edge.style.tooltip.depthFadeNear?

`number` = `...`

###### edge.style.tooltip.enabled?

`boolean` = `...`

###### edge.style.tooltip.font?

`string` = `...`

###### edge.style.tooltip.fontSize?

`number` = `...`

###### edge.style.tooltip.fontWeight?

`string` = `...`

###### edge.style.tooltip.icon?

`string` = `...`

###### edge.style.tooltip.iconPosition?

`"left"` \| `"right"` = `...`

###### edge.style.tooltip.lineHeight?

`number` = `...`

###### edge.style.tooltip.location?

`"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"` = `...`

###### edge.style.tooltip.marginBottom?

`number` = `...`

###### edge.style.tooltip.marginLeft?

`number` = `...`

###### edge.style.tooltip.marginRight?

`number` = `...`

###### edge.style.tooltip.marginTop?

`number` = `...`

###### edge.style.tooltip.maxNumber?

`number` = `...`

###### edge.style.tooltip.overflowSuffix?

`string` = `...`

###### edge.style.tooltip.pointer?

`boolean` = `...`

###### edge.style.tooltip.pointerCurve?

`boolean` = `...`

###### edge.style.tooltip.pointerDirection?

`"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"` = `...`

###### edge.style.tooltip.pointerHeight?

`number` = `...`

###### edge.style.tooltip.pointerOffset?

`number` = `...`

###### edge.style.tooltip.pointerWidth?

`number` = `...`

###### edge.style.tooltip.position?

\{ `x`: `number`; `y`: `number`; `z`: `number`; \} = `...`

###### edge.style.tooltip.position.x

`number` = `...`

###### edge.style.tooltip.position.y

`number` = `...`

###### edge.style.tooltip.position.z

`number` = `...`

###### edge.style.tooltip.progress?

`number` = `...`

###### edge.style.tooltip.resolution?

`number` = `...`

###### edge.style.tooltip.smartOverflow?

`boolean` = `...`

###### edge.style.tooltip.text?

`string` = `...`

###### edge.style.tooltip.textAlign?

`"left"` \| `"center"` \| `"right"` = `...`

###### edge.style.tooltip.textColor?

`string` = `...`

###### edge.style.tooltip.textOutline?

`boolean` = `...`

###### edge.style.tooltip.textOutlineColor?

`string` = `...`

###### edge.style.tooltip.textOutlineJoin?

`"round"` \| `"bevel"` \| `"miter"` = `...`

###### edge.style.tooltip.textOutlineWidth?

`number` = `...`

###### edge.style.tooltip.textPath?

`string` = `...`

###### edge.style.tooltip.textShadow?

`boolean` = `...`

###### edge.style.tooltip.textShadowBlur?

`number` = `...`

###### edge.style.tooltip.textShadowColor?

`string` = `...`

###### edge.style.tooltip.textShadowOffsetX?

`number` = `...`

###### edge.style.tooltip.textShadowOffsetY?

`number` = `...`

###### metadata?

\{ `name`: `string`; \} = `...`

###### metadata.name

`string` = `...`

###### node?

\{ `calculatedStyle?`: \{ `expr`: `string`; `inputs`: `string`[]; `output`: `string`; \}; `selector`: `string`; `style`: \{ `effect?`: \{ `flatShaded?`: `boolean`; `glow?`: \{ `color?`: `string`; `strength?`: `number`; \}; `outline?`: \{ `color?`: `string`; `width?`: `number`; \}; `wireframe?`: `boolean`; \}; `enabled?`: `boolean`; `label?`: \{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (`string` \| `undefined`)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \}; `shape?`: \{ `size?`: `number`; `type?`: `"box"` \| `"sphere"` \| `"cylinder"` \| `"cone"` \| `"capsule"` \| `"torus-knot"` \| `"tetrahedron"` \| `"octahedron"` \| `"dodecahedron"` \| `"icosahedron"` \| `"rhombicuboctahedron"` \| `"triangular_prism"` \| `"pentagonal_prism"` \| `"hexagonal_prism"` \| `"square_pyramid"` \| `"pentagonal_pyramid"` \| `"triangular_dipyramid"` \| `"pentagonal_dipyramid"` \| `"elongated_square_dipyramid"` \| `"elongated_pentagonal_dipyramid"` \| `"elongated_pentagonal_cupola"` \| `"goldberg"` \| `"icosphere"` \| `"geodesic"`; \}; `texture?`: \{ `color?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}; `icon?`: `string`; `image?`: `string`; \}; `tooltip?`: \{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (`string` \| `undefined`)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \}; \}; \} = `AppliedNodeStyle`

###### node.calculatedStyle?

\{ `expr`: `string`; `inputs`: `string`[]; `output`: `string`; \} = `...`

###### node.calculatedStyle.expr

`string` = `...`

###### node.calculatedStyle.inputs

`string`[] = `...`

###### node.calculatedStyle.output

`string` = `AllowedOuputPaths`

###### node.selector

`string` = `...`

###### node.style

\{ `effect?`: \{ `flatShaded?`: `boolean`; `glow?`: \{ `color?`: `string`; `strength?`: `number`; \}; `outline?`: \{ `color?`: `string`; `width?`: `number`; \}; `wireframe?`: `boolean`; \}; `enabled?`: `boolean`; `label?`: \{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (`string` \| `undefined`)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \}; `shape?`: \{ `size?`: `number`; `type?`: `"box"` \| `"sphere"` \| `"cylinder"` \| `"cone"` \| `"capsule"` \| `"torus-knot"` \| `"tetrahedron"` \| `"octahedron"` \| `"dodecahedron"` \| `"icosahedron"` \| `"rhombicuboctahedron"` \| `"triangular_prism"` \| `"pentagonal_prism"` \| `"hexagonal_prism"` \| `"square_pyramid"` \| `"pentagonal_pyramid"` \| `"triangular_dipyramid"` \| `"pentagonal_dipyramid"` \| `"elongated_square_dipyramid"` \| `"elongated_pentagonal_dipyramid"` \| `"elongated_pentagonal_cupola"` \| `"goldberg"` \| `"icosphere"` \| `"geodesic"`; \}; `texture?`: \{ `color?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}; `icon?`: `string`; `image?`: `string`; \}; `tooltip?`: \{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (`string` \| `undefined`)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \}; \} = `NodeStyle`

###### node.style.effect?

\{ `flatShaded?`: `boolean`; `glow?`: \{ `color?`: `string`; `strength?`: `number`; \}; `outline?`: \{ `color?`: `string`; `width?`: `number`; \}; `wireframe?`: `boolean`; \} = `...`

###### node.style.effect.flatShaded?

`boolean` = `...`

###### node.style.effect.glow?

\{ `color?`: `string`; `strength?`: `number`; \} = `...`

###### node.style.effect.glow.color?

`string` = `...`

###### node.style.effect.glow.strength?

`number` = `...`

###### node.style.effect.outline?

\{ `color?`: `string`; `width?`: `number`; \} = `...`

###### node.style.effect.outline.color?

`string` = `...`

###### node.style.effect.outline.width?

`number` = `...`

###### node.style.effect.wireframe?

`boolean` = `...`

###### node.style.enabled?

`boolean` = `...`

###### node.style.label?

\{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (`string` \| `undefined`)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \} = `...`

###### node.style.label.animation?

`"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"` = `...`

###### node.style.label.animationSpeed?

`number` = `...`

###### node.style.label.attachOffset?

`number` = `...`

###### node.style.label.attachPosition?

`"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` = `...`

###### node.style.label.autoSize?

`boolean` = `...`

###### node.style.label.backgroundColor?

`string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \} = `...`

###### node.style.label.backgroundGradient?

`boolean` = `...`

###### node.style.label.backgroundGradientColors?

(`string` \| `undefined`)[] = `...`

###### node.style.label.backgroundGradientDirection?

`"vertical"` \| `"horizontal"` \| `"diagonal"` = `...`

###### node.style.label.backgroundGradientType?

`"linear"` \| `"radial"` = `...`

###### node.style.label.backgroundPadding?

`number` = `...`

###### node.style.label.badge?

`"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"` = `...`

###### node.style.label.billboardMode?

`number` = `...`

###### node.style.label.borderColor?

`string` = `...`

###### node.style.label.borders?

`object`[] = `...`

###### node.style.label.borderWidth?

`number` = `...`

###### node.style.label.cornerRadius?

`number` = `...`

###### node.style.label.depthFadeEnabled?

`boolean` = `...`

###### node.style.label.depthFadeFar?

`number` = `...`

###### node.style.label.depthFadeNear?

`number` = `...`

###### node.style.label.enabled?

`boolean` = `...`

###### node.style.label.font?

`string` = `...`

###### node.style.label.fontSize?

`number` = `...`

###### node.style.label.fontWeight?

`string` = `...`

###### node.style.label.icon?

`string` = `...`

###### node.style.label.iconPosition?

`"left"` \| `"right"` = `...`

###### node.style.label.lineHeight?

`number` = `...`

###### node.style.label.location?

`"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"` = `...`

###### node.style.label.marginBottom?

`number` = `...`

###### node.style.label.marginLeft?

`number` = `...`

###### node.style.label.marginRight?

`number` = `...`

###### node.style.label.marginTop?

`number` = `...`

###### node.style.label.maxNumber?

`number` = `...`

###### node.style.label.overflowSuffix?

`string` = `...`

###### node.style.label.pointer?

`boolean` = `...`

###### node.style.label.pointerCurve?

`boolean` = `...`

###### node.style.label.pointerDirection?

`"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"` = `...`

###### node.style.label.pointerHeight?

`number` = `...`

###### node.style.label.pointerOffset?

`number` = `...`

###### node.style.label.pointerWidth?

`number` = `...`

###### node.style.label.position?

\{ `x`: `number`; `y`: `number`; `z`: `number`; \} = `...`

###### node.style.label.position.x

`number` = `...`

###### node.style.label.position.y

`number` = `...`

###### node.style.label.position.z

`number` = `...`

###### node.style.label.progress?

`number` = `...`

###### node.style.label.resolution?

`number` = `...`

###### node.style.label.smartOverflow?

`boolean` = `...`

###### node.style.label.text?

`string` = `...`

###### node.style.label.textAlign?

`"left"` \| `"center"` \| `"right"` = `...`

###### node.style.label.textColor?

`string` = `...`

###### node.style.label.textOutline?

`boolean` = `...`

###### node.style.label.textOutlineColor?

`string` = `...`

###### node.style.label.textOutlineJoin?

`"round"` \| `"bevel"` \| `"miter"` = `...`

###### node.style.label.textOutlineWidth?

`number` = `...`

###### node.style.label.textPath?

`string` = `...`

###### node.style.label.textShadow?

`boolean` = `...`

###### node.style.label.textShadowBlur?

`number` = `...`

###### node.style.label.textShadowColor?

`string` = `...`

###### node.style.label.textShadowOffsetX?

`number` = `...`

###### node.style.label.textShadowOffsetY?

`number` = `...`

###### node.style.shape?

\{ `size?`: `number`; `type?`: `"box"` \| `"sphere"` \| `"cylinder"` \| `"cone"` \| `"capsule"` \| `"torus-knot"` \| `"tetrahedron"` \| `"octahedron"` \| `"dodecahedron"` \| `"icosahedron"` \| `"rhombicuboctahedron"` \| `"triangular_prism"` \| `"pentagonal_prism"` \| `"hexagonal_prism"` \| `"square_pyramid"` \| `"pentagonal_pyramid"` \| `"triangular_dipyramid"` \| `"pentagonal_dipyramid"` \| `"elongated_square_dipyramid"` \| `"elongated_pentagonal_dipyramid"` \| `"elongated_pentagonal_cupola"` \| `"goldberg"` \| `"icosphere"` \| `"geodesic"`; \} = `...`

###### node.style.shape.size?

`number` = `...`

###### node.style.shape.type?

`"box"` \| `"sphere"` \| `"cylinder"` \| `"cone"` \| `"capsule"` \| `"torus-knot"` \| `"tetrahedron"` \| `"octahedron"` \| `"dodecahedron"` \| `"icosahedron"` \| `"rhombicuboctahedron"` \| `"triangular_prism"` \| `"pentagonal_prism"` \| `"hexagonal_prism"` \| `"square_pyramid"` \| `"pentagonal_pyramid"` \| `"triangular_dipyramid"` \| `"pentagonal_dipyramid"` \| `"elongated_square_dipyramid"` \| `"elongated_pentagonal_dipyramid"` \| `"elongated_pentagonal_cupola"` \| `"goldberg"` \| `"icosphere"` \| `"geodesic"` = `...`

###### node.style.texture?

\{ `color?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}; `icon?`: `string`; `image?`: `string`; \} = `...`

###### node.style.texture.color?

`string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \} = `...`

###### node.style.texture.icon?

`string` = `...`

###### node.style.texture.image?

`string` = `...`

###### node.style.tooltip?

\{ `animation?`: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`; `animationSpeed?`: `number`; `attachOffset?`: `number`; `attachPosition?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`; `autoSize?`: `boolean`; `backgroundColor?`: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}; `backgroundGradient?`: `boolean`; `backgroundGradientColors?`: (`string` \| `undefined`)[]; `backgroundGradientDirection?`: `"vertical"` \| `"horizontal"` \| `"diagonal"`; `backgroundGradientType?`: `"linear"` \| `"radial"`; `backgroundPadding?`: `number`; `badge?`: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`; `billboardMode?`: `number`; `borderColor?`: `string`; `borders?`: `object`[]; `borderWidth?`: `number`; `cornerRadius?`: `number`; `depthFadeEnabled?`: `boolean`; `depthFadeFar?`: `number`; `depthFadeNear?`: `number`; `enabled?`: `boolean`; `font?`: `string`; `fontSize?`: `number`; `fontWeight?`: `string`; `icon?`: `string`; `iconPosition?`: `"left"` \| `"right"`; `lineHeight?`: `number`; `location?`: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`; `marginBottom?`: `number`; `marginLeft?`: `number`; `marginRight?`: `number`; `marginTop?`: `number`; `maxNumber?`: `number`; `overflowSuffix?`: `string`; `pointer?`: `boolean`; `pointerCurve?`: `boolean`; `pointerDirection?`: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`; `pointerHeight?`: `number`; `pointerOffset?`: `number`; `pointerWidth?`: `number`; `position?`: \{ `x`: `number`; `y`: `number`; `z`: `number`; \}; `progress?`: `number`; `resolution?`: `number`; `smartOverflow?`: `boolean`; `text?`: `string`; `textAlign?`: `"left"` \| `"center"` \| `"right"`; `textColor?`: `string`; `textOutline?`: `boolean`; `textOutlineColor?`: `string`; `textOutlineJoin?`: `"round"` \| `"bevel"` \| `"miter"`; `textOutlineWidth?`: `number`; `textPath?`: `string`; `textShadow?`: `boolean`; `textShadowBlur?`: `number`; `textShadowColor?`: `string`; `textShadowOffsetX?`: `number`; `textShadowOffsetY?`: `number`; \} = `...`

###### node.style.tooltip.animation?

`"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"` = `...`

###### node.style.tooltip.animationSpeed?

`number` = `...`

###### node.style.tooltip.attachOffset?

`number` = `...`

###### node.style.tooltip.attachPosition?

`"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` = `...`

###### node.style.tooltip.autoSize?

`boolean` = `...`

###### node.style.tooltip.backgroundColor?

`string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \} = `...`

###### node.style.tooltip.backgroundGradient?

`boolean` = `...`

###### node.style.tooltip.backgroundGradientColors?

(`string` \| `undefined`)[] = `...`

###### node.style.tooltip.backgroundGradientDirection?

`"vertical"` \| `"horizontal"` \| `"diagonal"` = `...`

###### node.style.tooltip.backgroundGradientType?

`"linear"` \| `"radial"` = `...`

###### node.style.tooltip.backgroundPadding?

`number` = `...`

###### node.style.tooltip.badge?

`"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"` = `...`

###### node.style.tooltip.billboardMode?

`number` = `...`

###### node.style.tooltip.borderColor?

`string` = `...`

###### node.style.tooltip.borders?

`object`[] = `...`

###### node.style.tooltip.borderWidth?

`number` = `...`

###### node.style.tooltip.cornerRadius?

`number` = `...`

###### node.style.tooltip.depthFadeEnabled?

`boolean` = `...`

###### node.style.tooltip.depthFadeFar?

`number` = `...`

###### node.style.tooltip.depthFadeNear?

`number` = `...`

###### node.style.tooltip.enabled?

`boolean` = `...`

###### node.style.tooltip.font?

`string` = `...`

###### node.style.tooltip.fontSize?

`number` = `...`

###### node.style.tooltip.fontWeight?

`string` = `...`

###### node.style.tooltip.icon?

`string` = `...`

###### node.style.tooltip.iconPosition?

`"left"` \| `"right"` = `...`

###### node.style.tooltip.lineHeight?

`number` = `...`

###### node.style.tooltip.location?

`"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"` = `...`

###### node.style.tooltip.marginBottom?

`number` = `...`

###### node.style.tooltip.marginLeft?

`number` = `...`

###### node.style.tooltip.marginRight?

`number` = `...`

###### node.style.tooltip.marginTop?

`number` = `...`

###### node.style.tooltip.maxNumber?

`number` = `...`

###### node.style.tooltip.overflowSuffix?

`string` = `...`

###### node.style.tooltip.pointer?

`boolean` = `...`

###### node.style.tooltip.pointerCurve?

`boolean` = `...`

###### node.style.tooltip.pointerDirection?

`"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"` = `...`

###### node.style.tooltip.pointerHeight?

`number` = `...`

###### node.style.tooltip.pointerOffset?

`number` = `...`

###### node.style.tooltip.pointerWidth?

`number` = `...`

###### node.style.tooltip.position?

\{ `x`: `number`; `y`: `number`; `z`: `number`; \} = `...`

###### node.style.tooltip.position.x

`number` = `...`

###### node.style.tooltip.position.y

`number` = `...`

###### node.style.tooltip.position.z

`number` = `...`

###### node.style.tooltip.progress?

`number` = `...`

###### node.style.tooltip.resolution?

`number` = `...`

###### node.style.tooltip.smartOverflow?

`boolean` = `...`

###### node.style.tooltip.text?

`string` = `...`

###### node.style.tooltip.textAlign?

`"left"` \| `"center"` \| `"right"` = `...`

###### node.style.tooltip.textColor?

`string` = `...`

###### node.style.tooltip.textOutline?

`boolean` = `...`

###### node.style.tooltip.textOutlineColor?

`string` = `...`

###### node.style.tooltip.textOutlineJoin?

`"round"` \| `"bevel"` \| `"miter"` = `...`

###### node.style.tooltip.textOutlineWidth?

`number` = `...`

###### node.style.tooltip.textPath?

`string` = `...`

###### node.style.tooltip.textShadow?

`boolean` = `...`

###### node.style.tooltip.textShadowBlur?

`number` = `...`

###### node.style.tooltip.textShadowColor?

`string` = `...`

###### node.style.tooltip.textShadowOffsetX?

`number` = `...`

###### node.style.tooltip.textShadowOffsetY?

`number` = `...`

#### Returns

`void`

***

### setStyleManager()

> **setStyleManager**(`styleManager`): `void`

Defined in: [src/managers/SelectionManager.ts:99](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/SelectionManager.ts#L99)

Set the StyleManager reference.
Required for triggering style updates when selection changes.

#### Parameters

##### styleManager

[`StyleManager`](StyleManager.md)

The style manager instance

#### Returns

`void`
