import type { TableDef } from "ab-data";
export declare function findPackage(packagePaths: Array<string>, eTable: ETable): string | null;
export declare function getETable(tableDef: TableDef): ETable;
export type ETable = {
    packageName: string;
    fullName: string;
    name: string;
    table: TableDef;
};
