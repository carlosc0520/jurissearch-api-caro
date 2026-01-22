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
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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

  async emailNewNoticias(usuarios, TITULO, ID, ENLACE, PATH) {
    const validarEmail = (email) => {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(email);
    };

    try {
      const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Newsletter JurisSearch</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                
                <!-- Header con degradado -->
                <tr>
                  <td style="background: linear-gradient(135deg, #e71fb3 0%, #1864ff 100%); background-color: #1864ff; padding: 30px 20px; text-align: center;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                            📰 ¡Novedades en JurisSearch!
                          </h1>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Contenido principal -->
                <tr>
                  <td style="padding: 35px 30px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <!-- Imagen destacada -->
                      <tr>
                        <td align="center" style="padding-bottom: 25px;">
                          <a href="${ENLACE}" style="text-decoration: none; display: block;">
                            <img src="${PATH}" alt="Newsletter ${TITULO}" style="width: 100%; max-width: 540px; height: auto; border-radius: 10px; display: block; border: 0;" />
                          </a>
                        </td>
                      </tr>
                      
                      <!-- Texto descriptivo -->
                      <tr>
                        <td style="padding-bottom: 30px;">
                          <p style="margin: 0; font-size: 17px; color: #333333; line-height: 1.7; text-align: center;">
                            Explora el último boletín para descubrir las <strong>novedades y actualizaciones legales</strong> más importantes. 
                            Mantente informado con contenido de calidad.
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Botón CTA -->
                      <tr>
                        <td align="center" style="padding-bottom: 10px;">
                          <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="center" style="border-radius: 6px; background: linear-gradient(135deg, #e71fb3 0%, #1864ff 100%); background-color: #1864ff;">
                                <a href="https://side.jurissearch.com/publicaciones?search=${TITULO}" 
                                   style="display: inline-block; padding: 14px 35px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; letter-spacing: 0.3px;">
                                  📖 Leer el boletín completo
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Separador -->
                <tr>
                  <td style="padding: 0 30px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="border-bottom: 1px solid #e0e0e0;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="padding-bottom: 12px;">
                          <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.5;">
                            ¿Tienes preguntas o necesitas asistencia?
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <a href="https://jurissearch.com" style="color: #1864ff; text-decoration: none; font-weight: 600; font-size: 14px;">
                            🔗 Visita jurissearch.com
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-top: 15px;">
                          <p style="margin: 0; font-size: 12px; color: #999999;">
                            © ${new Date().getFullYear()} JurisSearch. Todos los derechos reservados.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

      const promesas = usuarios
        .filter((usuario) => validarEmail(usuario.EMAIL))
        .map((usuario) => {
          const mailOptions = {
            from: '"JurisSearch Informativo 📰" <jsearch@ccfirma.com>',
            to: usuario.EMAIL,
            subject: `📰 Newsletter: ${TITULO}`,
            html,
          };
          return this.transporter3.sendMail(mailOptions);
        });

      await Promise.allSettled(promesas);

      return { MESSAGE: 'Correos enviados correctamente', STATUS: true };
    } catch (error) {
      return { MESSAGE: 'Error al enviar los correos', STATUS: false, ERROR: error.message };
    }
  }
}
