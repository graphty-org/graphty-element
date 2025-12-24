[@graphty/graphty-element](../../index.md) / [config](../index.md) / XRModeConfig

# Interface: XRModeConfig

Defined in: [src/config/XRConfig.ts:43](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/XRConfig.ts#L43)

Configuration for VR or AR mode

## Properties

### enabled

> **enabled**: `boolean`

Defined in: [src/config/XRConfig.ts:48](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/XRConfig.ts#L48)

Enable this XR mode

#### Default

```ts
true
```

***

### optionalFeatures?

> `optional` **optionalFeatures**: `string`[]

Defined in: [src/config/XRConfig.ts:61](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/XRConfig.ts#L61)

Optional WebXR features to request

#### Example

```ts
["hand-tracking", "hit-test"]
```

#### Default

```ts
[]
```

***

### referenceSpaceType

> **referenceSpaceType**: `XRReferenceSpaceType`

Defined in: [src/config/XRConfig.ts:54](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/config/XRConfig.ts#L54)

Reference space type for WebXR session

#### Default

```ts
"local-floor"
```
