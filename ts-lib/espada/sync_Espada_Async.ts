import { DataScheme, type TableDef_ValidatorInfo } from "ab-data";
import fs from "node:fs";
import path from "node:path";
import createEspadaTableClass from "./createEspadaTableClass.ts";
import { findPackage, getETable, getETableVariant } from "./helpers.ts";
import abFS from "ab-fs";
import createEspadaRequestClass from "./createEspadaRequestClass.ts";
import { createEspadaTypes } from "./createEspadaTypes.ts";
import createEspadaTableVariantClass from "./createEspadaTableVariantClass.ts";

export default async function sync_Espada_Async(scheme: DataScheme, info: EspadaInfo): 
        Promise<void> {
    let packagePaths = [];
    let packageDirs = fs.readdirSync(path.join(info.path, 'esite', 'packages'));
    for (let packageDir of packageDirs)
        packagePaths.push(path.join(info.path, 'esite', 'packages', packageDir));

    /* Tables */
    let tableFSPaths: Array<string> = [];
    for (let tableName of scheme.tableNames) {
        let eTable = getETable(scheme.getTableDef(tableName));
        let pkgFSPath = findPackage(packagePaths, eTable);
        if (pkgFSPath === null)
            continue;

        let destFSPath = path.join(pkgFSPath, "classes", "_Tables");
        if (!tableFSPaths.includes(destFSPath))
            tableFSPaths.push(destFSPath);
    }

    for (let destFSPath of tableFSPaths) {
        if (fs.existsSync(destFSPath))
            abFS.rmdirRecursiveSync(destFSPath);
        abFS.mkdirRecursiveSync(destFSPath);
    }

    for (let tableName of scheme.tableNames)
        createEspadaTableClass(scheme, packagePaths, scheme.getTableDef(tableName));

    /* Tables Variants */
    let tableVariantFSPaths: Array<string> = [];
    for (let tableVariantName of scheme.tableVariantNames) {
        let eTableVariant = getETableVariant(scheme.getTableDefVariant(tableVariantName));
        let pkgFSPath = findPackage(packagePaths, eTableVariant);
        if (pkgFSPath === null)
            continue;

        let tableVariantFSPath = path.join(pkgFSPath, "classes", "_TableVariants");
        if (!tableVariantFSPaths.includes(tableVariantFSPath))
            tableVariantFSPaths.push(tableVariantFSPath);
    }

    for (let tableVariantFSPath of tableVariantFSPaths) {
        if (fs.existsSync(tableVariantFSPath))
            abFS.rmdirRecursiveSync(tableVariantFSPath);
        abFS.mkdirRecursiveSync(tableVariantFSPath);
    }

    for (let tableVariantName of scheme.tableVariantNames) {
        createEspadaTableVariantClass(scheme, packagePaths, 
                scheme.getTableDefVariant(tableVariantName));
    }

    /* Requests */
    let requestFSPath = path.join(info.requestsPath, info.requestsNamespace, 
            "classes", "_Requests");
    if (fs.existsSync(requestFSPath))
        abFS.rmdirRecursiveSync(requestFSPath);
    abFS.mkdirRecursiveSync(requestFSPath);

    for (let requestName of scheme.requestNames) {
        let requestDef = scheme.getRequestDef(requestName);
        createEspadaRequestClass(scheme, info.requestsPath, info.requestsNamespace, 
                requestName, requestDef);
    }

    /* Types */
    let typesFSPath = path.join(info.typesPath, info.typesNamespace, "classes",
            "_Types");
    if (fs.existsSync(typesFSPath))
        abFS.rmdirRecursiveSync(typesFSPath);
    abFS.mkdirRecursiveSync(typesFSPath);

    createEspadaTypes(scheme, info);

    /* Validators */
    syncValidatorsAndTableIds(scheme, info);
}

function syncValidatorsAndTableIds(scheme: DataScheme, info: EspadaInfo): void {
    let validatorInfos: {[key:string]: TableDef_ValidatorInfo} = {};
    let tableIds: {[tableName: string]: number} = {};
    for (let tableName of scheme.tableNames) {
        let tableDef = scheme.getTableDef(tableName);
        validatorInfos[tableName] = tableDef.getValidatorInfos();
        tableIds[tableName] = tableDef.getTableId();
    }

    let presetsFSPath = path.join(info.path, "presets", "espada", info.appPkgName);
    if (fs.existsSync(presetsFSPath))
        abFS.rmdirRecursiveSync(presetsFSPath);
    abFS.mkdirRecursiveSync(presetsFSPath);

    fs.writeFileSync(`${info.path}/presets/espada/ABData/tableIds.json`, 
            JSON.stringify(tableIds));
    fs.writeFileSync(`${info.path}/presets/espada/ABData/tableValidators.json`, 
            JSON.stringify(validatorInfos));
}

export type EspadaInfo = {
    path: string,
    appPkgName: string,

    requestsPath: string,
    requestsNamespace: string,

    typesPath: string,
    typesNamespace: string,
};
