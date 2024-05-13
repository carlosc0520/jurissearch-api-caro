import { EntriesModel } from 'models/Admin/entries.model';
export declare class S3Service {
    private readonly s3;
    constructor();
    uploadFiles(entidad: EntriesModel, file1Key: string, file1Path: string, file2Key: string, file2Path: string): Promise<string[]>;
    uploadFile(entidad: EntriesModel, file1Key: string, file1Path: string): Promise<string>;
    downloadFile(PATH: string): Promise<any>;
    deleteFile(PATH: string): Promise<any>;
}
