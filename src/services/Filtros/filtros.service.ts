import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import procedures from '../configMappers';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { FiltrosModel } from 'src/models/Admin/filtros.model';

@Injectable()
export class filtrosService {
    constructor(
        private connection: DataSource
    ) { }


    async list(entidad: DataTable, TIPO: string): Promise<FiltrosModel[]> {
        let queryAsync = procedures.ADMIN.FILTROS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify({ ...entidad, TIPO })}'` : null},`;
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

    async deleteFilter(id: number): Promise<Result> {
        let queryAsync = procedures.ADMIN.FILTROS.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Filtro eliminado correctamente" : "Ocurrió un error al intentar eliminar el filtro";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar eliminar el usuario";
            return { MESSAGE, STATUS: false };
        }
    }

    async createFilter(entidad: FiltrosModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.FILTROS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${'ADMIN' ? `'${'ADMIN'}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Filtro agregado correctamente" : "Ocurrió un error al intentar agregar el filtro";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar agregar el filtro";
            return { MESSAGE, STATUS: false };
        }
    }

    async editFilter(entidad: FiltrosModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.FILTROS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${'ADMIN' ? `'${'ADMIN'}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad?.ID}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Filtro editado correctamente" : "Ocurrió un error al intentar editar el filtro";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar editar el filtro";
            return { MESSAGE, STATUS: false };
        }
    }



}
