import abFS, { abFSMatcher } from "ab-fs";
import fs from "node:fs";
import path from "node:path";

import abLog from "ab-log";
import abMySQL, { Database } from "ab-mysql";

import abData, { DatabaseInfo, DataScheme } from "ab-data";

import type IndexInfo from "ab-data/ts-lib/IndexInfo.ts";
import type { DBConnectionInfo } from "ab-mysql/ts-lib/Database.ts";
import { createTSTableClass } from "./ts/createTSTableClass.ts";
import createEspadaTableClass from "./espada/createEspadaTableClass.ts";
import sync_Espada_Async, { type EspadaInfo } from "./espada/sync_Espada_Async.ts";
import type { TSInfo } from "./ts/sync_TS_Async.ts";
import sync_TS_Async from "./ts/sync_TS_Async.ts";
import update_DB_Async from "./db/update_DB_Async.ts";

class abData_DBSync_Class {
    constructor() {
        
    }

    async sync_Android_Async(scheme: DataScheme, info: AndroidInfo): Promise<void> {
        // let packagePaths = [];
        // let packageDirs = fs.readdirSync(path.join(info.path, 'packages'));
        // for (let packageDir of packageDirs)
        //     packagePaths.push(path.join(info.path, 'packages', packageDir));

        // for (let tableName of scheme.tableNames) {
        //     await android.createAndroidClass_Async(info.package, info.path, 
        //             scheme.getTableDef(tableName));
        // }
    }

    // async sync_DB_Async(scheme: DataScheme, info: DBInfo): Promise<void> {
    //     await sync_DB_Async(scheme, info);
    // }

    async sync_Espada_Async(scheme: DataScheme, info: EspadaInfo): 
            Promise<void> {
        await sync_Espada_Async(scheme, info);
    }

    async sync_IOS_Async(scheme: DataScheme, info: IOSInfo): Promise<void> {
        // js0.args(arguments, abData.scheme.DataScheme, js0.RawObject);
        // js0.typeE(info, js0.Preset({
        //     path: 'string',
        // }));

        // let dbInfo_Scheme = scheme.createDatabaseInfo();
        // // let packagePaths = [];
        // // let packageDirs = fs.readdirSync(path.join(info.path, 'packages'));
        // // for (let packageDir of packageDirs)
        // //     packagePaths.push(path.join(info.path, 'packages', packageDir));

        // for (let tableInfo of dbInfo_Scheme.tableInfos)
        //     await ios.createIOSClass_Async(info.package, info.path, tableInfo);
    }

    async sync_TS_Async(scheme: DataScheme, info: TSInfo): Promise<void> {
        await sync_TS_Async(scheme, info)
    }

    async update_DB_Async(scheme: DataScheme, connectionInfo: DBConnectionInfo):
            Promise<void> {
        await update_DB_Async(scheme, connectionInfo);
    }
}
export default new abData_DBSync_Class();

type AndroidInfo = {
    package: string,
    path: string,
};

type IOSInfo = {
    path: string,
};