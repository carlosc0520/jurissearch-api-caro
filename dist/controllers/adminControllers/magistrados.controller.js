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
exports.MagistradoController = void 0;
const common_1 = require("@nestjs/common");
const DataTable_model_1 = require("../../models/DataTable.model.");
const magistrados_service_1 = require("../../services/Admin/magistrados.service");
const magistrados_model_1 = require("../../models/Admin/magistrados.model");
let MagistradoController = class MagistradoController {
    constructor(magistradoService) {
        this.magistradoService = magistradoService;
    }
    async listFilters(entidad, ESTADO) {
        return await this.magistradoService.list(entidad, ESTADO);
    }
    async deleteUser(req, ID) {
        return await this.magistradoService.delete(ID, req.user.UCRCN);
    }
    async addUser(req, entidad) {
        entidad.UCRCN = req.user.UCRCN;
        return await this.magistradoService.create(entidad);
    }
    async editUser(req, entidad) {
        entidad.UCRCN = req.user.UCRCN;
        return await this.magistradoService.edit(entidad);
    }
};
exports.MagistradoController = MagistradoController;
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)("ESTADO")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable, String]),
    __metadata("design:returntype", Promise)
], MagistradoController.prototype, "listFilters", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], MagistradoController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, magistrados_model_1.MagistradosModel]),
    __metadata("design:returntype", Promise)
], MagistradoController.prototype, "addUser", null);
__decorate([
    (0, common_1.Post)('edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, magistrados_model_1.MagistradosModel]),
    __metadata("design:returntype", Promise)
], MagistradoController.prototype, "editUser", null);
exports.MagistradoController = MagistradoController = __decorate([
    (0, common_1.Controller)('admin/magistrados'),
    __metadata("design:paramtypes", [magistrados_service_1.MagistradosService])
], MagistradoController);
//# sourceMappingURL=magistrados.controller.js.map