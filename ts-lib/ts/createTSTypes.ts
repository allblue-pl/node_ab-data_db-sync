import type { DataScheme } from "ab-data";
import abDataDefToTS from "./abDataDefToTS.ts";
import fs from "node:fs";
import abLog from "ab-log";
import path from "node:path";

export function createTSTypes(scheme: DataScheme, libFSPath: string): void {
    let typeNames = scheme.typeNames;

    let content = 
`import ts0, { type TS0RawArray, type TS0RawObject, type TS0RawValue } from "@allblue/ts0";

`   ;

    for (let typeName of typeNames) {
        let typeInfo = scheme.getTypeInfo(typeName);
        content += `export type ${typeName} = ` + abDataDefToTS.parseType(scheme, 
                typeInfo.def, "", typeInfo.requestArg ? 
                "noSkip" : "skipAll") + `;\n\n`;
    }

    let fsPath = path.join(libFSPath, `$ab-data`, `$types`, `abTypes.ts`);
    fs.writeFileSync(fsPath, content);
    // abLog.success(`Saved: ${fsPath}.`);
}