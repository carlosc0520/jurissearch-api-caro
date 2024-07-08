import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { AsistenciaModel } from 'src/models/controlAsistencias/asistencia.model';
import { AsistenciaService } from 'src/services/controlAsistencias/asistencia.service';
import { EventosModel } from 'src/models/controlAsistencias/eventos.model';
import { EmailService } from 'src/services/acompliance/email.service';
export declare class AsistenciaController {
    private readonly asistenciaService;
    private readonly emailService;
    constructor(asistenciaService: AsistenciaService, emailService: EmailService);
    listFilters(entidad: DataTable, IDEVENTO: number): Promise<AsistenciaModel[]>;
    listAsistentes(entidad: DataTable, IDEVENTO: number, FECHA: Date): Promise<AsistenciaModel[]>;
    listAsistenciaFUll(entidad: DataTable, IDEVENTO: number, FECHA: Date): Promise<AsistenciaModel[]>;
    eventos(entidad: DataTable): Promise<EventosModel[]>;
    deleteUser(req: any, ID: number): Promise<Result>;
    addUser(req: any, entidad: AsistenciaModel): Promise<Result>;
    addMasivo(req: any, entidad: AsistenciaModel, res: any): Promise<any>;
}
