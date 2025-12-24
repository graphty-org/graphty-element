[@graphty/graphty-element](../../index.md) / [managers](../index.md) / StyleManager

# Class: StyleManager

Defined in: [src/managers/StyleManager.ts:11](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L11)

Manages graph styling, wrapping the Styles class with additional caching
and event-driven updates.

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new StyleManager**(`eventManager`, `styles?`): `StyleManager`

Defined in: [src/managers/StyleManager.ts:17](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L17)

#### Parameters

##### eventManager

[`EventManager`](EventManager.md)

##### styles?

[`Styles`](../../Styles/classes/Styles.md)

#### Returns

`StyleManager`

## Methods

### addLayer()

> **addLayer**(`layer`): `void`

Defined in: [src/managers/StyleManager.ts:108](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L108)

Add a new style layer

#### Parameters

##### layer

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

### clearCache()

> **clearCache**(): `void`

Defined in: [src/managers/StyleManager.ts:164](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L164)

Clear the style cache

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/StyleManager.ts:34](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L34)

Dispose of all resources held by the manager

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### getCalculatedStylesForNode()

> **getCalculatedStylesForNode**(`data`): `CalculatedValue`[]

Defined in: [src/managers/StyleManager.ts:67](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L67)

Get calculated styles for a node

#### Parameters

##### data

[`AdHocData`](../../config/type-aliases/AdHocData.md)

#### Returns

`CalculatedValue`[]

***

### getStyleForEdge()

> **getStyleForEdge**(`data`, `algorithmResults?`): [`EdgeStyleId`](../../Styles/type-aliases/EdgeStyleId.md)

Defined in: [src/managers/StyleManager.ts:75](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L75)

Get style ID for an edge, with caching

#### Parameters

##### data

[`AdHocData`](../../config/type-aliases/AdHocData.md)

##### algorithmResults?

[`AdHocData`](../../config/type-aliases/AdHocData.md)

#### Returns

[`EdgeStyleId`](../../Styles/type-aliases/EdgeStyleId.md)

***

### getStyleForEdgeStyleId()

> `static` **getStyleForEdgeStyleId**(`id`): `object`

Defined in: [src/managers/StyleManager.ts:101](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L101)

Get edge style configuration by ID

#### Parameters

##### id

[`EdgeStyleId`](../../Styles/type-aliases/EdgeStyleId.md)

#### Returns

`object`

##### arrowHead?

> `optional` **arrowHead**: `object`

###### arrowHead.color?

> `optional` **color**: `string`

###### arrowHead.opacity?

> `optional` **opacity**: `number`

###### arrowHead.size?

> `optional` **size**: `number`

###### arrowHead.text?

> `optional` **text**: `object`

###### arrowHead.text.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

###### arrowHead.text.animationSpeed?

> `optional` **animationSpeed**: `number`

###### arrowHead.text.attachOffset?

> `optional` **attachOffset**: `number`

###### arrowHead.text.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

###### arrowHead.text.autoSize?

> `optional` **autoSize**: `boolean`

###### arrowHead.text.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

###### arrowHead.text.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

###### arrowHead.text.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

###### arrowHead.text.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

###### arrowHead.text.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

###### arrowHead.text.backgroundPadding?

> `optional` **backgroundPadding**: `number`

###### arrowHead.text.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

###### arrowHead.text.billboardMode?

> `optional` **billboardMode**: `number`

###### arrowHead.text.borderColor?

> `optional` **borderColor**: `string`

###### arrowHead.text.borders?

> `optional` **borders**: `object`[]

###### arrowHead.text.borderWidth?

> `optional` **borderWidth**: `number`

###### arrowHead.text.cornerRadius?

> `optional` **cornerRadius**: `number`

###### arrowHead.text.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

###### arrowHead.text.depthFadeFar?

> `optional` **depthFadeFar**: `number`

###### arrowHead.text.depthFadeNear?

> `optional` **depthFadeNear**: `number`

###### arrowHead.text.enabled?

> `optional` **enabled**: `boolean`

###### arrowHead.text.font?

> `optional` **font**: `string`

###### arrowHead.text.fontSize?

> `optional` **fontSize**: `number`

###### arrowHead.text.fontWeight?

> `optional` **fontWeight**: `string`

###### arrowHead.text.icon?

> `optional` **icon**: `string`

###### arrowHead.text.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

###### arrowHead.text.lineHeight?

> `optional` **lineHeight**: `number`

###### arrowHead.text.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

###### arrowHead.text.marginBottom?

> `optional` **marginBottom**: `number`

###### arrowHead.text.marginLeft?

> `optional` **marginLeft**: `number`

###### arrowHead.text.marginRight?

> `optional` **marginRight**: `number`

###### arrowHead.text.marginTop?

> `optional` **marginTop**: `number`

###### arrowHead.text.maxNumber?

> `optional` **maxNumber**: `number`

###### arrowHead.text.overflowSuffix?

> `optional` **overflowSuffix**: `string`

###### arrowHead.text.pointer?

> `optional` **pointer**: `boolean`

###### arrowHead.text.pointerCurve?

> `optional` **pointerCurve**: `boolean`

###### arrowHead.text.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

###### arrowHead.text.pointerHeight?

> `optional` **pointerHeight**: `number`

###### arrowHead.text.pointerOffset?

> `optional` **pointerOffset**: `number`

###### arrowHead.text.pointerWidth?

> `optional` **pointerWidth**: `number`

###### arrowHead.text.position?

> `optional` **position**: `object`

###### arrowHead.text.position.x

> **x**: `number`

###### arrowHead.text.position.y

> **y**: `number`

###### arrowHead.text.position.z

> **z**: `number`

###### arrowHead.text.progress?

> `optional` **progress**: `number`

###### arrowHead.text.resolution?

> `optional` **resolution**: `number`

###### arrowHead.text.smartOverflow?

> `optional` **smartOverflow**: `boolean`

###### arrowHead.text.text?

> `optional` **text**: `string`

###### arrowHead.text.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

###### arrowHead.text.textColor?

> `optional` **textColor**: `string`

###### arrowHead.text.textOutline?

> `optional` **textOutline**: `boolean`

###### arrowHead.text.textOutlineColor?

> `optional` **textOutlineColor**: `string`

###### arrowHead.text.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

###### arrowHead.text.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

###### arrowHead.text.textPath?

> `optional` **textPath**: `string`

###### arrowHead.text.textShadow?

> `optional` **textShadow**: `boolean`

###### arrowHead.text.textShadowBlur?

> `optional` **textShadowBlur**: `number`

###### arrowHead.text.textShadowColor?

> `optional` **textShadowColor**: `string`

###### arrowHead.text.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

###### arrowHead.text.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

###### arrowHead.type?

> `optional` **type**: `"none"` \| `"dot"` \| `"normal"` \| `"inverted"` \| `"sphere-dot"` \| `"open-dot"` \| `"tee"` \| `"open-normal"` \| `"diamond"` \| `"open-diamond"` \| `"crow"` \| `"box"` \| `"half-open"` \| `"vee"`

##### arrowTail?

> `optional` **arrowTail**: `object`

###### arrowTail.color?

> `optional` **color**: `string`

###### arrowTail.opacity?

> `optional` **opacity**: `number`

###### arrowTail.size?

> `optional` **size**: `number`

###### arrowTail.text?

> `optional` **text**: `object`

###### arrowTail.text.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

###### arrowTail.text.animationSpeed?

> `optional` **animationSpeed**: `number`

###### arrowTail.text.attachOffset?

> `optional` **attachOffset**: `number`

###### arrowTail.text.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

###### arrowTail.text.autoSize?

> `optional` **autoSize**: `boolean`

###### arrowTail.text.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

###### arrowTail.text.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

###### arrowTail.text.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

###### arrowTail.text.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

###### arrowTail.text.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

###### arrowTail.text.backgroundPadding?

> `optional` **backgroundPadding**: `number`

###### arrowTail.text.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

###### arrowTail.text.billboardMode?

> `optional` **billboardMode**: `number`

###### arrowTail.text.borderColor?

> `optional` **borderColor**: `string`

###### arrowTail.text.borders?

> `optional` **borders**: `object`[]

###### arrowTail.text.borderWidth?

> `optional` **borderWidth**: `number`

###### arrowTail.text.cornerRadius?

> `optional` **cornerRadius**: `number`

###### arrowTail.text.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

###### arrowTail.text.depthFadeFar?

> `optional` **depthFadeFar**: `number`

###### arrowTail.text.depthFadeNear?

> `optional` **depthFadeNear**: `number`

###### arrowTail.text.enabled?

> `optional` **enabled**: `boolean`

###### arrowTail.text.font?

> `optional` **font**: `string`

###### arrowTail.text.fontSize?

> `optional` **fontSize**: `number`

###### arrowTail.text.fontWeight?

> `optional` **fontWeight**: `string`

###### arrowTail.text.icon?

> `optional` **icon**: `string`

###### arrowTail.text.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

###### arrowTail.text.lineHeight?

> `optional` **lineHeight**: `number`

###### arrowTail.text.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

###### arrowTail.text.marginBottom?

> `optional` **marginBottom**: `number`

###### arrowTail.text.marginLeft?

> `optional` **marginLeft**: `number`

###### arrowTail.text.marginRight?

> `optional` **marginRight**: `number`

###### arrowTail.text.marginTop?

> `optional` **marginTop**: `number`

###### arrowTail.text.maxNumber?

> `optional` **maxNumber**: `number`

###### arrowTail.text.overflowSuffix?

> `optional` **overflowSuffix**: `string`

###### arrowTail.text.pointer?

> `optional` **pointer**: `boolean`

###### arrowTail.text.pointerCurve?

> `optional` **pointerCurve**: `boolean`

###### arrowTail.text.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

###### arrowTail.text.pointerHeight?

> `optional` **pointerHeight**: `number`

###### arrowTail.text.pointerOffset?

> `optional` **pointerOffset**: `number`

###### arrowTail.text.pointerWidth?

> `optional` **pointerWidth**: `number`

###### arrowTail.text.position?

> `optional` **position**: `object`

###### arrowTail.text.position.x

> **x**: `number`

###### arrowTail.text.position.y

> **y**: `number`

###### arrowTail.text.position.z

> **z**: `number`

###### arrowTail.text.progress?

> `optional` **progress**: `number`

###### arrowTail.text.resolution?

> `optional` **resolution**: `number`

###### arrowTail.text.smartOverflow?

> `optional` **smartOverflow**: `boolean`

###### arrowTail.text.text?

> `optional` **text**: `string`

###### arrowTail.text.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

###### arrowTail.text.textColor?

> `optional` **textColor**: `string`

###### arrowTail.text.textOutline?

> `optional` **textOutline**: `boolean`

###### arrowTail.text.textOutlineColor?

> `optional` **textOutlineColor**: `string`

###### arrowTail.text.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

###### arrowTail.text.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

###### arrowTail.text.textPath?

> `optional` **textPath**: `string`

###### arrowTail.text.textShadow?

> `optional` **textShadow**: `boolean`

###### arrowTail.text.textShadowBlur?

> `optional` **textShadowBlur**: `number`

###### arrowTail.text.textShadowColor?

> `optional` **textShadowColor**: `string`

###### arrowTail.text.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

###### arrowTail.text.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

###### arrowTail.type?

> `optional` **type**: `"none"` \| `"dot"` \| `"normal"` \| `"inverted"` \| `"sphere-dot"` \| `"open-dot"` \| `"tee"` \| `"open-normal"` \| `"diamond"` \| `"open-diamond"` \| `"crow"` \| `"box"` \| `"half-open"` \| `"vee"`

##### enabled?

> `optional` **enabled**: `boolean`

##### label?

> `optional` **label**: `object`

###### label.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

###### label.animationSpeed?

> `optional` **animationSpeed**: `number`

###### label.attachOffset?

> `optional` **attachOffset**: `number`

###### label.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

###### label.autoSize?

> `optional` **autoSize**: `boolean`

###### label.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

###### label.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

###### label.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

###### label.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

###### label.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

###### label.backgroundPadding?

> `optional` **backgroundPadding**: `number`

###### label.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

###### label.billboardMode?

> `optional` **billboardMode**: `number`

###### label.borderColor?

> `optional` **borderColor**: `string`

###### label.borders?

> `optional` **borders**: `object`[]

###### label.borderWidth?

> `optional` **borderWidth**: `number`

###### label.cornerRadius?

> `optional` **cornerRadius**: `number`

###### label.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

###### label.depthFadeFar?

> `optional` **depthFadeFar**: `number`

###### label.depthFadeNear?

> `optional` **depthFadeNear**: `number`

###### label.enabled?

> `optional` **enabled**: `boolean`

###### label.font?

> `optional` **font**: `string`

###### label.fontSize?

> `optional` **fontSize**: `number`

###### label.fontWeight?

> `optional` **fontWeight**: `string`

###### label.icon?

> `optional` **icon**: `string`

###### label.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

###### label.lineHeight?

> `optional` **lineHeight**: `number`

###### label.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

###### label.marginBottom?

> `optional` **marginBottom**: `number`

###### label.marginLeft?

> `optional` **marginLeft**: `number`

###### label.marginRight?

> `optional` **marginRight**: `number`

###### label.marginTop?

> `optional` **marginTop**: `number`

###### label.maxNumber?

> `optional` **maxNumber**: `number`

###### label.overflowSuffix?

> `optional` **overflowSuffix**: `string`

###### label.pointer?

> `optional` **pointer**: `boolean`

###### label.pointerCurve?

> `optional` **pointerCurve**: `boolean`

###### label.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

###### label.pointerHeight?

> `optional` **pointerHeight**: `number`

###### label.pointerOffset?

> `optional` **pointerOffset**: `number`

###### label.pointerWidth?

> `optional` **pointerWidth**: `number`

###### label.position?

> `optional` **position**: `object`

###### label.position.x

> **x**: `number`

###### label.position.y

> **y**: `number`

###### label.position.z

> **z**: `number`

###### label.progress?

> `optional` **progress**: `number`

###### label.resolution?

> `optional` **resolution**: `number`

###### label.smartOverflow?

> `optional` **smartOverflow**: `boolean`

###### label.text?

> `optional` **text**: `string`

###### label.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

###### label.textColor?

> `optional` **textColor**: `string`

###### label.textOutline?

> `optional` **textOutline**: `boolean`

###### label.textOutlineColor?

> `optional` **textOutlineColor**: `string`

###### label.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

###### label.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

###### label.textPath?

> `optional` **textPath**: `string`

###### label.textShadow?

> `optional` **textShadow**: `boolean`

###### label.textShadowBlur?

> `optional` **textShadowBlur**: `number`

###### label.textShadowColor?

> `optional` **textShadowColor**: `string`

###### label.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

###### label.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

##### line?

> `optional` **line**: `object`

###### line.animationSpeed?

> `optional` **animationSpeed**: `number`

###### line.bezier?

> `optional` **bezier**: `boolean`

###### line.color?

> `optional` **color**: `string`

###### line.opacity?

> `optional` **opacity**: `number`

###### line.type?

> `optional` **type**: `"solid"` \| `"dot"` \| `"diamond"` \| `"box"` \| `"star"` \| `"dash"` \| `"dash-dot"` \| `"sinewave"` \| `"zigzag"`

###### line.width?

> `optional` **width**: `number`

##### tooltip?

> `optional` **tooltip**: `object`

###### tooltip.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

###### tooltip.animationSpeed?

> `optional` **animationSpeed**: `number`

###### tooltip.attachOffset?

> `optional` **attachOffset**: `number`

###### tooltip.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

###### tooltip.autoSize?

> `optional` **autoSize**: `boolean`

###### tooltip.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

###### tooltip.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

###### tooltip.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

###### tooltip.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

###### tooltip.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

###### tooltip.backgroundPadding?

> `optional` **backgroundPadding**: `number`

###### tooltip.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

###### tooltip.billboardMode?

> `optional` **billboardMode**: `number`

###### tooltip.borderColor?

> `optional` **borderColor**: `string`

###### tooltip.borders?

> `optional` **borders**: `object`[]

###### tooltip.borderWidth?

> `optional` **borderWidth**: `number`

###### tooltip.cornerRadius?

> `optional` **cornerRadius**: `number`

###### tooltip.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

###### tooltip.depthFadeFar?

> `optional` **depthFadeFar**: `number`

###### tooltip.depthFadeNear?

> `optional` **depthFadeNear**: `number`

###### tooltip.enabled?

> `optional` **enabled**: `boolean`

###### tooltip.font?

> `optional` **font**: `string`

###### tooltip.fontSize?

> `optional` **fontSize**: `number`

###### tooltip.fontWeight?

> `optional` **fontWeight**: `string`

###### tooltip.icon?

> `optional` **icon**: `string`

###### tooltip.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

###### tooltip.lineHeight?

> `optional` **lineHeight**: `number`

###### tooltip.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

###### tooltip.marginBottom?

> `optional` **marginBottom**: `number`

###### tooltip.marginLeft?

> `optional` **marginLeft**: `number`

###### tooltip.marginRight?

> `optional` **marginRight**: `number`

###### tooltip.marginTop?

> `optional` **marginTop**: `number`

###### tooltip.maxNumber?

> `optional` **maxNumber**: `number`

###### tooltip.overflowSuffix?

> `optional` **overflowSuffix**: `string`

###### tooltip.pointer?

> `optional` **pointer**: `boolean`

###### tooltip.pointerCurve?

> `optional` **pointerCurve**: `boolean`

###### tooltip.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

###### tooltip.pointerHeight?

> `optional` **pointerHeight**: `number`

###### tooltip.pointerOffset?

> `optional` **pointerOffset**: `number`

###### tooltip.pointerWidth?

> `optional` **pointerWidth**: `number`

###### tooltip.position?

> `optional` **position**: `object`

###### tooltip.position.x

> **x**: `number`

###### tooltip.position.y

> **y**: `number`

###### tooltip.position.z

> **z**: `number`

###### tooltip.progress?

> `optional` **progress**: `number`

###### tooltip.resolution?

> `optional` **resolution**: `number`

###### tooltip.smartOverflow?

> `optional` **smartOverflow**: `boolean`

###### tooltip.text?

> `optional` **text**: `string`

###### tooltip.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

###### tooltip.textColor?

> `optional` **textColor**: `string`

###### tooltip.textOutline?

> `optional` **textOutline**: `boolean`

###### tooltip.textOutlineColor?

> `optional` **textOutlineColor**: `string`

###### tooltip.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

###### tooltip.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

###### tooltip.textPath?

> `optional` **textPath**: `string`

###### tooltip.textShadow?

> `optional` **textShadow**: `boolean`

###### tooltip.textShadowBlur?

> `optional` **textShadowBlur**: `number`

###### tooltip.textShadowColor?

> `optional` **textShadowColor**: `string`

###### tooltip.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

###### tooltip.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

***

### getStyleForNode()

> **getStyleForNode**(`data`, `algorithmResults?`): [`NodeStyleId`](../../Styles/type-aliases/NodeStyleId.md)

Defined in: [src/managers/StyleManager.ts:48](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L48)

Get style ID for a node, with caching

#### Parameters

##### data

[`AdHocData`](../../config/type-aliases/AdHocData.md)

##### algorithmResults?

[`AdHocData`](../../config/type-aliases/AdHocData.md)

#### Returns

[`NodeStyleId`](../../Styles/type-aliases/NodeStyleId.md)

***

### getStyleForNodeStyleId()

> `static` **getStyleForNodeStyleId**(`id`): `object`

Defined in: [src/managers/StyleManager.ts:94](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L94)

Get node style configuration by ID

#### Parameters

##### id

[`NodeStyleId`](../../Styles/type-aliases/NodeStyleId.md)

#### Returns

`object`

##### effect?

> `optional` **effect**: `object`

###### effect.flatShaded?

> `optional` **flatShaded**: `boolean`

###### effect.glow?

> `optional` **glow**: `object`

###### effect.glow.color?

> `optional` **color**: `string`

###### effect.glow.strength?

> `optional` **strength**: `number`

###### effect.outline?

> `optional` **outline**: `object`

###### effect.outline.color?

> `optional` **color**: `string`

###### effect.outline.width?

> `optional` **width**: `number`

###### effect.wireframe?

> `optional` **wireframe**: `boolean`

##### enabled?

> `optional` **enabled**: `boolean`

##### label?

> `optional` **label**: `object`

###### label.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

###### label.animationSpeed?

> `optional` **animationSpeed**: `number`

###### label.attachOffset?

> `optional` **attachOffset**: `number`

###### label.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

###### label.autoSize?

> `optional` **autoSize**: `boolean`

###### label.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

###### label.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

###### label.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

###### label.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

###### label.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

###### label.backgroundPadding?

> `optional` **backgroundPadding**: `number`

###### label.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

###### label.billboardMode?

> `optional` **billboardMode**: `number`

###### label.borderColor?

> `optional` **borderColor**: `string`

###### label.borders?

> `optional` **borders**: `object`[]

###### label.borderWidth?

> `optional` **borderWidth**: `number`

###### label.cornerRadius?

> `optional` **cornerRadius**: `number`

###### label.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

###### label.depthFadeFar?

> `optional` **depthFadeFar**: `number`

###### label.depthFadeNear?

> `optional` **depthFadeNear**: `number`

###### label.enabled?

> `optional` **enabled**: `boolean`

###### label.font?

> `optional` **font**: `string`

###### label.fontSize?

> `optional` **fontSize**: `number`

###### label.fontWeight?

> `optional` **fontWeight**: `string`

###### label.icon?

> `optional` **icon**: `string`

###### label.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

###### label.lineHeight?

> `optional` **lineHeight**: `number`

###### label.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

###### label.marginBottom?

> `optional` **marginBottom**: `number`

###### label.marginLeft?

> `optional` **marginLeft**: `number`

###### label.marginRight?

> `optional` **marginRight**: `number`

###### label.marginTop?

> `optional` **marginTop**: `number`

###### label.maxNumber?

> `optional` **maxNumber**: `number`

###### label.overflowSuffix?

> `optional` **overflowSuffix**: `string`

###### label.pointer?

> `optional` **pointer**: `boolean`

###### label.pointerCurve?

> `optional` **pointerCurve**: `boolean`

###### label.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

###### label.pointerHeight?

> `optional` **pointerHeight**: `number`

###### label.pointerOffset?

> `optional` **pointerOffset**: `number`

###### label.pointerWidth?

> `optional` **pointerWidth**: `number`

###### label.position?

> `optional` **position**: `object`

###### label.position.x

> **x**: `number`

###### label.position.y

> **y**: `number`

###### label.position.z

> **z**: `number`

###### label.progress?

> `optional` **progress**: `number`

###### label.resolution?

> `optional` **resolution**: `number`

###### label.smartOverflow?

> `optional` **smartOverflow**: `boolean`

###### label.text?

> `optional` **text**: `string`

###### label.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

###### label.textColor?

> `optional` **textColor**: `string`

###### label.textOutline?

> `optional` **textOutline**: `boolean`

###### label.textOutlineColor?

> `optional` **textOutlineColor**: `string`

###### label.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

###### label.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

###### label.textPath?

> `optional` **textPath**: `string`

###### label.textShadow?

> `optional` **textShadow**: `boolean`

###### label.textShadowBlur?

> `optional` **textShadowBlur**: `number`

###### label.textShadowColor?

> `optional` **textShadowColor**: `string`

###### label.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

###### label.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

##### shape?

> `optional` **shape**: `object`

###### shape.size?

> `optional` **size**: `number`

###### shape.type?

> `optional` **type**: `"box"` \| `"sphere"` \| `"cylinder"` \| `"cone"` \| `"capsule"` \| `"torus-knot"` \| `"tetrahedron"` \| `"octahedron"` \| `"dodecahedron"` \| `"icosahedron"` \| `"rhombicuboctahedron"` \| `"triangular_prism"` \| `"pentagonal_prism"` \| `"hexagonal_prism"` \| `"square_pyramid"` \| `"pentagonal_pyramid"` \| `"triangular_dipyramid"` \| `"pentagonal_dipyramid"` \| `"elongated_square_dipyramid"` \| `"elongated_pentagonal_dipyramid"` \| `"elongated_pentagonal_cupola"` \| `"goldberg"` \| `"icosphere"` \| `"geodesic"`

##### texture?

> `optional` **texture**: `object`

###### texture.color?

> `optional` **color**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

###### texture.icon?

> `optional` **icon**: `string`

###### texture.image?

> `optional` **image**: `string`

##### tooltip?

> `optional` **tooltip**: `object`

###### tooltip.animation?

> `optional` **animation**: `"none"` \| `"pulse"` \| `"bounce"` \| `"shake"` \| `"glow"` \| `"fill"`

###### tooltip.animationSpeed?

> `optional` **animationSpeed**: `number`

###### tooltip.attachOffset?

> `optional` **attachOffset**: `number`

###### tooltip.attachPosition?

> `optional` **attachPosition**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"`

###### tooltip.autoSize?

> `optional` **autoSize**: `boolean`

###### tooltip.backgroundColor?

> `optional` **backgroundColor**: `string` \| \{ `colorType`: `"solid"`; `opacity?`: `number`; `value`: `string` \| `undefined`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"gradient"`; `direction`: `number`; `opacity?`: `number`; \} \| \{ `colors`: (`string` \| `undefined`)[]; `colorType`: `"radial-gradient"`; `opacity?`: `number`; \}

###### tooltip.backgroundGradient?

> `optional` **backgroundGradient**: `boolean`

###### tooltip.backgroundGradientColors?

> `optional` **backgroundGradientColors**: (`string` \| `undefined`)[]

###### tooltip.backgroundGradientDirection?

> `optional` **backgroundGradientDirection**: `"vertical"` \| `"horizontal"` \| `"diagonal"`

###### tooltip.backgroundGradientType?

> `optional` **backgroundGradientType**: `"linear"` \| `"radial"`

###### tooltip.backgroundPadding?

> `optional` **backgroundPadding**: `number`

###### tooltip.badge?

> `optional` **badge**: `"notification"` \| `"label"` \| `"label-success"` \| `"label-warning"` \| `"label-danger"` \| `"count"` \| `"icon"` \| `"progress"` \| `"dot"`

###### tooltip.billboardMode?

> `optional` **billboardMode**: `number`

###### tooltip.borderColor?

> `optional` **borderColor**: `string`

###### tooltip.borders?

> `optional` **borders**: `object`[]

###### tooltip.borderWidth?

> `optional` **borderWidth**: `number`

###### tooltip.cornerRadius?

> `optional` **cornerRadius**: `number`

###### tooltip.depthFadeEnabled?

> `optional` **depthFadeEnabled**: `boolean`

###### tooltip.depthFadeFar?

> `optional` **depthFadeFar**: `number`

###### tooltip.depthFadeNear?

> `optional` **depthFadeNear**: `number`

###### tooltip.enabled?

> `optional` **enabled**: `boolean`

###### tooltip.font?

> `optional` **font**: `string`

###### tooltip.fontSize?

> `optional` **fontSize**: `number`

###### tooltip.fontWeight?

> `optional` **fontWeight**: `string`

###### tooltip.icon?

> `optional` **icon**: `string`

###### tooltip.iconPosition?

> `optional` **iconPosition**: `"left"` \| `"right"`

###### tooltip.lineHeight?

> `optional` **lineHeight**: `number`

###### tooltip.location?

> `optional` **location**: `"top"` \| `"top-right"` \| `"top-left"` \| `"left"` \| `"center"` \| `"right"` \| `"bottom"` \| `"bottom-left"` \| `"bottom-right"` \| `"automatic"`

###### tooltip.marginBottom?

> `optional` **marginBottom**: `number`

###### tooltip.marginLeft?

> `optional` **marginLeft**: `number`

###### tooltip.marginRight?

> `optional` **marginRight**: `number`

###### tooltip.marginTop?

> `optional` **marginTop**: `number`

###### tooltip.maxNumber?

> `optional` **maxNumber**: `number`

###### tooltip.overflowSuffix?

> `optional` **overflowSuffix**: `string`

###### tooltip.pointer?

> `optional` **pointer**: `boolean`

###### tooltip.pointerCurve?

> `optional` **pointerCurve**: `boolean`

###### tooltip.pointerDirection?

> `optional` **pointerDirection**: `"top"` \| `"left"` \| `"right"` \| `"bottom"` \| `"auto"`

###### tooltip.pointerHeight?

> `optional` **pointerHeight**: `number`

###### tooltip.pointerOffset?

> `optional` **pointerOffset**: `number`

###### tooltip.pointerWidth?

> `optional` **pointerWidth**: `number`

###### tooltip.position?

> `optional` **position**: `object`

###### tooltip.position.x

> **x**: `number`

###### tooltip.position.y

> **y**: `number`

###### tooltip.position.z

> **z**: `number`

###### tooltip.progress?

> `optional` **progress**: `number`

###### tooltip.resolution?

> `optional` **resolution**: `number`

###### tooltip.smartOverflow?

> `optional` **smartOverflow**: `boolean`

###### tooltip.text?

> `optional` **text**: `string`

###### tooltip.textAlign?

> `optional` **textAlign**: `"left"` \| `"center"` \| `"right"`

###### tooltip.textColor?

> `optional` **textColor**: `string`

###### tooltip.textOutline?

> `optional` **textOutline**: `boolean`

###### tooltip.textOutlineColor?

> `optional` **textOutlineColor**: `string`

###### tooltip.textOutlineJoin?

> `optional` **textOutlineJoin**: `"round"` \| `"bevel"` \| `"miter"`

###### tooltip.textOutlineWidth?

> `optional` **textOutlineWidth**: `number`

###### tooltip.textPath?

> `optional` **textPath**: `string`

###### tooltip.textShadow?

> `optional` **textShadow**: `boolean`

###### tooltip.textShadowBlur?

> `optional` **textShadowBlur**: `number`

###### tooltip.textShadowColor?

> `optional` **textShadowColor**: `string`

###### tooltip.textShadowOffsetX?

> `optional` **textShadowOffsetX**: `number`

###### tooltip.textShadowOffsetY?

> `optional` **textShadowOffsetY**: `number`

***

### getStyles()

> **getStyles**(): [`Styles`](../../Styles/classes/Styles.md)

Defined in: [src/managers/StyleManager.ts:41](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L41)

Get the underlying Styles instance

#### Returns

[`Styles`](../../Styles/classes/Styles.md)

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/StyleManager.ts:30](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L30)

Initialize the manager

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### insertLayer()

> **insertLayer**(`position`, `layer`): `void`

Defined in: [src/managers/StyleManager.ts:117](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L117)

Insert a style layer at a specific position

#### Parameters

##### position

`number`

##### layer

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

### loadStylesFromObject()

> **loadStylesFromObject**(`obj`): `void`

Defined in: [src/managers/StyleManager.ts:137](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L137)

Load styles from an object

#### Parameters

##### obj

`object`

#### Returns

`void`

***

### loadStylesFromUrl()

> **loadStylesFromUrl**(`url`): `Promise`\<`void`\>

Defined in: [src/managers/StyleManager.ts:146](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L146)

Load styles from a URL

#### Parameters

##### url

`string`

#### Returns

`Promise`\<`void`\>

***

### removeLayersByMetadata()

> **removeLayersByMetadata**(`predicate`): `void`

Defined in: [src/managers/StyleManager.ts:126](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L126)

Remove style layers matching a metadata predicate

#### Parameters

##### predicate

(`metadata`) => `boolean`

#### Returns

`void`

***

### setCacheEnabled()

> **setCacheEnabled**(`enabled`): `void`

Defined in: [src/managers/StyleManager.ts:172](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L172)

Enable or disable caching

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

***

### updateStyles()

> **updateStyles**(`newStyles`): `void`

Defined in: [src/managers/StyleManager.ts:155](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StyleManager.ts#L155)

Update the styles configuration

#### Parameters

##### newStyles

[`Styles`](../../Styles/classes/Styles.md)

#### Returns

`void`
