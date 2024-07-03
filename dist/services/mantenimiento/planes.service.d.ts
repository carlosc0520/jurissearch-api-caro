import { DataSource } from 'typeorm';
import { Result } from '../../models/result.model';
import { DataTable } from 'src/models/DataTable.model.';
import { PlanesModel } from 'src/models/Admin/planes.model';
export declare class PlanesService {
    private connection;
    constructor(connection: DataSource);
    create(entidad: PlanesModel): Promise<Result>;
    list(entidad: DataTable): Promise<PlanesModel[]>;
    delete(id: number, UCRCN: string): Promise<Result>;
    edit(entidad: PlanesModel): Promise<Result>;
}
