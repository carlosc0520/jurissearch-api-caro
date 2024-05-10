import { Injectable, Query } from '@nestjs/common';
import { DataSource } from 'typeorm';
import procedures from '../configMappers';
import { Result } from '../../models/result.model';
import { EntriesModel } from 'src/models/Admin/entries.model';
import { DataTable } from 'src/models/DataTable.model.';

@Injectable()
export class EntriesService {
    constructor(
        private connection: DataSource
    ) { }


    async createEntries(entidad: EntriesModel): Promise<Result> {

        let queryAsync = procedures.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${'ADMIN' ? `'${'ADMIN'}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Entrada agregada correctamente" : "Ocurrió un error al intentar agregar la entrada";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar agregar la entrada";
            return { MESSAGE, STATUS: false };
        }
    }


    async list(entidad: DataTable, TITLE: string, TYPE: string, TIPO: string): Promise<EntriesModel[]> {
        let queryAsync = procedures.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify({ ...entidad, TITLE, TYPE, TIPO })}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${4},`
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async get(ID: number): Promise<EntriesModel> {
        let queryAsync = procedures.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${5},`;
        queryAsync += ` @p_nId = ${ID}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result[0] || {};
        } catch (error) {
            return error;
        }
    }

    async deleteFilter(id: number): Promise<Result> {
        let queryAsync = procedures.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Entrada eliminada correctamente" : "Ocurrió un error al intentar eliminar la entrada";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar eliminar la entrada";
            return { MESSAGE, STATUS: false };
        }
    }

    async edit(entidad: EntriesModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${'ADMIN' ? `'${'ADMIN'}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad?.ID}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Entrada editada correctamente" : "Ocurrió un error al intentar editar la entrada";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar editar la entrada";
            return { MESSAGE, STATUS: false };
        }
    }



}
