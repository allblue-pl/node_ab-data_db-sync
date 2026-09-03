import { ABDField, ABDFieldRef, DataScheme, TableDefVariant } from "ab-data";
export declare function createTSTableVariantClass(scheme: DataScheme, libFSPath: string, tableDefVariant: TableDefVariant): void;
export declare function getTSType(scheme: DataScheme, field_: ABDField | ABDFieldRef): string;
export declare function getTS0Type(scheme: DataScheme, field_: ABDField | ABDFieldRef): string;
