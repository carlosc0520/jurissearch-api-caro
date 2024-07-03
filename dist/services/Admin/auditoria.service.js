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
exports.AuditoriaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const configMappers_1 = __importDefault(require("../configMappers"));
let AuditoriaService = class AuditoriaService {
    constructor(connection) {
        this.connection = connection;
    }
    async list(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.AUDITORIA.CRUD;
        entidad.TABLA = await this.obtenerTabla(entidad.URL);
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
    async obtenerTabla(nombre) {
        let mappers = {
            "NOTICIAS": "JURIS.NOTICIA",
            "PREGUNTAS": "JURIS.PREGUNTAS",
            "USUARIOS": "JURIS.USUARIOS",
            "MAGISTRADOS": "JURIS.MAGISTRADOS",
            "FILTROS": "JURIS.FILTROS",
        };
        return mappers[nombre];
    }
};
exports.AuditoriaService = AuditoriaService;
exports.AuditoriaService = AuditoriaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AuditoriaService);
//# sourceMappingURL=auditoria.service.js.map