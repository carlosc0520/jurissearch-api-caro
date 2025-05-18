import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { PlanesService } from 'src/services/mantenimiento/planes.service';
import { PlanesModel } from 'src/models/Admin/planes.model';
export declare class PlanesController {
    private readonly planService;
    constructor(planService: PlanesService);
    listaAll(entidad: DataTable): Promise<PlanesModel[]>;
    listPlanUser(req: any, entidad: DataTable): Promise<PlanesModel[]>;
    deleteUser(req: any, ID: number): Promise<Result>;
    add(req: any, entidad: PlanesModel): Promise<Result>;
    edit(req: any, entidad: PlanesModel): Promise<Result>;
}
