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
exports.EntriesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const entries_model_1 = require("../../models/Admin/entries.model");
const entries_service_1 = require("../../services/Admin/entries.service");
const multer_1 = require("multer");
const aws_service_1 = require("../../services/Aws/aws.service");
const fs = __importStar(require("fs"));
const DataTable_model_1 = require("../../models/DataTable.model.");
const busqueda_model_1 = require("../../models/Admin/busqueda.model");
const pdf_lib_1 = require("pdf-lib");
const path = __importStar(require("path"));
const docx_1 = require("docx");
const recursos_1 = __importDefault(require("./recursos"));
let EntriesController = class EntriesController {
    constructor(entriesService, s3Service) {
        this.entriesService = entriesService;
        this.s3Service = s3Service;
    }
    async uploadMultipleFiles(req, entidad, files) {
        try {
            const table = {
                INIT: 0,
                ROWS: 1,
                DESC: null,
                CESTDO: null,
                ID: 0,
            };
            const obtener = await this.entriesService.listV(table, entidad.TITLE, entidad.TYPE, entidad.TIPO);
            if (obtener.length > 0) {
                return {
                    MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`,
                    STATUS: false,
                };
            }
            const pathcaroa = path.join(__dirname, '..', '..', 'files/files', 'caroa.png');
            const pathccfirma = path.join(__dirname, '..', '..', 'files/files', 'ccfirma.png');
            const pathmarcadeagua = path.join(__dirname, '..', '..', 'files/files', 'marcadeagua.png');
            const pathnuevologo = path.join(__dirname, '..', '..', 'files/files', 'nuevologo.png');
            const [file1] = files;
            const templatePDFBytes = fs.readFileSync(file1.path);
            const pdfDoc = await pdf_lib_1.PDFDocument.load(templatePDFBytes);
            const caroaImage = await pdfDoc.embedPng(fs.readFileSync(pathcaroa));
            const ccfirmaImage = await pdfDoc.embedPng(fs.readFileSync(pathccfirma));
            const marcadeaguaImage = await pdfDoc.embedPng(fs.readFileSync(pathmarcadeagua));
            const nuevologoImage = await pdfDoc.embedPng(fs.readFileSync(pathnuevologo));
            const pages = pdfDoc.getPages();
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const { width, height } = page.getSize();
                const x = width / 2;
                const y = height / 2;
                await page.drawImage(marcadeaguaImage, {
                    x: x - 310,
                    y: y - 330,
                    width: 620,
                    height: 600,
                    opacity: 0.7,
                });
                await page.drawImage(caroaImage, {
                    x: x - (width < 500 ? 240 : 290),
                    y: y + (height < 800 ? 345 : 375),
                    width: 95,
                    height: 40,
                });
                page.drawText('https://ccfirma.com/', {
                    x: x - 290,
                    y: y + 395,
                    size: 10,
                    color: (0, pdf_lib_1.rgb)(0, 0, 0),
                    opacity: 0.0,
                });
                await page.drawImage(nuevologoImage, {
                    x: x - (width < 500 ? 20 : 25),
                    y: y + (height < 800 ? 350 : 380),
                    width: 50,
                    height: 35,
                });
                await page.drawImage(ccfirmaImage, {
                    x: x - (width < 500 ? 25 : 30),
                    y: y - (height < 800 ? 395 : 415),
                    width: 70,
                    height: 30,
                    opacity: 0.9,
                });
                page.drawText('https://ccfirma.com/', {
                    x: x - (width < 500 ? 25 : 30),
                    y: y - (height < 800 ? 390 : 415),
                    size: 10,
                    color: (0, pdf_lib_1.rgb)(0, 0, 0),
                    opacity: 0.0,
                });
            }
            const pdfBytes = await pdfDoc.save();
            fs.writeFileSync(file1.path, pdfBytes);
            const file2 = { filename: null, path: null };
            const keysLocation = await this.s3Service.uploadFiles(entidad, file1.filename, file1.path, file2.filename, file2.path);
            entidad.ENTRIEFILE = keysLocation[0];
            entidad.ENTRIEFILERESUMEN = '';
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.entriesService.createEntries(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach((file) => {
                fs.unlinkSync(file.path);
            });
        }
    }
    async uploadSingleFile(req, entidad, files) {
        try {
            const table = {
                INIT: 0,
                ROWS: 1,
                DESC: null,
                CESTDO: null,
                ID: 0,
            };
            const obtener = await this.entriesService.listV(table, entidad.TITLE, entidad.TYPE, entidad.TIPO);
            if (obtener.length > 0) {
                return {
                    MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`,
                    STATUS: false,
                };
            }
            const pathcaroa = path.join(__dirname, '..', '..', 'files/files', 'caroa.png');
            const pathccfirma = path.join(__dirname, '..', '..', 'files/files', 'ccfirma.png');
            const pathmarcadeagua = path.join(__dirname, '..', '..', 'files/files', 'marcadeagua.png');
            const pathnuevologo = path.join(__dirname, '..', '..', 'files/files', 'nuevologo.png');
            const [file1] = files;
            const templatePDFBytes = fs.readFileSync(file1.path);
            const pdfDoc = await pdf_lib_1.PDFDocument.load(templatePDFBytes);
            const caroaImage = await pdfDoc.embedPng(fs.readFileSync(pathcaroa));
            const ccfirmaImage = await pdfDoc.embedPng(fs.readFileSync(pathccfirma));
            const marcadeaguaImage = await pdfDoc.embedPng(fs.readFileSync(pathmarcadeagua));
            const nuevologoImage = await pdfDoc.embedPng(fs.readFileSync(pathnuevologo));
            const pages = pdfDoc.getPages();
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const { width, height } = page.getSize();
                const x = width / 2;
                const y = height / 2;
                await page.drawImage(marcadeaguaImage, {
                    x: x - 310,
                    y: y - 330,
                    width: 620,
                    height: 600,
                    opacity: 0.7,
                });
                await page.drawImage(caroaImage, {
                    x: x - (width < 500 ? 240 : 290),
                    y: y + (height < 800 ? 345 : 375),
                    width: 95,
                    height: 40,
                });
                page.drawText('https://ccfirma.com/', {
                    x: x - 290,
                    y: y + 395,
                    size: 10,
                    color: (0, pdf_lib_1.rgb)(0, 0, 0),
                    opacity: 0.0,
                });
                await page.drawImage(nuevologoImage, {
                    x: x - (width < 500 ? 20 : 25),
                    y: y + (height < 800 ? 350 : 380),
                    width: 50,
                    height: 35,
                });
                await page.drawImage(ccfirmaImage, {
                    x: x - (width < 500 ? 25 : 30),
                    y: y - (height < 800 ? 395 : 415),
                    width: 70,
                    height: 30,
                    opacity: 0.9,
                });
                page.drawText('https://ccfirma.com/', {
                    x: x - (width < 500 ? 25 : 30),
                    y: y - (height < 800 ? 390 : 415),
                    size: 10,
                    color: (0, pdf_lib_1.rgb)(0, 0, 0),
                    opacity: 0.0,
                });
            }
            const pdfBytes = await pdfDoc.save();
            fs.writeFileSync(file1.path, pdfBytes);
            const keysLocation = await this.s3Service.uploadFile(entidad, file1.filename, file1.path);
            entidad.ENTRIEFILE = keysLocation;
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.entriesService.createEntries(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach((file) => {
                fs.unlinkSync(file.path);
            });
        }
    }
    async editMultipleFiles(req, entidad, files) {
        try {
            const table = {
                INIT: 0,
                ROWS: 1,
                DESC: null,
                CESTDO: null,
                ID: entidad.ID,
            };
            const obtener = await this.entriesService.listV(table, entidad.TITLE, entidad.TYPE, entidad.TIPO);
            if (obtener.length > 0) {
                return {
                    MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`,
                    STATUS: false,
                };
            }
            const [file1, file2] = files;
            if (![undefined, null].includes(file1)) {
                const pathcaroa = path.join(__dirname, '..', '..', 'files/files', 'caroa.png');
                const pathccfirma = path.join(__dirname, '..', '..', 'files/files', 'ccfirma.png');
                const pathmarcadeagua = path.join(__dirname, '..', '..', 'files/files', 'marcadeagua.png');
                const pathnuevologo = path.join(__dirname, '..', '..', 'files/files', 'nuevologo.png');
                const templatePDFBytes = fs.readFileSync(file1.path);
                const pdfDoc = await pdf_lib_1.PDFDocument.load(templatePDFBytes);
                const caroaImage = await pdfDoc.embedPng(fs.readFileSync(pathcaroa));
                const ccfirmaImage = await pdfDoc.embedPng(fs.readFileSync(pathccfirma));
                const marcadeaguaImage = await pdfDoc.embedPng(fs.readFileSync(pathmarcadeagua));
                const nuevologoImage = await pdfDoc.embedPng(fs.readFileSync(pathnuevologo));
                const pages = pdfDoc.getPages();
                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i];
                    const { width, height } = page.getSize();
                    const x = width / 2;
                    const y = height / 2;
                    await page.drawImage(marcadeaguaImage, {
                        x: x - 310,
                        y: y - 330,
                        width: 620,
                        height: 600,
                        opacity: 0.7,
                    });
                    await page.drawImage(caroaImage, {
                        x: x - (width < 500 ? 240 : 290),
                        y: y + (height < 800 ? 345 : 375),
                        width: 95,
                        height: 40,
                    });
                    page.drawText('https://ccfirma.com/', {
                        x: x - 290,
                        y: y + 395,
                        size: 10,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                    });
                    await page.drawImage(nuevologoImage, {
                        x: x - (width < 500 ? 20 : 25),
                        y: y + (height < 800 ? 350 : 380),
                        width: 50,
                        height: 35,
                    });
                    await page.drawImage(ccfirmaImage, {
                        x: x - (width < 500 ? 25 : 30),
                        y: y - (height < 800 ? 395 : 415),
                        width: 70,
                        height: 30,
                        opacity: 0.9,
                    });
                    page.drawText('https://ccfirma.com/', {
                        x: x - (width < 500 ? 25 : 30),
                        y: y - (height < 800 ? 390 : 415),
                        size: 10,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                    });
                }
                const pdfBytes = await pdfDoc.save();
                fs.writeFileSync(file1.path, pdfBytes);
                const keysLocation = await this.s3Service.uploadFile(entidad, file1.filename, file1.path);
                entidad.ENTRIEFILE = keysLocation;
            }
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.entriesService.edit(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach((file) => {
                fs.unlinkSync(file.path);
            });
        }
    }
    async editSingleFile(req, entidad, files) {
        try {
            const table = {
                INIT: 0,
                ROWS: 1,
                DESC: null,
                CESTDO: null,
                ID: entidad.ID,
            };
            const obtener = await this.entriesService.listV(table, entidad.TITLE, entidad.TYPE, entidad.TIPO);
            if (obtener.length > 0) {
                return {
                    MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`,
                    STATUS: false,
                };
            }
            const [file1] = files;
            if (![undefined, null].includes(file1)) {
                const pathcaroa = path.join(__dirname, '..', '..', 'files/files', 'caroa.png');
                const pathccfirma = path.join(__dirname, '..', '..', 'files/files', 'ccfirma.png');
                const pathmarcadeagua = path.join(__dirname, '..', '..', 'files/files', 'marcadeagua.png');
                const pathnuevologo = path.join(__dirname, '..', '..', 'files/files', 'nuevologo.png');
                const templatePDFBytes = fs.readFileSync(file1.path);
                const pdfDoc = await pdf_lib_1.PDFDocument.load(templatePDFBytes);
                const caroaImage = await pdfDoc.embedPng(fs.readFileSync(pathcaroa));
                const ccfirmaImage = await pdfDoc.embedPng(fs.readFileSync(pathccfirma));
                const marcadeaguaImage = await pdfDoc.embedPng(fs.readFileSync(pathmarcadeagua));
                const nuevologoImage = await pdfDoc.embedPng(fs.readFileSync(pathnuevologo));
                const pages = pdfDoc.getPages();
                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i];
                    const { width, height } = page.getSize();
                    const x = width / 2;
                    const y = height / 2;
                    await page.drawImage(marcadeaguaImage, {
                        x: x - 310,
                        y: y - 330,
                        width: 620,
                        height: 600,
                        opacity: 0.7,
                    });
                    await page.drawImage(caroaImage, {
                        x: x - (width < 500 ? 240 : 290),
                        y: y + (height < 800 ? 345 : 375),
                        width: 95,
                        height: 40,
                    });
                    page.drawText('https://ccfirma.com/', {
                        x: x - 290,
                        y: y + 395,
                        size: 10,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                    });
                    await page.drawImage(nuevologoImage, {
                        x: x - (width < 500 ? 20 : 25),
                        y: y + (height < 800 ? 350 : 380),
                        width: 50,
                        height: 35,
                    });
                    await page.drawImage(ccfirmaImage, {
                        x: x - (width < 500 ? 25 : 30),
                        y: y - (height < 800 ? 395 : 415),
                        width: 70,
                        height: 30,
                        opacity: 0.9,
                    });
                    page.drawText('https://ccfirma.com/', {
                        x: x - (width < 500 ? 25 : 30),
                        y: y - (height < 800 ? 390 : 415),
                        size: 10,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                    });
                }
                const pdfBytes = await pdfDoc.save();
                fs.writeFileSync(file1.path, pdfBytes);
                const keysLocation = await this.s3Service.uploadFile(entidad, file1.filename, file1.path);
                entidad.ENTRIEFILE = keysLocation;
            }
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.entriesService.edit(entidad);
            return result;
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach((file) => {
                fs.unlinkSync(file.path);
            });
        }
    }
    async listUsers(entidad, TYPE) {
        return await this.entriesService.list(entidad, entidad.DESC, TYPE, null);
    }
    async listData(entidad, TYPE, BLOG, FRESOLUTION, TEMA, RTITLE) {
        return await this.entriesService.listData(entidad, entidad.DESC, TYPE, null, BLOG, FRESOLUTION, TEMA, RTITLE);
    }
    async deleteUser(req, ID) {
        return await this.entriesService.deleteFilter(ID, req.user.UCRCN);
    }
    async Obtener(ID) {
        return await this.entriesService.get(ID);
    }
    async getPrint(ID) {
        return await this.entriesService.getPrint(ID);
    }
    async downloadFile(PATH, res) {
        try {
            const file = await this.s3Service.downloadFile(PATH);
            res.set('Content-Type', 'application/pdf');
            res.send(file);
        }
        catch (error) {
            res.status(500).send('Error al descargar el archivo');
        }
    }
    async busqueda(req, busqueda) {
        busqueda.UEDCN = req.user.UCRCN;
        busqueda.IDUSR = req.user.ID;
        return await this.entriesService.busqueda(busqueda);
    }
    async busquedaFavorites(req, busqueda) {
        busqueda.UEDCN = req.user.UCRCN;
        busqueda.IDUSR = req.user.ID;
        return await this.entriesService.busquedaFavorites(busqueda);
    }
    async busquedaFavoritesEntrie(req, busqueda) {
        busqueda.UEDCN = req.user.UCRCN;
        busqueda.IDUSR = req.user.ID;
        return await this.entriesService.busquedaFavoritesEntrie(busqueda);
    }
    async saveTitleEntrie(req, entidad) {
        entidad.UCRCN = req.user.UCRCN;
        return await this.entriesService.saveTitleEntrie(entidad);
    }
    async saveDirectory(req, entidad) {
        entidad.ID = req.user.ID;
        return await this.entriesService.saveDirectory(entidad);
    }
    async doc(res, ID) {
        var _a;
        const data = await this.entriesService.getPrint(ID);
        data.RECURSO = JSON.parse(data.RECURSO)
            .map((item) => item.LABEL)
            .join(', ');
        data.DELITO = JSON.parse(data.DELITO)
            .map((item) => item.LABEL)
            .join(', ');
        data.AMBIT = JSON.parse(data.AMBIT)
            .map((item) => item.LABEL)
            .join(', ');
        data.OJURISDICCIONAL = JSON.parse(data.OJURISDICCIONAL)
            .map((item) => item.LABEL)
            .join(', ');
        data.MAGISTRATES = JSON.parse(data.MAGISTRADOS)
            .map((item) => item.LABEL)
            .join(', ');
        let marginsRows = {
            top: 250,
            right: 250,
            bottom: 250,
            left: 250,
        };
        const doc = new docx_1.Document({
            sections: [
                {
                    properties: {},
                    footers: {
                        default: new docx_1.Footer({
                            children: [
                                new docx_1.Paragraph({
                                    alignment: docx_1.AlignmentType.CENTER,
                                    children: [
                                        new docx_1.ImageRun({
                                            data: recursos_1.default.toCCFirma,
                                            transformation: {
                                                width: 100,
                                                height: 50,
                                            },
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    },
                    headers: {
                        default: new docx_1.Header({
                            children: [
                                new docx_1.Paragraph({
                                    alignment: docx_1.AlignmentType.CENTER,
                                    children: [
                                        new docx_1.TextRun({
                                            text: 'https://ccfirma.com/',
                                            color: 'FFFFFF',
                                            size: 10,
                                        }),
                                    ],
                                }),
                                new docx_1.Paragraph({
                                    alignment: docx_1.AlignmentType.CENTER,
                                    children: [
                                        new docx_1.ImageRun({
                                            data: recursos_1.default.nuevoLogoJuris,
                                            transformation: {
                                                width: 70,
                                                height: 50,
                                            },
                                        }),
                                    ],
                                }),
                                new docx_1.Paragraph({
                                    children: [
                                        new docx_1.ImageRun({
                                            data: recursos_1.default.toIMG,
                                            transformation: {
                                                width: 800,
                                                height: 850,
                                            },
                                            floating: {
                                                horizontalPosition: {
                                                    align: 'center',
                                                },
                                                verticalPosition: {
                                                    align: 'center',
                                                },
                                                behindDocument: true,
                                            },
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    },
                    children: [
                        new docx_1.Paragraph({
                            children: [
                                new docx_1.TextRun({
                                    text: `${(data === null || data === void 0 ? void 0 : data.TITLE) || ''}`,
                                    bold: true,
                                    size: 22,
                                    font: 'Calibri',
                                    color: '000000',
                                }),
                            ],
                            alignment: docx_1.AlignmentType.LEFT,
                        }),
                        new docx_1.Table({
                            rows: [
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'Tipo de Recurso:',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                    bullet: { level: 0 },
                                                }),
                                            ],
                                            shading: { fill: 'FFFFFF' },
                                            borders: new Object({
                                                top: { color: 'FFFFFF' },
                                                bottom: { color: 'FFFFFF' },
                                                left: { color: 'FFFFFF' },
                                                right: { color: 'FFFFFF' },
                                            }),
                                        }),
                                        new docx_1.TableCell({
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: `${data.RECURSO}`,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                    bullet: { level: 0 },
                                                }),
                                            ],
                                            shading: {
                                                fill: 'FFFFFF',
                                            },
                                            borders: new Object({
                                                top: { color: 'FFFFFF' },
                                                bottom: { color: 'FFFFFF' },
                                                left: { color: 'FFFFFF' },
                                                right: { color: 'FFFFFF' },
                                            }),
                                        }),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'Delitos:',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                    bullet: { level: 0 },
                                                }),
                                            ],
                                            shading: {
                                                fill: 'FFFFFF',
                                            },
                                            borders: new Object({
                                                top: { color: 'FFFFFF' },
                                                bottom: { color: 'FFFFFF' },
                                                left: { color: 'FFFFFF' },
                                                right: { color: 'FFFFFF' },
                                            }),
                                        }),
                                        new docx_1.TableCell({
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: `${data.DELITO}`,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                    bullet: { level: 0 },
                                                }),
                                            ],
                                            shading: {
                                                fill: 'FFFFFF',
                                            },
                                            borders: new Object({
                                                top: { color: 'FFFFFF' },
                                                bottom: { color: 'FFFFFF' },
                                                left: { color: 'FFFFFF' },
                                                right: { color: 'FFFFFF' },
                                            }),
                                        }),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'Vinculante:',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                    bullet: { level: 0 },
                                                }),
                                            ],
                                            shading: {
                                                fill: 'FFFFFF',
                                            },
                                            borders: new Object({
                                                top: { color: 'FFFFFF' },
                                                bottom: { color: 'FFFFFF' },
                                                left: { color: 'FFFFFF' },
                                                right: { color: 'FFFFFF' },
                                            }),
                                        }),
                                        new docx_1.TableCell({
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: `${data.ISBINDING ? 'Sí' : 'No'}`,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                    bullet: { level: 0 },
                                                }),
                                            ],
                                            shading: {
                                                fill: 'FFFFFF',
                                            },
                                            borders: new Object({
                                                top: { color: 'FFFFFF' },
                                                bottom: { color: 'FFFFFF' },
                                                left: { color: 'FFFFFF' },
                                                right: { color: 'FFFFFF' },
                                            }),
                                        }),
                                    ],
                                }),
                            ],
                            margins: {
                                top: 100,
                                right: 100,
                                bottom: 100,
                                left: 100,
                            },
                        }),
                        new docx_1.Table({
                            width: {
                                size: 10000,
                                type: docx_1.WidthType.DXA,
                            },
                            margins: {
                                top: 300,
                            },
                            rows: [
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 10000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'CONTENIDO',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.CENTER,
                                                }),
                                            ],
                                            columnSpan: 2,
                                        }),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 4000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'TEMA',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 6000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: renderContent(data.TEMA),
                                        }),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 4000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'SUBTEMA',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 6000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: renderContent(data.SUBTEMA),
                                        }),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 4000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'PALABRAS CLAVES',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 6000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: `${(_a = data === null || data === void 0 ? void 0 : data.KEYWORDS) === null || _a === void 0 ? void 0 : _a.trim()}`,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 4000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'SÍNTESIS DE LOS FUNDAMENTOS JURÍDICOS RELEVANTES',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 6000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: renderContent(data.SHORTSUMMARY),
                                        }),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 4000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'FUNDAMENTOS JURÍDICOS RELEVANTES',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                            shading: {
                                                fill: 'FFF2CC',
                                            },
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 6000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: renderContent(data.RESUMEN),
                                            shading: {
                                                fill: 'FFF2CC',
                                            },
                                        }),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 10000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'IDENTIFICACIÓN',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.CENTER,
                                                }),
                                            ],
                                            columnSpan: 2,
                                        }),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 4000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'ÁMBITO',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 6000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: `${data.AMBIT}`,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 4000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'FECHA DE RESOLUCIÓN',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 6000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: `${setFechaLocale(data.FRESOLUTION)}`,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 4000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'ÓRGANO JURISDICCIONAL',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 6000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: `${data.OJURISDICCIONAL}`,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 4000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'MAGISTRADOS',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 6000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: `${data.MAGISTRATES}`,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 4000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'VOTO DISIDENTE',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                        new docx_1.TextRun({
                                                            text: '\n',
                                                        }),
                                                        new docx_1.TextRun({
                                                            text: 'Voto que discrepa del fallo final adoptado. ',
                                                            size: 18,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                            italics: true,
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 6000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: `${(data === null || data === void 0 ? void 0 : data.VDESIDENTE) || '-'}`,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                                new docx_1.TableRow({
                                    children: [
                                        new docx_1.TableCell({
                                            width: {
                                                size: 4000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: 'VOTO CONCURRENTE',
                                                            bold: true,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                        new docx_1.TextRun({
                                                            text: '\n',
                                                        }),
                                                        new docx_1.TextRun({
                                                            text: 'Voto que disiente de la argumentación jurídica, pero no del fallo final adoptado. ',
                                                            size: 18,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                            italics: true,
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                        new docx_1.TableCell({
                                            width: {
                                                size: 6000,
                                                type: docx_1.WidthType.DXA,
                                            },
                                            margins: marginsRows,
                                            children: [
                                                new docx_1.Paragraph({
                                                    children: [
                                                        new docx_1.TextRun({
                                                            text: `${(data === null || data === void 0 ? void 0 : data.CVOTE) || '-'}`,
                                                            size: 22,
                                                            font: 'Calibri',
                                                            color: '000000',
                                                        }),
                                                    ],
                                                    alignment: docx_1.AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                },
            ],
        });
        const buffer = await docx_1.Packer.toBuffer(doc);
        res.setHeader('Content-Disposition', 'attachment; filename=ejemplo.docx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.send(buffer);
    }
};
exports.EntriesController = EntriesController;
__decorate([
    (0, common_1.Post)('add'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                return cb(null, filename);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/pdf$/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Solo se permiten archivos PDF'), false);
            }
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entries_model_1.EntriesModel, Object]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Post)('add-single'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                return cb(null, filename);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/pdf$/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Solo se permiten archivos PDF'), false);
            }
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entries_model_1.EntriesModel, Object]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "uploadSingleFile", null);
__decorate([
    (0, common_1.Post)('edit'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                if (file) {
                    const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                    return cb(null, filename);
                }
            },
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/pdf$/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Solo se permiten archivos PDF'), false);
            }
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entries_model_1.EntriesModel, Array]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "editMultipleFiles", null);
__decorate([
    (0, common_1.Post)('edit-single'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                if (file) {
                    const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                    return cb(null, filename);
                }
            },
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/pdf$/)) {
                cb(null, true);
            }
            else {
                cb(new Error('Solo se permiten archivos PDF'), false);
            }
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entries_model_1.EntriesModel, Array]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "editSingleFile", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('TYPE')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable, String]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Get)('list-data'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Query)('TYPE')),
    __param(2, (0, common_1.Query)('BLOG')),
    __param(3, (0, common_1.Query)('FRESOLUTION')),
    __param(4, (0, common_1.Query)('TEMA')),
    __param(5, (0, common_1.Query)('RTITLE')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "listData", null);
__decorate([
    (0, common_1.Post)('delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('get'),
    __param(0, (0, common_1.Query)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "Obtener", null);
__decorate([
    (0, common_1.Get)('getPrint'),
    __param(0, (0, common_1.Query)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "getPrint", null);
__decorate([
    (0, common_1.Post)('download-file'),
    __param(0, (0, common_1.Body)('PATH')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Get)('busqueda'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, busqueda_model_1.BusquedaModel]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "busqueda", null);
__decorate([
    (0, common_1.Get)('busqueda-favorites'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, busqueda_model_1.BusquedaModel]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "busquedaFavorites", null);
__decorate([
    (0, common_1.Get)('busqueda-favorites-entrie'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, busqueda_model_1.BusquedaModel]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "busquedaFavoritesEntrie", null);
__decorate([
    (0, common_1.Post)('save-title-entrie'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, entries_model_1.EntriesModel]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "saveTitleEntrie", null);
__decorate([
    (0, common_1.Post)('save-add-directory'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, busqueda_model_1.BusquedaModel]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "saveDirectory", null);
__decorate([
    (0, common_1.Get)('doc'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "doc", null);
exports.EntriesController = EntriesController = __decorate([
    (0, common_1.Controller)('admin/entries'),
    __metadata("design:paramtypes", [entries_service_1.EntriesService,
        aws_service_1.S3Service])
], EntriesController);
const setFechaLocale = (FRESOLUTION) => {
    try {
        let date = new Date(FRESOLUTION);
        date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return date.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
    catch (error) {
        return '';
    }
};
const decodeHtmlEntities = (text) => {
    if (text === null)
        return '';
    text = text.replace(/&[a-z]+;/g, '');
    try {
        if (text.includes('<ul>')) {
            let t = text
                .split('<li>')
                .map((item) => {
                item = item.replace(/<\/?[^>]+(>|$)/g, '');
                return item;
            })
                .filter((item) => item.trim() !== '');
            return t;
        }
        return text.replace(/<[^>]*>?/gm, '');
    }
    catch (error) {
        return text.replace(/<[^>]*>?/gm, '');
    }
};
const renderContent = (content) => {
    let decodedContent = decodeHtmlEntities(content);
    let array = [];
    if (Array.isArray(decodedContent)) {
        decodedContent.map((item) => {
            array.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({
                        text: item,
                        size: 22,
                        font: 'Calibri',
                        color: '000000',
                    }),
                ],
                alignment: docx_1.AlignmentType.JUSTIFIED,
                bullet: { level: 0 },
            }));
        });
        return array;
    }
    return [
        new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: decodedContent,
                    size: 22,
                    font: 'Calibri',
                    color: '000000',
                }),
            ],
            alignment: docx_1.AlignmentType.JUSTIFIED,
        }),
    ];
};
//# sourceMappingURL=entries.controller.js.map