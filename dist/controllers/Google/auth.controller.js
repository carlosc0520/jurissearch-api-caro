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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const user_model_1 = require("../../models/Admin/user.model");
const token_service_1 = require("../../services/User/token.service");
const user_service_1 = require("../../services/User/user.service");
const google_auth_guard_1 = require("./google-auth.guard");
const google_auth_guard_register_1 = require("./google-auth.guard.register");
const emailJurisserivce_1 = require("../../services/acompliance/emailJurisserivce");
const linkedin_auth_guard_1 = require("./linkedin-auth.guard");
const linkedin_auth_guard_register_1 = require("./linkedin-auth.guard.register");
let AuthController = class AuthController {
    constructor(userService, tokenService, emailJurisService) {
        this.userService = userService;
        this.tokenService = tokenService;
        this.emailJurisService = emailJurisService;
        this.redirectURL = process.env.URL_FRONT;
        this.redirectURLAPI = process.env.URL_API;
    }
    async googleAuth(req, res) {
    }
    async googleRegister(req, res) {
    }
    async googleAuthRedirect(req, res) {
        const user = req['user'];
        if (!user) {
            res.redirect(`${this.redirectURL}/auth/login?onerror=google&message=Error al iniciar sesión con Google`);
            return;
        }
        const entidad = new user_model_1.User();
        entidad.EMAIL = user.email;
        entidad.PASSWORD = "";
        const usuario = await this.userService.loguearUsuario(entidad);
        if ((usuario === null || usuario === void 0 ? void 0 : usuario['STATUS']) == 0) {
            res.redirect(`${this.redirectURL}/auth/login?onsuccess=false&autentication=google&message=${(usuario === null || usuario === void 0 ? void 0 : usuario['MESSAGE']) || 'Error al iniciar sesión'}`);
            return;
        }
        const token = await this.tokenService.generateToken(usuario, true);
        usuario.TOKEN = token;
        usuario.RTAFTO = process.env.DOMINIO + usuario.RTAFTO;
        res.redirect(`${this.redirectURL}/auth/login?onsuccess=true&autentication=google&message=Autenticación exitosa&accessToken=${token}&user=${JSON.stringify({
            NOMBRES: user.firstName + ' ' + user.lastName,
            EMAIL: user.email,
            RTAFTO: usuario.RTAFTO,
        })}`);
    }
    async googleAuthRedirectRegister(req, res) {
        const user = req['user'];
        if (!user) {
            res.redirect(`${this.redirectURL}/auth/login?onerror=google&message=Error al iniciar sesión con Google`);
            return;
        }
        const entidad = new user_model_1.User();
        entidad.IDROLE = 2;
        entidad.EMAIL = user.email;
        entidad.NOMBRES = user.firstName;
        entidad.APATERNO = user.lastName;
        entidad.AMATERNO = "";
        entidad.TELEFONO = "";
        entidad.FNACIMIENTO = null;
        entidad.PROFESION = "";
        entidad.CARGO = "";
        entidad.DIRECCION = "";
        entidad.RTAFTO = "";
        entidad.USER = entidad.EMAIL.split('@')[0];
        entidad.PLAN = '1';
        entidad.PASSWORD = user.email.split('@')[0];
        entidad.EMAIL = user.email;
        let respuesta = await this.userService.createUser(entidad);
        if ((respuesta === null || respuesta === void 0 ? void 0 : respuesta['STATUS']) == false) {
            res.redirect(`${this.redirectURL}/auth/register?onsuccess=false&autentication=google&message=${(respuesta === null || respuesta === void 0 ? void 0 : respuesta['MESSAGE']) || 'Error al registrarse.'}`);
            return;
        }
        await this.emailJurisService.sendEmailUser(entidad);
        res.redirect(`${this.redirectURL}/auth/register?onsuccess=true&autentication=google&message=Registro exitoso&user=${JSON.stringify({
            NOMBRES: user.firstName + ' ' + user.lastName,
            EMAIL: user.email,
        })}`);
    }
    async linkedinAuth() {
    }
    async linkedinRegister() {
    }
    async linkedinAuthRedirect(req, res) {
        const user = req['user'];
        if (!user) {
            return res.redirect(`${this.redirectURL}/auth/login?onerror=linkedin&message=Error en autenticación con LinkedIn`);
        }
        const entidad = new user_model_1.User();
        entidad.EMAIL = user.email;
        entidad.PASSWORD = "";
        const usuario = await this.userService.loguearUsuario(entidad);
        if ((usuario === null || usuario === void 0 ? void 0 : usuario['STATUS']) == 0) {
            return res.redirect(`${this.redirectURL}/auth/login?onsuccess=false&autentication=linkedin&message=${(usuario === null || usuario === void 0 ? void 0 : usuario['MESSAGE']) || 'Error al iniciar sesión'}`);
        }
        const token = await this.tokenService.generateToken(usuario, true);
        usuario.TOKEN = token;
        usuario.RTAFTO = process.env.DOMINIO + usuario.RTAFTO;
        return res.redirect(`${this.redirectURL}/auth/login?onsuccess=true&autentication=linkedin&message=Autenticación exitosa&accessToken=${token}&user=${JSON.stringify({
            NOMBRES: user.name,
            EMAIL: user.email,
            RTAFTO: usuario.RTAFTO,
        })}`);
    }
    async linkedinAuthRedirectRegister(req, res) {
        const user = req['user'];
        if (!user) {
            return res.redirect(`${this.redirectURL}/auth/login?onerror=linkedin&message=Error al iniciar sesión con LinkedIn`);
        }
        const entidad = new user_model_1.User();
        entidad.IDROLE = 2;
        entidad.EMAIL = user.email;
        entidad.NOMBRES = user.name;
        entidad.APATERNO = "";
        entidad.AMATERNO = "";
        entidad.TELEFONO = "";
        entidad.FNACIMIENTO = null;
        entidad.PROFESION = "";
        entidad.CARGO = "";
        entidad.DIRECCION = "";
        entidad.RTAFTO = "";
        entidad.USER = entidad.EMAIL.split('@')[0];
        entidad.PLAN = '1';
        entidad.PASSWORD = user.email.split('@')[0];
        entidad.EMAIL = user.email;
        let respuesta = await this.userService.createUser(entidad);
        if ((respuesta === null || respuesta === void 0 ? void 0 : respuesta['STATUS']) == false) {
            res.redirect(`${this.redirectURL}/auth/register?onsuccess=false&autentication=linkedin&message=${(respuesta === null || respuesta === void 0 ? void 0 : respuesta['MESSAGE']) || 'Error al registrarse.'}`);
            return;
        }
        await this.emailJurisService.sendEmailUser(entidad);
        res.redirect(`${this.redirectURL}/auth/register?onsuccess=true&autentication=linkedin&message=Registro exitoso&user=${JSON.stringify({
            NOMBRES: user.name,
            EMAIL: user.email,
        })}`);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google-register'),
    (0, common_1.UseGuards)(google_auth_guard_register_1.GoogleRegisterAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleRegister", null);
__decorate([
    (0, common_1.Get)('google/redirect'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthRedirect", null);
__decorate([
    (0, common_1.Get)('google/redirect-register'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google-register')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthRedirectRegister", null);
__decorate([
    (0, common_1.Get)('linkedin'),
    (0, common_1.UseGuards)(linkedin_auth_guard_1.LinkedInAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "linkedinAuth", null);
__decorate([
    (0, common_1.Get)('linkedin-register'),
    (0, common_1.UseGuards)(linkedin_auth_guard_register_1.LinkedRegisterInAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "linkedinRegister", null);
__decorate([
    (0, common_1.Get)('linkedin/redirect'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('linkedin')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "linkedinAuthRedirect", null);
__decorate([
    (0, common_1.Get)('linkedin/redirect-register'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('linkedin-register')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "linkedinAuthRedirectRegister", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        token_service_1.TokenService,
        emailJurisserivce_1.EmailJurisService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map