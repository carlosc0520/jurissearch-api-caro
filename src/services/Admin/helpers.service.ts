import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import procedures from '../configMappers';
import { HelpersModel } from 'src/models/Admin/helpers.model';

@Injectable()
export class HelpersService {
    constructor(
        private connection: DataSource
    ) { }

    async getHead(TIPO : string): Promise<HelpersModel[]> {
        let queryAsync = procedures.ADMIN.HELPERS.CRUD;
        queryAsync += ` @p_nTipo = ${TIPO}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

}
