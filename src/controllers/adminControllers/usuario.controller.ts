import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from '../../services/User/user.service';
import { User } from '../../models/user.model';

@Controller('admin-user')
export class UsuarioController {
    constructor(
        private readonly userService: UserService,
    ) { }

    @Post('add')
    async addUser(@Body() entidad: User): Promise<User> {
        const usuario: User = await this.userService.createUser(entidad);

        // if (!usuario) {
        //     throw new BadRequestException('Usuario no encontrado');
        // }

        // if (usuario.PASSWORD !== entidad.PASSWORD) {
        //     throw new BadRequestException('Contraseña incorrecta');
        // }

        // const token = this.tokenService.generateToken(usuario);
        // usuario.TOKEN = token;
        // return usuario;
        return usuario;
    }



}
