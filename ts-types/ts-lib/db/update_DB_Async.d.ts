import { type DataScheme } from "ab-data";
import type { DBConnectionInfo } from "ab-mysql/ts-lib/Database.ts";
export default function update_DB_Async(scheme: DataScheme, connectionInfo: DBConnectionInfo): Promise<void>;
export type EspadaDBInfo = {
    path: string;
    requestsPath: string;
    requestsNamespace: string;
};
