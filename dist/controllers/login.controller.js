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
exports.LoginController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../services/User/user.service");
const user_model_1 = require("../models/admin/user.model");
const token_service_1 = require("../services/User/token.service");
let LoginController = class LoginController {
    constructor(userService, tokenService) {
        this.userService = userService;
        this.tokenService = tokenService;
    }
    async autenticarUsuario(entidad) {
        console.log("usuario");
        const usuario = await this.userService.loguearUsuario(entidad);
        if (!usuario) {
            throw new common_1.BadRequestException('Usuario no encontrado');
        }
        if (usuario.PASSWORD !== entidad.PASSWORD) {
            throw new common_1.BadRequestException('Contraseña incorrecta');
        }
        const token = this.tokenService.generateToken(usuario);
        usuario.TOKEN = token;
        return usuario;
    }
};
exports.LoginController = LoginController;
__decorate([
    (0, common_1.Post)('autenticar'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_model_1.User]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "autenticarUsuario", null);
exports.LoginController = LoginController = __decorate([
    (0, common_1.Controller)('login'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        token_service_1.TokenService])
], LoginController);
//# sourceMappingURL=login.controller.js.map