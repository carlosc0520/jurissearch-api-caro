import { S3Service } from 'src/services/Aws/aws.service';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { NoticiaModel } from 'src/models/Admin/noticia.model';
import { NoticiaService } from 'src/services/mantenimiento/noticia.service';
export declare class NoticiaController {
    private readonly noticiaService;
    private readonly s3Service;
    constructor(noticiaService: NoticiaService, s3Service: S3Service);
    listaAll(entidad: DataTable): Promise<NoticiaModel[]>;
    deleteUser(req: any, ID: number): Promise<Result>;
    addUser(req: any, entidad: NoticiaModel, files: any): Promise<Result>;
    editUser(req: any, entidad: NoticiaModel): Promise<Result>;
}
