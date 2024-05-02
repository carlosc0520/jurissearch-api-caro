import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import procedures from '../configMappers';
import { User } from '../../models/user.model'

@Injectable()
export class UserService {
    constructor(
        private connection: DataSource
    ) { }

    async loguearUsuario(entidad: User): Promise<User> {
        try {
            // VALIDAR SI EXISTE USUARIO
            let queryAsync = procedures.JURIS.loguearUsuario;
            queryAsync += ` @EMAIL = ${entidad?.EMAIL ? `'${entidad.EMAIL}'` : null},`;
            queryAsync += ` @PASSWORD = ${entidad?.PASSWORD ? `'${entidad.PASSWORD}'` : null},`;
            queryAsync += ` @IND = ${1}`

            const usuario: User = await this.connection.query(queryAsync)
                .then((result) => result?.[0] ? result[0] : null)
                .catch((error) => error);

            // VALIDAR QUE EXISTA EL USUARIO
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }

            return usuario;
        } catch (error) {
            return error;
        }
    }
}
