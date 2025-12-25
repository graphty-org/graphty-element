[@graphty/graphty-element](../../index.md) / [managers](../index.md) / InputManager

# Class: InputManager

Defined in: [src/managers/InputManager.ts:59](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L59)

Manages all user input for the graph
Provides a unified interface for mouse, keyboard, and touch input

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new InputManager**(`context`, `config`): `InputManager`

Defined in: [src/managers/InputManager.ts:82](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L82)

Creates an instance of InputManager

#### Parameters

##### context

[`ManagerContext`](../interfaces/ManagerContext.md)

Manager context providing access to scene, canvas, and event manager

##### config

[`InputManagerConfig`](../interfaces/InputManagerConfig.md) = `{}`

Input manager configuration options

#### Returns

`InputManager`

## Properties

### onKeyDown

> `readonly` **onKeyDown**: `Observable`\<`KeyboardInfo`\>

Defined in: [src/managers/InputManager.ts:68](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L68)

***

### onKeyUp

> `readonly` **onKeyUp**: `Observable`\<`KeyboardInfo`\>

Defined in: [src/managers/InputManager.ts:69](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L69)

***

### onPointerDown

> `readonly` **onPointerDown**: `Observable`\<`PointerInfo`\>

Defined in: [src/managers/InputManager.ts:62](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L62)

***

### onPointerMove

> `readonly` **onPointerMove**: `Observable`\<`PointerInfo`\>

Defined in: [src/managers/InputManager.ts:61](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L61)

***

### onPointerUp

> `readonly` **onPointerUp**: `Observable`\<`PointerInfo`\>

Defined in: [src/managers/InputManager.ts:63](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L63)

***

### onTouchEnd

> `readonly` **onTouchEnd**: `Observable`\<`number`[]\>

Defined in: [src/managers/InputManager.ts:67](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L67)

***

### onTouchMove

> `readonly` **onTouchMove**: `Observable`\<`TouchPoint`[]\>

Defined in: [src/managers/InputManager.ts:66](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L66)

***

### onTouchStart

> `readonly` **onTouchStart**: `Observable`\<`TouchPoint`[]\>

Defined in: [src/managers/InputManager.ts:65](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L65)

***

### onWheel

> `readonly` **onWheel**: `Observable`\<`WheelInfo`\>

Defined in: [src/managers/InputManager.ts:64](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L64)

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/InputManager.ts:139](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L139)

Disposes of the input manager and cleans up resources

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### exitPointerLock()

> **exitPointerLock**(): `void`

Defined in: [src/managers/InputManager.ts:475](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L475)

Exit pointer lock

#### Returns

`void`

***

### getActiveTouches()

> **getActiveTouches**(): `TouchPoint`[]

Defined in: [src/managers/InputManager.ts:190](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L190)

Get all active touch points

#### Returns

`TouchPoint`[]

Array of active touch points

***

### getMockInputSystem()

> **getMockInputSystem**(): `MockDeviceInputSystem`

Defined in: [src/managers/InputManager.ts:199](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L199)

Get the mock input system for testing

#### Returns

`MockDeviceInputSystem`

MockDeviceInputSystem instance

#### Throws

Error if not using mock input

***

### getPointerPosition()

> **getPointerPosition**(): `Vector2`

Defined in: [src/managers/InputManager.ts:173](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L173)

Get the current pointer position

#### Returns

`Vector2`

Current pointer position as Vector2

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/InputManager.ts:106](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L106)

Initializes the input manager and sets up event bridges

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### isPointerDown()

> **isPointerDown**(`button?`): `boolean`

Defined in: [src/managers/InputManager.ts:182](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L182)

Check if a pointer button is currently down

#### Parameters

##### button?

`MouseButton`

Mouse button to check (left, middle, right)

#### Returns

`boolean`

True if the button is pressed, false otherwise

***

### requestPointerLock()

> **requestPointerLock**(): `Promise`\<`void`\>

Defined in: [src/managers/InputManager.ts:459](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L459)

Enable pointer lock for FPS-style controls

#### Returns

`Promise`\<`void`\>

***

### setEnabled()

> **setEnabled**(`enabled`): `void`

Defined in: [src/managers/InputManager.ts:156](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L156)

Enable or disable all input

#### Parameters

##### enabled

`boolean`

Whether input should be enabled

#### Returns

`void`

***

### startPlayback()

> **startPlayback**(`events?`): `Promise`\<`void`\>

Defined in: [src/managers/InputManager.ts:233](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L233)

Start playback of recorded events

#### Parameters

##### events?

[`RecordedInputEvent`](../interfaces/RecordedInputEvent.md)[]

Optional array of events to play back

#### Returns

`Promise`\<`void`\>

Promise that resolves when playback completes

***

### startRecording()

> **startRecording**(): `void`

Defined in: [src/managers/InputManager.ts:210](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L210)

Start recording input events

#### Returns

`void`

***

### stopRecording()

> **stopRecording**(): [`RecordedInputEvent`](../interfaces/RecordedInputEvent.md)[]

Defined in: [src/managers/InputManager.ts:220](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L220)

Stop recording input events

#### Returns

[`RecordedInputEvent`](../interfaces/RecordedInputEvent.md)[]

Array of recorded events

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [src/managers/InputManager.ts:446](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/InputManager.ts#L446)

Update configuration

#### Parameters

##### config

`Partial`\<[`InputManagerConfig`](../interfaces/InputManagerConfig.md)\>

Partial configuration to merge with existing config

#### Returns

`void`
