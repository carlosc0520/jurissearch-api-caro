import { DataSource } from 'typeorm';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { FiltrosModel } from 'src/models/Admin/filtros.model';
export declare class filtrosService {
    private connection;
    constructor(connection: DataSource);
    list(entidad: DataTable, TIPO: string): Promise<FiltrosModel[]>;
    deleteFilter(id: number, UCRCN: string): Promise<Result>;
    createFilter(entidad: FiltrosModel): Promise<Result>;
    editFilter(entidad: FiltrosModel): Promise<Result>;
}
