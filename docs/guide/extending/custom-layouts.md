# Custom Layouts

Guide to creating custom layout algorithms.

## Overview

Graphty's layout system is extensible. Create custom layouts for specialized graph structures or unique positioning requirements.

## LayoutEngine Interface

All layouts extend the abstract `LayoutEngine` class:

```typescript
abstract class LayoutEngine {
  static type: string;

  abstract initialize(nodes: Node[], edges: Edge[]): void;
  abstract step(): boolean; // Returns true when settled
  abstract getPosition(nodeId: string): Vector3;
}
```

## Creating a Custom Layout

### Basic Example

```typescript
import { LayoutEngine, Node, Edge, Vector3 } from '@graphty/graphty-element';

class MyLayout extends LayoutEngine {
  static type = 'my-layout';

  private positions: Map<string, Vector3> = new Map();

  initialize(nodes: Node[], edges: Edge[]): void {
    // Set up initial positions
    nodes.forEach((node, index) => {
      this.positions.set(node.id, {
        x: index * 10,
        y: 0,
        z: 0
      });
    });
  }

  step(): boolean {
    // Perform one iteration of layout algorithm
    // Return true when layout is stable
    return true; // Immediately settled for static layouts
  }

  getPosition(nodeId: string): Vector3 {
    return this.positions.get(nodeId) || { x: 0, y: 0, z: 0 };
  }
}

// Register the layout
LayoutEngine.register(MyLayout);
```

### Using Your Layout

```typescript
graph.setLayout('my-layout');
```

## Complete Example: Spiral Layout

```typescript
import { LayoutEngine, Node, Edge, Vector3 } from '@graphty/graphty-element';

class SpiralLayout extends LayoutEngine {
  static type = 'spiral';

  private positions: Map<string, Vector3> = new Map();
  private options: SpiralOptions;

  constructor(options: Partial<SpiralOptions> = {}) {
    super();
    this.options = {
      radiusStep: 2,
      angleStep: 0.5,
      heightStep: 1,
      ...options
    };
  }

  initialize(nodes: Node[], edges: Edge[]): void {
    let angle = 0;
    let radius = 0;
    let height = 0;

    nodes.forEach((node) => {
      this.positions.set(node.id, {
        x: radius * Math.cos(angle),
        y: height,
        z: radius * Math.sin(angle)
      });

      angle += this.options.angleStep;
      radius += this.options.radiusStep;
      height += this.options.heightStep;
    });
  }

  step(): boolean {
    // Static layout - immediately settled
    return true;
  }

  getPosition(nodeId: string): Vector3 {
    return this.positions.get(nodeId) || { x: 0, y: 0, z: 0 };
  }
}

interface SpiralOptions {
  radiusStep: number;
  angleStep: number;
  heightStep: number;
}

LayoutEngine.register(SpiralLayout);
```

Usage:

```typescript
graph.setLayout('spiral', {
  radiusStep: 3,
  angleStep: 0.3,
  heightStep: 0.5
});
```

## Force-Directed Layout Example

For iterative layouts that converge over time:

```typescript
import { LayoutEngine, Node, Edge, Vector3 } from '@graphty/graphty-element';

class SimpleForceLayout extends LayoutEngine {
  static type = 'simple-force';

  private nodes: Node[] = [];
  private edges: Edge[] = [];
  private positions: Map<string, Vector3> = new Map();
  private velocities: Map<string, Vector3> = new Map();

  private repulsion = 100;
  private attraction = 0.01;
  private damping = 0.9;
  private threshold = 0.1;

  initialize(nodes: Node[], edges: Edge[]): void {
    this.nodes = nodes;
    this.edges = edges;

    // Random initial positions
    nodes.forEach((node) => {
      this.positions.set(node.id, {
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 100,
        z: (Math.random() - 0.5) * 100
      });
      this.velocities.set(node.id, { x: 0, y: 0, z: 0 });
    });
  }

  step(): boolean {
    let maxVelocity = 0;

    // Calculate forces
    this.nodes.forEach((node) => {
      const pos = this.positions.get(node.id)!;
      const vel = this.velocities.get(node.id)!;
      const force = { x: 0, y: 0, z: 0 };

      // Repulsion from other nodes
      this.nodes.forEach((other) => {
        if (other.id === node.id) return;
        const otherPos = this.positions.get(other.id)!;

        const dx = pos.x - otherPos.x;
        const dy = pos.y - otherPos.y;
        const dz = pos.z - otherPos.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) || 0.1;

        const f = this.repulsion / (dist * dist);
        force.x += (dx / dist) * f;
        force.y += (dy / dist) * f;
        force.z += (dz / dist) * f;
      });

      // Attraction along edges
      this.edges.forEach((edge) => {
        let otherId: string | null = null;
        if (edge.source === node.id) otherId = edge.target as string;
        if (edge.target === node.id) otherId = edge.source as string;
        if (!otherId) return;

        const otherPos = this.positions.get(otherId);
        if (!otherPos) return;

        const dx = otherPos.x - pos.x;
        const dy = otherPos.y - pos.y;
        const dz = otherPos.z - pos.z;

        force.x += dx * this.attraction;
        force.y += dy * this.attraction;
        force.z += dz * this.attraction;
      });

      // Update velocity
      vel.x = (vel.x + force.x) * this.damping;
      vel.y = (vel.y + force.y) * this.damping;
      vel.z = (vel.z + force.z) * this.damping;

      // Update position
      pos.x += vel.x;
      pos.y += vel.y;
      pos.z += vel.z;

      const speed = Math.sqrt(vel.x*vel.x + vel.y*vel.y + vel.z*vel.z);
      maxVelocity = Math.max(maxVelocity, speed);
    });

    // Return true when settled
    return maxVelocity < this.threshold;
  }

  getPosition(nodeId: string): Vector3 {
    return this.positions.get(nodeId) || { x: 0, y: 0, z: 0 };
  }
}

LayoutEngine.register(SimpleForceLayout);
```

## Layout Configuration

Accept configuration options in the constructor:

```typescript
class ConfigurableLayout extends LayoutEngine {
  static type = 'configurable';

  private config: LayoutConfig;

  constructor(options: Partial<LayoutConfig> = {}) {
    super();
    this.config = {
      spacing: 10,
      direction: 'horizontal',
      ...options
    };
  }

  // ... implementation
}

interface LayoutConfig {
  spacing: number;
  direction: 'horizontal' | 'vertical';
}
```

Usage:

```typescript
graph.setLayout('configurable', {
  spacing: 20,
  direction: 'vertical'
});
```

## 2D vs 3D Layouts

Check dimensions in your layout:

```typescript
class FlexibleLayout extends LayoutEngine {
  static type = 'flexible';

  private dimensions: 2 | 3 = 3;

  constructor(options: { dimensions?: 2 | 3 } = {}) {
    super();
    this.dimensions = options.dimensions || 3;
  }

  initialize(nodes: Node[], edges: Edge[]): void {
    nodes.forEach((node, i) => {
      if (this.dimensions === 2) {
        this.positions.set(node.id, { x: i * 10, y: 0, z: 0 });
      } else {
        this.positions.set(node.id, {
          x: i * 10,
          y: Math.random() * 10,
          z: Math.random() * 10
        });
      }
    });
  }
}
```

## Performance Tips

1. **Use spatial indexing**: For large graphs, use quadtrees (2D) or octrees (3D)
2. **Batch updates**: Update all positions before returning from `step()`
3. **Early exit**: Return `true` from `step()` as soon as layout is stable
4. **Avoid allocations**: Reuse objects instead of creating new ones each step

```typescript
// Good: reuse force object
private force = { x: 0, y: 0, z: 0 };

step(): boolean {
  this.force.x = 0;
  this.force.y = 0;
  this.force.z = 0;
  // ... calculate forces
}

// Bad: create new object each time
step(): boolean {
  const force = { x: 0, y: 0, z: 0 }; // Allocation every frame!
}
```

## Debugging Layouts

Log layout progress:

```typescript
step(): boolean {
  this.iterationCount++;

  if (this.iterationCount % 100 === 0) {
    console.log(`Layout iteration ${this.iterationCount}`);
  }

  // ...
}
```
