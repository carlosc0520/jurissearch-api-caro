import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
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
}

@Controller('login')
export class LoginController {
    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly noticiaService: NoticiaService,
        private readonly preguntaService: PreguntasService,
        private readonly emailJurisService: EmailJurisService,
        private readonly s3Service: S3Service
    ) { }

    @Post('autenticar')
    async autenticarUsuario(@Body() entidad: User): Promise<User> {
        const usuario: User = await this.userService.loguearUsuario(entidad);

        if (!usuario) {
            throw new BadRequestException({ MESSAGE: 'Usuario no encontrado', STATUS: false });
        }

        if (usuario?.STATUS === 0) {
            throw new BadRequestException({ MESSAGE: usuario.MESSAGE, STATUS: false });
        }

        if (usuario.PASSWORD !== entidad.PASSWORD) {
            throw new BadRequestException({ MESSAGE: 'Contraseña incorrecta', STATUS: false });
        }


        const token = this.tokenService.generateToken(usuario);
        usuario.TOKEN = token;
        return usuario;
    }

    @Get('noticias')
    async listaAll(@Query() entidad: DataTable): Promise<NoticiaModel[]> {
        const noticias = await this.noticiaService.list(entidad);

        const noticiasConImagenes = await Promise.all(noticias.map(async noticia => {
            noticia.IMAGEN2 = await this.s3Service.getImage(noticia.IMAGEN);
            return noticia;
        }));


        return noticiasConImagenes;
    }

    @Get('preguntas')
    async listaPreguntas(@Query() entidad: DataTable): Promise<PreguntaModel[]> {
        entidad.CESTDO = 'A';
        const preguntas = await this.preguntaService.list(entidad);
        return preguntas;
    }

    @Get("validateToken")
    async validateToken(@Query('token') token: string): Promise<boolean> {
        return this.tokenService.validateTokenSolicitud(token);
    }

    @Get("validateToken-recovery")
    async validateTokenSolicitudTime(@Query('token') token: string): Promise<boolean> {
        return this.tokenService.validateTokenSolicitudTime(token);
    }

    @Post('generateUser')
    async generateUser(@Body() entidad: User): Promise<Result> {
        const result = await this.tokenService.validateTokenSolicitud(entidad.TOKEN);
        if (result) {
            entidad.IDROLE = 2;
            entidad.USER = "AUTOLOGIN"
            entidad.PLAN = "1";
            return await this.userService.createUser(entidad);
        } else {
            return { MESSAGE: "Token invalido", STATUS: false }
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
            throw new BadRequestException({ MESSAGE: 'Usuario no encontrado', STATUS: false });
        }

        if (usuario?.STATUS === 0) {
            throw new BadRequestException({ MESSAGE: usuario.MESSAGE, STATUS: false });
        }

        const result = await this.emailJurisService.recoveryPassword(entidad);
        return result;
    }

    @Post('recoveryUser')
    async recoveryUser(@Body() entidad: User): Promise<Result> {

        try {
            const VALDIAR_TOKEN = this.tokenService.validateTokenSolicitudTime(entidad.TOKEN);
            if (VALDIAR_TOKEN.STATUS === false) {
                throw new BadRequestException({ MESSAGE: VALDIAR_TOKEN.MESSAGE, STATUS: false });
            }

            const entidadNuevo = new User();
            entidadNuevo.EMAIL = entidad.EMAIL;
            entidadNuevo.PASSWORD = entidad.PASSWORD;


            const result = await this.userService.updatePassword(entidadNuevo);
            return result;
        } catch (error) {
            return { MESSAGE: "Token invalido", STATUS: false }
        }

    }

}

