import { ABDField, abdFields as f } from "ab-data";
import type TableDef from "ab-data/ts-lib/TableDef.ts";
import abLog from "ab-log";
import fs from "fs";
import path from "path";

export function createTSTableClass(libFSPath: string, tableDef: TableDef): void {
    createClass(libFSPath, tableDef);
}


function createClass(libFSPath: string, tableDef: TableDef): void {
    let content =
`import { type TS0RawObject } from "@allblue/ts0";

export type _R${tableDef.name}_Type = [`;

    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTSType(column.field);

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    content += `
];

export type _R${tableDef.name}_JSONType = {`;

    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTSType(column.field);

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    content += `
};`;

    fs.writeFileSync(path.join(libFSPath, `$ab-data`, `$tables`, 
            `_T${tableDef.name}.ts`), content);
    abLog.success(`Saved: ${tableDef.name}.`);
}

function getTSType(field: ABDField): string {
    if (field instanceof f.ABDAutoIncrementId)
        return `number`;
    else if (field instanceof f.ABDBlob)
        return `string` + (field.notNull ? "" : "|null");
    else if (field instanceof f.ABDBool)
        return `boolean` + (field.notNull ? "" : "|null");
    // else if (field instanceof f.ABDData)
    //     return `Text(${field.notNull}, 'medium)`;
    else if (field instanceof f.ABDDate)
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
        return `TS0RawObject` + (field.notNull ? "" : "|null");
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