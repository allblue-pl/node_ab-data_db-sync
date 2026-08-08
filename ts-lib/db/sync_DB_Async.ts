import { DataScheme } from "ab-data"
import path from "node:path";
import fs from "node:fs";
import abFS from "ab-fs";
import { createDBClass } from "./createDBClass.ts";

export async function sync_DB_Async(scheme: DataScheme, info: DBInfo): Promise<void> {
    let destFSPath_Tables = path.join(info.abDataFSPath, "$tables");
    if (fs.existsSync(destFSPath_Tables))
        abFS.rmdirRecursiveSync(destFSPath_Tables);
    abFS.mkdirRecursiveSync(destFSPath_Tables);

    // let fileFSPaths = await abFSMatcher.getPaths_Async([
    //     path.join(path.resolve(info.abDataFSPath), "/**/*.ts"),
    // ]);

    // for (let fileFSPath of fileFSPaths) {
    //     let fileRelPath = path.relative(info.abDataFSPath, fileFSPath);
    //     let fileFSPath_Dest = path.join(destFSPath, fileRelPath);

    //     if (!fs.existsSync(path.dirname(fileFSPath_Dest)))
    //         abFS.mkdirRecursiveSync(fileFSPath_Dest);

    //     fs.copyFileSync(fileFSPath, fileFSPath_Dest);
    // }

    for (let tableName of scheme.tableNames)
        await createDBClass(info.abDataFSPath, scheme.getTableDef(tableName));
}

export type DBInfo = {
    abDataFSPath: string,
};