import { EntriesModel } from 'src/models/Admin/entries.model';
import { EntriesService } from '../../services/Admin/entries.service';
import { Result } from 'src/models/result.model';
import { S3Service } from 'src/services/Aws/aws.service';
import { DataTable } from 'src/models/DataTable.model.';
import { Response } from 'express';
export declare class EntriesController {
    private readonly entriesService;
    private readonly s3Service;
    constructor(entriesService: EntriesService, s3Service: S3Service);
    uploadMultipleFiles(entidad: EntriesModel, files: any): Promise<Result>;
    editMultipleFiles(entidad: EntriesModel, files?: any[]): Promise<Result>;
    listUsers(entidad: DataTable, TYPE: string): Promise<EntriesModel[]>;
    deleteUser(ID: number): Promise<Result>;
    Obtener(ID: number): Promise<EntriesModel>;
    downloadFile(PATH: string, res: Response): Promise<any>;
}
