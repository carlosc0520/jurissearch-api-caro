import { DataSource } from 'typeorm';
import { Result } from '../../models/result.model';
import { DataTable } from 'src/models/DataTable.model.';
import { MagistradosModel } from 'src/models/Admin/magistrados.model';
export declare class MagistradosService {
    private connection;
    constructor(connection: DataSource);
    create(entidad: MagistradosModel): Promise<Result>;
    list(entidad: DataTable): Promise<MagistradosModel[]>;
    delete(id: number, UCRCN: string): Promise<Result>;
    edit(entidad: MagistradosModel): Promise<Result>;
}
