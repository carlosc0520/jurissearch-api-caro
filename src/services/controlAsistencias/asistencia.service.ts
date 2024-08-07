import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import procedures from '../configMappers';
import { Result } from '../../models/result.model';
import { DataTable } from 'src/models/DataTable.model.';
import { AsistenciaModel } from 'src/models/controlAsistencias/asistencia.model';
import { EventosModel } from 'src/models/controlAsistencias/eventos.model';
import { AsistentesModel } from 'src/models/controlAsistencias/asistentes.model';

@Injectable()
export class AsistenciaService {
    constructor(
        private connection: DataSource
    ) { }

    async create(entidad: AsistenciaModel): Promise<Result> {

        let queryAsync = procedures.CCFIRMA.ASISTENCIAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${6},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Asistente agregados correctamente" : "Ocurrió un error al intentar registrar los asistentes";
            return { MESSAGE, STATUS: isSuccess, ID: result?.[0]?.RESULT };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar registrar los asistentes";
            return { MESSAGE, STATUS: false };
        }
    }

    async createOne(entidad: AsistenciaModel): Promise<Result> {

        let queryAsync = procedures.CCFIRMA.ASISTENCIAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = '${entidad.UCRCN}',`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            let isNoAgregado = result?.[0]?.RESULT;
            if (isNoAgregado == -1) {
                return { MESSAGE: "El asistente no registrada su entrada para el dia de hoy", STATUS: false };
            }

            if(isNoAgregado == -2){
                return { MESSAGE: "El asistente ya registró su salida", STATUS: false };
            }

            const MESSAGE = isSuccess ? "Asistentia registrada correctamente" : "Ocurrió un error al intentar registrar la asistencia";
            return { MESSAGE, STATUS: isSuccess, ID: result?.[0]?.RESULT };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar registrar la asistencia";
            return { MESSAGE, STATUS: false };
        }
    }

    async list(entidad: DataTable, IDEVENTO: number): Promise<AsistenciaModel[]> {
        let queryAsync = procedures.CCFIRMA.ASISTENCIAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify({ ...entidad, IDEVENTO })}'` : null},`;
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

    async listReporte(entidad: DataTable, IDEVENTO: number, IDPARTICIPANTE: number, PARTICIPANTE: string, INDICADOR: number,FECHA: Date): Promise<AsistenciaModel[]> { 

        let queryAsync = procedures.CCFIRMA.ASISTENCIAS.CRUD2;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify({ ...entidad, IDEVENTO, PARTICIPANTE, IDPARTICIPANTE, INDICADOR, FECHA })}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${INDICADOR},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async listReporteAll(entidad: DataTable, IDEVENTO: number): Promise<AsistenciaModel[]> { 

        let queryAsync = procedures.CCFIRMA.ASISTENCIAS.CRUD2;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify({ ...entidad, IDEVENTO})}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${3},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async fechasEventos(entidad: DataTable, IDEVENTO: number): Promise<AsistenciaModel[]> { 

        let queryAsync = procedures.CCFIRMA.ASISTENCIAS.CRUD3;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify({ ...entidad, IDEVENTO})}'` : null},`;
        queryAsync += ` @p_cUser = "ADMIN_ASISTENCIAS",`;
        queryAsync += ` @p_nTipo = ${3},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }
    
    async createApertura(entidad: AsistenciaModel): Promise<Result> {

        let queryAsync = procedures.CCFIRMA.ASISTENCIAS.CRUD3;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = '${entidad.UCRCN}',`;
        queryAsync += ` @p_nTipo = ${entidad.TIPO},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            let isNoAgregado = result?.[0]?.RESULT;
            if (isNoAgregado == 1) {
                return { MESSAGE: "Evento aperturado correctamente", STATUS: true, ID: result?.[0]?.RESULT };
            }

            if(isNoAgregado == 2){
                return { MESSAGE: "Evento cerrado correctamente", STATUS: true, ID: result?.[0]?.RESULT };
            }

            const MESSAGE = "Ocurrió un error al intentar registrar la asistencia";
            return { MESSAGE, STATUS: isSuccess, ID: result?.[0]?.RESULT };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar registrar la asistencia";
            return { MESSAGE, STATUS: false };
        }
    }

    async listAsistentes(entidad: DataTable, IDEVENTO: number): Promise<AsistenciaModel[]> {
        let queryAsync = procedures.CCFIRMA.ASISTENCIAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify({ ...entidad, IDEVENTO })}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${11},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }


    
    async listAsistencia(entidad: DataTable, IDEVENTO: number, FECHA: Date): Promise<AsistentesModel[]> {
        let queryAsync = procedures.CCFIRMA.ASISTENCIAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify({ ...entidad, IDEVENTO, FECHA})}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${8},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async listEventos(entidad: DataTable): Promise<EventosModel[]> {
        let queryAsync = procedures.CCFIRMA.ASISTENCIAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${5},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async delete(id: number, UCRCN: string): Promise<Result> {
        let queryAsync = procedures.CCFIRMA.ASISTENCIAS.CRUD;
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

}

