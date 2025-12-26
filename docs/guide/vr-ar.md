# VR/AR

Guide to VR and AR immersive experiences.

## Overview

Graphty supports WebXR for immersive graph exploration. View your graphs in virtual reality (VR) or augmented reality (AR) using compatible headsets and browsers.

## Checking Support

Before enabling XR modes, check browser and device support:

```typescript
// Check VR support
const vrSupported = await graph.isVRSupported();
console.log('VR supported:', vrSupported);

// Check AR support
const arSupported = await graph.isARSupported();
console.log('AR supported:', arSupported);
```

## Entering VR Mode

### Via HTML Attribute

```html
<graphty-element view-mode="vr"></graphty-element>
```

### Via JavaScript

```typescript
// Check support first
const vrSupported = await graph.isVRSupported();

if (vrSupported) {
  graph.setViewMode('vr');
} else {
  console.log('VR is not supported on this device');
}
```

## Entering AR Mode

### Via HTML Attribute

```html
<graphty-element view-mode="ar"></graphty-element>
```

### Via JavaScript

```typescript
const arSupported = await graph.isARSupported();

if (arSupported) {
  graph.setViewMode('ar');
} else {
  console.log('AR is not supported on this device');
}
```

## XR Configuration

Configure WebXR session options:

```typescript
graph.setXRConfig({
  referenceSpace: 'local-floor',
  sessionMode: 'immersive-vr'
});
```

### Reference Space Options

| Value | Description |
|-------|-------------|
| `local` | Small-scale, seated experience |
| `local-floor` | Standing experience with floor tracking |
| `bounded-floor` | Room-scale with boundaries |
| `unbounded` | Large-scale, free movement |

### Session Mode Options

| Value | Description |
|-------|-------------|
| `immersive-vr` | Full VR headset experience |
| `immersive-ar` | AR with environment pass-through |
| `inline` | Non-immersive (in-page preview) |

## Exiting XR

Return to normal 3D view:

```typescript
await graph.exitXR();

// Or set view mode explicitly
graph.setViewMode('3d');
```

## VR/AR Button

Create a button to enter XR:

```html
<button id="vr-button" disabled>Enter VR</button>
<graphty-element></graphty-element>

<script type="module">
  import '@graphty/graphty-element';

  const button = document.getElementById('vr-button');
  const element = document.querySelector('graphty-element');

  // Wait for element to be ready
  await customElements.whenDefined('graphty-element');
  const graph = element.graph;

  // Check VR support
  const vrSupported = await graph.isVRSupported();

  if (vrSupported) {
    button.disabled = false;
    button.onclick = () => {
      graph.setViewMode('vr');
    };
  } else {
    button.textContent = 'VR Not Supported';
  }
</script>
```

## Browser Compatibility

### VR Support

| Browser | Status |
|---------|--------|
| Chrome (desktop) | ✅ Full support |
| Chrome (Android) | ✅ Full support |
| Edge | ✅ Full support |
| Firefox | ⚠️ Partial support |
| Safari | ❌ Not supported |

### AR Support

| Browser | Status |
|---------|--------|
| Chrome (Android) | ✅ Full support with ARCore |
| Edge | ⚠️ Limited support |
| Safari (iOS) | ❌ Not supported (use Quick Look) |

### Headsets

| Device | VR | AR |
|--------|----|----|
| Meta Quest 2/3 | ✅ | ✅ |
| HTC Vive | ✅ | ❌ |
| Valve Index | ✅ | ❌ |
| Windows Mixed Reality | ✅ | ⚠️ |
| Pico | ✅ | ✅ |

## Controller Interaction

In VR/AR mode, controllers can interact with the graph:

- **Point**: Highlight nodes
- **Trigger**: Select nodes
- **Grip**: Drag nodes (if enabled)
- **Thumbstick**: Navigate through the graph

Controller bindings depend on the specific headset and browser.

## Performance in XR

XR requires high frame rates (72-120 fps). Tips for smooth performance:

1. **Reduce node count**: Keep under 1000 nodes
2. **Simplify shapes**: Use spheres instead of complex shapes
3. **Limit labels**: Disable or reduce label rendering
4. **Pre-compute layouts**: Use fixed layouts instead of live physics

```typescript
// Optimize for XR
graph.setLayout('fixed');

// Simplify styles
graph.styleManager.addLayer({
  selector: '*',
  styles: {
    node: { shape: 'sphere' },
    label: { visible: false }
  }
});
```

## VR-Specific Styling

Adjust styles for VR visibility:

```typescript
graph.styleManager.addLayer({
  selector: '*',
  priority: 50,
  styles: {
    node: {
      // Larger nodes for VR
      size: 2.0,
      // High contrast colors
      color: '#00ff00'
    },
    edge: {
      line: {
        // Thicker lines visible in VR
        width: 1.5
      }
    }
  }
});
```

## AR Considerations

For AR experiences:

1. **Scale**: Graph may need scaling to fit physical space
2. **Placement**: Consider how the graph anchors in real world
3. **Lighting**: AR lighting affects node visibility
4. **Occlusion**: Real objects can occlude the graph

```typescript
// Scale graph for AR
graph.setScale(0.1); // 10% of original size

// Position in front of user
graph.setPosition({ x: 0, y: 1, z: -2 }); // 2 meters ahead
```

## Event Handling in XR

XR has specific events:

```typescript
graph.on('xr-session-started', () => {
  console.log('Entered XR mode');
});

graph.on('xr-session-ended', () => {
  console.log('Exited XR mode');
});

graph.on('xr-controller-connected', ({ controller }) => {
  console.log('Controller connected:', controller);
});
```

## Testing Without Headset

Use browser developer tools:

1. **Chrome**: DevTools > More tools > Sensors > WebXR
2. **Firefox**: Install WebXR Emulator extension

Or use mobile AR without a headset:

```typescript
// Check mobile AR support
if (arSupported && /Android/.test(navigator.userAgent)) {
  // Mobile AR available
  button.textContent = 'View in AR';
}
```

## Interactive Examples

- [XR Examples](https://graphty-org.github.io/graphty-element/storybook/?path=/story/xr--default)
