import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import procedures from '../configMappers';
// import { User } from '../../models/admin/user.model'
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';

class User {
    ID: number;
    USER: string;
    IDROLE: number;
    EMAIL: string;
    PASSWORD: string;
    NOMBRES: string;
    APELLIDO: string;
    APATERNO: string;
    AMATERNO: string;
    TELEFONO: string;
    FNACIMIENTO: Date;
    EBLOQUEO: boolean;
    FVCMNTO: Date;
    INTENTOS: number;
    UCRCN: string;
    FCRCN: Date;
    FEDCN: Date;
    CDESTDO: string;
    TOKEN: string;
}

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

    async createUser(entidad: User): Promise<Result> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad?.USER ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Usuario agregado correctamente" : "Ocurrió un error al intentar agregar el usuario";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar agregar el usuario";
            return { MESSAGE, STATUS: false };
        }
    }

    async editUser(entidad: User): Promise<Result> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad?.USER ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad?.ID}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Usuario editado correctamente" : "Ocurrió un error al intentar editar el usuario";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar editar el usuario";
            return { MESSAGE, STATUS: false };
        }
    }

    async deleteUser(id: number, UCRCN: string): Promise<Result> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Usuario eliminado correctamente" : "Ocurrió un error al intentar eliminar el usuario";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar eliminar el usuario";
            return { MESSAGE, STATUS: false };
        }
    }

    async list(entidad: DataTable, IDROLE: string): Promise<User[]> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify({ ...entidad, IDROLE })}'` : null},`;
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

    async addFavoriteUser(USER: string, IDUSER: number, IDENTRIE: number): Promise<Result> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD;
        let data = {
            IDUSER,
            IDENTRIE
        }

        queryAsync += ` @p_cData = ${data ? `'${JSON.stringify(data)}'` : null},`;
        queryAsync += ` @p_cUser = '${USER}',`;
        queryAsync += ` @p_nTipo = ${5},`;
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

    async getUser(ID: number): Promise<User> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD;
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
}

