import { ABDField, ABDColumnRef, DataScheme, abdFields as f, TableDefVariant, type ABDataDefPreset } from "ab-data";
import type TableDef from "ab-data/ts-lib/TableDef.ts";
import abLog from "ab-log";
import fs from "fs";
import path from "path";
import abDataDefToTS from "./abDataDefToTS.ts";
import { getTS0Type, getTSType } from "./createTSTableClass.ts";

export function createTSTableVariantClass(scheme: DataScheme, libFSPath: string, 
        tableDefVariant: TableDefVariant): void {
    createClass(scheme, libFSPath, tableDefVariant);
}


function createClass(scheme: DataScheme, libFSPath: string, tableDefVariant: TableDefVariant): void {
    let content =
`import ts0, { type TS0RawArray, type TS0RawObject, type TS0RawValue } from "@allblue/ts0";

export type _TVR${tableDefVariant.name}_Arr = [`;

    for (let [ columnName, field ] of tableDefVariant.columns) {
        let tsType = getTSType(scheme, field, "select");

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    for (let [ columnName, field ] of tableDefVariant.columns_Extra) {
        let tsType = getTSType(scheme, field, "select");

        content += `
    ${columnName}?: ${tsType},`
        ;
    }

    content += `
];
export const _p_TVR${tableDefVariant.name}_Arr = ts0.TPresetArray([`;

    for (let [ columnName, field ] of tableDefVariant.columns) {
        let tsType = getTS0Type(scheme, field, "select");

        content += `
    ${tsType},`
        ;
    }

    content += `
]);

export type _TVR${tableDefVariant.name} = {`;

    for (let [ columnName, field ] of tableDefVariant.columns) {
        let tsType = getTSType(scheme, field, "select");

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    for (let [ columnName, field ] of tableDefVariant.columns_Extra) {
        let tsType = getTSType(scheme, field, "select");

        content += `
    ${columnName}?: ${tsType},`
        ;
    }

    content += `
};
export const _p_TVR${tableDefVariant.name} = ts0.TPreset({`;

    for (let [ columnName, field ] of tableDefVariant.columns) {
        let tsType = getTS0Type(scheme, field, "select");

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    content += `
});`;

    fs.writeFileSync(path.join(libFSPath, `$ab-data`, `$table-variants`, 
            `_T${tableDefVariant.name}.ts`), content.replaceAll("\n", "\r\n"));
    // abLog.success(`Saved: ${tableDefVariant.name}.`);
}

// export function getTSType(scheme: DataScheme, field_: ABDField|ABDColumnRef): string {
//     let field = scheme.parseField(field_);

//     if (field instanceof f.ABDAutoIncrementId)
//         return `number|null`;
//     else if (field instanceof f.ABDBlob)
//         return `string` + (field.notNull ? "" : "|null");
//     else if (field instanceof f.ABDBool)
//         return `boolean` + (field.notNull ? "" : "|null");
//     else if (field instanceof f.ABDData) {
//         return abDataDefToTS.parseType(scheme, field.dataDef, "    ", "skipAll");
//     } else if (field instanceof f.ABDDate)
//         return `number` + (field.notNull ? "" : "|null");
//     else if (field instanceof f.ABDDateTime)
//         return `number` + (field.notNull ? "" : "|null");
//     // Double
//     else if (field instanceof f.ABDFloat)
//         return `number` + (field.notNull ? "" : "|null");
//     else if (field instanceof f.ABDId)
//         return `number` + (field.notNull ? "" : "|null");
//     else if (field instanceof f.ABDInt)
//         return `number` + (field.notNull ? "" : "|null");
//     else if (field instanceof f.ABDJSON)
//         return `TS0RawValue` + (field.notNull ? "" : "|null");
//     else if (field instanceof f.ABDLong)
//         return `number` + (field.notNull ? "" : "|null");
//     // Object
//     else if(field instanceof f.ABDString)
//         return `string` + (field.notNull ? "" : "|null");
//     else if (field instanceof f.ABDTime)
//         return `number` + (field.notNull ? "" : "|null");
//     else if(field instanceof f.ABDText)
//         return `string` + (field.notNull ? "" : "|null");

//     abLog.warn(`Unsupported field:`, field.getType());
//     throw new Error('Unsupported field.');
// }

// export function getTS0Type(scheme: DataScheme, field_: ABDField|ABDColumnRef): string {
//     let field = scheme.parseField(field_);

//     if (field instanceof f.ABDAutoIncrementId)
//         return `[ "number", ts0.TNull ]`;
//     else if (field instanceof f.ABDBlob)
//         return field.notNull ? `"string"` : `["string", ts0.TNull]`;
//     else if (field instanceof f.ABDBool)
//         return field.notNull ? `"boolean"` : `["boolean", ts0.TNull]`;
//     else if (field instanceof f.ABDData) {
//         return field.notNull ? `ts0.TRawValue` : `[ts0.TRawValue, ts0.TNull]`;
//     }
//     else if (field instanceof f.ABDDate)
//         return field.notNull ? `"number"` : `["number", ts0.TNull]`;
//     else if (field instanceof f.ABDDateTime)
//         return field.notNull ? `"number"` : `["number", ts0.TNull]`;
//     // Double
//     else if (field instanceof f.ABDFloat)
//         return field.notNull ? `"number"` : `["number", ts0.TNull]`;
//     else if (field instanceof f.ABDId)
//         return field.notNull ? `"number"` : `["number", ts0.TNull]`;
//     else if (field instanceof f.ABDInt)
//         return field.notNull ? `"number"` : `["number", ts0.TNull]`;
//     else if (field instanceof f.ABDJSON)
//         return field.notNull ? `ts0.TRawValue` : `[ts0.TRawValue, ts0.TNull]`;
//     else if (field instanceof f.ABDLong)
//         return field.notNull ? `"number"` : `["number", ts0.TNull]`;
//     // Object
//     else if(field instanceof f.ABDString)
//         return field.notNull ? `"string"` : `["string", ts0.TNull]`;
//     else if (field instanceof f.ABDTime)
//         return field.notNull ? `"number"` : `["number", ts0.TNull]`;
//     else if(field instanceof f.ABDText)
//         return field.notNull ? `"string"` : `["string", ts0.TNull]`;

//     abLog.warn(`Unsupported field:`, field.getType());
//     throw new Error('Unsupported field.');
// }