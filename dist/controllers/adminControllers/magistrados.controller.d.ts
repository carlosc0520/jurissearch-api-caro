import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { MagistradosService } from 'src/services/Admin/magistrados.service';
import { MagistradosModel } from 'src/models/Admin/magistrados.model';
export declare class MagistradoController {
    private readonly magistradoService;
    constructor(magistradoService: MagistradosService);
    listFilters(entidad: DataTable, ESTADO: string): Promise<MagistradosModel[]>;
    deleteUser(req: any, ID: number): Promise<Result>;
    addUser(req: any, entidad: MagistradosModel): Promise<Result>;
    editUser(req: any, entidad: MagistradosModel): Promise<Result>;
}
