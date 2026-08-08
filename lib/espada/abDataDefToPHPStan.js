import { ts0Assert } from "@allblue/ts0";
import { ABDataDefArrayPresetType, ABDataDefArrayType, ABDataDefObjectPresetType, ABDataDefObjectType, ABDataDefTableRowType, DataScheme,                                               } from "ab-data";
import { abDataDefTypes as t } from "ab-data";
import { ABDataDefRequestArgsType, ABDataDefRequestResultType } from "ab-data/lib/abDataDefTypes.js";

export class abDataDefToPHPStan_Class {
    constructor() {
        
    }

    parseArray(scheme            , typesArr                           , 
            offset        , tableNames               )         {
        let typeStrs = [];

        for (let type of typesArr)
            typeStrs.push(this.parseType(scheme, type, offset, tableNames));

        return typeStrs.join("|");
    }

    parsePreset(scheme            , presets                 , offset        , 
            tableNames               )         {
        let content = "";

        for (let name in presets) {
            content += offset + `${name}: ` + this.parseType(scheme, presets[name], 
                    offset, tableNames) + ",\r\n";
        }

        return content
    }

    parseType(scheme            , type                    , offset        , tableNames               )  
                   {
        if (type === null)
            return "mixed";
        if (type === t.TNull)
            return "null";

        if (typeof type === "object") {
            if (type instanceof Array)
                return this.parseArray(scheme, type, offset, tableNames);

            if (type instanceof ABDataDefArrayType)
                return this.parseType_ABDataDefArrayType(scheme, type, offset, tableNames);
            if (type instanceof ABDataDefArrayPresetType)
                return this.parseType_ABDataDefArrayPresetType(scheme, type, offset, tableNames);
            if (type instanceof ABDataDefObjectType)
                return this.parseType_ABDataDefObjectType(scheme, type, offset, tableNames);
            if (type instanceof ABDataDefObjectPresetType)
                return this.parseType_ABDataDefObjectPresetType(scheme, type, offset, tableNames);
            if (type instanceof ABDataDefRequestArgsType)
                return this.parseType_ABDataDefRequestArgsType(scheme, type, offset, tableNames);
            if (type instanceof ABDataDefRequestResultType)
                return this.parseType_ABDataDefRequestResultType(scheme, type, offset, tableNames);
            if (type instanceof ABDataDefTableRowType)
                return this.parseType_ABDataDefTableRowType(scheme, type, tableNames);
        }

        if (type === "bool")
            return "boolean";
        if (type === "float")
            return "float";
        if (type === "string")
            return "string";
        if (type === "long")
            return "float";
        if (type === "int")
            return "int";

        ts0Assert(false, `Unknown type: ` + String(type));
    }


    parseType_ABDataDefArrayType(scheme            , type                    , 
            offset        , tableNames               )         {
        return "array<" + this.parseType(scheme, type.itemType, offset, tableNames) + ">";
    }

    parseType_ABDataDefArrayPresetType(scheme            , 
            type                          , offset        , 
            tableNames               )         {
        let typeStrs = [];
        for (let itemType of type.presets)
            typeStrs.push(this.parseType(scheme, itemType, offset, tableNames));

        return "list{" + typeStrs.join(",") + "}";
    }

    parseType_ABDataDefObjectType(scheme            , type                     , 
            offset        , tableNames               )         {
        return "array{...<" + this.parseType(scheme, type.keyType, offset, tableNames) + ", " +
                this.parseType(scheme, type.itemType, offset, tableNames) + ">}";
    }

    parseType_ABDataDefObjectPresetType(scheme            , 
            type                           , offset        , 
            tableNames               )         {
        let content = "array{\r\n";
        content += this.parsePreset(scheme, type.presets, offset + "    ", tableNames);

        if (type.extras !== null) {
            content += "...<" + this.parseType(scheme, type.extras.keyType, offset, 
                    tableNames) + ", " + this.parseType(scheme, 
                    type.extras.itemType, offset, tableNames) + ">\r\n";
        }

        content += offset  + "}";

        return content;
    }

    parseType_ABDataDefRequestArgsType(scheme            , 
            type                          , offset        , 
            tableNames               )         {
        let tObjectPreset = new ABDataDefObjectPresetType(scheme.getRequestDef(
                type.requestName).getActionDef(type.actionName).resultDef);
        return this.parseType(scheme, tObjectPreset, offset, tableNames)
    }

    parseType_ABDataDefRequestResultType(scheme            , 
            type                            , offset        ,
            tableNames               )         {
        let tObjectPreset = new ABDataDefObjectPresetType(scheme.getRequestDef(
                type.requestName).getActionDef(type.actionName).resultDef);
        return this.parseType(scheme, tObjectPreset, offset, tableNames)
    }

    parseType_ABDataDefTableRowType(scheme            , 
            type                       , tableNames               )         {
        if (!tableNames.includes(type.tableName))
            tableNames.push(type.tableName);

        return `_T_R${type.tableName}`;
    }
}
const abDataDefToPHPStan = new abDataDefToPHPStan_Class();
export default abDataDefToPHPStan;

