export declare class HostingerService {
    private ftpClient;
    private readonly ftpHost;
    private readonly ftpUser;
    private readonly ftpPassword;
    private readonly ftpDir;
    constructor();
    private sanitizeSegment;
    uploadDocumento(file: Express.Multer.File, tipo: string, subtipo: string): Promise<string>;
    downloadDocumento(remotePath: string): Promise<Buffer>;
    private connectFTP;
    saveFile(file: Express.Multer.File, remote: String): Promise<any>;
    deleteFile(fileName: string): Promise<any>;
    getFile(fileName: string): Promise<any>;
    uploadFiles(files: Express.Multer.File[], remotePath: string): Promise<string>;
    downloadFiles(files: string[]): Promise<{
        fileName: string;
        fileBuffer: string;
    }>;
    uploadFromBuffer(buffer: Buffer, ext: string, tipo: string, subtipo: string): Promise<string>;
    deleteFiles(filePaths: string[]): Promise<{
        message: string;
    }>;
}
