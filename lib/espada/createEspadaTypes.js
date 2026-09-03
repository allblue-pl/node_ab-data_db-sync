import { ABDataDefObjectPresetType,                 } from "ab-data";
import abDataDefToPHPStan from "./abDataDefToPHPStan.js";
import fs from "node:fs";
import abLog from "ab-log";
import path from "node:path";
                                                         

export function createEspadaTypes(scheme            , info            )       {
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
    abLog.success(`Saved: ${fsPath}.`);
}