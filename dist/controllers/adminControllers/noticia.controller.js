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
exports.NoticiaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const aws_service_1 = require("../../services/Aws/aws.service");
const fs = require("fs");
const DataTable_model_1 = require("../../models/DataTable.model.");
const noticia_model_1 = require("../../models/Admin/noticia.model");
const noticia_service_1 = require("../../services/mantenimiento/noticia.service");
let NoticiaController = class NoticiaController {
    constructor(noticiaService, s3Service) {
        this.noticiaService = noticiaService;
        this.s3Service = s3Service;
    }
    async listaAll(entidad) {
        console.log("list");
        return await this.noticiaService.list(entidad);
    }
    async downloadFile(KEY, res) {
        try {
            const file = await this.s3Service.getImage(KEY);
            res.set('Content-Type', 'application/octet-stream');
            res.send(file);
        }
        catch (error) {
            res.status(500).send('Error al descargar el archivo');
        }
    }
    async deleteUser(req, ID) {
        return await this.noticiaService.delete(ID, req.user.UCRCN);
    }
    async addNoticia(req, entidad, files) {
        entidad.UCRCN = req.user.UCRCN;
        try {
            const table = {
                INIT: 0,
                ROWS: 1,
                DESC: entidad.TITULO,
                CESTDO: null,
                ID: 0
            };
            const obtener = await this.noticiaService.list(table);
            if (obtener.length > 0) {
                return {
                    MESSAGE: `Ya existe una noticia con el titulo ${entidad.TITULO}`,
                    STATUS: false
                };
            }
            const [file1] = files;
            const keysLocation = await this.s3Service.uploadImage(entidad, file1.filename, file1.path);
            entidad.IMAGEN = keysLocation;
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.noticiaService.create(entidad);
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
    async editNoticia(req, entidad, files) {
        try {
            const table = {
                INIT: 0,
                ROWS: 1,
                DESC: entidad.TITULO,
                CESTDO: null,
                ID: entidad.ID
            };
            const obtener = await this.noticiaService.list(table);
            if (obtener.length > 0) {
                return { MESSAGE: `Ya existe una noticia con el titulo ${entidad.TITULO}`, STATUS: false };
            }
            const [file1] = files;
            if (![undefined, null].includes(file1)) {
                const keysLocation = await this.s3Service.uploadImage(entidad, file1.filename, file1.path);
                entidad.IMAGEN = keysLocation;
            }
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.noticiaService.edit(entidad);
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
};
exports.NoticiaController = NoticiaController;
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "listaAll", null);
__decorate([
    (0, common_1.Post)("get-image"),
    __param(0, (0, common_1.Body)('KEY')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "deleteUser", null);
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
            if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Solo se permiten imagenes'), false);
            }
        }
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, noticia_model_1.NoticiaModel, Object]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "addNoticia", null);
__decorate([
    (0, common_1.Post)('edit'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                return cb(null, filename);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Solo se permiten imagenes'), false);
            }
        }
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, noticia_model_1.NoticiaModel, Array]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "editNoticia", null);
exports.NoticiaController = NoticiaController = __decorate([
    (0, common_1.Controller)('admin/noticias'),
    __metadata("design:paramtypes", [noticia_service_1.NoticiaService,
        aws_service_1.S3Service])
], NoticiaController);
//# sourceMappingURL=noticia.controller.js.map