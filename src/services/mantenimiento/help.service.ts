import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import procedures from '../configMappers';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { HelpModel } from '../../models/mantenimiento/help.model';

@Injectable()
export class HelpService {
    constructor(
        private connection: DataSource
    ) { }

    async create(entidad: HelpModel): Promise<Result> {

        let queryAsync = procedures.ADMIN.HELP.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = '${entidad.UCRCN}',`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Se registró su solicitud correctamente" : "Ocurrió un error al intentar registrar su solicitud";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar registrar su solicitud";
            return { MESSAGE, STATUS: false };
        }
    }

    async list(entidad: DataTable): Promise<HelpModel[]> {
        let queryAsync = procedures.ADMIN.HELP.CRUD;
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
        let queryAsync = procedures.ADMIN.HELP.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
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

    async edit(entidad: HelpModel): Promise<Result> {
        let queryAsync = procedures.ADMIN.HELP.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad?.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad?.ID}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Se atendio la solicitud correctamente" : "Ocurrió un error al intentar editar el magistrado";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar editar la solicitud";
            return { MESSAGE, STATUS: false };
        }
    }
}
