import { ABDataDefArrayPresetType, ABDataDefArrayType, ABDataDefObjectPresetType, ABDataDefObjectType, ABDataDefTableRowType, ABDataDefTableVariantRowType, DataScheme, type ABDataDefPreset, type ABDataDefValueType } from "ab-data";
import { ABDataDefEnumType, ABDataDefJoinType, ABDataDefRequestArgsType, ABDataDefRequestResultType, ABDataDefTypeType } from "ab-data/ts-lib/abDataDefTypes.ts";
export declare class abDataDefToPHPStan_Class {
    constructor();
    parseArray(scheme: DataScheme | null, typesArr: Array<ABDataDefValueType>, offset: string): string;
    parsePreset(scheme: DataScheme | null, presets: ABDataDefPreset, offset: string): string;
    parseType(scheme: DataScheme | null, type: ABDataDefValueType, offset: string): string;
    parseType_ABDataDefArrayType(scheme: DataScheme | null, type: ABDataDefArrayType, offset: string): string;
    parseType_ABDataDefArrayPresetType(scheme: DataScheme | null, type: ABDataDefArrayPresetType, offset: string): string;
    parseType_ABDataDefEnumType(scheme: DataScheme | null, type: ABDataDefEnumType, offset: string): string;
    parseType_ABDataDefJoinType(scheme: DataScheme | null, type: ABDataDefJoinType, offset: string): string;
    parseType_ABDataDefObjectType(scheme: DataScheme | null, type: ABDataDefObjectType, offset: string): string;
    parseType_ABDataDefObjectPresetType(scheme: DataScheme | null, type: ABDataDefObjectPresetType, offset: string): string;
    parseType_ABDataDefRequestArgsType(scheme: DataScheme | null, type: ABDataDefRequestArgsType, offset: string): string;
    parseType_ABDataDefRequestResultType(scheme: DataScheme | null, type: ABDataDefRequestResultType, offset: string): string;
    parseType_ABDataDefTableRowType(scheme: DataScheme | null, type: ABDataDefTableRowType, offset: string): string;
    parseType_ABDataDefTableVariantRowType(scheme: DataScheme | null, type: ABDataDefTableVariantRowType, offset: string): string;
    parseType_ABDataDefTypeType(scheme: DataScheme | null, type: ABDataDefTypeType, offset: string): string;
}
declare const abDataDefToPHPStan: abDataDefToPHPStan_Class;
export default abDataDefToPHPStan;
