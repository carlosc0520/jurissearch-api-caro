import { EntriesModel } from 'src/models/Admin/entries.model';
import { EntriesService } from '../../services/Admin/entries.service';
import { Result } from 'src/models/result.model';
import { S3Service } from 'src/services/Aws/aws.service';
import { DataTable } from 'src/models/DataTable.model.';
import { Response } from 'express';
import { BusquedaModel } from 'src/models/Admin/busqueda.model';
export declare class EntriesController {
    private readonly entriesService;
    private readonly s3Service;
    constructor(entriesService: EntriesService, s3Service: S3Service);
    uploadMultipleFiles(req: any, entidad: EntriesModel, files: any): Promise<any>;
    uploadSingleFile(req: any, entidad: EntriesModel, files: any): Promise<Result>;
    editMultipleFiles(req: any, entidad: EntriesModel, files?: any[]): Promise<Result>;
    editSingleFile(req: any, entidad: EntriesModel, files?: any[]): Promise<Result>;
    listUsers(entidad: DataTable, TYPE: string): Promise<EntriesModel[]>;
    deleteUser(req: any, ID: number): Promise<Result>;
    Obtener(ID: number): Promise<EntriesModel>;
    getPrint(ID: number): Promise<EntriesModel>;
    downloadFile(PATH: string, res: Response): Promise<any>;
    busqueda(req: any, busqueda: BusquedaModel): Promise<EntriesModel[]>;
    busquedaFavorites(req: any, busqueda: BusquedaModel): Promise<EntriesModel[]>;
    busquedaFavoritesEntrie(req: any, busqueda: BusquedaModel): Promise<EntriesModel[]>;
    saveTitleEntrie(req: any, entidad: EntriesModel): Promise<Result>;
    saveDirectory(req: any, entidad: BusquedaModel): Promise<Result>;
}
