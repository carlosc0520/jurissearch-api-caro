import { DataSource } from 'typeorm';
import { Result } from '../../models/result.model';
import { EntriesModel } from 'src/models/Admin/entries.model';
import { DataTable } from 'src/models/DataTable.model.';
export declare class EntriesService {
    private connection;
    constructor(connection: DataSource);
    createEntries(entidad: EntriesModel): Promise<Result>;
    list(entidad: DataTable, TITLE: string, TYPE: string, TIPO: string): Promise<EntriesModel[]>;
    get(ID: number): Promise<EntriesModel>;
    deleteFilter(id: number): Promise<Result>;
    edit(entidad: EntriesModel): Promise<Result>;
}
