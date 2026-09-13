import { RequestDef } from "ab-data";
import abLog from "ab-log";
import fs from "fs";
import path from "path";
import type { ABDataDefPreset, DataScheme } from "ab-data";
import abDataDefToTS from "./abDataDefToTS.ts";

function createTSRequestClass(scheme: DataScheme, libFSPath: string, 
        requestName: string, requestDef: RequestDef): void {
    try {
        createClass(scheme, libFSPath, requestName, requestDef);
    } catch (e) {
        console.error(abLog.cError(
                `Error creating espada request '${requestName}'.`), 
                e);
    }
};
export default createTSRequestClass;


function createClass(scheme: DataScheme, libFSPath: string, requestName: string, 
        requestDef: RequestDef): void {
    let actionNames = requestDef.getActionNames();

    let content = 
`import { ABDRequestResult, type RequestInfo } from "ab-data";
import ts0, { type TS0RawArray, type TS0RawObject, type TS0RawValue } from "@allblue/ts0";
`
    ;

    for (let actionName of actionNames) {
        let actionDef = requestDef.getActionDef(actionName);

        content += `
export type _R${requestName}_${actionName}_Args = {
`       ;

        content += getTSFromDef(scheme, actionDef.argsDef);

        content += `}
export type _R${requestName}_${actionName}_Success_Raw = {
    _debug?: string,
    _message?: string,
`      
        ;

        content += getTSFromDef(scheme, actionDef.successDef, false);

        content += `}
export type _R${requestName}_${actionName}_Success = {
    _debug?: string,
    _type: 0|1,
    _message: string,
`
        ;
        content += getTSFromDef(scheme, actionDef.successDef, false);

        content += `}
export type _R${requestName}_${actionName}_Failure_Raw = {
    _debug?: string,
    _message?: string,
`      
        ;

        content += getTSFromDef(scheme, actionDef.failureDef, false);

        content += `}
export type _R${requestName}_${actionName}_Failure = {
    _debug?: string,
    _type: 0|1,
    _message: string,
`
        ;
        content += getTSFromDef(scheme, actionDef.failureDef, false);

        content += `}
export type _R${requestName}_${actionName}_Result_Raw = _R${requestName}_${actionName}_Success_Raw|_R${requestName}_${actionName}_Failure_Raw;
export type _R${requestName}_${actionName}_Result = _R${requestName}_${actionName}_Success|_R${requestName}_${actionName}_Failure
export const _r_R${requestName}_${actionName} = (requestArgs: _R${requestName}_${actionName}_Args): RequestInfo => {
    return [ "${requestName}", "${actionName}", requestArgs ];
};
`
        ;
    }

    fs.writeFileSync(path.join(libFSPath, "$ab-data", "$requests", 
            `_R${requestName}.ts`), content.replaceAll("\n", "\r\n"));
    // abLog.success(`Saved Request: ${requestName}.`);
};

function getTSFromDef(scheme: DataScheme, def: ABDataDefPreset, 
        final: boolean = true): string {
    return abDataDefToTS.parsePreset(scheme, def, "    ", 
            final ? "noSkip" : "skipAll");
}