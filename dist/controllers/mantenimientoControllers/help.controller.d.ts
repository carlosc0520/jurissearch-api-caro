import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { HelpService } from 'src/services/mantenimiento/help.service';
import { HelpModel } from 'src/models/mantenimiento/help.model';
export declare class HelpController {
    private readonly helpService;
    constructor(helpService: HelpService);
    listFilters(entidad: DataTable): Promise<HelpModel[]>;
    deleteUser(req: any, ID: number): Promise<Result>;
    addUser(entidad: HelpModel): Promise<Result>;
    editUser(req: any, entidad: HelpModel): Promise<Result>;
}
