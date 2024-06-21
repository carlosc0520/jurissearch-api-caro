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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntriesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const entries_model_1 = require("../../models/Admin/entries.model");
const entries_service_1 = require("../../services/Admin/entries.service");
const multer_1 = require("multer");
const aws_service_1 = require("../../services/Aws/aws.service");
const fs = require("fs");
const DataTable_model_1 = require("../../models/DataTable.model.");
const busqueda_model_1 = require("../../models/Admin/busqueda.model");
let EntriesController = class EntriesController {
    constructor(entriesService, s3Service) {
        this.entriesService = entriesService;
        this.s3Service = s3Service;
    }
    async uploadMultipleFiles(req, entidad, files) {
        try {
            const table = {
                INIT: 0,
                ROWS: 1,
                DESC: null,
                CESTDO: null,
                ID: 0
            };
            const obtener = await this.entriesService.list(table, entidad.TITLE, entidad.TYPE, entidad.TIPO);
            if (obtener.length > 0) {
                return { MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`, STATUS: false };
            }
            const [file1, file2] = files;
            const keysLocation = await this.s3Service.uploadFiles(entidad, file1.filename, file1.path, file2.filename, file2.path);
            entidad.ENTRIEFILE = keysLocation[0];
            entidad.ENTRIEFILERESUMEN = keysLocation[1];
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.entriesService.createEntries(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach(file => {
                fs.unlinkSync(file.path);
            });
        }
    }
    async uploadSingleFile(req, entidad, files) {
        try {
            const table = {
                INIT: 0,
                ROWS: 1,
                DESC: null,
                CESTDO: null,
                ID: 0
            };
            const obtener = await this.entriesService.list(table, entidad.TITLE, entidad.TYPE, entidad.TIPO);
            if (obtener.length > 0) {
                return { MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`, STATUS: false };
            }
            const [file1] = files;
            const keysLocation = await this.s3Service.uploadFile(entidad, file1.filename, file1.path);
            entidad.ENTRIEFILE = keysLocation;
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.entriesService.createEntries(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach(file => {
                fs.unlinkSync(file.path);
            });
        }
    }
    async editMultipleFiles(req, entidad, files) {
        try {
            const table = {
                INIT: 0,
                ROWS: 1,
                DESC: null,
                CESTDO: null,
                ID: entidad.ID
            };
            const obtener = await this.entriesService.list(table, entidad.TITLE, entidad.TYPE, entidad.TIPO);
            if (obtener.length > 0) {
                return { MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`, STATUS: false };
            }
            const [file1, file2] = files;
            if (![undefined, null].includes(file1)) {
                const keysLocation = await this.s3Service.uploadFile(entidad, file1.filename, file1.path);
                entidad.ENTRIEFILE = keysLocation;
            }
            if (![undefined, null].includes(file2)) {
                const keysLocation = await this.s3Service.uploadFile(entidad, file2.filename, file2.path);
                entidad.ENTRIEFILERESUMEN = keysLocation;
            }
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.entriesService.edit(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach(file => {
                fs.unlinkSync(file.path);
            });
        }
    }
    async editSingleFile(req, entidad, files) {
        try {
            const table = {
                INIT: 0,
                ROWS: 1,
                DESC: null,
                CESTDO: null,
                ID: entidad.ID
            };
            const obtener = await this.entriesService.list(table, entidad.TITLE, entidad.TYPE, entidad.TIPO);
            if (obtener.length > 0) {
                return { MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`, STATUS: false };
            }
            const [file1] = files;
            if (![undefined, null].includes(file1)) {
                await this.s3Service.deleteFile(entidad.ENTRIEFILE);
                const keysLocation = await this.s3Service.uploadFile(entidad, file1.filename, file1.path);
                entidad.ENTRIEFILE = keysLocation;
            }
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.entriesService.edit(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach(file => {
                fs.unlinkSync(file.path);
            });
        }
    }
    async listUsers(entidad, TYPE) {
        return await this.entriesService.list(entidad, entidad.DESC, TYPE, null);
    }
    async deleteUser(req, ID) {
        return await this.entriesService.deleteFilter(ID, req.user.UCRCN);
    }
    async Obtener(ID) {
        return await this.entriesService.get(ID);
    }
    async getPrint(ID) {
        return await this.entriesService.getPrint(ID);
    }
    async downloadFile(PATH, res) {
        try {
            const file = await this.s3Service.downloadFile(PATH);
            res.set('Content-Type', 'application/pdf');
            res.send(file);
        }
        catch (error) {
            res.status(500).send('Error al descargar el archivo');
        }
    }
    async busqueda(req, busqueda) {
        busqueda.UEDCN = req.user.UCRCN;
        return await this.entriesService.busqueda(busqueda);
    }
    async busquedaFavorites(req, busqueda) {
        busqueda.UEDCN = req.user.UCRCN;
        busqueda.IDUSR = req.user.ID;
        return await this.entriesService.busquedaFavorites(busqueda);
    }
    async saveTitleEntrie(req, entidad) {
        entidad.UCRCN = req.user.UCRCN;
        return await this.entriesService.saveTitleEntrie(entidad);
    }
};
exports.EntriesController = EntriesController;
__decorate([
    (0, common_1.Post)('add'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                return cb(null, filename);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/pdf$/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Solo se permiten archivos PDF'), false);
            }
        }
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entries_model_1.EntriesModel, Object]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Post)('add-single'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                return cb(null, filename);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/pdf$/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Solo se permiten archivos PDF'), false);
            }
        }
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entries_model_1.EntriesModel, Object]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "uploadSingleFile", null);
__decorate([
    (0, common_1.Post)('edit'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                if (file) {
                    const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                    return cb(null, filename);
                }
            }
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/pdf$/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Solo se permiten archivos PDF'), false);
            }
        }
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entries_model_1.EntriesModel, Array]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "editMultipleFiles", null);
__decorate([
    (0, common_1.Post)('edit-single'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                if (file) {
                    const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                    return cb(null, filename);
                }
            }
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/pdf$/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Solo se permiten archivos PDF'), false);
            }
        }
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entries_model_1.EntriesModel, Array]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "editSingleFile", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('TYPE')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable, String]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('get'),
    __param(0, (0, common_1.Query)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "Obtener", null);
__decorate([
    (0, common_1.Get)('getPrint'),
    __param(0, (0, common_1.Query)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "getPrint", null);
__decorate([
    (0, common_1.Post)('download-file'),
    __param(0, (0, common_1.Body)('PATH')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Get)("busqueda"),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, busqueda_model_1.BusquedaModel]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "busqueda", null);
__decorate([
    (0, common_1.Get)("busqueda-favorites"),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, busqueda_model_1.BusquedaModel]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "busquedaFavorites", null);
__decorate([
    (0, common_1.Post)("save-title-entrie"),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entries_model_1.EntriesModel]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "saveTitleEntrie", null);
exports.EntriesController = EntriesController = __decorate([
    (0, common_1.Controller)('admin/entries'),
    __metadata("design:paramtypes", [entries_service_1.EntriesService,
        aws_service_1.S3Service])
], EntriesController);
//# sourceMappingURL=entries.controller.js.map