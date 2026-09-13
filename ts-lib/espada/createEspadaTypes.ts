import { ABDataDefObjectPresetType, type DataScheme } from "ab-data";
import abDataDefToPHPStan from "./abDataDefToPHPStan.ts";
import fs from "node:fs";
import abLog from "ab-log";
import path from "node:path";
import type { EspadaInfo } from "./sync_Espada_Async.ts";

export function createEspadaTypes(scheme: DataScheme, info: EspadaInfo): void {
    let typeNames = scheme.typeNames;

    let content = 
`<?php namespace EC\\${info.typesNamespace};
defined('_ESPADA') or die(NO_ACCESS);

use E, EC;
/**
`   ;

    for (let typeName of typeNames) {
        let typeInfo = scheme.getTypeInfo(typeName);
            content += ` * @phpstan-type _T_${typeName} ` + abDataDefToPHPStan.parseType(
                    scheme, typeInfo.def, " * ") + `\n *\n`;
    }

    content +=
` */
class _ABTypes {
}`

    let fsPath = path.join(info.typesPath, info.typesNamespace, "classes", 
            "_Types", "_ABTypes.php");
    fs.writeFileSync(fsPath, content);
    // abLog.success(`Saved: ${fsPath}.`);
}