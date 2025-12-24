[@graphty/graphty-element](../../index.md) / [Graph](../index.md) / Graph

# Class: Graph

Defined in: [src/Graph.ts:65](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L65)

GraphContext provides controlled access to graph services
This interface allows Node and Edge classes to access required services
without direct dependency on the Graph class, eliminating circular dependencies

## Implements

- [`GraphContext`](../../managers/interfaces/GraphContext.md)

## Constructors

### Constructor

> **new Graph**(`element`, `useMockInput`): `Graph`

Defined in: [src/Graph.ts:123](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L123)

#### Parameters

##### element

`string` | `Element`

##### useMockInput

`boolean` = `false`

#### Returns

`Graph`

## Properties

### camera

> **camera**: `CameraManager`

Defined in: [src/Graph.ts:72](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L72)

***

### canvas

> **canvas**: `HTMLCanvasElement`

Defined in: [src/Graph.ts:69](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L69)

***

### element

> **element**: `Element`

Defined in: [src/Graph.ts:68](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L68)

***

### enableDetailedProfiling?

> `optional` **enableDetailedProfiling**: `boolean`

Defined in: [src/Graph.ts:85](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L85)

***

### engine

> **engine**: `Engine` \| `WebGPUEngine`

Defined in: [src/Graph.ts:70](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L70)

***

### eventManager

> `readonly` **eventManager**: [`EventManager`](../../managers/classes/EventManager.md)

Defined in: [src/Graph.ts:97](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L97)

Event manager for adding/removing event listeners

***

### fetchEdges?

> `optional` **fetchEdges**: [`FetchEdgesFn`](../../config/type-aliases/FetchEdgesFn.md)

Defined in: [src/Graph.ts:82](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L82)

***

### fetchNodes?

> `optional` **fetchNodes**: [`FetchNodesFn`](../../config/type-aliases/FetchNodesFn.md)

Defined in: [src/Graph.ts:81](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L81)

***

### initialized

> **initialized**: `boolean` = `false`

Defined in: [src/Graph.ts:83](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L83)

***

### needRays

> **needRays**: `boolean` = `true`

Defined in: [src/Graph.ts:77](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L77)

***

### operationQueue

> **operationQueue**: [`OperationQueueManager`](../../managers/classes/OperationQueueManager.md)

Defined in: [src/Graph.ts:108](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L108)

***

### pinOnDrag?

> `optional` **pinOnDrag**: `boolean`

Defined in: [src/Graph.ts:79](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L79)

***

### runAlgorithmsOnLoad

> **runAlgorithmsOnLoad**: `boolean` = `false`

Defined in: [src/Graph.ts:84](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L84)

***

### scene

> **scene**: `Scene`

Defined in: [src/Graph.ts:71](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L71)

***

### skybox?

> `optional` **skybox**: `string`

Defined in: [src/Graph.ts:75](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L75)

***

### styles

> **styles**: [`Styles`](../../Styles/classes/Styles.md)

Defined in: [src/Graph.ts:66](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L66)

***

### xrHelper

> **xrHelper**: `WebXRDefaultExperience` \| `null` = `null`

Defined in: [src/Graph.ts:76](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L76)

## Accessors

### input

#### Get Signature

> **get** **input**(): [`InputManager`](../../managers/classes/InputManager.md)

Defined in: [src/Graph.ts:1935](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1935)

Get the input manager

##### Returns

[`InputManager`](../../managers/classes/InputManager.md)

## Methods

### addDataFromSource()

> **addDataFromSource**(`type`, `opts`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:734](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L734)

#### Parameters

##### type

`string`

##### opts

`object` = `{}`

#### Returns

`Promise`\<`void`\>

***

### addEdge()

> **addEdge**(`edge`, `srcIdPath?`, `dstIdPath?`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:942](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L942)

#### Parameters

##### edge

[`AdHocData`](../../config/type-aliases/AdHocData.md)

##### srcIdPath?

`string`

##### dstIdPath?

`string`

##### options?

`QueueableOptions`

#### Returns

`Promise`\<`void`\>

***

### addEdges()

> **addEdges**(`edges`, `srcIdPath?`, `dstIdPath?`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:987](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L987)

Add edges to the graph incrementally.

#### Parameters

##### edges

`Record`\<`string` \| `number`, `unknown`\>[]

Array of edge data objects to add

##### srcIdPath?

`string`

Path to source node ID in edge data (default: "source")

##### dstIdPath?

`string`

Path to target node ID in edge data (default: "target")

##### options?

`QueueableOptions`

Queue options for operation ordering

#### Returns

`Promise`\<`void`\>

Promise that resolves when edges are added

#### Remarks

This method ADDS edges to the existing graph without removing existing edges.
Source and target nodes should exist before adding edges, otherwise the edges
will reference non-existent nodes.

Edges connect nodes and can optionally store additional data accessible
via `edge.data`.

#### Since

1.0.0

#### See

 - [addNodes](#addnodes) for adding nodes first
 - [Data Loading Examples](https://graphty-org.github.io/graphty-element/storybook/?path=/story/data--default)

#### Example

```typescript
// Add edges with default source/target fields
await graph.addEdges([
  { source: 'node-1', target: 'node-2', weight: 1.5 },
  { source: 'node-2', target: 'node-3', weight: 2.0 }
]);

// Add edges with custom field names
await graph.addEdges(
  [{ from: 'a', to: 'b', label: 'connects' }],
  'from',
  'to'
);

// Add nodes and edges together
await graph.addNodes([{id: 'a'}, {id: 'b'}]);
await graph.addEdges([{source: 'a', target: 'b'}]);
```

***

### addListener()

> **addListener**(`type`, `cb`): `void`

Defined in: [src/Graph.ts:1410](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1410)

#### Parameters

##### type

[`EventType`](../../events/type-aliases/EventType.md)

##### cb

[`EventCallbackType`](../../events/type-aliases/EventCallbackType.md)

#### Returns

`void`

***

### addNode()

> **addNode**(`node`, `idPath?`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:877](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L877)

#### Parameters

##### node

[`AdHocData`](../../config/type-aliases/AdHocData.md)

##### idPath?

`string`

##### options?

`QueueableOptions`

#### Returns

`Promise`\<`void`\>

***

### addNodes()

> **addNodes**(`nodes`, `idPath?`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:920](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L920)

Add nodes to the graph incrementally.

#### Parameters

##### nodes

`Record`\<`string` \| `number`, `unknown`\>[]

Array of node data objects to add

##### idPath?

`string`

Key to use for node IDs (default: "id")

##### options?

`QueueableOptions`

Queue options for operation ordering

#### Returns

`Promise`\<`void`\>

Promise that resolves when nodes are added

#### Remarks

This method ADDS nodes to the existing graph without removing existing nodes.
For complete replacement, use the `nodeData` property on the web component instead.

Nodes are added to the current layout and will animate into position if
a force-directed layout is active.

#### Since

1.0.0

#### See

 - [addEdges](#addedges) for adding edges
 - [Data Loading Examples](https://graphty-org.github.io/graphty-element/storybook/?path=/story/data--default)

#### Example

```typescript
// Add nodes with default ID field
await graph.addNodes([
  { id: 'node-1', label: 'First Node', category: 'A' },
  { id: 'node-2', label: 'Second Node', category: 'B' }
]);

// Add nodes with custom ID field
await graph.addNodes(
  [{ nodeId: 'n1', name: 'Node One' }],
  'nodeId'
);

// Wait for layout to settle after adding
await graph.addNodes(newNodes);
await graph.waitForSettled();
graph.zoomToFit();
```

***

### aiCommand()

> **aiCommand**(`input`): `Promise`\<`ExecutionResult`\>

Defined in: [src/Graph.ts:3519](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3519)

Send a natural language command to the AI controller.

#### Parameters

##### input

`string`

Natural language command (e.g., "switch to circular layout")

#### Returns

`Promise`\<`ExecutionResult`\>

Promise resolving to command result

#### Example

```typescript
// Query graph info
const result = await graph.aiCommand('How many nodes are there?');
console.log(result.message);

// Change layout
await graph.aiCommand('Use circular layout');

// Switch dimension
await graph.aiCommand('Show in 2D');
```

***

### applySuggestedStyles()

> **applySuggestedStyles**(`algorithmKey`, `options?`): `boolean`

Defined in: [src/Graph.ts:1160](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1160)

Apply suggested styles from an algorithm

#### Parameters

##### algorithmKey

Algorithm key (e.g., "graphty:degree") or array of keys

`string` | `string`[]

##### options?

[`ApplySuggestedStylesOptions`](../../config/interfaces/ApplySuggestedStylesOptions.md)

Options for applying suggested styles

#### Returns

`boolean`

true if any styles were applied, false otherwise

***

### batchOperations()

> **batchOperations**(`fn`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:1381](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1381)

Execute multiple operations as a batch
Operations will be queued and executed in dependency order

#### Parameters

##### fn

() => `void` \| `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### canCaptureScreenshot()

> **canCaptureScreenshot**(`options?`): `Promise`\<`CapabilityCheck`\>

Defined in: [src/Graph.ts:2107](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L2107)

Check if screenshot can be captured with given options.

#### Parameters

##### options?

`ScreenshotOptions`

Screenshot options to validate

#### Returns

`Promise`\<`CapabilityCheck`\>

Promise\<CapabilityCheck\> - Result indicating whether screenshot is supported

#### Example

```typescript
// Check if 4x multiplier is supported
const check = await graph.canCaptureScreenshot({ multiplier: 4 });
if (!check.supported) {
  console.error('Cannot capture:', check.reason);
} else if (check.warnings) {
  console.warn('Warnings:', check.warnings);
}

// Check 8K resolution
const check8k = await graph.canCaptureScreenshot({
  width: 7680,
  height: 4320
});
console.log(`Memory: ${check8k.estimatedMemoryMB.toFixed(0)}MB`);
```

***

### cancelAiCommand()

> **cancelAiCommand**(): `void`

Defined in: [src/Graph.ts:3589](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3589)

Cancel any in-progress AI command.

#### Returns

`void`

#### Example

```typescript
// Start a long-running command
const promise = graph.aiCommand('complex query');

// Cancel it
graph.cancelAiCommand();
```

***

### cancelAnimationCapture()

> **cancelAnimationCapture**(): `boolean`

Defined in: [src/Graph.ts:2300](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L2300)

Cancel ongoing animation capture

#### Returns

`boolean`

true if a capture was cancelled, false if no capture was in progress

#### Example

```typescript
// Start a capture
const capturePromise = graph.captureAnimation({
  duration: 10000,
  fps: 30,
  cameraMode: 'stationary'
});

// Cancel it after 2 seconds
setTimeout(() => {
  const wasCancelled = graph.cancelAnimationCapture();
  console.log('Cancelled:', wasCancelled);
}, 2000);

// The promise will reject with AnimationCancelledError
try {
  await capturePromise;
} catch (error) {
  if (error.name === 'AnimationCancelledError') {
    console.log('Capture was cancelled');
  }
}
```

***

### captureAnimation()

> **captureAnimation**(`options`): `Promise`\<`AnimationResult`\>

Defined in: [src/Graph.ts:2151](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L2151)

Capture an animation as a video (stationary or animated camera)

#### Parameters

##### options

`AnimationOptions`

Animation capture options

#### Returns

`Promise`\<`AnimationResult`\>

Promise resolving to AnimationResult with blob and metadata

#### Example

```typescript
// Basic 5-second video at 30fps
const result = await graph.captureAnimation({
  duration: 5000,
  fps: 30,
  cameraMode: 'stationary'
});

// High-quality 60fps video with download
const result = await graph.captureAnimation({
  duration: 10000,
  fps: 60,
  cameraMode: 'stationary',
  download: true,
  downloadFilename: 'graph-video.webm'
});

// Animated camera path (camera tour)
const result = await graph.captureAnimation({
  duration: 5000,
  fps: 30,
  cameraMode: 'animated',
  cameraPath: [
    { position: { x: 10, y: 10, z: 10 }, target: { x: 0, y: 0, z: 0 } },
    { position: { x: 0, y: 20, z: 0 }, target: { x: 0, y: 0, z: 0 }, duration: 2500 },
    { position: { x: -10, y: 10, z: 10 }, target: { x: 0, y: 0, z: 0 }, duration: 2500 }
  ],
  easing: 'easeInOut',
  download: true
});
```

***

### captureScreenshot()

> **captureScreenshot**(`options?`): `Promise`\<`ScreenshotResult`\>

Defined in: [src/Graph.ts:2073](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L2073)

Capture a screenshot of the current graph visualization.

#### Parameters

##### options?

`ScreenshotOptions`

Screenshot options (format, resolution, destinations, etc.)

#### Returns

`Promise`\<`ScreenshotResult`\>

Promise resolving to ScreenshotResult with blob and metadata

#### Example

```typescript
// Basic PNG screenshot
const result = await graph.captureScreenshot();

// High-res JPEG with download
const result = await graph.captureScreenshot({
  format: 'jpeg',
  multiplier: 2,
  destination: { download: true }
});

// Copy to clipboard
const result = await graph.captureScreenshot({
  destination: { clipboard: true }
});
```

***

### createApiKeyManager()

> `static` **createApiKeyManager**(): `ApiKeyManager`

Defined in: [src/Graph.ts:3683](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3683)

Create a standalone ApiKeyManager for key management without enabling AI.
Useful for settings UIs that configure keys before AI activation.

#### Returns

`ApiKeyManager`

A new ApiKeyManager instance

#### Example

```typescript
// In a settings UI component
const keyManager = Graph.createApiKeyManager();
keyManager.enablePersistence({
  encryptionKey: userSecret,
  storage: 'localStorage',
});
keyManager.setKey('openai', apiKey);
```

***

### deselectNode()

> **deselectNode**(): `void`

Defined in: [src/Graph.ts:1578](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1578)

Deselect the currently selected node.

#### Returns

`void`

#### Remarks

Clears the current selection and triggers a `selection-changed` event.
If no node is selected, this is a no-op.

#### Since

1.0.0

#### See

 - [selectNode](#selectnode) to select a node
 - [getSelectedNode](#getselectednode) to check current selection

#### Example

```typescript
// Clear selection programmatically
graph.selectNode("node-123");
graph.deselectNode();
console.log(graph.getSelectedNode()); // null

// Clear selection on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    graph.deselectNode();
  }
});
```

***

### disableAiControl()

> **disableAiControl**(): `void`

Defined in: [src/Graph.ts:3492](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3492)

Disable AI control and clean up resources.

#### Returns

`void`

#### Example

```typescript
graph.disableAiControl();
// AI commands will no longer work
```

***

### dispose()

> **dispose**(): `void`

Defined in: [src/Graph.ts:3919](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3919)

#### Returns

`void`

***

### enableAiControl()

> **enableAiControl**(`config`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3474](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3474)

Enable AI-powered natural language control of the graph.

#### Parameters

##### config

`AiManagerConfig`

AI configuration including provider and optional API key

#### Returns

`Promise`\<`void`\>

Promise resolving when AI is ready

#### Example

```typescript
// Enable with mock provider (for testing)
await graph.enableAiControl({ provider: 'mock' });

// Enable with OpenAI
await graph.enableAiControl({
  provider: 'openai',
  apiKey: 'sk-...'
});

// Now you can send commands
const result = await graph.aiCommand('Show me the graph summary');
```

***

### enterXR()

> **enterXR**(`mode`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3851](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3851)

Enter XR mode (VR or AR)

#### Parameters

##### mode

The XR mode to enter ('immersive-vr' or 'immersive-ar')

`"immersive-vr"` | `"immersive-ar"`

#### Returns

`Promise`\<`void`\>

***

### estimateAnimationCapture()

> **estimateAnimationCapture**(`options`): `Promise`\<`CaptureEstimate`\>

Defined in: [src/Graph.ts:2342](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L2342)

Estimate performance and potential issues for animation capture

#### Parameters

##### options

`Pick`\<`AnimationOptions`, `"duration"` \| `"fps"` \| `"width"` \| `"height"`\>

Animation options to estimate

#### Returns

`Promise`\<`CaptureEstimate`\>

Promise resolving to CaptureEstimate

#### Example

```typescript
const estimate = await graph.estimateAnimationCapture({
  duration: 5000,
  fps: 60,
  width: 3840,
  height: 2160
});

if (estimate.likelyToDropFrames) {
  console.warn(`May drop frames. Recommended: ${estimate.recommendedFps}fps`);
}
```

***

### exitXR()

> **exitXR**(): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3894](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3894)

Exit XR mode and return to previous camera

#### Returns

`Promise`\<`void`\>

***

### exportCameraPresets()

> **exportCameraPresets**(): `Record`\<`string`, `CameraState`\>

Defined in: [src/Graph.ts:3382](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3382)

Export user-defined presets as JSON

#### Returns

`Record`\<`string`, `CameraState`\>

***

### getAiManager()

> **getAiManager**(): `AiManager` \| `null`

Defined in: [src/Graph.ts:3608](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3608)

Get the AI manager for advanced configuration.
Returns null if AI is not enabled.

#### Returns

`AiManager` \| `null`

The AI manager or null

#### Example

```typescript
const manager = graph.getAiManager();
if (manager) {
  // Register custom command
  manager.registerCommand(myCustomCommand);
}
```

***

### getAiStatus()

> **getAiStatus**(): `AiStatus` \| `null`

Defined in: [src/Graph.ts:3545](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3545)

Get the current AI status synchronously.

#### Returns

`AiStatus` \| `null`

Current AI status or null if AI is not enabled

#### Example

```typescript
const status = graph.getAiStatus();
if (status?.state === 'executing') {
  console.log('AI is processing a command...');
}
```

***

### getApiKeyManager()

> **getApiKeyManager**(): `ApiKeyManager` \| `null`

Defined in: [src/Graph.ts:3662](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3662)

Get the API key manager for configuring keys before enabling AI.
Returns null if AI has never been enabled.

#### Returns

`ApiKeyManager` \| `null`

The API key manager or null

#### Example

```typescript
const keyManager = graph.getApiKeyManager();
if (keyManager) {
  const providers = keyManager.getConfiguredProviders();
  console.log('Configured providers:', providers);
}
```

***

### getCameraController()

> **getCameraController**(): `CameraController` \| `null`

Defined in: [src/Graph.ts:1998](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1998)

#### Returns

`CameraController` \| `null`

***

### getCameraPresets()

> **getCameraPresets**(): `Record`\<`string`, `CameraState` \| \{ `builtin`: `true`; \}\>

Defined in: [src/Graph.ts:3363](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3363)

Get all camera presets (built-in + user-defined)

#### Returns

`Record`\<`string`, `CameraState` \| \{ `builtin`: `true`; \}\>

***

### getCameraState()

> **getCameraState**(): `CameraState`

Defined in: [src/Graph.ts:2350](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L2350)

Get the current camera state

#### Returns

`CameraState`

***

### getConfig()

> **getConfig**(): [`GraphContextConfig`](../../managers/interfaces/GraphContextConfig.md)

Defined in: [src/Graph.ts:1852](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1852)

Get graph-level configuration options

#### Returns

[`GraphContextConfig`](../../managers/interfaces/GraphContextConfig.md)

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getConfig`](../../managers/interfaces/GraphContext.md#getconfig)

***

### getDataManager()

> **getDataManager**(): [`DataManager`](../../managers/classes/DataManager.md)

Defined in: [src/Graph.ts:1467](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1467)

Get the DataManager for node/edge operations

#### Returns

[`DataManager`](../../managers/classes/DataManager.md)

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getDataManager`](../../managers/interfaces/GraphContext.md#getdatamanager)

***

### getEdgeCount()

> **getEdgeCount**(): `number`

Defined in: [src/Graph.ts:1399](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1399)

#### Returns

`number`

***

### getEventManager()

> **getEventManager**(): [`EventManager`](../../managers/classes/EventManager.md)

Defined in: [src/Graph.ts:1495](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1495)

Get EventManager for emitting events
Optional method for event emission

#### Returns

[`EventManager`](../../managers/classes/EventManager.md)

#### Since

1.5.0

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getEventManager`](../../managers/interfaces/GraphContext.md#geteventmanager)

***

### getLayoutManager()

> **getLayoutManager**(): [`LayoutManager`](../../managers/classes/LayoutManager.md)

Defined in: [src/Graph.ts:1471](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1471)

Get the LayoutManager for layout operations

#### Returns

[`LayoutManager`](../../managers/classes/LayoutManager.md)

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getLayoutManager`](../../managers/interfaces/GraphContext.md#getlayoutmanager)

***

### getMeshCache()

> **getMeshCache**(): `MeshCache`

Defined in: [src/Graph.ts:1479](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1479)

Get the MeshCache for mesh creation and caching

#### Returns

`MeshCache`

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getMeshCache`](../../managers/interfaces/GraphContext.md#getmeshcache)

***

### getNode()

> **getNode**(`nodeId`): [`Node`](../../Node/classes/Node.md) \| `undefined`

Defined in: [src/Graph.ts:3428](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3428)

Get a specific node

#### Parameters

##### nodeId

`string` | `number`

#### Returns

[`Node`](../../Node/classes/Node.md) \| `undefined`

***

### getNodeCount()

> **getNodeCount**(): `number`

Defined in: [src/Graph.ts:1395](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1395)

#### Returns

`number`

***

### getNodeMesh()

> **getNodeMesh**(`nodeId`): `AbstractMesh` \| `null`

Defined in: [src/Graph.ts:2002](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L2002)

#### Parameters

##### nodeId

`string`

#### Returns

`AbstractMesh` \| `null`

***

### getNodes()

> **getNodes**(): [`Node`](../../Node/classes/Node.md)[]

Defined in: [src/Graph.ts:3435](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3435)

Get all nodes

#### Returns

[`Node`](../../Node/classes/Node.md)[]

***

### getScene()

> **getScene**(): `Scene`

Defined in: [src/Graph.ts:1483](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1483)

Get the Babylon.js Scene

#### Returns

`Scene`

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getScene`](../../managers/interfaces/GraphContext.md#getscene)

***

### getSelectedNode()

> **getSelectedNode**(): [`Node`](../../Node/classes/Node.md) \| `null`

Defined in: [src/Graph.ts:1507](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1507)

Get the currently selected node.

#### Returns

[`Node`](../../Node/classes/Node.md) \| `null`

The selected node, or null if nothing is selected.

***

### getSelectionManager()

> **getSelectionManager**(): [`SelectionManager`](../../managers/classes/SelectionManager.md)

Defined in: [src/Graph.ts:1491](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1491)

Get SelectionManager for node selection operations
Optional method for selection functionality

#### Returns

[`SelectionManager`](../../managers/classes/SelectionManager.md)

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getSelectionManager`](../../managers/interfaces/GraphContext.md#getselectionmanager)

***

### getStatsManager()

> **getStatsManager**(): [`StatsManager`](../../managers/classes/StatsManager.md)

Defined in: [src/Graph.ts:1487](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1487)

Get the StatsManager for performance monitoring

#### Returns

[`StatsManager`](../../managers/classes/StatsManager.md)

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getStatsManager`](../../managers/interfaces/GraphContext.md#getstatsmanager)

***

### getStyleManager()

> **getStyleManager**(): [`StyleManager`](../../managers/classes/StyleManager.md)

Defined in: [src/Graph.ts:1463](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1463)

Get the StyleManager for style operations

#### Returns

[`StyleManager`](../../managers/classes/StyleManager.md)

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getStyleManager`](../../managers/interfaces/GraphContext.md#getstylemanager)

***

### getStyles()

> **getStyles**(): [`Styles`](../../Styles/classes/Styles.md)

Defined in: [src/Graph.ts:1459](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1459)

#### Returns

[`Styles`](../../Styles/classes/Styles.md)

***

### getSuggestedStyles()

> **getSuggestedStyles**(`algorithmKey`): [`SuggestedStylesConfig`](../../config/interfaces/SuggestedStylesConfig.md) \| `null`

Defined in: [src/Graph.ts:1190](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1190)

Get suggested styles without applying them

#### Parameters

##### algorithmKey

`string`

Algorithm key (e.g., "graphty:degree")

#### Returns

[`SuggestedStylesConfig`](../../config/interfaces/SuggestedStylesConfig.md) \| `null`

Suggested styles config or null if none exist

***

### getUpdateManager()

> **getUpdateManager**(): [`UpdateManager`](../../managers/classes/UpdateManager.md)

Defined in: [src/Graph.ts:1475](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1475)

#### Returns

[`UpdateManager`](../../managers/classes/UpdateManager.md)

***

### getViewMode()

> **getViewMode**(): `"2d"` \| `"3d"` \| `"ar"` \| `"vr"`

Defined in: [src/Graph.ts:1646](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1646)

Get the current view mode.
Returns the viewMode from config (always set due to default value).

#### Returns

`"2d"` \| `"3d"` \| `"ar"` \| `"vr"`

***

### getVoiceAdapter()

> **getVoiceAdapter**(): `VoiceInputAdapter`

Defined in: [src/Graph.ts:3708](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3708)

Get the voice input adapter.
Creates the adapter on first use.

#### Returns

`VoiceInputAdapter`

The voice input adapter

#### Example

```typescript
const adapter = graph.getVoiceAdapter();
if (adapter.isSupported) {
  adapter.start({ continuous: true });
}
```

***

### getXRConfig()

> **getXRConfig**(): [`XRConfig`](../../config/interfaces/XRConfig.md) \| `undefined`

Defined in: [src/Graph.ts:1868](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1868)

Get XR configuration
Optional method for XR-specific functionality

#### Returns

[`XRConfig`](../../config/interfaces/XRConfig.md) \| `undefined`

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getXRConfig`](../../managers/interfaces/GraphContext.md#getxrconfig)

***

### getXRSessionManager()

> **getXRSessionManager**(): `XRSessionManager` \| `undefined`

Defined in: [src/Graph.ts:1883](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1883)

Get XR session manager
Optional method for XR-specific functionality

#### Returns

`XRSessionManager` \| `undefined`

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getXRSessionManager`](../../managers/interfaces/GraphContext.md#getxrsessionmanager)

***

### importCameraPresets()

> **importCameraPresets**(`presets`): `void`

Defined in: [src/Graph.ts:3393](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3393)

Import user-defined presets from JSON

#### Parameters

##### presets

`Record`\<`string`, `CameraState`\>

#### Returns

`void`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/Graph.ts:417](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L417)

#### Returns

`Promise`\<`void`\>

***

### is2D()

> **is2D**(): `boolean`

Defined in: [src/Graph.ts:1637](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1637)

Check if the graph is in 2D mode

#### Returns

`boolean`

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`is2D`](../../managers/interfaces/GraphContext.md#is2d)

***

### isAiEnabled()

> **isAiEnabled**(): `boolean`

Defined in: [src/Graph.ts:3617](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3617)

Check if AI control is currently enabled.

#### Returns

`boolean`

True if AI is enabled

***

### isAnimationCapturing()

> **isAnimationCapturing**(): `boolean`

Defined in: [src/Graph.ts:2318](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L2318)

Check if an animation capture is currently in progress

#### Returns

`boolean`

***

### isARSupported()

> **isARSupported**(): `Promise`\<`boolean`\>

Defined in: [src/Graph.ts:1923](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1923)

Check if AR mode is supported on this device/browser.
Returns true if WebXR is available and AR sessions are supported.

#### Returns

`Promise`\<`boolean`\>

Promise resolving to true if AR is supported

#### Example

```typescript
const arSupported = await graph.isARSupported();
if (!arSupported) {
  console.log("AR not available on this device");
}
```

***

### isNodeSelected()

> **isNodeSelected**(`nodeId`): `boolean`

Defined in: [src/Graph.ts:1588](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1588)

Check if a specific node is currently selected.

#### Parameters

##### nodeId

The ID of the node to check.

`string` | `number`

#### Returns

`boolean`

True if the node is selected, false otherwise.

***

### isRunning()

> **isRunning**(): `boolean`

Defined in: [src/Graph.ts:1860](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1860)

Check if the layout is running

#### Returns

`boolean`

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`isRunning`](../../managers/interfaces/GraphContext.md#isrunning)

***

### isVoiceActive()

> **isVoiceActive**(): `boolean`

Defined in: [src/Graph.ts:3787](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3787)

Check if voice input is currently active.

#### Returns

`boolean`

True if voice input is active

***

### isVRSupported()

> **isVRSupported**(): `Promise`\<`boolean`\>

Defined in: [src/Graph.ts:1901](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1901)

Check if VR mode is supported on this device/browser.
Returns true if WebXR is available and VR sessions are supported.

#### Returns

`Promise`\<`boolean`\>

Promise resolving to true if VR is supported

#### Example

```typescript
const vrSupported = await graph.isVRSupported();
if (!vrSupported) {
  console.log("VR not available on this device");
}
```

***

### listenerCount()

> **listenerCount**(): `number`

Defined in: [src/Graph.ts:1421](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1421)

Get the total number of registered event listeners.
Useful for debugging and testing to ensure listeners are properly cleaned up.

#### Returns

`number`

The number of registered listeners

***

### loadCameraPreset()

> **loadCameraPreset**(`name`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3356](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3356)

Load a camera preset (built-in or user-defined)

#### Parameters

##### name

`string`

##### options?

`CameraAnimationOptions`

#### Returns

`Promise`\<`void`\>

***

### loadFromFile()

> **loadFromFile**(`file`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:743](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L743)

Load graph data from a File object with auto-format detection

#### Parameters

##### file

`File`

File object from file input

##### options?

Loading options

###### edgeDstIdPath?

`string`

###### edgeSrcIdPath?

`string`

###### format?

`string`

###### nodeIdPath?

`string`

#### Returns

`Promise`\<`void`\>

***

### loadFromUrl()

> **loadFromUrl**(`url`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:809](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L809)

Load graph data from a URL with auto-format detection

#### Parameters

##### url

`string`

URL to fetch graph data from

##### options?

Loading options

###### edgeDstIdPath?

`string`

###### edgeSrcIdPath?

`string`

###### format?

`string`

###### nodeIdPath?

`string`

#### Returns

`Promise`\<`void`\>

#### Remarks

This method attempts to detect the format from the URL extension first.
If the extension is not recognized (e.g., `.txt`), it fetches the content
and uses content-based detection. The content is then passed directly to
the data source to avoid a double-fetch.

#### Example

```typescript
// Auto-detect format from extension
await graph.loadFromUrl("https://example.com/data.graphml");

// Auto-detect from content when extension doesn't match
await graph.loadFromUrl("https://example.com/data.txt");

// Explicitly specify format
await graph.loadFromUrl("https://example.com/data.txt", { format: "graphml" });
```

***

### needsRayUpdate()

> **needsRayUpdate**(): `boolean`

Defined in: [src/Graph.ts:1848](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1848)

Check if ray updates are needed (for edge arrows)

#### Returns

`boolean`

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`needsRayUpdate`](../../managers/interfaces/GraphContext.md#needsrayupdate)

***

### on()

> **on**(`type`, `cb`): `void`

Defined in: [src/Graph.ts:1406](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1406)

Alias for addEventListener

#### Parameters

##### type

[`EventType`](../../events/type-aliases/EventType.md)

##### cb

[`EventCallbackType`](../../events/type-aliases/EventCallbackType.md)

#### Returns

`void`

***

### onAiStatusChange()

> **onAiStatusChange**(`callback`): () => `void`

Defined in: [src/Graph.ts:3568](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3568)

Subscribe to AI status changes.

#### Parameters

##### callback

`StatusChangeCallback`

Function called when status changes

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

#### Example

```typescript
const unsubscribe = graph.onAiStatusChange((status) => {
  console.log('AI state:', status.state);
  if (status.streamedText) {
    console.log('Response:', status.streamedText);
  }
});

// Later: stop listening
unsubscribe();
```

***

### removeNodes()

> **removeNodes**(`nodeIds`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:1258](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1258)

#### Parameters

##### nodeIds

(`string` \| `number`)[]

##### options?

`QueueableOptions`

#### Returns

`Promise`\<`void`\>

***

### render()

> **render**(): `void`

Defined in: [src/Graph.ts:3442](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3442)

Render method (public for testing)

#### Returns

`void`

***

### resetCamera()

> **resetCamera**(`options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3256](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3256)

Reset camera to default state

#### Parameters

##### options?

`CameraAnimationOptions`

#### Returns

`Promise`\<`void`\>

***

### resolveCameraPreset()

> **resolveCameraPreset**(`preset`): `CameraState`

Defined in: [src/Graph.ts:3277](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3277)

Resolve a camera preset (built-in or user-defined) to a CameraState

#### Parameters

##### preset

`string`

#### Returns

`CameraState`

***

### retryLastAiCommand()

> **retryLastAiCommand**(): `Promise`\<`ExecutionResult`\>

Defined in: [src/Graph.ts:3639](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3639)

Retry the last AI command.
Useful for retrying after transient errors.

#### Returns

`Promise`\<`ExecutionResult`\>

Promise resolving to command result

#### Throws

Error if AI not enabled or no previous command

#### Example

```typescript
// After a failed command
try {
  const result = await graph.retryLastAiCommand();
  console.log('Retry succeeded:', result);
} catch (error) {
  console.error('Retry failed:', error);
}
```

***

### runAlgorithm()

> **runAlgorithm**(`namespace`, `type`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:1124](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1124)

Run a graph algorithm and store results on nodes/edges.

#### Parameters

##### namespace

`string`

Algorithm namespace (e.g., "graphty")

##### type

`string`

Algorithm type (e.g., "degree", "pagerank")

##### options?

`RunAlgorithmOptions`

Algorithm options and queue settings

#### Returns

`Promise`\<`void`\>

Promise that resolves when algorithm completes

#### Remarks

Algorithms are identified by namespace and type (e.g., `graphty:degree`).
Results are stored on each node's `algorithmResults` property and can be
accessed in style selectors.

Available algorithms by category:
- **Centrality**: degree, betweenness, closeness, pagerank, eigenvector
- **Community**: louvain, label-propagation, leiden
- **Components**: connected-components, strongly-connected
- **Traversal**: bfs, dfs
- **Shortest Path**: dijkstra, bellman-ford
- **Spanning Tree**: prim, kruskal
- **Flow**: max-flow, min-cut

#### Since

1.0.0

#### See

 - [applySuggestedStyles](#applysuggestedstyles) to visualize results
 - [Centrality Examples](https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-centrality--degree)
 - [Community Detection](https://graphty-org.github.io/graphty-element/storybook/?path=/story/algorithms-community--louvain)

#### Example

```typescript
// Run degree centrality
await graph.runAlgorithm('graphty', 'degree');

// Access results
const node = graph.getNode('node-1');
console.log('Degree:', node.algorithmResults['graphty:degree']);

// Run with auto-styling
await graph.runAlgorithm('graphty', 'pagerank', {
  algorithmOptions: { damping: 0.85 },
  applySuggestedStyles: true
});

// Use results in style selectors
styleManager.addLayer({
  selector: "[?algorithmResults.'graphty:degree' > `10`]",
  styles: { node: { color: '#ff0000', size: 2.0 } }
});
```

***

### runAlgorithmsFromTemplate()

> **runAlgorithmsFromTemplate**(): `Promise`\<`void`\>

Defined in: [src/Graph.ts:406](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L406)

#### Returns

`Promise`\<`void`\>

***

### saveCameraPreset()

> **saveCameraPreset**(`name`): `void`

Defined in: [src/Graph.ts:3341](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3341)

Save current camera state as a named preset

#### Parameters

##### name

`string`

#### Returns

`void`

***

### screenToWorld()

> **screenToWorld**(`screenPos`): \{ `x`: `number`; `y`: `number`; `z`: `number`; \} \| `null`

Defined in: [src/Graph.ts:1984](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1984)

#### Parameters

##### screenPos

###### x

`number`

###### y

`number`

#### Returns

\{ `x`: `number`; `y`: `number`; `z`: `number`; \} \| `null`

***

### selectNode()

> **selectNode**(`nodeId`): `boolean`

Defined in: [src/Graph.ts:1547](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1547)

Select a node by its ID.

#### Parameters

##### nodeId

The ID of the node to select

`string` | `number`

#### Returns

`boolean`

True if the node was found and selected, false if not found

#### Remarks

Selection triggers a `selection-changed` event and applies selection styles
(defined in the style template). Only one node can be selected at a time;
calling this method will deselect any previously selected node.

Selection is often used to:
- Show a details panel with node information
- Highlight the node and its connections
- Enable context-specific actions

#### Since

1.0.0

#### See

 - [deselectNode](#deselectnode) to clear selection
 - [getSelectedNode](#getselectednode) to get current selection
 - [Selection Examples](https://graphty-org.github.io/graphty-element/storybook/?path=/story/selection--default)

#### Example

```typescript
// Select a node and show its details
if (graph.selectNode('node-123')) {
  const node = graph.getSelectedNode();
  console.log('Selected:', node.data);
  showDetailsPanel(node);
}

// Handle click events for selection
graph.on('node-click', ({ node }) => {
  graph.selectNode(node.id);
});
```

***

### setCameraMode()

> **setCameraMode**(`mode`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:1332](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1332)

#### Parameters

##### mode

`CameraKey`

##### options?

`QueueableOptions`

#### Returns

`Promise`\<`void`\>

***

### setCameraPan()

> **setCameraPan**(`pan`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3246](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3246)

Set camera pan (2D)

#### Parameters

##### pan

###### x

`number`

###### y

`number`

##### options?

`CameraAnimationOptions`

#### Returns

`Promise`\<`void`\>

***

### setCameraPosition()

> **setCameraPosition**(`position`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3210](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3210)

Set camera position (3D)

#### Parameters

##### position

###### x

`number`

###### y

`number`

###### z

`number`

##### options?

`CameraAnimationOptions`

#### Returns

`Promise`\<`void`\>

***

### setCameraState()

> **setCameraState**(`state`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:2463](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L2463)

Set the camera state (Phase 4: with animation support)

#### Parameters

##### state

`CameraState` | \{ `preset`: `string`; \}

##### options?

`CameraAnimationOptions`

#### Returns

`Promise`\<`void`\>

***

### setCameraTarget()

> **setCameraTarget**(`target`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3223](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3223)

Set camera target (3D)

#### Parameters

##### target

###### x

`number`

###### y

`number`

###### z

`number`

##### options?

`CameraAnimationOptions`

#### Returns

`Promise`\<`void`\>

***

### setCameraZoom()

> **setCameraZoom**(`zoom`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3236](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3236)

Set camera zoom (2D)

#### Parameters

##### zoom

`number`

##### options?

`CameraAnimationOptions`

#### Returns

`Promise`\<`void`\>

***

### setData()

> **setData**(`data`): `void`

Defined in: [src/Graph.ts:3407](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3407)

Set graph data (delegates to data manager)

#### Parameters

##### data

###### edges

`Record`\<`string`, `unknown`\>[]

###### nodes

`Record`\<`string`, `unknown`\>[]

#### Returns

`void`

***

### setInputEnabled()

> **setInputEnabled**(`enabled`): `void`

Defined in: [src/Graph.ts:1942](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1942)

Enable or disable input

#### Parameters

##### enabled

`boolean`

#### Returns

`void`

***

### setLayout()

> **setLayout**(`type`, `opts`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:1053](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1053)

Set the layout algorithm and configuration.

#### Parameters

##### type

`string`

Layout algorithm name

##### opts

`object` = `{}`

Layout-specific configuration options

##### options?

`QueueableOptions`

Options for operation queue behavior

#### Returns

`Promise`\<`void`\>

Promise that resolves when layout is initialized

#### Remarks

Available layouts:
- `ngraph`: Force-directed (3D optimized, recommended for general use)
- `d3-force`: Force-directed (2D, web standard)
- `circular`: Nodes arranged in a circle
- `grid`: Nodes arranged in a grid
- `hierarchical`: Tree/DAG layout
- `random`: Random positions (useful for testing)
- `fixed`: Use pre-defined positions from node data

Layout changes are queued and execute in order. The layout will
animate nodes from their current positions to new positions.

#### Since

1.0.0

#### See

 - [waitForSettled](#waitforsettled) to wait for layout completion
 - [3D Layout Examples](https://graphty-org.github.io/graphty-element/storybook/?path=/story/layout--default)
 - [2D Layout Examples](https://graphty-org.github.io/graphty-element/storybook/?path=/story/layout2d--default)

#### Example

```typescript
// Use force-directed layout with custom settings
await graph.setLayout('ngraph', {
  springLength: 100,
  springCoefficient: 0.0008,
  gravity: -1.2,
  dimensions: 3
});

// Wait for layout to settle then zoom to fit
await graph.waitForSettled();
graph.zoomToFit();

// Switch to circular layout
await graph.setLayout('circular', { radius: 5 });
```

***

### setRenderSettings()

> **setRenderSettings**(`settings`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:1354](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1354)

#### Parameters

##### settings

`Record`\<`string`, `unknown`\>

##### options?

`QueueableOptions`

#### Returns

`Promise`\<`void`\>

***

### setRunning()

> **setRunning**(`running`): `void`

Defined in: [src/Graph.ts:1864](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1864)

Set the running state

#### Parameters

##### running

`boolean`

#### Returns

`void`

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`setRunning`](../../managers/interfaces/GraphContext.md#setrunning)

***

### setStyleTemplate()

> **setStyleTemplate**(`t`, `options?`): `Promise`\<[`Styles`](../../Styles/classes/Styles.md)\>

Defined in: [src/Graph.ts:543](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L543)

#### Parameters

##### t

###### behavior

\{ `fetchEdges?`: `Function`; `fetchNodes?`: `Function`; `layout`: \{ `minDelta`: `number`; `preSteps`: `number`; `stepMultiplier`: `number`; `type`: `string`; `zoomStepInterval`: `number`; \}; `node`: \{ `pinOnDrag`: `boolean`; \}; \} = `...`

###### behavior.fetchEdges?

`Function` = `...`

###### behavior.fetchNodes?

`Function` = `...`

###### behavior.layout

\{ `minDelta`: `number`; `preSteps`: `number`; `stepMultiplier`: `number`; `type`: `string`; `zoomStepInterval`: `number`; \} = `...`

###### behavior.layout.minDelta

`number` = `...`

###### behavior.layout.preSteps

`number` = `...`

###### behavior.layout.stepMultiplier

`number` = `...`

###### behavior.layout.type

`string` = `...`

###### behavior.layout.zoomStepInterval

`number` = `...`

###### behavior.node

\{ `pinOnDrag`: `boolean`; \} = `NodeBehaviorOpts`

###### behavior.node.pinOnDrag

`boolean` = `...`

###### data

\{ `algorithms?`: `string`[]; `knownFields`: \{ `edgeDstIdPath`: `string`; `edgeSrcIdPath`: `string`; `edgeTimePath`: `string` \| `null`; `edgeWeightPath`: `string` \| `null`; `nodeIdPath`: `string`; `nodeTimePath`: `string` \| `null`; `nodeWeightPath`: `string` \| `null`; \}; \} = `...`

###### data.algorithms?

`string`[] = `...`

###### data.knownFields

\{ `edgeDstIdPath`: `string`; `edgeSrcIdPath`: `string`; `edgeTimePath`: `string` \| `null`; `edgeWeightPath`: `string` \| `null`; `nodeIdPath`: `string`; `nodeTimePath`: `string` \| `null`; `nodeWeightPath`: `string` \| `null`; \} = `...`

###### data.knownFields.edgeDstIdPath

`string` = `...`

###### data.knownFields.edgeSrcIdPath

`string` = `...`

###### data.knownFields.edgeTimePath

`string` \| `null` = `...`

###### data.knownFields.edgeWeightPath

`string` \| `null` = `...`

###### data.knownFields.nodeIdPath

`string` = `...`

###### data.knownFields.nodeTimePath

`string` \| `null` = `...`

###### data.knownFields.nodeWeightPath

`string` \| `null` = `...`

###### graph

\{ `addDefaultStyle`: `boolean`; `background`: \{ `backgroundType`: `"color"`; `color`: `string` \| `undefined`; \} \| \{ `backgroundType`: `"skybox"`; `data`: `string`; \}; `effects?`: \{ `depthOfField?`: `number`; `motionBlur?`: `number`; `screenSpaceReflections?`: `boolean`; \}; `layout?`: `string`; `layoutOptions?`: \{\[`key`: `string`\]: `unknown`; \}; `startingCameraDistance`: `number`; `twoD`: `boolean`; `viewMode`: `"2d"` \| `"3d"` \| `"ar"` \| `"vr"`; \} = `...`

###### graph.addDefaultStyle

`boolean` = `...`

###### graph.background

\{ `backgroundType`: `"color"`; `color`: `string` \| `undefined`; \} \| \{ `backgroundType`: `"skybox"`; `data`: `string`; \} = `...`

###### graph.effects?

\{ `depthOfField?`: `number`; `motionBlur?`: `number`; `screenSpaceReflections?`: `boolean`; \} = `...`

###### graph.effects.depthOfField?

`number` = `...`

###### graph.effects.motionBlur?

`number` = `...`

###### graph.effects.screenSpaceReflections?

`boolean` = `...`

###### graph.layout?

`string` = `...`

###### graph.layoutOptions?

\{\[`key`: `string`\]: `unknown`; \} = `...`

###### graph.startingCameraDistance

`number` = `...`

###### graph.twoD

`boolean` = `...`

**Deprecated**

Use viewMode instead. twoD: true is equivalent to viewMode: "2d"

###### graph.viewMode

`"2d"` \| `"3d"` \| `"ar"` \| `"vr"` = `...`

View mode controls how the graph is rendered and displayed.
- "2d": Orthographic camera, fixed top-down view
- "3d": Perspective camera with orbit controls (default)
- "ar": Augmented reality mode using WebXR
- "vr": Virtual reality mode using WebXR

###### graphtyTemplate

`true` = `...`

###### layers

`object`[] = `...`

###### majorVersion

`"1"` = `...`

###### metadata?

\{ `templateCreationTimestamp?`: `string`; `templateCreator?`: `string`; `templateModificationTimestamp?`: `string`; `templateName?`: `string`; \} = `...`

###### metadata.templateCreationTimestamp?

`string` = `...`

###### metadata.templateCreator?

`string` = `...`

###### metadata.templateModificationTimestamp?

`string` = `...`

###### metadata.templateName?

`string` = `...`

##### options?

`QueueableOptions`

#### Returns

`Promise`\<[`Styles`](../../Styles/classes/Styles.md)\>

***

### setViewMode()

> **setViewMode**(`mode`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:1666](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1666)

Set the view mode.
This controls the camera type, input handling, and rendering approach.

#### Parameters

##### mode

The view mode to set: "2d", "3d", "ar", or "vr"

`"2d"` | `"3d"` | `"ar"` | `"vr"`

##### options?

`QueueableOptions`

Optional queueing options

#### Returns

`Promise`\<`void`\>

#### Example

```typescript
// Switch to 2D orthographic view
await graph.setViewMode("2d");

// Switch to VR mode
await graph.setViewMode("vr");
```

***

### setXRConfig()

> **setXRConfig**(`config`): `void`

Defined in: [src/Graph.ts:1877](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1877)

Set XR configuration.
Merges with defaults and updates the graph context.

#### Parameters

##### config

Partial XR configuration to apply

\{ `ar?`: \{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \}; `enabled?`: `boolean`; `input?`: \{ `controllers?`: `boolean`; `enableZAmplificationInDesktop?`: `boolean`; `handTracking?`: `boolean`; `nearInteraction?`: `boolean`; `physics?`: `boolean`; `zAxisAmplification?`: `number`; \}; `teleportation?`: \{ `easeTime?`: `number`; `enabled?`: `boolean`; \}; `ui?`: \{ `enabled?`: `boolean`; `position?`: `"top-right"` \| `"top-left"` \| `"bottom-left"` \| `"bottom-right"`; `showAvailabilityWarning?`: `boolean`; `unavailableMessageDuration?`: `number`; \}; `vr?`: \{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \}; \}

Partial XR configuration to apply

###### ar?

\{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \} = `...`

AR mode configuration

###### ar.enabled?

`boolean` = `...`

Enable AR mode

**Default**

```ts
true
```

###### ar.optionalFeatures?

`string`[] = `...`

Optional WebXR features to request

**Default**

```ts
["hit-test"]
```

###### ar.referenceSpaceType?

`"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"` = `...`

WebXR reference space type for AR

**Default**

```ts
"local-floor"
```

###### enabled?

`boolean` = `...`

Enable/disable XR functionality globally

**Default**

```ts
true
```

###### input?

\{ `controllers?`: `boolean`; `enableZAmplificationInDesktop?`: `boolean`; `handTracking?`: `boolean`; `nearInteraction?`: `boolean`; `physics?`: `boolean`; `zAxisAmplification?`: `number`; \} = `...`

XR input and interaction configuration

###### input.controllers?

`boolean` = `...`

Enable motion controllers

**Default**

```ts
true
```

###### input.enableZAmplificationInDesktop?

`boolean` = `...`

Enable Z-axis amplification in desktop mode
Normally amplification only applies in XR mode, but this can enable it for desktop too

**Default**

```ts
false
```

###### input.handTracking?

`boolean` = `...`

Enable hand tracking

**Default**

```ts
true
```

###### input.nearInteraction?

`boolean` = `...`

Enable near interaction (touch/grab)

**Default**

```ts
true
```

###### input.physics?

`boolean` = `...`

Enable physics-based interactions

**Default**

```ts
false
```

###### input.zAxisAmplification?

`number` = `...`

Z-axis movement amplification factor
Multiplies Z-axis delta during drag to make depth manipulation practical in VR

Example: With zAxisAmplification = 10, moving controller 0.1 units in Z
will move the node 1.0 units in Z

**Default**

```ts
10.0
```

###### teleportation?

\{ `easeTime?`: `number`; `enabled?`: `boolean`; \} = `...`

Teleportation configuration

###### teleportation.easeTime?

`number` = `...`

Teleportation animation duration (ms)

**Default**

```ts
200
```

###### teleportation.enabled?

`boolean` = `...`

Enable teleportation system

**Default**

```ts
false
```

###### ui?

\{ `enabled?`: `boolean`; `position?`: `"top-right"` \| `"top-left"` \| `"bottom-left"` \| `"bottom-right"`; `showAvailabilityWarning?`: `boolean`; `unavailableMessageDuration?`: `number`; \} = `...`

XR UI button configuration

###### ui.enabled?

`boolean` = `...`

Show VR/AR entry buttons

**Default**

```ts
true
```

###### ui.position?

`"top-right"` \| `"top-left"` \| `"bottom-left"` \| `"bottom-right"` = `...`

Button position on screen

**Default**

```ts
"bottom-right"
```

###### ui.showAvailabilityWarning?

`boolean` = `...`

Show "VR / AR NOT AVAILABLE" warning when XR is not available
When false, no message is displayed if AR/VR aren't available

**Default**

```ts
false
```

###### ui.unavailableMessageDuration?

`number` = `...`

Duration to show "not available" message (ms)

**Default**

```ts
5000
```

###### vr?

\{ `enabled?`: `boolean`; `optionalFeatures?`: `string`[]; `referenceSpaceType?`: `"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"`; \} = `...`

VR mode configuration

###### vr.enabled?

`boolean` = `...`

Enable VR mode

**Default**

```ts
true
```

###### vr.optionalFeatures?

`string`[] = `...`

Optional WebXR features to request

**Default**

```ts
[]
```

###### vr.referenceSpaceType?

`"local"` \| `"local-floor"` \| `"bounded-floor"` \| `"unbounded"` = `...`

WebXR reference space type for VR
- "local": Seated/standing experience, no room bounds
- "local-floor": Floor-level origin, no room bounds
- "bounded-floor": Room-scale with bounds
- "unbounded": Unlimited tracking space

**Default**

```ts
"local-floor"
```

| `undefined`

#### Returns

`void`

***

### shutdown()

> **shutdown**(): `void`

Defined in: [src/Graph.ts:386](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L386)

#### Returns

`void`

***

### startInputRecording()

> **startInputRecording**(): `void`

Defined in: [src/Graph.ts:1949](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1949)

Start recording input for testing/automation

#### Returns

`void`

***

### startVoiceInput()

> **startVoiceInput**(`options?`): `boolean`

Defined in: [src/Graph.ts:3734](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3734)

Start voice input and execute commands.

#### Parameters

##### options?

Voice input options

###### continuous?

`boolean`

###### interimResults?

`boolean`

###### language?

`string`

###### onStart?

(`started`, `error?`) => `void`

###### onTranscript?

(`text`, `isFinal`) => `void`

#### Returns

`boolean`

True if voice input started successfully

#### Example

```typescript
graph.startVoiceInput({
  continuous: true,
  interimResults: true,
  onTranscript: (text, isFinal) => {
    console.log('Transcript:', text, isFinal ? '(final)' : '(interim)');
    if (isFinal) {
      graph.aiCommand(text);
    }
  },
});
```

***

### stopInputRecording()

> **stopInputRecording**(): [`RecordedInputEvent`](../../managers/interfaces/RecordedInputEvent.md)[]

Defined in: [src/Graph.ts:1956](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1956)

Stop recording and get recorded events

#### Returns

[`RecordedInputEvent`](../../managers/interfaces/RecordedInputEvent.md)[]

***

### stopVoiceInput()

> **stopVoiceInput**(): `void`

Defined in: [src/Graph.ts:3778](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L3778)

Stop voice input.

#### Returns

`void`

#### Example

```typescript
graph.stopVoiceInput();
```

***

### update()

> **update**(): `void`

Defined in: [src/Graph.ts:489](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L489)

Update method - kept for backward compatibility
All update logic is now handled by UpdateManager

#### Returns

`void`

***

### updateNodes()

> **updateNodes**(`updates`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:1294](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1294)

#### Parameters

##### updates

`object`[]

##### options?

`QueueableOptions`

#### Returns

`Promise`\<`void`\>

***

### waitForSettled()

> **waitForSettled**(): `Promise`\<`void`\>

Defined in: [src/Graph.ts:2044](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L2044)

Wait for the graph operations to complete and layout to stabilize.

#### Returns

`Promise`\<`void`\>

Promise that resolves when all operations are complete

#### Remarks

This method waits for all queued operations (data loading, layout changes,
algorithm execution) to complete. Use this before taking screenshots,
exporting data, or performing actions that require the graph to be stable.

The method returns when:
- All queued operations have completed
- The operation queue is empty

#### Since

1.0.0

#### See

 - [zoomToFit](#zoomtofit) to zoom after settling
 - [captureScreenshot](#capturescreenshot) for capturing stable views

#### Example

```typescript
// Wait for layout to settle before zooming
await graph.addNodes(nodes);
await graph.addEdges(edges);
await graph.waitForSettled();
graph.zoomToFit();

// Wait before taking a screenshot
await graph.setLayout('circular');
await graph.waitForSettled();
const screenshot = await graph.captureScreenshot();

// Chain operations with settle
await graph.runAlgorithm('graphty', 'pagerank');
await graph.waitForSettled();
console.log('Algorithm complete, results available');
```

***

### worldToScreen()

> **worldToScreen**(`worldPos`): `object`

Defined in: [src/Graph.ts:1960](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1960)

#### Parameters

##### worldPos

###### x

`number`

###### y

`number`

###### z

`number`

#### Returns

`object`

##### x

> **x**: `number`

##### y

> **y**: `number`

***

### zoomToFit()

> **zoomToFit**(): `void`

Defined in: [src/Graph.ts:1453](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/Graph.ts#L1453)

Zoom the camera to fit all nodes in view.

#### Returns

`void`

#### Remarks

This operation executes immediately and does not go through the
operation queue. It may race with queued camera updates.

For better coordination, consider using batchOperations.

#### Since

1.0.0

#### See

 - [waitForSettled](#waitforsettled) to wait for layout before zooming
 - [setCameraState](#setcamerastate) for manual camera control

#### Example

```typescript
// Zoom to fit after data loads
await graph.addNodes(nodes);
await graph.waitForSettled();
graph.zoomToFit();

// Zoom to fit within batch operations
await graph.batchOperations(async () => {
    await graph.setStyleTemplate({graph: {twoD: true}});
    graph.zoomToFit(); // Will execute after style change
});
```
