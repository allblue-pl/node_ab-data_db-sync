import { DataScheme } from "ab-data";
import type { DBConnectionInfo } from "ab-mysql/ts-lib/Database.ts";
import { type EspadaInfo } from "./espada/sync_Espada_Async.ts";
import type { TSInfo } from "./ts/sync_TS_Async.ts";
declare class abData_DBSync_Class {
    constructor();
    sync_Android_Async(scheme: DataScheme, info: AndroidInfo): Promise<void>;
    sync_Espada_Async(scheme: DataScheme, info: EspadaInfo): Promise<void>;
    sync_IOS_Async(scheme: DataScheme, info: IOSInfo): Promise<void>;
    sync_TS_Async(scheme: DataScheme, info: TSInfo): Promise<void>;
    update_DB_Async(scheme: DataScheme, connectionInfo: DBConnectionInfo): Promise<void>;
}
declare const _default: abData_DBSync_Class;
export default _default;
type AndroidInfo = {
    package: string;
    path: string;
};
type IOSInfo = {
    path: string;
};
