import {
  BadRequestException,
  Body,
  Controller,
  Get,
  UploadedFiles,
  Request,
  Post,
  Query,
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
  ) {}

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

  @Get('noticias')
  async listaAll(@Query() entidad: DataTable): Promise<NoticiaModel[]> {
    try { 
      let noticias = await this.noticiaService.list(entidad);
      noticias = noticias ? noticias : [];

      const noticiasConImagenes = await Promise.all(
        noticias.map(async (noticia) => {
          try {
            noticia.IMAGEN2 = await this.s3Service.getImage(noticia.IMAGEN);
            return noticia;
          } catch (error) {
            return noticia;
          }
        }),
      );

      return noticiasConImagenes;
    } catch (error) {
      return [];
    }
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
}
