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
import { S3Service } from './Aws/aws.service';
import { MagistradoController } from 'src/controllers/adminControllers/magistrados.controller';
import { MagistradosService } from './Admin/magistrados.service';
import { HelpController } from 'src/controllers/mantenimientoControllers/help.controller';
import { HelpService } from './mantenimiento/help.service';
import { NoticiaController } from 'src/controllers/adminControllers/noticia.controller';
import { NoticiaService } from './mantenimiento/noticia.service';
import { PreguntasController } from 'src/controllers/adminControllers/preguntas.controller';
import { PreguntasService } from './mantenimiento/preguntas.service';
import { AuditoriaService } from './Admin/auditoria.service';
import { AuditoriaController } from 'src/controllers/adminControllers/auditoria.controller';
import { EmailController } from 'src/controllers/acompliance/email.controller';
import { EmailService } from './acompliance/email.service';

@Module({
    imports: [TypeOrmModule.forFeature([])],
    controllers: [
        LoginController,
        UsuarioController, 
        FiltrosController, 
        EntriesController,
        MagistradoController,
        HelpController,
        NoticiaController,
        PreguntasController,
        AuditoriaController,

        // COMPLIANCE
        EmailController
    ],
    providers: [
        UserService, 
        TokenService, 
        filtrosService, 
        EntriesService, 
        S3Service,
        MagistradosService,
        HelpService,
        NoticiaService,
        PreguntasService,
        AuditoriaService,

        // COMPLIANCE
        EmailService
    ],
})
export class UserModule { }