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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
    async downloadFile(PATH, TITLE, res) {
        console.log(PATH);
        try {
            let data = await this.entriesService.getEntriePrint(PATH);
            let fecha = new Date('2024-11-08');
            let modificar = false;
            if (data.FCRCN > fecha || data.FLGDOC === '1') {
                modificar = true;
            }
            const fileBuffer = await this.s3Service.downloadFile(PATH);
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
                'Content-Disposition': `attachment; filename="${TITLE}.pdf"`,
            });
            res.send(Buffer.from(pdfBytes));
        }
        catch (error) {
            console.log(error);
            res.status(500).send('Error al descargar el archivo');
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
__decorate([
    (0, common_1.Get)('download-file'),
    __param(0, (0, common_1.Query)('PATH')),
    __param(1, (0, common_1.Query)('TITLE')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "downloadFile", null);
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