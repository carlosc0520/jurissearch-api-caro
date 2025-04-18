import { S3Service } from 'src/services/Aws/aws.service';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { AutorModel, CategoriaModel, NoticiaModel } from 'src/models/Admin/noticia.model';
import { NoticiaService } from 'src/services/mantenimiento/noticia.service';
import { Response } from 'express';
import { HostingerService } from 'src/services/Aws/hostinger.service';
export declare class NoticiaController {
    private readonly noticiaService;
    private readonly s3Service;
    private readonly hostingerService;
    constructor(noticiaService: NoticiaService, s3Service: S3Service, hostingerService: HostingerService);
    listaAll(entidad: DataTable): Promise<NoticiaModel[]>;
    downloadFile(KEY: string, res: Response): Promise<any>;
    deleteUser(req: any, ID: number): Promise<Result>;
    addNoticia(req: any, entidad: NoticiaModel, files: any): Promise<Result>;
    editNoticia(req: any, entidad: NoticiaModel, files?: any[]): Promise<Result>;
    listaAutores(entidad: DataTable): Promise<NoticiaModel[]>;
    addAutor(req: any, entidad: AutorModel, files: any): Promise<Result>;
    editAutor(req: any, entidad: AutorModel, files?: any[]): Promise<Result>;
    deleteAutor(req: any, ID: number): Promise<Result>;
    listaCategorias(entidad: DataTable): Promise<NoticiaModel[]>;
    addCategoria(req: any, entidad: CategoriaModel): Promise<Result>;
    editCategoria(req: any, entidad: CategoriaModel): Promise<Result>;
    deleteCategoria(req: any, ID: number): Promise<Result>;
}
