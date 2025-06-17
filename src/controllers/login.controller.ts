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
  PLAN?: string;
  DATOS?: string;
  STATUS?: number;
  MESSAGE?: string;
  BANDERA?: boolean = false;
  RTAFTO?: string;
  IDPLN?: number;
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
  ) { }

  @Post('autenticar')
  async autenticarUsuario(@Body() entidad: User): Promise<User> {
    const usuario: User = await this.userService.loguearUsuario(entidad);

    if (!usuario) {
      throw new BadRequestException({
        MESSAGE: 'Usuario no encontrado',
        STATUS: false,
      });
    }

    if (usuario?.STATUS === 0) {
      throw new BadRequestException({
        MESSAGE: usuario.MESSAGE,
        STATUS: false,
      });
    }

    if (usuario.PASSWORD !== entidad.PASSWORD) {
      throw new BadRequestException({
        MESSAGE: 'Contraseña incorrecta',
        STATUS: false,
      });
    }

    const token = await this.tokenService.generateToken(usuario, entidad.BANDERA);
    usuario.TOKEN = token;
    usuario.RTAFTO = process.env.DOMINIO + usuario.RTAFTO;
    return usuario;
  }

  @Get('logout')
  async removeSession(@Query('token') token: string): Promise<boolean> {
    this.tokenService.removeSession(token);
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
    return await this.tokenService.refreshToken(token);
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
    const result = await this.tokenService.validateTokenSolicitud(
      entidad.TOKEN,
    );
    if (result) {
      entidad.IDROLE = 2;
      entidad.USER = 'AUTOLOGIN';
      entidad.PLAN = '1';
      return await this.userService.createUser(entidad);
    } else {
      return { MESSAGE: 'Token invalido', STATUS: false };
    }
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
    const usuario: User = await this.userService.obtenerUsuario(entidad);

    if (!usuario) {
      throw new BadRequestException({
        MESSAGE: 'Usuario no encontrado',
        STATUS: false,
      });
    }

    if (usuario?.STATUS === 0) {
      throw new BadRequestException({
        MESSAGE: usuario.MESSAGE,
        STATUS: false,
      });
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

      const fileBuffer = await this.s3Service.downloadFile(data.ENTRIEFILE);

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
      res.status(500).send('Error al descargar el archivo');
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