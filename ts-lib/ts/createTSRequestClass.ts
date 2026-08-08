import { RequestDef } from "ab-data";
import abLog from "ab-log";
import fs from "fs";
import path from "path";
import type { ABDataDefPreset, DataScheme } from "ab-data";
import abDataDefToTS from "./abDataDefToTS.ts";

function createTSRequestClass(scheme: DataScheme, libFSPath: string, 
        requestName: string, requestDef: RequestDef): void {
    createClass(scheme, libFSPath, requestName, requestDef);
    // createClass_Child(packagePath, table);
};
export default createTSRequestClass;


function createClass(scheme: DataScheme, libFSPath: string, requestName: string, 
        requestDef: RequestDef): void {
    let tableNames: Array<string> = [];
    let actionNames = requestDef.getActionNames();

    let content = "";

    for (let actionName of actionNames) {
        let actionDef = requestDef.getActionDef(actionName);

        content += `
export type _R${requestName}_${actionName}_Args = {
`       ;

        content += getPHPStanFromDef(scheme, actionDef.argsDef, tableNames);

        content += `}
export type _R${requestName}_${actionName}_Result = {
    _debug?: string,
    _message?: string,
`      
        ;

        content += getPHPStanFromDef(scheme, actionDef.resultDef, tableNames);

        content += `}
export type _R${requestName}_${actionName}_Result_Parsed = {
    _debug?: string,
    _type: 0|1,
    _message: string,
`;
        content += getPHPStanFromDef(scheme, actionDef.resultDef, tableNames);

        content += `}`;
    }

    let content_Start = "";

    for (let tableName of tableNames) {
        if (!scheme.hasTable(tableName)) {
            throw new Error(`Table '${tableName}' requested in request '${requestName}' ` + 
                    `does not exist in data schema.`);
        }

        content_Start += 
`import { type _R${tableName}_JSONType } from "../$tables/_T${tableName}.ts";
`;
        ;
    }

    content = content_Start + content;

    fs.writeFileSync(path.join(libFSPath, "$ab-data", "$requests", 
            `_${requestName}.ts`), content);
    abLog.success(`Saved Request: ${requestName}.`);
};

function getPHPStanFromDef(scheme: DataScheme, def: ABDataDefPreset, tableNames: Array<string>): string {
    return abDataDefToTS.parsePreset(scheme, def, "    ", tableNames);
}