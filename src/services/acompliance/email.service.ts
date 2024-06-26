import { Injectable } from '@nestjs/common';
import { EmailModel } from 'src/models/acompliance/email.model';
import { Result } from 'src/models/result.model';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {

    private transporter: nodemailer.Transporter;
    private transporter2: nodemailer.Transporter;
    private transporter3: nodemailer.Transporter;

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

    async sendEmail(email: EmailModel): Promise<Result> {
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
            }

            Promise.all([
                this.transporter.sendMail(mailOptions),
                this.transporter2.sendMail(mailOptions)
            ]);

            return { MESSAGE: 'Correo enviado correctamente', STATUS: true };
        } catch (error) {
            return { MESSAGE: 'Error al enviar el correo', STATUS: false };
        }
    }

    async enviarCorreo(destinatario, pdfBytes) {
        try {

            // Opciones del correo electrónico
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

            // Enviar el correo electrónico con el PDF adjunto
            await this.transporter3.sendMail(mailOptions);

        } catch (error) {
            throw new Error(`Error al enviar PDF a ${destinatario}`);
        }
    };

}
