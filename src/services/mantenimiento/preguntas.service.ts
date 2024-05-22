import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import procedures from '../configMappers';
import { Result } from '../../models/result.model';
import { DataTable } from 'src/models/DataTable.model.';
import { PreguntaModel } from 'src/models/Admin/preguntas.model';

@Injectable()
export class PreguntasService {
    constructor(
        private connection: DataSource
    ) { }

    async create(entidad: PreguntaModel): Promise<Result> {

        let queryAsync = procedures.ADMIN.PREGUNTAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Pregunta frecuente agregada correctamente" : "Ocurrió un error al intentar agregar la pregunta frecuente";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar agregar la pregunta frecuente";
            return { MESSAGE, STATUS: false };
        }
    }

    async list(entidad: DataTable): Promise<PreguntaModel[]> {
        let queryAsync = procedures.ADMIN.PREGUNTAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${4},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async delete(id: number, UCRCN: string): Promise<Result> {
        let queryAsync = procedures.ADMIN.PREGUNTAS.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Registro eliminado correctamente" : "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: false };
        }
    }

    async edit(entidad: PreguntaModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.PREGUNTAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad?.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad?.ID}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Pregunta frecuente editada correctamente" : "Ocurrió un error al intentar editar la pregunta frecuente";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar editar la pregunta frecuente";
            return { MESSAGE, STATUS: false };
        }
    }
}
