import type { TableDef, TableDefVariant } from "ab-data";
export declare function findPackage(packagePaths: Array<string>, eTable: ETable | ETableVariant): string | null;
export declare function getETable(tableDef: TableDef): ETable;
export declare function getETableVariant(tableDefVariant: TableDefVariant): ETableVariant;
export type ETable = {
    packageName: string;
    fullName: string;
    name: string;
    table: TableDef;
};
export type ETableVariant = {
    packageName: string;
    fullName: string;
    name: string;
    tableVariant: TableDefVariant;
};
