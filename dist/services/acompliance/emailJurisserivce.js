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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailJurisService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const nodemailer = __importStar(require("nodemailer"));
const token_service_1 = require("../User/token.service");
const fs = __importStar(require("fs"));
const configMappers_1 = __importDefault(require("../configMappers"));
let EmailJurisService = class EmailJurisService {
    constructor(tokenService, connection) {
        this.tokenService = tokenService;
        this.connection = connection;
        this.ENTORNO = process.env[process.env.ENVIROMENT];
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
    async sendEmail(model) {
        try {
            const token = await this.tokenService.generateTokenSolicitud(model);
            const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a JURISSEARCH</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', Arial, sans-serif; background-color: #F9FAFB;">
    
    <!-- Contenedor Principal -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                
                <!-- Card Principal -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06); overflow: hidden;">
                    
                    <!-- Header con Gradiente -->
                    <tr>
                        <td style="background:linear-gradient(to right, #F9FAFB, #F3F4F6);; padding: 40px 32px; text-align: center;">
                            
                            <!-- Icono decorativo -->
                            <div style="margin-bottom: 16px;">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
                                    <path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <circle cx="12" cy="12" r="9" stroke="white" stroke-width="2"/>
                                </svg>
                            </div>
                            
                            <h1 style="margin: 0; color: #1F2937; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                ¡Bienvenido a 
                                <span style="color: #e81eb2;">JURIS</span><span style="color: #1764ff;">SEARCH</span>!
                            </h1>
                            <p style="margin: 12px 0 0 0; color: #6B7280; font-size: 15px; font-weight: 400;">
                                Tu cuenta ha sido activada exitosamente
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Contenido Principal -->
                    <tr>
                        <td style="padding: 40px 32px;">
                            
                            <p style="margin: 0 0 24px 0; color: #1F2937; font-size: 15px; line-height: 1.6; font-weight: 500;">
                                ¡Hola! 👋
                            </p>
                            
                            <p style="margin: 0 0 24px 0; color: #6B7280; font-size: 15px; line-height: 1.7;">
                                Estamos encantados de que formes parte de nuestra comunidad. Tu cuenta ha sido configurada y está lista para usar.
                            </p>
                            
                            <p style="margin: 0 0 32px 0; color: #6B7280; font-size: 15px; line-height: 1.7;">
                                Haz clic en el botón de abajo para acceder automáticamente al sistema:
                            </p>
                            
                            <!-- Botón Principal -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 8px 0 32px 0;">
                                        <a href="https://jurissearch.com/auth/autoUser/${token}" 
                                           style="display: inline-block; 
                                                  background: linear-gradient(to right, #8B5CF6, #7C3AED); 
                                                  color: #FFFFFF; 
                                                  padding: 14px 40px; 
                                                  border-radius: 10px; 
                                                  text-decoration: none; 
                                                  font-weight: 600; 
                                                  font-size: 15px;
                                                  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
                                                  transition: all 0.3s ease;">
                                            Acceder al Sistema
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Box de Información -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(to right, #F9FAFB, #F3F4F6); border-left: 4px solid #8B5CF6; border-radius: 8px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 20px 24px;">
                                        <p style="margin: 0 0 8px 0; color: #1F2937; font-size: 14px; font-weight: 600;">
                                            💡 Consejo útil
                                        </p>
                                        <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                                            Guarda este correo para futuros accesos rápidos al sistema. El enlace permanecerá activo.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Características -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 16px 0; border-top: 1px solid #E5E7EB;">
                                        <p style="margin: 0 0 16px 0; color: #1F2937; font-size: 14px; font-weight: 600;">
                                            ¿Qué puedes hacer ahora?
                                        </p>
                                        
                                        <!-- Característica 1 -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                                            <tr>
                                                <td width="32" valign="top" style="padding-top: 2px;">
                                                    <table cellpadding="0" cellspacing="0" style="width: 24px; height: 24px; background: linear-gradient(135deg, #8B5CF6, #7C3AED); border-radius: 6px;">
                                                        <tr>
                                                            <td align="center" valign="middle" style="color: white; font-size: 16px; font-weight: 700; line-height: 24px;">
                                                                ✓
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                                <td style="padding-left: 12px;">
                                                    <p style="margin: 0; color: #4B5563; font-size: 14px; line-height: 1.5;">
                                                        <strong style="color: #1F2937;">Buscar jurisprudencia</strong> de forma rápida y precisa
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Característica 2 -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                                            <tr>
                                                <td width="32" valign="top" style="padding-top: 2px;">
                                                    <table cellpadding="0" cellspacing="0" style="width: 24px; height: 24px; background: linear-gradient(135deg, #8B5CF6, #7C3AED); border-radius: 6px;">
                                                        <tr>
                                                            <td align="center" valign="middle" style="color: white; font-size: 16px; font-weight: 700; line-height: 24px;">
                                                                ✓
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                                <td style="padding-left: 12px;">
                                                    <p style="margin: 0; color: #4B5563; font-size: 14px; line-height: 1.5;">
                                                        <strong style="color: #1F2937;">Guardar favoritos</strong> para consultas futuras
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Característica 3 -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="32" valign="top" style="padding-top: 2px;">
                                                    <table cellpadding="0" cellspacing="0" style="width: 24px; height: 24px; background: linear-gradient(135deg, #8B5CF6, #7C3AED); border-radius: 6px;">
                                                        <tr>
                                                            <td align="center" valign="middle" style="color: white; font-size: 16px; font-weight: 700; line-height: 24px;">
                                                                ✓
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                                <td style="padding-left: 12px;">
                                                    <p style="margin: 0; color: #4B5563; font-size: 14px; line-height: 1.5;">
                                                        <strong style="color: #1F2937;">Acceder a boletines</strong> actualizados constantemente
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Soporte -->
                            <p style="margin: 0; color: #6B7280; font-size: 14px; line-height: 1.6;">
                                Si tienes alguna pregunta o necesitas asistencia, no dudes en 
                                <a href="mailto:jurissearch@ccfirma.com" style="color: #8B5CF6; text-decoration: none; font-weight: 600;">contactarnos</a>.
                            </p>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px; background: linear-gradient(to bottom, #F9FAFB, #F3F4F6); border-top: 1px solid #E5E7EB; text-align: center;">
                            
                            <p style="margin: 0 0 12px 0; color: #1F2937; font-size: 16px; font-weight: 600;">
                                <span style="color: #e81eb2;">JURIS</span><span style="color: #1764ff;">SEARCH</span>
                            </p>
                            
                            <p style="margin: 0 0 16px 0; color: #9CA3AF; font-size: 13px; line-height: 1.6;">
                                Tu aliado en investigación jurídica
                            </p>
                            
                            <div style="margin-bottom: 16px;">
                                <a href="https://jurissearch.com" style="color: #6B7280; text-decoration: none; font-size: 13px; margin: 0 8px;">Inicio</a>
                                <span style="color: #D1D5DB;">•</span>
                                <a href="https://jurissearch.com/contacto" style="color: #6B7280; text-decoration: none; font-size: 13px; margin: 0 8px;">Contacto</a>
                                <span style="color: #D1D5DB;">•</span>
                                <a href="https://jurissearch.com/politicas&privacidad" style="color: #6B7280; text-decoration: none; font-size: 13px; margin: 0 8px;">Políticas</a>
                            </div>
                            
                            <p style="margin: 0; color: #9CA3AF; font-size: 12px; line-height: 1.5;">
                                © 2026 JurisSearch. Todos los derechos reservados.<br>
                                Este es un correo automático, por favor no respondas a este mensaje.
                            </p>
                            
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
`;
            const mailOptions = {
                from: "JURIS SEARCH ✔✨",
                to: model.CORREO,
                subject: 'Bienvenido a JURISSEARCH',
                html
            };
            await this.transporter2.sendMail(mailOptions);
            return { MESSAGE: 'Solicitud enviada correctamente, revisa tu correo y activa tu cuenta.', STATUS: true };
        }
        catch (error) {
            return { MESSAGE: 'Error al enviar la solicitud', STATUS: false };
        }
    }
    async sendEmailUser(user) {
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
                        <p>Estamos encantados de que uses nuestro sistema. A continuación, te adjuntamos tus datos de acceso:</p>
                        <p>Usuario: <strong>${user.EMAIL}</strong></p>
                        <p>Contraseña: <strong>${user.PASSWORD}</strong></p>
                        <p>¡Gracias por usar <span class="highlight-juris">JURIS </span><span class="highlight-search">SEARCH</span>!</p>
                    </div>
                </body>
            </html>
            `;
            const mailOptions = {
                from: "JURIS SEARCH ✔✨",
                to: user.EMAIL,
                subject: 'Bienvenido a JURISSEARCH',
                html
            };
            await this.transporter2.sendMail(mailOptions);
            return { MESSAGE: 'Correo enviado correctamente, revisa tu correo y activa tu cuenta.', STATUS: true };
        }
        catch (error) {
            return { MESSAGE: 'Error al enviar la solicitud', STATUS: false };
        }
    }
    async sendEmailContacto(model) {
        try {
            const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicitud de Contacto - JURISSEARCH</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Segoe UI Emoji', 'Segoe UI Symbol', Arial, sans-serif; background-color: #F9FAFB;">
    
    <!-- Contenedor Principal -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
        <tr>
            <td align="center">
                
                <!-- Card Principal -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06); overflow: hidden;">
                    
                    <!-- Header con Gradiente -->
                    <tr>
                        <td style="background: linear-gradient(to right, #F9FAFB, #F3F4F6); padding: 40px 32px; text-align: center;">
                            
                            <!-- Icono decorativo -->
                            <div style="margin-bottom: 16px;">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
                                    <path d="M3 8L10.89 13.26C11.21 13.48 11.59 13.59 12 13.59C12.41 13.59 12.79 13.48 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            
                            <h1 style="margin: 0; color: #1F2937; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                                📬 Nueva Solicitud de Contacto
                            </h1>
                            <p style="margin: 12px 0 0 0; color: #6B7280; font-size: 14px; font-weight: 400;">
                                Recibido el ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Contenido Principal -->
                    <tr>
                        <td style="padding: 40px 32px;">
                            
                            <p style="margin: 0 0 24px 0; color: #1F2937; font-size: 15px; line-height: 1.6; font-weight: 600;">
                                Has recibido una nueva solicitud de contacto a través del formulario web:
                            </p>
                            
                            <!-- Box de Información del Contacto -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(to right, #F9FAFB, #F3F4F6); border-left: 4px solid #8B5CF6; border-radius: 10px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <p style="margin: 0 0 16px 0; color: #1F2937; font-size: 15px; font-weight: 600;">
                                            📋 Información del Remitente
                                        </p>
                                        
                                        <!-- Datos del contacto -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="color: #6B7280; font-size: 13px; font-weight: 600; width: 80px; vertical-align: top;">
                                                                Nombre:
                                                            </td>
                                                            <td style="color: #1F2937; font-size: 14px; padding-left: 12px;">
                                                                ${model.NOMBRES}
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="color: #6B7280; font-size: 13px; font-weight: 600; width: 80px; vertical-align: top;">
                                                                Correo:
                                                            </td>
                                                            <td style="color: #1F2937; font-size: 14px; padding-left: 12px;">
                                                                <a href="mailto:${model.CORREO}" style="color: #8B5CF6; text-decoration: none; font-weight: 500;">
                                                                    ${model.CORREO}
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="color: #6B7280; font-size: 13px; font-weight: 600; width: 80px; vertical-align: top;">
                                                                Asunto:
                                                            </td>
                                                            <td style="color: #1F2937; font-size: 14px; padding-left: 12px; font-weight: 600;">
                                                                ${model.ASUNTO}
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Mensaje -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 12px 0; color: #1F2937; font-size: 15px; font-weight: 600;">
                                            💬 Mensaje:
                                        </p>
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border: 1.5px solid #E5E7EB; border-radius: 10px;">
                                            <tr>
                                                <td style="padding: 20px;">
                                                    <p style="margin: 0; color: #4B5563; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">
${model.MENSAJE}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Box de Acción -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED); border-radius: 10px; margin-bottom: 16px;">
                                <tr>
                                    <td style="padding: 20px 24px; text-align: center;">
                                        <p style="margin: 0 0 12px 0; color: #FFFFFF; font-size: 14px; font-weight: 600;">
                                            ⚡ Acción Recomendada
                                        </p>
                                        <p style="margin: 0; color: rgba(255, 255, 255, 0.9); font-size: 13px; line-height: 1.5;">
                                            Responde a esta solicitud lo antes posible para mantener un excelente servicio al cliente.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Botón de Respuesta -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 8px 0;">
                                        <a href="mailto:${model.CORREO}?subject=Re: ${encodeURIComponent(model.ASUNTO)}" 
                                           style="display: inline-block; 
                                                  background: linear-gradient(to right, #8B5CF6, #7C3AED); 
                                                  color: #FFFFFF; 
                                                  padding: 12px 32px; 
                                                  border-radius: 10px; 
                                                  text-decoration: none; 
                                                  font-weight: 600; 
                                                  font-size: 14px;
                                                  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                                            📧 Responder Ahora
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px; background: linear-gradient(to bottom, #F9FAFB, #F3F4F6); border-top: 1px solid #E5E7EB; text-align: center;">
                            
                            <p style="margin: 0 0 12px 0; color: #1F2937; font-size: 16px; font-weight: 600;">
                                <span style="color: #e81eb2;">JURIS</span><span style="color: #1764ff;">SEARCH</span>
                            </p>
                            
                            <p style="margin: 0 0 16px 0; color: #9CA3AF; font-size: 13px; line-height: 1.6;">
                                Sistema de Gestión de Contactos
                            </p>
                            
                            <p style="margin: 0; color: #9CA3AF; font-size: 12px; line-height: 1.5;">
                                © 2026 JurisSearch. Todos los derechos reservados.<br>
                                Este es un correo automático generado por el sistema.
                            </p>
                            
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
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
        }
        catch (error) {
            return { MESSAGE: 'Error al enviar la solicitud', STATUS: false };
        }
    }
    async ccfirmaSendEmail(model) {
        var _a;
        let origen = '';
        switch (model.IDENTIFICADOR) {
            case "1":
                origen = "Caro & Asociados";
                break;
            case "6":
                origen = "Caro & Asociados";
                break;
            case "2":
                origen = "Juris Search";
                break;
            case "3":
                origen = "AIC COMPLIANCE";
                break;
            case "4":
                origen = "CEDPE";
                break;
            case "5":
                origen = "Origen desconocido";
                break;
            default:
                origen = "Origen desconocido";
                break;
        }
        let queryAsync = configMappers_1.default.CCFIRMA.SOLICITUDES.CRUD;
        queryAsync += ` @p_cData = ${model ? `'${JSON.stringify(Object.assign(Object.assign({}, model), { ORIGEN: origen, MOTIVO: model.MOTIVO }))}'` : null},`;
        queryAsync += ` @p_cUser = '${origen}',`;
        queryAsync += ` @p_nTipo = ${1},`;
        queryAsync += ` @p_nId = ${null}`;
        try {
            const result = await this.connection.query(queryAsync);
            const isSuccess = ((_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a.RESULT) > 0;
            if (!isSuccess) {
                return { MESSAGE: 'Ocurrió un error al intentar enviar la solicitud', STATUS: false };
            }
            let contenido = '';
            if (model.IDENTIFICADOR == "1"
                || model.IDENTIFICADOR == "6") {
                contenido += `<p>Nombre: ${(model === null || model === void 0 ? void 0 : model.NOMBRES) || ""}</p>`;
                contenido += `<p>Apellido: ${(model === null || model === void 0 ? void 0 : model.APELLIDOP) || ""}</p>`;
                contenido += `<p>Correo: ${(model === null || model === void 0 ? void 0 : model.CORREO) || ""}</p>`;
                contenido += `<p>Pais: ${(model === null || model === void 0 ? void 0 : model.PAIS) || ""}</p>`;
            }
            if (model.IDENTIFICADOR == "2") {
                contenido = `Gracias por contactarnos, a continuación te adjuntamos un documento con la guía práctica para la formalización de tu negocio.`;
            }
            if (model.IDENTIFICADOR == "3" || model.IDENTIFICADOR == "4") {
                contenido += `<p>Nombres: ${(model === null || model === void 0 ? void 0 : model.NOMBRES) || ""}</p>`;
                contenido += `<p>Correo: ${(model === null || model === void 0 ? void 0 : model.CORREO) || ""}</p>`;
                contenido += `<p>Teléfono: ${(model === null || model === void 0 ? void 0 : model.TELEFONO) || ""}</p>`;
                contenido += `<p>Provincia: ${(model === null || model === void 0 ? void 0 : model.PROVINCIA) || ""}</p>`;
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
                            <p>Motivo: ${(model === null || model === void 0 ? void 0 : model.MOTIVO) || ""}</p>
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
            if (model.IDENTIFICADOR == "6") {
                return { MESSAGE: 'Solicitud enviada correctamente, gracias por contactarnos.', STATUS: true, FILE: null };
            }
            return { MESSAGE: 'Solicitud enviada correctamente, gracias por contactarnos.', STATUS: true, FILE: base64Data };
        }
        catch (error) {
            return { MESSAGE: 'Error al enviar la solicitud', STATUS: false };
        }
    }
    async recoveryPassword(model) {
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
                        <p><a href="${this.ENTORNO}/auth/recovery/${token}">Cambiar contraseña</a></p>
                        <p>Si no has solicitado recuperar tu contraseña, por favor ignora este mensaje.</p>
                        <p>¡Gracias por usar <span class="highlight-juris">JURIS </span><span class="highlight-search">SEARCH</span>!</p>
                    </div>
                </body>
            </html>
            `;
            const mailOptions = {
                from: "JURIS SEARCH ✔✨",
                to: model.EMAIL,
                subject: 'Recuperar contraseña',
                html
            };
            await this.transporter2.sendMail(mailOptions);
            return { MESSAGE: 'Correo enviado correctamente, revisa tu bandeja de entrada.', STATUS: true };
        }
        catch (error) {
            return { MESSAGE: 'Error al enviar la solicitud', STATUS: false };
        }
    }
    async sendCCFIRMAOportunidaes(name, email, message, file) {
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
            </html>`;
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
        }
        catch (error) {
            fs.unlinkSync(file.path);
            return { MESSAGE: 'Error al enviar la solicitud', STATUS: false };
        }
    }
};
exports.EmailJurisService = EmailJurisService;
exports.EmailJurisService = EmailJurisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [token_service_1.TokenService,
        typeorm_1.DataSource])
], EmailJurisService);
//# sourceMappingURL=emailJurisserivce.js.map