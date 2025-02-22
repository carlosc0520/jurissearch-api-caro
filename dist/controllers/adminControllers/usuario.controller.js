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
exports.UsuarioController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../../services/User/user.service");
const DataTable_model_1 = require("../../models/DataTable.model.");
const reporte_model_1 = require("../../models/Admin/reporte.model");
const hostinger_service_1 = require("../../services/Aws/hostinger.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
class User {
}
let UsuarioController = class UsuarioController {
    constructor(userService, hostingerService) {
        this.userService = userService;
        this.hostingerService = hostingerService;
    }
    async validateToken(req) {
        var _a;
        const IDR = req.user.role;
        return {
            STATUS: true,
            DATA: {
                IDR,
                ROLE: IDR === 0 ? 'ADMINISTRADOR' : IDR === 1 ? 'DIGITADOR' : 'USUARIO',
                PERM: ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.PERM) || [],
            },
        };
    }
    async addUser(req, entidad) {
        entidad.USER = req.user.UCRCN;
        entidad.PASSWORD = entidad.APATERNO;
        return await this.userService.createUser(entidad);
    }
    async listUsers(entidad, IDROLE) {
        return await this.userService.list(entidad, IDROLE);
    }
    async getUser(req) {
        let result = await this.userService.getUser(req.user.ID);
        result.RTAFTO = result.RTAFTO ? process.env.DOMINIO + result.RTAFTO : null;
        return result;
    }
    async deleteUser(req, ID) {
        return await this.userService.deleteUser(ID, req.user.UCRCN);
    }
    async deleteFavoriteDirectory(req, IDDIRECTORIO, IDENTRIE) {
        return await this.userService.deleteFavoriteDirectory(IDDIRECTORIO, IDENTRIE, req.user.UCRCN);
    }
    async editUser(req, entidad) {
        entidad.USER = req.user.UCRCN;
        return await this.userService.editUser(entidad);
    }
    async editUserForce(req, entidad, files) {
        entidad.RTAFTO = entidad.RTAFTO ? entidad.RTAFTO.replace(process.env.DOMINIO, '') : null;
        if (files && files.length > 0) {
            let file = files[0];
            if (entidad.RTAFTO)
                await this.hostingerService.deleteFile(entidad.RTAFTO);
            let result = await this.hostingerService.saveFile(file, "usuarios");
            entidad.RTAFTO = result.path;
        }
        entidad.USER = req.user.UCRCN;
        entidad.ID = req.user.ID;
        return await this.userService.editUser(entidad);
    }
    async createDirectory(req, entidad) {
        entidad.USER = req.user.UCRCN;
        entidad.ID = req.user.ID;
        return await this.userService.createDirectory(entidad);
    }
    async sharedDirectory(req, entidad) {
        entidad.USER = req.user.UCRCN;
        entidad.ID = req.user.ID;
        return await this.userService.sharedDirectory(entidad);
    }
    async listDirectory(req, DSCRPCN, TYPE) {
        return await this.userService.listDirectory(req.user.ID, DSCRPCN, TYPE);
    }
    async listDirectoryAll(req) {
        return await this.userService.listDirectoryAll(req.user.ID);
    }
    async addFavoriteUser(req, IDENTRIE) {
        return await this.userService.addFavoriteUser(req.user.UCRCN, req.user.ID, IDENTRIE);
    }
    async reporteEstadisticos(req, entidad) {
        return await this.userService.reporteEstadisticos(entidad);
    }
};
exports.UsuarioController = UsuarioController;
__decorate([
    (0, common_1.Get)('validate-token'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "validateToken", null);
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, User]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "addUser", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('IDROLE')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable, String]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Get)('get'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "getUser", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('delete-favorite-directory'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('IDDIRECTORIO')),
    __param(2, (0, common_1.Body)('IDENTRIE')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "deleteFavoriteDirectory", null);
__decorate([
    (0, common_1.Post)('edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, User]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "editUser", null);
__decorate([
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                return cb(null, filename);
            },
        }),
        limits: { fileSize: 100 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/png|jpg|jpeg|webp|avif/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Solo se permiten archivos de imagen'), false);
            }
        },
    })),
    (0, common_1.Post)('edit-force'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, User, Object]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "editUserForce", null);
__decorate([
    (0, common_1.Post)('add-directory'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "createDirectory", null);
__decorate([
    (0, common_1.Post)('shared-directory'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "sharedDirectory", null);
__decorate([
    (0, common_1.Get)('list-directory'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('DSCRPCN')),
    __param(2, (0, common_1.Query)('TYPE')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "listDirectory", null);
__decorate([
    (0, common_1.Get)('list-directory-all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "listDirectoryAll", null);
__decorate([
    (0, common_1.Get)('add-favorite'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('IDENTRIE')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "addFavoriteUser", null);
__decorate([
    (0, common_1.Get)('reporte-estadisticos'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reporte_model_1.ReporteModelEntrie]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "reporteEstadisticos", null);
exports.UsuarioController = UsuarioController = __decorate([
    (0, common_1.Controller)('admin/user'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        hostinger_service_1.HostingerService])
], UsuarioController);
//# sourceMappingURL=usuario.controller.js.map