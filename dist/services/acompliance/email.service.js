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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ACOMPLIANCE1,
                pass: process.env.EMAIL_ACOMPLIANCE_PASSWORD1
            }
        });
        this.transporter2 = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ACOMPLIANCE2,
                pass: process.env.EMAIL_ACOMPLIANCE_PASSWORD2
            }
        });
        this.transporter3 = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_JURISEARCH,
                pass: process.env.EMAIL_JURISEARCH_PASSWORD1
            }
        });
    }
    async sendEmail(email) {
        try {
            const html = `
                <h2>Detalles del Formulario</h2>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}</p>
                <p><strong>Usuario:</strong> ${email.NOMBRES}</p>
                <p><strong>Correo:</strong> ${email.CORREO}</p>
                <p><strong>Teléfono:</strong> ${email.TELEFONO}</p>
                <p><strong>Provincia:</strong> ${email.PROVINCIA}</p>
            `;
            const mailOptions = {
                from: process.env.EMAIL_ACOMPLIANCE1,
                to: email.CORREO,
                subject: 'Interesado en el curso de compliance',
                html
            };
            Promise.all([
                this.transporter.sendMail(mailOptions),
                this.transporter2.sendMail(mailOptions)
            ]);
            return { MESSAGE: 'Correo enviado correctamente', STATUS: true };
        }
        catch (error) {
            return { MESSAGE: 'Error al enviar el correo', STATUS: false };
        }
    }
    async enviarCorreo(destinatario, pdfBytes) {
        try {
            const mailOptions = {
                from: process.env.JURISEARCH_EMAIL,
                to: destinatario,
                subject: 'Asunto del correo',
                text: 'Adjunto encontrarás el PDF con el QR incrustado.',
                attachments: [
                    {
                        filename: 'archivo_con_qr.pdf',
                        content: pdfBytes,
                        encoding: 'base64',
                    },
                ],
            };
            await this.transporter3.sendMail(mailOptions);
        }
        catch (error) {
            throw new Error(`Error al enviar PDF a ${destinatario}`);
        }
    }
    ;
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map