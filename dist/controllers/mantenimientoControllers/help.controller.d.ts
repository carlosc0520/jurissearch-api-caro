import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { HelpService } from 'src/services/mantenimiento/help.service';
import { HelpModel } from 'src/models/mantenimiento/help.model';
import { PlanesModel } from 'src/models/Admin/planes.model';
import { PlanesService } from 'src/services/mantenimiento/planes.service';
import { EmailJurisService } from 'src/services/acompliance/emailJurisserivce';
export declare class HelpController {
    private readonly helpService;
    private readonly planService;
    private readonly emailJurisService;
    constructor(helpService: HelpService, planService: PlanesService, emailJurisService: EmailJurisService);
    listFilters(entidad: DataTable): Promise<HelpModel[]>;
    deleteUser(req: any, ID: number): Promise<Result>;
    addUser(entidad: HelpModel): Promise<Result>;
    editUser(req: any, entidad: HelpModel): Promise<Result>;
    listaAll(entidad: DataTable): Promise<PlanesModel[]>;
}
