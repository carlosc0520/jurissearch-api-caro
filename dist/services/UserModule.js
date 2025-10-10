"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_service_1 = require("./User/user.service");
const token_service_1 = require("./User/token.service");
const login_controller_1 = require("../controllers/login.controller");
const usuario_controller_1 = require("../controllers/adminControllers/usuario.controller");
const filtros_controller_1 = require("../controllers/adminControllers/filtros.controller");
const filtros_service_1 = require("./Filtros/filtros.service");
const entries_controller_1 = require("../controllers/adminControllers/entries.controller");
const entries_service_1 = require("./Admin/entries.service");
const aws_service_1 = require("./Aws/aws.service");
const magistrados_controller_1 = require("../controllers/adminControllers/magistrados.controller");
const magistrados_service_1 = require("./Admin/magistrados.service");
const help_controller_1 = require("../controllers/mantenimientoControllers/help.controller");
const help_service_1 = require("./mantenimiento/help.service");
const noticia_controller_1 = require("../controllers/adminControllers/noticia.controller");
const noticia_service_1 = require("./mantenimiento/noticia.service");
const preguntas_controller_1 = require("../controllers/adminControllers/preguntas.controller");
const preguntas_service_1 = require("./mantenimiento/preguntas.service");
const auditoria_service_1 = require("./Admin/auditoria.service");
const auditoria_controller_1 = require("../controllers/adminControllers/auditoria.controller");
const email_controller_1 = require("../controllers/acompliance/email.controller");
const email_service_1 = require("./acompliance/email.service");
const emailJurisserivce_1 = require("./acompliance/emailJurisserivce");
const planes_controller_1 = require("../controllers/adminControllers/planes.controller");
const planes_service_1 = require("./mantenimiento/planes.service");
const asistencia_controller_1 = require("../controllers/controlAsistencias/asistencia.controller");
const asistencia_service_1 = require("./controlAsistencias/asistencia.service");
const helpers_controller_1 = require("../controllers/adminControllers/helpers.controller");
const helpers_service_1 = require("./Admin/helpers.service");
const boletin_controller_1 = require("../controllers/adminControllers/boletin.controller");
const boletin_service_1 = require("./Admin/boletin.service");
const nestjs_ftp_1 = require("nestjs-ftp");
const complytools_controller_1 = require("../controllers/acompliance/complytools.controller");
const axios_1 = require("@nestjs/axios");
const hostinger_service_1 = require("./Aws/hostinger.service");
const google_strategy_1 = require("./Google/google.strategy");
const auth_controller_1 = require("../controllers/Google/auth.controller");
const google_strategy_register_1 = require("./Google/google.strategy.register");
const linkedin_strategy_1 = require("./Google/linkedin.strategy");
const linkedin_strategy_register_1 = require("./Google/linkedin.strategy.register");
const stripe_service_1 = require("./Stripe/stripe.service");
const stripe_controller_1 = require("../controllers/Stripe/stripe.controller");
const culqi_controller_1 = require("../controllers/Culqi/culqi.controller");
const CulqiService_1 = require("./Culqi/CulqiService");
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule,
            typeorm_1.TypeOrmModule.forFeature([]),
            nestjs_ftp_1.FtpModule.forRootFtpAsync({
                useFactory: async () => {
                    return {
                        host: 'ccfirma.com',
                        port: 21,
                        user: 'u551436692.jurissearch.com',
                        password: '2051CCfirma1091#',
                        secure: false,
                    };
                },
            }),
        ],
        controllers: [
            login_controller_1.LoginController,
            usuario_controller_1.UsuarioController,
            filtros_controller_1.FiltrosController,
            entries_controller_1.EntriesController,
            magistrados_controller_1.MagistradoController,
            help_controller_1.HelpController,
            noticia_controller_1.NoticiaController,
            preguntas_controller_1.PreguntasController,
            auditoria_controller_1.AuditoriaController,
            planes_controller_1.PlanesController,
            email_controller_1.EmailController,
            asistencia_controller_1.AsistenciaController,
            helpers_controller_1.HelpersController,
            boletin_controller_1.BoletinController,
            complytools_controller_1.ComplytoolsController,
            auth_controller_1.AuthController,
            stripe_controller_1.StripeController,
            culqi_controller_1.CulqiController
        ],
        providers: [
            user_service_1.UserService,
            token_service_1.TokenService,
            filtros_service_1.filtrosService,
            entries_service_1.EntriesService,
            aws_service_1.S3Service,
            magistrados_service_1.MagistradosService,
            help_service_1.HelpService,
            noticia_service_1.NoticiaService,
            preguntas_service_1.PreguntasService,
            auditoria_service_1.AuditoriaService,
            planes_service_1.PlanesService,
            boletin_service_1.BoletinService,
            email_service_1.EmailService,
            emailJurisserivce_1.EmailJurisService,
            asistencia_service_1.AsistenciaService,
            helpers_service_1.HelpersService,
            hostinger_service_1.HostingerService,
            google_strategy_1.GoogleStrategy,
            google_strategy_register_1.GoogleRegisterStrategy,
            linkedin_strategy_1.LinkedInStrategy,
            linkedin_strategy_register_1.LinkedRegisterInStrategy,
            stripe_service_1.StripeService,
            CulqiService_1.CulqiService
        ],
    })
], UserModule);
//# sourceMappingURL=UserModule.js.map