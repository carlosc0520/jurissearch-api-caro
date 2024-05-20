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
const DataTable_model_1 = require("../../models/DataTable.model.");
const noticia_model_1 = require("../../models/Admin/noticia.model");
const noticia_service_1 = require("../../services/mantenimiento/noticia.service");
let NoticiaController = class NoticiaController {
    constructor(noticiaService) {
        this.noticiaService = noticiaService;
    }
    async listaAll(entidad) {
        return await this.noticiaService.list(entidad);
    }
    async deleteUser(req, ID) {
        return await this.noticiaService.delete(ID, req.user.UCRCN);
    }
    async addUser(req, entidad) {
        entidad.UCRCN = req.user.UCRCN;
        return await this.noticiaService.create(entidad);
    }
    async editUser(req, entidad) {
        entidad.UCRCN = req.user.UCRCN;
        return await this.noticiaService.edit(entidad);
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
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, noticia_model_1.NoticiaModel]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "addUser", null);
__decorate([
    (0, common_1.Post)('edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, noticia_model_1.NoticiaModel]),
    __metadata("design:returntype", Promise)
], NoticiaController.prototype, "editUser", null);
exports.NoticiaController = NoticiaController = __decorate([
    (0, common_1.Controller)('admin/noticias'),
    __metadata("design:paramtypes", [noticia_service_1.NoticiaService])
], NoticiaController);
//# sourceMappingURL=noticia.controller.js.map