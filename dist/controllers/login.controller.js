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
const token_service_1 = require("../services/User/token.service");
const noticia_service_1 = require("../services/mantenimiento/noticia.service");
const DataTable_model_1 = require("../models/DataTable.model.");
const aws_service_1 = require("../services/Aws/aws.service");
const preguntas_service_1 = require("../services/mantenimiento/preguntas.service");
class User {
}
let LoginController = class LoginController {
    constructor(userService, tokenService, noticiaService, preguntaService, s3Service) {
        this.userService = userService;
        this.tokenService = tokenService;
        this.noticiaService = noticiaService;
        this.preguntaService = preguntaService;
        this.s3Service = s3Service;
    }
    async autenticarUsuario(entidad) {
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
    async listaAll(entidad) {
        const noticias = await this.noticiaService.list(entidad);
        const noticiasConImagenes = await Promise.all(noticias.map(async (noticia) => {
            noticia.IMAGEN2 = await this.s3Service.getImage(noticia.IMAGEN);
            return noticia;
        }));
        return noticiasConImagenes;
    }
    async listaPreguntas(entidad) {
        entidad.CESTDO = 'A';
        const preguntas = await this.preguntaService.list(entidad);
        console.log(preguntas);
        return preguntas;
    }
};
exports.LoginController = LoginController;
__decorate([
    (0, common_1.Post)('autenticar'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "autenticarUsuario", null);
__decorate([
    (0, common_1.Get)('noticias'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "listaAll", null);
__decorate([
    (0, common_1.Get)('preguntas'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "listaPreguntas", null);
exports.LoginController = LoginController = __decorate([
    (0, common_1.Controller)('login'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        token_service_1.TokenService,
        noticia_service_1.NoticiaService,
        preguntas_service_1.PreguntasService,
        aws_service_1.S3Service])
], LoginController);
//# sourceMappingURL=login.controller.js.map