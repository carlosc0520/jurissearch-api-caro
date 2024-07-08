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
exports.AsistenciaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const configMappers_1 = __importDefault(require("../configMappers"));
let AsistenciaService = class AsistenciaService {
    constructor(connection) {
        this.connection = connection;
    }
    async create(entidad) {
        var _a, _b, _c, _d;
        let queryAsync = configMappers_1.default.CCFIRMA.ASISTENCIAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = ${entidad.UCRCN},`;
        queryAsync += ` @p_nTipo = ${6},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Asistente agregados correctamente" : "Ocurrió un error al intentar registrar los asistentes";
            return { MESSAGE, STATUS: isSuccess, ID: (_b = result === null || result === void 0 ? void 0 : result[0]) === null || _b === void 0 ? void 0 : _b.RESULT };
        }
        catch (error) {
            const MESSAGE = ((_d = (_c = error.originalError) === null || _c === void 0 ? void 0 : _c.info) === null || _d === void 0 ? void 0 : _d.message) || "Ocurrió un error al intentar registrar los asistentes";
            return { MESSAGE, STATUS: false };
        }
    }
    async createOne(entidad) {
        var _a, _b, _c, _d, _e;
        let queryAsync = configMappers_1.default.CCFIRMA.ASISTENCIAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = '${entidad.UCRCN}',`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            let isNoAgregado = (_b = result === null || result === void 0 ? void 0 : result[0]) === null || _b === void 0 ? void 0 : _b.RESULT;
            if (isNoAgregado == -1) {
                return { MESSAGE: "El asistente no registrada su entrada para el dia de hoy", STATUS: false };
            }
            if (isNoAgregado == -2) {
                return { MESSAGE: "El asistente ya registró su salida", STATUS: false };
            }
            const MESSAGE = isSuccess ? "Asistentia registrada correctamente" : "Ocurrió un error al intentar registrar la asistencia";
            return { MESSAGE, STATUS: isSuccess, ID: (_c = result === null || result === void 0 ? void 0 : result[0]) === null || _c === void 0 ? void 0 : _c.RESULT };
        }
        catch (error) {
            const MESSAGE = ((_e = (_d = error.originalError) === null || _d === void 0 ? void 0 : _d.info) === null || _e === void 0 ? void 0 : _e.message) || "Ocurrió un error al intentar registrar la asistencia";
            return { MESSAGE, STATUS: false };
        }
    }
    async list(entidad, IDEVENTO) {
        let queryAsync = configMappers_1.default.CCFIRMA.ASISTENCIAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(Object.assign(Object.assign({}, entidad), { IDEVENTO }))}'` : null},`;
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
    async listAsistentes(entidad, IDEVENTO) {
        let queryAsync = configMappers_1.default.CCFIRMA.ASISTENCIAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(Object.assign(Object.assign({}, entidad), { IDEVENTO }))}'` : null},`;
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
    async listAsistencia(entidad, IDEVENTO, FECHA) {
        let queryAsync = configMappers_1.default.CCFIRMA.ASISTENCIAS.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(Object.assign(Object.assign({}, entidad), { IDEVENTO, FECHA }))}'` : null},`;
        queryAsync += ` @p_cUser = ${null},`;
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
    async listEventos(entidad) {
        let queryAsync = configMappers_1.default.CCFIRMA.ASISTENCIAS.CRUD;
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
        let queryAsync = configMappers_1.default.CCFIRMA.ASISTENCIAS.CRUD;
        queryAsync += ` @p_cData = ${null},`;
        queryAsync += ` @p_cUser = ${UCRCN},`;
        queryAsync += ` @p_nTipo = ${2},`;
        queryAsync += ` @p_nId = ${id}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess ? "Estado cambiado correctamente" : "Ocurrió un error al intentar cambiar el estado del magistrado";
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) || "Ocurrió un error al intentar cambiar el estado del magistrado";
            return { MESSAGE, STATUS: false };
        }
    }
};
exports.AsistenciaService = AsistenciaService;
exports.AsistenciaService = AsistenciaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AsistenciaService);
//# sourceMappingURL=asistencia.service.js.map