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
exports.HelpController = void 0;
const common_1 = require("@nestjs/common");
const DataTable_model_1 = require("../../models/DataTable.model.");
const help_service_1 = require("../../services/mantenimiento/help.service");
const help_model_1 = require("../../models/mantenimiento/help.model");
const planes_service_1 = require("../../services/mantenimiento/planes.service");
const emailJurisserivce_1 = require("../../services/acompliance/emailJurisserivce");
let HelpController = class HelpController {
    constructor(helpService, planService, emailJurisService) {
        this.helpService = helpService;
        this.planService = planService;
        this.emailJurisService = emailJurisService;
    }
    async listFilters(entidad) {
        return await this.helpService.list(entidad);
    }
    async deleteUser(req, ID) {
        return await this.helpService.delete(ID, req.user.UCRCN);
    }
    async addUser(entidad) {
        entidad.UCRCN = entidad.NOMBRES.toString().trim();
        await this.emailJurisService.sendEmailContacto(entidad);
        return await this.helpService.create(entidad);
    }
    async editUser(req, entidad) {
        entidad.UCRCN = req.user.UCRCN;
        return await this.helpService.edit(entidad);
    }
    async listaAll(entidad) {
        return await this.planService.list(entidad);
    }
};
exports.HelpController = HelpController;
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "listFilters", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [help_model_1.HelpModel]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "addUser", null);
__decorate([
    (0, common_1.Post)('edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, help_model_1.HelpModel]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "editUser", null);
__decorate([
    (0, common_1.Get)('listPlanes'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable]),
    __metadata("design:returntype", Promise)
], HelpController.prototype, "listaAll", null);
exports.HelpController = HelpController = __decorate([
    (0, common_1.Controller)('settings/help'),
    __metadata("design:paramtypes", [help_service_1.HelpService,
        planes_service_1.PlanesService,
        emailJurisserivce_1.EmailJurisService])
], HelpController);
//# sourceMappingURL=help.controller.js.map