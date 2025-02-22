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
const emailJurisserivce_1 = require("../services/acompliance/emailJurisserivce");
const Solicitud_model_1 = require("../models/public/Solicitud.model");
const multer_1 = require("multer");
const platform_express_1 = require("@nestjs/platform-express");
class User {
    constructor() {
        this.BANDERA = false;
    }
}
let LoginController = class LoginController {
    constructor(userService, tokenService, noticiaService, preguntaService, emailJurisService, s3Service) {
        this.userService = userService;
        this.tokenService = tokenService;
        this.noticiaService = noticiaService;
        this.preguntaService = preguntaService;
        this.emailJurisService = emailJurisService;
        this.s3Service = s3Service;
    }
    async autenticarUsuario(entidad) {
        const usuario = await this.userService.loguearUsuario(entidad);
        if (!usuario) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Usuario no encontrado',
                STATUS: false,
            });
        }
        if ((usuario === null || usuario === void 0 ? void 0 : usuario.STATUS) === 0) {
            throw new common_1.BadRequestException({
                MESSAGE: usuario.MESSAGE,
                STATUS: false,
            });
        }
        if (usuario.PASSWORD !== entidad.PASSWORD) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Contraseña incorrecta',
                STATUS: false,
            });
        }
        const token = await this.tokenService.generateToken(usuario, entidad.BANDERA);
        usuario.TOKEN = token;
        usuario.RTAFTO = process.env.DOMINIO + usuario.RTAFTO;
        return usuario;
    }
    async removeSession(token) {
        this.tokenService.removeSession(token);
        return true;
    }
    async listaAll(entidad) {
        try {
            let noticias = await this.noticiaService.list(entidad);
            noticias = noticias ? noticias : [];
            const noticiasConImagenes = await Promise.all(noticias.map(async (noticia) => {
                try {
                    noticia.IMAGEN2 = await this.s3Service.getImage(noticia.IMAGEN);
                    return noticia;
                }
                catch (error) {
                    return noticia;
                }
            }));
            return noticiasConImagenes;
        }
        catch (error) {
            return [];
        }
    }
    async listaPreguntas(entidad) {
        entidad.CESTDO = 'A';
        const preguntas = await this.preguntaService.list(entidad);
        return preguntas;
    }
    async refreshToken(token) {
        return await this.tokenService.refreshToken(token);
    }
    async validateToken(token) {
        return this.tokenService.validateTokenSolicitud(token);
    }
    async validateTokenSolicitudTime(token) {
        return this.tokenService.validateTokenSolicitudTime(token);
    }
    async generateUser(entidad) {
        const result = await this.tokenService.validateTokenSolicitud(entidad.TOKEN);
        if (result) {
            entidad.IDROLE = 2;
            entidad.USER = 'AUTOLOGIN';
            entidad.PLAN = '1';
            return await this.userService.createUser(entidad);
        }
        else {
            return { MESSAGE: 'Token invalido', STATUS: false };
        }
    }
    async sendEmail(entidad) {
        const result = await this.emailJurisService.sendEmail(entidad);
        return result;
    }
    async ccfirmaSendEmail(entidad) {
        const result = await this.emailJurisService.ccfirmaSendEmail(entidad);
        return result;
    }
    async recoveryPassword(entidad) {
        const usuario = await this.userService.obtenerUsuario(entidad);
        if (!usuario) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Usuario no encontrado',
                STATUS: false,
            });
        }
        if ((usuario === null || usuario === void 0 ? void 0 : usuario.STATUS) === 0) {
            throw new common_1.BadRequestException({
                MESSAGE: usuario.MESSAGE,
                STATUS: false,
            });
        }
        const result = await this.emailJurisService.recoveryPassword(entidad);
        return result;
    }
    async recoveryUser(entidad) {
        try {
            const VALDIAR_TOKEN = this.tokenService.validateTokenSolicitudTime(entidad.TOKEN);
            if (VALDIAR_TOKEN.STATUS === false) {
                throw new common_1.BadRequestException({
                    MESSAGE: VALDIAR_TOKEN.MESSAGE,
                    STATUS: false,
                });
            }
            const entidadNuevo = new User();
            entidadNuevo.EMAIL = entidad.EMAIL;
            entidadNuevo.PASSWORD = entidad.PASSWORD;
            const result = await this.userService.updatePassword(entidadNuevo);
            return result;
        }
        catch (error) {
            return { MESSAGE: 'Token invalido', STATUS: false };
        }
    }
    async uploadMultipleFilesOportunidades(req, body, files) {
        const { name: name, email: email, message: message } = body;
        const [file1] = files;
        return await this.emailJurisService.sendCCFIRMAOportunidaes(name, email, message, file1);
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
    (0, common_1.Get)('logout'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "removeSession", null);
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
__decorate([
    (0, common_1.Get)('refreshToken'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('validateToken'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "validateToken", null);
__decorate([
    (0, common_1.Get)('validateToken-recovery'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "validateTokenSolicitudTime", null);
__decorate([
    (0, common_1.Post)('generateUser'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "generateUser", null);
__decorate([
    (0, common_1.Post)('solicitudUser'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Solicitud_model_1.SolicitudModel]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Post)('ccfirma-solicitud'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Solicitud_model_1.SolicitudModel]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "ccfirmaSendEmail", null);
__decorate([
    (0, common_1.Post)('recovery'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "recoveryPassword", null);
__decorate([
    (0, common_1.Post)('recoveryUser'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "recoveryUser", null);
__decorate([
    (0, common_1.Post)('ccfirma_upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                cb(null, filename);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/(png|jpg|jpeg|pdf)$/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Solo se permiten archivos PNG, JPG, JPEG, o PDF'), false);
            }
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "uploadMultipleFilesOportunidades", null);
exports.LoginController = LoginController = __decorate([
    (0, common_1.Controller)('login'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        token_service_1.TokenService,
        noticia_service_1.NoticiaService,
        preguntas_service_1.PreguntasService,
        emailJurisserivce_1.EmailJurisService,
        aws_service_1.S3Service])
], LoginController);
//# sourceMappingURL=login.controller.js.map