import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import procedures from '../configMappers';
import { Result } from '../../models/result.model';
import { DataTable } from 'src/models/DataTable.model.';
import { MagistradosModel } from 'src/models/Admin/magistrados.model';

@Injectable()
export class MagistradosService {
    constructor(
        private connection: DataSource
    ) { }

    async create(entidad: MagistradosModel): Promise<Result> {

        let queryAsync = procedures.ADMIN.MAGISTRADOS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${'ADMIN' ? `'${'ADMIN'}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Magistrado agregado correctamente" : "Ocurrió un error al intentar agregar el magistrado";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar agregar el magistrado";
            return { MESSAGE, STATUS: false };
        }
    }

    async list(entidad: DataTable): Promise<MagistradosModel[]> {
        let queryAsync = procedures.ADMIN.MAGISTRADOS.CRUD;
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

    async delete(id: number): Promise<Result> {
        let queryAsync = procedures.ADMIN.MAGISTRADOS.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Estado cambiado correctamente" : "Ocurrió un error al intentar cambiar el estado del magistrado";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar cambiar el estado del magistrado";
            return { MESSAGE, STATUS: false };
        }
    }

    async edit(entidad: MagistradosModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.MAGISTRADOS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${'ADMIN' ? `'${'ADMIN'}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad?.ID}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Magistrado editado correctamente" : "Ocurrió un error al intentar editar el magistrado";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar editar el magistrado";
            return { MESSAGE, STATUS: false };
        }
    }
}
