"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const entries_service_1 = require("../services/Admin/entries.service");
const pdf_lib_1 = require("pdf-lib");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class User {
    constructor() {
        this.BANDERA = false;
    }
}
let LoginController = class LoginController {
    constructor(userService, tokenService, noticiaService, preguntaService, emailJurisService, s3Service, entriesService) {
        this.userService = userService;
        this.tokenService = tokenService;
        this.noticiaService = noticiaService;
        this.preguntaService = preguntaService;
        this.emailJurisService = emailJurisService;
        this.s3Service = s3Service;
        this.entriesService = entriesService;
    }
    async autenticarUsuario(entidad) {
        var _a, _b;
        if (!entidad || !entidad.USER || !entidad.PASSWORD) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Credenciales inválidas',
                STATUS: false,
            });
        }
        const userSanitized = (_a = entidad.USER) === null || _a === void 0 ? void 0 : _a.trim();
        const passwordSanitized = (_b = entidad.PASSWORD) === null || _b === void 0 ? void 0 : _b.trim();
        if (userSanitized.length < 3 || passwordSanitized.length < 6) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Credenciales inválidas',
                STATUS: false,
            });
        }
        const userRegex = /^[a-zA-Z0-9@.\-_]+$/;
        if (!userRegex.test(userSanitized)) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Formato de usuario inválido',
                STATUS: false,
            });
        }
        entidad.USER = userSanitized;
        entidad.PASSWORD = passwordSanitized;
        const usuario = await this.userService.loguearUsuario(entidad);
        if (!usuario) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Credenciales inválidas',
                STATUS: false,
            });
        }
        if ((usuario === null || usuario === void 0 ? void 0 : usuario.EBLOQUEO) === true) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Cuenta bloqueada. Contacte al administrador',
                STATUS: false,
            });
        }
        if ((usuario === null || usuario === void 0 ? void 0 : usuario.STATUS) === 0) {
            throw new common_1.BadRequestException({
                MESSAGE: usuario.MESSAGE || 'Cuenta inactiva',
                STATUS: false,
            });
        }
        if (usuario.INTENTOS && usuario.INTENTOS >= 5) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Cuenta bloqueada por múltiples intentos fallidos',
                STATUS: false,
            });
        }
        if (usuario.PASSWORD !== entidad.PASSWORD) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Credenciales inválidas',
                STATUS: false,
            });
        }
        if (usuario.IDROLE == null || usuario.IDROLE < 0) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Usuario sin permisos asignados',
                STATUS: false,
            });
        }
        const tokens = await this.tokenService.generateTokens(usuario, entidad.BANDERA);
        if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Error al generar sesión',
                STATUS: false,
            });
        }
        usuario.TOKEN = tokens.accessToken;
        usuario.REFRESH_TOKEN = tokens.refreshToken;
        usuario.EXPIRES_IN = tokens.expiresIn;
        usuario.RTAFTO = process.env.DOMINIO + usuario.RTAFTO;
        delete usuario.PASSWORD;
        return usuario;
    }
    async removeSession(token) {
        if (!token || token.trim().length === 0) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Token inválido',
                STATUS: false,
            });
        }
        if (token.length < 20 || token.length > 1000) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Token inválido',
                STATUS: false,
            });
        }
        await this.tokenService.removeSession(token);
        return true;
    }
    async listaPreguntas(entidad) {
        entidad.CESTDO = 'A';
        const preguntas = await this.preguntaService.list(entidad);
        return preguntas;
    }
    async refreshToken(token) {
        if (!token || token.trim().length === 0) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Token inválido',
                STATUS: false,
            });
        }
        if (token.length < 20 || token.length > 1000) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Token inválido',
                STATUS: false,
            });
        }
        const newToken = await this.tokenService.refreshToken(token);
        if (!newToken) {
            throw new common_1.BadRequestException({
                MESSAGE: 'No se pudo renovar el token',
                STATUS: false,
            });
        }
        return newToken;
    }
    async refresh(body) {
        if (!body || !body.refreshToken || body.refreshToken.trim().length === 0) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Refresh token inválido',
                STATUS: false,
            });
        }
        const refreshToken = body.refreshToken.trim();
        if (refreshToken.length < 20 || refreshToken.length > 2000) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Refresh token inválido',
                STATUS: false,
            });
        }
        const jwtRegex = /^[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+$/;
        if (!jwtRegex.test(refreshToken)) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Formato de refresh token inválido',
                STATUS: false,
            });
        }
        try {
            const tokens = await this.tokenService.refreshAccessToken(refreshToken);
            if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
                throw new common_1.BadRequestException({
                    MESSAGE: 'No se pudo renovar el token',
                    STATUS: false,
                });
            }
            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn,
                STATUS: true,
                MESSAGE: 'Token renovado exitosamente',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException({
                MESSAGE: error.message || 'No se pudo renovar el token',
                STATUS: false,
            });
        }
    }
    async validateToken(token) {
        return this.tokenService.validateTokenSolicitud(token);
    }
    async validateTokenSolicitudTime(token) {
        return this.tokenService.validateTokenSolicitudTime(token);
    }
    async generateUser(entidad) {
        var _a;
        if (!entidad || !entidad.TOKEN || !entidad.EMAIL || !entidad.PASSWORD) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Datos incompletos',
                STATUS: false,
            });
        }
        const emailSanitized = (_a = entidad.EMAIL) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(emailSanitized)) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Formato de email inválido',
                STATUS: false,
            });
        }
        if (!entidad.PASSWORD || entidad.PASSWORD.length < 8) {
            throw new common_1.BadRequestException({
                MESSAGE: 'La contraseña debe tener al menos 8 caracteres',
                STATUS: false,
            });
        }
        const result = await this.tokenService.validateTokenSolicitud(entidad.TOKEN);
        if (!result) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Token inválido o expirado',
                STATUS: false,
            });
        }
        entidad.EMAIL = emailSanitized;
        entidad.IDROLE = 2;
        entidad.USER = 'AUTOLOGIN';
        entidad.PLAN = '1';
        return await this.userService.createUser(entidad);
    }
    async generateUserFind(entidad) {
        entidad.IDROLE = 2;
        entidad.USER = entidad.EMAIL.split('@')[0];
        entidad.PLAN = '1';
        return await this.userService.createUser(entidad);
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
        var _a;
        if (!entidad || !entidad.EMAIL) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Email requerido',
                STATUS: false,
            });
        }
        const emailSanitized = (_a = entidad.EMAIL) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(emailSanitized)) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Formato de email inválido',
                STATUS: false,
            });
        }
        if (emailSanitized.length > 100) {
            throw new common_1.BadRequestException({
                MESSAGE: 'Email demasiado largo',
                STATUS: false,
            });
        }
        entidad.EMAIL = emailSanitized;
        const usuario = await this.userService.obtenerUsuario(entidad);
        if (!usuario) {
            return {
                MESSAGE: 'Si el email existe, recibirá instrucciones de recuperación',
                STATUS: true,
            };
        }
        if ((usuario === null || usuario === void 0 ? void 0 : usuario.STATUS) === 0 || (usuario === null || usuario === void 0 ? void 0 : usuario.EBLOQUEO) === true) {
            return {
                MESSAGE: 'Si el email existe, recibirá instrucciones de recuperación',
                STATUS: true,
            };
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
    async downloadFile(ID, res) {
        try {
            const data = await this.entriesService.get(ID);
            let fecha = new Date('2024-11-08');
            let modificar = false;
            if (data.FCRCN > fecha || data.FLGDOC === '1') {
                modificar = true;
            }
            const fileBuffer = await this.s3Service.downloadFile(data.ENTRIEFILE);
            const pathcaroa = path.join(__dirname, '..', 'files/files', 'caroa.png');
            const pathccfirma = path.join(__dirname, '..', 'files/files', 'ccfirma.png');
            const pathmarcadeagua = path.join(__dirname, '..', 'files/files', 'marcadeagua.png');
            const pathnuevologo = path.join(__dirname, '..', 'files/files', 'nuevologo.png');
            const pdfDoc = await pdf_lib_1.PDFDocument.load(fileBuffer);
            const caroaImage = await pdfDoc.embedPng(fs.readFileSync(pathcaroa));
            const ccfirmaImage = await pdfDoc.embedPng(fs.readFileSync(pathccfirma));
            const marcadeaguaImage = await pdfDoc.embedPng(fs.readFileSync(pathmarcadeagua));
            const nuevologoImage = await pdfDoc.embedPng(fs.readFileSync(pathnuevologo));
            const pages = pdfDoc.getPages();
            if (modificar) {
                for (const page of pages) {
                    let { width, height } = page.getSize();
                    let isLandscape = width > height;
                    let pageWidth = isLandscape ? height : width;
                    let pageHeight = isLandscape ? width : height;
                    let centerX = pageWidth / 2;
                    let logoTopX = 10;
                    let logoTopY = pageHeight - 43;
                    if (isLandscape) {
                        logoTopX = pageHeight - 43;
                        logoTopY = pageWidth - 20;
                    }
                    page.drawImage(marcadeaguaImage, {
                        x: isLandscape ? (100) : (width / 2 - 310),
                        y: isLandscape ? logoTopY + 35 : (height / 2 - 330),
                        width: 620,
                        height: 600,
                        opacity: 0.7,
                        rotate: isLandscape ? (0, pdf_lib_1.degrees)(-90) : (0, pdf_lib_1.degrees)(0),
                    });
                    page.drawImage(caroaImage, {
                        x: isLandscape ? logoTopX : 10,
                        y: isLandscape ? logoTopY : (height - 43),
                        width: 95,
                        height: 40,
                        rotate: isLandscape ? (0, pdf_lib_1.degrees)(-90) : (0, pdf_lib_1.degrees)(0),
                    });
                    page.drawImage(nuevologoImage, {
                        x: isLandscape ? logoTopX : (width / 2 - 25),
                        y: isLandscape ? ((logoTopY + 42) - centerX) : (height - 43),
                        width: 50,
                        height: 35,
                        rotate: isLandscape ? (0, pdf_lib_1.degrees)(-90) : (0, pdf_lib_1.degrees)(0),
                    });
                    page.drawImage(ccfirmaImage, {
                        x: isLandscape ? 10 : (width / 2 - 30),
                        y: isLandscape ? ((logoTopY + 47) - centerX) : (5),
                        width: 70,
                        height: 30,
                        opacity: 0.9,
                        rotate: isLandscape ? (0, pdf_lib_1.degrees)(-90) : (0, pdf_lib_1.degrees)(0),
                    });
                    page.drawText('https://ccfirma.com/', {
                        x: isLandscape ? logoTopX + 10 : 10,
                        y: isLandscape ? logoTopY : (pageHeight - 25),
                        size: 10,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                        rotate: isLandscape ? (0, pdf_lib_1.degrees)(-90) : (0, pdf_lib_1.degrees)(0),
                    });
                    page.drawText('https://jurissearch.com/', {
                        x: isLandscape ? pageHeight - 30 : (width / 2 - 25),
                        y: isLandscape ? (pageWidth / 2) + 25 : (height - 30),
                        size: 10,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                        rotate: isLandscape ? (0, pdf_lib_1.degrees)(-90) : (0, pdf_lib_1.degrees)(0),
                    });
                    page.drawText('https://ccfirma.com/', {
                        x: isLandscape ? 20 : (width / 2 - 30),
                        y: isLandscape ? (pageWidth / 2) + 25 : 10,
                        size: 10,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                        rotate: isLandscape ? (0, pdf_lib_1.degrees)(-90) : (0, pdf_lib_1.degrees)(0),
                    });
                    page.drawText('https://ccfirma.com/', {
                        x: isLandscape ? (pageHeight / 2) + 50 : 5,
                        y: isLandscape ? (pageWidth - 20) : height / 2 - 25,
                        size: 11,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                        rotate: isLandscape ? (0, pdf_lib_1.degrees)(0) : (0, pdf_lib_1.degrees)(-90),
                    });
                    page.drawText('https://ccfirma.com/', {
                        x: isLandscape ? (pageHeight / 2) - 70 : 5,
                        y: isLandscape ? (pageWidth - 20) : height / 2 - 90,
                        size: 11,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                        rotate: isLandscape ? (0, pdf_lib_1.degrees)(0) : (0, pdf_lib_1.degrees)(-90),
                    });
                    page.drawText('https://ccfirma.com/', {
                        x: isLandscape ? (pageHeight / 2) - 190 : 5,
                        y: isLandscape ? (pageWidth - 20) : height / 2 + 90,
                        size: 11,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                        rotate: isLandscape ? (0, pdf_lib_1.degrees)(0) : (0, pdf_lib_1.degrees)(-90),
                    });
                }
            }
            const pdfBytes = await pdfDoc.save();
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${data.TITLE}.pdf"`,
            });
            res.send(Buffer.from(pdfBytes));
        }
        catch (error) {
            res.status(500).send('Error al descargar el archivo');
        }
    }
    async listaCategorias(entidad) {
        return await this.noticiaService.listCategorias(entidad);
    }
    async listaAll(entidad) {
        try {
            let noticias = await this.noticiaService.listNoticias(entidad);
            return noticias;
        }
        catch (error) {
            return [];
        }
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
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "refresh", null);
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
    (0, common_1.Post)('generateUserFind'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "generateUserFind", null);
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
__decorate([
    (0, common_1.Get)('download-file'),
    __param(0, (0, common_1.Query)('ID')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Get)('list-categorias'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "listaCategorias", null);
__decorate([
    (0, common_1.Get)('noticias'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "listaAll", null);
exports.LoginController = LoginController = __decorate([
    (0, common_1.Controller)('login'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        token_service_1.TokenService,
        noticia_service_1.NoticiaService,
        preguntas_service_1.PreguntasService,
        emailJurisserivce_1.EmailJurisService,
        aws_service_1.S3Service,
        entries_service_1.EntriesService])
], LoginController);
//# sourceMappingURL=login.controller.js.map