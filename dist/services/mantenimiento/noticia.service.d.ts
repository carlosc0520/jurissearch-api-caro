import { DataSource } from 'typeorm';
import { Result } from '../../models/result.model';
import { DataTable } from 'src/models/DataTable.model.';
import { NoticiaModel } from 'src/models/Admin/noticia.model';
export declare class NoticiaService {
    private connection;
    constructor(connection: DataSource);
    create(entidad: NoticiaModel): Promise<Result>;
    list(entidad: DataTable): Promise<NoticiaModel[]>;
    delete(id: number, UCRCN: string): Promise<Result>;
    edit(entidad: NoticiaModel): Promise<Result>;
}
