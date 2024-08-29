import { Injectable, Query } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Result } from 'src/models/result.model';
import * as nodemailer from 'nodemailer';
import { SolicitudModel } from 'src/models/public/Solicitud.model';
import { TokenService } from '../User/token.service';
import * as fs from 'fs';
import procedures from '../configMappers';
import { User } from 'src/models/Admin/user.model';
import { HelpModel } from 'src/models/mantenimiento/help.model';

@Injectable()
export class EmailJurisService {

    private transporter: nodemailer.Transporter;
    private transporter2: nodemailer.Transporter;

    constructor(
        private tokenService: TokenService,
        private connection: DataSource
    ) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_JURIS1,
                pass: process.env.EMAIL_JURIS1_PASSWORD1
            }
        });

        this.transporter2 = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_JURISEARCH,
                pass: process.env.EMAIL_JURISEARCH_PASSWORD1
            }
        });
    }

    async sendEmail(model: SolicitudModel): Promise<Result> {
        try {
            const token = await this.tokenService.generateTokenSolicitud(model);

            const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bienvenido a JURISSEARCH</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container_juris {
                        max-width: 600px;
                        margin: 50px auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .container_juris h1 {
                        color: #333333;
                    }
                    
                    .container_juris .highlight-juris {
                        color: #e81eb2ff;
                        font-weight: bold;
                    }
                    .container_juris .highlight-search {
                        color: #1764ffff;
                        font-weight: bold;
                    }

                    .container_juris p {
                        color: #666666;
                        line-height: 1.6;
                    }
                    .container_juris a {
                        display: inline-block;
                        padding: 10px 20px;
                        margin-top: 20px;
                        background-color: #007BFF;
                        color: #ffffff!important;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .container_juris a:hover {
                        background-color: #0056b3;
                    }
                    .container_juris .logo {
                        margin-top: 20px;
                        text-align: center;
                    }
                    .container_juris .logo img {
                        max-width: 100px;
                    }
                        
                </style>
            </head>
                <body>
                    <div class="container_juris">
                        <h1>Bienvenido a <span class="highlight-juris">JURIS </span><span class="highlight-search">SEARCH</span></h1>
                        <p>Estamos encantados de que uses nuestro sistema. A continuación, te adjuntamos un enlace para que puedas acceder al sistema de forma automática:</p>
                        <p><a href="http://web-juris-search-caro.s3-website-us-east-1.amazonaws.com/auth/autoUser/${token}">Acceder</a></p>
                        <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en ponerte en contacto con nosotros.</p>
                        <p>¡Gracias por usar <span class="highlight-juris">JURIS </span><span class="highlight-search">SEARCH</span>!</p>
                    </div>
                </body>
            </html>
            `;


            const mailOptions = {
                from: process.env.EMAIL_ACOMPLIANCE1,
                to: model.CORREO,
                subject: 'Bienvenido a JURISSEARCH',
                html
            };

            await this.transporter2.sendMail(mailOptions);

            return { MESSAGE: 'Solicitud enviada correctamente, revisa tu correo y activa tu cuenta.', STATUS: true };

        } catch (error) {
            return { MESSAGE: 'Error al enviar la solicitud', STATUS: false };
        }
    }

    async sendEmailContacto(model: HelpModel): Promise<Result> {
        try {

            const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bienvenido a JURISSEARCH</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                        
                </style>
            </head>
                <body>
                    <div class="container_juris">
                        <h1>Solicitud de contacto</h1>
                        <p>Nombre: ${model.NOMBRES}</p>
                        <p>Correo: ${model.CORREO}</p>
                        <p>Asunto: ${model.ASUNTO}</p>
                        <p>Mensaje: ${model.MENSAJE}</p>
                        <p>Fecha: ${new Date().toLocaleDateString()}</p>
                    </div>
                </body>
            </html>
            `;


            const mailOptions = {
                from: 'jsearch@ccfirma.com',
                to: 'jsearch@ccfirma.com',
                subject: 'Solicitud de contacto',
                html
            };

            await this.transporter2.sendMail(mailOptions);

            return { MESSAGE: 'Solicitud enviada correctamente, revisa tu correo y activa tu cuenta.', STATUS: true };

        } catch (error) {
            return { MESSAGE: 'Error al enviar la solicitud', STATUS: false };
        }
    }


    async ccfirmaSendEmail(model: SolicitudModel): Promise<Result> {

        let origen: string = '';
        switch (model.IDENTIFICADOR) {
            case "1": origen = "Caro & Asociados"; break;
            case "2": origen = "Juris Search"; break;
            case "3": origen = "AIC COMPLIANCE"; break;
            case "4": origen = "CEDPE"; break;
            case "5": origen = "Origen desconocido"; break;
            default: origen = "Origen desconocido"; break;
        }

        let queryAsync = procedures.CCFIRMA.SOLICITUDES.CRUD;
        queryAsync += ` @p_cData = ${model ? `'${JSON.stringify({ ...model, ORIGEN: origen, MOTIVO: model.MOTIVO })}'` : null},`;
        queryAsync += ` @p_cUser = '${origen}',`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${null}`;

        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = result?.[0]?.RESULT > 0;
            if (!isSuccess) {
                return { MESSAGE: 'Ocurrió un error al intentar enviar la solicitud', STATUS: false };
            }



            let contenido = '';
            if (model.IDENTIFICADOR == "1") {
                contenido += `<p>Nombre: ${model?.NOMBRES || ""}</p>`;
                contenido += `<p>Apellido: ${model?.APELLIDOP || ""}</p>`;
                contenido += `<p>Correo: ${model?.CORREO || ""}</p>`;
                contenido += `<p>Pais: ${model?.PAIS || ""}</p>`;
            }

            if (model.IDENTIFICADOR == "2") {
                contenido = `Gracias por contactarnos, a continuación te adjuntamos un documento con la guía práctica para la formalización de tu negocio.`;
            }

            if (model.IDENTIFICADOR == "3" || model.IDENTIFICADOR == "4") {
                contenido += `<p>Nombres: ${model?.NOMBRES || ""}</p>`;
                contenido += `<p>Correo: ${model?.CORREO || ""}</p>`;
                contenido += `<p>Teléfono: ${model?.TELEFONO || ""}</p>`;
                contenido += `<p>Provincia: ${model?.PROVINCIA || ""}</p>`;
            }



            const html = `
                <!DOCTYPE html>
                    <html lang="es">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body>
                        <div>
                            <h1>Solicitud desde ${origen}</h1>
                            <p>Motivo: ${model?.MOTIVO || ""}</p>
                            ${contenido}
                            <p>Fecha: ${new Date().toLocaleDateString()}</p>
                        </div>
                    </body>
                </html>
                `;

            const mailOptions = {
                from: process.env.EMAIL_JURISEARCH,
                to: 'formulariocaro@gmail.com',
                subject: `Solicitud desde ${origen}`,
                html
            };

            await this.transporter.sendMail(mailOptions);
            let base64Data = '';

            if (model.IDENTIFICADOR == "1") {
                const filePath = './documentos/Guía Práctica para la formalización de tu negocio Caro & Asociados.pdf';
                const data = fs.readFileSync(filePath);
                base64Data = Buffer.from(data).toString('base64');
            }

            return { MESSAGE: 'Solicitud enviada correctamente, gracias por contactarnos.', STATUS: true, FILE: base64Data };

        } catch (error) {
            return { MESSAGE: 'Error al enviar la solicitud', STATUS: false };

        }
    }


    async recoveryPassword(model: User): Promise<Result> {
        try {
            
            const token = await this.tokenService.generateTokenRecovery(model, 10);
    
            const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Recuperar contraseña</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container_juris {
                        max-width: 600px;
                        margin: 50px auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .container_juris h1 {
                        color: #333333;
                    }
    
    
                    .container_juris p {
                        color: #666666;
                        line-height: 1.6;
                    }
    
                    .container_juris a {
                        display: inline-block;
                        padding: 10px 20px;
                        margin-top: 20px;
                        background-color: #007BFF;
                        color: #ffffff!important;
                        text-decoration: none;
                        border-radius: 5px;
                    }
    
                    .container_juris a:hover {
                        background-color: #0056b3;
                    }
    
                    .container_juris .logo {
                        margin-top: 20px;
                        text-align: center;
                    }
    
                    .container_juris .logo img {
                        max-width: 100px;
                    }
    
                </style>
            </head>
                <body>
                    <div class="container_juris">
                        <h1>Recuperar contraseña</h1>
                        <p>Estás recibiendo este correo porque has solicitado recuperar tu contraseña. A continuación, te adjuntamos un enlace para que puedas cambiar tu contraseña:</p>
                        <p><a href="http://web-juris-search-caro.s3-website-us-east-1.amazonaws.com/auth/recovery/${token}">Cambiar contraseña</a></p>
                        <p>Si no has solicitado recuperar tu contraseña, por favor ignora este mensaje.</p>
                        <p>¡Gracias por usar <span class="highlight-juris">JURIS </span><span class="highlight-search">SEARCH</span>!</p>
                    </div>
                </body>
            </html>
            `;
    
            const mailOptions = {
                from: process.env.EMAIL_JURIS1,
                to: model.EMAIL,
                subject: 'Recuperar contraseña',
                html
            };
    
            await this.transporter2.sendMail(mailOptions);
            return { MESSAGE: 'Correo enviado correctamente, revisa tu bandeja de entrada.', STATUS: true };
        } catch (error) {
            return { MESSAGE: 'Error al enviar la solicitud', STATUS: false };        
        }
    }

    async sendCCFIRMAOportunidaes(name: string, email: string, message: string, file: any): Promise<Result> {
        try {
            const html = `
            <!DOCTYPE html>
            <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>CCFIRMA</title>
                </head>
                <body>
                    <div>
                        <h1>Trabaja con nosotros</h1>
                        <p>Nombre: ${name}</p>
                        <p>Correo: ${email}</p>
                        <p>Mensaje: ${message}</p>
                        <p>Fecha: ${new Date().toLocaleDateString()}</p>
                        <p>Carta de Motivación: No Ingresado</p>
                    </div>
                </body>
            </html>`

            const mailOptions = {
                from: process.env.EMAIL_JURIS1,
                to: 'kojeda@ccfirma.com',
                subject: 'Trabaja con nosotros',
                html,
                attachments: [
                    {
                        filename: file.originalname,
                        content: fs.createReadStream(file.path)
                    }
                ],
            };

            await this.transporter.sendMail(mailOptions);
            fs.unlinkSync(file.path);
            return { MESSAGE: 'Correo enviado correctamente, gracias por contactarnos.', STATUS: true };
        } catch (error) {
            fs.unlinkSync(file.path);
            return { MESSAGE: 'Error al enviar la solicitud', STATUS: false };
        }
    }
}
