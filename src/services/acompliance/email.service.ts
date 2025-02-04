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
        pass: process.env.EMAIL_ACOMPLIANCE_PASSWORD1,
      },
    });

    this.transporter2 = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ACOMPLIANCE2,
        pass: process.env.EMAIL_ACOMPLIANCE_PASSWORD2,
      },
    });

    this.transporter3 = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_JURISEARCH,
        pass: process.env.EMAIL_JURISEARCH_PASSWORD1,
      },
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
        html,
      };

      Promise.all([
        this.transporter.sendMail(mailOptions),
        this.transporter2.sendMail(mailOptions),
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

      await this.transporter3.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Error al enviar PDF a ${destinatario}`);
    }
  }

  async emailBoletines(usuarios, entidad) {
    const validarEmail = (email) => {
      const regex = /^[\w.%+-]+@gmail\.com$/;
      return regex.test(email);
    };
  
    try {
      const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0056b3; color: #ffffff; padding: 16px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">¡Novedades en JurisSearch!</h1>
        </div>
    
        <div style="padding: 20px; text-align: center;">
          <a href="https://jurissearch.com/${entidad.BOLETIN}" style="text-decoration: none; color: #000;">
            <img src="https://jurissearch.com/${entidad.IMAGEN}" alt="Boletín" style="width: 100%; max-width: 560px; height: auto; border-radius: 8px; margin-bottom: 16px;" />
          </a>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Explora el último boletín para descubrir las novedades y actualizaciones legales más importantes. 
            Haz clic en la imagen para obtener más información.
          </p>
          <a href="https://jurissearch.com/${entidad.BOLETIN}" style="display: inline-block; background-color: #0056b3; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px; font-weight: bold;">
            Leer el boletín
          </a>
        </div>
    
        <div style="background-color: #f1f1f1; padding: 16px; text-align: center; font-size: 14px; color: #666;">
          <p style="margin: 0;">¿Tienes preguntas? Visítanos en <a href="https://jurissearch.com" style="color: #0056b3; text-decoration: none;">jurissearch.com</a></p>
        </div>
      </div>
    `;
    
      // Generar las promesas para enviar correos
      const promesas = usuarios
        .filter((usuario) => validarEmail(usuario.EMAIL)) // Filtrar solo correos Gmail válidos
        .map((usuario) => {
          const mailOptions = {
            from: 'JURISSEARCH INFORMATIVO',
            to: usuario.EMAIL,
            subject: entidad.TITLE,
            html,
          };
          return this.transporter3.sendMail(mailOptions);
        });
  
      // Ejecutar todas las promesas
      await Promise.allSettled(promesas);
  
      return { MESSAGE: 'Correos enviados correctamente', STATUS: true };
    } catch (error) {
      return { MESSAGE: 'Error al enviar los correos', STATUS: false, ERROR: error.message };
    }
  }
}
