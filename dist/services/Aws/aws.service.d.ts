import { EntriesModel } from 'src/models/Admin/entries.model';
import { NoticiaModel } from 'src/models/Admin/noticia.model';
export declare class S3Service {
    private readonly s3;
    constructor();
    uploadFiles(entidad: EntriesModel, file1Key: string, file1Path: string, file2Key: string, file2Path: string): Promise<string[]>;
    uploadFile(entidad: EntriesModel, file1Key: string, file1Path: string): Promise<string>;
    uploadImage(entidad: NoticiaModel, file1Key: string, file1Path: string): Promise<string>;
    getImage(key: string): Promise<any>;
    downloadFile(PATH: string): Promise<any>;
    deleteFile(PATH: string): Promise<any>;
}
