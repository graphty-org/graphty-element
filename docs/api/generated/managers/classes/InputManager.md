[@graphty/graphty-element](../../index.md) / [managers](../index.md) / InputManager

# Class: InputManager

Defined in: [src/managers/InputManager.ts:59](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L59)

Manages all user input for the graph
Provides a unified interface for mouse, keyboard, and touch input

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new InputManager**(`context`, `config`): `InputManager`

Defined in: [src/managers/InputManager.ts:77](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L77)

#### Parameters

##### context

[`ManagerContext`](../interfaces/ManagerContext.md)

##### config

[`InputManagerConfig`](../interfaces/InputManagerConfig.md) = `{}`

#### Returns

`InputManager`

## Properties

### onKeyDown

> `readonly` **onKeyDown**: `Observable`\<`KeyboardInfo`\>

Defined in: [src/managers/InputManager.ts:68](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L68)

***

### onKeyUp

> `readonly` **onKeyUp**: `Observable`\<`KeyboardInfo`\>

Defined in: [src/managers/InputManager.ts:69](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L69)

***

### onPointerDown

> `readonly` **onPointerDown**: `Observable`\<`PointerInfo`\>

Defined in: [src/managers/InputManager.ts:62](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L62)

***

### onPointerMove

> `readonly` **onPointerMove**: `Observable`\<`PointerInfo`\>

Defined in: [src/managers/InputManager.ts:61](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L61)

***

### onPointerUp

> `readonly` **onPointerUp**: `Observable`\<`PointerInfo`\>

Defined in: [src/managers/InputManager.ts:63](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L63)

***

### onTouchEnd

> `readonly` **onTouchEnd**: `Observable`\<`number`[]\>

Defined in: [src/managers/InputManager.ts:67](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L67)

***

### onTouchMove

> `readonly` **onTouchMove**: `Observable`\<`TouchPoint`[]\>

Defined in: [src/managers/InputManager.ts:66](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L66)

***

### onTouchStart

> `readonly` **onTouchStart**: `Observable`\<`TouchPoint`[]\>

Defined in: [src/managers/InputManager.ts:65](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L65)

***

### onWheel

> `readonly` **onWheel**: `Observable`\<`WheelInfo`\>

Defined in: [src/managers/InputManager.ts:64](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L64)

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/InputManager.ts:128](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L128)

Dispose of all resources held by the manager

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### exitPointerLock()

> **exitPointerLock**(): `void`

Defined in: [src/managers/InputManager.ts:451](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L451)

Exit pointer lock

#### Returns

`void`

***

### getActiveTouches()

> **getActiveTouches**(): `TouchPoint`[]

Defined in: [src/managers/InputManager.ts:174](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L174)

Get all active touch points

#### Returns

`TouchPoint`[]

***

### getMockInputSystem()

> **getMockInputSystem**(): `MockDeviceInputSystem`

Defined in: [src/managers/InputManager.ts:182](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L182)

Get the mock input system for testing

#### Returns

`MockDeviceInputSystem`

#### Throws

Error if not using mock input

***

### getPointerPosition()

> **getPointerPosition**(): `Vector2`

Defined in: [src/managers/InputManager.ts:160](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L160)

Get the current pointer position

#### Returns

`Vector2`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/InputManager.ts:98](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L98)

Initialize the manager

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### isPointerDown()

> **isPointerDown**(`button?`): `boolean`

Defined in: [src/managers/InputManager.ts:167](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L167)

Check if a pointer button is currently down

#### Parameters

##### button?

`MouseButton`

#### Returns

`boolean`

***

### requestPointerLock()

> **requestPointerLock**(): `Promise`\<`void`\>

Defined in: [src/managers/InputManager.ts:435](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L435)

Enable pointer lock for FPS-style controls

#### Returns

`Promise`\<`void`\>

***

### setEnabled()

> **setEnabled**(`enabled`): `void`

Defined in: [src/managers/InputManager.ts:144](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L144)

Enable or disable all input

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

***

### startPlayback()

> **startPlayback**(`events?`): `Promise`\<`void`\>

Defined in: [src/managers/InputManager.ts:213](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L213)

Start playback of recorded events

#### Parameters

##### events?

[`RecordedInputEvent`](../interfaces/RecordedInputEvent.md)[]

#### Returns

`Promise`\<`void`\>

***

### startRecording()

> **startRecording**(): `void`

Defined in: [src/managers/InputManager.ts:193](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L193)

Start recording input events

#### Returns

`void`

***

### stopRecording()

> **stopRecording**(): [`RecordedInputEvent`](../interfaces/RecordedInputEvent.md)[]

Defined in: [src/managers/InputManager.ts:202](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L202)

Stop recording input events

#### Returns

[`RecordedInputEvent`](../interfaces/RecordedInputEvent.md)[]

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [src/managers/InputManager.ts:422](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/InputManager.ts#L422)

Update configuration

#### Parameters

##### config

`Partial`\<[`InputManagerConfig`](../interfaces/InputManagerConfig.md)\>

#### Returns

`void`
