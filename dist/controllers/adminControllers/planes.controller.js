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
exports.PlanesController = void 0;
const common_1 = require("@nestjs/common");
const DataTable_model_1 = require("../../models/DataTable.model.");
const planes_service_1 = require("../../services/mantenimiento/planes.service");
const planes_model_1 = require("../../models/Admin/planes.model");
let PlanesController = class PlanesController {
    constructor(planService) {
        this.planService = planService;
    }
    async listaAll(entidad) {
        return await this.planService.list(entidad);
    }
    async listPlanUser(req, entidad) {
        entidad.IDUSR = req.user.ID;
        return await this.planService.listPlanUser(entidad);
    }
    async deleteUser(req, ID) {
        return await this.planService.delete(ID, req.user.UCRCN);
    }
    async add(req, entidad) {
        try {
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.planService.create(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
    }
    async edit(req, entidad) {
        try {
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.planService.edit(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
    }
};
exports.PlanesController = PlanesController;
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable]),
    __metadata("design:returntype", Promise)
], PlanesController.prototype, "listaAll", null);
__decorate([
    (0, common_1.Get)('listPlanUser'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, DataTable_model_1.DataTable]),
    __metadata("design:returntype", Promise)
], PlanesController.prototype, "listPlanUser", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PlanesController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, planes_model_1.PlanesModel]),
    __metadata("design:returntype", Promise)
], PlanesController.prototype, "add", null);
__decorate([
    (0, common_1.Post)('edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, planes_model_1.PlanesModel]),
    __metadata("design:returntype", Promise)
], PlanesController.prototype, "edit", null);
exports.PlanesController = PlanesController = __decorate([
    (0, common_1.Controller)('admin/planes'),
    __metadata("design:paramtypes", [planes_service_1.PlanesService])
], PlanesController);
//# sourceMappingURL=planes.controller.js.map