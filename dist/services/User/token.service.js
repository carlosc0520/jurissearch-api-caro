"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt = __importStar(require("jsonwebtoken"));
let TokenService = class TokenService {
    constructor() {
        this.secretKey = process.env.SECRET_KEY;
        this.SECRET_KEY_SOLICITUD = process.env.SECRET_KEY_SOLICITUD;
    }
    generateToken(user) {
        var _a;
        const payload = {
            EMAIL: user.EMAIL,
            ID: user.ID,
            role: user.IDROLE,
            NAME: user.NOMBRES,
            APELLIDO: user.APELLIDO,
            UCRCN: user.EMAIL.split('@')[0] || "",
            PERM: (user === null || user === void 0 ? void 0 : user.RESTRICIONES) ? (_a = user.RESTRICIONES) === null || _a === void 0 ? void 0 : _a.split(',') : [],
        };
        return jwt.sign(payload, this.secretKey);
    }
    generateTokenSolicitud(user) {
        const payload = {
            ID: user.ID || 0,
            NOMBRES: user.NOMBRES,
            CORREO: user.CORREO,
            APELLIDOP: user.APELLIDOP,
            APELLIDOM: user.APELLIDOM,
            TELEFONO: user.TELEFONO,
            FNACIMIENTO: user.FNACIMIENTO,
            PROFESION: user.PROFESION,
            CARGO: user.CARGO,
            DIRECCION: user.DIRECCION,
        };
        return jwt.sign(payload, this.SECRET_KEY_SOLICITUD);
    }
    validateToken(token) {
        try {
            jwt.verify(token, this.secretKey);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    validateTokenSolicitud(token) {
        try {
            jwt.verify(token, this.SECRET_KEY_SOLICITUD);
            return true;
        }
        catch (error) {
            return false;
        }
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)()
], TokenService);
//# sourceMappingURL=token.service.js.map