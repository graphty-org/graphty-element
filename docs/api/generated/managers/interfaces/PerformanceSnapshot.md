[@graphty/graphty-element](../../index.md) / [managers](../index.md) / PerformanceSnapshot

# Interface: PerformanceSnapshot

Defined in: [src/managers/StatsManager.ts:120](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L120)

Performance snapshot including CPU, GPU, and scene metrics

## Properties

### cpu

> **cpu**: `object`[]

Defined in: [src/managers/StatsManager.ts:121](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L121)

#### avg

> **avg**: `number`

#### count

> **count**: `number`

#### label

> **label**: `string`

#### lastDuration

> **lastDuration**: `number`

#### max

> **max**: `number`

#### min

> **min**: `number`

#### p50

> **p50**: `number`

#### p95

> **p95**: `number`

#### p99

> **p99**: `number`

#### total

> **total**: `number`

***

### gpu?

> `optional` **gpu**: `object`

Defined in: [src/managers/StatsManager.ts:133](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L133)

#### gpuFrameTime

> **gpuFrameTime**: `PerfCounterSnapshot`

#### shaderCompilation

> **shaderCompilation**: `PerfCounterSnapshot`

***

### layoutSession?

> `optional` **layoutSession**: [`LayoutSessionMetrics`](LayoutSessionMetrics.md)

Defined in: [src/managers/StatsManager.ts:146](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L146)

***

### scene?

> `optional` **scene**: `object`

Defined in: [src/managers/StatsManager.ts:137](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L137)

#### activeMeshesEvaluation

> **activeMeshesEvaluation**: `PerfCounterSnapshot`

#### cameraRenderTime

> **cameraRenderTime**: `PerfCounterSnapshot`

#### drawCalls

> **drawCalls**: `DrawCallsSnapshot`

#### frameTime

> **frameTime**: `PerfCounterSnapshot`

#### interFrameTime

> **interFrameTime**: `PerfCounterSnapshot`

#### renderTargetsRenderTime

> **renderTargetsRenderTime**: `PerfCounterSnapshot`

#### renderTime

> **renderTime**: `PerfCounterSnapshot`

***

### timestamp

> **timestamp**: `number`

Defined in: [src/managers/StatsManager.ts:147](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L147)
