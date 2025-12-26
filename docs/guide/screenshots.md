# Screenshots & Video

Guide to capturing images and video from your graph visualization.

## Overview

Graphty supports capturing static screenshots and animated video recordings. Use these features for sharing, documentation, or creating presentations.

## Taking Screenshots

Capture the current view as an image:

```typescript
const dataUrl = await graph.captureScreenshot({
  width: 1920,
  height: 1080,
  format: 'png'
});

// dataUrl is a base64 data URL
// e.g., "data:image/png;base64,iVBORw0KG..."
```

## Screenshot Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | `number` | canvas width | Output width in pixels |
| `height` | `number` | canvas height | Output height in pixels |
| `format` | `'png' \| 'jpeg'` | `'png'` | Image format |
| `quality` | `number` | `0.9` | JPEG quality (0-1) |
| `transparent` | `boolean` | `false` | Transparent background |

### Examples

```typescript
// High resolution
const hiRes = await graph.captureScreenshot({
  width: 3840,
  height: 2160,
  format: 'png'
});

// Compressed JPEG
const compressed = await graph.captureScreenshot({
  format: 'jpeg',
  quality: 0.7
});

// Transparent background
const transparent = await graph.captureScreenshot({
  transparent: true,
  format: 'png'
});
```

## Checking Capabilities

Before capturing, verify support:

```typescript
const canCapture = graph.canCaptureScreenshot();
if (!canCapture) {
  console.log('Screenshot capture not supported');
}
```

## Downloading Screenshots

Convert data URL to downloadable file:

```typescript
async function downloadScreenshot() {
  const dataUrl = await graph.captureScreenshot({
    width: 1920,
    height: 1080
  });

  // Create download link
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = 'graph-screenshot.png';
  link.click();
}
```

Or using Blob for better memory handling:

```typescript
async function downloadScreenshotBlob() {
  const dataUrl = await graph.captureScreenshot();

  // Convert to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'graph-screenshot.png';
  link.click();

  // Clean up
  URL.revokeObjectURL(url);
}
```

## Recording Video

Capture animated video of the visualization:

```typescript
const blob = await graph.captureAnimation({
  duration: 5000,     // 5 seconds
  fps: 30,            // 30 frames per second
  format: 'webm'      // Video format
});

// blob is a video Blob
```

## Video Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | `number` | `5000` | Recording duration (ms) |
| `fps` | `number` | `30` | Frames per second |
| `format` | `'webm' \| 'mp4'` | `'webm'` | Video format |
| `width` | `number` | canvas width | Output width |
| `height` | `number` | canvas height | Output height |

## Animation Capture Controls

Check if recording is in progress:

```typescript
if (graph.isAnimationCapturing()) {
  console.log('Recording in progress...');
}
```

Cancel an ongoing recording:

```typescript
graph.cancelAnimationCapture();
```

## Downloading Video

```typescript
async function recordAndDownload() {
  const blob = await graph.captureAnimation({
    duration: 10000,
    fps: 30
  });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'graph-animation.webm';
  link.click();

  URL.revokeObjectURL(url);
}
```

## Creating Tours

Combine camera animation with video capture:

```typescript
async function captureTour() {
  // Start at overview
  graph.zoomToFit();

  // Start recording
  const capturePromise = graph.captureAnimation({
    duration: 10000
  });

  // Animate camera during recording
  await graph.setCameraState(
    { position: { x: 100, y: 100, z: 200 }, target: { x: 0, y: 0, z: 0 } },
    { animate: true, duration: 3000 }
  );

  await graph.setCameraState(
    { position: { x: -100, y: 50, z: 150 }, target: { x: 0, y: 0, z: 0 } },
    { animate: true, duration: 3000 }
  );

  graph.zoomToFit();

  // Wait for recording to complete
  const blob = await capturePromise;

  // Download
  downloadBlob(blob, 'tour.webm');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

## Screenshot Button Example

Add a screenshot button to your UI:

```html
<button id="screenshot-btn">Take Screenshot</button>
<graphty-element></graphty-element>

<script type="module">
  import '@graphty/graphty-element';

  document.getElementById('screenshot-btn').onclick = async () => {
    const element = document.querySelector('graphty-element');
    const graph = element.graph;

    const dataUrl = await graph.captureScreenshot({
      width: 1920,
      height: 1080
    });

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `graph-${Date.now()}.png`;
    link.click();
  };
</script>
```

## Recording Controls UI

```html
<button id="record-btn">Record</button>
<button id="stop-btn" disabled>Stop</button>
<graphty-element></graphty-element>

<script type="module">
  import '@graphty/graphty-element';

  const recordBtn = document.getElementById('record-btn');
  const stopBtn = document.getElementById('stop-btn');
  const element = document.querySelector('graphty-element');

  let capturePromise = null;

  recordBtn.onclick = async () => {
    const graph = element.graph;

    recordBtn.disabled = true;
    stopBtn.disabled = false;

    capturePromise = graph.captureAnimation({
      duration: 30000,  // Max 30 seconds
      fps: 30
    });

    try {
      const blob = await capturePromise;
      downloadBlob(blob, 'recording.webm');
    } finally {
      recordBtn.disabled = false;
      stopBtn.disabled = true;
    }
  };

  stopBtn.onclick = () => {
    const graph = element.graph;
    graph.cancelAnimationCapture();
  };

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
</script>
```

## Interactive Examples

- [Screenshots](https://graphty-org.github.io/graphty-element/storybook/?path=/story/screenshot--image)
- [Video Capture](https://graphty-org.github.io/graphty-element/storybook/?path=/story/screenshot--video)
