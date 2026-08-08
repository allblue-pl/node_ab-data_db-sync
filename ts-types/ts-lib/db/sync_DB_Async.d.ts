import { DataScheme } from "ab-data";
export declare function sync_DB_Async(scheme: DataScheme, info: DBInfo): Promise<void>;
export type DBInfo = {
    abDataFSPath: string;
};
