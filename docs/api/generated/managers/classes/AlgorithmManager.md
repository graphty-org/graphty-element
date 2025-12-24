[@graphty/graphty-element](../../index.md) / [managers](../index.md) / AlgorithmManager

# Class: AlgorithmManager

Defined in: [src/managers/AlgorithmManager.ts:11](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/AlgorithmManager.ts#L11)

Manages algorithm execution and coordination
Handles running algorithms from templates and individual algorithm execution

## Implements

- [`Manager`](../interfaces/Manager.md)

## Constructors

### Constructor

> **new AlgorithmManager**(`eventManager`, `graph`): `AlgorithmManager`

Defined in: [src/managers/AlgorithmManager.ts:12](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/AlgorithmManager.ts#L12)

#### Parameters

##### eventManager

[`EventManager`](EventManager.md)

##### graph

[`Graph`](../../Graph/classes/Graph.md)

#### Returns

`AlgorithmManager`

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [src/managers/AlgorithmManager.ts:22](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/AlgorithmManager.ts#L22)

Dispose of all resources held by the manager

#### Returns

`void`

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`dispose`](../interfaces/Manager.md#dispose)

***

### getAvailableAlgorithms()

> **getAvailableAlgorithms**(): `string`[]

Defined in: [src/managers/AlgorithmManager.ts:133](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/AlgorithmManager.ts#L133)

Get list of available algorithms
TODO: This depends on the Algorithm registry implementation

#### Returns

`string`[]

***

### hasAlgorithm()

> **hasAlgorithm**(`namespace`, `type`): `boolean`

Defined in: [src/managers/AlgorithmManager.ts:120](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/AlgorithmManager.ts#L120)

Check if an algorithm exists

#### Parameters

##### namespace

`string`

##### type

`string`

#### Returns

`boolean`

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [src/managers/AlgorithmManager.ts:17](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/AlgorithmManager.ts#L17)

Initialize the manager

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Manager`](../interfaces/Manager.md).[`init`](../interfaces/Manager.md#init)

***

### runAlgorithm()

> **runAlgorithm**(`namespace`, `type`, `algorithmOptions?`): `Promise`\<`void`\>

Defined in: [src/managers/AlgorithmManager.ts:77](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/AlgorithmManager.ts#L77)

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

Defined in: [src/managers/AlgorithmManager.ts:30](https://github.com/graphty-org/graphty-element/blob/07816b360bd8412887d7c4b5a434daa458f40608/src/managers/AlgorithmManager.ts#L30)

Run algorithms specified in the template configuration
Called during initialization if runAlgorithmsOnLoad is true

#### Parameters

##### algorithms

`string`[]

#### Returns

`Promise`\<`void`\>
