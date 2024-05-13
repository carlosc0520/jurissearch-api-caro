import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { MagistradosService } from 'src/services/Admin/magistrados.service';
import { MagistradosModel } from 'src/models/Admin/magistrados.model';
export declare class MagistradoController {
    private readonly magistradoService;
    constructor(magistradoService: MagistradosService);
    listFilters(entidad: DataTable): Promise<MagistradosModel[]>;
    deleteUser(ID: number): Promise<Result>;
    addUser(entidad: MagistradosModel): Promise<Result>;
    editUser(entidad: MagistradosModel): Promise<Result>;
}
