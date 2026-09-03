import { RequestDef } from "ab-data";
import abLog from "ab-log";
import fs from "fs";
import path from "path";
                                                           
import abDataDefToTS from "./abDataDefToTS.js";

function createTSRequestClass(scheme            , libFSPath        , 
        requestName        , requestDef            )       {
    createClass(scheme, libFSPath, requestName, requestDef);
    // createClass_Child(packagePath, table);
};
export default createTSRequestClass;


function createClass(scheme            , libFSPath        , requestName        , 
        requestDef            )       {
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
export type _R${requestName}_${actionName}_Result = {
    _debug?: string,
    _message?: string,
`      
        ;

        content += getTSFromDef(scheme, actionDef.resultDef, false);

        content += `}
export type _R${requestName}_${actionName}_Result_Parsed = {
    _debug?: string,
    _type: 0|1,
    _message: string,
`
        ;
        content += getTSFromDef(scheme, actionDef.resultDef, false);

        content += `}`;

        content += `
export const _r_R${requestName}_${actionName} = (requestArgs: _R${requestName}_${actionName}_Args): RequestInfo => {
    return [ "${requestName}", "${actionName}", requestArgs ];
};
`
        ;
    }

    fs.writeFileSync(path.join(libFSPath, "$ab-data", "$requests", 
            `_R${requestName}.ts`), content.replaceAll("\n", "\r\n"));
    abLog.success(`Saved Request: ${requestName}.`);
};

function getTSFromDef(scheme            , def                 , 
        final          = true)         {
    return abDataDefToTS.parsePreset(scheme, def, "    ", 
            final ? "noSkip" : "skipAll");
}