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
import { EmailJurisService } from './acompliance/emailJurisserivce';
import { PlanesController } from 'src/controllers/adminControllers/planes.controller';
import { PlanesService } from './mantenimiento/planes.service';
import { AsistenciaController } from 'src/controllers/controlAsistencias/asistencia.controller';
import { AsistenciaService } from './controlAsistencias/asistencia.service';
import { HelpersController } from 'src/controllers/adminControllers/helpers.controller';
import { HelpersService } from './Admin/helpers.service';
import { BoletinController } from 'src/controllers/adminControllers/boletin.controller';
import { BoletinService } from './Admin/boletin.service';
import { FtpModule } from 'nestjs-ftp';
import { ComplytoolsController } from 'src/controllers/acompliance/complytools.controller';
import { HttpModule } from '@nestjs/axios';
import { HostingerService } from './Aws/hostinger.service';
// import { AuthService } from './Google/auth.service';
import { GoogleStrategy } from './Google/google.strategy';
import { AuthController } from 'src/controllers/Google/auth.controller';
import { GoogleRegisterStrategy } from './Google/google.strategy.register';
import { LinkedInStrategy } from './Google/linkedin.strategy';
import { LinkedRegisterInStrategy } from './Google/linkedin.strategy.register';
import { StripeService } from './Stripe/stripe.service';
import { StripeController } from 'src/controllers/Stripe/stripe.controller';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([]),
    // Configuración de FTP para subir archivos
    FtpModule.forRootFtpAsync({
      useFactory: async () => {
        return {
          host: 'ccfirma.com',
          port: 21, // Puerto FTP (generalmente es 21)
          user: 'u551436692.jurissearch.com',
          password: '2051CCfirma1091#',
          secure: false, // Si es conexión segura (FTPS), si no usa FTP normal
        };
      },
    }),
  ],
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
    PlanesController,

    // COMPLIANCE
    EmailController,
    AsistenciaController,
    HelpersController,
    BoletinController,
    ComplytoolsController,
    AuthController,
    StripeController
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
    PlanesService,
    BoletinService,

    // COMPLIANCE
    EmailService,
    EmailJurisService,
    AsistenciaService,
    HelpersService,
    HostingerService,

    // GOOGLE
    // AuthService,
    GoogleStrategy,
    GoogleRegisterStrategy,
    LinkedInStrategy,
    LinkedRegisterInStrategy,
    StripeService
  ],
})
export class UserModule {}
