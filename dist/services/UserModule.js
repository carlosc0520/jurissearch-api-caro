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
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([])],
        controllers: [
            login_controller_1.LoginController,
            usuario_controller_1.UsuarioController,
            filtros_controller_1.FiltrosController,
            entries_controller_1.EntriesController,
            magistrados_controller_1.MagistradoController
        ],
        providers: [
            user_service_1.UserService,
            token_service_1.TokenService,
            filtros_service_1.filtrosService,
            entries_service_1.EntriesService,
            aws_service_1.S3Service,
            magistrados_service_1.MagistradosService
        ],
    })
], UserModule);
//# sourceMappingURL=UserModule.js.map