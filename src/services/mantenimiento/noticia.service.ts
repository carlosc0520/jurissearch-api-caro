import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import procedures from '../configMappers';
import { Result } from '../../models/result.model';
import { DataTable } from 'src/models/DataTable.model.';
import { NoticiaModel } from 'src/models/Admin/noticia.model';

@Injectable()
export class NoticiaService {
    constructor(
        private connection: DataSource
    ) { }

    async create(entidad: NoticiaModel): Promise<Result> {

        let queryAsync = procedures.ADMIN.NOTICIA.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Noticia agregada correctamente" : "Ocurrió un error al intentar agregar la noticia";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar agregar la noticia";
            return { MESSAGE, STATUS: false };
        }
    }

    async list(entidad: DataTable): Promise<NoticiaModel[]> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD;
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
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Estado cambiado correctamente" : "Ocurrió un error al intentar cambiar el estado de la noticia";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar cambiar el estado de la noticia";
            return { MESSAGE, STATUS: false };
        }
    }

    async edit(entidad: NoticiaModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.NOTICIA.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad?.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad?.ID}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Noticia editada correctamente" : "Ocurrió un error al intentar editar la noticia";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar editar la noticia";
            return { MESSAGE, STATUS: false };
        }
    }
}
