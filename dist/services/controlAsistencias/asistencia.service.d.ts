import { DataSource } from 'typeorm';
import { Result } from '../../models/result.model';
import { DataTable } from 'src/models/DataTable.model.';
import { AsistenciaModel } from 'src/models/controlAsistencias/asistencia.model';
import { EventosModel } from 'src/models/controlAsistencias/eventos.model';
export declare class AsistenciaService {
    private connection;
    constructor(connection: DataSource);
    create(entidad: AsistenciaModel): Promise<Result>;
    createOne(entidad: AsistenciaModel): Promise<Result>;
    list(entidad: DataTable, IDEVENTO: number): Promise<AsistenciaModel[]>;
    listAsistencia(entidad: DataTable, IDEVENTO: number, FECHA: Date): Promise<AsistenciaModel[]>;
    width: any;
    listEventos(entidad: DataTable): Promise<EventosModel[]>;
    delete(id: number, UCRCN: string): Promise<Result>;
}
