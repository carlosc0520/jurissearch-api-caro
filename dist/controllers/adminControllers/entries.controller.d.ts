import { EntriesModel } from 'src/models/Admin/entries.model';
import { EntriesService } from '../../services/Admin/entries.service';
import { Result } from 'src/models/result.model';
import { S3Service } from 'src/services/Aws/aws.service';
import { HostingerService } from 'src/services/Aws/hostinger.service';
import { DataTable } from 'src/models/DataTable.model.';
import { Response } from 'express';
import { BusquedaModel } from 'src/models/Admin/busqueda.model';
export declare class EntriesController {
    private readonly entriesService;
    private readonly s3Service;
    private readonly hostingerService;
    constructor(entriesService: EntriesService, s3Service: S3Service, hostingerService: HostingerService);
    private downloadEntriefile;
    uploadMultipleFiles(req: any, entidad: EntriesModel, files: any): Promise<any>;
    uploadSingleFile(req: any, entidad: EntriesModel, files: any): Promise<Result>;
    editMultipleFiles(req: any, entidad: EntriesModel, files?: any[]): Promise<Result>;
    editSingleFile(req: any, entidad: EntriesModel, files?: any[]): Promise<Result>;
    listUsers(entidad: DataTable, TYPE: string): Promise<EntriesModel[]>;
    listData(entidad: DataTable, TYPE: string, BLOG: string, FRESOLUTION: string, TEMA: string, RTITLE: string, FCRCN: string): Promise<EntriesModel[]>;
    listSearchNames(entidad: any): Promise<string[]>;
    listSearchData(req: any, RTITLE: string, TYPE: string, BLOG: string, res: any): Promise<any>;
    listSearchDataAllZip(req: any, paths: string, res: any): Promise<void>;
    listSearchDataFull(RTITLE: string, TYPE: string, res: Response): Promise<void>;
    private renderContent;
    private decodeHtmlEntities;
    deleteUser(req: any, ID: number): Promise<Result>;
    Obtener(ID: number): Promise<EntriesModel>;
    getPrint(ID: number): Promise<EntriesModel>;
    downloadFile(PATH: string, res: Response): Promise<any>;
    listTopSearch(req: any, TYPE: string): Promise<EntriesModel[]>;
    intercambioOrderSearch(req: any, entidad: any): Promise<Result>;
    clearTopSearch(req: any, entidad: any): Promise<Result>;
    busqueda(req: any, busqueda: BusquedaModel): Promise<EntriesModel[]>;
    filtersBusquedaSearch(req: any, busqueda: BusquedaModel): Promise<EntriesModel[]>;
    saveOpenEntrie(req: any, entidad: BusquedaModel): Promise<Result>;
    busquedaSugges(req: any, busqueda: BusquedaModel): Promise<EntriesModel[]>;
    busquedaFavorites(req: any, busqueda: BusquedaModel): Promise<EntriesModel[]>;
    busquedaFavoritesEntrie(req: any, busqueda: BusquedaModel): Promise<EntriesModel[]>;
    saveTitleEntrie(req: any, entidad: EntriesModel): Promise<Result>;
    saveDirectory(req: any, entidad: BusquedaModel): Promise<Result>;
    doc(res: Response, ID: number): Promise<any>;
    fsInfo(): {
        cwd: string;
        dirname: string;
        HOSTINGER_PUBLIC_PATH: string;
        candidates: {
            path: string;
            exists: boolean;
        }[];
    };
    private migJobs;
    migrationPreview(): Promise<{
        total: any;
    }>;
    migrationStart(): Promise<{
        jobId: string;
    }>;
    private runMigration;
    migrationProgress(jobId: string): {
        status: string;
        total?: undefined;
        current?: undefined;
        ok?: undefined;
        errors?: undefined;
        errMsg?: undefined;
    } | {
        status: "running" | "done" | "error";
        total: number;
        current: number;
        ok: number;
        errors: number;
        errMsg: string;
    };
    migrationExcel(jobId: string, res: Response): Promise<void>;
    syncFiles(body: {
        entries: Array<{
            id: number;
            titulo: string;
            entriefile: string;
            entriefileresumen: string;
        }>;
    }): Promise<{
        total: number;
        subidos: number;
        actualizados: number;
    }>;
}
