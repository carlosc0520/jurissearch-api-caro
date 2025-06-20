import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import procedures from '../configMappers';
// import { User } from '../../models/admin/user.model'
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { ReporteModelEntrie } from 'src/models/Admin/reporte.model';

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
    CARGO: string;
    RESTRICIONES: string;
    DIRECCION: string;
    PROFESION: string;
    UCRCN: string;
    FCRCN: Date;
    FEDCN: Date;
    CDESTDO: string;
    TOKEN: string;
    PLAN?: string;
    DATOS?: string;
    STATUS?: number;
    MESSAGE?: string;
    RTAFTO?: string;
    IDPLN?: number;
}

@Injectable()
export class UserService {
    constructor(
        private connection: DataSource
    ) { }

    async loguearUsuario(entidad: any): Promise<User> {
        try {
            let queryAsync = procedures.JURIS.loguearUsuario;
            queryAsync += ` @EMAIL = ${entidad?.EMAIL ? `'${entidad.EMAIL}'` : null},`;
            queryAsync += ` @PASSWORD = ${entidad?.PASSWORD ? `'${entidad.PASSWORD}'` : null},`;
            queryAsync += ` @IND = ${1}`

            const usuario: User = await this.connection.query(queryAsync)
                .then((result) => result?.[0] ? result[0] : null)
                .catch((error) => error);

            return usuario;
        } catch (error) {
            return error;
        }
    }

    async obtenerUsuario(entidad: User): Promise<User> {
        try {
            let queryAsync = procedures.JURIS.loguearUsuario;
            queryAsync += ` @EMAIL = ${entidad?.EMAIL ? `'${entidad.EMAIL}'` : null},`;
            queryAsync += ` @PASSWORD = ${entidad?.PASSWORD ? `'${entidad.PASSWORD}'` : null},`;
            queryAsync += ` @IND = ${1000}`

            const usuario: User = await this.connection.query(queryAsync)
                .then((result) => result?.[0] ? result[0] : null)
                .catch((error) => error);

            return usuario;
        } catch (error) {
            return error;
        }
    }

    async createUser(entidad: any): Promise<Result> {
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

    async updatePassword(entidad: User): Promise<Result> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = '${"RECOVERY"}',`;
        queryAsync += ` @p_nTipo = ${8},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Contraseña actualizada correctamente" : "Ocurrió un error al intentar actualizar la contraseña";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar actualizar la contraseña";
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

    async deleteFavoriteDirectory (IDDIRECTORIO: number, IDENTRIE: number, UCRCN: string): Promise<Result> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = '${JSON.stringify({ IDDIRECTORIO, IDENTRIE })}',`;
        queryAsync += ` @p_cUser = '${UCRCN}',`;
        queryAsync += ` @p_nTipo = ${10},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Entrada eliminada deL directorio correctamente" : "Ocurrió un error al intentar eliminar la entrada del directorio";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar eliminar la entrada del directorio";
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

    async listUserEmail(): Promise<User[]> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${null},`;
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

    // * FAVORITES
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

    async deleteFavoriteUser(USER: string, IDUSER: number, IDFAV: number): Promise<Result> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD;
        let data = {
            IDUSER,
            IDFAV
        }

        queryAsync += ` @p_cData = ${data ? `'${JSON.stringify(data)}'` : null},`;
        queryAsync += ` @p_cUser = '${USER}',`;
        queryAsync += ` @p_nTipo = ${7},`;
        queryAsync += ` @p_nId = ${IDFAV}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Entrada eliminada de favoritos correctamente" : "Ocurrió un error al intentar eliminar la entrada de favoritos";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar eliminar la entrada de favoritos";
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

    // DIRECTORIOS
    async createDirectory(entidad: any): Promise<Result> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD2;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad?.USER ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Directorio creado correctamente" : "Ocurrió un error al intentar crear el directorio";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar crear el directorio";
            return { MESSAGE, STATUS: false };
        }
    }

    async updateDirectory(entidad: any): Promise<Result> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD2;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad?.USER ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad?.ID}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Directorio editado correctamente" : "Ocurrió un error al intentar editar el directorio";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar editar el directorio";
            return { MESSAGE, STATUS: false };
        }
    }

    async deleteDirectory(DIRECTORIOS: string, USER: any): Promise<Result> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD2;
        queryAsync += ` @p_cData = ${DIRECTORIOS ? `'${JSON.stringify({DIRECTORIOS, IDUSER: USER.ID})}'` : null},`;
        queryAsync += ` @p_cUser = ${USER.UCRCN ? `'${USER.UCRCN}'` : null},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Directorios eliminados correctamente" : "Ocurrió un error al intentar eliminar los directorios";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar eliminar los directorios";
            return { MESSAGE, STATUS: false };
        }
    }


    async sharedDirectory(entidad: any): Promise<Result> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD2;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad?.USER ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${7},`;
        queryAsync += ` @p_nId = ${entidad.ID}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Directorio compartido correctamente" : "Ocurrió un error al intentar compartir el directorio";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar compartir el directorio";
            return { MESSAGE, STATUS: false };
        }
    }

    async listDirectory(IDUSUARIO: number, DSCRPCN: string, TYPE: string): Promise<any> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD2;
        queryAsync += ` @p_cData = '${JSON.stringify({ ID: IDUSUARIO, DSCRPCN, TYPE })}',`;
        queryAsync += ` @p_cUser = ${'USUARIO'},`;
        queryAsync += ` @p_nTipo = ${4},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async listDirectoryAll(IDUSUARIO: number): Promise<any> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD2;
        queryAsync += ` @p_cData = '${JSON.stringify({ ID: IDUSUARIO })}',`;
        queryAsync += ` @p_cUser = ${'USUARIO'},`;
        queryAsync += ` @p_nTipo = ${5},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async reporteEstadisticos(entidad: ReporteModelEntrie): Promise<any> {
        let queryAsync = procedures.ADMIN.REPORTES.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${'USUARIO'},`;
        queryAsync += ` @p_nTipo = ${entidad.IND},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    // * contactos
    async listContactos(entidad: DataTable): Promise<any[]> {
        let queryAsync = procedures.ADMIN.CONTACTOS.CRUD;
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

    async createContactos(entidad: any): Promise<Result> {
        let queryAsync = procedures.ADMIN.CONTACTOS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad?.USER ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Contacto creado correctamente" : "Ocurrió un error al intentar crear el contacto";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar crear el contacto";
            return { MESSAGE, STATUS: false };
        }
    }

    async editContactos(entidad: any): Promise<Result> {
        let queryAsync = procedures.ADMIN.CONTACTOS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad?.USER ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad?.ID}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Contacto editado correctamente" : "Ocurrió un error al intentar editar el contacto";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar editar el contacto";
            return { MESSAGE, STATUS: false };
        }
    }

    async deleteContactos(id: number, UCRCN: string): Promise<Result> {
        let queryAsync = procedures.ADMIN.CONTACTOS.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Contacto eliminado correctamente" : "Ocurrió un error al intentar eliminar el contacto";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar eliminar el contacto";
            return { MESSAGE, STATUS: false };
        }
    }

    async listNotificaciones(entidad: DataTable): Promise<any[]> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${20},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            return result;
        } catch (error) {
            return error;
        }
    }

    async obtenerEmails(entidad: any): Promise<User[]> {
        try {
            let queryAsync = procedures.ADMIN.USUARIO.CRUD;
            queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
            queryAsync += ` @p_cUser = ${entidad?.USER ? `'${entidad.USER}'` : null},`;
            queryAsync += ` @p_nTipo = ${21},`;
            queryAsync += ` @p_nId = ${0}`

            const usuario: any = await this.connection.query(queryAsync)
                .then((result) => result ? result : [])
                .catch((error) => error);
            return usuario;
        }
        catch (error) {
            return error;
        }
    }

    async compartir(entidad: any): Promise<Result> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD3;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad?.USER ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`

        
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Documentos compartidos correctamente" : "Ocurrió un error al intentar compartir los documentos";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar compartir los documentos";
            return { MESSAGE, STATUS: false };
        }
    }

    async listUsersShared(entidad: any): Promise<any[]> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD3;
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


    // subscriptionPayment
    async subscriptionPayment(entidad: any): Promise<Result> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD4;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad?.USER ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Pago de suscripción realizado correctamente" : "Ocurrió un error al intentar realizar el pago de la suscripción";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar realizar el pago de la suscripción";
            return { MESSAGE, STATUS: false };
        }
    }

    async updateView(IDUSR: number): Promise<Result> {
        let queryAsync = procedures.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${IDUSR ? `'${JSON.stringify({ IDUSR })}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${31},`;
        queryAsync += ` @p_nId = ${0}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Vista actualizada correctamente" : "Ocurrió un error al intentar actualizar la vista";
            return { MESSAGE, STATUS: isSuccess };
        } catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar actualizar la vista";
            return { MESSAGE, STATUS: false };
        }
    }
    
}

