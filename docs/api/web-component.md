# Web Component API Reference

Complete API reference for the `<graphty-element>` Web Component.

## Overview

The `Graphty` class is a Lit-based Web Component that provides declarative graph visualization through HTML attributes and element properties.

::: tip
For usage patterns and examples, see the [Web Component Guide](/guide/web-component).
:::

## Properties

The Web Component exposes these properties for declarative configuration:

### Data Properties

| Property | Attribute | Type | Description |
|----------|-----------|------|-------------|
| `nodeData` | `node-data` | `Array<object>` | Array of node objects |
| `edgeData` | `edge-data` | `Array<object>` | Array of edge objects |
| `nodeIdPath` | `node-id-path` | `string` | JMESPath to node ID (default: `"id"`) |
| `edgeSrcIdPath` | `edge-src-id-path` | `string` | JMESPath to edge source ID (default: `"src"`) |
| `edgeDstIdPath` | `edge-dst-id-path` | `string` | JMESPath to edge destination ID (default: `"dst"`) |

### Layout Properties

| Property | Attribute | Type | Description |
|----------|-----------|------|-------------|
| `layout` | `layout` | `string` | Layout algorithm name |
| `layoutConfig` | `layout-config` | `object` | Layout algorithm options |

### Display Properties

| Property | Attribute | Type | Description |
|----------|-----------|------|-------------|
| `viewMode` | `view-mode` | `'2d' \| '3d' \| 'vr' \| 'ar'` | Rendering mode |
| `styleTemplate` | `style-template` | `object` | Style configuration |

### Data Source Properties

| Property | Attribute | Type | Description |
|----------|-----------|------|-------------|
| `dataSource` | `data-source` | `string` | Data source type |
| `dataSourceConfig` | `data-source-config` | `object` | Data source configuration |

### XR Properties

| Property | Attribute | Type | Description |
|----------|-----------|------|-------------|
| `xr` | - | `XRConfig` | VR/AR configuration |

### Debug Properties

| Property | Attribute | Type | Description |
|----------|-----------|------|-------------|
| `enableDetailedProfiling` | `enable-detailed-profiling` | `boolean` | Enable performance profiling |
| `runAlgorithmsOnLoad` | `run-algorithms-on-load` | `boolean` | Auto-run style template algorithms |

## Methods

The Web Component provides these methods for imperative control:

### View Mode

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getViewMode()` | - | `ViewMode` | Get current view mode |
| `setViewMode(mode)` | `mode: ViewMode` | `Promise<void>` | Set view mode |
| `isVRSupported()` | - | `Promise<boolean>` | Check VR availability |
| `isARSupported()` | - | `Promise<boolean>` | Check AR availability |

### Screenshot & Video

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `captureScreenshot(options?)` | `ScreenshotOptions` | `Promise<ScreenshotResult>` | Capture screenshot |
| `canCaptureScreenshot(options?)` | `ScreenshotOptions` | `Promise<CapabilityCheck>` | Check screenshot support |
| `captureAnimation(options)` | `AnimationOptions` | `Promise<AnimationResult>` | Capture video |
| `cancelAnimationCapture()` | - | `boolean` | Cancel ongoing capture |
| `isAnimationCapturing()` | - | `boolean` | Check if capturing |
| `estimateAnimationCapture(options)` | `AnimationOptions` | `Promise<CaptureEstimate>` | Estimate capture |

### Camera Control

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `getCameraState()` | - | `CameraState` | Get camera state |
| `setCameraState(state, options?)` | `CameraState`, `CameraAnimationOptions` | `Promise<void>` | Set camera state |
| `setCameraPosition(pos, options?)` | `{x, y, z}`, `CameraAnimationOptions` | `Promise<void>` | Set camera position (3D) |
| `setCameraTarget(target, options?)` | `{x, y, z}`, `CameraAnimationOptions` | `Promise<void>` | Set camera target (3D) |
| `setCameraZoom(zoom, options?)` | `number`, `CameraAnimationOptions` | `Promise<void>` | Set zoom (2D) |
| `setCameraPan(pan, options?)` | `{x, y}`, `CameraAnimationOptions` | `Promise<void>` | Set pan (2D) |
| `resetCamera(options?)` | `CameraAnimationOptions` | `Promise<void>` | Reset to default |

### Camera Presets

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `saveCameraPreset(name)` | `string` | `void` | Save current state as preset |
| `loadCameraPreset(name, options?)` | `string`, `CameraAnimationOptions` | `Promise<void>` | Load preset |
| `getCameraPresets()` | - | `Record<string, CameraState>` | Get all presets |
| `exportCameraPresets()` | - | `Record<string, CameraState>` | Export user presets as JSON |
| `importCameraPresets(presets)` | `Record<string, CameraState>` | `void` | Import presets from JSON |

### Graph Access

| Property | Type | Description |
|----------|------|-------------|
| `graph` | `Graph` | Access the underlying Graph instance |

## Events

The Web Component emits standard DOM events:

```typescript
element.addEventListener('graph-settled', (e) => {
  console.log('Layout complete');
});

element.addEventListener('node-click', (e) => {
  console.log('Clicked:', e.detail.node.id);
});
```

See the [Events Guide](/guide/events) for the complete event reference.

## Generated Reference

For complete type definitions and detailed API documentation:

- [Graphty Class](/api/generated/graphty-element/classes/Graphty.md) - Full TypeDoc reference
- [GraphtyElement Type](/api/generated/graphty-element/type-aliases/GraphtyElement.md) - Type alias

## Related

- [Web Component Guide](/guide/web-component) - Usage patterns and examples
- [JavaScript API Reference](/api/javascript) - Programmatic Graph API
