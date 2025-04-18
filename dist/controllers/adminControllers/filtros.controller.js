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
exports.FiltrosController = void 0;
const common_1 = require("@nestjs/common");
const DataTable_model_1 = require("../../models/DataTable.model.");
const filtros_service_1 = require("../../services/Filtros/filtros.service");
const filtros_model_1 = require("../../models/Admin/filtros.model");
let FiltrosController = class FiltrosController {
    constructor(filtrosService) {
        this.filtrosService = filtrosService;
    }
    async listFilters(entidad, TIPO, ESTADO) {
        return await this.filtrosService.list(entidad, TIPO, ESTADO);
    }
    async addUser(req, entidad) {
        entidad.UCRCN = req.user.UCRCN;
        return await this.filtrosService.createFilter(entidad);
    }
    async deleteUser(req, ID) {
        return await this.filtrosService.deleteFilter(ID, req.user.UCRCN);
    }
    async editUser(req, entidad) {
        entidad.UCRCN = req.user.UCRCN;
        return await this.filtrosService.editFilter(entidad);
    }
};
exports.FiltrosController = FiltrosController;
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('TIPO')),
    __param(2, (0, common_1.Query)("ESTADO")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable, String, String]),
    __metadata("design:returntype", Promise)
], FiltrosController.prototype, "listFilters", null);
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, filtros_model_1.FiltrosModel]),
    __metadata("design:returntype", Promise)
], FiltrosController.prototype, "addUser", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], FiltrosController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, filtros_model_1.FiltrosModel]),
    __metadata("design:returntype", Promise)
], FiltrosController.prototype, "editUser", null);
exports.FiltrosController = FiltrosController = __decorate([
    (0, common_1.Controller)('admin/filtros'),
    __metadata("design:paramtypes", [filtros_service_1.filtrosService])
], FiltrosController);
//# sourceMappingURL=filtros.controller.js.map