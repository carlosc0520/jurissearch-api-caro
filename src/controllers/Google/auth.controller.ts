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
import { LinkedInAuthGuard } from './linkedin-auth.guard';
import { LinkedRegisterInAuthGuard } from './linkedin-auth.guard.register';

@Controller('auth')
export class AuthController {
    redirectURL: string = process.env.URL_FRONT;
    redirectURLAPI: string = process.env.URL_API;

    constructor(private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly emailJurisService: EmailJurisService,
    ) { }

    // controladores iniciales google
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

        const token = await this.tokenService.generateToken(usuario, true);
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

    // controlador iniciales linkedin
    @Get('linkedin')
    @UseGuards(LinkedInAuthGuard)
    async linkedinAuth() {
    }

    @Get('linkedin-register')
    @UseGuards(LinkedRegisterInAuthGuard)
    async linkedinRegister() {
    }

    @Get('linkedin/redirect')
    @UseGuards(AuthGuard('linkedin'))
    async linkedinAuthRedirect(@Req() req: Request, @Res() res: Response) {
        const user = req['user'];

        if (!user) {
            return res.redirect(`${this.redirectURL}/auth/login?onerror=linkedin&message=Error en autenticación con LinkedIn`);
        }

        const entidad: Usuario = new Usuario();
        entidad.EMAIL = user.email;
        entidad.PASSWORD = "";

        const usuario = await this.userService.loguearUsuario(entidad);
        
        if (usuario?.['STATUS'] == 0) {
            return res.redirect(`${this.redirectURL}/auth/login?onsuccess=false&autentication=linkedin&message=${usuario?.['MESSAGE'] || 'Error al iniciar sesión'}`);
        }

        const token = await this.tokenService.generateToken(usuario, true);
        usuario.TOKEN = token;
        usuario.RTAFTO = process.env.DOMINIO + usuario.RTAFTO;

        return res.redirect(`${this.redirectURL}/auth/login?onsuccess=true&autentication=linkedin&message=Autenticación exitosa&accessToken=${token}&user=${JSON.stringify({
            NOMBRES: user.name,
            EMAIL: user.email,
            RTAFTO: usuario.RTAFTO,
        })}`);
    }

    @Get('linkedin/redirect-register')
    @UseGuards(AuthGuard('linkedin-register'))
    async linkedinAuthRedirectRegister(@Req() req: Request, @Res() res: Response) {
        const user = req['user'];

        if (!user) {
            return res.redirect(`${this.redirectURL}/auth/login?onerror=linkedin&message=Error al iniciar sesión con LinkedIn`);
        }

        const entidad: Usuario = new Usuario();
        entidad.IDROLE = 2;
        entidad.EMAIL = user.email;
        entidad.NOMBRES = user.name;
        entidad.APATERNO = "";
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
            return res.redirect(`${this.redirectURL}/auth/register?onsuccess=false&autentication=linkedin&message=${respuesta?.['MESSAGE'] || 'Error al registrarse.'}`);
        }

        await this.emailJurisService.sendEmailUser(entidad);
        
        res.redirect(`${this.redirectURL}/auth/register?onsuccess=true&autentication=linkedin&message=Registro exitoso&user=${JSON.stringify({
            NOMBRES: user.name,
            EMAIL: user.email,
        })}`);
    }
}
