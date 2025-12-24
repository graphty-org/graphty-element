[@graphty/graphty-element](../../index.md) / [config](../index.md) / XRInputConfig

# Interface: XRInputConfig

Defined in: [src/config/XRConfig.ts:67](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/XRConfig.ts#L67)

Configuration for XR input handling

## Properties

### controllers

> **controllers**: `boolean`

Defined in: [src/config/XRConfig.ts:78](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/XRConfig.ts#L78)

Enable controller input

#### Default

```ts
true
```

***

### enableZAmplificationInDesktop?

> `optional` **enableZAmplificationInDesktop**: `boolean`

Defined in: [src/config/XRConfig.ts:103](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/XRConfig.ts#L103)

Enable Z-axis amplification in desktop mode

#### Default

```ts
false
```

***

### handTracking

> **handTracking**: `boolean`

Defined in: [src/config/XRConfig.ts:72](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/XRConfig.ts#L72)

Enable hand tracking

#### Default

```ts
true
```

***

### nearInteraction

> **nearInteraction**: `boolean`

Defined in: [src/config/XRConfig.ts:84](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/XRConfig.ts#L84)

Enable near interaction (touching objects with hands)

#### Default

```ts
true
```

***

### physics

> **physics**: `boolean`

Defined in: [src/config/XRConfig.ts:90](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/XRConfig.ts#L90)

Enable physics for hand joints

#### Default

```ts
false
```

***

### zAxisAmplification?

> `optional` **zAxisAmplification**: `number`

Defined in: [src/config/XRConfig.ts:97](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/XRConfig.ts#L97)

Z-axis movement amplification factor in XR mode
Multiplies Z-axis delta to make depth manipulation more practical

#### Default

```ts
10.0
```
