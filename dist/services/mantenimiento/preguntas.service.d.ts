import { DataSource } from 'typeorm';
import { Result } from '../../models/result.model';
import { DataTable } from 'src/models/DataTable.model.';
import { PreguntaModel } from 'src/models/Admin/preguntas.model';
export declare class PreguntasService {
    private connection;
    constructor(connection: DataSource);
    create(entidad: PreguntaModel): Promise<Result>;
    list(entidad: DataTable): Promise<PreguntaModel[]>;
    delete(id: number, UCRCN: string): Promise<Result>;
    edit(entidad: PreguntaModel): Promise<Result>;
}
