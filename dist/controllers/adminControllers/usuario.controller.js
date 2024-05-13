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
const user_model_1 = require("../../models/admin/user.model");
const DataTable_model_1 = require("../../models/DataTable.model.");
let UsuarioController = class UsuarioController {
    constructor(userService) {
        this.userService = userService;
    }
    async addUser(entidad) {
        const admin = "ADMIN";
        entidad.USER = entidad.EMAIL.split('@')?.[0] || entidad.EMAIL;
        return await this.userService.createUser(entidad);
    }
    async listUsers(entidad, IDROLE) {
        return await this.userService.list(entidad, IDROLE);
    }
    async deleteUser(ID) {
        return await this.userService.deleteUser(ID);
    }
    async editUser(entidad) {
        const admin = "ADMIN";
        entidad.USER = entidad.EMAIL.split('@')?.[0] || entidad.EMAIL;
        return await this.userService.editUser(entidad);
    }
};
exports.UsuarioController = UsuarioController;
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User]),
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
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Body)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('edit'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "editUser", null);
exports.UsuarioController = UsuarioController = __decorate([
    (0, common_1.Controller)('admin-user'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UsuarioController);
//# sourceMappingURL=usuario.controller.js.map