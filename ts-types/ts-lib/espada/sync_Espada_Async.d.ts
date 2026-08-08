import { DataScheme } from "ab-data";
export default function sync_Espada_Async(scheme: DataScheme, info: EspadaInfo): Promise<void>;
export type EspadaInfo = {
    path: string;
    requestsPath: string;
    requestsNamespace: string;
};
