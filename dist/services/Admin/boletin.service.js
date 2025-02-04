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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoletinService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const configMappers_1 = __importDefault(require("../configMappers"));
const nestjs_ftp_1 = require("nestjs-ftp");
const common_2 = require("@nestjs/common");
let BoletinService = class BoletinService {
    constructor(connection, ftpService) {
        this.connection = connection;
        this.ftpService = ftpService;
    }
    async add(entidad) {
        var _a, _b, _c;
        let queryAsync = configMappers_1.default.ADMIN.BOLETINES.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
        queryAsync += ` @p_cUser = '${entidad.UCRCN}',`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${0}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            const MESSAGE = isSuccess
                ? 'Boletín agregado correctamente'
                : 'Ocurrió un error al intentar agregar el boletín';
            return { MESSAGE, STATUS: isSuccess };
        }
        catch (error) {
            const MESSAGE = ((_c = (_b = error.originalError) === null || _b === void 0 ? void 0 : _b.info) === null || _c === void 0 ? void 0 : _c.message) ||
                'Ocurrió un error al intentar agregar el boletín';
            return { MESSAGE, STATUS: false };
        }
    }
    async list(entidad) {
        let queryAsync = configMappers_1.default.ADMIN.BOLETINES.CRUD;
        queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(Object.assign({}, entidad))}'` : null},`;
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
    async uploadToFtp(file, remotePath) {
        try {
            let nameSimple = file.originalname
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9.]/g, '_');
            const remoteFilePath = `${remotePath}/${nameSimple}`;
            await this.ftpService.upload(file.path, remoteFilePath);
            return remoteFilePath;
        }
        catch (error) {
            console.error('Error al subir archivo:', error);
            throw new Error('Error al subir archivo al servidor FTP.');
        }
    }
    async upload(basePath, file) {
        if (!file) {
            throw new Error('El archivo es obligatorio.');
        }
        return this.uploadToFtp(file, basePath);
    }
    async deleteFile(filePath) {
        try {
            await this.ftpService.delete(filePath);
        }
        catch (error) {
            throw new Error('Error al eliminar archivo.');
        }
    }
};
exports.BoletinService = BoletinService;
exports.BoletinService = BoletinService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_2.Inject)(nestjs_ftp_1.FtpService)),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        nestjs_ftp_1.FtpService])
], BoletinService);
//# sourceMappingURL=boletin.service.js.map