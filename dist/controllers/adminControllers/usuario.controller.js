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
class User {
}
let UsuarioController = class UsuarioController {
    constructor(userService) {
        this.userService = userService;
    }
    async validateToken() {
        return true;
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
        return await this.userService.getUser(req.user.ID);
    }
    async deleteUser(req, ID) {
        return await this.userService.deleteUser(ID, req.user.UCRCN);
    }
    async editUser(req, entidad) {
        entidad.USER = req.user.UCRCN;
        return await this.userService.editUser(entidad);
    }
    async editUserForce(req, entidad) {
        entidad.USER = req.user.UCRCN;
        entidad.ID = req.user.ID;
        return await this.userService.editUser(entidad);
    }
    async addFavoriteUser(req, IDENTRIE) {
        return await this.userService.addFavoriteUser(req.user.UCRCN, req.user.ID, IDENTRIE);
    }
};
exports.UsuarioController = UsuarioController;
__decorate([
    (0, common_1.Get)('validate-token'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
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
    (0, common_1.Post)('edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, User]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "editUser", null);
__decorate([
    (0, common_1.Post)('edit-force'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, User]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "editUserForce", null);
__decorate([
    (0, common_1.Get)('add-favorite'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)("IDENTRIE")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "addFavoriteUser", null);
exports.UsuarioController = UsuarioController = __decorate([
    (0, common_1.Controller)('admin/user'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UsuarioController);
//# sourceMappingURL=usuario.controller.js.map