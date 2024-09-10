import { Injectable, Query } from '@nestjs/common';
import { DataSource } from 'typeorm';
import procedures from '../configMappers';
import { Result } from '../../models/result.model';
import { EntriesModel } from 'src/models/Admin/entries.model';
import { DataTable } from 'src/models/DataTable.model.';
import { BusquedaModel } from 'src/models/Admin/busqueda.model';

@Injectable()
export class EntriesService {
    constructor(
        private connection: DataSource
    ) { }


    async createEntries(entidad: EntriesModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.ENTRIES.CRUD;
        entidad.RESUMEN = entidad.RESUMEN ? entidad.RESUMEN.replace(/'/g, "''") : entidad.RESUMEN;
        entidad.SHORTSUMMARY = entidad.SHORTSUMMARY ? entidad.SHORTSUMMARY.replace(/'/g, "''") : entidad.SHORTSUMMARY;
        entidad.SUBTEMA = entidad.SUBTEMA ? entidad.SUBTEMA.replace(/'/g, "''") : entidad.SUBTEMA;
        entidad.TEMA = entidad.TEMA ? entidad.TEMA.replace(/'/g, "''") : entidad.TEMA;

        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
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
        queryAsync += ` @p_nId = ${entidad.ID || 0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async listData(entidad: DataTable, TITLE: string, TYPE: string, TIPO: string,
        BLOG: string, FRESOLUTION: string, TEMA: string, RTITLE: string
    ): Promise<EntriesModel[]> {
        let queryAsync = procedures.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify({
            ...entidad, TITLE, TYPE, TIPO,
            BLOG, FRESOLUTION, TEMA, RTITLE
        })}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${4},`
        queryAsync += ` @p_nId = ${entidad.ID || 0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }


    async listSearchData(RTITLE: string, TYPE: number
    ): Promise<EntriesModel[]> {
        let queryAsync = procedures.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = '${JSON.stringify({ RTITLE, TYPE })}',`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${12},`
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async listV(entidad: DataTable, TITLE: string, TYPE: string, TIPO: string): Promise<EntriesModel[]> {
        let queryAsync = procedures.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify({ ...entidad, TITLE, TYPE, TIPO })}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${9},`
        queryAsync += ` @p_nId = ${entidad.ID || 0}`;

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

    async getPrint(ID: number): Promise<EntriesModel> {
        let queryAsync = procedures.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${6},`;
        queryAsync += ` @p_nId = ${ID}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result[0] || {};
        } catch (error) {
            return error;
        }
    }

    async deleteFilter(id: number, UCRCN: string): Promise<Result> {
        let queryAsync = procedures.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
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
        entidad.RESUMEN = entidad.RESUMEN ? entidad.RESUMEN.replace(/'/g, "''") : entidad.RESUMEN;
        entidad.SHORTSUMMARY = entidad.SHORTSUMMARY ? entidad.SHORTSUMMARY.replace(/'/g, "''") : entidad.SHORTSUMMARY;
        entidad.SUBTEMA = entidad.SUBTEMA ? entidad.SUBTEMA.replace(/'/g, "''") : entidad.SUBTEMA;
        entidad.TEMA = entidad.TEMA ? entidad.TEMA.replace(/'/g, "''") : entidad.TEMA;
        
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
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

    // ************************** PARTE 2 BUSQUEDAS **************************
    async busqueda(entidad: BusquedaModel): Promise<EntriesModel[]> {
        let queryAsync = procedures.ADMIN.BUSQUEDAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UEDCN},`;
        queryAsync += ` @p_nTipo = ${entidad.INDICADOR},`
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async busquedaFavorites(entidad: BusquedaModel): Promise<EntriesModel[]> {
        let queryAsync = procedures.ADMIN.BUSQUEDAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UEDCN},`;
        queryAsync += ` @p_nTipo = ${3},`
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async busquedaFavoritesEntrie(entidad: BusquedaModel): Promise<EntriesModel[]> {
        let queryAsync = procedures.ADMIN.BUSQUEDAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UEDCN},`;
        queryAsync += ` @p_nTipo = ${8},`
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async addFavorite(IDUSER: number, IDENTRIE: number): Promise<Result> {
        let queryAsync = procedures.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${IDUSER},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${IDENTRIE}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Entrada agregada a favoritos correctamente" : "Ocurrió un error al intentar agregar la entrada a favoritos";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar agregar la entrada a favoritos";
            return { MESSAGE, STATUS: false };
        }
    }

    async saveTitleEntrie(entidad: EntriesModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.BUSQUEDAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = '${entidad.UCRCN}',`;
        queryAsync += ` @p_nTipo = ${4},`;
        queryAsync += ` @p_nId = ${entidad.ID}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Título guardado correctamente" : "Ocurrió un error al intentar guardar el título";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar guardar el título";
            return { MESSAGE, STATUS: false };
        }
    }

    async saveDirectory(entidad: BusquedaModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD2;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = '${entidad.UEDCN}',`;
        queryAsync += ` @p_nTipo = ${6},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Directorio guardado correctamente" : "Ocurrió un error al intentar guardar el directorio";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar guardar el directorio";
            return { MESSAGE, STATUS: false };
        }
    }

}
