import abFS, { abFSMatcher } from "ab-fs";
import fs from "node:fs";
import path from "node:path";

import abLog from "ab-log";
import abMySQL, { Database } from "ab-mysql";

import abData, { DatabaseInfo, DataScheme } from "ab-data";

                                                         
                                                                    
import { createTSTableClass } from "./ts/createTSTableClass.js";
import createEspadaTableClass from "./espada/createEspadaTableClass.js";
import sync_Espada_Async, {                 } from "./espada/sync_Espada_Async.js";
                                                    
import sync_TS_Async from "./ts/sync_TS_Async.js";
import update_DB_Async from "./db/update_DB_Async.js";

class abData_DBSync_Class {
    constructor() {
        
    }

    async sync_Android_Async(scheme            , info             )                {
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

    async sync_Espada_Async(scheme            , info            )  
                          {
        await sync_Espada_Async(scheme, info);
    }

    async sync_IOS_Async(scheme            , info         )                {
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

    async sync_TS_Async(scheme            , info        )                {
        await sync_TS_Async(scheme, info)
    }

    async update_DB_Async(scheme            , connectionInfo                  ) 
                          {
        await update_DB_Async(scheme, connectionInfo);
    }
}
export default new abData_DBSync_Class();

                    
                    
                 
  

                
                 
  