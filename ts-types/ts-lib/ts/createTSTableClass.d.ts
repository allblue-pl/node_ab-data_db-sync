import { ABDField, ABDFieldRef, DataScheme } from "ab-data";
import type TableDef from "ab-data/ts-lib/TableDef.ts";
export declare function createTSTableClass(scheme: DataScheme, libFSPath: string, tableDef: TableDef): void;
export declare function getTSType(scheme: DataScheme, field_: ABDField | ABDFieldRef): string;
export declare function getTS0Type(scheme: DataScheme, field_: ABDField | ABDFieldRef): string;
