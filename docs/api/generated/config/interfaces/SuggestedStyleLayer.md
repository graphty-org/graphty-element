[@graphty/graphty-element](../../index.md) / [config](../index.md) / SuggestedStyleLayer

# Interface: SuggestedStyleLayer

Defined in: [src/config/SuggestedStyles.ts:106](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/SuggestedStyles.ts#L106)

A single suggested style layer from an algorithm

## Properties

### edge?

> `optional` **edge**: `object`

Defined in: [src/config/SuggestedStyles.ts:110](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/SuggestedStyles.ts#L110)

Edge style configuration for this layer

#### calculatedStyle?

> `optional` **calculatedStyle**: `object`

##### calculatedStyle.expr

> **expr**: `string`

##### calculatedStyle.inputs

> **inputs**: `string`[]

##### calculatedStyle.output

> **output**: `string` = `AllowedOuputPaths`

#### selector

> **selector**: `string`

#### style

> **style**: `object` = `EdgeStyle`

##### style.arrowHead?

> `optional` **arrowHead**: `object`

##### style.arrowHead.color?

> `optional` **color**: `string`

##### style.arrowHead.opacity?

> `optional` **opacity**: `number`

##### style.arrowHead.size?

> `optional` **size**: `number`

##### style.arrowHead.text?

> `optional` **text**: `object`

##### style.arrowHead.text.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

##### style.arrowHead.text.animationSpeed?

> `optional` **animationSpeed**: `number`

##### style.arrowHead.text.attachOffset?

> `optional` **attachOffset**: `number`

##### style.arrowHead.text.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

##### style.arrowHead.text.autoSize?

> `optional` **autoSize**: `boolean`

##### style.arrowHead.text.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (... \| ...)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (... \| ...)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

##### style.arrowHead.text.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

##### style.arrowHead.text.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

##### style.arrowHead.text.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

##### style.arrowHead.text.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

##### style.arrowHead.text.backgroundPadding?

> `optional` **backgroundPadding**: `number`

##### style.arrowHead.text.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

##### style.arrowHead.text.billboardMode?

> `optional` **billboardMode**: `number`

##### style.arrowHead.text.borderColor?

> `optional` **borderColor**: `string`

##### style.arrowHead.text.borders?

> `optional` **borders**: `object`[]

##### style.arrowHead.text.borderWidth?

> `optional` **borderWidth**: `number`

##### style.arrowHead.text.cornerRadius?

> `optional` **cornerRadius**: `number`

##### style.arrowHead.text.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

##### style.arrowHead.text.depthFadeFar?

> `optional` **depthFadeFar**: `number`

##### style.arrowHead.text.depthFadeNear?

> `optional` **depthFadeNear**: `number`

##### style.arrowHead.text.enabled?

> `optional` **enabled**: `boolean`

##### style.arrowHead.text.font?

> `optional` **font**: `string`

##### style.arrowHead.text.fontSize?

> `optional` **fontSize**: `number`

##### style.arrowHead.text.fontWeight?

> `optional` **fontWeight**: `string`

##### style.arrowHead.text.icon?

> `optional` **icon**: `string`

##### style.arrowHead.text.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

##### style.arrowHead.text.lineHeight?

> `optional` **lineHeight**: `number`

##### style.arrowHead.text.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

##### style.arrowHead.text.marginBottom?

> `optional` **marginBottom**: `number`

##### style.arrowHead.text.marginLeft?

> `optional` **marginLeft**: `number`

##### style.arrowHead.text.marginRight?

> `optional` **marginRight**: `number`

##### style.arrowHead.text.marginTop?

> `optional` **marginTop**: `number`

##### style.arrowHead.text.maxNumber?

> `optional` **maxNumber**: `number`

##### style.arrowHead.text.overflowSuffix?

> `optional` **overflowSuffix**: `string`

##### style.arrowHead.text.pointer?

> `optional` **pointer**: `boolean`

##### style.arrowHead.text.pointerCurve?

> `optional` **pointerCurve**: `boolean`

##### style.arrowHead.text.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

##### style.arrowHead.text.pointerHeight?

> `optional` **pointerHeight**: `number`

##### style.arrowHead.text.pointerOffset?

> `optional` **pointerOffset**: `number`

##### style.arrowHead.text.pointerWidth?

> `optional` **pointerWidth**: `number`

##### style.arrowHead.text.position?

> `optional` **position**: `object`

##### style.arrowHead.text.position.x

> **x**: `number`

##### style.arrowHead.text.position.y

> **y**: `number`

##### style.arrowHead.text.position.z

> **z**: `number`

##### style.arrowHead.text.progress?

> `optional` **progress**: `number`

##### style.arrowHead.text.resolution?

> `optional` **resolution**: `number`

##### style.arrowHead.text.smartOverflow?

> `optional` **smartOverflow**: `boolean`

##### style.arrowHead.text.text?

> `optional` **text**: `string`

##### style.arrowHead.text.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

##### style.arrowHead.text.textColor?

> `optional` **textColor**: `string`

##### style.arrowHead.text.textOutline?

> `optional` **textOutline**: `boolean`

##### style.arrowHead.text.textOutlineColor?

> `optional` **textOutlineColor**: `string`

##### style.arrowHead.text.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

##### style.arrowHead.text.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

##### style.arrowHead.text.textPath?

> `optional` **textPath**: `string`

##### style.arrowHead.text.textShadow?

> `optional` **textShadow**: `boolean`

##### style.arrowHead.text.textShadowBlur?

> `optional` **textShadowBlur**: `number`

##### style.arrowHead.text.textShadowColor?

> `optional` **textShadowColor**: `string`

##### style.arrowHead.text.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

##### style.arrowHead.text.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

##### style.arrowHead.type?

> `optional` **type**: `"none"` \| `"dot"` \| `"normal"` \| `"inverted"` \| `"sphere-dot"` \| `"open-dot"` \| `"tee"` \| `"open-normal"` \| `"diamond"` \| `"open-diamond"` \| `"crow"` \| `"box"` \| `"half-open"` \| `"vee"`

##### style.arrowTail?

> `optional` **arrowTail**: `object`

##### style.arrowTail.color?

> `optional` **color**: `string`

##### style.arrowTail.opacity?

> `optional` **opacity**: `number`

##### style.arrowTail.size?

> `optional` **size**: `number`

##### style.arrowTail.text?

> `optional` **text**: `object`

##### style.arrowTail.text.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

##### style.arrowTail.text.animationSpeed?

> `optional` **animationSpeed**: `number`

##### style.arrowTail.text.attachOffset?

> `optional` **attachOffset**: `number`

##### style.arrowTail.text.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

##### style.arrowTail.text.autoSize?

> `optional` **autoSize**: `boolean`

##### style.arrowTail.text.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (... \| ...)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (... \| ...)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

##### style.arrowTail.text.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

##### style.arrowTail.text.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

##### style.arrowTail.text.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

##### style.arrowTail.text.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

##### style.arrowTail.text.backgroundPadding?

> `optional` **backgroundPadding**: `number`

##### style.arrowTail.text.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

##### style.arrowTail.text.billboardMode?

> `optional` **billboardMode**: `number`

##### style.arrowTail.text.borderColor?

> `optional` **borderColor**: `string`

##### style.arrowTail.text.borders?

> `optional` **borders**: `object`[]

##### style.arrowTail.text.borderWidth?

> `optional` **borderWidth**: `number`

##### style.arrowTail.text.cornerRadius?

> `optional` **cornerRadius**: `number`

##### style.arrowTail.text.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

##### style.arrowTail.text.depthFadeFar?

> `optional` **depthFadeFar**: `number`

##### style.arrowTail.text.depthFadeNear?

> `optional` **depthFadeNear**: `number`

##### style.arrowTail.text.enabled?

> `optional` **enabled**: `boolean`

##### style.arrowTail.text.font?

> `optional` **font**: `string`

##### style.arrowTail.text.fontSize?

> `optional` **fontSize**: `number`

##### style.arrowTail.text.fontWeight?

> `optional` **fontWeight**: `string`

##### style.arrowTail.text.icon?

> `optional` **icon**: `string`

##### style.arrowTail.text.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

##### style.arrowTail.text.lineHeight?

> `optional` **lineHeight**: `number`

##### style.arrowTail.text.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

##### style.arrowTail.text.marginBottom?

> `optional` **marginBottom**: `number`

##### style.arrowTail.text.marginLeft?

> `optional` **marginLeft**: `number`

##### style.arrowTail.text.marginRight?

> `optional` **marginRight**: `number`

##### style.arrowTail.text.marginTop?

> `optional` **marginTop**: `number`

##### style.arrowTail.text.maxNumber?

> `optional` **maxNumber**: `number`

##### style.arrowTail.text.overflowSuffix?

> `optional` **overflowSuffix**: `string`

##### style.arrowTail.text.pointer?

> `optional` **pointer**: `boolean`

##### style.arrowTail.text.pointerCurve?

> `optional` **pointerCurve**: `boolean`

##### style.arrowTail.text.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

##### style.arrowTail.text.pointerHeight?

> `optional` **pointerHeight**: `number`

##### style.arrowTail.text.pointerOffset?

> `optional` **pointerOffset**: `number`

##### style.arrowTail.text.pointerWidth?

> `optional` **pointerWidth**: `number`

##### style.arrowTail.text.position?

> `optional` **position**: `object`

##### style.arrowTail.text.position.x

> **x**: `number`

##### style.arrowTail.text.position.y

> **y**: `number`

##### style.arrowTail.text.position.z

> **z**: `number`

##### style.arrowTail.text.progress?

> `optional` **progress**: `number`

##### style.arrowTail.text.resolution?

> `optional` **resolution**: `number`

##### style.arrowTail.text.smartOverflow?

> `optional` **smartOverflow**: `boolean`

##### style.arrowTail.text.text?

> `optional` **text**: `string`

##### style.arrowTail.text.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

##### style.arrowTail.text.textColor?

> `optional` **textColor**: `string`

##### style.arrowTail.text.textOutline?

> `optional` **textOutline**: `boolean`

##### style.arrowTail.text.textOutlineColor?

> `optional` **textOutlineColor**: `string`

##### style.arrowTail.text.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

##### style.arrowTail.text.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

##### style.arrowTail.text.textPath?

> `optional` **textPath**: `string`

##### style.arrowTail.text.textShadow?

> `optional` **textShadow**: `boolean`

##### style.arrowTail.text.textShadowBlur?

> `optional` **textShadowBlur**: `number`

##### style.arrowTail.text.textShadowColor?

> `optional` **textShadowColor**: `string`

##### style.arrowTail.text.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

##### style.arrowTail.text.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

##### style.arrowTail.type?

> `optional` **type**: `"none"` \| `"dot"` \| `"normal"` \| `"inverted"` \| `"sphere-dot"` \| `"open-dot"` \| `"tee"` \| `"open-normal"` \| `"diamond"` \| `"open-diamond"` \| `"crow"` \| `"box"` \| `"half-open"` \| `"vee"`

##### style.enabled?

> `optional` **enabled**: `boolean`

##### style.label?

> `optional` **label**: `object`

##### style.label.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

##### style.label.animationSpeed?

> `optional` **animationSpeed**: `number`

##### style.label.attachOffset?

> `optional` **attachOffset**: `number`

##### style.label.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

##### style.label.autoSize?

> `optional` **autoSize**: `boolean`

##### style.label.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

##### style.label.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

##### style.label.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

##### style.label.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

##### style.label.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

##### style.label.backgroundPadding?

> `optional` **backgroundPadding**: `number`

##### style.label.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

##### style.label.billboardMode?

> `optional` **billboardMode**: `number`

##### style.label.borderColor?

> `optional` **borderColor**: `string`

##### style.label.borders?

> `optional` **borders**: `object`[]

##### style.label.borderWidth?

> `optional` **borderWidth**: `number`

##### style.label.cornerRadius?

> `optional` **cornerRadius**: `number`

##### style.label.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

##### style.label.depthFadeFar?

> `optional` **depthFadeFar**: `number`

##### style.label.depthFadeNear?

> `optional` **depthFadeNear**: `number`

##### style.label.enabled?

> `optional` **enabled**: `boolean`

##### style.label.font?

> `optional` **font**: `string`

##### style.label.fontSize?

> `optional` **fontSize**: `number`

##### style.label.fontWeight?

> `optional` **fontWeight**: `string`

##### style.label.icon?

> `optional` **icon**: `string`

##### style.label.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

##### style.label.lineHeight?

> `optional` **lineHeight**: `number`

##### style.label.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

##### style.label.marginBottom?

> `optional` **marginBottom**: `number`

##### style.label.marginLeft?

> `optional` **marginLeft**: `number`

##### style.label.marginRight?

> `optional` **marginRight**: `number`

##### style.label.marginTop?

> `optional` **marginTop**: `number`

##### style.label.maxNumber?

> `optional` **maxNumber**: `number`

##### style.label.overflowSuffix?

> `optional` **overflowSuffix**: `string`

##### style.label.pointer?

> `optional` **pointer**: `boolean`

##### style.label.pointerCurve?

> `optional` **pointerCurve**: `boolean`

##### style.label.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

##### style.label.pointerHeight?

> `optional` **pointerHeight**: `number`

##### style.label.pointerOffset?

> `optional` **pointerOffset**: `number`

##### style.label.pointerWidth?

> `optional` **pointerWidth**: `number`

##### style.label.position?

> `optional` **position**: `object`

##### style.label.position.x

> **x**: `number`

##### style.label.position.y

> **y**: `number`

##### style.label.position.z

> **z**: `number`

##### style.label.progress?

> `optional` **progress**: `number`

##### style.label.resolution?

> `optional` **resolution**: `number`

##### style.label.smartOverflow?

> `optional` **smartOverflow**: `boolean`

##### style.label.text?

> `optional` **text**: `string`

##### style.label.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

##### style.label.textColor?

> `optional` **textColor**: `string`

##### style.label.textOutline?

> `optional` **textOutline**: `boolean`

##### style.label.textOutlineColor?

> `optional` **textOutlineColor**: `string`

##### style.label.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

##### style.label.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

##### style.label.textPath?

> `optional` **textPath**: `string`

##### style.label.textShadow?

> `optional` **textShadow**: `boolean`

##### style.label.textShadowBlur?

> `optional` **textShadowBlur**: `number`

##### style.label.textShadowColor?

> `optional` **textShadowColor**: `string`

##### style.label.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

##### style.label.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

##### style.line?

> `optional` **line**: `object`

##### style.line.animationSpeed?

> `optional` **animationSpeed**: `number`

##### style.line.bezier?

> `optional` **bezier**: `boolean`

##### style.line.color?

> `optional` **color**: `string`

##### style.line.opacity?

> `optional` **opacity**: `number`

##### style.line.type?

> `optional` **type**: `"solid"` \| `"dot"` \| `"diamond"` \| `"box"` \| `"star"` \| `"dash"` \| `"dash-dot"` \| `"sinewave"` \| `"zigzag"`

##### style.line.width?

> `optional` **width**: `number`

##### style.tooltip?

> `optional` **tooltip**: `object`

##### style.tooltip.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

##### style.tooltip.animationSpeed?

> `optional` **animationSpeed**: `number`

##### style.tooltip.attachOffset?

> `optional` **attachOffset**: `number`

##### style.tooltip.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

##### style.tooltip.autoSize?

> `optional` **autoSize**: `boolean`

##### style.tooltip.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

##### style.tooltip.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

##### style.tooltip.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

##### style.tooltip.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

##### style.tooltip.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

##### style.tooltip.backgroundPadding?

> `optional` **backgroundPadding**: `number`

##### style.tooltip.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

##### style.tooltip.billboardMode?

> `optional` **billboardMode**: `number`

##### style.tooltip.borderColor?

> `optional` **borderColor**: `string`

##### style.tooltip.borders?

> `optional` **borders**: `object`[]

##### style.tooltip.borderWidth?

> `optional` **borderWidth**: `number`

##### style.tooltip.cornerRadius?

> `optional` **cornerRadius**: `number`

##### style.tooltip.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

##### style.tooltip.depthFadeFar?

> `optional` **depthFadeFar**: `number`

##### style.tooltip.depthFadeNear?

> `optional` **depthFadeNear**: `number`

##### style.tooltip.enabled?

> `optional` **enabled**: `boolean`

##### style.tooltip.font?

> `optional` **font**: `string`

##### style.tooltip.fontSize?

> `optional` **fontSize**: `number`

##### style.tooltip.fontWeight?

> `optional` **fontWeight**: `string`

##### style.tooltip.icon?

> `optional` **icon**: `string`

##### style.tooltip.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

##### style.tooltip.lineHeight?

> `optional` **lineHeight**: `number`

##### style.tooltip.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

##### style.tooltip.marginBottom?

> `optional` **marginBottom**: `number`

##### style.tooltip.marginLeft?

> `optional` **marginLeft**: `number`

##### style.tooltip.marginRight?

> `optional` **marginRight**: `number`

##### style.tooltip.marginTop?

> `optional` **marginTop**: `number`

##### style.tooltip.maxNumber?

> `optional` **maxNumber**: `number`

##### style.tooltip.overflowSuffix?

> `optional` **overflowSuffix**: `string`

##### style.tooltip.pointer?

> `optional` **pointer**: `boolean`

##### style.tooltip.pointerCurve?

> `optional` **pointerCurve**: `boolean`

##### style.tooltip.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

##### style.tooltip.pointerHeight?

> `optional` **pointerHeight**: `number`

##### style.tooltip.pointerOffset?

> `optional` **pointerOffset**: `number`

##### style.tooltip.pointerWidth?

> `optional` **pointerWidth**: `number`

##### style.tooltip.position?

> `optional` **position**: `object`

##### style.tooltip.position.x

> **x**: `number`

##### style.tooltip.position.y

> **y**: `number`

##### style.tooltip.position.z

> **z**: `number`

##### style.tooltip.progress?

> `optional` **progress**: `number`

##### style.tooltip.resolution?

> `optional` **resolution**: `number`

##### style.tooltip.smartOverflow?

> `optional` **smartOverflow**: `boolean`

##### style.tooltip.text?

> `optional` **text**: `string`

##### style.tooltip.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

##### style.tooltip.textColor?

> `optional` **textColor**: `string`

##### style.tooltip.textOutline?

> `optional` **textOutline**: `boolean`

##### style.tooltip.textOutlineColor?

> `optional` **textOutlineColor**: `string`

##### style.tooltip.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

##### style.tooltip.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

##### style.tooltip.textPath?

> `optional` **textPath**: `string`

##### style.tooltip.textShadow?

> `optional` **textShadow**: `boolean`

##### style.tooltip.textShadowBlur?

> `optional` **textShadowBlur**: `number`

##### style.tooltip.textShadowColor?

> `optional` **textShadowColor**: `string`

##### style.tooltip.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

##### style.tooltip.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

***

### metadata?

> `optional` **metadata**: [`SuggestedStyleLayerMetadata`](SuggestedStyleLayerMetadata.md)

Defined in: [src/config/SuggestedStyles.ts:112](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/SuggestedStyles.ts#L112)

Metadata about this style layer

***

### node?

> `optional` **node**: `object`

Defined in: [src/config/SuggestedStyles.ts:108](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/config/SuggestedStyles.ts#L108)

Node style configuration for this layer

#### calculatedStyle?

> `optional` **calculatedStyle**: `object`

##### calculatedStyle.expr

> **expr**: `string`

##### calculatedStyle.inputs

> **inputs**: `string`[]

##### calculatedStyle.output

> **output**: `string` = `AllowedOuputPaths`

#### selector

> **selector**: `string`

#### style

> **style**: `object` = `NodeStyle`

##### style.effect?

> `optional` **effect**: `object`

##### style.effect.flatShaded?

> `optional` **flatShaded**: `boolean`

##### style.effect.glow?

> `optional` **glow**: `object`

##### style.effect.glow.color?

> `optional` **color**: `string`

##### style.effect.glow.strength?

> `optional` **strength**: `number`

##### style.effect.outline?

> `optional` **outline**: `object`

##### style.effect.outline.color?

> `optional` **color**: `string`

##### style.effect.outline.width?

> `optional` **width**: `number`

##### style.effect.wireframe?

> `optional` **wireframe**: `boolean`

##### style.enabled?

> `optional` **enabled**: `boolean`

##### style.label?

> `optional` **label**: `object`

##### style.label.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

##### style.label.animationSpeed?

> `optional` **animationSpeed**: `number`

##### style.label.attachOffset?

> `optional` **attachOffset**: `number`

##### style.label.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

##### style.label.autoSize?

> `optional` **autoSize**: `boolean`

##### style.label.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

##### style.label.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

##### style.label.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

##### style.label.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

##### style.label.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

##### style.label.backgroundPadding?

> `optional` **backgroundPadding**: `number`

##### style.label.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

##### style.label.billboardMode?

> `optional` **billboardMode**: `number`

##### style.label.borderColor?

> `optional` **borderColor**: `string`

##### style.label.borders?

> `optional` **borders**: `object`[]

##### style.label.borderWidth?

> `optional` **borderWidth**: `number`

##### style.label.cornerRadius?

> `optional` **cornerRadius**: `number`

##### style.label.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

##### style.label.depthFadeFar?

> `optional` **depthFadeFar**: `number`

##### style.label.depthFadeNear?

> `optional` **depthFadeNear**: `number`

##### style.label.enabled?

> `optional` **enabled**: `boolean`

##### style.label.font?

> `optional` **font**: `string`

##### style.label.fontSize?

> `optional` **fontSize**: `number`

##### style.label.fontWeight?

> `optional` **fontWeight**: `string`

##### style.label.icon?

> `optional` **icon**: `string`

##### style.label.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

##### style.label.lineHeight?

> `optional` **lineHeight**: `number`

##### style.label.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

##### style.label.marginBottom?

> `optional` **marginBottom**: `number`

##### style.label.marginLeft?

> `optional` **marginLeft**: `number`

##### style.label.marginRight?

> `optional` **marginRight**: `number`

##### style.label.marginTop?

> `optional` **marginTop**: `number`

##### style.label.maxNumber?

> `optional` **maxNumber**: `number`

##### style.label.overflowSuffix?

> `optional` **overflowSuffix**: `string`

##### style.label.pointer?

> `optional` **pointer**: `boolean`

##### style.label.pointerCurve?

> `optional` **pointerCurve**: `boolean`

##### style.label.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

##### style.label.pointerHeight?

> `optional` **pointerHeight**: `number`

##### style.label.pointerOffset?

> `optional` **pointerOffset**: `number`

##### style.label.pointerWidth?

> `optional` **pointerWidth**: `number`

##### style.label.position?

> `optional` **position**: `object`

##### style.label.position.x

> **x**: `number`

##### style.label.position.y

> **y**: `number`

##### style.label.position.z

> **z**: `number`

##### style.label.progress?

> `optional` **progress**: `number`

##### style.label.resolution?

> `optional` **resolution**: `number`

##### style.label.smartOverflow?

> `optional` **smartOverflow**: `boolean`

##### style.label.text?

> `optional` **text**: `string`

##### style.label.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

##### style.label.textColor?

> `optional` **textColor**: `string`

##### style.label.textOutline?

> `optional` **textOutline**: `boolean`

##### style.label.textOutlineColor?

> `optional` **textOutlineColor**: `string`

##### style.label.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

##### style.label.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

##### style.label.textPath?

> `optional` **textPath**: `string`

##### style.label.textShadow?

> `optional` **textShadow**: `boolean`

##### style.label.textShadowBlur?

> `optional` **textShadowBlur**: `number`

##### style.label.textShadowColor?

> `optional` **textShadowColor**: `string`

##### style.label.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

##### style.label.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

##### style.shape?

> `optional` **shape**: `object`

##### style.shape.size?

> `optional` **size**: `number`

##### style.shape.type?

> `optional` **type**: `"box"` \| `"sphere"` \| `"cylinder"` \| `"cone"` \| `"capsule"` \| `"torus-knot"` \| `"tetrahedron"` \| `"octahedron"` \| `"dodecahedron"` \| `"icosahedron"` \| `"rhombicuboctahedron"` \| `"triangular_prism"` \| `"pentagonal_prism"` \| `"hexagonal_prism"` \| `"square_pyramid"` \| `"pentagonal_pyramid"` \| `"triangular_dipyramid"` \| `"pentagonal_dipyramid"` \| `"elongated_square_dipyramid"` \| `"elongated_pentagonal_dipyramid"` \| `"elongated_pentagonal_cupola"` \| `"goldberg"` \| `"icosphere"` \| `"geodesic"`

##### style.texture?

> `optional` **texture**: `object`

##### style.texture.color?

> `optional` **color**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

##### style.texture.icon?

> `optional` **icon**: `string`

##### style.texture.image?

> `optional` **image**: `string`

##### style.tooltip?

> `optional` **tooltip**: `object`

##### style.tooltip.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

##### style.tooltip.animationSpeed?

> `optional` **animationSpeed**: `number`

##### style.tooltip.attachOffset?

> `optional` **attachOffset**: `number`

##### style.tooltip.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

##### style.tooltip.autoSize?

> `optional` **autoSize**: `boolean`

##### style.tooltip.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

##### style.tooltip.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

##### style.tooltip.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

##### style.tooltip.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

##### style.tooltip.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

##### style.tooltip.backgroundPadding?

> `optional` **backgroundPadding**: `number`

##### style.tooltip.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

##### style.tooltip.billboardMode?

> `optional` **billboardMode**: `number`

##### style.tooltip.borderColor?

> `optional` **borderColor**: `string`

##### style.tooltip.borders?

> `optional` **borders**: `object`[]

##### style.tooltip.borderWidth?

> `optional` **borderWidth**: `number`

##### style.tooltip.cornerRadius?

> `optional` **cornerRadius**: `number`

##### style.tooltip.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

##### style.tooltip.depthFadeFar?

> `optional` **depthFadeFar**: `number`

##### style.tooltip.depthFadeNear?

> `optional` **depthFadeNear**: `number`

##### style.tooltip.enabled?

> `optional` **enabled**: `boolean`

##### style.tooltip.font?

> `optional` **font**: `string`

##### style.tooltip.fontSize?

> `optional` **fontSize**: `number`

##### style.tooltip.fontWeight?

> `optional` **fontWeight**: `string`

##### style.tooltip.icon?

> `optional` **icon**: `string`

##### style.tooltip.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

##### style.tooltip.lineHeight?

> `optional` **lineHeight**: `number`

##### style.tooltip.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

##### style.tooltip.marginBottom?

> `optional` **marginBottom**: `number`

##### style.tooltip.marginLeft?

> `optional` **marginLeft**: `number`

##### style.tooltip.marginRight?

> `optional` **marginRight**: `number`

##### style.tooltip.marginTop?

> `optional` **marginTop**: `number`

##### style.tooltip.maxNumber?

> `optional` **maxNumber**: `number`

##### style.tooltip.overflowSuffix?

> `optional` **overflowSuffix**: `string`

##### style.tooltip.pointer?

> `optional` **pointer**: `boolean`

##### style.tooltip.pointerCurve?

> `optional` **pointerCurve**: `boolean`

##### style.tooltip.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

##### style.tooltip.pointerHeight?

> `optional` **pointerHeight**: `number`

##### style.tooltip.pointerOffset?

> `optional` **pointerOffset**: `number`

##### style.tooltip.pointerWidth?

> `optional` **pointerWidth**: `number`

##### style.tooltip.position?

> `optional` **position**: `object`

##### style.tooltip.position.x

> **x**: `number`

##### style.tooltip.position.y

> **y**: `number`

##### style.tooltip.position.z

> **z**: `number`

##### style.tooltip.progress?

> `optional` **progress**: `number`

##### style.tooltip.resolution?

> `optional` **resolution**: `number`

##### style.tooltip.smartOverflow?

> `optional` **smartOverflow**: `boolean`

##### style.tooltip.text?

> `optional` **text**: `string`

##### style.tooltip.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

##### style.tooltip.textColor?

> `optional` **textColor**: `string`

##### style.tooltip.textOutline?

> `optional` **textOutline**: `boolean`

##### style.tooltip.textOutlineColor?

> `optional` **textOutlineColor**: `string`

##### style.tooltip.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

##### style.tooltip.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

##### style.tooltip.textPath?

> `optional` **textPath**: `string`

##### style.tooltip.textShadow?

> `optional` **textShadow**: `boolean`

##### style.tooltip.textShadowBlur?

> `optional` **textShadowBlur**: `number`

##### style.tooltip.textShadowColor?

> `optional` **textShadowColor**: `string`

##### style.tooltip.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

##### style.tooltip.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`
