import { DataScheme } from "ab-data";
import abFS, { abFSMatcher } from "ab-fs";
import fs from "node:fs";
import path from "node:path";
import { createTSTableClass } from "./createTSTableClass.ts";
import createTSRequestClass from "./createTSRequestClass.ts";
import { createTSTypes } from "./createTSTypes.ts";
import { createTSTableVariantClass } from "./createTSTableVariantClass.ts";

export default async function sync_TS_Async(scheme: DataScheme, info: TSInfo): 
        Promise<void> {
    let destFSPath = path.join(info.libFSPath, `$ab-data`);
    if (fs.existsSync(destFSPath))
        abFS.rmdirRecursiveSync(destFSPath);
    abFS.mkdirRecursiveSync(destFSPath);
    abFS.mkdirRecursiveSync(path.join(destFSPath, "$requests"));
    abFS.mkdirRecursiveSync(path.join(destFSPath, "$tables"));
    abFS.mkdirRecursiveSync(path.join(destFSPath, "$table-variants"));
    abFS.mkdirRecursiveSync(path.join(destFSPath, "$types"));

    let fsDataPaths: Array<string> = [];
    for (let dataPath of info.dataPaths)
        fsDataPaths.push(path.join(path.resolve(info.abDataFSPath), dataPath));

    let fileFSPaths = await abFSMatcher.getPaths_Async(fsDataPaths);

    for (let fileFSPath of fileFSPaths) {
        let fileRelPath = path.relative(info.abDataFSPath, fileFSPath);
        let fileFSPath_Dest = path.join(destFSPath, fileRelPath);

        if (!fs.existsSync(path.dirname(fileFSPath_Dest)))
            abFS.mkdirRecursiveSync(path.dirname(fileFSPath_Dest));

        fs.copyFileSync(fileFSPath, fileFSPath_Dest);
    }

    for (let tableName of scheme.tableNames)
        createTSTableClass(scheme, info.libFSPath, scheme.getTableDef(tableName));

    for (let tableVariantName of scheme.tableVariantNames) {
        createTSTableVariantClass(scheme, info.libFSPath, 
                scheme.getTableDefVariant(tableVariantName));
    }

    /* Requests */
    for (let requestName of scheme.requestNames) {
        let requestDef = scheme.getRequestDef(requestName);
        createTSRequestClass(scheme, info.libFSPath, requestName, requestDef);
    }

    /* Types */
    createTSTypes(scheme, info.libFSPath);
}

export type TSInfo = {
    abDataFSPath: string,
    dataPaths: Array<string>,
    libFSPath: string,
};