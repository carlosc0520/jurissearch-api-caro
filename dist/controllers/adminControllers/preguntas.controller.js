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
exports.PreguntasController = void 0;
const common_1 = require("@nestjs/common");
const DataTable_model_1 = require("../../models/DataTable.model.");
const preguntas_service_1 = require("../../services/mantenimiento/preguntas.service");
const preguntas_model_1 = require("../../models/Admin/preguntas.model");
let PreguntasController = class PreguntasController {
    constructor(preguntasService) {
        this.preguntasService = preguntasService;
    }
    async listaAll(entidad) {
        return await this.preguntasService.list(entidad);
    }
    async deleteUser(req, ID) {
        return await this.preguntasService.delete(ID, req.user.UCRCN);
    }
    async add(req, entidad) {
        try {
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.preguntasService.create(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
    }
    async edit(req, entidad) {
        try {
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.preguntasService.edit(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
    }
};
exports.PreguntasController = PreguntasController;
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable]),
    __metadata("design:returntype", Promise)
], PreguntasController.prototype, "listaAll", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PreguntasController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, preguntas_model_1.PreguntaModel]),
    __metadata("design:returntype", Promise)
], PreguntasController.prototype, "add", null);
__decorate([
    (0, common_1.Post)('edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, preguntas_model_1.PreguntaModel]),
    __metadata("design:returntype", Promise)
], PreguntasController.prototype, "edit", null);
exports.PreguntasController = PreguntasController = __decorate([
    (0, common_1.Controller)('admin/preguntas'),
    __metadata("design:paramtypes", [preguntas_service_1.PreguntasService])
], PreguntasController);
//# sourceMappingURL=preguntas.controller.js.map