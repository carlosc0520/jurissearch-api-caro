"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const fs = __importStar(require("fs"));
const DataTable_model_1 = require("../../models/DataTable.model.");
const noticia_model_1 = require("../../models/Admin/noticia.model");
const noticia_service_1 = require("../../services/mantenimiento/noticia.service");
const hostinger_service_1 = require("../../services/Aws/hostinger.service");
const user_service_1 = require("../../services/User/user.service");
const email_service_1 = require("../../services/acompliance/email.service");
let NoticiaController = class NoticiaController {
    constructor(noticiaService, usuarioService, emailService, s3Service, hostingerService) {
        this.noticiaService = noticiaService;
        this.usuarioService = usuarioService;
        this.emailService = emailService;
        this.s3Service = s3Service;
        this.hostingerService = hostingerService;
    }
    async listaAll(entidad) {
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
        try {
            const [file1] = files;
            if (!file1)
                return { MESSAGE: 'La imagen es requerida', STATUS: false };
            if (file1) {
                const resultFile = await this.hostingerService.saveFile(file1, 'noticias');
                if (!resultFile.success)
                    return { MESSAGE: 'Error al subir la imagen', STATUS: false };
                entidad.IMAGEN = resultFile.path;
            }
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.noticiaService.create(entidad);
            if (result.STATUS) {
                let usuarios = await this.usuarioService.obtenerEmails({});
                let titleNoticia = entidad.TITULO.replace(/[^a-zA-Z0-9]/g, '-');
                await this.emailService.emailNewNoticias(usuarios, titleNoticia, result.ID, entidad.ENLACE, process.env.DOMINIO + entidad.IMAGEN);
            }
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach(file => {
                try {
                    if (file.path) {
                        fs.unlinkSync(file.path);
                    }
                }
                catch (error) {
                }
            });
        }
    }
    async editNoticia(req, entidad, files) {
        try {
            if (!entidad.ID)
                return { MESSAGE: 'El Identificador es requerido', STATUS: false };
            const [file1] = files;
            if (file1) {
                const deleteFile = await this.hostingerService.deleteFile(entidad.IMAGEN);
                const resultFile = await this.hostingerService.saveFile(file1, 'noticias');
                if (!resultFile.success)
                    return { MESSAGE: 'Error al subir la imagen', STATUS: false };
                entidad.IMAGEN = resultFile.path;
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
                try {
                    fs.unlinkSync(file.path);
                }
                catch (error) {
                    console.log('Error deleting file:', error);
                }
            });
        }
    }
    async listaAutores(entidad) {
        let data = await this.noticiaService.listAutores(entidad);
        data = data.map((item) => {
            return Object.assign(Object.assign({}, item), { RUTA: item['RUTA'] ? process.env.DOMINIO + item['RUTA'] : null });
        });
        return data;
    }
    async addAutor(req, entidad, files) {
        entidad.UCRCN = req.user.UCRCN;
        try {
            const [file1] = files;
            if (file1) {
                const resultFile = await this.hostingerService.saveFile(file1, 'noticias/autores');
                if (!resultFile.success)
                    return { MESSAGE: 'Error al subir la imagen', STATUS: false };
                entidad.RUTA = resultFile.path;
            }
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.noticiaService.createAutor(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                }
                catch (error) {
                    console.log('Error deleting file:', error);
                }
            });
        }
    }
    async editAutor(req, entidad, files) {
        try {
            if (!entidad.ID)
                return { MESSAGE: 'El Identificador es requerido', STATUS: false };
            const [file1] = files;
            if (![undefined, null].includes(file1)) {
                const deleteFile = await this.hostingerService.deleteFile(entidad.RUTA);
                const resultFile = await this.hostingerService.saveFile(file1, 'noticias/autores');
                if (!resultFile.success)
                    return { MESSAGE: 'Error al subir la imagen', STATUS: false };
                entidad.RUTA = resultFile.path;
            }
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.noticiaService.editAutor(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                }
                catch (error) {
                    console.log('Error deleting file:', error);
                }
            });
        }
    }
    async deleteAutor(req, ID) {
        if (!ID)
            return { MESSAGE: 'El Identificador es requerido', STATUS: false };
        return await this.noticiaService.deleteAutor(ID, req.user.UCRCN);
    }
    async listaCategorias(entidad) {
        return await this.noticiaService.listCategorias(entidad);
    }
    async addCategoria(req, entidad) {
        entidad.UCRCN = req.user.UCRCN;
        try {
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.noticiaService.createCategoria(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
    }
    async editCategoria(req, entidad) {
        try {
            if (!entidad.ID)
                return { MESSAGE: 'El Identificador es requerido', STATUS: false };
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.noticiaService.editCategoria(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
    }
    async deleteCategoria(req, ID) {
        if (!ID)
            return { MESSAGE: 'El Identificador es requerido', STATUS: false };
        return await this.noticiaService.deleteCategoria(ID, req.user.UCRCN);
    }
    async listaRecursos(entidad) {
        let data = await this.noticiaService.listRecursos(entidad);
        data = data.map((item) => {
            return Object.assign(Object.assign({}, item), { ENLACE: item.ENLACE ? process.env.DOMINIO + item.ENLACE : null });
        });
        return data;
    }
    async addRecurso(req, entidad, files) {
        try {
            const [file1] = files;
            if (!file1)
                return { MESSAGE: 'El recurso es requerido es requerida', STATUS: false };
            if (file1) {
                const resultFile = await this.hostingerService.saveFile(file1, 'recursos');
                if (!resultFile.success)
                    return { MESSAGE: 'Error al subir el recurso', STATUS: false };
                entidad.ENLACE = resultFile.path;
                entidad.NOMBRE = file1.originalname;
            }
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.noticiaService.createRecurso(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                }
                catch (error) {
                    console.log('Error deleting file:', error);
                }
            });
        }
    }
    async deleteRecurso(req, ID, ENLACE) {
        ENLACE = ENLACE.replace(process.env.DOMINIO, '');
        const deleteFile = await this.hostingerService.deleteFile(ENLACE);
        if (!deleteFile) {
            return { MESSAGE: 'Error al eliminar el recurso', STATUS: false };
        }
        return await this.noticiaService.deleteRecurso(ID, req.user.UCRCN);
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
            destination: './uploads/noticias',
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
            destination: './uploads/noticias',
            filename: function (req, file, cb) {
                if (file) {
                    const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                    return cb(null, filename);
                }
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
__decorate([
    (0, common_1.Get)('list-autores'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "listaAutores", null);
__decorate([
    (0, common_1.Post)('add-autores'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/noticias/autores',
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
    __metadata("design:paramtypes", [Object, noticia_model_1.AutorModel, Object]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "addAutor", null);
__decorate([
    (0, common_1.Post)('edit-autores'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/noticias/autores',
            filename: function (req, file, cb) {
                if (file) {
                    const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                    return cb(null, filename);
                }
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
    __metadata("design:paramtypes", [Object, noticia_model_1.AutorModel, Array]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "editAutor", null);
__decorate([
    (0, common_1.Post)('delete-autores'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "deleteAutor", null);
__decorate([
    (0, common_1.Get)('list-categorias'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "listaCategorias", null);
__decorate([
    (0, common_1.Post)('add-categorias'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, noticia_model_1.CategoriaModel]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "addCategoria", null);
__decorate([
    (0, common_1.Post)('edit-categorias'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, noticia_model_1.CategoriaModel]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "editCategoria", null);
__decorate([
    (0, common_1.Post)('delete-categorias'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "deleteCategoria", null);
__decorate([
    (0, common_1.Get)('list-recursos'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "listaRecursos", null);
__decorate([
    (0, common_1.Post)('add-recursos'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/recursos',
            filename: function (req, file, cb) {
                const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                return cb(null, filename);
            }
        }),
        fileFilter: (req, file, cb) => {
            cb(null, true);
        }
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "addRecurso", null);
__decorate([
    (0, common_1.Post)('delete-recursos'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('ID')),
    __param(2, (0, common_1.Body)('ENLACE')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "deleteRecurso", null);
exports.NoticiaController = NoticiaController = __decorate([
    (0, common_1.Controller)('admin/noticias'),
    __metadata("design:paramtypes", [noticia_service_1.NoticiaService,
        user_service_1.UserService,
        email_service_1.EmailService,
        aws_service_1.S3Service,
        hostinger_service_1.HostingerService])
], NoticiaController);
//# sourceMappingURL=noticia.controller.js.map