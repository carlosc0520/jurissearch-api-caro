import { S3Service } from 'src/services/Aws/aws.service';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { NoticiaModel } from 'src/models/Admin/noticia.model';
import { NoticiaService } from 'src/services/mantenimiento/noticia.service';
import { Response } from 'express';
export declare class NoticiaController {
    private readonly noticiaService;
    private readonly s3Service;
    constructor(noticiaService: NoticiaService, s3Service: S3Service);
    listaAll(entidad: DataTable): Promise<NoticiaModel[]>;
    downloadFile(KEY: string, res: Response): Promise<any>;
    deleteUser(req: any, ID: number): Promise<Result>;
    addNoticia(req: any, entidad: NoticiaModel, files: any): Promise<Result>;
    editNoticia(req: any, entidad: NoticiaModel, files?: any[]): Promise<Result>;
}
