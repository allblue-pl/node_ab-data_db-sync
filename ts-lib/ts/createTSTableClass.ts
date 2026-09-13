import { ABDField, ABDColumnRef, DataScheme, abdFields as f, type ABDataDefPreset } from "ab-data";
import type TableDef from "ab-data/ts-lib/TableDef.ts";
import abLog from "ab-log";
import fs from "fs";
import path from "path";
import abDataDefToTS from "./abDataDefToTS.ts";

export function createTSTableClass(scheme: DataScheme, libFSPath: string, 
        tableDef: TableDef): void {
    createClass(scheme, libFSPath, tableDef);
}


function createClass(scheme: DataScheme, libFSPath: string, tableDef: TableDef): void {
    let content =
`import ts0, { type TS0RawArray, type TS0RawObject, type TS0RawValue } from "@allblue/ts0";

export type _TR${tableDef.name}_Arr = [`;

    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTSType(scheme, column.field, "insert");

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    for (let [ columnName, column ] of tableDef.columns_Extra) {
        let tsType = getTSType(scheme, column.field, "insert");

        content += `
    ${columnName}?: ${tsType},`
        ;
    }

    content += `
];
export const _p_TR${tableDef.name}_Arr = ts0.TPresetArray([`;

    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTS0Type(scheme, column.field, "insert");

        content += `
    ${tsType},`
        ;
    }

    content += `
]);

export type _TR${tableDef.name} = {`;

    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTSType(scheme, column.field, "select");

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    for (let [ columnName, column ] of tableDef.columns_Extra) {
        let tsType = getTSType(scheme, column.field, "select");

        content += `
    ${columnName}?: ${tsType},`
        ;
    }

    content += `
};
export const _p_TR${tableDef.name} = ts0.TPreset({`;

    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTS0Type(scheme, column.field, "select");

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    content += `
});

export type _TR${tableDef.name}_Insert = {`;
    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTSType(scheme, column.field, "insert");

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    content += `
};
export const _p_TR${tableDef.name}_Insert = ts0.TPreset({`;
    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTS0Type(scheme, column.field, "insert");

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    content += `
});

export type _TR${tableDef.name}_Update = {`;
    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTSType(scheme, column.field, "update");

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    content += `
};

export const _p_TR${tableDef.name}_Update = ts0.TPreset({`;
    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTS0Type(scheme, column.field, "update");

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    content += `
});

export type _TR${tableDef.name}_Variant = {`;
    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTSType(scheme, column.field, "select");

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    for (let [ columnName, column ] of tableDef.columns_Extra) {
        let tsType = getTSType(scheme, column.field, "select");

        content += `
    ${columnName}?: ${tsType},`
        ;
    }

    content += `
    [key: string]: any,
};
export const _p_TR${tableDef.name}_Variant = ts0.TPreset({`;
    for (let [ columnName, column ] of tableDef.columns) {
        let tsType = getTS0Type(scheme, column.field, "select");

        content += `
    ${columnName}: ${tsType},`
        ;
    }

    content += `
}, ts0.TObject("string", null));`;

    fs.writeFileSync(path.join(libFSPath, `$ab-data`, `$tables`, 
            `_T${tableDef.name}.ts`), content.replaceAll("\n", "\r\n"));
    // abLog.success(`Saved: ${tableDef.name}.`);
}

export function getTSType(scheme: DataScheme, field_: ABDField|ABDColumnRef,
        type: "select"|"update"|"insert", offset = ""): string {
    let field = scheme.parseField(field_);

    if (field instanceof f.ABDAutoIncrementId)
        return `number` + (type !== "select" ? "|null" : "");
    else if (field instanceof f.ABDBlob)
        return `string` + (field.notNull ? "" : "|null") + (type === "update" ? "|undefined" : "");
    else if (field instanceof f.ABDBool)
        return `boolean` + (field.notNull ? "" : "|null") + (type === "update" ? "|undefined" : "");
    else if (field instanceof f.ABDData) {
        return abDataDefToTS.parseType(scheme, field.dataDef, `${offset}    `, "skipAll");
    } else if (field instanceof f.ABDDate)
        return `number` + (field.notNull ? "" : "|null") + (type === "update" ? "|undefined" : "");
    else if (field instanceof f.ABDDateTime)
        return `number` + (field.notNull ? "" : "|null") + (type === "update" ? "|undefined" : "");
    // Double
    else if (field instanceof f.ABDFloat)
        return `number` + (field.notNull ? "" : "|null") + (type === "update" ? "|undefined" : "");
    else if (field instanceof f.ABDId)
        return `number` + (field.notNull ? "" : "|null") + (type === "update" ? "|undefined" : "");
    else if (field instanceof f.ABDIdRef)
        return `number` + (field.notNull ? "" : "|null") + (type === "update" ? "|undefined" : "");
    else if (field instanceof f.ABDInt)
        return `number` + (field.notNull ? "" : "|null") + (type === "update" ? "|undefined" : "");
    else if (field instanceof f.ABDJSON)
        return `TS0RawValue` + (field.notNull ? "" : "|null") + (type === "update" ? "|undefined" : "");
    else if (field instanceof f.ABDLong)
        return `number` + (field.notNull ? "" : "|null") + (type === "update" ? "|undefined" : "");
    // Object
    else if(field instanceof f.ABDString)
        return `string` + (field.notNull ? "" : "|null") + (type === "update" ? "|undefined" : "");
    else if (field instanceof f.ABDTime)
        return `number` + (field.notNull ? "" : "|null") + (type === "update" ? "|undefined" : "");
    else if(field instanceof f.ABDText)
        return `string` + (field.notNull ? "" : "|null") + (type === "update" ? "|undefined" : "");

    abLog.warn(`Unsupported field:`, field.getType());
    throw new Error('Unsupported field.');
}

export function getTS0Type(scheme: DataScheme, field_: ABDField|ABDColumnRef, 
        type: "select"|"update"|"insert"): string {
    let field = scheme.parseField(field_);

    if (field instanceof f.ABDAutoIncrementId) {
        switch (type) {
            case "select":
                return `"number"`;
            case "update":
                return `[ "number", ts0.TNull ]`;
            case "insert":
                return `[ "number", ts0.TNull ]`;
        }
    } else if (field instanceof f.ABDBlob)
        switch (type) {
            case "select":
                return `"string"`;
            case "update":
                return `[ "string", ts0.TNull, "undefined" ]`;
            case "insert":
                return `[ "string", ts0.TNull ]`;
        }
    else if (field instanceof f.ABDBool) {
        switch (type) {
            case "select":
                return `"boolean"`;
            case "update":
                return `[ "boolean", ts0.TNull, "undefined" ]`;
            case "insert":
                return `[ "boolean", ts0.TNull ]`;
        }
    /* This should check data in details. TO DO */
    } else if (field instanceof f.ABDData) {
        switch (type) {
            case "select":
                return `ts0.TRawValue`;
            case "update":
                return `[ ts0.TRawValue, ts0.TNull, "undefined" ]`;
            case "insert":
                return `[ ts0.TRawValue, ts0.TNull ]`;
        }
    }
    else if (field instanceof f.ABDDate) {
        switch (type) {
            case "select":
                return `"number"`;
            case "update":
                return `[ "number", ts0.TNull, "undefined" ]`;
            case "insert":
                return `[ "number", ts0.TNull ]`;
        }
    } else if (field instanceof f.ABDDateTime) {
        switch (type) {
            case "select":
                return `"number"`;
            case "update":
                return `[ "number", ts0.TNull, "undefined" ]`;
            case "insert":
                return `[ "number", ts0.TNull ]`;
        }
    // Double
    } else if (field instanceof f.ABDFloat) {
        switch (type) {
            case "select":
                return `"number"`;
            case "update":
                return `[ "number", ts0.TNull, "undefined" ]`;
            case "insert":
                return `[ "number", ts0.TNull ]`;
        }
    } else if (field instanceof f.ABDId) {
        switch (type) {
            case "select":
                return `"number"`;
            case "update":
                return `[ "number", ts0.TNull, "undefined" ]`;
            case "insert":
                return `[ "number", ts0.TNull ]`;
        }
     } else if (field instanceof f.ABDIdRef) {
        switch (type) {
            case "select":
                return `"number"`;
            case "update":
                return `[ "number", ts0.TNull, "undefined" ]`;
            case "insert":
                return `[ "number", ts0.TNull ]`;
        }
    } else if (field instanceof f.ABDInt) {
        switch (type) {
            case "select":
                return `"number"`;
            case "update":
                return `[ "number", ts0.TNull, "undefined" ]`;
            case "insert":
                return `[ "number", ts0.TNull ]`;
        }
    } else if (field instanceof f.ABDJSON) {
        switch (type) {
            case "select":
                return `ts0.TRawValue`;
            case "update":
                return `[ ts0.TRawValue, ts0.TNull, "undefined" ]`;
            case "insert":
                return `[ ts0.TRawValue, ts0.TNull ]`;
        }
    } else if (field instanceof f.ABDLong) {
        switch (type) {
            case "select":
                return `ts0.TRawValue`;
            case "update":
                return `[ ts0.TRawValue, ts0.TNull, "undefined" ]`;
            case "insert":
                return `[ ts0.TRawValue, ts0.TNull ]`;
        }
    // Object
    } else if(field instanceof f.ABDString) {
        switch (type) {
            case "select":
                return `"string"`;
            case "update":
                return `[ "string", ts0.TNull, "undefined" ]`;
            case "insert":
                return `[ "string", ts0.TNull ]`;
        }
    } else if (field instanceof f.ABDTime) {
        switch (type) {
            case "select":
                return `"number"`;
            case "update":
                return `[ "number", ts0.TNull, "undefined" ]`;
            case "insert":
                return `[ "number", ts0.TNull ]`;
        }
    } else if(field instanceof f.ABDText) {
        switch (type) {
            case "select":
                return `"string"`;
            case "update":
                return `[ "string", ts0.TNull, "undefined" ]`;
            case "insert":
                return `[ "string", ts0.TNull ]`;
        }
    }

    abLog.warn(`Unsupported field:`, field.getType());
    throw new Error('Unsupported field.');
}