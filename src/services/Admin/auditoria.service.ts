import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import procedures from '../configMappers';
import { DataTable } from 'src/models/DataTable.model.';
import { AuditoriaModel } from 'src/models/Admin/auditoria.model';

@Injectable()
export class AuditoriaService {
    constructor(
        private connection: DataSource
    ) { }


    async list(entidad: DataTable): Promise<AuditoriaModel[]> {
        let queryAsync = procedures.ADMIN.AUDITORIA.CRUD;
        entidad.TABLA = await this.obtenerTabla(entidad.URL);

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

    async obtenerTabla(nombre: string): Promise<string> {
        let mappers = {
            "NOTICIAS": "JURIS.NOTICIA",
            "PREGUNTAS": "JURIS.PREGUNTAS",
            "USUARIOS": "JURIS.USUARIOS",
            "MAGISTRADOS": "JURIS.MAGISTRADOS",
            "FILTROS": "JURIS.FILTROS",
        }

        return mappers[nombre];
    }

}
