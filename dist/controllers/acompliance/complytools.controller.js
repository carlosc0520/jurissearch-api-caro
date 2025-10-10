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
exports.ComplytoolsController = void 0;
const common_1 = require("@nestjs/common");
const puppeteer = __importStar(require("puppeteer"));
const bing_translate_api_1 = require("bing-translate-api");
const axios_1 = require("@nestjs/axios");
const gender_detection_from_name_1 = require("gender-detection-from-name");
const ExcelJS = __importStar(require("exceljs"));
const nodemailer = __importStar(require("nodemailer"));
const hostinger_service_1 = require("../../services/Aws/hostinger.service");
const platform_express_1 = require("@nestjs/platform-express");
let ComplytoolsController = class ComplytoolsController {
    constructor(httpService, hostingerService) {
        this.httpService = httpService;
        this.hostingerService = hostingerService;
        this.AMBIT = "DEV";
        this.CONFIG = {
            "DEV": {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: true,
                dumpio: true,
            },
            "PROD": {
                executablePath: '/usr/bin/chromium-browser',
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        };
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_JURIS1,
                pass: process.env.EMAIL_JURIS1_PASSWORD1,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        this.Proxys = {
            'proxy-1': 'https://diariooficial.elperuano.pe/Normas',
            'proxy-2': 'https://www.dea.gov/fugitives/all',
            'proxy-3': (year) => {
                let url = `https://www.fbi.gov/wanted/fugitives/@@castle.cms.querylisting/f7f80a1681ac41a08266bd0920c9d9d8?display_type=wanted-feature-grid&_layouteditor=true&limit=40&available_tags=%28u%27Crimes+Against+Children%27%2C+u%22Cyber%27s+Most+Wanted%22%2C+u%27White-Collar+Crime%27%2C+u%27Counterintelligence%27%2C+u%27Human+Trafficking%27%2C+u%27Criminal+Enterprise+Investigations%27%2C+u%27Violent+Crime+-+Murders%27%2C+u%27Additional+Violent+Crimes%27%29&query.v:records=%2Fwanted%2Fcac%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%2Fwanted%2Fcei%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%2Fwanted%2Fcyber%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%2Fwanted%2Fmurders%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%2Fwanted%2Fadditional%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%2Fwanted%2Fcounterintelligence%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%2Fwanted%2Fwcc%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%2Fwanted%2Fhuman-trafficking%3A%3A-1&query.o:records=plone.app.querystring.operation.string.absolutePath&query.i:records=path&query.v:records=%5Bu%27Person%27%5D&query.o:records=plone.app.querystring.operation.selection.any&query.i:records=portal_type&query.v:records=%5Bu%27published%27%5D&query.o:records=plone.app.querystring.operation.selection.any&query.i:records=review_state&display_fields=%28%27image%27%2C%29&sort_on=modified&selected-year=${year}`;
                return url;
            },
            'proxy-4': (year) => {
                let url = `https://www.fbi.gov/wanted/terrorism/@@castle.cms.querylisting/55d8265003c84ff2a7688d7acd8ebd5a?display_fields=%28%27image%27%2C%29&_layouteditor=true&query.o:records=plone.app.querystring.operation.selection.any&query.v:records=%5Bu%27Person%27%5D&query.i:records=portal_type&query.o:records=plone.app.querystring.operation.selection.any&query.v:records=%5Bu%27Domestic+Terrorism%27%2C+u%27Most+Wanted+Terrorists%27%2C+u%27Seeking+Information+-+Terrorism%27%5D&query.i:records=Subject&query.o:records=plone.app.querystring.operation.selection.any&query.v:records=%5Bu%27published%27%5D&query.i:records=review_state&limit=40&sort_on=modified&display_type=wanted-feature-grid&available_tags=%28u%27Most+Wanted+Terrorists%27%2C+u%27Seeking+Information+-+Terrorism%27%2C+u%27Domestic+Terrorism%27%29&selected-year=${year}`;
                return url;
            },
            'proxy-5': 'https://www.interpol.int/es/Como-trabajamos/Notificaciones/Notificaciones-rojas/Ver-las-notificaciones-rojas#',
            'proxy-6': 'https://www.sbs.gob.pe/prevencion-de-lavado-activos/Procedimientos-Sancionadores',
            'proxy-7': 'https://www.recompensas.pe/requisitoriados/list/F-',
            'proxy-8': 'http://www.osce.gob.pe/consultasenlinea/inhabilitados/',
            'proxy-9': 'https://rnas.minjus.gob.pe/rnas/public/sancionado/sancionadoMain.xhtml',
        };
    }
    async Proxy1(entidad, res) {
        const proxyUrl = this.Proxys['proxy-1'];
        if (!proxyUrl) {
            throw new Error('El proxy solicitado no existe.');
        }
        const browserP = puppeteer.launch(Object.assign({}, this.CONFIG[this.AMBIT]));
        (async () => {
            let page = await (await browserP).newPage();
            await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
            await page.goto(proxyUrl);
            await page.waitForSelector('#cddesde');
            await page.waitForSelector('#cdhasta');
            await page.waitForSelector('#btnBuscar');
            await page.evaluate(() => {
                document.getElementById('cddesde')['value'] = '';
                document.getElementById('cdhasta')['value'] = '';
            });
            await page.type('#cddesde', entidad.cddesde);
            await page.type('#cdhasta', entidad.cdhasta);
            await page.click('#btnBuscar', { delay: 6000 });
            await page.waitForSelector('.edicionesoficiales_articulos', {
                visible: true,
                timeout: 30000,
            });
            let data = await page.evaluate(() => {
                let elements = document.querySelectorAll('.edicionesoficiales_articulos');
                let data = [];
                elements.forEach((element) => {
                    let title = element.querySelector('h4')
                        ? element.querySelector('h4').textContent.replace(/\n/g, '').trim()
                        : '';
                    let resolucion = element.querySelector('h5 a')
                        ? element
                            .querySelector('h5 a')
                            .textContent.replace(/\n/g, '')
                            .trim()
                        : '';
                    let link = element.querySelector('a')
                        ? element.querySelector('a').href.replace(/\n/g, '').trim()
                        : '';
                    let date = element.querySelector('p b')
                        ? element
                            .querySelector('p b')
                            .textContent.replace(/\n/g, '')
                            .trim()
                            .replace('Fecha: ', '')
                        : '';
                    let description = element.querySelectorAll('p')[1]
                        ? element
                            .querySelectorAll('p')[1]
                            .textContent.replace(/\n/g, '')
                            .trim()
                        : '';
                    data.push({
                        title,
                        link,
                        date,
                        description,
                        resolucion,
                    });
                });
                return {
                    data,
                    status: true,
                };
            });
            res.status(200).send(data);
        })()
            .catch((error) => {
            res.status(500).send({
                status: false,
                message: 'Error al extraer los datos.',
            });
        })
            .finally(async () => {
            await (await browserP).close();
        });
    }
    async Proxy2(entidad, res) {
        const proxyUrl = this.Proxys['proxy-2'];
        if (!proxyUrl) {
            res.status(400).send({
                status: false,
                message: 'El proxy solicitado no existe.',
            });
            return;
        }
        const browserP = puppeteer.launch(Object.assign({}, this.CONFIG[this.AMBIT]));
        (async () => {
            const browser = await browserP;
            const scrapePage = async (pageUrl) => {
                const page = await browser.newPage();
                try {
                    await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
                    await page.setExtraHTTPHeaders({
                        'Accept-Language': 'es',
                    });
                    await page.goto(pageUrl);
                    const data = await page.evaluate(() => {
                        const elements = document.querySelectorAll('.l-view__row');
                        const extractedData = [];
                        elements.forEach((element) => {
                            var _a;
                            const categoria = element.querySelector('.teaser__category');
                            const nombres = element.querySelector('h3.teaser__heading a');
                            const link = element.querySelector('h3.teaser__heading a');
                            const text = element.querySelector('.teaser__text');
                            extractedData.push({
                                categoria: categoria
                                    ? categoria.textContent.replace(/\n/g, '').trim()
                                    : '',
                                nombre: nombres
                                    ? nombres.textContent.replace(/\n/g, '').trim()
                                    : '',
                                link: link ? (_a = link['href']) === null || _a === void 0 ? void 0 : _a.replace(/\n/g, '').trim() : '',
                                text: text ? text.textContent.replace(/\n/g, '').trim() : '',
                            });
                        });
                        return extractedData;
                    });
                    return data;
                }
                catch (error) {
                    return [];
                }
                finally {
                    await page.close();
                }
            };
            try {
                const pageUrls = [`${proxyUrl}?page=0`, `${proxyUrl}?page=2`];
                const [dataPage0, dataPage2] = await Promise.all(pageUrls.map((url) => scrapePage(url)));
                let combinedData = [...dataPage0, ...dataPage2];
                combinedData = await Promise.all(combinedData.map(async (item, index) => {
                    try {
                        const translation = await (0, bing_translate_api_1.translate)(item.text || '', 'en', 'es').then((res) => res.translation || '');
                        const categoryTranslation = await (0, bing_translate_api_1.translate)(item.categoria || '', 'en', 'es').then((res) => res.translation || '');
                        return Object.assign(Object.assign({}, item), { rn: index + 1, categoria: categoryTranslation, text: translation });
                    }
                    catch (error) {
                        return Object.assign(Object.assign({}, item), { rn: index + 1, categoria: item.categoria || '', text: item.text || '' });
                    }
                }));
                res.status(200).send({
                    data: combinedData,
                    status: true,
                });
            }
            catch (error) {
                res.status(500).send({
                    status: false,
                    message: 'Error al extraer los datos.',
                    data: [],
                });
            }
            finally {
                await browser.close();
            }
        })();
    }
    async Proxy2_2(entidad, res) {
        const proxyUrl = entidad.completo;
        if (!proxyUrl) {
            res.status(400).send({
                status: false,
                message: 'El proxy solicitado no existe.',
            });
            return;
        }
        const browserP = puppeteer.launch(Object.assign({}, this.CONFIG[this.AMBIT]));
        (async () => {
            const browser = await browserP;
            const page = await browser.newPage();
            try {
                await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
                await page.setExtraHTTPHeaders({
                    'Accept-Language': 'es',
                });
                await page.goto(proxyUrl);
                const data = await page.evaluate(() => {
                    var _a;
                    try {
                        let sex = '';
                        let identificacion = '';
                        let nacionalidad = '';
                        let alias = '';
                        try {
                            alias =
                                ((_a = document
                                    .querySelector('div.fugitive__content div div')) === null || _a === void 0 ? void 0 : _a.textContent.replace(/\n/g, '').trim()) || '';
                        }
                        catch (e) {
                            alias = '';
                        }
                        const rows = document.querySelectorAll('div.fugitive__content table tbody tr');
                        rows.forEach((row) => {
                            const cells = Array.from(row.querySelectorAll('td'));
                            const sexCell = cells.find((td) => td.textContent.trim() === 'Sex');
                            if (sexCell === null || sexCell === void 0 ? void 0 : sexCell.nextElementSibling) {
                                sex = sexCell.nextElementSibling.textContent.trim();
                            }
                            const identificacionCell = cells.find((td) => td.textContent.trim() === 'NCIC #');
                            if (identificacionCell === null || identificacionCell === void 0 ? void 0 : identificacionCell.nextElementSibling) {
                                identificacion =
                                    identificacionCell.nextElementSibling.textContent.trim();
                            }
                            const nacionalidadCell = cells.find((td) => td.textContent.trim() === 'Last Known Address');
                            if (nacionalidadCell === null || nacionalidadCell === void 0 ? void 0 : nacionalidadCell.nextElementSibling) {
                                nacionalidad =
                                    nacionalidadCell.nextElementSibling.textContent.trim();
                            }
                        });
                        return {
                            genero: sex === 'Male' ? 'M' : sex === 'Female' ? 'F' : '',
                            identificacion: identificacion || '',
                            nacionalidad: nacionalidad || '',
                            alias: alias || '',
                        };
                    }
                    catch (error) {
                        return {
                            genero: '',
                            identificacion: '',
                            nacionalidad: '',
                            alias: '',
                        };
                    }
                });
                if (data === null || data === void 0 ? void 0 : data['nacionalidad']) {
                    data['nacionalidad'] = await (0, bing_translate_api_1.translate)(data['nacionalidad'], 'en', 'es').then((res) => res.translation);
                }
                res.status(200).send({
                    data,
                    proxyUrl,
                    status: true,
                });
            }
            catch (error) {
                res.status(500).send({
                    status: false,
                    message: 'Error al extraer los datos.',
                    data: {
                        genero: '',
                        identificacion: '',
                        nacionalidad: '',
                        alias: '',
                    },
                });
            }
            finally {
                await browser.close();
            }
        })();
    }
    async Proxy3(entidad, res) {
        if (!entidad.year || isNaN(entidad.year)) {
            return res.status(400).send({
                status: false,
                message: 'El año no es válido.',
            });
        }
        const proxyUrl = this.Proxys[`proxy-${entidad.proxy}`](entidad.year);
        if (!proxyUrl) {
            return res.status(400).send({
                status: false,
                message: 'El proxy solicitado no existe.',
            });
        }
        const browserP = puppeteer.launch(Object.assign({}, this.CONFIG[this.AMBIT]));
        (async () => {
            const browser = await browserP;
            const scrapePage = async (pageUrl) => {
                const page = await browser.newPage();
                await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
                await page.setExtraHTTPHeaders({
                    'Accept-Language': 'es',
                });
                try {
                    await page.goto(pageUrl);
                    const data = await page.evaluate(() => {
                        const elements = document.querySelectorAll('.castle-grid-block-item');
                        return Array.from(elements).map((element) => {
                            var _a;
                            const title = element.querySelector('h3.title');
                            const nombre = element.querySelector('p.name a');
                            const link = element.querySelector('a');
                            return {
                                title: title ? title.textContent.replace(/\n/g, '').trim() : '',
                                nombre: nombre
                                    ? nombre.textContent.replace(/\n/g, '').trim()
                                    : '',
                                link: link ? (_a = link['href']) === null || _a === void 0 ? void 0 : _a.replace(/\n/g, '').trim() : '',
                            };
                        });
                    });
                    return data;
                }
                catch (error) {
                    return [];
                }
                finally {
                    await page.close();
                }
            };
            try {
                let data = await scrapePage(proxyUrl);
                data = await Promise.all(data.map(async (item, index) => {
                    try {
                        const translation = await (0, bing_translate_api_1.translate)(item.title, 'en', 'es');
                        return Object.assign(Object.assign({}, item), { rn: index + 1, title: translation.translation || item.title });
                    }
                    catch (translationError) {
                        return Object.assign(Object.assign({}, item), { rn: index + 1, title: item.title });
                    }
                }));
                res.status(200).send({
                    data,
                    status: true,
                });
            }
            catch (error) {
                res.status(500).send({
                    status: false,
                    message: 'Error al extraer los datos.',
                });
            }
            finally {
                await browser.close();
            }
        })();
    }
    async Proxy3_3(entidad, res) {
        if (!entidad.completo) {
            res.status(400).send({
                status: false,
                message: 'El proxy solicitado no existe.',
            });
            return;
        }
        const proxyUrl = entidad.completo;
        const browserP = puppeteer.launch(Object.assign({}, this.CONFIG[this.AMBIT]));
        (async () => {
            const browser = await browserP;
            const page = await browser.newPage();
            try {
                await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
                await page.setExtraHTTPHeaders({
                    'Accept-Language': 'es',
                });
                await page.goto(proxyUrl);
                const data = await page.evaluate(() => {
                    var _a;
                    try {
                        let alias = ((_a = document
                            .querySelector('.wanted-person-aliases p')) === null || _a === void 0 ? void 0 : _a.textContent.replace(/\n/g, '').replace(/"/g, '').trim()) || '';
                        let rows = document.querySelectorAll('table.wanted-person-description tbody tr');
                        let sexo = '';
                        let nacionalidad = '';
                        let etiquetasMas = document.querySelectorAll('.wanted-person-caution p');
                        let etiquetasMas2 = document.querySelectorAll('.wanted-person-details p');
                        let mas = '';
                        let mas2 = '';
                        etiquetasMas === null || etiquetasMas === void 0 ? void 0 : etiquetasMas.forEach((etiqueta) => {
                            mas += etiqueta.textContent.replace(/\n/g, '').trim() + ' ';
                        });
                        etiquetasMas2 === null || etiquetasMas2 === void 0 ? void 0 : etiquetasMas2.forEach((etiqueta) => {
                            mas2 += etiqueta.textContent.replace(/\n/g, '').trim() + ' ';
                        });
                        rows.forEach((row) => {
                            let cells = Array.from(row.querySelectorAll('td'));
                            let sexCell = cells.find((td) => td.textContent.trim() == 'Sex');
                            if (sexCell === null || sexCell === void 0 ? void 0 : sexCell.nextElementSibling) {
                                sexo = sexCell.nextElementSibling.textContent.trim();
                            }
                            let nacionalidadCell = cells.find((td) => td.textContent.trim() == 'Nationality');
                            if (nacionalidadCell === null || nacionalidadCell === void 0 ? void 0 : nacionalidadCell.nextElementSibling) {
                                nacionalidad =
                                    nacionalidadCell.nextElementSibling.textContent.trim();
                            }
                        });
                        return {
                            mas: mas,
                            mas2: mas2,
                            genero: sexo == 'Male' ? 'M' : sexo == 'Female' ? 'F' : '',
                            nacionalidad: nacionalidad,
                            alias: alias,
                            identificacion: '',
                        };
                    }
                    catch (error) {
                        return [];
                    }
                });
                if ((data === null || data === void 0 ? void 0 : data['mas']) && (data === null || data === void 0 ? void 0 : data['mas'].length) > 0 && entidad.proxy == '3') {
                    try {
                        data['mas'] = await (0, bing_translate_api_1.translate)(data['mas'], 'en', 'es').then((res) => res.translation);
                    }
                    catch (error) {
                    }
                }
                if ((data === null || data === void 0 ? void 0 : data['mas2']) &&
                    (data === null || data === void 0 ? void 0 : data['mas2'].length) > 0 &&
                    entidad.proxy == '4') {
                    try {
                        data['mas'] = await (0, bing_translate_api_1.translate)(data['mas2'], 'en', 'es').then((res) => res.translation);
                    }
                    catch (error) {
                    }
                }
                if (data === null || data === void 0 ? void 0 : data['nacionalidad']) {
                    data['nacionalidad'] = await (0, bing_translate_api_1.translate)(data['nacionalidad'], 'en', 'es').then((res) => res.translation);
                }
                res.status(200).send({
                    data,
                    proxyUrl,
                    status: true,
                });
            }
            catch (error) {
                res.status(500).send({
                    status: false,
                    message: 'Error al extraer los datos.',
                    data: [],
                });
            }
            finally {
                await browser.close();
            }
        })();
    }
    async Proxy6(entidad, res) {
        const proxyUrl = this.Proxys['proxy-6'];
        if (!proxyUrl) {
            res.status(400).send({
                status: false,
                message: 'El proxy solicitado no existe.',
            });
            return;
        }
        const browserP = puppeteer.launch(Object.assign({}, this.CONFIG[this.AMBIT]));
        (async () => {
            const browser = await browserP;
            const scrapePage = async (pageUrl) => {
                const page = await browser.newPage();
                try {
                    await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
                    await page.setExtraHTTPHeaders({
                        'Accept-Language': 'es',
                    });
                    await page.goto(pageUrl);
                    const data = await page.evaluate(() => {
                        const elements = document.querySelectorAll('li a');
                        let link = '';
                        elements.forEach((element) => {
                            if (element === null || element === void 0 ? void 0 : element['href'].includes('.xlsx')) {
                                link = element === null || element === void 0 ? void 0 : element['href'];
                            }
                        });
                        return link;
                    });
                    return data;
                }
                catch (error) {
                    return [];
                }
            };
            try {
                const data = await scrapePage(proxyUrl);
                res.status(200).send({
                    data,
                    status: true,
                    proxyUrl,
                });
            }
            catch (error) {
                res.status(500).send({
                    status: false,
                    message: 'Error al extraer los datos.',
                    data: [],
                });
            }
            finally {
                await browser.close();
            }
        })();
    }
    async Proxy7(entidad, res) {
        const proxyUrl = this.Proxys['proxy-7'];
        let browserP;
        let page;
        try {
            browserP = await puppeteer.launch(Object.assign({}, this.CONFIG[this.AMBIT]));
            page = await browserP.newPage();
            await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'es',
            });
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (request
                    .url()
                    .includes('https://sispasvehapp.mininter.gob.pe/api-recompensas/requisitoriados/pageandfilter') &&
                    request.method() !== 'OPTIONS') {
                    const postData = request.postData();
                    if (postData) {
                        const data = JSON.parse(postData);
                        data.pageInfo.page = 1;
                        data.pageInfo.size = 30;
                        request.continue({ postData: JSON.stringify(data) });
                    }
                    else {
                        request.continue();
                    }
                }
                else {
                    request.continue();
                }
            });
            await page.on('response', async (response) => {
                if (response
                    .url()
                    .includes('https://sispasvehapp.mininter.gob.pe/api-recompensas/requisitoriados/pageandfilter') &&
                    response.request().method() !== 'OPTIONS') {
                    try {
                        const data = await response.json();
                        const registros = (data === null || data === void 0 ? void 0 : data.content) || [];
                        res.status(200).send({
                            data: registros,
                            status: true,
                        });
                        await page.close();
                        await browserP.close();
                    }
                    catch (error) {
                        res
                            .status(500)
                            .send({ error: 'Error al procesar la respuesta del servidor' });
                    }
                }
            });
            await page.goto(proxyUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 10000,
            });
            try {
                await page.waitForSelector('h5', { timeout: 10000 });
            }
            catch (error) { }
        }
        catch (error) {
            console.log(error);
            res.status(500).send({ error: 'Error durante la ejecución del proxy' });
        }
        finally {
            await browserP.close();
        }
    }
    async Proxy7_7(entidad, res) {
        try {
            let hashIds = JSON.parse(entidad.entidad);
            const browser = await puppeteer.launch(Object.assign({}, this.CONFIG[this.AMBIT]));
            const scrapePage = async (pageUrl) => {
                const page = await browser.newPage();
                try {
                    await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
                    await page.setExtraHTTPHeaders({
                        'Accept-Language': 'es',
                    });
                    await page.goto(pageUrl, {
                        waitUntil: 'domcontentloaded',
                        timeout: 10000,
                    });
                    await page.waitForSelector('body', { timeout: 1300 });
                    await page.waitForFunction(() => {
                        var _a;
                        const bodyText = ((_a = document.querySelector('body')) === null || _a === void 0 ? void 0 : _a.textContent) || '';
                        const sexoMath = [
                            'Sexo:  Femenino  Lugar de RQ',
                            'Sexo:  Masculino  Lugar de RQ',
                        ];
                        return sexoMath.some((sexo) => bodyText.includes(sexo));
                    }, { timeout: 5000 });
                    const data = await page.evaluate(() => {
                        var _a;
                        try {
                            let estado = '';
                            let sexo = '';
                            let lugar = '';
                            let bodyText = document.querySelector('body').textContent;
                            const estadoMatch = bodyText.match(/Estado:\s*([\w\s]+)/);
                            const sexoMatch = bodyText.match(/Sexo:\s*([\w\s]+)/);
                            const lugarMatch = bodyText.match(/Lugar de RQ:\s*([^\n]+)\s*Delito\(s\):/);
                            if (estadoMatch) {
                                estado = estadoMatch[1].trim().split('  ')[0];
                            }
                            if (sexoMatch) {
                                const sexoValue = sexoMatch[1].trim();
                                sexo = sexoValue.includes('Masculino')
                                    ? 'M'
                                    : sexoValue.includes('Femenino')
                                        ? 'F'
                                        : '';
                            }
                            if (lugarMatch) {
                                lugar = ((_a = lugarMatch === null || lugarMatch === void 0 ? void 0 : lugarMatch[1]) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                            }
                            return { estado, sexo, lugar };
                        }
                        catch (error) {
                            return { estado: '', sexo: '', lugar: '' };
                        }
                    });
                    return Object.assign(Object.assign({}, data), { pageUrl });
                }
                catch (error) {
                    return { estado: '', sexo: '', lugar: '' };
                }
                finally {
                    await page.close();
                }
            };
            const data = await Promise.all(hashIds.map(async (hashId) => {
                return Object.assign({ hashId }, (await scrapePage(`https://www.recompensas.pe/requisitoriados/details/${hashId}`)));
            }));
            await browser.close();
            res.status(200).send({
                data,
                status: true,
            });
        }
        catch (error) {
            res.status(500).send({
                status: false,
                message: 'Error al extraer los datos.',
            });
        }
    }
    async Proxy8(entidad, res) {
        const proxyUrl = this.Proxys['proxy-8'];
        if (!proxyUrl) {
            res.status(400).send({
                status: false,
                message: 'El proxy solicitado no existe.',
            });
            return;
        }
        let url1 = proxyUrl + 'inhabil_publi_mes.asp';
        let url2 = proxyUrl + 'Sancionadosmulta_publi_mes.asp';
        const browserP = puppeteer.launch(Object.assign({}, this.CONFIG[this.AMBIT]));
        (async () => {
            const browser = await browserP;
            const scrapePage = async (pageUrl, ind) => {
                const page = await browser.newPage();
                try {
                    await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
                    await page.setExtraHTTPHeaders({
                        'Accept-Language': 'es',
                    });
                    await page.goto(pageUrl, {
                        waitUntil: 'domcontentloaded',
                        timeout: 10000,
                    });
                    let data = [];
                    if (ind == 1) {
                        data = await page.evaluate(() => {
                            const elements = document.querySelectorAll('table tr');
                            return Array.from(elements).map((element, index) => {
                                var _a, _b, _c;
                                const cells = Array.from(element.querySelectorAll('td'));
                                if (index === 0 || cells.length <= 4) {
                                    return {
                                        id: null,
                                    };
                                }
                                let nombre = '';
                                let ruc = '';
                                let mas = '';
                                let nacionalidad = 'PERÚ';
                                let lugar = 'PERÚ';
                                let fecha = '';
                                let id = '';
                                let link = '';
                                try {
                                    nombre = ((_b = (_a = cells[2]) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
                                    ruc = cells[3].querySelector('a')
                                        ? cells[3].querySelector('a').textContent.trim()
                                        : cells[3].querySelector('div')
                                            ? cells[3].querySelector('div').textContent.trim()
                                            : '';
                                    mas =
                                        (cells[4].textContent || '').trim() +
                                            ' - ' +
                                            (cells[8].textContent || '').trim();
                                    fecha = cells[6].textContent.trim();
                                    const anchorElement = (_c = cells[3]) === null || _c === void 0 ? void 0 : _c.querySelector("a.btn.btn-link[onclick^='ver_record']");
                                    if (anchorElement) {
                                        const onclickValue = anchorElement.getAttribute('onclick');
                                        const match = onclickValue.match(/ver_record\('(\d+)'/);
                                        if (match && match[0]) {
                                            id = match[0];
                                            id = id.replace("ver_record('", '').replace("'", '');
                                        }
                                    }
                                    link = `http://www.osce.gob.pe/consultasenlinea/inhabilitados/record.asp?IdNumInhab=${id}&IdSancionado=&tipo_sac=I`;
                                }
                                catch (error) {
                                }
                                return {
                                    nombre,
                                    ruc,
                                    mas,
                                    nacionalidad,
                                    lugar,
                                    fecha,
                                    id,
                                    link,
                                };
                            });
                        });
                    }
                    if (ind == 2) {
                        data = await page.evaluate(() => {
                            const elements = document.querySelectorAll('table tr');
                            return Array.from(elements).map((element, index) => {
                                var _a, _b;
                                const cells = Array.from(element.querySelectorAll('td'));
                                if (index === 0 || cells.length <= 4) {
                                    return {
                                        id: null,
                                    };
                                }
                                let nombre = '';
                                let ruc = '';
                                let mas = '';
                                let nacionalidad = 'PERÚ';
                                let lugar = 'PERÚ';
                                let fecha = '';
                                let id = '';
                                let link = '';
                                try {
                                    nombre = ((_b = (_a = cells[1]) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
                                    ruc = cells[2].querySelector('a')
                                        ? cells[2].querySelector('a').textContent.trim()
                                        : cells[2].querySelector('div')
                                            ? cells[2].querySelector('div').textContent.trim()
                                            : '';
                                    mas =
                                        (cells[3].textContent || '').trim() +
                                            ' - ' +
                                            (cells[6].textContent || '').trim() +
                                            ' - ' +
                                            'Multa de ' +
                                            (cells[5].textContent || '').trim();
                                    fecha = cells[4].textContent.trim();
                                    link = `http://www.osce.gob.pe/consultasenlinea/inhabilitados/Sancionadosmulta_publi_mes.asp`;
                                }
                                catch (error) {
                                }
                                return {
                                    nombre,
                                    ruc,
                                    mas,
                                    nacionalidad,
                                    lugar,
                                    fecha,
                                    id,
                                    link,
                                };
                            });
                        });
                    }
                    return data;
                }
                catch (error) {
                    return [];
                }
                finally {
                    await page.close();
                }
            };
            try {
                const data1 = await scrapePage(url1, 1);
                const data2 = await scrapePage(url2, 2);
                res.status(200).send({
                    data: data1.concat(data2),
                    status: true,
                });
            }
            catch (error) {
                res.status(500).send({
                    status: false,
                    message: 'Error al extraer los datos.',
                });
            }
            finally {
                await browser.close();
            }
        })();
    }
    async Proxy9(entidad, res) {
        const proxyUrl = this.Proxys['proxy-9'];
        if (!proxyUrl) {
            res.status(400).send({
                status: false,
                message: 'El proxy solicitado no existe.',
            });
            return;
        }
        let url1 = proxyUrl;
        const browserP = puppeteer.launch(Object.assign({}, this.CONFIG[this.AMBIT]));
        (async () => {
            const browser = await browserP;
            const scrapePage = async (pageUrl, ind) => {
                const page = await browser.newPage();
                try {
                    await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');
                    await page.setExtraHTTPHeaders({
                        'Accept-Language': 'es',
                    });
                    await page.goto(pageUrl, {
                        waitUntil: 'domcontentloaded',
                        timeout: 10000,
                    });
                    await page.waitForSelector('.ui-paginator-rpp-options', {
                        timeout: 10000,
                    });
                    let data = await page.evaluate(async () => {
                        let selects = document.querySelectorAll('.ui-paginator-rpp-options');
                        selects.forEach((select) => {
                            select['value'] = '100';
                        });
                        selects.forEach((select) => {
                            let event = new Event('change', { bubbles: true });
                            select.dispatchEvent(event);
                        });
                        await new Promise((resolve) => setTimeout(resolve, 2000));
                        return [];
                    });
                    await page.waitForSelector('#frmResultados table tr', {
                        timeout: 10000,
                    });
                    data = await page.evaluate(() => {
                        const elements = document.querySelectorAll('#frmResultados table tr');
                        return Array.from(elements).map((element, index) => {
                            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
                            const cells = Array.from(element.querySelectorAll('td'));
                            if (index === 0 || cells.length <= 4) {
                                return {
                                    id: null,
                                };
                            }
                            let nombrexapellido = '';
                            let nombre = '';
                            let apellido = '';
                            let identificacion = '';
                            let genero = '';
                            let nacionalidad = 'PERÚ';
                            let mas = '';
                            let fecha = '';
                            try {
                                nombrexapellido = ((_b = (_a = cells[3]) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
                                nombre = ((_c = nombrexapellido.split(',')[1]) === null || _c === void 0 ? void 0 : _c.trim()) || '';
                                apellido = ((_d = nombrexapellido.split(',')[0]) === null || _d === void 0 ? void 0 : _d.trim()) || '';
                                identificacion = ((_f = (_e = cells[2]) === null || _e === void 0 ? void 0 : _e.textContent) === null || _f === void 0 ? void 0 : _f.trim()) || '';
                                mas =
                                    'Nro. Inscrición: ' +
                                        (((_h = (_g = cells[1]) === null || _g === void 0 ? void 0 : _g.textContent) === null || _h === void 0 ? void 0 : _h.trim()) || '') +
                                        '\n - ' +
                                        'Sancionado por ' +
                                        (((_k = (_j = cells[6]) === null || _j === void 0 ? void 0 : _j.textContent) === null || _k === void 0 ? void 0 : _k.trim()) || '') +
                                        '\n - ' +
                                        'Por el periodo de ' +
                                        (((_m = (_l = cells[8]) === null || _l === void 0 ? void 0 : _l.textContent) === null || _m === void 0 ? void 0 : _m.trim()) || '') +
                                        '\n - ' +
                                        'Sanción: ' +
                                        (((_p = (_o = cells[7]) === null || _o === void 0 ? void 0 : _o.textContent) === null || _p === void 0 ? void 0 : _p.trim()) || '');
                                fecha = ((_r = (_q = cells[8]) === null || _q === void 0 ? void 0 : _q.textContent) === null || _r === void 0 ? void 0 : _r.trim()) || '';
                                fecha = fecha.split(' - ')[0];
                                return {
                                    nombre,
                                    apellido,
                                    identificacion,
                                    genero,
                                    nacionalidad,
                                    mas,
                                    fecha,
                                    link: 'https://rnas.minjus.gob.pe/rnas/public/sancionado/sancionadoMain.xhtml',
                                };
                            }
                            catch (error) {
                            }
                        });
                    });
                    data = await Promise.all(data.map(async (item) => {
                        try {
                            const genero = await this.ObtenerGenero(item.nombre);
                            return Object.assign(Object.assign({}, item), { genero });
                        }
                        catch (error) {
                            return Object.assign(Object.assign({}, item), { genero: '' });
                        }
                    }));
                    return data;
                }
                catch (error) {
                    return [];
                }
                finally {
                    await page.close();
                }
            };
            try {
                const data1 = await scrapePage(url1, 1);
                res.status(200).send({
                    data: data1,
                    status: true,
                });
            }
            catch (error) {
                res.status(500).send({
                    status: false,
                    message: 'Error al extraer los datos.',
                });
            }
            finally {
                await browser.close();
            }
        })();
    }
    async SendEmail(entidad, res) {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Datos');
            const headerRange = [
                'A',
                'B',
                'C',
                'D',
                'E',
                'F',
                'G',
                'H',
                'I',
                'J',
                'K',
                'L',
                'M',
                'N',
                'O',
            ];
            worksheet.columns = [
                { header: 'TIPO', key: 'tipo', width: 15 },
                { header: 'APELLIDOS', key: 'apellidos', width: 20 },
                { header: 'NOMBRE', key: 'nombre', width: 20 },
                { header: 'PRO', key: 'pro', width: 15 },
                { header: 'CARGO', key: 'cargo', width: 20 },
                { header: 'LINK', key: 'link', width: 30 },
                { header: 'ALIAS', key: 'alias', width: 15 },
                { header: 'IDENTIFICACION', key: 'identificacion', width: 20 },
                { header: 'DOCUMENTO', key: 'documento', width: 20 },
                { header: 'PASAPORTE', key: 'pasaporte', width: 20 },
                { header: 'NACIONALIDAD', key: 'nacionalidad', width: 20 },
                { header: 'GENERO', key: 'genero', width: 10 },
                { header: 'MAS', key: 'mas', width: 10 },
                { header: 'FECHA', key: 'fecha', width: 15 },
                { header: 'LUGAR', key: 'lugar', width: 20 },
            ];
            entidad.data.forEach((item) => {
                worksheet.addRow({
                    tipo: item.infotipo || '',
                    apellidos: item.infoapellidos || '',
                    nombre: item.infonombres || '',
                    pro: item.infoprog || '',
                    cargo: item.infocargo || '',
                    link: item.infolink || '',
                    alias: item.infoalias || '',
                    identificacion: item.infotipodocumento || '',
                    documento: item.infoidentifica || '',
                    pasaporte: item.infopasaporte || '',
                    nacionalidad: item.infonacionalidad || '',
                    genero: item.infogenero || '',
                    mas: item.infomas || '',
                    fecha: item.infofecha || '',
                    lugar: item.infolugar || '',
                });
            });
            headerRange.forEach((col) => {
                const cell = worksheet.getCell(`${col}1`);
                cell.font = { bold: true, color: { argb: '#000000' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFD3D3D3' },
                };
                cell.alignment = { horizontal: 'center' };
            });
            worksheet.autoFilter = 'A1:O1';
            const buffer = await workbook.xlsx.writeBuffer();
            let emails = ['rsaldarriaga@ccfirma.com ', 'ccarbajal@ccfirma.com', 'kvega@ccfirma.com'];
            const mailOptions = {
                from: '"Comply Tools" <complytools@gmail.com>',
                to: emails.join(', '),
                subject: `Informe de lista ${entidad.tipo} del ${entidad.fecha}`,
                text: '',
                attachments: [
                    {
                        filename: `Informe de lista ${entidad.tipo}.xlsx`,
                        content: buffer,
                        encoding: 'base64',
                    },
                ],
            };
            await this.transporter.sendMail(mailOptions);
            res.status(200).send('Correo enviado exitosamente');
        }
        catch (error) {
            res.status(500).send({
                status: false,
                message: error.message,
            });
        }
    }
    async Genero(entidad, res) {
        if (!entidad.name) {
            return res.status(400).send({
                status: false,
                message: 'Faltan parámetros.',
            });
        }
        try {
            const genero = await this.ObtenerGenero(entidad.name);
            res.status(200).send({
                genero,
                status: true,
            });
        }
        catch (error) {
            res.status(500).send({
                status: false,
                message: 'Error al obtener el género.',
            });
        }
    }
    async Translate(entidad, res) {
        if (!entidad.text) {
            return res.status(400).send({
                status: false,
                message: 'Faltan parámetros.',
            });
        }
        try {
            const translation = await (0, bing_translate_api_1.translate)(entidad.text, 'en', 'es');
            res.status(200).send({
                translation,
                status: true,
            });
        }
        catch (error) {
            res.status(500).send({
                status: false,
                message: 'Error al traducir.',
            });
        }
    }
    async ObtenerGenero(name) {
        var _a;
        name = ((_a = name.split(' ')[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        try {
            let gender = await (0, gender_detection_from_name_1.getGender)(name, 'es');
            return gender == 'male' ? 'M' : gender == 'female' ? 'F' : '';
        }
        catch (error) {
            return '';
        }
    }
    async uploadFiles(files, remotePath) {
        const result = await this.hostingerService.uploadFiles(files, remotePath);
        return result;
    }
    async downloadFiles(fileNames, res) {
        const result = await this.hostingerService.downloadFiles(fileNames);
        if (result.fileName.endsWith('.zip')) {
            res.setHeader('Content-Disposition', `attachment; filename=${result.fileName}`);
            res.setHeader('Content-Type', 'application/zip');
        }
        else {
            res.setHeader('Content-Disposition', `attachment; filename=${result.fileName}`);
            res.setHeader('Content-Type', 'application/octet-stream');
        }
        res.send(Buffer.from(result.fileBuffer, 'base64'));
    }
    async deleteFiles(filePaths) {
        const result = await this.hostingerService.deleteFiles(filePaths);
        return result;
    }
};
exports.ComplytoolsController = ComplytoolsController;
__decorate([
    (0, common_1.Get)('proxy-1'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "Proxy1", null);
__decorate([
    (0, common_1.Get)('proxy-2'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "Proxy2", null);
__decorate([
    (0, common_1.Get)('proxy-2-2'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "Proxy2_2", null);
__decorate([
    (0, common_1.Get)('proxy-3'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "Proxy3", null);
__decorate([
    (0, common_1.Get)('proxy-3-3'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "Proxy3_3", null);
__decorate([
    (0, common_1.Get)('proxy-6'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "Proxy6", null);
__decorate([
    (0, common_1.Get)('proxy-7'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "Proxy7", null);
__decorate([
    (0, common_1.Post)('proxy-7-7'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "Proxy7_7", null);
__decorate([
    (0, common_1.Get)('proxy-8'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "Proxy8", null);
__decorate([
    (0, common_1.Get)('proxy-9'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "Proxy9", null);
__decorate([
    (0, common_1.Post)('send-email'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "SendEmail", null);
__decorate([
    (0, common_1.Get)('genero'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "Genero", null);
__decorate([
    (0, common_1.Get)('translate'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "Translate", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files')),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)('remotePath')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "uploadFiles", null);
__decorate([
    (0, common_1.Post)('download'),
    __param(0, (0, common_1.Body)('fileNames')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "downloadFiles", null);
__decorate([
    (0, common_1.Delete)('delete'),
    __param(0, (0, common_1.Body)('filePaths')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ComplytoolsController.prototype, "deleteFiles", null);
exports.ComplytoolsController = ComplytoolsController = __decorate([
    (0, common_1.Controller)('complytools'),
    __metadata("design:paramtypes", [axios_1.HttpService, hostinger_service_1.HostingerService])
], ComplytoolsController);
//# sourceMappingURL=complytools.controller.js.map