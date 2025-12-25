[@graphty/graphty-element](../../../index.md) / [data/DataSource](../index.md) / DataSource

# Abstract Class: DataSource

Defined in: [src/data/DataSource.ts:27](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/data/DataSource.ts#L27)

Base class for all data source implementations that load graph data from various formats.
Provides common functionality for validation, chunking, error handling, and data fetching.

## Constructors

### Constructor

> **new DataSource**(`errorLimit`, `chunkSize`): `DataSource`

Defined in: [src/data/DataSource.ts:41](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/data/DataSource.ts#L41)

Creates a new DataSource instance.

#### Parameters

##### errorLimit

`number` = `100`

Maximum number of errors before stopping data processing

##### chunkSize

`number` = `DataSource.DEFAULT_CHUNK_SIZE`

Number of nodes to process per chunk

#### Returns

`DataSource`

## Properties

### DEFAULT\_CHUNK\_SIZE

> `readonly` `static` **DEFAULT\_CHUNK\_SIZE**: `1000` = `1000`

Defined in: [src/data/DataSource.ts:29](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/data/DataSource.ts#L29)

***

### edgeSchema

> **edgeSchema**: `$ZodObject`\<`Readonly`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>\>, `$ZodObjectConfig`\> \| `null` = `null`

Defined in: [src/data/DataSource.ts:31](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/data/DataSource.ts#L31)

***

### nodeSchema

> **nodeSchema**: `$ZodObject`\<`Readonly`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>\>, `$ZodObjectConfig`\> \| `null` = `null`

Defined in: [src/data/DataSource.ts:32](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/data/DataSource.ts#L32)

***

### type

> `readonly` `static` **type**: `string`

Defined in: [src/data/DataSource.ts:28](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/data/DataSource.ts#L28)

## Accessors

### type

#### Get Signature

> **get** **type**(): `string`

Defined in: [src/data/DataSource.ts:279](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/data/DataSource.ts#L279)

Gets the type identifier for this data source instance.

##### Returns

`string`

The type string identifier

## Methods

### dataValidator()

> **dataValidator**(`schema`, `obj`): `Promise`\<`boolean`\>

Defined in: [src/data/DataSource.ts:258](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/data/DataSource.ts#L258)

Validate data against schema
Returns false if validation fails (and adds error to aggregator)
Returns true if validation succeeds

#### Parameters

##### schema

`$ZodObject`

Zod schema to validate against

##### obj

`object`

Data object to validate

#### Returns

`Promise`\<`boolean`\>

Promise resolving to true if validation succeeds, false otherwise

***

### get()

> `static` **get**(`type`, `opts`): `DataSource` \| `null`

Defined in: [src/data/DataSource.ts:301](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/data/DataSource.ts#L301)

Creates a data source instance by type name.

#### Parameters

##### type

`string`

The registered type identifier

##### opts

`object` = `{}`

Configuration options for the data source

#### Returns

`DataSource` \| `null`

A new data source instance or null if type not found

***

### getData()

> **getData**(): `AsyncGenerator`\<[`DataSourceChunk`](../interfaces/DataSourceChunk.md), `void`, `unknown`\>

Defined in: [src/data/DataSource.ts:209](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/data/DataSource.ts#L209)

Fetches, validates, and yields graph data in chunks.
Filters out invalid nodes and edges based on schema validation.

#### Returns

`AsyncGenerator`\<[`DataSourceChunk`](../interfaces/DataSourceChunk.md), `void`, `unknown`\>

#### Yields

DataSourceChunk objects containing validated nodes and edges

***

### getErrorAggregator()

> **getErrorAggregator**(): `ErrorAggregator`

Defined in: [src/data/DataSource.ts:200](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/data/DataSource.ts#L200)

Get the error aggregator for this data source

#### Returns

`ErrorAggregator`

The ErrorAggregator instance tracking validation errors

***

### getRegisteredTypes()

> `static` **getRegisteredTypes**(): `string`[]

Defined in: [src/data/DataSource.ts:321](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/data/DataSource.ts#L321)

Get all registered data source types.

#### Returns

`string`[]

Array of registered data source type names

#### Since

1.5.0

#### Example

```typescript
const types = DataSource.getRegisteredTypes();
console.log('Available data sources:', types);
// ['csv', 'gexf', 'gml', 'graphml', 'json', 'pajek']
```

***

### register()

> `static` **register**\<`T`\>(`cls`): `T`

Defined in: [src/data/DataSource.ts:288](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/data/DataSource.ts#L288)

Registers a data source class with the registry.

#### Type Parameters

##### T

`T` *extends* `DataSourceClass`

#### Parameters

##### cls

`T`

The data source class to register

#### Returns

`T`

The registered class for chaining

***

### sourceFetchData()

> `abstract` **sourceFetchData**(): `AsyncGenerator`\<[`DataSourceChunk`](../interfaces/DataSourceChunk.md), `void`, `unknown`\>

Defined in: [src/data/DataSource.ts:47](https://github.com/graphty-org/graphty-element/blob/6dd6599f381a9a5f736999394f4e9ca8e436e9b3/src/data/DataSource.ts#L47)

#### Returns

`AsyncGenerator`\<[`DataSourceChunk`](../interfaces/DataSourceChunk.md), `void`, `unknown`\>
