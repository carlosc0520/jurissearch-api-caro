import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from '../services/User/user.service';
// import { User } from '../models/admin/user.model';
import { TokenService } from '../services/User/token.service';

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
        private readonly tokenService: TokenService
    ) { }

    @Post('autenticar')
    async autenticarUsuario(@Body() entidad: User): Promise<User> {
        console.log("usuario")
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
}

