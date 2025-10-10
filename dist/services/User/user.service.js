"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const configMappers_1 = __importDefault(require("../configMappers"));
class User {
}
let UserService = class UserService {
    constructor(connection) {
        this.connection = connection;
    }
    async loguearUsuario(entidad) {
        try {
            let queryAsync = configMappers_1.default.JURIS.loguearUsuario;
            queryAsync += ` @EMAIL = ${(entidad === null || entidad === void 0 ? void 0 : entidad.EMAIL) ? `'${entidad.EMAIL}'` : null},`;
            queryAsync += ` @PASSWORD = ${(entidad === null || entidad === void 0 ? void 0 : entidad.PASSWORD) ? `'${entidad.PASSWORD}'` : null},`;
            queryAsync += ` @IND = ${1}`;
            const usuario = await this.connection.query(queryAsync)
                .then((result) => (result === null || result === void 0 ? void 0 : result[0]) ? result[0] : null)
                .catch((error) => error);
            return usuario;
        }
        catch (error) {
            return error;
        }
    }
    async obtenerUsuario(entidad) {
        try {
            let queryAsync = configMappers_1.default.JURIS.loguearUsuario;
            queryAsync += ` @EMAIL = ${(entidad === null || entidad === void 0 ? void 0 : entidad.EMAIL) ? `'${entidad.EMAIL}'` : null},`;
            queryAsync += ` @PASSWORD = ${(entidad === null || entidad === void 0 ? void 0 : entidad.PASSWORD) ? `'${entidad.PASSWORD}'` : null},`;
            queryAsync += ` @IND = ${1000}`;
            const usuario = await this.connection.query(queryAsync)
                .then((result) => (result === null || result === void 0 ? void 0 : result[0]) ? result[0] : null)
                .catch((error) => error);
            return usuario;
        }
        catch (error) {
            return error;
        }
    }
    async createUser(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${(entidad === null || entidad === void 0 ? void 0 : entidad.USER) ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Usuario agregado correctamente" : "Ocurrió un error al intentar agregar el usuario";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar agregar el usuario";
            return { MESSAGE, STATUS: false };
        }
    }
    async updatePassword(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = '${"RECOVERY"}',`;
        queryAsync += ` @p_nTipo = ${8},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Contraseña actualizada correctamente" : "Ocurrió un error al intentar actualizar la contraseña";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar actualizar la contraseña";
            return { MESSAGE, STATUS: false };
        }
    }
    async editUser(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${(entidad === null || entidad === void 0 ? void 0 : entidad.USER) ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad === null || entidad === void 0 ? void 0 : entidad.ID}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Usuario editado correctamente" : "Ocurrió un error al intentar editar el usuario";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar editar el usuario";
            return { MESSAGE, STATUS: false };
        }
    }
    async deleteUser(id, UCRCN) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Usuario eliminado correctamente" : "Ocurrió un error al intentar eliminar el usuario";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar eliminar el usuario";
            return { MESSAGE, STATUS: false };
        }
    }
    async deleteFavoriteDirectory(IDDIRECTORIO, IDENTRIE, UCRCN) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = '${JSON.stringify({ IDDIRECTORIO, IDENTRIE })}',`;
        queryAsync += ` @p_cUser = '${UCRCN}',`;
        queryAsync += ` @p_nTipo = ${10},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Entrada eliminada deL directorio correctamente" : "Ocurrió un error al intentar eliminar la entrada del directorio";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar eliminar la entrada del directorio";
            return { MESSAGE, STATUS: false };
        }
    }
    async list(entidad, IDROLE) {
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(Object.assign(Object.assign({}, entidad), { IDROLE }))}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${4},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    async listUserEmail() {
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${11},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    async addFavoriteUser(USER, IDUSER, IDENTRIE) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD;
        let data = {
            IDUSER,
            IDENTRIE
        };
        queryAsync += ` @p_cData = ${data ? `'${JSON.stringify(data)}'` : null},`;
        queryAsync += ` @p_cUser = '${USER}',`;
        queryAsync += ` @p_nTipo = ${5},`;
        queryAsync += ` @p_nId = ${IDENTRIE}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Entrada agregada a favoritos correctamente" : "Ocurrió un error al intentar agregar la entrada a favoritos";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar agregar la entrada a favoritos";
            return { MESSAGE, STATUS: false };
        }
    }
    async deleteFavoriteUser(USER, IDUSER, IDFAV) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD;
        let data = {
            IDUSER,
            IDFAV
        };
        queryAsync += ` @p_cData = ${data ? `'${JSON.stringify(data)}'` : null},`;
        queryAsync += ` @p_cUser = '${USER}',`;
        queryAsync += ` @p_nTipo = ${7},`;
        queryAsync += ` @p_nId = ${IDFAV}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Entrada eliminada de favoritos correctamente" : "Ocurrió un error al intentar eliminar la entrada de favoritos";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar eliminar la entrada de favoritos";
            return { MESSAGE, STATUS: false };
        }
    }
    async getUser(ID) {
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${6},`;
        queryAsync += ` @p_nId = ${ID}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result[0] || {};
        }
        catch (error) {
            return error;
        }
    }
    async createDirectory(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD2;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${(entidad === null || entidad === void 0 ? void 0 : entidad.USER) ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Directorio creado correctamente" : "Ocurrió un error al intentar crear el directorio";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar crear el directorio";
            return { MESSAGE, STATUS: false };
        }
    }
    async updateDirectory(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD2;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${(entidad === null || entidad === void 0 ? void 0 : entidad.USER) ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad === null || entidad === void 0 ? void 0 : entidad.ID}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Directorio editado correctamente" : "Ocurrió un error al intentar editar el directorio";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar editar el directorio";
            return { MESSAGE, STATUS: false };
        }
    }
    async deleteDirectory(DIRECTORIOS, USER) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD2;
        queryAsync += ` @p_cData = ${DIRECTORIOS ? `'${JSON.stringify({ DIRECTORIOS, IDUSER: USER.ID })}'` : null},`;
        queryAsync += ` @p_cUser = ${USER.UCRCN ? `'${USER.UCRCN}'` : null},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Directorios eliminados correctamente" : "Ocurrió un error al intentar eliminar los directorios";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar eliminar los directorios";
            return { MESSAGE, STATUS: false };
        }
    }
    async sharedDirectory(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD2;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${(entidad === null || entidad === void 0 ? void 0 : entidad.USER) ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${7},`;
        queryAsync += ` @p_nId = ${entidad.ID}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Directorio compartido correctamente" : "Ocurrió un error al intentar compartir el directorio";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar compartir el directorio";
            return { MESSAGE, STATUS: false };
        }
    }
    async listDirectory(IDUSUARIO, DSCRPCN, TYPE) {
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD2;
        queryAsync += ` @p_cData = '${JSON.stringify({ ID: IDUSUARIO, DSCRPCN, TYPE })}',`;
        queryAsync += ` @p_cUser = ${'USUARIO'},`;
        queryAsync += ` @p_nTipo = ${4},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    async listDirectoryAll(IDUSUARIO) {
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD2;
        queryAsync += ` @p_cData = '${JSON.stringify({ ID: IDUSUARIO })}',`;
        queryAsync += ` @p_cUser = ${'USUARIO'},`;
        queryAsync += ` @p_nTipo = ${5},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    async reporteEstadisticos(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.REPORTES.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${'USUARIO'},`;
        queryAsync += ` @p_nTipo = ${entidad.IND},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    async listContactos(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.CONTACTOS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${4},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    async createContactos(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.CONTACTOS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${(entidad === null || entidad === void 0 ? void 0 : entidad.USER) ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Contacto creado correctamente" : "Ocurrió un error al intentar crear el contacto";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar crear el contacto";
            return { MESSAGE, STATUS: false };
        }
    }
    async editContactos(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.CONTACTOS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${(entidad === null || entidad === void 0 ? void 0 : entidad.USER) ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad === null || entidad === void 0 ? void 0 : entidad.ID}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Contacto editado correctamente" : "Ocurrió un error al intentar editar el contacto";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar editar el contacto";
            return { MESSAGE, STATUS: false };
        }
    }
    async deleteContactos(id, UCRCN) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.CONTACTOS.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Contacto eliminado correctamente" : "Ocurrió un error al intentar eliminar el contacto";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar eliminar el contacto";
            return { MESSAGE, STATUS: false };
        }
    }
    async listNotificaciones(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${20},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    async obtenerEmails(entidad) {
        try {
            let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD;
            queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
            queryAsync += ` @p_cUser = ${(entidad === null || entidad === void 0 ? void 0 : entidad.USER) ? `'${entidad.USER}'` : null},`;
            queryAsync += ` @p_nTipo = ${21},`;
            queryAsync += ` @p_nId = ${0}`;
            const usuario = await this.connection.query(queryAsync)
                .then((result) => result ? result : [])
                .catch((error) => error);
            return usuario;
        }
        catch (error) {
            return error;
        }
    }
    async compartir(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD3;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${(entidad === null || entidad === void 0 ? void 0 : entidad.USER) ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Documentos compartidos correctamente" : "Ocurrió un error al intentar compartir los documentos";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar compartir los documentos";
            return { MESSAGE, STATUS: false };
        }
    }
    async listUsersShared(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD3;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${4},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    async subscriptionPayment(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD4;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${(entidad === null || entidad === void 0 ? void 0 : entidad.USER) ? `'${entidad.USER}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Pago de suscripción realizado correctamente" : "Ocurrió un error al intentar realizar el pago de la suscripción";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar realizar el pago de la suscripción";
            return { MESSAGE, STATUS: false };
        }
    }
    async payment_list(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD4;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${4},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    async updateView(IDUSR) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD;
        queryAsync += ` @p_cData = ${IDUSR ? `'${JSON.stringify({ IDUSR })}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${31},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Vista actualizada correctamente" : "Ocurrió un error al intentar actualizar la vista";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar actualizar la vista";
            return { MESSAGE, STATUS: false };
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], UserService);
//# sourceMappingURL=user.service.js.map