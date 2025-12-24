[@graphty/graphty-element](../../index.md) / [config](../index.md) / XRUIConfig

# Interface: XRUIConfig

Defined in: [src/config/XRConfig.ts:12](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/XRConfig.ts#L12)

UI configuration for XR buttons

## Properties

### enabled

> **enabled**: `boolean`

Defined in: [src/config/XRConfig.ts:17](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/XRConfig.ts#L17)

Enable or disable the XR UI buttons

#### Default

```ts
true
```

***

### position

> **position**: `"top-right"` \| `"top-left"` \| `"bottom-left"` \| `"bottom-right"`

Defined in: [src/config/XRConfig.ts:23](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/XRConfig.ts#L23)

Position of the XR buttons on screen

#### Default

```ts
"bottom-left"
```

***

### showAvailabilityWarning

> **showAvailabilityWarning**: `boolean`

Defined in: [src/config/XRConfig.ts:37](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/XRConfig.ts#L37)

Show "VR / AR NOT AVAILABLE" warning when XR is not available
When false, no message is displayed if AR/VR aren't available

#### Default

```ts
false
```

***

### unavailableMessageDuration

> **unavailableMessageDuration**: `number`

Defined in: [src/config/XRConfig.ts:30](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/config/XRConfig.ts#L30)

Duration in milliseconds to show "not available" message
Set to 0 to keep message visible permanently

#### Default

```ts
5000
```
