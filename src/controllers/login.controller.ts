import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from '../services/User/user.service';
import { TokenService } from '../services/User/token.service';
import { NoticiaService } from 'src/services/mantenimiento/noticia.service';
import { NoticiaModel } from 'src/models/Admin/noticia.model';
import { DataTable } from 'src/models/DataTable.model.';
import { S3Service } from 'src/services/Aws/aws.service';
import { PreguntasService } from 'src/services/mantenimiento/preguntas.service';
import { PreguntaModel } from 'src/models/Admin/preguntas.model';

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
    UCRCN: string;
    FCRCN: Date;
    FEDCN: Date;
    CDESTDO: string;
    TOKEN: string;
}


@Controller('login')
export class LoginController {
    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly noticiaService: NoticiaService,
        private readonly preguntaService: PreguntasService,
        private readonly s3Service: S3Service
    ) { }

    @Post('autenticar')
    async autenticarUsuario(@Body() entidad: User): Promise<User> {
        const usuario: User = await this.userService.loguearUsuario(entidad);

        if (!usuario) {
            throw new BadRequestException('Usuario no encontrado');
        }

        if (usuario.PASSWORD !== entidad.PASSWORD) {
            throw new BadRequestException('Contraseña incorrecta');
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
}

