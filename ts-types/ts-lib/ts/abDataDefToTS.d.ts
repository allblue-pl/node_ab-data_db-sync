import { ABDataDefArrayPresetType, ABDataDefArrayType, ABDataDefObjectPresetType, ABDataDefObjectType, ABDataDefTableRowType, ABDataDefTableVariantRowType, DataScheme, type ABDataDefPreset, type ABDataDefValueType } from "ab-data";
import { ABDataDefEnumType, ABDataDefJoinType, ABDataDefRequestArgsType, ABDataDefRequestResultType, ABDataDefTypeType } from "ab-data/ts-lib/abDataDefTypes.ts";
export declare class abDataDefToTS_Class {
    constructor();
    parseArray(scheme: DataScheme | null, typesArr: Array<ABDataDefValueType>, offset: string, final: FinalType): string;
    parsePreset(scheme: DataScheme | null, presets: ABDataDefPreset, offset: string, final: FinalType): string;
    parseType(scheme: DataScheme | null, type: ABDataDefValueType, offset: string, final: FinalType): string;
    parseType_ABDataDefArrayType(scheme: DataScheme | null, type: ABDataDefArrayType, offset: string, final: FinalType): string;
    parseType_ABDataDefArrayPresetType(scheme: DataScheme | null, type: ABDataDefArrayPresetType, offset: string, final: FinalType): string;
    parseType_ABDataDefEnumType(scheme: DataScheme | null, type: ABDataDefEnumType, offset: string, final: FinalType): string;
    parseType_ABDataDefJoinType(scheme: DataScheme | null, type: ABDataDefJoinType, offset: string, final: FinalType): string;
    parseType_ABDataDefObjectType(scheme: DataScheme | null, type: ABDataDefObjectType, offset: string, final: FinalType): string;
    parseType_ABDataDefObjectPresetType(scheme: DataScheme | null, type: ABDataDefObjectPresetType, offset: string, final: FinalType): string;
    parseType_ABDataDefRequestArgsType(scheme: DataScheme | null, type: ABDataDefRequestArgsType, offset: string, final: FinalType): string;
    parseType_ABDataDefRequestResultType(scheme: DataScheme | null, type: ABDataDefRequestResultType, offset: string, final: FinalType): string;
    parseType_ABDataDefTableRowType(scheme: DataScheme | null, type: ABDataDefTableRowType, offset: string, final: FinalType): string;
    parseType_ABDataDefTableVariantRowType(scheme: DataScheme | null, type: ABDataDefTableVariantRowType, offset: string, final: FinalType): string;
    parseType_ABDataDefTypeType(scheme: DataScheme | null, type: ABDataDefTypeType, offset: string, final: FinalType): string;
}
declare const abDataDefToTS: abDataDefToTS_Class;
export default abDataDefToTS;
type FinalType = "skipOne" | "skipAll" | "noSkip";
