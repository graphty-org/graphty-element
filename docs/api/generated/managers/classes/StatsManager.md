[@graphty/graphty-element](../../index.md) / [managers](../index.md) / StatsManager

# Class: StatsManager

Defined in: [src/managers/StatsManager.ts:154](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L154)

Manages performance statistics and monitoring
Centralizes all performance tracking and reporting

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new StatsManager**(`eventManager`): `StatsManager`

Defined in: [src/managers/StatsManager.ts:197](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L197)

Creates a new stats manager for performance tracking

#### Parameters

##### eventManager

[`EventManager`](EventManager.md)

Event manager for emitting stats events

#### Returns

`StatsManager`

## Properties

### arrowCapUpdate

> **arrowCapUpdate**: `PerfCounter`

Defined in: [src/managers/StatsManager.ts:165](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L165)

***

### edgeUpdate

> **edgeUpdate**: `PerfCounter`

Defined in: [src/managers/StatsManager.ts:164](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L164)

***

### graphStep

> **graphStep**: `PerfCounter`

Defined in: [src/managers/StatsManager.ts:162](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L162)

***

### intersectCalc

> **intersectCalc**: `PerfCounter`

Defined in: [src/managers/StatsManager.ts:166](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L166)

***

### loadTime

> **loadTime**: `PerfCounter`

Defined in: [src/managers/StatsManager.ts:167](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L167)

***

### nodeUpdate

> **nodeUpdate**: `PerfCounter`

Defined in: [src/managers/StatsManager.ts:163](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L163)

***

### totalUpdates

> **totalUpdates**: `number` = `0`

Defined in: [src/managers/StatsManager.ts:168](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L168)

## Methods

### decrementCounter()

> **decrementCounter**(`label`, `amount`): `void`

Defined in: [src/managers/StatsManager.ts:1266](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L1266)

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

Defined in: [src/managers/StatsManager.ts:505](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L505)

Disable frame-level blocking detection and clear data

#### Returns

`void`

***

### disableProfiling()

> **disableProfiling**(): `void`

Defined in: [src/managers/StatsManager.ts:467](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L467)

Disable detailed profiling and clear measurements

#### Returns

`void`

***

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/StatsManager.ts:213](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L213)

Dispose the stats manager and clean up instrumentation

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### enableFrameProfiling()

> **enableFrameProfiling**(): `void`

Defined in: [src/managers/StatsManager.ts:479](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L479)

Enable frame-level blocking detection
This tracks operations within each frame and correlates them with inter-frame time
to identify which operations cause blocking overhead

#### Returns

`void`

***

### enableProfiling()

> **enableProfiling**(): `void`

Defined in: [src/managers/StatsManager.ts:460](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L460)

Enable detailed profiling

#### Returns

`void`

***

### endFrameProfiling()

> **endFrameProfiling**(): `void`

Defined in: [src/managers/StatsManager.ts:533](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L533)

End profiling for the current frame
Should be called at the end of each frame

#### Returns

`void`

***

### endLayoutSession()

> **endLayoutSession**(): `void`

Defined in: [src/managers/StatsManager.ts:908](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L908)

End tracking a layout session

#### Returns

`void`

***

### endMeasurement()

> **endMeasurement**(`label`): `void`

Defined in: [src/managers/StatsManager.ts:728](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L728)

End manual timing

#### Parameters

##### label

`string`

Label for this measurement (must match startMeasurement)

#### Returns

`void`

***

### getBlockingReport()

> **getBlockingReport**(): [`OperationBlockingStats`](../interfaces/OperationBlockingStats.md)[]

Defined in: [src/managers/StatsManager.ts:595](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L595)

Get blocking correlation report
Shows which operations appear most often in high-blocking frames

#### Returns

[`OperationBlockingStats`](../interfaces/OperationBlockingStats.md)[]

Array of operation statistics sorted by blocking correlation

***

### getCounter()

> **getCounter**(`label`): `number`

Defined in: [src/managers/StatsManager.ts:1314](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L1314)

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

Defined in: [src/managers/StatsManager.ts:1358](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L1358)

Get snapshot of all counters

#### Returns

[`CounterSnapshot`](../interfaces/CounterSnapshot.md)[]

Array of counter snapshots

***

### getPerformanceSummary()

> **getPerformanceSummary**(): `object`

Defined in: [src/managers/StatsManager.ts:429](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L429)

Get performance summary

#### Returns

`object`

Summary of key performance metrics

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

Defined in: [src/managers/StatsManager.ts:831](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L831)

Get comprehensive performance snapshot

#### Returns

[`PerformanceSnapshot`](../interfaces/PerformanceSnapshot.md)

Complete performance data including CPU, GPU, and scene metrics

***

### getStats()

> **getStats**(): `object`

Defined in: [src/managers/StatsManager.ts:336](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L336)

Get current statistics

#### Returns

`object`

Current graph statistics including counts and performance metrics

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

Defined in: [src/managers/StatsManager.ts:1242](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L1242)

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

Defined in: [src/managers/StatsManager.ts:205](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L205)

Initialize the stats manager

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### initializeBabylonInstrumentation()

> **initializeBabylonInstrumentation**(`scene`, `engine`): `void`

Defined in: [src/managers/StatsManager.ts:241](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L241)

Initialize Babylon.js instrumentation
Should be called after scene and engine are created

#### Parameters

##### scene

`Scene`

The Babylon.js scene

##### engine

The Babylon.js engine (Engine or WebGPUEngine)

`Engine` | `WebGPUEngine`

#### Returns

`void`

***

### measure()

> **measure**\<`T`\>(`label`, `fn`): `T`

Defined in: [src/managers/StatsManager.ts:668](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L668)

Measure synchronous code execution

#### Type Parameters

##### T

`T`

#### Parameters

##### label

`string`

Label for this measurement

##### fn

() => `T`

Function to measure

#### Returns

`T`

The return value of fn

***

### measureAsync()

> **measureAsync**\<`T`\>(`label`, `fn`): `Promise`\<`T`\>

Defined in: [src/managers/StatsManager.ts:693](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L693)

Measure async code execution

#### Type Parameters

##### T

`T`

#### Parameters

##### label

`string`

Label for this measurement

##### fn

() => `Promise`\<`T`\>

Async function to measure

#### Returns

`Promise`\<`T`\>

Promise resolving to the return value of fn

***

### reportDetailed()

> **reportDetailed**(): `void`

Defined in: [src/managers/StatsManager.ts:971](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L971)

Report detailed performance data to console

#### Returns

`void`

***

### reset()

> **reset**(): `void`

Defined in: [src/managers/StatsManager.ts:314](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L314)

Reset all counters

#### Returns

`void`

***

### resetAllCounters()

> **resetAllCounters**(): `void`

Defined in: [src/managers/StatsManager.ts:1343](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L1343)

Reset all counters to 0

#### Returns

`void`

***

### resetCounter()

> **resetCounter**(`label`): `void`

Defined in: [src/managers/StatsManager.ts:1327](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L1327)

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

Defined in: [src/managers/StatsManager.ts:751](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L751)

Reset detailed measurements (keep BabylonJS instrumentation running)

#### Returns

`void`

***

### setCounter()

> **setCounter**(`label`, `value`): `void`

Defined in: [src/managers/StatsManager.ts:1290](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L1290)

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

Defined in: [src/managers/StatsManager.ts:520](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L520)

Start profiling a new frame
Should be called at the beginning of each frame

#### Returns

`void`

***

### startLayoutSession()

> **startLayoutSession**(): `void`

Defined in: [src/managers/StatsManager.ts:900](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L900)

Start tracking a layout session

#### Returns

`void`

***

### startMeasurement()

> **startMeasurement**(`label`): `void`

Defined in: [src/managers/StatsManager.ts:716](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L716)

Start manual timing

#### Parameters

##### label

`string`

Label for this measurement

#### Returns

`void`

***

### step()

> **step**(): `void`

Defined in: [src/managers/StatsManager.ts:299](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L299)

Increment update counter

#### Returns

`void`

***

### toString()

> **toString**(): `string`

Defined in: [src/managers/StatsManager.ts:362](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L362)

Generate a human-readable statistics report

#### Returns

`string`

Formatted string with all statistics

***

### updateCacheStats()

> **updateCacheStats**(`hits`, `misses`): `void`

Defined in: [src/managers/StatsManager.ts:281](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L281)

Update cache statistics

#### Parameters

##### hits

`number`

Number of cache hits

##### misses

`number`

Number of cache misses

#### Returns

`void`

***

### updateCounts()

> **updateCounts**(`nodeCount`, `edgeCount`): `void`

Defined in: [src/managers/StatsManager.ts:291](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/StatsManager.ts#L291)

Update node/edge counts

#### Parameters

##### nodeCount

`number`

Current number of nodes

##### edgeCount

`number`

Current number of edges

#### Returns

`void`
