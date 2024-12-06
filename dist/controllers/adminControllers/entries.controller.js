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
const jszip_1 = __importDefault(require("jszip"));
const pdfmake_1 = __importDefault(require("pdfmake/build/pdfmake"));
const vfs_fonts_1 = __importDefault(require("pdfmake/build/vfs_fonts"));
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
            const [file1] = files;
            const templatePDFBytes = fs.readFileSync(file1.path);
            const pdfDoc = await pdf_lib_1.PDFDocument.load(templatePDFBytes);
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
            const [file1] = files;
            const templatePDFBytes = fs.readFileSync(file1.path);
            const pdfDoc = await pdf_lib_1.PDFDocument.load(templatePDFBytes);
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
                const templatePDFBytes = fs.readFileSync(file1.path);
                const pdfDoc = await pdf_lib_1.PDFDocument.load(templatePDFBytes);
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
                const templatePDFBytes = fs.readFileSync(file1.path);
                const pdfDoc = await pdf_lib_1.PDFDocument.load(templatePDFBytes);
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
    async listData(entidad, TYPE, BLOG, FRESOLUTION, TEMA, RTITLE, FCRCN) {
        return await this.entriesService.listData(entidad, entidad.DESC, TYPE, null, BLOG, FRESOLUTION, TEMA, RTITLE, FCRCN);
    }
    async listSearchData(req, RTITLE, TYPE, res) {
        try {
            let data = await this.entriesService.listSearchData(RTITLE, 2, TYPE);
            let zip = new jszip_1.default();
            const pathcaroa = path.join(__dirname, '..', '..', 'files/files', 'caroa.png');
            const pathccfirma = path.join(__dirname, '..', '..', 'files/files', 'ccfirma.png');
            const pathmarcadeagua = path.join(__dirname, '..', '..', 'files/files', 'marcadeagua.png');
            const pathnuevologo = path.join(__dirname, '..', '..', 'files/files', 'nuevologo.png');
            const downloadPromises = data.map(async (entry) => {
                try {
                    const fileBuffer = await this.s3Service.downloadFile(entry.ENTRIEFILE);
                    const pdfDoc = await pdf_lib_1.PDFDocument.load(fileBuffer);
                    const caroaImage = await pdfDoc.embedPng(fs.readFileSync(pathcaroa));
                    const ccfirmaImage = await pdfDoc.embedPng(fs.readFileSync(pathccfirma));
                    const marcadeaguaImage = await pdfDoc.embedPng(fs.readFileSync(pathmarcadeagua));
                    const nuevologoImage = await pdfDoc.embedPng(fs.readFileSync(pathnuevologo));
                    const pages = await pdfDoc.getPages();
                    for (const page of pages) {
                        const { width, height } = page.getSize();
                        await page.drawImage(marcadeaguaImage, {
                            x: width / 2 - 310,
                            y: height / 2 - 330,
                            width: 620,
                            height: 600,
                            opacity: 0.7,
                        });
                        await page.drawImage(caroaImage, {
                            x: 10,
                            y: height - 43,
                            width: 95,
                            height: 40,
                        });
                        await page.drawText('https://ccfirma.com/', {
                            x: 10,
                            y: height - 25,
                            size: 10,
                            color: (0, pdf_lib_1.rgb)(0, 0, 0),
                            opacity: 0.0,
                        });
                        await page.drawText('https://ccfirma.com/', {
                            x: 5,
                            y: height / 2 - 25,
                            size: 11,
                            color: (0, pdf_lib_1.rgb)(0, 0, 0),
                            opacity: 0.0,
                            rotate: (0, pdf_lib_1.degrees)(-90),
                        });
                        await page.drawText('https://ccfirma.com/', {
                            x: 5,
                            y: height / 2 - 90,
                            size: 11,
                            color: (0, pdf_lib_1.rgb)(0, 0, 0),
                            opacity: 0.0,
                            rotate: (0, pdf_lib_1.degrees)(-90),
                        });
                        await page.drawText('https://ccfirma.com/', {
                            x: 5,
                            y: height / 2 + 90,
                            size: 11,
                            color: (0, pdf_lib_1.rgb)(0, 0, 0),
                            opacity: 0.0,
                            rotate: (0, pdf_lib_1.degrees)(-90),
                        });
                        await page.drawImage(nuevologoImage, {
                            x: width / 2 - 25,
                            y: height - 43,
                            width: 50,
                            height: 35,
                        });
                        await page.drawText('https://jurissearch.com/', {
                            x: width / 2 - 25,
                            y: height - 30,
                            size: 10,
                            color: (0, pdf_lib_1.rgb)(0, 0, 0),
                            opacity: 0.0,
                        });
                        await page.drawImage(ccfirmaImage, {
                            x: width / 2 - 30,
                            y: 5,
                            width: 70,
                            height: 30,
                            opacity: 0.9,
                        });
                        await page.drawText('https://ccfirma.com/', {
                            x: width / 2 - 30,
                            y: 10,
                            size: 10,
                            color: (0, pdf_lib_1.rgb)(0, 0, 0),
                            opacity: 0.0,
                        });
                    }
                    const pdfBytes = await pdfDoc.save();
                    zip.file(`${entry.TITLE}.pdf`, pdfBytes);
                }
                catch (error) {
                    return null;
                }
            });
            await Promise.all(downloadPromises);
            const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename=asistentes.zip`);
            res.status(200).send(zipBuffer);
        }
        catch (error) {
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
    async listSearchDataFull(RTITLE, TYPE, res) {
        try {
            let dataArray = await this.entriesService.listSearchData(RTITLE, 1, TYPE);
            dataArray = dataArray.slice(0, 100);
            pdfmake_1.default.vfs = vfs_fonts_1.default.pdfMake.vfs;
            const zip = new jszip_1.default();
            let margin = [40, 10, 40, 10];
            let totalPages = 0;
            let fontSize = 11;
            const pdfPromises = dataArray.map((data) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                let ambit = ((_b = (_a = JSON.parse(data.AMBIT)) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.LABEL) || '';
                ambit = ambit ? ambit.replace(/\s*,/g, ',') : '';
                let magistrados = ((_d = (_c = JSON.parse(data.MAGISTRADOS)) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.LABEL) || '';
                magistrados = magistrados ? magistrados.replace(/\s*,/g, ',') : '';
                let delitos = ((_f = (_e = JSON.parse(data.DELITO)) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.LABEL) || '';
                delitos = delitos ? delitos.replace(/\s*,/g, ',') : '';
                let ojurisdiccional = ((_h = (_g = JSON.parse(data.OJURISDICCIONAL)) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.LABEL) || '';
                ojurisdiccional = ojurisdiccional
                    ? ojurisdiccional.replace(/\s*,/g, ',')
                    : '';
                let recursosEntrie = ((_k = (_j = JSON.parse(data.RECURSO)) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.LABEL) || '';
                recursosEntrie = recursosEntrie
                    ? recursosEntrie.replace(/\s*,/g, ',')
                    : '';
                let materias = ((_m = (_l = JSON.parse(data.MATERIA)) === null || _l === void 0 ? void 0 : _l[0]) === null || _m === void 0 ? void 0 : _m.LABEL) || '';
                materias = materias ? materias.replace(/\s*,/g, ',') : '';
                data = Object.assign(Object.assign({}, data), { ID: data.ID, TITLE: data.TITLE, AMBIT: ambit, FRESOLUTION: data.FRESOLUTION
                        ? new Date(data.FRESOLUTION).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })
                        : '', OJURISDICCIONAL: ojurisdiccional, MAGISTRATES: magistrados, VDESIDENTE: data.VDESIDENTE, CVOTE: data.CVOTE, ENTRIEFILE: data.ENTRIEFILE, ENTRIEFILERESUMEN: data.ENTRIEFILERESUMEN, KEYWORDS: (_o = data.KEYWORDS) === null || _o === void 0 ? void 0 : _o.replace(/\s*,/g, ', '), TEMA: data.TEMA, SUBTEMA: data.SUBTEMA, SHORTSUMMARY: data.SHORTSUMMARY, RESUMEN: data.RESUMEN, NENTRIEFILERESUMEN: null, NENTRIEFILE: null, DELITO: delitos, RECURSO: recursosEntrie, MATERIA: materias });
                const documentoPDF = {
                    header: (currentPage, pageCount) => ({
                        style: 'headerStyle',
                        columns: [
                            {
                                width: '*',
                                text: '',
                                alignment: 'center',
                                margin: [40, 40, 40, 40],
                            },
                            {
                                width: 'auto',
                                stack: [
                                    {
                                        image: recursos_1.default.nuevoLogoJuris,
                                        width: 60,
                                        link: 'http://web-juris-search-caro.s3-website-us-east-1.amazonaws.com/',
                                        alignment: 'center',
                                        margin: [0, 20, 0, 0],
                                    },
                                ],
                            },
                            {
                                width: '*',
                                text: '',
                                alignment: 'center',
                                margin: [40, 40, 40, 40],
                            },
                        ],
                    }),
                    background: [
                        {
                            image: recursos_1.default.toIMG,
                            width: 620,
                            height: 600,
                            absolutePosition: { x: 5, y: 150 },
                            alignment: 'center',
                            opacity: 0.5,
                        },
                    ],
                    content: [
                        {
                            text: `${data.TITLE}`,
                            style: 'header',
                            alignment: 'left',
                            margin: [40, -20, 40, 10],
                            bold: true,
                            fontFace: 'Calibri',
                        },
                        {
                            columns: [
                                {
                                    ul: [`Tipo de Recurso:`, `Delitos:`, `Vinculante:`],
                                    margin: [margin[0], 0, 0, 0],
                                    fontSize,
                                    lineHeight: 1.5,
                                    width: '35%',
                                    fontFace: 'Calibri',
                                },
                                {
                                    ul: [
                                        `${data.RECURSO}`,
                                        `${data.DELITO}`,
                                        `${data.ISBINDING ? 'Sí' : 'No'}`,
                                    ],
                                    margin: [0, 5, margin[0] + 20, 0],
                                    fontSize,
                                    lineHeight: 1.5,
                                    width: '65%',
                                    fontFace: 'Calibri',
                                },
                            ],
                        },
                        {
                            style: 'tableExample',
                            table: {
                                dontBreakRows: false,
                                widths: ['35%', '65%'],
                                body: [
                                    [
                                        {
                                            text: 'CONTENIDO',
                                            bold: true,
                                            colSpan: 2,
                                            fontSize,
                                            alignment: 'center',
                                            margin: [20, 15, 20, 15],
                                        },
                                        {},
                                    ],
                                    [
                                        {
                                            text: 'TEMA',
                                            bold: true,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                        this.renderContent(data.TEMA, fontSize, [10, 15, 10, 15]),
                                    ],
                                    [
                                        {
                                            text: 'SUBTEMA',
                                            bold: true,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                        this.renderContent(data.SUBTEMA, fontSize, [10, 15, 10, 15]),
                                    ],
                                    [
                                        {
                                            text: 'PALABRAS CLAVES',
                                            bold: true,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                        {
                                            text: data.KEYWORDS,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                    ],
                                    [
                                        {
                                            text: 'SÍNTESIS DE LOS FUNDAMENTOS JURÍDICOS RELEVANTES',
                                            bold: true,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                        this.renderContent(data.SHORTSUMMARY, fontSize, [10, 15, 10, 15]),
                                    ],
                                    [
                                        {
                                            text: 'FUNDAMENTOS JURÍDICOS RELEVANTES',
                                            bold: true,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                            fillColor: '#fff2cc',
                                        },
                                        Object.assign(Object.assign({}, this.renderContent(data.RESUMEN, fontSize, [10, 15, 10, 15])), { fillColor: '#fff2cc', italics: true }),
                                    ],
                                    [
                                        {
                                            text: 'IDENTIFICACIÓN',
                                            bold: true,
                                            fontSize,
                                            colSpan: 2,
                                            alignment: 'center',
                                            margin: [10, 15, 10, 15],
                                        },
                                        {},
                                    ],
                                    [
                                        {
                                            text: 'ÁMBITO',
                                            bold: true,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                        {
                                            text: data.AMBIT,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                    ],
                                    [
                                        {
                                            text: 'FECHA DE RESOLUCIÓN',
                                            bold: true,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                        {
                                            text: data.FRESOLUTION,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                    ],
                                    [
                                        {
                                            text: 'ÓRGANO JURISDICCIONAL',
                                            bold: true,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                        {
                                            text: data.OJURISDICCIONAL,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                    ],
                                    [
                                        {
                                            text: 'MAGISTRADOS',
                                            bold: true,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                        {
                                            text: data.MAGISTRATES,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                    ],
                                    [
                                        {
                                            text: [
                                                'VOTO DEL DESIDENTE\n',
                                                {
                                                    text: 'Voto que discrepa del fallo final adoptado.',
                                                    fontSize: fontSize - 2,
                                                    bold: false,
                                                    italics: true,
                                                },
                                            ],
                                            bold: true,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                        {
                                            text: (data === null || data === void 0 ? void 0 : data.VDESIDENTE) || '-',
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                    ],
                                    [
                                        {
                                            text: [
                                                'VOTO CONCURRENTE\n',
                                                {
                                                    text: 'Voto que disiente de la argumentación jurídica, pero no del fallo final adoptado.',
                                                    fontSize: fontSize - 1,
                                                    bold: false,
                                                    italics: true,
                                                },
                                            ],
                                            bold: true,
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                        {
                                            text: (data === null || data === void 0 ? void 0 : data.CVOTE) || '-',
                                            fontSize,
                                            margin: [10, 15, 10, 15],
                                        },
                                    ],
                                ],
                            },
                        },
                        { text: '\n\n\n' },
                    ],
                    styles: {
                        FontFace: 'Calibri',
                        headerStyle: {
                            fontSize: 18,
                            bold: true,
                            margin: [0, 0, 0, 5],
                        },
                        tableExample: {
                            margin: [margin[0], 10, margin[2], 10],
                            FontFace: 'Calibri',
                        },
                        footer: {
                            FontFace: 'Calibri',
                            fontSize: 10,
                            margin: [40, 50, 40, 10],
                        },
                    },
                    footer: function (currentPage, pageCount) {
                        if (currentPage > totalPages) {
                            totalPages = currentPage;
                        }
                        return {
                            style: 'footer',
                            columns: [
                                {
                                    width: '*',
                                    text: ``,
                                    alignment: 'left',
                                    color: 'transparent',
                                },
                                {
                                    width: 'auto',
                                    text: 'www.',
                                    alignment: 'center',
                                    color: 'gray',
                                },
                                {
                                    width: 'auto',
                                    text: 'ccfirma',
                                    alignment: 'center',
                                    color: '#e81eb2',
                                    link: 'https://ccfirma.com/',
                                },
                                {
                                    width: 'auto',
                                    text: '.com',
                                    alignment: 'center',
                                    color: 'gray',
                                },
                                {
                                    width: '*',
                                    text: `Página ${currentPage} de ${pageCount}`,
                                    alignment: 'right',
                                },
                            ],
                        };
                    },
                    pageMargins: [40, 100, 40, 80],
                };
                const pdfDoc = pdfmake_1.default.createPdf(documentoPDF);
                return new Promise((resolve, reject) => {
                    pdfDoc.getBuffer((buffer) => {
                        const fileName = `${data.TITLE.toUpperCase()} - RESUMEN EJECUTIVO.pdf`;
                        zip.file(fileName, buffer);
                        resolve(buffer);
                    });
                });
            });
            await Promise.all(pdfPromises);
            const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename=entradas.zip`);
            res.status(200).send(zipBuffer);
        }
        catch (error) {
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
    renderContent(content, fontSize, margin) {
        let decodedContent = this.decodeHtmlEntities(content);
        if (Array.isArray(decodedContent)) {
            return {
                ul: decodedContent,
                fontSize,
                alignment: 'justify',
                margin,
            };
        }
        return {
            text: decodedContent,
            fontSize,
            alignment: 'justify',
            margin,
        };
    }
    decodeHtmlEntities(text) {
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
            let data = await this.entriesService.getEntriePrint(PATH);
            let fecha = new Date('2024-11-08');
            let modificar = false;
            if (data.FEDCN > fecha) {
                modificar = true;
            }
            const fileBuffer = await this.s3Service.downloadFile(PATH);
            const pathcaroa = path.join(__dirname, '..', '..', 'files/files', 'caroa.png');
            const pathccfirma = path.join(__dirname, '..', '..', 'files/files', 'ccfirma.png');
            const pathmarcadeagua = path.join(__dirname, '..', '..', 'files/files', 'marcadeagua.png');
            const pathnuevologo = path.join(__dirname, '..', '..', 'files/files', 'nuevologo.png');
            const pdfDoc = await pdf_lib_1.PDFDocument.load(fileBuffer);
            const caroaImage = await pdfDoc.embedPng(fs.readFileSync(pathcaroa));
            const ccfirmaImage = await pdfDoc.embedPng(fs.readFileSync(pathccfirma));
            const marcadeaguaImage = await pdfDoc.embedPng(fs.readFileSync(pathmarcadeagua));
            const nuevologoImage = await pdfDoc.embedPng(fs.readFileSync(pathnuevologo));
            const pages = pdfDoc.getPages();
            if (modificar) {
                for (const page of pages) {
                    const { width, height } = page.getSize();
                    page.drawImage(marcadeaguaImage, {
                        x: width / 2 - 310,
                        y: height / 2 - 330,
                        width: 620,
                        height: 600,
                        opacity: 0.7,
                    });
                    page.drawImage(caroaImage, {
                        x: 10,
                        y: height - 43,
                        width: 95,
                        height: 40,
                    });
                    page.drawText('https://ccfirma.com/', {
                        x: 10,
                        y: height - 25,
                        size: 10,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                    });
                    page.drawText('https://ccfirma.com/', {
                        x: 5,
                        y: height / 2 - 25,
                        size: 11,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                        rotate: (0, pdf_lib_1.degrees)(-90),
                    });
                    page.drawText('https://ccfirma.com/', {
                        x: 5,
                        y: height / 2 - 90,
                        size: 11,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                        rotate: (0, pdf_lib_1.degrees)(-90),
                    });
                    page.drawText('https://ccfirma.com/', {
                        x: 5,
                        y: height / 2 + 90,
                        size: 11,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                        rotate: (0, pdf_lib_1.degrees)(-90),
                    });
                    page.drawImage(nuevologoImage, {
                        x: width / 2 - 25,
                        y: height - 43,
                        width: 50,
                        height: 35,
                    });
                    await page.drawText('https://jurissearch.com/', {
                        x: width / 2 - 25,
                        y: height - 30,
                        size: 10,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                    });
                    page.drawImage(ccfirmaImage, {
                        x: width / 2 - 30,
                        y: 5,
                        width: 70,
                        height: 30,
                        opacity: 0.9,
                    });
                    page.drawText('https://ccfirma.com/', {
                        x: width / 2 - 30,
                        y: 10,
                        size: 10,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                        opacity: 0.0,
                    });
                }
            }
            const pdfBytes = await pdfDoc.save();
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="modified-file.pdf"`,
            });
            res.send(Buffer.from(pdfBytes));
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
    async busquedaSugges(req, busqueda) {
        busqueda.UEDCN = req.user.UCRCN;
        busqueda.IDUSR = req.user.ID;
        return await this.entriesService.busquedaSugges(busqueda);
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
        data.JURISDICCION = JSON.parse((data === null || data === void 0 ? void 0 : data.JURISDICCION) || '[]')
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
                                                            text: 'JURISDICCIÓN',
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
                                                            text: `${data.JURISDICCION || '-'}`,
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
        limits: { fileSize: 100 * 1024 * 1024 },
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
        limits: { fileSize: 100 * 1024 * 1024 },
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
    __param(6, (0, common_1.Query)('FCRCN')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "listData", null);
__decorate([
    (0, common_1.Get)('list-search-data'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('RTITLE')),
    __param(2, (0, common_1.Query)('TYPE')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "listSearchData", null);
__decorate([
    (0, common_1.Get)('list-search-data-full'),
    __param(0, (0, common_1.Query)('RTITLE')),
    __param(1, (0, common_1.Query)('TYPE')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "listSearchDataFull", null);
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
    (0, common_1.Get)('busqueda-sugges'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, busqueda_model_1.BusquedaModel]),
    __metadata("design:returntype", Promise)
], EntriesController.prototype, "busquedaSugges", null);
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