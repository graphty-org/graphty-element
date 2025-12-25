[@graphty/graphty-element](../../index.md) / [Graph](../index.md) / Graph

# Class: Graph

Defined in: [src/Graph.ts:69](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L69)

Main orchestrator class for graph visualization and interaction.
Integrates Babylon.js scene management, coordinates nodes, edges, layouts, and styling.

## Implements

- [`GraphContext`](../../managers/interfaces/GraphContext.md)

## Constructors

### Constructor

> **new Graph**(`element`, `useMockInput`): `Graph`

Defined in: [src/Graph.ts:132](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L132)

Creates a new Graph instance and initializes the rendering engine and managers.

#### Parameters

##### element

DOM element or element ID to attach the graph canvas to

`string` | `Element`

##### useMockInput

`boolean` = `false`

Whether to use mock input for testing (defaults to false)

#### Returns

`Graph`

## Properties

### camera

> **camera**: `CameraManager`

Defined in: [src/Graph.ts:76](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L76)

***

### canvas

> **canvas**: `HTMLCanvasElement`

Defined in: [src/Graph.ts:73](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L73)

***

### element

> **element**: `Element`

Defined in: [src/Graph.ts:72](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L72)

***

### enableDetailedProfiling?

> `optional` **enableDetailedProfiling**: `boolean`

Defined in: [src/Graph.ts:89](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L89)

***

### engine

> **engine**: `Engine` \| `WebGPUEngine`

Defined in: [src/Graph.ts:74](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L74)

***

### eventManager

> `readonly` **eventManager**: [`EventManager`](../../managers/classes/EventManager.md)

Defined in: [src/Graph.ts:101](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L101)

Event manager for adding/removing event listeners

***

### fetchEdges?

> `optional` **fetchEdges**: [`FetchEdgesFn`](../../config/type-aliases/FetchEdgesFn.md)

Defined in: [src/Graph.ts:86](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L86)

***

### fetchNodes?

> `optional` **fetchNodes**: [`FetchNodesFn`](../../config/type-aliases/FetchNodesFn.md)

Defined in: [src/Graph.ts:85](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L85)

***

### initialized

> **initialized**: `boolean` = `false`

Defined in: [src/Graph.ts:87](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L87)

***

### needRays

> **needRays**: `boolean` = `true`

Defined in: [src/Graph.ts:81](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L81)

***

### operationQueue

> **operationQueue**: [`OperationQueueManager`](../../managers/classes/OperationQueueManager.md)

Defined in: [src/Graph.ts:112](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L112)

***

### pinOnDrag?

> `optional` **pinOnDrag**: `boolean`

Defined in: [src/Graph.ts:83](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L83)

***

### runAlgorithmsOnLoad

> **runAlgorithmsOnLoad**: `boolean` = `false`

Defined in: [src/Graph.ts:88](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L88)

***

### scene

> **scene**: `Scene`

Defined in: [src/Graph.ts:75](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L75)

***

### skybox?

> `optional` **skybox**: `string`

Defined in: [src/Graph.ts:79](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L79)

***

### styles

> **styles**: [`Styles`](../../Styles/classes/Styles.md)

Defined in: [src/Graph.ts:70](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L70)

***

### xrHelper

> **xrHelper**: `WebXRDefaultExperience` \| `null` = `null`

Defined in: [src/Graph.ts:80](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L80)

## Accessors

### input

#### Get Signature

> **get** **input**(): [`InputManager`](../../managers/classes/InputManager.md)

Defined in: [src/Graph.ts:2059](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2059)

Get the input manager

##### Returns

[`InputManager`](../../managers/classes/InputManager.md)

The input manager instance

## Methods

### addDataFromSource()

> **addDataFromSource**(`type`, `opts`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:764](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L764)

Adds graph data from a registered data source.

#### Parameters

##### type

`string`

Type/name of the registered data source

##### opts

`object` = `{}`

Options to pass to the data source

#### Returns

`Promise`\<`void`\>

Promise that resolves when data is loaded

***

### addEdge()

> **addEdge**(`edge`, `srcIdPath?`, `dstIdPath?`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:986](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L986)

Add a single edge to the graph.

#### Parameters

##### edge

[`AdHocData`](../../config/type-aliases/AdHocData.md)

Edge data object to add

##### srcIdPath?

`string`

Key to use for edge source ID (default: "source")

##### dstIdPath?

`string`

Key to use for edge destination ID (default: "target")

##### options?

`QueueableOptions`

Queue options for operation ordering

#### Returns

`Promise`\<`void`\>

***

### addEdges()

> **addEdges**(`edges`, `srcIdPath?`, `dstIdPath?`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:1027](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1027)

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

Defined in: [src/Graph.ts:1481](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1481)

Add an event listener for graph events.

#### Parameters

##### type

[`EventType`](../../events/type-aliases/EventType.md)

Event type to listen for

##### cb

[`EventCallbackType`](../../events/type-aliases/EventCallbackType.md)

Callback function to execute when event fires

#### Returns

`void`

***

### addNode()

> **addNode**(`node`, `idPath?`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:918](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L918)

Add a single node to the graph.

#### Parameters

##### node

[`AdHocData`](../../config/type-aliases/AdHocData.md)

Node data object to add

##### idPath?

`string`

Key to use for node ID (default: "id")

##### options?

`QueueableOptions`

Queue options for operation ordering

#### Returns

`Promise`\<`void`\>

***

### addNodes()

> **addNodes**(`nodes`, `idPath?`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:957](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L957)

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

Defined in: [src/Graph.ts:3713](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3713)

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

Defined in: [src/Graph.ts:1192](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1192)

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

Defined in: [src/Graph.ts:1437](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1437)

Execute multiple operations as a batch
Operations will be queued and executed in dependency order

#### Parameters

##### fn

() => `void` \| `Promise`\<`void`\>

Function containing operations to batch

#### Returns

`Promise`\<`void`\>

***

### canCaptureScreenshot()

> **canCaptureScreenshot**(`options?`): `Promise`\<`CapabilityCheck`\>

Defined in: [src/Graph.ts:2249](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2249)

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

Defined in: [src/Graph.ts:3778](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3778)

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

Defined in: [src/Graph.ts:2444](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2444)

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

Defined in: [src/Graph.ts:2291](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2291)

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

Defined in: [src/Graph.ts:2217](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2217)

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

Defined in: [src/Graph.ts:3863](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3863)

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

Defined in: [src/Graph.ts:1676](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1676)

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

Defined in: [src/Graph.ts:3689](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3689)

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

Defined in: [src/Graph.ts:4101](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L4101)

Dispose all graph resources including voice, AI, XR, and Babylon.js components.

#### Returns

`void`

***

### enableAiControl()

> **enableAiControl**(`config`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3672](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3672)

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

Defined in: [src/Graph.ts:4030](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L4030)

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

Defined in: [src/Graph.ts:2485](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2485)

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

Defined in: [src/Graph.ts:4073](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L4073)

Exit XR mode and return to previous camera

#### Returns

`Promise`\<`void`\>

***

### exportCameraPresets()

> **exportCameraPresets**(): `Record`\<`string`, `CameraState`\>

Defined in: [src/Graph.ts:3575](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3575)

Export user-defined presets as JSON

#### Returns

`Record`\<`string`, `CameraState`\>

Object mapping preset names to camera states

***

### getAiManager()

> **getAiManager**(): `AiManager` \| `null`

Defined in: [src/Graph.ts:3795](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3795)

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

Defined in: [src/Graph.ts:3737](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3737)

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

Defined in: [src/Graph.ts:3844](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3844)

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

Defined in: [src/Graph.ts:2143](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2143)

Get the active camera controller.

#### Returns

`CameraController` \| `null`

The active camera controller or null if none active

***

### getCameraPresets()

> **getCameraPresets**(): `Record`\<`string`, `CameraState` \| \{ `builtin`: `true`; \}\>

Defined in: [src/Graph.ts:3555](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3555)

Get all camera presets (built-in + user-defined)

#### Returns

`Record`\<`string`, `CameraState` \| \{ `builtin`: `true`; \}\>

Object mapping preset names to camera states or builtin marker

***

### getCameraState()

> **getCameraState**(): `CameraState`

Defined in: [src/Graph.ts:2494](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2494)

Get the current camera state

#### Returns

`CameraState`

Camera state including position, target, and rotation

***

### getConfig()

> **getConfig**(): [`GraphContextConfig`](../../managers/interfaces/GraphContextConfig.md)

Defined in: [src/Graph.ts:1963](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1963)

Get the current graph context configuration.

#### Returns

[`GraphContextConfig`](../../managers/interfaces/GraphContextConfig.md)

The graph context configuration

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getConfig`](../../managers/interfaces/GraphContext.md#getconfig)

***

### getDataManager()

> **getDataManager**(): [`DataManager`](../../managers/classes/DataManager.md)

Defined in: [src/Graph.ts:1545](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1545)

Get the DataManager instance.

#### Returns

[`DataManager`](../../managers/classes/DataManager.md)

The DataManager instance

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getDataManager`](../../managers/interfaces/GraphContext.md#getdatamanager)

***

### getEdgeCount()

> **getEdgeCount**(): `number`

Defined in: [src/Graph.ts:1463](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1463)

Get the total number of edges in the graph.

#### Returns

`number`

The number of edges

***

### getEventManager()

> **getEventManager**(): [`EventManager`](../../managers/classes/EventManager.md)

Defined in: [src/Graph.ts:1601](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1601)

Get the EventManager instance for event handling.

#### Returns

[`EventManager`](../../managers/classes/EventManager.md)

The EventManager instance

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getEventManager`](../../managers/interfaces/GraphContext.md#geteventmanager)

***

### getLayoutManager()

> **getLayoutManager**(): [`LayoutManager`](../../managers/classes/LayoutManager.md)

Defined in: [src/Graph.ts:1553](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1553)

Get the LayoutManager instance.

#### Returns

[`LayoutManager`](../../managers/classes/LayoutManager.md)

The LayoutManager instance

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getLayoutManager`](../../managers/interfaces/GraphContext.md#getlayoutmanager)

***

### getMeshCache()

> **getMeshCache**(): `MeshCache`

Defined in: [src/Graph.ts:1569](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1569)

Get the MeshCache instance used for mesh instancing.

#### Returns

`MeshCache`

The MeshCache instance

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getMeshCache`](../../managers/interfaces/GraphContext.md#getmeshcache)

***

### getNode()

> **getNode**(`nodeId`): [`Node`](../../Node/classes/Node.md) \| `undefined`

Defined in: [src/Graph.ts:3627](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3627)

Get a specific node

#### Parameters

##### nodeId

ID of the node to retrieve

`string` | `number`

#### Returns

[`Node`](../../Node/classes/Node.md) \| `undefined`

The node instance or undefined if not found

***

### getNodeCount()

> **getNodeCount**(): `number`

Defined in: [src/Graph.ts:1455](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1455)

Get the total number of nodes in the graph.

#### Returns

`number`

The number of nodes

***

### getNodeMesh()

> **getNodeMesh**(`nodeId`): `AbstractMesh` \| `null`

Defined in: [src/Graph.ts:2152](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2152)

Get the Babylon.js mesh for a node by its ID.

#### Parameters

##### nodeId

`string`

ID of the node

#### Returns

`AbstractMesh` \| `null`

The node's mesh or null if not found

***

### getNodes()

> **getNodes**(): [`Node`](../../Node/classes/Node.md)[]

Defined in: [src/Graph.ts:3635](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3635)

Get all nodes

#### Returns

[`Node`](../../Node/classes/Node.md)[]

Array of all node instances

***

### getScene()

> **getScene**(): `Scene`

Defined in: [src/Graph.ts:1577](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1577)

Get the Babylon.js Scene instance.

#### Returns

`Scene`

The Scene instance

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getScene`](../../managers/interfaces/GraphContext.md#getscene)

***

### getSelectedNode()

> **getSelectedNode**(): [`Node`](../../Node/classes/Node.md) \| `null`

Defined in: [src/Graph.ts:1613](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1613)

Get the currently selected node.

#### Returns

[`Node`](../../Node/classes/Node.md) \| `null`

The selected node, or null if nothing is selected.

***

### getSelectionManager()

> **getSelectionManager**(): [`SelectionManager`](../../managers/classes/SelectionManager.md)

Defined in: [src/Graph.ts:1593](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1593)

Get the SelectionManager instance for handling node selection.

#### Returns

[`SelectionManager`](../../managers/classes/SelectionManager.md)

The SelectionManager instance

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getSelectionManager`](../../managers/interfaces/GraphContext.md#getselectionmanager)

***

### getStatsManager()

> **getStatsManager**(): [`StatsManager`](../../managers/classes/StatsManager.md)

Defined in: [src/Graph.ts:1585](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1585)

Get the StatsManager instance for performance metrics.

#### Returns

[`StatsManager`](../../managers/classes/StatsManager.md)

The StatsManager instance

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getStatsManager`](../../managers/interfaces/GraphContext.md#getstatsmanager)

***

### getStyleManager()

> **getStyleManager**(): [`StyleManager`](../../managers/classes/StyleManager.md)

Defined in: [src/Graph.ts:1537](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1537)

Get the StyleManager instance.

#### Returns

[`StyleManager`](../../managers/classes/StyleManager.md)

The StyleManager instance

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getStyleManager`](../../managers/interfaces/GraphContext.md#getstylemanager)

***

### getStyles()

> **getStyles**(): [`Styles`](../../Styles/classes/Styles.md)

Defined in: [src/Graph.ts:1529](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1529)

Get the Styles instance for the graph.

#### Returns

[`Styles`](../../Styles/classes/Styles.md)

The Styles instance

***

### getSuggestedStyles()

> **getSuggestedStyles**(`algorithmKey`): [`SuggestedStylesConfig`](../../config/interfaces/SuggestedStylesConfig.md) \| `null`

Defined in: [src/Graph.ts:1222](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1222)

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

Defined in: [src/Graph.ts:1561](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1561)

Get the UpdateManager instance.

#### Returns

[`UpdateManager`](../../managers/classes/UpdateManager.md)

The UpdateManager instance

***

### getViewMode()

> **getViewMode**(): `"2d"` \| `"3d"` \| `"ar"` \| `"vr"`

Defined in: [src/Graph.ts:1749](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1749)

Get the current view mode.
Returns the viewMode from config (always set due to default value).

#### Returns

`"2d"` \| `"3d"` \| `"ar"` \| `"vr"`

The current view mode ("2d", "3d", "ar", or "vr")

***

### getVoiceAdapter()

> **getVoiceAdapter**(): `VoiceInputAdapter`

Defined in: [src/Graph.ts:3886](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3886)

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

Defined in: [src/Graph.ts:1991](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1991)

Get the current XR configuration.

#### Returns

[`XRConfig`](../../config/interfaces/XRConfig.md) \| `undefined`

The XR configuration if set

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getXRConfig`](../../managers/interfaces/GraphContext.md#getxrconfig)

***

### getXRSessionManager()

> **getXRSessionManager**(): `XRSessionManager` \| `undefined`

Defined in: [src/Graph.ts:2010](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2010)

Get the XR session manager instance.

#### Returns

`XRSessionManager` \| `undefined`

The XR session manager if XR is initialized

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`getXRSessionManager`](../../managers/interfaces/GraphContext.md#getxrsessionmanager)

***

### importCameraPresets()

> **importCameraPresets**(`presets`): `void`

Defined in: [src/Graph.ts:3587](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3587)

Import user-defined presets from JSON

#### Parameters

##### presets

`Record`\<`string`, `CameraState`\>

Object mapping preset names to camera states

#### Returns

`void`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/Graph.ts:435](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L435)

Initializes the graph instance, setting up managers, styles, and rendering pipeline.

#### Returns

`Promise`\<`void`\>

***

### ~~is2D()~~

> **is2D**(): `boolean`

Defined in: [src/Graph.ts:1739](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1739)

Check if the graph is in 2D mode (deprecated - use getViewMode instead).

#### Returns

`boolean`

True if in 2D mode, false otherwise

#### Deprecated

Use getViewMode() === "2d" instead

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`is2D`](../../managers/interfaces/GraphContext.md#is2d)

***

### isAiEnabled()

> **isAiEnabled**(): `boolean`

Defined in: [src/Graph.ts:3803](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3803)

Check if AI control is currently enabled.

#### Returns

`boolean`

True if AI is enabled

***

### isAnimationCapturing()

> **isAnimationCapturing**(): `boolean`

Defined in: [src/Graph.ts:2463](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2463)

Check if an animation capture is currently in progress

#### Returns

`boolean`

True if currently capturing an animation

***

### isARSupported()

> **isARSupported**(): `Promise`\<`boolean`\>

Defined in: [src/Graph.ts:2046](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2046)

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

Defined in: [src/Graph.ts:1685](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1685)

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

Defined in: [src/Graph.ts:1975](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1975)

Check if the layout engine is currently running.

#### Returns

`boolean`

True if layout is running

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`isRunning`](../../managers/interfaces/GraphContext.md#isrunning)

***

### isVoiceActive()

> **isVoiceActive**(): `boolean`

Defined in: [src/Graph.ts:3966](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3966)

Check if voice input is currently active.

#### Returns

`boolean`

True if voice input is active

***

### isVRSupported()

> **isVRSupported**(): `Promise`\<`boolean`\>

Defined in: [src/Graph.ts:2026](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2026)

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

Defined in: [src/Graph.ts:1491](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1491)

Get the total number of registered event listeners.
Useful for debugging and testing to ensure listeners are properly cleaned up.

#### Returns

`number`

The number of registered listeners

***

### loadCameraPreset()

> **loadCameraPreset**(`name`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3547](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3547)

Load a camera preset (built-in or user-defined)

#### Parameters

##### name

`string`

Name of the preset to load

##### options?

`CameraAnimationOptions`

Optional animation configuration

#### Returns

`Promise`\<`void`\>

Promise that resolves when camera state is applied

***

### loadFromFile()

> **loadFromFile**(`file`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:777](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L777)

Load graph data from a File object with auto-format detection

#### Parameters

##### file

`File`

File object from file input

##### options?

Loading options

###### edgeDstIdPath?

`string`

JMESPath for edge destination ID extraction

###### edgeSrcIdPath?

`string`

JMESPath for edge source ID extraction

###### format?

`string`

Explicit format override (e.g., "graphml", "json")

###### nodeIdPath?

`string`

JMESPath for node ID extraction

#### Returns

`Promise`\<`void`\>

***

### loadFromUrl()

> **loadFromUrl**(`url`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:844](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L844)

Load graph data from a URL with auto-format detection

#### Parameters

##### url

`string`

URL to fetch graph data from

##### options?

Loading options

###### edgeDstIdPath?

`string`

JMESPath for edge destination ID extraction

###### edgeSrcIdPath?

`string`

JMESPath for edge source ID extraction

###### format?

`string`

Explicit format override (e.g., "graphml", "json")

###### nodeIdPath?

`string`

JMESPath for node ID extraction

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

Defined in: [src/Graph.ts:1955](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1955)

Check if ray updates are needed for edge arrows.

#### Returns

`boolean`

True if rays need updating

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`needsRayUpdate`](../../managers/interfaces/GraphContext.md#needsrayupdate)

***

### on()

> **on**(`type`, `cb`): `void`

Defined in: [src/Graph.ts:1472](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1472)

Alias for addEventListener

#### Parameters

##### type

[`EventType`](../../events/type-aliases/EventType.md)

Event type to listen for

##### cb

[`EventCallbackType`](../../events/type-aliases/EventCallbackType.md)

Callback function to execute when event fires

#### Returns

`void`

***

### onAiStatusChange()

> **onAiStatusChange**(`callback`): () => `void`

Defined in: [src/Graph.ts:3758](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3758)

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

Defined in: [src/Graph.ts:1298](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1298)

Remove nodes from the graph by their IDs.

#### Parameters

##### nodeIds

(`string` \| `number`)[]

Array of node IDs to remove

##### options?

`QueueableOptions`

Queue options for operation ordering

#### Returns

`Promise`\<`void`\>

***

### render()

> **render**(): `void`

Defined in: [src/Graph.ts:3642](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3642)

Render method (public for testing)

#### Returns

`void`

***

### resetCamera()

> **resetCamera**(`options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3440](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3440)

Reset camera to default state

#### Parameters

##### options?

`CameraAnimationOptions`

Optional animation configuration

#### Returns

`Promise`\<`void`\>

Promise that resolves when camera is reset

***

### resolveCameraPreset()

> **resolveCameraPreset**(`preset`): `CameraState`

Defined in: [src/Graph.ts:3464](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3464)

Resolve a camera preset (built-in or user-defined) to a CameraState

#### Parameters

##### preset

`string`

Name of the preset to resolve

#### Returns

`CameraState`

The resolved camera state

***

### retryLastAiCommand()

> **retryLastAiCommand**(): `Promise`\<`ExecutionResult`\>

Defined in: [src/Graph.ts:3823](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3823)

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

Defined in: [src/Graph.ts:1156](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1156)

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

Defined in: [src/Graph.ts:421](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L421)

Executes all algorithms specified in the style template configuration.

#### Returns

`Promise`\<`void`\>

***

### saveCameraPreset()

> **saveCameraPreset**(`name`): `void`

Defined in: [src/Graph.ts:3529](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3529)

Save current camera state as a named preset

#### Parameters

##### name

`string`

Name for the camera preset

#### Returns

`void`

***

### screenToWorld()

> **screenToWorld**(`screenPos`): \{ `x`: `number`; `y`: `number`; `z`: `number`; \} \| `null`

Defined in: [src/Graph.ts:2125](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2125)

Convert 2D screen coordinates to 3D world coordinates via raycasting.

#### Parameters

##### screenPos

Screen position to convert

###### x

`number`

X coordinate in screen space

###### y

`number`

Y coordinate in screen space

#### Returns

\{ `x`: `number`; `y`: `number`; `z`: `number`; \} \| `null`

World coordinates {x, y, z} or null if no intersection

***

### selectNode()

> **selectNode**(`nodeId`): `boolean`

Defined in: [src/Graph.ts:1649](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1649)

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

Defined in: [src/Graph.ts:1382](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1382)

Set the active camera mode (e.g., "arcRotate", "universal").

#### Parameters

##### mode

`CameraKey`

Camera mode key to activate

##### options?

`QueueableOptions`

Queue options for operation ordering

#### Returns

`Promise`\<`void`\>

***

### setCameraPan()

> **setCameraPan**(`pan`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3428](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3428)

Set camera pan (2D)

#### Parameters

##### pan

Pan offset coordinates

###### x

`number`

X offset

###### y

`number`

Y offset

##### options?

`CameraAnimationOptions`

Optional animation configuration

#### Returns

`Promise`\<`void`\>

Promise that resolves when pan is set

***

### setCameraPosition()

> **setCameraPosition**(`position`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3378](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3378)

Set camera position (3D)

#### Parameters

##### position

Camera position coordinates

###### x

`number`

X coordinate

###### y

`number`

Y coordinate

###### z

`number`

Z coordinate

##### options?

`CameraAnimationOptions`

Optional animation configuration

#### Returns

`Promise`\<`void`\>

Promise that resolves when camera position is set

***

### setCameraState()

> **setCameraState**(`state`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:2609](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2609)

Set the camera state (Phase 4: with animation support)

#### Parameters

##### state

Camera state or preset name to apply

`CameraState` | \{ `preset`: `string`; \}

##### options?

`CameraAnimationOptions`

Optional animation configuration

#### Returns

`Promise`\<`void`\>

***

### setCameraTarget()

> **setCameraTarget**(`target`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3397](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3397)

Set camera target (3D)

#### Parameters

##### target

Camera target coordinates

###### x

`number`

X coordinate

###### y

`number`

Y coordinate

###### z

`number`

Z coordinate

##### options?

`CameraAnimationOptions`

Optional animation configuration

#### Returns

`Promise`\<`void`\>

Promise that resolves when camera target is set

***

### setCameraZoom()

> **setCameraZoom**(`zoom`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:3413](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3413)

Set camera zoom (2D)

#### Parameters

##### zoom

`number`

Zoom level (1.0 = default, \>1 = zoomed in, \<1 = zoomed out)

##### options?

`CameraAnimationOptions`

Optional animation configuration

#### Returns

`Promise`\<`void`\>

Promise that resolves when zoom is set

***

### setData()

> **setData**(`data`): `void`

Defined in: [src/Graph.ts:3604](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3604)

Set graph data (delegates to data manager)

#### Parameters

##### data

Graph data object

###### edges

`Record`\<`string`, `unknown`\>[]

Array of edge data objects

###### nodes

`Record`\<`string`, `unknown`\>[]

Array of node data objects

#### Returns

`void`

***

### setInputEnabled()

> **setInputEnabled**(`enabled`): `void`

Defined in: [src/Graph.ts:2067](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2067)

Enable or disable input

#### Parameters

##### enabled

`boolean`

True to enable input, false to disable

#### Returns

`void`

***

### setLayout()

> **setLayout**(`type`, `opts`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:1089](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1089)

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

Defined in: [src/Graph.ts:1409](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1409)

Update rendering settings for the graph visualization.

#### Parameters

##### settings

`Record`\<`string`, `unknown`\>

Object containing rendering configuration options

##### options?

`QueueableOptions`

Queue options for operation ordering

#### Returns

`Promise`\<`void`\>

***

### setRunning()

> **setRunning**(`running`): `void`

Defined in: [src/Graph.ts:1983](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1983)

Set whether the layout engine should run.

#### Parameters

##### running

`boolean`

True to start the layout, false to stop it

#### Returns

`void`

#### Implementation of

[`GraphContext`](../../managers/interfaces/GraphContext.md).[`setRunning`](../../managers/interfaces/GraphContext.md#setrunning)

***

### setStyleTemplate()

> **setStyleTemplate**(`t`, `options?`): `Promise`\<[`Styles`](../../Styles/classes/Styles.md)\>

Defined in: [src/Graph.ts:567](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L567)

Sets the style template for the graph, applying visual and behavioral configurations.

#### Parameters

##### t

Style schema containing configuration for graph appearance and behavior

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

Optional queueing options for batch processing

#### Returns

`Promise`\<[`Styles`](../../Styles/classes/Styles.md)\>

The updated Styles instance

***

### setViewMode()

> **setViewMode**(`mode`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:1768](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1768)

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

Promise that resolves when view mode is set

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

Defined in: [src/Graph.ts:2000](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2000)

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

Defined in: [src/Graph.ts:398](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L398)

Shuts down the graph, stopping animations and disposing all resources.

#### Returns

`void`

***

### startInputRecording()

> **startInputRecording**(): `void`

Defined in: [src/Graph.ts:2074](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2074)

Start recording input for testing/automation

#### Returns

`void`

***

### startVoiceInput()

> **startVoiceInput**(`options?`): `boolean`

Defined in: [src/Graph.ts:3915](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3915)

Start voice input and execute commands.

#### Parameters

##### options?

Voice input options

###### continuous?

`boolean`

Whether to continuously listen for input

###### interimResults?

`boolean`

Whether to return interim transcription results

###### language?

`string`

BCP 47 language tag (e.g., "en-US", "fr-FR")

###### onStart?

(`started`, `error?`) => `void`

Callback when voice input starts

###### onTranscript?

(`text`, `isFinal`) => `void`

Callback for transcription events

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

Defined in: [src/Graph.ts:2082](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2082)

Stop recording and get recorded events

#### Returns

[`RecordedInputEvent`](../../managers/interfaces/RecordedInputEvent.md)[]

Array of recorded input events

***

### stopVoiceInput()

> **stopVoiceInput**(): `void`

Defined in: [src/Graph.ts:3958](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L3958)

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

Defined in: [src/Graph.ts:507](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L507)

Update method - kept for backward compatibility
All update logic is now handled by UpdateManager

#### Returns

`void`

***

### updateNodes()

> **updateNodes**(`updates`, `options?`): `Promise`\<`void`\>

Defined in: [src/Graph.ts:1339](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1339)

Update node data for existing nodes in the graph.

#### Parameters

##### updates

`object`[]

Array of update objects containing node ID and properties to update

##### options?

`QueueableOptions`

Queue options for operation ordering

#### Returns

`Promise`\<`void`\>

***

### waitForSettled()

> **waitForSettled**(): `Promise`\<`void`\>

Defined in: [src/Graph.ts:2190](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2190)

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

Defined in: [src/Graph.ts:2094](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L2094)

Convert 3D world coordinates to 2D screen coordinates.

#### Parameters

##### worldPos

World position to convert

###### x

`number`

X coordinate in world space

###### y

`number`

Y coordinate in world space

###### z

`number`

Z coordinate in world space

#### Returns

`object`

Screen coordinates {x, y}

##### x

> **x**: `number`

##### y

> **y**: `number`

***

### zoomToFit()

> **zoomToFit**(): `void`

Defined in: [src/Graph.ts:1519](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/Graph.ts#L1519)

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
