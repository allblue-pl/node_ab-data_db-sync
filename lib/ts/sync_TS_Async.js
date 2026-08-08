import { DataScheme } from "ab-data";
import abFS, { abFSMatcher } from "ab-fs";
import fs from "node:fs";
import path from "node:path";
import { createTSTableClass } from "./createTSTableClass.js";
import createTSRequestClass from "./createTSRequestClass.js";

export default async function sync_TS_Async(scheme            , info        )  
                      {
    let destFSPath = path.join(info.libFSPath, `$ab-data`);
    if (fs.existsSync(destFSPath))
        abFS.rmdirRecursiveSync(destFSPath);
    abFS.mkdirRecursiveSync(destFSPath);
    abFS.mkdirRecursiveSync(path.join(destFSPath, "$requests"));
    abFS.mkdirRecursiveSync(path.join(destFSPath, "$tables"));

    let fsDataPaths                = [];
    for (let dataPath of info.dataPaths)
        fsDataPaths.push(path.join(path.resolve(info.abDataFSPath), dataPath));

    let fileFSPaths = await abFSMatcher.getPaths_Async(fsDataPaths);

    for (let fileFSPath of fileFSPaths) {
        let fileRelPath = path.relative(info.abDataFSPath, fileFSPath);
        let fileFSPath_Dest = path.join(destFSPath, fileRelPath);

        if (!fs.existsSync(path.dirname(fileFSPath_Dest)))
            abFS.mkdirRecursiveSync(fileFSPath_Dest);

        fs.copyFileSync(fileFSPath, fileFSPath_Dest);
    }

    for (let tableName of scheme.tableNames)
        createTSTableClass(info.libFSPath, scheme.getTableDef(tableName));

    /* Requests */
    for (let requestName of scheme.requestNames) {
        let requestDef = scheme.getRequestDef(requestName);
        createTSRequestClass(scheme, info.libFSPath, requestName, requestDef);
    }
}

;                     
                         
                             
                      
  