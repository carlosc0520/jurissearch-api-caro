import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { NoticiaModel } from 'src/models/Admin/noticia.model';
import { NoticiaService } from 'src/services/mantenimiento/noticia.service';
export declare class NoticiaController {
    private readonly noticiaService;
    constructor(noticiaService: NoticiaService);
    listaAll(entidad: DataTable): Promise<NoticiaModel[]>;
    deleteUser(req: any, ID: number): Promise<Result>;
    addUser(req: any, entidad: NoticiaModel): Promise<Result>;
    editUser(req: any, entidad: NoticiaModel): Promise<Result>;
}
