import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './User/user.service';

import { TokenService } from './User/token.service';

// * CONTROLADORES
import { LoginController } from '../controllers/login.controller';
import { UsuarioController } from 'src/controllers/adminControllers/usuario.controller';
import { FiltrosController } from 'src/controllers/adminControllers/filtros.controller';
import { filtrosService } from './Filtros/filtros.service';
import { EntriesController } from 'src/controllers/adminControllers/entries.controller';
import { EntriesService } from './Admin/entries.service';

@Module({
    // access Note entity using TypeOrmModule
    imports: [TypeOrmModule.forFeature([])],
    controllers: [LoginController, UsuarioController, FiltrosController, EntriesController],
    providers: [UserService, TokenService, filtrosService, EntriesService],
})
export class UserModule { }