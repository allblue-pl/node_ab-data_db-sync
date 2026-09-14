import {ts0Assert } from "@allblue/ts0";
import { ABDataDefArrayPresetType, ABDataDefArrayType, ABDataDefEnumType, ABDataDefJoinType, ABDataDefMapType, ABDataDefObjectPresetType, ABDataDefObjectType, ABDataDefRequestArgsType, ABDataDefRequestResultType, ABDataDefTableRowType, ABDataDefTableVariantRowType, ABDataDefTypeType, DataScheme, abDataDefTypes as t,                                               } from "ab-data";
import { getTSType } from "./createTSTableClass.js";

export class abDataDefToTS_Class {
    constructor() {
        
    }

    parseArray(scheme                 , typesArr                           , 
            offset        , final           )         {
        let typeStrs = [];

        for (let type of typesArr) {
            typeStrs.push(this.parseType(scheme, type, offset, 
                    final === "skipAll" ? "skipAll" : "noSkip"));
        }

        return typeStrs.join("|") + (final === "noSkip" ? "|ABDRequestResult" : "");
    }

    parsePreset(scheme                 , presets                 , offset        , 
            final           )         {
        let content = "";

        for (let name in presets) {
            content += offset + `${name}: ` + this.parseType(scheme, presets[name], 
                    offset, final === "skipAll" ? "skipAll" : "noSkip") + ",\n";
        }

        return content;
    }

    parseType(scheme                 , type                    , offset        , 
            final           )         {
        if (type === null)
            return "any" + (final === "noSkip" ? "|ABDRequestResult" : "");
        if (type === t.TNull)
            return "null" + (final === "noSkip" ? "|ABDRequestResult" : "");

        if (typeof type === "object") {
            if (type instanceof Array)
                return this.parseArray(scheme, type, offset, final);

            if (type instanceof ABDataDefArrayType)
                return this.parseType_ABDataDefArrayType(scheme, type, offset, final);
            if (type instanceof ABDataDefArrayPresetType)
                return this.parseType_ABDataDefArrayPresetType(scheme, type, offset, final);
            if (type instanceof ABDataDefEnumType)
                return this.parseType_ABDataDefEnumType(scheme, type, offset, final);
            if (type instanceof ABDataDefJoinType)
                return this.parseType_ABDataDefJoinType(scheme, type, offset, final);
            if (type instanceof ABDataDefMapType)
                return this.parseType_ABDataDefMapType(scheme, type, offset, final);
            if (type instanceof ABDataDefObjectType)
                return this.parseType_ABDataDefObjectType(scheme, type, offset, final);
            if (type instanceof ABDataDefObjectPresetType)
                return this.parseType_ABDataDefObjectPresetType(scheme, type, offset, final);
            if (type instanceof ABDataDefRequestArgsType)
                return this.parseType_ABDataDefRequestArgsType(scheme, type, offset, final);
            if (type instanceof ABDataDefRequestResultType)
                return this.parseType_ABDataDefRequestResultType(scheme, type, offset, final);
            if (type instanceof ABDataDefTableRowType)
                return this.parseType_ABDataDefTableRowType(scheme, type, offset, final);
            if (type instanceof ABDataDefTableVariantRowType)
                return this.parseType_ABDataDefTableVariantRowType(scheme, type, offset, final);
            if (type instanceof ABDataDefTypeType)
                return this.parseType_ABDataDefTypeType(scheme, type, offset, final);
        }

        if (type === "bool")
            return "boolean" + (final === "noSkip" ? "|ABDRequestResult" : "");
        if (type === "float")
            return "number" + (final === "noSkip" ? "|ABDRequestResult" : "");
        if (type === "string")
            return "string" + (final === "noSkip" ? "|ABDRequestResult" : "");
        if (type === "long")
            return "number" + (final === "noSkip" ? "|ABDRequestResult" : "");
        if (type === "int")
            return "number" + (final === "noSkip" ? "|ABDRequestResult" : "");

        console.error("Unknown type:", type);
        ts0Assert(false, `Unknown type: ` + String(type));
    }


    parseType_ABDataDefArrayType(scheme                 , type                    , 
            offset        , final           )         {
        return "Array<" + this.parseType(scheme, type.itemType, offset,
                final === "skipAll" ? "skipAll" : "noSkip") + 
                ">" + (final === "noSkip" ? "|ABDRequestResult" : "");
    }

    parseType_ABDataDefArrayPresetType(scheme                 , 
            type                          , offset        , 
            final           )         {
        let typeStrs = [];
        for (let itemType of type.presets) {
            typeStrs.push(this.parseType(scheme, itemType, offset,
                    final === "skipAll" ? "skipAll" : "noSkip"));
        }

        return "Array<" + typeStrs.join(",") + ">" + (final === "noSkip" ? "|ABDRequestResult" : "");
    }

    parseType_ABDataDefEnumType(scheme                 , type                   , 
            offset        , final           )         {
        let parsedValues = [];
        for (let value of type.values) {
            if (value === null)
                parsedValues.push(`null`);
            else if (typeof value === "boolean")
                parsedValues.push(value ? "true" : "false");
            else if (typeof value === "number")
                parsedValues.push(`${value}`);
            else if (typeof value === "string")
                parsedValues.push(`"${value}"`);
            else {
                console.error("Unknown enum value type:", value);
                ts0Assert(false, "Unknown enum value type: " + value);
            }
        }

        return parsedValues.join("|") + (final === "noSkip" ? "|ABDRequestResult" : "");
    }

    parseType_ABDataDefJoinType(scheme                 , 
            type                   , offset        , 
            final           )         {
        let content = `{`;
        let keys                = [];
        for (let joinInfo of type.joinInfos) {
            let prefix = joinInfo[0];
            let def = joinInfo[1];

            if (def instanceof ABDataDefObjectPresetType) {
                for (let keyName in def.presets) {
                    if (keys.includes(`${prefix}${keyName}`))
                        continue;
                    if (joinInfo[2] !== undefined) {
                        if (!joinInfo[2].includes(keyName))
                            continue;
                    }
                    keys.push(`${prefix}${keyName}`);

                    content += offset + `${prefix}${keyName}: ` + this.parseType(
                            scheme, def.presets[keyName], offset, 
                            final === "skipAll" ? "skipAll" : "noSkip") + ",\n";
                }
            } else if (def instanceof ABDataDefTableRowType) {
                ts0Assert(scheme !== null, "Table Row Type not supported in this definition.");

                let tableDef = scheme.getTableDef(def.tableName);
                for (let [ columnName, column ] of tableDef.columns) {
                    if (keys.includes(`${prefix}${columnName}`))
                        continue;
                    if (joinInfo[2] !== undefined) {
                        if (!joinInfo[2].includes(columnName))
                            continue;
                    }
                    keys.push(`${prefix}${columnName}`);

                    content += `\n${offset}    ${prefix}${columnName}: ` + 
                            getTSType(scheme, column.field, "select");
                }
            } else if (def instanceof ABDataDefTableVariantRowType) {
                ts0Assert(scheme !== null, "Table Variant Row Type not supported in this definition.");

                let tableDefVariant = scheme.getTableDefVariant(def.tableVariantName);
                for (let [ columnName, field ] of tableDefVariant.columns) {
                    if (keys.includes(`${prefix}${columnName}`))
                        continue;
                    if (joinInfo[2] !== undefined) {
                        if (!joinInfo[2].includes(columnName))
                            continue;
                    }
                    keys.push(`${prefix}${columnName}`);

                    content += `\n${offset}    ${prefix}${columnName}: ` + 
                            getTSType(scheme, field, "select");
                }
            } else {
                if (prefix === "")
                    throw new Error("Prefix cannot be empty for this type of data.");
                content += `\n${offset}    ${prefix}: ` + this.parseType(scheme,
                        def, "", final);
            }
        }

        if (type.extras !== null) {
            content += "[key: " + this.parseType(scheme, type.extras.keyType, offset, 
                    final === "skipAll" ? "skipAll" : "noSkip") + "]: " + 
                    this.parseType(scheme, type.extras.itemType, offset, 
                    final === "skipAll" ? "skipAll" : "noSkip") + "\n";
        }

        content += `\n${offset}}` + (final === "noSkip" ? "|ABDRequestResult" : "");

        return content;
    }

    parseType_ABDataDefMapType(scheme                 , type                  , 
            offset        , final           )         {
        return "Map<" + this.parseType(scheme, type.keyType, offset,
                "skipAll") + "," + this.parseType(scheme, type.itemType, offset,
                final === "skipAll" ? "skipAll" : "noSkip") + 
                ">"  + (final === "noSkip" ? "|ABDRequestResult" : "");
    }

    parseType_ABDataDefObjectType(scheme                 , type                     , 
            offset        , final           )         {
        return "{[key: " + this.parseType(scheme, type.keyType, offset,
                "skipAll") + "]: " +
                this.parseType(scheme, type.itemType, offset,
                final === "skipAll" ? "skipAll" : "noSkip") + 
                "}"  + (final === "noSkip" ? "|ABDRequestResult" : "");
    }

    parseType_ABDataDefObjectPresetType(scheme                 , 
            type                           , offset        , 
            final           )         {
        let content = "{\n";
        content += this.parsePreset(scheme, type.presets, offset + "    ", 
                final === "skipAll" ? "skipAll" : "noSkip");

        if (type.extras !== null) {
            content += "[key: " + this.parseType(scheme, type.extras.keyType, offset, 
                    final === "skipAll" ? "skipAll" : "noSkip") + "]: " + 
                    this.parseType(scheme, type.extras.itemType, offset, 
                    final === "skipAll" ? "skipAll" : "noSkip") + "\n";
        }

        content += offset + "}" + (final === "noSkip" ? "|ABDRequestResult" : "");

        return content;
    }

    parseType_ABDataDefRequestArgsType(scheme                 , 
            type                          , offset        , 
            final           )         {
        ts0Assert(scheme !== null, "Request Args Type not supported in this definition.");

        let action = scheme.getRequestDef(type.requestName).getActionDef(
                type.actionName);
        let tObjectPreset = new ABDataDefObjectPresetType(action.argsDef);
        return this.parseType(scheme, tObjectPreset, offset,
                final === "skipAll" ? "skipAll" : "noSkip") +
                (final === "noSkip" ? "|ABDRequestResult" : "");
    }

    parseType_ABDataDefRequestResultType(scheme                 , 
            type                            , offset        ,
            final           )         {
        ts0Assert(scheme !== null, "Request Result Type not supported in this definition.");

        let action = scheme.getRequestDef(type.requestName).getActionDef(
                type.actionName);

        let tDataType;
        if (type.resultType === "success")
            tDataType = new ABDataDefObjectPresetType(action.successDef);
        else if (type.resultType === "failure")
            tDataType = new ABDataDefObjectPresetType(action.failureDef);
        else {
            tDataType = [ new ABDataDefObjectPresetType(action.successDef),
                    new ABDataDefObjectPresetType(action.failureDef), ];
        }
                
        return this.parseType(scheme, tDataType, offset,
                final === "skipAll" ? "skipAll" : "noSkip") +
                (final === "noSkip" ? "|ABDRequestResult" : "");
    }

    parseType_ABDataDefTableRowType(scheme                 , 
            type                       , offset        ,
            final           )         {
        ts0Assert(scheme !== null, "Table Row Type not supported in this definition");

        let tableDef = scheme.getTableDef(type.tableName);
        let def = `{`;
        for (let [ columnName, column ] of tableDef.columns) {
            def += `\n${offset}    ${columnName}: ` + getTSType(scheme, column.field, 
                    type.type, offset) + ",";
        }
        def += `\n${offset}}` + (final === "noSkip" ? "|ABDRequestResult" : "");

        return def;
    }

    parseType_ABDataDefTableVariantRowType(scheme                 , 
            type                              , offset        ,
            final           )         {
        ts0Assert(scheme !== null, "Table Row Type not supported in this definition");

        let tableVariantDef = scheme.getTableDefVariant(type.tableVariantName);
        let def = `{`;
        for (let [ columnName, field ] of tableVariantDef.columns)
            def += `\n${offset}    ${columnName}: ` + getTSType(scheme, field, "select") + ",";
        def += `\n${offset}}` + (final === "noSkip" ? "|ABDRequestResult" : "");

        return def;
    }

    parseType_ABDataDefTypeType(scheme                 , 
            type                   , offset        ,
            final           )         {
        ts0Assert(scheme !== null, "Table Row Type not supported in this definition");

        return this.parseType(scheme, scheme.getTypeInfo(type.typeName).def,
                offset, final);
    }
}
const abDataDefToTS = new abDataDefToTS_Class();
export default abDataDefToTS;

                                              