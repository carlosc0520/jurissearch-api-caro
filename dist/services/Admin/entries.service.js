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
exports.EntriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const configMappers_1 = __importDefault(require("../configMappers"));
let EntriesService = class EntriesService {
    constructor(connection) {
        this.connection = connection;
    }
    async createEntries(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.ENTRIES.CRUD;
        entidad.RESUMEN = entidad.RESUMEN ? entidad.RESUMEN.replace(/'/g, "''") : entidad.RESUMEN;
        entidad.SHORTSUMMARY = entidad.SHORTSUMMARY ? entidad.SHORTSUMMARY.replace(/'/g, "''") : entidad.SHORTSUMMARY;
        entidad.SUBTEMA = entidad.SUBTEMA ? entidad.SUBTEMA.replace(/'/g, "''") : entidad.SUBTEMA;
        entidad.TEMA = entidad.TEMA ? entidad.TEMA.replace(/'/g, "''") : entidad.TEMA;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Entrada agregada correctamente" : "Ocurrió un error al intentar agregar la entrada";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar agregar la entrada";
            return { MESSAGE, STATUS: false };
        }
    }
    async list(entidad, TITLE, TYPE, TIPO) {
        let queryAsync = configMappers_1.default.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(Object.assign(Object.assign({}, entidad), { TITLE, TYPE, TIPO }))}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${4},`;
        queryAsync += ` @p_nId = ${entidad.ID || 0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    async listData(entidad, TITLE, TYPE, TIPO, BLOG, FRESOLUTION, TEMA, RTITLE) {
        let queryAsync = configMappers_1.default.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(Object.assign(Object.assign({}, entidad), { TITLE, TYPE, TIPO,
            BLOG, FRESOLUTION, TEMA, RTITLE }))}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${4},`;
        queryAsync += ` @p_nId = ${entidad.ID || 0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    async listV(entidad, TITLE, TYPE, TIPO) {
        let queryAsync = configMappers_1.default.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(Object.assign(Object.assign({}, entidad), { TITLE, TYPE, TIPO }))}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${9},`;
        queryAsync += ` @p_nId = ${entidad.ID || 0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    async get(ID) {
        let queryAsync = configMappers_1.default.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${5},`;
        queryAsync += ` @p_nId = ${ID}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result[0] || {};
        }
        catch (error) {
            return error;
        }
    }
    async getPrint(ID) {
        let queryAsync = configMappers_1.default.ADMIN.ENTRIES.CRUD;
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
    async deleteFilter(id, UCRCN) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Entrada eliminada correctamente" : "Ocurrió un error al intentar eliminar la entrada";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar eliminar la entrada";
            return { MESSAGE, STATUS: false };
        }
    }
    async edit(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.ENTRIES.CRUD;
        entidad.RESUMEN = entidad.RESUMEN ? entidad.RESUMEN.replace(/'/g, "''") : entidad.RESUMEN;
        entidad.SHORTSUMMARY = entidad.SHORTSUMMARY ? entidad.SHORTSUMMARY.replace(/'/g, "''") : entidad.SHORTSUMMARY;
        entidad.SUBTEMA = entidad.SUBTEMA ? entidad.SUBTEMA.replace(/'/g, "''") : entidad.SUBTEMA;
        entidad.TEMA = entidad.TEMA ? entidad.TEMA.replace(/'/g, "''") : entidad.TEMA;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad === null || entidad === void 0 ? void 0 : entidad.ID}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Entrada editada correctamente" : "Ocurrió un error al intentar editar la entrada";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar editar la entrada";
            return { MESSAGE, STATUS: false };
        }
    }
    async busqueda(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.BUSQUEDAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UEDCN},`;
        queryAsync += ` @p_nTipo = ${entidad.INDICADOR},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    async busquedaFavorites(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.BUSQUEDAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UEDCN},`;
        queryAsync += ` @p_nTipo = ${3},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    async busquedaFavoritesEntrie(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.BUSQUEDAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UEDCN},`;
        queryAsync += ` @p_nTipo = ${8},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            return result;
        }
        catch (error) {
            return error;
        }
    }
    async addFavorite(IDUSER, IDENTRIE) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${IDUSER},`;
        queryAsync += ` @p_nTipo = ${1},`;
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
    async saveTitleEntrie(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.BUSQUEDAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = '${entidad.UCRCN}',`;
        queryAsync += ` @p_nTipo = ${4},`;
        queryAsync += ` @p_nId = ${entidad.ID}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Título guardado correctamente" : "Ocurrió un error al intentar guardar el título";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar guardar el título";
            return { MESSAGE, STATUS: false };
        }
    }
    async saveDirectory(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.USUARIO.CRUD2;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = '${entidad.UEDCN}',`;
        queryAsync += ` @p_nTipo = ${6},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Directorio guardado correctamente" : "Ocurrió un error al intentar guardar el directorio";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar guardar el directorio";
            return { MESSAGE, STATUS: false };
        }
    }
};
exports.EntriesService = EntriesService;
exports.EntriesService = EntriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], EntriesService);
//# sourceMappingURL=entries.service.js.map