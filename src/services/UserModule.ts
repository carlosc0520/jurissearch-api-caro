import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './User/user.service';

import { TokenService } from './User/token.service';

// * CONTROLADORES
import { LoginController } from '../controllers/login.controller';
import { UsuarioController } from 'controllers/adminControllers/usuario.controller';
import { FiltrosController } from 'controllers/adminControllers/filtros.controller';
import { filtrosService } from './Filtros/filtros.service';
import { EntriesController } from 'controllers/adminControllers/entries.controller';
import { EntriesService } from './Admin/entries.service';
import { S3Service } from './Aws/aws.service';
import { MagistradoController } from 'controllers/adminControllers/magistrados.controller';
import { MagistradosService } from './Admin/magistrados.service';

@Module({
    imports: [TypeOrmModule.forFeature([])],
    controllers: [
        LoginController,
        UsuarioController, 
        FiltrosController, 
        EntriesController,
        MagistradoController
    ],
    providers: [
        UserService, 
        TokenService, 
        filtrosService, 
        EntriesService, 
        S3Service,
        MagistradosService
    ],
})
export class UserModule { }