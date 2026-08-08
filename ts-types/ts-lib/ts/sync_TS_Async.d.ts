import { DataScheme } from "ab-data";
export default function sync_TS_Async(scheme: DataScheme, info: TSInfo): Promise<void>;
export type TSInfo = {
    abDataFSPath: string;
    dataPaths: Array<string>;
    libFSPath: string;
};
