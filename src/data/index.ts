import {CSVDataSource} from "./CSVDataSource";
import {DataSource} from "./DataSource";
import {DOTDataSource} from "./DOTDataSource";
import {ErrorAggregator} from "./ErrorAggregator";
import {GEXFDataSource} from "./GEXFDataSource";
import {GMLDataSource} from "./GMLDataSource";
import {GraphMLDataSource} from "./GraphMLDataSource";
import {JsonDataSource} from "./JsonDataSource";
import {PajekDataSource} from "./PajekDataSource";

DataSource.register(JsonDataSource);
DataSource.register(GraphMLDataSource);
DataSource.register(CSVDataSource);
DataSource.register(GMLDataSource);
DataSource.register(GEXFDataSource);
DataSource.register(DOTDataSource);
DataSource.register(PajekDataSource);

export {ErrorAggregator};
export type {DataLoadingError, ErrorSummary} from "./ErrorAggregator";
