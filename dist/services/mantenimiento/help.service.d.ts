import { DataSource } from 'typeorm';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { HelpModel } from '../../models/mantenimiento/help.model';
export declare class HelpService {
    private connection;
    constructor(connection: DataSource);
    create(entidad: HelpModel): Promise<Result>;
    list(entidad: DataTable): Promise<HelpModel[]>;
    delete(id: number, UCRCN: string): Promise<Result>;
    edit(entidad: HelpModel): Promise<Result>;
}
