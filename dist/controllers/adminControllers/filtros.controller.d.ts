import { Result } from 'models/result.model';
import { DataTable } from 'models/DataTable.model.';
import { filtrosService } from 'services/Filtros/filtros.service';
import { FiltrosModel } from 'models/Admin/filtros.model';
export declare class FiltrosController {
    private readonly filtrosService;
    constructor(filtrosService: filtrosService);
    listFilters(entidad: DataTable, TIPO: string): Promise<FiltrosModel[]>;
    addUser(req: any, entidad: FiltrosModel): Promise<Result>;
    deleteUser(req: any, ID: number): Promise<Result>;
    editUser(req: any, entidad: FiltrosModel): Promise<Result>;
}
