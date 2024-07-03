import { DataSource } from 'typeorm';
import { DataTable } from 'src/models/DataTable.model.';
import { AuditoriaModel } from 'src/models/Admin/auditoria.model';
export declare class AuditoriaService {
    private connection;
    constructor(connection: DataSource);
    list(entidad: DataTable): Promise<AuditoriaModel[]>;
    obtenerTabla(nombre: string): Promise<string>;
}
