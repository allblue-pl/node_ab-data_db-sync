import { ABDataDefArrayPresetType, ABDataDefArrayType, ABDataDefObjectPresetType, ABDataDefObjectType, ABDataDefTableRowType, DataScheme, type ABDataDefPreset, type ABDataDefValueType } from "ab-data";
import { ABDataDefRequestArgsType, ABDataDefRequestResultType } from "ab-data/ts-lib/abDataDefTypes.ts";
export declare class abDataDefToPHPStan_Class {
    constructor();
    parseArray(scheme: DataScheme, typesArr: Array<ABDataDefValueType>, offset: string, tableNames: Array<string>): string;
    parsePreset(scheme: DataScheme, presets: ABDataDefPreset, offset: string, tableNames: Array<string>): string;
    parseType(scheme: DataScheme, type: ABDataDefValueType, offset: string, tableNames: Array<string>): string;
    parseType_ABDataDefArrayType(scheme: DataScheme, type: ABDataDefArrayType, offset: string, tableNames: Array<string>): string;
    parseType_ABDataDefArrayPresetType(scheme: DataScheme, type: ABDataDefArrayPresetType, offset: string, tableNames: Array<string>): string;
    parseType_ABDataDefObjectType(scheme: DataScheme, type: ABDataDefObjectType, offset: string, tableNames: Array<string>): string;
    parseType_ABDataDefObjectPresetType(scheme: DataScheme, type: ABDataDefObjectPresetType, offset: string, tableNames: Array<string>): string;
    parseType_ABDataDefRequestArgsType(scheme: DataScheme, type: ABDataDefRequestArgsType, offset: string, tableNames: Array<string>): string;
    parseType_ABDataDefRequestResultType(scheme: DataScheme, type: ABDataDefRequestResultType, offset: string, tableNames: Array<string>): string;
    parseType_ABDataDefTableRowType(scheme: DataScheme, type: ABDataDefTableRowType, tableNames: Array<string>): string;
}
declare const abDataDefToPHPStan: abDataDefToPHPStan_Class;
export default abDataDefToPHPStan;
