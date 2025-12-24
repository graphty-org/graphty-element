[@graphty/graphty-element](../../index.md) / [managers](../index.md) / StatsManager

# Class: StatsManager

Defined in: [src/managers/StatsManager.ts:154](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L154)

Manages performance statistics and monitoring
Centralizes all performance tracking and reporting

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new StatsManager**(`eventManager`): `StatsManager`

Defined in: [src/managers/StatsManager.ts:193](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L193)

#### Parameters

##### eventManager

[`EventManager`](EventManager.md)

#### Returns

`StatsManager`

## Properties

### arrowCapUpdate

> **arrowCapUpdate**: `PerfCounter`

Defined in: [src/managers/StatsManager.ts:165](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L165)

***

### edgeUpdate

> **edgeUpdate**: `PerfCounter`

Defined in: [src/managers/StatsManager.ts:164](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L164)

***

### graphStep

> **graphStep**: `PerfCounter`

Defined in: [src/managers/StatsManager.ts:162](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L162)

***

### intersectCalc

> **intersectCalc**: `PerfCounter`

Defined in: [src/managers/StatsManager.ts:166](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L166)

***

### loadTime

> **loadTime**: `PerfCounter`

Defined in: [src/managers/StatsManager.ts:167](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L167)

***

### nodeUpdate

> **nodeUpdate**: `PerfCounter`

Defined in: [src/managers/StatsManager.ts:163](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L163)

***

### totalUpdates

> **totalUpdates**: `number` = `0`

Defined in: [src/managers/StatsManager.ts:168](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L168)

## Methods

### decrementCounter()

> **decrementCounter**(`label`, `amount`): `void`

Defined in: [src/managers/StatsManager.ts:1225](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L1225)

Decrement a counter by a specified amount

#### Parameters

##### label

`string`

Counter identifier

##### amount

`number` = `1`

Amount to decrement (default: 1)

#### Returns

`void`

***

### disableFrameProfiling()

> **disableFrameProfiling**(): `void`

Defined in: [src/managers/StatsManager.ts:483](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L483)

Disable frame-level blocking detection and clear data

#### Returns

`void`

***

### disableProfiling()

> **disableProfiling**(): `void`

Defined in: [src/managers/StatsManager.ts:445](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L445)

Disable detailed profiling and clear measurements

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/StatsManager.ts:202](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L202)

Dispose of all resources held by the manager

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### enableFrameProfiling()

> **enableFrameProfiling**(): `void`

Defined in: [src/managers/StatsManager.ts:457](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L457)

Enable frame-level blocking detection
This tracks operations within each frame and correlates them with inter-frame time
to identify which operations cause blocking overhead

#### Returns

`void`

***

### enableProfiling()

> **enableProfiling**(): `void`

Defined in: [src/managers/StatsManager.ts:438](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L438)

Enable detailed profiling

#### Returns

`void`

***

### endFrameProfiling()

> **endFrameProfiling**(): `void`

Defined in: [src/managers/StatsManager.ts:511](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L511)

End profiling for the current frame
Should be called at the end of each frame

#### Returns

`void`

***

### endLayoutSession()

> **endLayoutSession**(): `void`

Defined in: [src/managers/StatsManager.ts:868](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L868)

End tracking a layout session

#### Returns

`void`

***

### endMeasurement()

> **endMeasurement**(`label`): `void`

Defined in: [src/managers/StatsManager.ts:696](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L696)

End manual timing

#### Parameters

##### label

`string`

#### Returns

`void`

***

### getBlockingReport()

> **getBlockingReport**(): [`OperationBlockingStats`](../interfaces/OperationBlockingStats.md)[]

Defined in: [src/managers/StatsManager.ts:571](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L571)

Get blocking correlation report
Shows which operations appear most often in high-blocking frames

#### Returns

[`OperationBlockingStats`](../interfaces/OperationBlockingStats.md)[]

***

### getCounter()

> **getCounter**(`label`): `number`

Defined in: [src/managers/StatsManager.ts:1273](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L1273)

Get current value of a counter

#### Parameters

##### label

`string`

Counter identifier

#### Returns

`number`

Current counter value (0 if not found)

***

### getCountersSnapshot()

> **getCountersSnapshot**(): [`CounterSnapshot`](../interfaces/CounterSnapshot.md)[]

Defined in: [src/managers/StatsManager.ts:1316](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L1316)

Get snapshot of all counters

#### Returns

[`CounterSnapshot`](../interfaces/CounterSnapshot.md)[]

***

### getPerformanceSummary()

> **getPerformanceSummary**(): `object`

Defined in: [src/managers/StatsManager.ts:407](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L407)

Get performance summary

#### Returns

`object`

##### drawCalls

> **drawCalls**: `number`

##### fps

> **fps**: `number`

##### frameTime

> **frameTime**: `number`

##### gpuTime

> **gpuTime**: `number`

##### renderTime

> **renderTime**: `number`

***

### getSnapshot()

> **getSnapshot**(): [`PerformanceSnapshot`](../interfaces/PerformanceSnapshot.md)

Defined in: [src/managers/StatsManager.ts:791](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L791)

Get comprehensive performance snapshot

#### Returns

[`PerformanceSnapshot`](../interfaces/PerformanceSnapshot.md)

***

### getStats()

> **getStats**(): `object`

Defined in: [src/managers/StatsManager.ts:316](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L316)

Get current statistics

#### Returns

`object`

##### arrowCapUpdateCount

> **arrowCapUpdateCount**: `number`

##### edgeUpdateCount

> **edgeUpdateCount**: `number`

##### meshCacheHits

> **meshCacheHits**: `number`

##### meshCacheMisses

> **meshCacheMisses**: `number`

##### nodeUpdateCount

> **nodeUpdateCount**: `number`

##### numEdges

> **numEdges**: `number`

##### numNodes

> **numNodes**: `number`

##### totalUpdates

> **totalUpdates**: `number`

***

### incrementCounter()

> **incrementCounter**(`label`, `amount`): `void`

Defined in: [src/managers/StatsManager.ts:1201](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L1201)

Increment a counter by a specified amount

#### Parameters

##### label

`string`

Counter identifier

##### amount

`number` = `1`

Amount to increment (default: 1)

#### Returns

`void`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/StatsManager.ts:197](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L197)

Initialize the manager

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### initializeBabylonInstrumentation()

> **initializeBabylonInstrumentation**(`scene`, `engine`): `void`

Defined in: [src/managers/StatsManager.ts:228](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L228)

Initialize Babylon.js instrumentation
Should be called after scene and engine are created

#### Parameters

##### scene

`Scene`

##### engine

`Engine` | `WebGPUEngine`

#### Returns

`void`

***

### measure()

> **measure**\<`T`\>(`label`, `fn`): `T`

Defined in: [src/managers/StatsManager.ts:641](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L641)

Measure synchronous code execution

#### Type Parameters

##### T

`T`

#### Parameters

##### label

`string`

##### fn

() => `T`

#### Returns

`T`

***

### measureAsync()

> **measureAsync**\<`T`\>(`label`, `fn`): `Promise`\<`T`\>

Defined in: [src/managers/StatsManager.ts:663](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L663)

Measure async code execution

#### Type Parameters

##### T

`T`

#### Parameters

##### label

`string`

##### fn

() => `Promise`\<`T`\>

#### Returns

`Promise`\<`T`\>

***

### reportDetailed()

> **reportDetailed**(): `void`

Defined in: [src/managers/StatsManager.ts:930](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L930)

Report detailed performance data to console

#### Returns

`void`

***

### reset()

> **reset**(): `void`

Defined in: [src/managers/StatsManager.ts:295](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L295)

Reset all counters

#### Returns

`void`

***

### resetAllCounters()

> **resetAllCounters**(): `void`

Defined in: [src/managers/StatsManager.ts:1302](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L1302)

Reset all counters to 0

#### Returns

`void`

***

### resetCounter()

> **resetCounter**(`label`): `void`

Defined in: [src/managers/StatsManager.ts:1286](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L1286)

Reset a specific counter to 0

#### Parameters

##### label

`string`

Counter identifier

#### Returns

`void`

***

### resetMeasurements()

> **resetMeasurements**(): `void`

Defined in: [src/managers/StatsManager.ts:719](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L719)

Reset detailed measurements (keep BabylonJS instrumentation running)

#### Returns

`void`

***

### setCounter()

> **setCounter**(`label`, `value`): `void`

Defined in: [src/managers/StatsManager.ts:1249](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L1249)

Set a counter to a specific value

#### Parameters

##### label

`string`

Counter identifier

##### value

`number`

Value to set

#### Returns

`void`

***

### startFrameProfiling()

> **startFrameProfiling**(): `void`

Defined in: [src/managers/StatsManager.ts:498](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L498)

Start profiling a new frame
Should be called at the beginning of each frame

#### Returns

`void`

***

### startLayoutSession()

> **startLayoutSession**(): `void`

Defined in: [src/managers/StatsManager.ts:860](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L860)

Start tracking a layout session

#### Returns

`void`

***

### startMeasurement()

> **startMeasurement**(`label`): `void`

Defined in: [src/managers/StatsManager.ts:685](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L685)

Start manual timing

#### Parameters

##### label

`string`

#### Returns

`void`

***

### step()

> **step**(): `void`

Defined in: [src/managers/StatsManager.ts:280](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L280)

Increment update counter

#### Returns

`void`

***

### toString()

> **toString**(): `string`

Defined in: [src/managers/StatsManager.ts:341](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L341)

Generate a human-readable statistics report

#### Returns

`string`

***

### updateCacheStats()

> **updateCacheStats**(`hits`, `misses`): `void`

Defined in: [src/managers/StatsManager.ts:264](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L264)

Update cache statistics

#### Parameters

##### hits

`number`

##### misses

`number`

#### Returns

`void`

***

### updateCounts()

> **updateCounts**(`nodeCount`, `edgeCount`): `void`

Defined in: [src/managers/StatsManager.ts:272](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/managers/StatsManager.ts#L272)

Update node/edge counts

#### Parameters

##### nodeCount

`number`

##### edgeCount

`number`

#### Returns

`void`
