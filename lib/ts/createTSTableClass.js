import { ABDField, ABDFieldRef, DataScheme, abdFields as f,                      } from "ab-data";
                                                       
import abLog from "ab-log";
import fs from "fs";
import path from "path";
import abDataDefToTS from "./abDataDefToTS.js";

export function createTSTableClass(scheme            , libFSPath        , 
        tableDef          )       {
    createClass(scheme, libFSPath, tableDef);
}


function createClass(scheme            , libFSPath        , tableDef          )       {
    let content =
`import ts0, { type TS0RawArray, type TS0RawObject, type TS0RawValue } from "@allblue/ts0";

export type _TR${tableDef.name} = [`;

    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTSType(scheme, column.field);

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    for (let [ columnName, column ] of tableDef.columns_Extra) {
        let tsType = getTSType(scheme, column.field);

        content += `
    ${columnName}?: ${tsType},`
        ;
    }

    content += `
];
export const _p_TR${tableDef.name} = ts0.TPresetArray([`;

    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTS0Type(scheme, column.field);

        content += `
    ${tsType},`
        ;
    }

    content += `
]);

export type _TR${tableDef.name}_JSON = {`;

    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTSType(scheme, column.field);

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    for (let [ columnName, column ] of tableDef.columns_Extra) {
        let tsType = getTSType(scheme, column.field);

        content += `
    ${columnName}?: ${tsType},`
        ;
    }

    content += `
};
export const _p_TR${tableDef.name}_JSON = ts0.TPreset({`;

    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTS0Type(scheme, column.field);

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    content += `
});`;

    fs.writeFileSync(path.join(libFSPath, `$ab-data`, `$tables`, 
            `_T${tableDef.name}.ts`), content.replaceAll("\n", "\r\n"));
    abLog.success(`Saved: ${tableDef.name}.`);
}

export function getTSType(scheme            , field_                      )         {
    let field = scheme.parseField(field_);

    if (field instanceof f.ABDAutoIncrementId)
        return `number|null`;
    else if (field instanceof f.ABDBlob)
        return `string` + (field.notNull ? "" : "|null");
    else if (field instanceof f.ABDBool)
        return `boolean` + (field.notNull ? "" : "|null");
    else if (field instanceof f.ABDData) {
        return abDataDefToTS.parseType(scheme, field.dataDef, "    ", "skipAll");
    } else if (field instanceof f.ABDDate)
        return `number` + (field.notNull ? "" : "|null");
    else if (field instanceof f.ABDDateTime)
        return `number` + (field.notNull ? "" : "|null");
    // Double
    else if (field instanceof f.ABDFloat)
        return `number` + (field.notNull ? "" : "|null");
    else if (field instanceof f.ABDId)
        return `number` + (field.notNull ? "" : "|null");
    else if (field instanceof f.ABDInt)
        return `number` + (field.notNull ? "" : "|null");
    else if (field instanceof f.ABDJSON)
        return `TS0RawValue` + (field.notNull ? "" : "|null");
    else if (field instanceof f.ABDLong)
        return `number` + (field.notNull ? "" : "|null");
    // Object
    else if(field instanceof f.ABDString)
        return `string` + (field.notNull ? "" : "|null");
    else if (field instanceof f.ABDTime)
        return `number` + (field.notNull ? "" : "|null");
    else if(field instanceof f.ABDText)
        return `string` + (field.notNull ? "" : "|null");

    abLog.warn(`Unsupported field:`, field.getType());
    throw new Error('Unsupported field.');
}

export function getTS0Type(scheme            , field_                      )         {
    let field = scheme.parseField(field_);

    if (field instanceof f.ABDAutoIncrementId)
        return `[ "number", ts0.TNull ]`;
    else if (field instanceof f.ABDBlob)
        return field.notNull ? `"string"` : `["string", ts0.TNull]`;
    else if (field instanceof f.ABDBool)
        return field.notNull ? `"boolean"` : `["boolean", ts0.TNull]`;
    else if (field instanceof f.ABDData) {
        return field.notNull ? `ts0.TRawValue` : `[ts0.TRawValue, ts0.TNull]`;
    }
    else if (field instanceof f.ABDDate)
        return field.notNull ? `"number"` : `["number", ts0.TNull]`;
    else if (field instanceof f.ABDDateTime)
        return field.notNull ? `"number"` : `["number", ts0.TNull]`;
    // Double
    else if (field instanceof f.ABDFloat)
        return field.notNull ? `"number"` : `["number", ts0.TNull]`;
    else if (field instanceof f.ABDId)
        return field.notNull ? `"number"` : `["number", ts0.TNull]`;
    else if (field instanceof f.ABDInt)
        return field.notNull ? `"number"` : `["number", ts0.TNull]`;
    else if (field instanceof f.ABDJSON)
        return field.notNull ? `ts0.TRawValue` : `[ts0.TRawValue, ts0.TNull]`;
    else if (field instanceof f.ABDLong)
        return field.notNull ? `"number"` : `["number", ts0.TNull]`;
    // Object
    else if(field instanceof f.ABDString)
        return field.notNull ? `"string"` : `["string", ts0.TNull]`;
    else if (field instanceof f.ABDTime)
        return field.notNull ? `"number"` : `["number", ts0.TNull]`;
    else if(field instanceof f.ABDText)
        return field.notNull ? `"string"` : `["string", ts0.TNull]`;

    abLog.warn(`Unsupported field:`, field.getType());
    throw new Error('Unsupported field.');
}