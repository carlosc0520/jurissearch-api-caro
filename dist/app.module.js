"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const typeorm_1 = require("@nestjs/typeorm");
const UserModule_1 = require("./services/UserModule");
const auth_middleware_1 = require("./middleware/auth.middleware");
const token_service_1 = require("./services/User/token.service");
const config_1 = __importDefault(require("./config"));
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(auth_middleware_1.AuthMiddleware).forRoutes({
            path: 'admin/*',
            method: common_1.RequestMethod.ALL,
        });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot(Object.assign(Object.assign({ "type": "mssql" }, config_1.default), { "entities": ["dist/**/*.entity{.ts,.js}"], "synchronize": true, autoLoadEntities: true, extra: {
                    trustServerCertificate: true,
                } })),
            UserModule_1.UserModule,
        ],
        exports: [
            token_service_1.TokenService
        ],
        controllers: [
            app_controller_1.AppController
        ],
        providers: [
            app_service_1.AppService,
            token_service_1.TokenService
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map