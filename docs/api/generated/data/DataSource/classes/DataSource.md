[@graphty/graphty-element](../../../index.md) / [data/DataSource](../index.md) / DataSource

# Abstract Class: DataSource

Defined in: [src/data/DataSource.ts:23](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/data/DataSource.ts#L23)

## Constructors

### Constructor

> **new DataSource**(`errorLimit`, `chunkSize`): `DataSource`

Defined in: [src/data/DataSource.ts:32](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/data/DataSource.ts#L32)

#### Parameters

##### errorLimit

`number` = `100`

##### chunkSize

`number` = `DataSource.DEFAULT_CHUNK_SIZE`

#### Returns

`DataSource`

## Properties

### DEFAULT\_CHUNK\_SIZE

> `readonly` `static` **DEFAULT\_CHUNK\_SIZE**: `1000` = `1000`

Defined in: [src/data/DataSource.ts:25](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/data/DataSource.ts#L25)

***

### edgeSchema

> **edgeSchema**: `$ZodObject`\<`Readonly`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>\>, `$ZodObjectConfig`\> \| `null` = `null`

Defined in: [src/data/DataSource.ts:27](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/data/DataSource.ts#L27)

***

### nodeSchema

> **nodeSchema**: `$ZodObject`\<`Readonly`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>\>, `$ZodObjectConfig`\> \| `null` = `null`

Defined in: [src/data/DataSource.ts:28](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/data/DataSource.ts#L28)

***

### type

> `readonly` `static` **type**: `string`

Defined in: [src/data/DataSource.ts:24](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/data/DataSource.ts#L24)

## Accessors

### type

#### Get Signature

> **get** **type**(): `string`

Defined in: [src/data/DataSource.ts:248](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/data/DataSource.ts#L248)

##### Returns

`string`

## Methods

### dataValidator()

> **dataValidator**(`schema`, `obj`): `Promise`\<`boolean`\>

Defined in: [src/data/DataSource.ts:231](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/data/DataSource.ts#L231)

Validate data against schema
Returns false if validation fails (and adds error to aggregator)
Returns true if validation succeeds

#### Parameters

##### schema

`$ZodObject`

##### obj

`object`

#### Returns

`Promise`\<`boolean`\>

***

### get()

> `static` **get**(`type`, `opts`): `DataSource` \| `null`

Defined in: [src/data/DataSource.ts:259](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/data/DataSource.ts#L259)

#### Parameters

##### type

`string`

##### opts

`object` = `{}`

#### Returns

`DataSource` \| `null`

***

### getData()

> **getData**(): `AsyncGenerator`\<[`DataSourceChunk`](../interfaces/DataSourceChunk.md), `void`, `unknown`\>

Defined in: [src/data/DataSource.ts:185](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/data/DataSource.ts#L185)

#### Returns

`AsyncGenerator`\<[`DataSourceChunk`](../interfaces/DataSourceChunk.md), `void`, `unknown`\>

***

### getErrorAggregator()

> **getErrorAggregator**(): `ErrorAggregator`

Defined in: [src/data/DataSource.ts:181](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/data/DataSource.ts#L181)

Get the error aggregator for this data source

#### Returns

`ErrorAggregator`

***

### register()

> `static` **register**\<`T`\>(`cls`): `T`

Defined in: [src/data/DataSource.ts:252](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/data/DataSource.ts#L252)

#### Type Parameters

##### T

`T` *extends* `DataSourceClass`

#### Parameters

##### cls

`T`

#### Returns

`T`

***

### sourceFetchData()

> `abstract` **sourceFetchData**(): `AsyncGenerator`\<[`DataSourceChunk`](../interfaces/DataSourceChunk.md), `void`, `unknown`\>

Defined in: [src/data/DataSource.ts:38](https://github.com/graphty-org/graphty-element/blob/c034ecab4c84a40f5a8a7d05e28d58c492b693ae/src/data/DataSource.ts#L38)

#### Returns

`AsyncGenerator`\<[`DataSourceChunk`](../interfaces/DataSourceChunk.md), `void`, `unknown`\>
