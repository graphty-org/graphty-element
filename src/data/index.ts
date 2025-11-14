import {CSVDataSource} from "./CSVDataSource";
import {DataSource} from "./DataSource";
import {DOTDataSource} from "./DOTDataSource";
import {GEXFDataSource} from "./GEXFDataSource";
import {GMLDataSource} from "./GMLDataSource";
import {GraphMLDataSource} from "./GraphMLDataSource";
import {JsonDataSource} from "./JsonDataSource";

DataSource.register(JsonDataSource);
DataSource.register(GraphMLDataSource);
DataSource.register(CSVDataSource);
DataSource.register(GMLDataSource);
DataSource.register(GEXFDataSource);
DataSource.register(DOTDataSource);
