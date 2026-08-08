import { DataScheme } from "ab-data";
import fs from "node:fs";
import path from "node:path";
import createEspadaTableClass from "./createEspadaTableClass.ts";
import { findPackage, getETable } from "./helpers.ts";
import abFS from "ab-fs";
import createEspadaRequestClass from "./createEspadaRequestClass.ts";

export default async function sync_Espada_Async(scheme: DataScheme, info: EspadaInfo): 
        Promise<void> {
    let packagePaths = [];
    let packageDirs = fs.readdirSync(path.join(info.path, 'packages'));
    for (let packageDir of packageDirs)
        packagePaths.push(path.join(info.path, 'packages', packageDir));

    let destFSPaths: Array<string> = [];
    for (let tableName of scheme.tableNames) {
        let eTable = getETable(scheme.getTableDef(tableName));
        let pkgFSPath = findPackage(packagePaths, eTable);
        if (pkgFSPath === null)
            continue;

        let destFSPath = path.join(pkgFSPath, "classes", "_Tables");
        if (!destFSPaths.includes(destFSPath))
            destFSPaths.push(destFSPath);
    }

    for (let destFSPath of destFSPaths) {
        if (fs.existsSync(destFSPath))
            abFS.rmdirRecursiveSync(destFSPath);
        abFS.mkdirRecursiveSync(destFSPath);
    }

    for (let tableName of scheme.tableNames)
        createEspadaTableClass(packagePaths, scheme.getTableDef(tableName));

    /* Requests */
    let destFSPath = path.join(info.requestsPath, info.requestsNamespace, 
            "classes", "_Requests");
    if (fs.existsSync(destFSPath))
        abFS.rmdirRecursiveSync(destFSPath);
    abFS.mkdirRecursiveSync(destFSPath);

    for (let requestName of scheme.requestNames) {
        let requestDef = scheme.getRequestDef(requestName);
        createEspadaRequestClass(scheme, info.requestsPath, info.requestsNamespace, 
                requestName, requestDef);
    }
}

export type EspadaInfo = {
    path: string,

    requestsPath: string,
    requestsNamespace: string,
};
