import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './User/user.service';

import { TokenService } from './User/token.service';

// * CONTROLADORES
import { LoginController } from '../controllers/login.controller';
import { UsuarioController } from 'src/controllers/adminControllers/usuario.controller';

@Module({
    // access Note entity using TypeOrmModule
    imports: [TypeOrmModule.forFeature([])],
    controllers: [LoginController, UsuarioController],
    providers: [UserService, TokenService],
})
export class UserModule { }