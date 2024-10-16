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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const common_1 = require("@nestjs/common");
const jwt = __importStar(require("jsonwebtoken"));
const token_service_1 = require("../services/User/token.service");
let AuthMiddleware = class AuthMiddleware {
    constructor(tokenService) {
        this.tokenService = tokenService;
        this.secretKey = process.env.SECRET_KEY;
    }
    async use(req, res, next) {
        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }
        token = token.replace('Bearer ', '');
        try {
            const decoded = await jwt.verify(token, this.secretKey);
            this.activeSessions = this.tokenService.readActiveSessionsFromFile();
            const session = this.activeSessions.get(decoded.sessionId.toString());
            if (!this.isSessionActive(session)) {
                return res
                    .status(401)
                    .json({ message: 'Token inválido o sesión cerrada' });
            }
            req['user'] = decoded;
            next();
        }
        catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ message: 'Token inválido' });
            }
            if (error instanceof common_1.UnauthorizedException) {
                return res.status(401).json({ message: error.message });
            }
            return res.status(500).json({ message: 'Error en la autenticación' });
        }
    }
    isSessionActive(session) {
        return session && session.expiresIn > Date.now();
    }
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [token_service_1.TokenService])
], AuthMiddleware);
//# sourceMappingURL=auth.middleware.js.map