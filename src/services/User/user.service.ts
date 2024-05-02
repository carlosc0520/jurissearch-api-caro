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

    async createUser(entidad: User): Promise<User> {
        try {
            // VALIDAR SI EXISTE USUARIO
            let queryAsync = procedures.JURIS?.['createUser'];
            queryAsync += ` @EMAIL = ${entidad?.EMAIL ? `'${entidad.EMAIL}'` : null},`;
            queryAsync += ` @PASSWORD = ${entidad?.PASSWORD ? `'${entidad.PASSWORD}'` : null},`;
            queryAsync += ` @NOMBRES = ${entidad?.NOMBRES ? `'${entidad.NOMBRES}'` : null},`;
            queryAsync += ` @APELLIDO = ${entidad?.APELLIDO ? `'${entidad.APELLIDO}'` : null},`;
            queryAsync += ` @APATERNO = ${entidad?.APATERNO ? `'${entidad.APATERNO}'` : null},`;
            queryAsync += ` @AMATERNO = ${entidad?.AMATERNO ? `'${entidad.AMATERNO}'` : null},`;
            queryAsync += ` @TELEFONO = ${entidad?.TELEFONO ? `'${entidad.TELEFONO}'` : null},`;
            queryAsync += ` @FNACIMIENTO = ${entidad?.FNACIMIENTO ? `'${entidad.FNACIMIENTO}'` : null},`;
            queryAsync += ` @EBLOQUEO = ${entidad?.EBLOQUEO ? `'${entidad.EBLOQUEO}'` : null},`;
            queryAsync += ` @FVCMNTO = ${entidad?.FVCMNTO ? `'${entidad.FVCMNTO}'` : null},`;
            queryAsync += ` @INTENTOS = ${entidad?.INTENTOS ? `'${entidad.INTENTOS}'` : null},`;
            queryAsync += ` @UCRCN = ${entidad?.UCRCN ? `'${entidad.UCRCN}'` : null},`;
            queryAsync += ` @FCRCN = ${entidad?.FCRCN ? `'${entidad.FCRCN}'` : null},`;
            queryAsync += ` @FEDCN = ${entidad?.FEDCN ? `'${entidad.FEDCN}'` : null},`;
            queryAsync += ` @CDESTDO = ${entidad?.CDESTDO ? `'${entidad.CDESTDO}'` : null},`;
            queryAsync += ` @TOKEN =
            ${entidad?.TOKEN ? `'${entidad.TOKEN}'` : null},`;
            queryAsync += ` @IND = ${1}`
            console.log(queryAsync);
            const usuario: User = await this.connection.query(queryAsync)
                .then((result) => result?.[0] ? result[0] : null)
                .catch((error) => error);

        }catch (error) {
            return error;
        }

    }
}
