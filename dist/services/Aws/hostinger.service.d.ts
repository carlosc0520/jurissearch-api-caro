/// <reference types="multer" />
export declare class HostingerService {
    private ftpClient;
    private readonly ftpHost;
    private readonly ftpUser;
    private readonly ftpPassword;
    private readonly ftpDir;
    constructor();
    private connectFTP;
    saveFile(file: Express.Multer.File, remote: String): Promise<any>;
    deleteFile(fileName: string): Promise<any>;
    getFile(fileName: string): Promise<any>;
}
