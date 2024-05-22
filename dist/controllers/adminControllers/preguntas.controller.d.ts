import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { PreguntasService } from 'src/services/mantenimiento/preguntas.service';
import { PreguntaModel } from 'src/models/Admin/preguntas.model';
export declare class PreguntasController {
    private readonly preguntasService;
    constructor(preguntasService: PreguntasService);
    listaAll(entidad: DataTable): Promise<PreguntaModel[]>;
    deleteUser(req: any, ID: number): Promise<Result>;
    add(req: any, entidad: PreguntaModel): Promise<Result>;
    edit(req: any, entidad: PreguntaModel): Promise<Result>;
}
