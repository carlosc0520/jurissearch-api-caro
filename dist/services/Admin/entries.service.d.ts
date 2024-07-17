import { DataSource } from 'typeorm';
import { Result } from '../../models/result.model';
import { EntriesModel } from 'src/models/Admin/entries.model';
import { DataTable } from 'src/models/DataTable.model.';
import { BusquedaModel } from 'src/models/Admin/busqueda.model';
export declare class EntriesService {
    private connection;
    constructor(connection: DataSource);
    createEntries(entidad: EntriesModel): Promise<Result>;
    list(entidad: DataTable, TITLE: string, TYPE: string, TIPO: string): Promise<EntriesModel[]>;
    listV(entidad: DataTable, TITLE: string, TYPE: string, TIPO: string): Promise<EntriesModel[]>;
    get(ID: number): Promise<EntriesModel>;
    getPrint(ID: number): Promise<EntriesModel>;
    deleteFilter(id: number, UCRCN: string): Promise<Result>;
    edit(entidad: EntriesModel): Promise<Result>;
    busqueda(entidad: BusquedaModel): Promise<EntriesModel[]>;
    busquedaFavorites(entidad: BusquedaModel): Promise<EntriesModel[]>;
    busquedaFavoritesEntrie(entidad: BusquedaModel): Promise<EntriesModel[]>;
    addFavorite(IDUSER: number, IDENTRIE: number): Promise<Result>;
    saveTitleEntrie(entidad: EntriesModel): Promise<Result>;
}
