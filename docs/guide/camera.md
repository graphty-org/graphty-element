# Camera

Guide to camera control and animation.

## Overview

The camera determines what part of the 3D scene is visible. Control it programmatically for automated tours, saved views, or responsive layouts.

## Camera State

The camera state includes position, target, and up vector:

```typescript
const state = graph.getCameraState();
// Returns:
// {
//   position: { x: 0, y: 0, z: 100 },
//   target: { x: 0, y: 0, z: 0 },
//   up: { x: 0, y: 1, z: 0 }
// }
```

- **position**: Where the camera is located
- **target**: What the camera is looking at
- **up**: Which direction is "up" for the camera

## Setting Camera Position

### Direct Position Setting

```typescript
// Set camera position
graph.setCameraPosition({ x: 0, y: 0, z: 100 });

// Set what the camera looks at
graph.setCameraTarget({ x: 0, y: 0, z: 0 });
```

### Zoom to Fit

Automatically frame all nodes:

```typescript
graph.zoomToFit();
```

With padding:

```typescript
graph.zoomToFit({ padding: 1.2 }); // 20% extra space
```

### Set Complete State

```typescript
graph.setCameraState({
  position: { x: 50, y: 50, z: 100 },
  target: { x: 0, y: 0, z: 0 },
  up: { x: 0, y: 1, z: 0 }
});
```

## Camera Animation

Animate camera movements for smooth transitions:

```typescript
const newState = {
  position: { x: 100, y: 100, z: 200 },
  target: { x: 0, y: 0, z: 0 },
  up: { x: 0, y: 1, z: 0 }
};

graph.setCameraState(newState, {
  animate: true,
  duration: 1000,           // milliseconds
  easing: 'easeInOutQuad'   // easing function
});
```

Available easing functions:
- `linear`
- `easeInQuad`, `easeOutQuad`, `easeInOutQuad`
- `easeInCubic`, `easeOutCubic`, `easeInOutCubic`
- `easeInExpo`, `easeOutExpo`, `easeInOutExpo`

## Camera Presets

Save and restore camera positions:

```typescript
// Save current view
graph.saveCameraPreset('overview');

// Navigate to different part of graph
graph.setCameraPosition({ x: 200, y: 0, z: 50 });

// Restore saved view
graph.loadCameraPreset('overview');

// Restore with animation
graph.loadCameraPreset('overview', {
  animate: true,
  duration: 1000
});
```

### Multiple Presets

```typescript
// Save multiple presets
graph.saveCameraPreset('top');
graph.setCameraPosition({ x: 0, y: 100, z: 0 });
graph.setCameraTarget({ x: 0, y: 0, z: 0 });

graph.saveCameraPreset('side');
graph.setCameraPosition({ x: 100, y: 0, z: 0 });
graph.setCameraTarget({ x: 0, y: 0, z: 0 });

// Create a tour
const presets = ['overview', 'top', 'side'];
let current = 0;

function nextView() {
  current = (current + 1) % presets.length;
  graph.loadCameraPreset(presets[current], { animate: true });
}
```

## 2D vs 3D Camera

### 3D Mode (Default)

Full 3D navigation with orbit controls:
- Mouse drag: Orbit around target
- Scroll: Zoom in/out
- Right-drag: Pan

### 2D Mode

Simplified camera for 2D layouts:

```html
<graphty-element view-mode="2d"></graphty-element>
```

```typescript
// 2D camera only has x, y position
graph.setCameraPosition({ x: 0, y: 0, z: 100 });
```

In 2D mode:
- Mouse drag: Pan
- Scroll: Zoom
- No orbit (camera always looks down at the plane)

## Coordinate Transforms

Convert between world and screen coordinates:

### World to Screen

```typescript
// Convert 3D world position to 2D screen position
const worldPos = { x: 0, y: 0, z: 0 };
const screenPos = graph.worldToScreen(worldPos);
// Returns: { x: 400, y: 300 } (pixels from top-left)
```

Use case: Position HTML overlays on nodes:

```typescript
const node = graph.getNode('node1');
const screenPos = graph.worldToScreen(node.position);

overlay.style.left = `${screenPos.x}px`;
overlay.style.top = `${screenPos.y}px`;
```

### Screen to World

```typescript
// Convert screen position to world position
const screenPos = { x: 400, y: 300 };
const worldPos = graph.screenToWorld(screenPos);
// Returns: { x: 0, y: 0, z: 0 }
```

## Camera Events

Listen to camera changes:

```typescript
graph.on('camera-state-changed', ({ state }) => {
  console.log('Camera moved:', state);
});
```

## Focus on Node

Animate camera to focus on a specific node:

```typescript
async function focusNode(nodeId) {
  const node = graph.getNode(nodeId);
  if (!node) return;

  const position = node.position;

  graph.setCameraState({
    position: {
      x: position.x,
      y: position.y,
      z: position.z + 50  // Back away a bit
    },
    target: position,
    up: { x: 0, y: 1, z: 0 }
  }, {
    animate: true,
    duration: 500
  });
}
```

## Orbit Animation

Create a rotating view:

```typescript
function startOrbit() {
  let angle = 0;
  const radius = 100;
  const center = { x: 0, y: 0, z: 0 };

  const intervalId = setInterval(() => {
    angle += 0.01;

    graph.setCameraPosition({
      x: center.x + radius * Math.cos(angle),
      y: 20,
      z: center.z + radius * Math.sin(angle)
    });
    graph.setCameraTarget(center);
  }, 16); // ~60fps

  return () => clearInterval(intervalId);
}

const stopOrbit = startOrbit();
// Later: stopOrbit();
```

## Interactive Examples

- [Camera Controls](https://graphty-org.github.io/graphty-element/storybook/?path=/story/camera--default)
- [Camera Animation](https://graphty-org.github.io/graphty-element/storybook/?path=/story/cameraanimation--default)
