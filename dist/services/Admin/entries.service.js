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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const configMappers_1 = require("../configMappers");
let EntriesService = class EntriesService {
    constructor(connection) {
        this.connection = connection;
    }
    async createEntries(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${'ADMIN' ? `'${'ADMIN'}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Entrada agregada correctamente" : "Ocurrió un error al intentar agregar la entrada";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar agregar la entrada";
            return { MESSAGE, STATUS: false };
        }
    }
    async list(entidad, TITLE, TYPE, TIPO) {
        let queryAsync = configMappers_1.default.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify({ ...entidad, TITLE, TYPE, TIPO })}'` : null},`;
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
    async deleteFilter(id) {
        let queryAsync = configMappers_1.default.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${null},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Entrada eliminada correctamente" : "Ocurrió un error al intentar eliminar la entrada";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar eliminar la entrada";
            return { MESSAGE, STATUS: false };
        }
    }
    async edit(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.ENTRIES.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${'ADMIN' ? `'${'ADMIN'}'` : null},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad?.ID}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Entrada editada correctamente" : "Ocurrió un error al intentar editar la entrada";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar editar la entrada";
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