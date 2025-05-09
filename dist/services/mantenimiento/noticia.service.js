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
exports.NoticiaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const configMappers_1 = __importDefault(require("../configMappers"));
let NoticiaService = class NoticiaService {
    constructor(connection) {
        this.connection = connection;
    }
    async create(entidad) {
        var _a, _b, _c, _d;
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const ID = (_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT;
            const isSuccess = ((_b = result === null || result === void 0 ? void 0 : result[0]) === null || _b === void 0 ? void 0 : _b.RESULT) > 0;
            const MESSAGE = isSuccess ? "Noticia agregada correctamente" : "Ocurrió un error al intentar agregar la noticia";
            return { MESSAGE, STATUS: isSuccess, ID };
        }
        catch (error) {
            const MESSAGE = ((_d = (_c = error.originalError) === null || _c === void 0 ? void 0 : _c.info) === null || _d === void 0 ? void 0 : _d.message) || "Ocurrió un error al intentar agregar la noticia";
            return { MESSAGE, STATUS: false };
        }
    }
    async list(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD;
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
    async listNoticias(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
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
    async delete(id, UCRCN) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Registro eliminado correctamente" : "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: false };
        }
    }
    async edit(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD;
        let jsonData = JSON.stringify(entidad).replace(/'/g, "''");
        queryAsync += ` @p_cData = ${entidad ? `'${jsonData}'` : null},`;
        queryAsync += ` @p_cUser = '${entidad === null || entidad === void 0 ? void 0 : entidad.UCRCN}',`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad === null || entidad === void 0 ? void 0 : entidad.ID}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Noticia editada correctamente" : "Ocurrió un error al intentar editar la noticia";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar editar la noticia";
            return { MESSAGE, STATUS: false };
        }
    }
    async listAutores(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD2;
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
    async createAutor(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD2;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Autor agregado correctamente" : "Ocurrió un error al intentar agregar el autor";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar agregar el autor";
            return { MESSAGE, STATUS: false };
        }
    }
    async editAutor(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD2;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad === null || entidad === void 0 ? void 0 : entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad === null || entidad === void 0 ? void 0 : entidad.ID}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Autor editado correctamente" : "Ocurrió un error al intentar editar el autor";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar editar el autor";
            return { MESSAGE, STATUS: false };
        }
    }
    async deleteAutor(id, UCRCN) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD2;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Registro eliminado correctamente" : "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: false };
        }
    }
    async listCategorias(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD3;
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
    async createCategoria(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD3;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Categoria agregada correctamente" : "Ocurrió un error al intentar agregar la categoria";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar agregar la categoria";
            return { MESSAGE, STATUS: false };
        }
    }
    async editCategoria(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD3;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad === null || entidad === void 0 ? void 0 : entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad === null || entidad === void 0 ? void 0 : entidad.ID}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Categoria editada correctamente" : "Ocurrió un error al intentar editar la categoria";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar editar la categoria";
            return { MESSAGE, STATUS: false };
        }
    }
    async deleteCategoria(id, UCRCN) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD3;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Registro eliminado correctamente" : "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: false };
        }
    }
    async listRecursos(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD4;
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
    async createRecurso(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD4;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Recurso agregado correctamente" : "Ocurrió un error al intentar agregar el recurso";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar agregar el recurso";
            return { MESSAGE, STATUS: false };
        }
    }
    async deleteRecurso(id, UCRCN) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.NOTICIA.CRUD4;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Registro eliminado correctamente" : "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar eliminar el registro";
            return { MESSAGE, STATUS: false };
        }
    }
};
exports.NoticiaService = NoticiaService;
exports.NoticiaService = NoticiaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], NoticiaService);
//# sourceMappingURL=noticia.service.js.map