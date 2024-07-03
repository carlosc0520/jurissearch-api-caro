import { DataTable } from '../../models/DataTable.model.';
import { AuditoriaModel } from 'src/models/Admin/auditoria.model';
import { AuditoriaService } from 'src/services/Admin/auditoria.service';
export declare class AuditoriaController {
    private readonly auditoriaService;
    constructor(auditoriaService: AuditoriaService);
    listaAll(entidad: DataTable): Promise<AuditoriaModel[]>;
}
