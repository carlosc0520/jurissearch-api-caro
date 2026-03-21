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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
        this.USE_SQL_SESSIONS = process.env.USE_SQL_SESSIONS !== 'false';
        if (!this.secretKey || this.secretKey.length < 32) {
            throw new Error('SECRET_KEY no configurada o demasiado corta');
        }
    }
    async use(req, res, next) {
        try {
            let token = req.headers.authorization;
            if (!token || typeof token !== 'string') {
                return res.status(401).json({
                    message: 'Acceso no autorizado',
                    statusCode: 401
                });
            }
            token = token.trim();
            if (token.startsWith('Bearer ')) {
                token = token.substring(7).trim();
            }
            if (token.length < 20 || token.length > 2000) {
                return res.status(401).json({
                    message: 'Acceso no autorizado',
                    statusCode: 401
                });
            }
            const tokenRegex = /^[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+$/;
            if (!tokenRegex.test(token)) {
                return res.status(401).json({
                    message: 'Acceso no autorizado',
                    statusCode: 401
                });
            }
            const decoded = await jwt.verify(token, this.secretKey, {
                algorithms: ['HS256'],
                maxAge: '24h',
            });
            if (!decoded || typeof decoded !== 'object') {
                return res.status(401).json({
                    message: 'Acceso no autorizado',
                    statusCode: 401
                });
            }
            if (!decoded['sessionId']) {
                return res.status(401).json({
                    message: 'Acceso no autorizado',
                    statusCode: 401
                });
            }
            const sessionId = decoded['sessionId'].toString();
            if (this.USE_SQL_SESSIONS) {
                try {
                    const sessionData = await this.tokenService.getSessionDB(sessionId);
                    if (!sessionData) {
                        return res.status(401).json({
                            message: 'Sesión expirada o inválida',
                            statusCode: 401
                        });
                    }
                    if (!sessionData.IS_ACTIVE) {
                        return res.status(401).json({
                            message: 'Sesión cerrada',
                            statusCode: 401
                        });
                    }
                    const expiresAt = new Date(sessionData.EXPIRES_AT).getTime();
                    if (expiresAt <= Date.now()) {
                        return res.status(401).json({
                            message: 'Sesión expirada',
                            statusCode: 401
                        });
                    }
                }
                catch (sqlError) {
                    console.error('[AUTH MIDDLEWARE] Error validando sesión:', sqlError.message);
                    return res.status(401).json({
                        message: 'Error validando sesión',
                        statusCode: 401
                    });
                }
            }
            else {
                this.activeSessions = this.tokenService.readActiveSessionsFromFile();
                const session = this.activeSessions.get(sessionId);
                if (!this.isSessionActive(session)) {
                    return res.status(401).json({
                        message: 'Sesión expirada o inválida',
                        statusCode: 401
                    });
                }
            }
            req['user'] = decoded;
            next();
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({
                    message: 'Sesión expirada',
                    statusCode: 401
                });
            }
            if (error instanceof jwt.JsonWebTokenError) {
                console.error('JWT Error:', error.message);
                return res.status(401).json({
                    message: 'Acceso no autorizado',
                    statusCode: 401
                });
            }
            if (error instanceof jwt.NotBeforeError) {
                return res.status(401).json({
                    message: 'Acceso no autorizado',
                    statusCode: 401
                });
            }
            if (error instanceof common_1.UnauthorizedException) {
                return res.status(401).json({
                    message: 'Acceso no autorizado',
                    statusCode: 401
                });
            }
            console.error('Auth Middleware Error:', error);
            return res.status(500).json({
                message: 'Error interno del servidor',
                statusCode: 500
            });
        }
    }
    isSessionActive(session) {
        if (!session) {
            return false;
        }
        if (!session.expiresIn || typeof session.expiresIn !== 'number') {
            return false;
        }
        return session.expiresIn > Date.now();
    }
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [token_service_1.TokenService])
], AuthMiddleware);
//# sourceMappingURL=auth.middleware.js.map