import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'aws-sdk/clients/budgets';
import { Request, Response } from 'express';
import { User as Usuario } from 'src/models/Admin/user.model';
import { TokenService } from 'src/services/User/token.service';
import { UserService } from 'src/services/User/user.service';
import { GoogleAuthGuard } from './google-auth.guard';
import { GoogleRegisterAuthGuard } from './google-auth.guard.register';
import { EmailJurisService } from 'src/services/acompliance/emailJurisserivce';

@Controller('auth')
export class AuthController {
    // redirectURL: string = 'http://localhost:8080';
    redirectURL: string = 'https://jurissearch.com';
    // redirectURLAPI: string = 'http://localhost:3000';
    redirectURLAPI: string = 'https://api.jurissearch.com';
    constructor(private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly emailJurisService: EmailJurisService,
    ) { }
    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Req() req, @Res() res) {

    }

    @Get('google-register')
    @UseGuards(GoogleRegisterAuthGuard)
    async googleRegister(@Req() req, @Res() res) {

    }

    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
        const user = req['user'];

        if (!user) {
            res.redirect(`${this.redirectURL}/auth/login?onerror=google&message=Error al iniciar sesión con Google`);
            return;
        }

        const entidad: Usuario = new Usuario();
        entidad.EMAIL = user.email;
        entidad.PASSWORD = "";
        const usuario: Usuario = await this.userService.loguearUsuario(entidad);

        if (usuario?.['STATUS'] == 0) {
            res.redirect(`${this.redirectURL}/auth/login?onsuccess=false&autentication=google&message=${usuario?.['MESSAGE'] || 'Error al iniciar sesión'}`);
            return;
        }

        const token = await this.tokenService.generateToken(usuario, false);
        usuario.TOKEN = token;
        usuario.RTAFTO = process.env.DOMINIO + usuario.RTAFTO;

        res.redirect(`${this.redirectURL}/auth/login?onsuccess=true&autentication=google&message=Autenticación exitosa&accessToken=${token}&user=${JSON.stringify({
            NOMBRES: user.firstName + ' ' + user.lastName,
            EMAIL: user.email,
            RTAFTO: usuario.RTAFTO,
        })}`);
    }

    @Get('google/redirect-register')
    @UseGuards(AuthGuard('google-register'))
    async googleAuthRedirectRegister(@Req() req: Request, @Res() res: Response) {
        const user = req['user'];

        if (!user) {
            res.redirect(`${this.redirectURL}/auth/login?onerror=google&message=Error al iniciar sesión con Google`);
            return;
        }

        const entidad: Usuario = new Usuario();
        entidad.IDROLE = 2;
        entidad.EMAIL = user.email;
        entidad.NOMBRES = user.firstName;
        entidad.APATERNO = user.lastName;
        entidad.AMATERNO = "";
        entidad.TELEFONO = "";
        entidad.FNACIMIENTO = null;
        entidad.PROFESION = "";
        entidad.CARGO = "";
        entidad.DIRECCION = "";
        entidad.RTAFTO = "";
        entidad.USER = entidad.EMAIL.split('@')[0];
        entidad.PLAN = '1';
        entidad.PASSWORD = user.email.split('@')[0];
        entidad.EMAIL = user.email;
        let respuesta = await this.userService.createUser(entidad);

        if (respuesta?.['isSuccess'] == false) {
            res.redirect(`${this.redirectURL}/auth/register?onsuccess=false&autentication=google&message=${respuesta?.['MESSAGE'] || 'Error al registrarse.'}`);
            return;
        }

        await this.emailJurisService.sendEmailUser(entidad);

        res.redirect(`${this.redirectURL}/auth/register?onsuccess=true&autentication=google&message=Registro exitoso&user=${JSON.stringify({
            NOMBRES: user.firstName + ' ' + user.lastName,
            EMAIL: user.email,
        })}`);
    }
}
