import { ts0Assert } from "@allblue/ts0";
import { ABDataDefArrayPresetType, ABDataDefArrayType, ABDataDefObjectPresetType, ABDataDefObjectType, ABDataDefTableRowType, ABDataDefTableVariantRowType, DataScheme,                                               } from "ab-data";
import { abDataDefTypes as t } from "ab-data";
import { ABDataDefEnumType, ABDataDefJoinType, ABDataDefRequestArgsType, ABDataDefRequestResultType, ABDataDefTypeType } from "ab-data/lib/abDataDefTypes.js";
import { getPHPStanType } from "./createEspadaTableClass.js";
import { throws } from "assert";

export class abDataDefToPHPStan_Class {
    constructor() {
        
    }

    parseArray(scheme                 , typesArr                           , 
            offset        )         {
        let typeStrs = [];

        for (let type of typesArr)
            typeStrs.push(this.parseType(scheme, type, offset));

        return typeStrs.join("|");
    }

    parsePreset(scheme                 , presets                 , offset        )         {
        let content = "";

        for (let name in presets) {
            content += offset + `${name}: ` + this.parseType(scheme, presets[name], 
                    offset) + ",\n";
        }

        return content
    }

    parseType(scheme                 , type                    , offset        )  
                   {
        if (type === null)
            return "mixed";
        if (type === t.TNull)
            return "null";

        if (typeof type === "object") {
            if (type instanceof Array)
                return this.parseArray(scheme, type, offset);

            if (type instanceof ABDataDefArrayType)
                return this.parseType_ABDataDefArrayType(scheme, type, offset);
            if (type instanceof ABDataDefArrayPresetType)
                return this.parseType_ABDataDefArrayPresetType(scheme, type, offset);
            if (type instanceof ABDataDefEnumType)
                return this.parseType_ABDataDefEnumType(scheme, type, offset);
            if (type instanceof ABDataDefJoinType)
                return this.parseType_ABDataDefJoinType(scheme, type, offset);
            if (type instanceof ABDataDefObjectType)
                return this.parseType_ABDataDefObjectType(scheme, type, offset);
            if (type instanceof ABDataDefObjectPresetType)
                return this.parseType_ABDataDefObjectPresetType(scheme, type, offset);
            if (type instanceof ABDataDefRequestArgsType)
                return this.parseType_ABDataDefRequestArgsType(scheme, type, offset);
            if (type instanceof ABDataDefRequestResultType)
                return this.parseType_ABDataDefRequestResultType(scheme, type, offset);
            if (type instanceof ABDataDefTableRowType)
                return this.parseType_ABDataDefTableRowType(scheme, type, offset);
            if (type instanceof ABDataDefTableVariantRowType)
                return this.parseType_ABDataDefTableVariantRowType(scheme, type, offset);
            if (type instanceof ABDataDefTypeType)
                return this.parseType_ABDataDefTypeType(scheme, type, offset);
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

        console.error("Unknown type:", type);
        ts0Assert(false, `Unknown type: ` + String(type));
    }


    parseType_ABDataDefArrayType(scheme                 , type                    , 
            offset        )         {
        return "list<" + this.parseType(scheme, type.itemType, offset) + ">";
    }

    parseType_ABDataDefArrayPresetType(scheme                 , 
            type                          , offset        )         {
        let typeStrs = [];
        for (let itemType of type.presets)
            typeStrs.push(this.parseType(scheme, itemType, offset));

        return "list{" + typeStrs.join(",") + "}";
    }

    parseType_ABDataDefEnumType(scheme                 , type                   , 
            offset        )         {
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

        return parsedValues.join("|");
    }

    parseType_ABDataDefJoinType(scheme                 , 
            type                   , offset        )         {
        let content = `array{`;
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
                            scheme, def.presets[keyName], offset) + ",\n";
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
                            getPHPStanType(scheme, column.field, "select") + ",";
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
                            getPHPStanType(scheme, field, "select") + ",";
                }
            } else {
                if (prefix === "")
                    throw new Error("Prefix cannot be empty for this type of data.");
                content += `\n${offset}    ${prefix}: ` + this.parseType(scheme,
                        def, "");
            }
        }

        if (type.extras !== null) {
            content += " ...<" + this.parseType(scheme, type.extras.keyType, offset) + 
                    ", " + this.parseType(scheme, type.extras.itemType, offset) + 
                    ">\n";
        }

        content += `\n${offset}}`;

        return content;
    }

    parseType_ABDataDefObjectType(scheme                 , type                     , 
            offset        )         {
        return "array<" + this.parseType(scheme, type.keyType, offset) + ", " +
                this.parseType(scheme, type.itemType, offset) + ">";
    }

    parseType_ABDataDefObjectPresetType(scheme                 , 
            type                           , offset        )         {
        let content = "array{\n";
        content += this.parsePreset(scheme, type.presets, offset + "    ");

        if (type.extras !== null) {
            content += "...<" + this.parseType(scheme, type.extras.keyType, offset) + ", " + this.parseType(scheme, 
                    type.extras.itemType, offset) + ">\n";
        }

        content += offset  + "}";

        return content;
    }

    parseType_ABDataDefRequestArgsType(scheme                 , 
            type                          , offset        )         {
        if (scheme === null)
            throw new Error("'RequestArgsType' not supported in this definition.");

        let action = scheme.getRequestDef(type.requestName).getActionDef(
                type.actionName);
        let tObjectPreset = new ABDataDefObjectPresetType(action.argsDef);
                
        return this.parseType(scheme, tObjectPreset, offset)
    }

    parseType_ABDataDefRequestResultType(scheme                 , 
            type                            , offset        )         {
        if (scheme === null)
            throw new Error("'RequestResultType' not supported in this definition.");

        let action = scheme.getRequestDef(type.requestName).getActionDef(
                type.actionName);
        let tDataType;
        if (type.resultType === "success")
            tDataType = new ABDataDefObjectPresetType(action.successDef);
        else if (type.resultType === "failure")
            tDataType = new ABDataDefObjectPresetType(action.failureDef);
        else {
            tDataType = [ new ABDataDefObjectPresetType(action.successDef), 
                new ABDataDefObjectPresetType(action.failureDef) ];
        }
        return this.parseType(scheme, tDataType, offset)
    }

    parseType_ABDataDefTableRowType(scheme                 ,
            type                       , offset        )         {
        ts0Assert(scheme !== null, "Table Row Type not supported in this definition");

        let tableDef = scheme.getTableDef(type.tableName);
        let def = `array{`;
        for (let [ columnName, column ] of tableDef.columns) {
            def += `\n${offset}    ${columnName}: ` + getPHPStanType(scheme, 
                    column.field, type.type) + ",";
        }
        def += `\n${offset}}`;

        return def;

        // if (!tableNames.includes(type.tableName))
        //     tableNames.push(type.tableName);

        // return `_T_R${type.tableName}`;
    }

    parseType_ABDataDefTableVariantRowType(scheme                 ,
            type                              , offset        )         {
        ts0Assert(scheme !== null, "Table Variant Row Type not supported in this definition");

        let tableDefVariant = scheme.getTableDefVariant(type.tableVariantName);
        let def = `array{`;
        for (let [ columnName, field ] of tableDefVariant.columns) {
            def += `\n${offset}    ${columnName}: ` + getPHPStanType(scheme, 
                    field, "select") + ",";
        }
        def += `\n${offset}}`;

        return def;

        // if (!tableNames.includes(type.tableName))
        //     tableNames.push(type.tableName);

        // return `_T_R${type.tableName}`;
    }

    parseType_ABDataDefTypeType(scheme                 , 
            type                   , offset        )         {
        ts0Assert(scheme !== null, "Table Row Type not supported in this definition");

        return this.parseType(scheme, scheme.getTypeInfo(type.typeName).def,
                offset);
    }
}
const abDataDefToPHPStan = new abDataDefToPHPStan_Class();
export default abDataDefToPHPStan;

