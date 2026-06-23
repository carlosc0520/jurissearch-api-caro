import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Request,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../services/User/user.service';
import { TokenService } from '../services/User/token.service';
import { NoticiaService } from 'src/services/mantenimiento/noticia.service';
import { NoticiaModel } from 'src/models/Admin/noticia.model';
import { DataTable } from 'src/models/DataTable.model.';
import { S3Service } from 'src/services/Aws/aws.service';
import { HostingerService } from 'src/services/Aws/hostinger.service';
import { PreguntasService } from 'src/services/mantenimiento/preguntas.service';
import { PreguntaModel } from 'src/models/Admin/preguntas.model';
import { EmailJurisService } from 'src/services/acompliance/emailJurisserivce';
import { SolicitudModel } from 'src/models/public/Solicitud.model';
import { Result } from 'src/models/result.model';
import { diskStorage } from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EntriesService } from 'src/services/Admin/entries.service';
import { degrees, PDFDocument, rgb } from 'pdf-lib';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';

class User {
  ID: number;
  USER: string;
  IDROLE: number;
  EMAIL: string;
  PASSWORD: string;
  NOMBRES: string;
  APELLIDO: string;
  APATERNO: string;
  AMATERNO: string;
  TELEFONO: string;
  FNACIMIENTO: Date;
  EBLOQUEO: boolean;
  FVCMNTO: Date;
  INTENTOS: number;
  CARGO: string;
  DIRECCION: string;
  PROFESION: string;
  RESTRICIONES: string;
  UCRCN: string;
  FCRCN: Date;
  FEDCN: Date;
  CDESTDO: string;
  TOKEN: string;
  REFRESH_TOKEN?: string;
  PLAN?: string;
  DATOS?: string;
  STATUS?: number;
  MESSAGE?: string;
  BANDERA?: boolean = false;
  RTAFTO?: string;
  IDPLN?: number;
  EXPIRES_IN?: number;
}

@Controller('login')
export class LoginController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly noticiaService: NoticiaService,
    private readonly preguntaService: PreguntasService,
    private readonly emailJurisService: EmailJurisService,
    private readonly s3Service: S3Service,
    private readonly entriesService: EntriesService,
    private readonly hostingerService: HostingerService,
  ) { }

  @Post('autenticar')
  async autenticarUsuario(@Body() entidad: User): Promise<User> {
    // Validar campos requeridos
    if (!entidad || !entidad.USER || !entidad.PASSWORD) {
      throw new BadRequestException({
        MESSAGE: 'Credenciales inválidas',
        STATUS: false,
      });
    }

    // Sanitizar inputs
    const userSanitized = entidad.USER?.trim();
    const passwordSanitized = entidad.PASSWORD?.trim();

    // Validar longitud mínima
    if (userSanitized.length < 3 || passwordSanitized.length < 6) {
      throw new BadRequestException({
        MESSAGE: 'Credenciales inválidas',
        STATUS: false,
      });
    }

    // Validar formato de usuario (alfanumérico, @, ., -, _)
    const userRegex = /^[a-zA-Z0-9@.\-_]+$/;
    if (!userRegex.test(userSanitized)) {
      throw new BadRequestException({
        MESSAGE: 'Formato de usuario inválido',
        STATUS: false,
      });
    }

    entidad.USER = userSanitized;
    entidad.PASSWORD = passwordSanitized;

    const usuario: User = await this.userService.loguearUsuario(entidad);

    // Mensaje genérico para no revelar si el usuario existe o no
    if (!usuario) {
      throw new BadRequestException({
        MESSAGE: 'Credenciales inválidas',
        STATUS: false,
      });
    }

    // Verificar si la cuenta está bloqueada
    if (usuario?.EBLOQUEO === true) {
      throw new BadRequestException({
        MESSAGE: 'Cuenta bloqueada. Contacte al administrador',
        STATUS: false,
      });
    }

    if (usuario?.STATUS === 0) {
      throw new BadRequestException({
        MESSAGE: usuario.MESSAGE || 'Cuenta inactiva',
        STATUS: false,
      });
    }

    // Validar intentos excesivos
    if (usuario.INTENTOS && usuario.INTENTOS >= 5) {
      throw new BadRequestException({
        MESSAGE: 'Cuenta bloqueada por múltiples intentos fallidos',
        STATUS: false,
      });
    }

    // Validar contraseña - mensaje genérico
    if (usuario.PASSWORD !== entidad.PASSWORD) {
      throw new BadRequestException({
        MESSAGE: 'Credenciales inválidas',
        STATUS: false,
      });
    }

    // Validar que el usuario tenga un rol asignado
    if (usuario.IDROLE == null || usuario.IDROLE < 0) {
      throw new BadRequestException({
        MESSAGE: 'Usuario sin permisos asignados',
        STATUS: false,
      });
    }


    // Generar access token y refresh token
    const tokens = await this.tokenService.generateTokens(usuario, entidad.BANDERA);

    if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
      throw new BadRequestException({
        MESSAGE: 'Error al generar sesión',
        STATUS: false,
      });
    }

    usuario.TOKEN = tokens.accessToken;
    usuario.REFRESH_TOKEN = tokens.refreshToken;
    usuario.EXPIRES_IN = tokens.expiresIn;
    usuario.RTAFTO = process.env.DOMINIO + usuario.RTAFTO;

    // Limpiar datos sensibles antes de retornar
    delete usuario.PASSWORD;

    return usuario;
  }

  @Get('logout')
  async removeSession(@Query('token') token: string): Promise<boolean> {
    // Validar que el token exista
    if (!token || token.trim().length === 0) {
      throw new BadRequestException({
        MESSAGE: 'Token inválido',
        STATUS: false,
      });
    }

    // Validar formato básico del token
    if (token.length < 20 || token.length > 1000) {
      throw new BadRequestException({
        MESSAGE: 'Token inválido',
        STATUS: false,
      });
    }

    await this.tokenService.removeSession(token);
    return true;
  }

  @Get('preguntas')
  async listaPreguntas(@Query() entidad: DataTable): Promise<PreguntaModel[]> {
    entidad.CESTDO = 'A';
    const preguntas = await this.preguntaService.list(entidad);
    return preguntas;
  }

  @Get('refreshToken')
  async refreshToken(@Query('token') token: string): Promise<string> {
    // Validar que el token exista
    if (!token || token.trim().length === 0) {
      throw new BadRequestException({
        MESSAGE: 'Token inválido',
        STATUS: false,
      });
    }

    // Validar formato básico del token
    if (token.length < 20 || token.length > 1000) {
      throw new BadRequestException({
        MESSAGE: 'Token inválido',
        STATUS: false,
      });
    }

    const newToken = await this.tokenService.refreshToken(token);

    if (!newToken) {
      throw new BadRequestException({
        MESSAGE: 'No se pudo renovar el token',
        STATUS: false,
      });
    }

    return newToken;
  }

  // Nuevo endpoint para refresh token
  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }): Promise<any> {
    // Validar que el refresh token exista
    if (!body || !body.refreshToken || body.refreshToken.trim().length === 0) {
      throw new BadRequestException({
        MESSAGE: 'Refresh token inválido',
        STATUS: false,
      });
    }

    // Validar formato básico del refresh token
    const refreshToken = body.refreshToken.trim();
    if (refreshToken.length < 20 || refreshToken.length > 2000) {
      throw new BadRequestException({
        MESSAGE: 'Refresh token inválido',
        STATUS: false,
      });
    }

    // Validar formato JWT
    const jwtRegex = /^[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+$/;
    if (!jwtRegex.test(refreshToken)) {
      throw new BadRequestException({
        MESSAGE: 'Formato de refresh token inválido',
        STATUS: false,
      });
    }

    try {
      const tokens = await this.tokenService.refreshAccessToken(refreshToken);

      if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
        throw new BadRequestException({
          MESSAGE: 'No se pudo renovar el token',
          STATUS: false,
        });
      }

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        STATUS: true,
        MESSAGE: 'Token renovado exitosamente',
      };
    } catch (error) {
      throw new BadRequestException({
        MESSAGE: error.message || 'No se pudo renovar el token',
        STATUS: false,
      });
    }
  }

  @Get('validateToken')
  async validateToken(@Query('token') token: string): Promise<boolean> {
    return this.tokenService.validateTokenSolicitud(token);
  }

  @Get('validateToken-recovery')
  async validateTokenSolicitudTime(
    @Query('token') token: string,
  ): Promise<boolean> {
    return this.tokenService.validateTokenSolicitudTime(token);
  }

  @Post('generateUser')
  async generateUser(@Body() entidad: User): Promise<Result> {
    // Validar campos requeridos
    if (!entidad || !entidad.TOKEN || !entidad.EMAIL || !entidad.PASSWORD) {
      throw new BadRequestException({
        MESSAGE: 'Datos incompletos',
        STATUS: false,
      });
    }

    // Sanitizar y validar email
    const emailSanitized = entidad.EMAIL?.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailSanitized)) {
      throw new BadRequestException({
        MESSAGE: 'Formato de email inválido',
        STATUS: false,
      });
    }

    // Validar longitud de contraseña
    if (!entidad.PASSWORD || entidad.PASSWORD.length < 8) {
      throw new BadRequestException({
        MESSAGE: 'La contraseña debe tener al menos 8 caracteres',
        STATUS: false,
      });
    }

    // Validar token
    const result = await this.tokenService.validateTokenSolicitud(
      entidad.TOKEN,
    );

    if (!result) {
      throw new BadRequestException({
        MESSAGE: 'Token inválido o expirado',
        STATUS: false,
      });
    }

    entidad.EMAIL = emailSanitized;
    entidad.IDROLE = 2;
    entidad.USER = 'AUTOLOGIN';
    entidad.PLAN = '1';

    return await this.userService.createUser(entidad);
  }

  @Post('generateUserFind')
  async generateUserFind(@Body() entidad: User): Promise<Result> {
    entidad.IDROLE = 2;
    entidad.USER = entidad.EMAIL.split('@')[0];
    entidad.PLAN = '1';
    return await this.userService.createUser(entidad);
  }

  @Post('solicitudUser')
  async sendEmail(@Body() entidad: SolicitudModel): Promise<Result> {
    const result = await this.emailJurisService.sendEmail(entidad);
    return result;
  }

  @Post('ccfirma-solicitud')
  async ccfirmaSendEmail(@Body() entidad: SolicitudModel): Promise<Result> {
    const result = await this.emailJurisService.ccfirmaSendEmail(entidad);
    return result;
  }



  @Post('recovery')
  async recoveryPassword(@Body() entidad: User): Promise<Result> {
    // Validar que se proporcione email
    if (!entidad || !entidad.EMAIL) {
      throw new BadRequestException({
        MESSAGE: 'Email requerido',
        STATUS: false,
      });
    }

    // Sanitizar email
    const emailSanitized = entidad.EMAIL?.trim().toLowerCase();

    // Validar formato de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailSanitized)) {
      throw new BadRequestException({
        MESSAGE: 'Formato de email inválido',
        STATUS: false,
      });
    }

    // Validar longitud del email
    if (emailSanitized.length > 100) {
      throw new BadRequestException({
        MESSAGE: 'Email demasiado largo',
        STATUS: false,
      });
    }

    entidad.EMAIL = emailSanitized;

    const usuario: User = await this.userService.obtenerUsuario(entidad);

    // Mensaje genérico para evitar enumeración de usuarios
    if (!usuario) {
      // Retornar éxito aunque no exista para evitar enumeración
      return {
        MESSAGE: 'Si el email existe, recibirá instrucciones de recuperación',
        STATUS: true,
      };
    }

    if (usuario?.STATUS === 0 || usuario?.EBLOQUEO === true) {
      // Retornar mensaje genérico
      return {
        MESSAGE: 'Si el email existe, recibirá instrucciones de recuperación',
        STATUS: true,
      };
    }

    const result = await this.emailJurisService.recoveryPassword(entidad);
    return result;
  }

  @Post('recoveryUser')
  async recoveryUser(@Body() entidad: User): Promise<Result> {
    try {
      const VALDIAR_TOKEN = this.tokenService.validateTokenSolicitudTime(
        entidad.TOKEN,
      );
      if (VALDIAR_TOKEN.STATUS === false) {
        throw new BadRequestException({
          MESSAGE: VALDIAR_TOKEN.MESSAGE,
          STATUS: false,
        });
      }

      const entidadNuevo = new User();
      entidadNuevo.EMAIL = entidad.EMAIL;
      entidadNuevo.PASSWORD = entidad.PASSWORD;

      const result = await this.userService.updatePassword(entidadNuevo);
      return result;
    } catch (error) {
      return { MESSAGE: 'Token invalido', STATUS: false };
    }
  }

  @Post('ccfirma_upload')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(png|jpg|jpeg|pdf)$/)) {
          cb(null, true);
        } else {
          cb(
            new Error('Solo se permiten archivos PNG, JPG, JPEG, o PDF'),
            false,
          );
        }
      },
    }),
  )
  async uploadMultipleFilesOportunidades(
    @Request() req,
    @Body() body: any,
    @UploadedFiles() files,
  ): Promise<any> {
    const { name: name, email: email, message: message } = body;
    const [file1] = files;
    return await this.emailJurisService.sendCCFIRMAOportunidaes(
      name,
      email,
      message,
      file1,
    );
  }

  @Get('download-file')
  async downloadFile(
    @Query('ID') ID: number,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const data = await this.entriesService.get(ID);
      let fecha = new Date('2024-11-08');
      let modificar = false;

      if (data.FCRCN > fecha || data.FLGDOC === '1') {
        modificar = true;
      }

      const fileBuffer = data.ENTRIEFILE?.startsWith('/uploads/')
        ? await this.hostingerService.downloadDocumento(data.ENTRIEFILE)
        : await this.s3Service.downloadFile(data.ENTRIEFILE);

      const pathcaroa = path.join(
        __dirname,
        '..',
        'files/files',
        'caroa.png',
      );
      const pathccfirma = path.join(
        __dirname,
        '..',
        'files/files',
        'ccfirma.png',
      );
      const pathmarcadeagua = path.join(
        __dirname,
        '..',
        'files/files',
        'marcadeagua.png',
      );
      const pathnuevologo = path.join(
        __dirname,
        '..',
        'files/files',
        'nuevologo.png',
      );

      const pdfDoc = await PDFDocument.load(fileBuffer);
      const caroaImage = await pdfDoc.embedPng(fs.readFileSync(pathcaroa));
      const ccfirmaImage = await pdfDoc.embedPng(fs.readFileSync(pathccfirma));
      const marcadeaguaImage = await pdfDoc.embedPng(
        fs.readFileSync(pathmarcadeagua),
      );
      const nuevologoImage = await pdfDoc.embedPng(
        fs.readFileSync(pathnuevologo),
      );

      const pages = pdfDoc.getPages();

      if (modificar) {
        for (const page of pages) {
          let { width, height } = page.getSize();
          let isLandscape = width > height;

          let pageWidth = isLandscape ? height : width;
          let pageHeight = isLandscape ? width : height;

          let centerX = pageWidth / 2;

          let logoTopX = 10;
          let logoTopY = pageHeight - 43;


          if (isLandscape) {
            logoTopX = pageHeight - 43;
            logoTopY = pageWidth - 20;
          }

          page.drawImage(marcadeaguaImage, {
            x: isLandscape ? (100) : (width / 2 - 310),
            y: isLandscape ? logoTopY + 35 : (height / 2 - 330),
            width: 620,
            height: 600,
            opacity: 0.7,
            rotate: isLandscape ? degrees(-90) : degrees(0),
          });

          page.drawImage(caroaImage, {
            x: isLandscape ? logoTopX : 10,
            y: isLandscape ? logoTopY : (height - 43),
            width: 95,
            height: 40,
            rotate: isLandscape ? degrees(-90) : degrees(0),
          });

          page.drawImage(nuevologoImage, {
            x: isLandscape ? logoTopX : (width / 2 - 25),
            y: isLandscape ? ((logoTopY + 42) - centerX) : (height - 43),
            width: 50,
            height: 35,
            rotate: isLandscape ? degrees(-90) : degrees(0),
          });

          page.drawImage(ccfirmaImage, {
            x: isLandscape ? 10 : (width / 2 - 30),
            y: isLandscape ? ((logoTopY + 47) - centerX) : (5),
            width: 70,
            height: 30,
            opacity: 0.9,
            rotate: isLandscape ? degrees(-90) : degrees(0),
          });

          page.drawText('https://ccfirma.com/', {
            x: isLandscape ? logoTopX + 10 : 10,
            y: isLandscape ? logoTopY : (pageHeight - 25),
            size: 10,
            color: rgb(0, 0, 0),
            opacity: 0.0,
            rotate: isLandscape ? degrees(-90) : degrees(0),
          });

          page.drawText('https://jurissearch.com/', {
            x: isLandscape ? pageHeight - 30 : (width / 2 - 25),
            y: isLandscape ? (pageWidth / 2) + 25 : (height - 30),
            size: 10,
            color: rgb(0, 0, 0),
            opacity: 0.0,
            rotate: isLandscape ? degrees(-90) : degrees(0),
          });

          page.drawText('https://ccfirma.com/', {
            x: isLandscape ? 20 : (width / 2 - 30),
            y: isLandscape ? (pageWidth / 2) + 25 : 10,
            size: 10,
            color: rgb(0, 0, 0),
            opacity: 0.0,
            rotate: isLandscape ? degrees(-90) : degrees(0),
          });

          page.drawText('https://ccfirma.com/', {
            x: isLandscape ? (pageHeight / 2) + 50 : 5,
            y: isLandscape ? (pageWidth - 20) : height / 2 - 25,
            size: 11,
            color: rgb(0, 0, 0),
            opacity: 0.0,
            rotate: isLandscape ? degrees(0) : degrees(-90),
          });

          page.drawText('https://ccfirma.com/', {
            x: isLandscape ? (pageHeight / 2) - 70 : 5,
            y: isLandscape ? (pageWidth - 20) : height / 2 - 90,
            size: 11,
            color: rgb(0, 0, 0),
            opacity: 0.0,
            rotate: isLandscape ? degrees(0) : degrees(-90),
          });

          page.drawText('https://ccfirma.com/', {
            x: isLandscape ? (pageHeight / 2) - 190 : 5,
            y: isLandscape ? (pageWidth - 20) : height / 2 + 90,
            size: 11,
            color: rgb(0, 0, 0),
            opacity: 0.0,
            rotate: isLandscape ? degrees(0) : degrees(-90),
          });

        }
      }


      const pdfBytes = await pdfDoc.save();
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${data.TITLE}.pdf"`,
      });
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      const msg = (error as any)?.message ?? String(error);
      console.error('[login/download]', msg);
      res.status(500).json({ error: 'Error al descargar el archivo', detail: msg });
    }
  }

  @Get('list-categorias')
  async listaCategorias(@Query() entidad: DataTable): Promise<NoticiaModel[]> {
    return await this.noticiaService.listCategorias(entidad);
  }

  @Get('noticias')
  async listaAll(@Query() entidad: DataTable): Promise<NoticiaModel[]> {
    try {
      let noticias = await this.noticiaService.listNoticias(entidad);
      return noticias;
    } catch (error) {
      return [];
    }
  }

}