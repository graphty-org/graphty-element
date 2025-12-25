[@graphty/graphty-element](../../index.md) / [managers](../index.md) / AlgorithmManager

# Class: AlgorithmManager

Defined in: [src/managers/AlgorithmManager.ts:11](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/AlgorithmManager.ts#L11)

Manages algorithm execution and coordination
Handles running algorithms from templates and individual algorithm execution

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new AlgorithmManager**(`eventManager`, `graph`): `AlgorithmManager`

Defined in: [src/managers/AlgorithmManager.ts:17](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/AlgorithmManager.ts#L17)

Creates an instance of AlgorithmManager

#### Parameters

##### eventManager

[`EventManager`](EventManager.md)

Event manager for emitting algorithm events

##### graph

[`Graph`](../../Graph/classes/Graph.md)

Graph instance to run algorithms on

#### Returns

`AlgorithmManager`

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/AlgorithmManager.ts:34](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/AlgorithmManager.ts#L34)

Disposes of the algorithm manager and cleans up resources

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### getAvailableAlgorithms()

> **getAvailableAlgorithms**(): `string`[]

Defined in: [src/managers/AlgorithmManager.ts:150](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/AlgorithmManager.ts#L150)

Get list of available algorithms
TODO: This depends on the Algorithm registry implementation

#### Returns

`string`[]

Array of available algorithm names

***

### hasAlgorithm()

> **hasAlgorithm**(`namespace`, `type`): `boolean`

Defined in: [src/managers/AlgorithmManager.ts:136](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/AlgorithmManager.ts#L136)

Check if an algorithm exists

#### Parameters

##### namespace

`string`

Algorithm namespace

##### type

`string`

Algorithm type

#### Returns

`boolean`

True if the algorithm exists, false otherwise

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/AlgorithmManager.ts:26](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/AlgorithmManager.ts#L26)

Initializes the algorithm manager

#### Returns

`Promise`\<`void`\>

Promise that resolves when initialization is complete

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### runAlgorithm()

> **runAlgorithm**(`namespace`, `type`, `algorithmOptions?`): `Promise`\<`void`\>

Defined in: [src/managers/AlgorithmManager.ts:90](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/AlgorithmManager.ts#L90)

Run a specific algorithm by namespace and type

#### Parameters

##### namespace

`string`

Algorithm namespace (e.g., "graphty")

##### type

`string`

Algorithm type (e.g., "dijkstra")

##### algorithmOptions?

`AlgorithmSpecificOptions`

Optional algorithm-specific options (source, target, etc.)

#### Returns

`Promise`\<`void`\>

***

### runAlgorithmsFromTemplate()

> **runAlgorithmsFromTemplate**(`algorithms`): `Promise`\<`void`\>

Defined in: [src/managers/AlgorithmManager.ts:43](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/managers/AlgorithmManager.ts#L43)

Run algorithms specified in the template configuration
Called during initialization if runAlgorithmsOnLoad is true

#### Parameters

##### algorithms

`string`[]

Array of algorithm names in "namespace:type" format

#### Returns

`Promise`\<`void`\>
