import { Injectable } from '@nestjs/common';
import { EmailModel } from 'src/models/acompliance/email.model';
import { Result } from 'src/models/result.model';
import * as nodemailer from 'nodemailer';
import { SolicitudModel } from 'src/models/public/Solicitud.model';
import { TokenService } from '../User/token.service';

@Injectable()
export class EmailJurisService {

    private transporter: nodemailer.Transporter;

    constructor(
        private tokenService : TokenService
    ) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_JURIS1,
                pass: process.env.EMAIL_JURIS1_PASSWORD1
            }
        });
    }

    async sendEmail(email: SolicitudModel): Promise<Result> {
        try {
            const html = `
                <h2>Detalles del Formulario</h2>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}</p>
                <p><strong>Usuario:</strong> ${email.NOMBRES}</p>
                <p><strong>Correo:</strong> ${email.CORREO}</p>
                <p><strong>Teléfono:</strong> ${email.TELEFONO}</p>
            `;

            const mailOptions = {
                from: process.env.EMAIL_ACOMPLIANCE1,
                to: email.CORREO,
                subject: 'Interesado en el curso de compliance',
                html
            }

            Promise.all([
                this.transporter.sendMail(mailOptions),
            ]);

            return { MESSAGE: 'Correo enviado correctamente', STATUS: true };
        } catch (error) {
            return { MESSAGE: 'Error al enviar el correo', STATUS: false };
        }
    }

}
