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
exports.MagistradosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const configMappers_1 = require("../configMappers");
let MagistradosService = class MagistradosService {
    constructor(connection) {
        this.connection = connection;
    }
    async create(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.MAGISTRADOS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Magistrado agregado correctamente" : "Ocurrió un error al intentar agregar el magistrado";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar agregar el magistrado";
            return { MESSAGE, STATUS: false };
        }
    }
    async list(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.MAGISTRADOS.CRUD;
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
    async delete(id, UCRCN) {
        let queryAsync = configMappers_1.default.ADMIN.MAGISTRADOS.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Estado cambiado correctamente" : "Ocurrió un error al intentar cambiar el estado del magistrado";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar cambiar el estado del magistrado";
            return { MESSAGE, STATUS: false };
        }
    }
    async edit(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.MAGISTRADOS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad?.UCRCN},`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${entidad?.ID}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            const MESSAGE = isSuccess ? "Magistrado editado correctamente" : "Ocurrió un error al intentar editar el magistrado";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = error.originalError?.info?.message || "Ocurrió un error al intentar editar el magistrado";
            return { MESSAGE, STATUS: false };
        }
    }
};
exports.MagistradosService = MagistradosService;
exports.MagistradosService = MagistradosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], MagistradosService);
//# sourceMappingURL=magistrados.service.js.map