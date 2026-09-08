import { ABDField, ABDColumnRef, DataScheme } from "ab-data";
import type TableDef from "ab-data/ts-lib/TableDef.ts";
declare function createEspadaTableClass(scheme: DataScheme, packagePaths: Array<string>, tableDef: TableDef): void;
export default createEspadaTableClass;
export declare function getFieldType(field: ABDField): string;
export declare function getPHPStanType(scheme: DataScheme, field_: ABDField | ABDColumnRef): string;
