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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsistenciaController = void 0;
const common_1 = require("@nestjs/common");
const DataTable_model_1 = require("../../models/DataTable.model.");
const asistencia_model_1 = require("../../models/controlAsistencias/asistencia.model");
const asistencia_service_1 = require("../../services/controlAsistencias/asistencia.service");
const pdf_lib_1 = require("pdf-lib");
const qr = __importStar(require("qrcode"));
const fs_1 = require("fs");
const uuid = __importStar(require("uuid"));
const path = __importStar(require("path"));
const email_service_1 = require("../../services/acompliance/email.service");
const jszip_1 = __importDefault(require("jszip"));
let AsistenciaController = class AsistenciaController {
    constructor(asistenciaService, emailService) {
        this.asistenciaService = asistenciaService;
        this.emailService = emailService;
    }
    async listFilters(entidad, IDEVENTO) {
        return await this.asistenciaService.list(entidad, IDEVENTO);
    }
    async listAsistentes(entidad, IDEVENTO, FECHA) {
        return await this.asistenciaService.listAsistentes(entidad, IDEVENTO);
    }
    async listReporte(entidad, IDEVENTO, IDPARTICIPANTE, PARTICIPANTE, INDICADOR, FECHA) {
        return await this.asistenciaService.listReporte(entidad, IDEVENTO, IDPARTICIPANTE, PARTICIPANTE, INDICADOR, FECHA);
    }
    async listReporteAll(entidad, IDEVENTO) {
        return await this.asistenciaService.listReporteAll(entidad, IDEVENTO);
    }
    async listAsistenciaFUll(entidad, IDEVENTO, FECHA) {
        return await this.asistenciaService.listAsistencia(entidad, IDEVENTO, FECHA);
    }
    async eventos(entidad) {
        return await this.asistenciaService.listEventos(entidad);
    }
    async fechasEventos(entidad, IDEVENTO) {
        return await this.asistenciaService.fechasEventos(entidad, IDEVENTO);
    }
    async aperturarEvento(req, entidad) {
        entidad.UCRCN = 'ADMIN_ASISTENCIAS';
        return await this.asistenciaService.createApertura(entidad);
    }
    async deleteUser(req, ID) {
        return await this.asistenciaService.delete(ID, req.user.UCRCN);
    }
    async addUser(req, entidad) {
        entidad.UCRCN = 'ADMIN_ASISTENCIAS';
        return await this.asistenciaService.createOne(entidad);
    }
    async addMasivo(req, entidad, res) {
        try {
            entidad.UCRCN = 'ADMIN_ASISTENCIAS';
            let asistentes = JSON.parse(entidad.ASISTENTES);
            await asistentes.forEach(async (asistente) => {
                asistente.CODIGO = await uuid.v4().replace(/-/g, '').substring(0, 20);
            });
            entidad.ASISTENTES = JSON.stringify(asistentes);
            let resultado = await this.asistenciaService.create(entidad);
            const zip = new jszip_1.default();
            if (resultado.STATUS && resultado.ID > 0) {
                let pdfPath = path.join(__dirname, 'src', 'files', 'asistenciaVirtual.pdf');
                pdfPath = pdfPath.replace('controllers\\controlAsistencias\\src', 'files');
                for (const evento of asistentes) {
                    const qrText = `CODIGO:${evento.CODIGO};NOMBRES:${evento.NOMBRES}`;
                    const qrBuffer = await qr.toBuffer(qrText, { errorCorrectionLevel: 'H' });
                    const templatePDFBytes = (0, fs_1.readFileSync)(pdfPath);
                    const pdfDoc = await pdf_lib_1.PDFDocument.load(templatePDFBytes);
                    const pages = pdfDoc.getPages();
                    const firstPage = pages[0];
                    const qrDims = pdfDoc.embedPng(qrBuffer);
                    firstPage.drawImage(await qrDims, {
                        x: 435,
                        y: 455,
                        width: 100,
                        height: 100,
                    });
                    const fontSize = 12;
                    const nombreLimpio = evento.NOMBRES.normalize("NFD").replace(/[^\x20-\x7E\u00C0-\u017F]/g, '');
                    firstPage.drawText(`${nombreLimpio}`, {
                        x: 48,
                        y: 520,
                        size: fontSize,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                    });
                    const modifiedPDFBytes = await pdfDoc.save();
                    const pdfName = `${nombreLimpio.replace(' ', '_')}.pdf`;
                    zip.file(pdfName, modifiedPDFBytes);
                }
                const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
                res.setHeader('Content-Type', 'application/zip');
                res.setHeader('Content-Disposition', `attachment; filename=asistentes.zip`);
                res.status(200).send(zipBuffer);
            }
            else {
                throw new Error('Error al procesar los asistentes');
            }
        }
        catch (error) {
            res.status(500).json({ message: 'Error en la generación y envío de PDFs' });
        }
    }
};
exports.AsistenciaController = AsistenciaController;
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('IDEVENTO')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable, Number]),
    __metadata("design:returntype", Promise)
], AsistenciaController.prototype, "listFilters", null);
__decorate([
    (0, common_1.Get)('listAsistentes'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('IDEVENTO')),
    __param(2, (0, common_1.Query)('FECHA')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable, Number, Date]),
    __metadata("design:returntype", Promise)
], AsistenciaController.prototype, "listAsistentes", null);
__decorate([
    (0, common_1.Get)('listReporte'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('IDEVENTO')),
    __param(2, (0, common_1.Query)('IDPARTICIPANTE')),
    __param(3, (0, common_1.Query)('PARTICIPANTE')),
    __param(4, (0, common_1.Query)('INDICADOR')),
    __param(5, (0, common_1.Query)('FECHA')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable, Number, Number, String, Number, Date]),
    __metadata("design:returntype", Promise)
], AsistenciaController.prototype, "listReporte", null);
__decorate([
    (0, common_1.Get)('listReporteAll'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('IDEVENTO')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable, Number]),
    __metadata("design:returntype", Promise)
], AsistenciaController.prototype, "listReporteAll", null);
__decorate([
    (0, common_1.Get)('listFull'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('IDEVENTO')),
    __param(2, (0, common_1.Query)('FECHA')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable, Number, Date]),
    __metadata("design:returntype", Promise)
], AsistenciaController.prototype, "listAsistenciaFUll", null);
__decorate([
    (0, common_1.Get)('eventos'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable]),
    __metadata("design:returntype", Promise)
], AsistenciaController.prototype, "eventos", null);
__decorate([
    (0, common_1.Get)('fechas-eventos'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('IDEVENTO')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable, Number]),
    __metadata("design:returntype", Promise)
], AsistenciaController.prototype, "fechasEventos", null);
__decorate([
    (0, common_1.Post)('aperturar-evento'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, asistencia_model_1.AsistenciaModel]),
    __metadata("design:returntype", Promise)
], AsistenciaController.prototype, "aperturarEvento", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], AsistenciaController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, asistencia_model_1.AsistenciaModel]),
    __metadata("design:returntype", Promise)
], AsistenciaController.prototype, "addUser", null);
__decorate([
    (0, common_1.Post)('addMasivo'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, asistencia_model_1.AsistenciaModel, Object]),
    __metadata("design:returntype", Promise)
], AsistenciaController.prototype, "addMasivo", null);
exports.AsistenciaController = AsistenciaController = __decorate([
    (0, common_1.Controller)('control/asistencias'),
    __metadata("design:paramtypes", [asistencia_service_1.AsistenciaService,
        email_service_1.EmailService])
], AsistenciaController);
//# sourceMappingURL=asistencia.controller.js.map