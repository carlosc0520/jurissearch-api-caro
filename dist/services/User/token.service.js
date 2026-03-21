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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt = __importStar(require("jsonwebtoken"));
const uuid = __importStar(require("uuid"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const database_service_1 = require("../database.service");
const sql = __importStar(require("mssql"));
const SESSIONS_FILE_PATH = path.join(__dirname, 'active-sessions.json');
const REFRESH_TOKENS_FILE_PATH = path.join(__dirname, 'refresh-tokens.json');
let TokenService = class TokenService {
    constructor() {
        this.secretKey = process.env.SECRET_KEY;
        this.SECRET_KEY_SOLICITUD = process.env.SECRET_KEY_SOLICITUD;
        this.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.SECRET_KEY;
        this.USE_SQL_SESSIONS = process.env.USE_SQL_SESSIONS !== 'false';
        this.ACCESS_TOKEN_EXPIRY = 4 * 60 * 60 * 1000;
        this.REFRESH_TOKEN_EXPIRY = 6 * 60 * 60 * 1000;
        if (!this.secretKey || this.secretKey.length < 32) {
            throw new Error('SECRET_KEY no configurada o demasiado corta (mínimo 32 caracteres)');
        }
        if (!this.REFRESH_TOKEN_SECRET || this.REFRESH_TOKEN_SECRET.length < 32) {
            throw new Error('REFRESH_TOKEN_SECRET no configurada o demasiado corta (mínimo 32 caracteres)');
        }
        if (this.USE_SQL_SESSIONS) {
            this.activeSessions = new Map();
            this.refreshTokens = new Map();
            this.testSQLConnection().catch(() => { });
        }
        else {
            this.activeSessions = this.readActiveSessionsFromFile();
            this.refreshTokens = this.readRefreshTokensFromFile();
            this.cleanupExpiredTokens();
        }
    }
    async testSQLConnection() {
        try {
            await database_service_1.DatabaseService.testConnection();
        }
        catch (error) {
        }
    }
    readActiveSessionsFromFile() {
        try {
            if (!fs.existsSync(SESSIONS_FILE_PATH)) {
                return new Map();
            }
            const sessionsData = fs.readFileSync(SESSIONS_FILE_PATH, 'utf8');
            if (!sessionsData || sessionsData.trim() === '') {
                return new Map();
            }
            const sessions = JSON.parse(sessionsData);
            const activeSessions = new Map();
            sessions.forEach(session => {
                if (session.expiresIn > Date.now()) {
                    activeSessions.set(session.sessionId, session);
                }
            });
            return activeSessions;
        }
        catch (error) {
            console.error('Error reading active sessions:', error);
            return new Map();
        }
    }
    readRefreshTokensFromFile() {
        try {
            if (!fs.existsSync(REFRESH_TOKENS_FILE_PATH)) {
                return new Map();
            }
            const tokensData = fs.readFileSync(REFRESH_TOKENS_FILE_PATH, 'utf8');
            if (!tokensData || tokensData.trim() === '') {
                return new Map();
            }
            const tokens = JSON.parse(tokensData);
            const activeTokens = new Map();
            tokens.forEach(token => {
                if (token.expiresAt > Date.now()) {
                    activeTokens.set(token.tokenId, token);
                }
            });
            return activeTokens;
        }
        catch (error) {
            console.error('Error reading refresh tokens:', error);
            return new Map();
        }
    }
    writeRefreshTokensToFile() {
        try {
            const tokensArray = Array.from(this.refreshTokens.values());
            const tokensData = JSON.stringify(tokensArray, null, 2);
            fs.writeFileSync(REFRESH_TOKENS_FILE_PATH, tokensData, 'utf8');
        }
        catch (error) {
            console.error('Error writing refresh tokens:', error);
        }
    }
    cleanupExpiredTokens() {
        const now = Date.now();
        for (const [key, session] of this.activeSessions.entries()) {
            if (session.expiresIn <= now) {
                this.activeSessions.delete(key);
            }
        }
        for (const [key, token] of this.refreshTokens.entries()) {
            if (token.expiresAt <= now) {
                this.refreshTokens.delete(key);
            }
        }
        this.writeActiveSessionsToFile();
        this.writeRefreshTokensToFile();
    }
    async removeSession(token) {
        try {
            const payload = jwt.decode(token);
            if (!payload || !payload.sessionId) {
                return;
            }
            if (this.USE_SQL_SESSIONS) {
                try {
                    await this.closeSessionDB(payload.sessionId);
                }
                catch (sqlError) {
                    console.error('[SQL] Error al cerrar sesión:', sqlError.message);
                }
            }
            else {
                this.activeSessions = await this.readActiveSessionsFromFile();
                this.activeSessions.delete(payload.sessionId);
                for (const [key, refreshToken] of this.refreshTokens.entries()) {
                    if (refreshToken.sessionId === payload.sessionId) {
                        this.refreshTokens.delete(key);
                    }
                }
                this.writeActiveSessionsToFile();
                this.writeRefreshTokensToFile();
            }
        }
        catch (error) {
            console.error('Error removing session:', error);
        }
    }
    writeActiveSessionsToFile() {
        try {
            const sessionsArray = Array.from(this.activeSessions.values());
            const sessionsData = JSON.stringify(sessionsArray, null, 2);
            fs.writeFileSync(SESSIONS_FILE_PATH, sessionsData, 'utf8');
        }
        catch (error) {
            console.error('Error writing active sessions:', error);
        }
    }
    async generateTokens(user, bandera = false, deviceInfo, ipAddress, userAgent) {
        try {
            if (!user || !user.ID || !user.EMAIL) {
                throw new common_1.BadRequestException({
                    MESSAGE: 'Datos de usuario inválidos',
                    STATUS: false,
                });
            }
            const sessionId = uuid.v4();
            const now = Date.now();
            const accessTokenExpiry = now + this.ACCESS_TOKEN_EXPIRY;
            const refreshTokenExpiry = now + this.REFRESH_TOKEN_EXPIRY;
            const refreshTokenId = uuid.v4();
            const accessPayload = {
                EMAIL: user.EMAIL,
                ID: user.ID,
                role: user.IDROLE,
                IDPLN: user.IDPLN || 0,
                NAME: user.NOMBRES,
                APELLIDO: user.APELLIDO,
                UCRCN: user.EMAIL.split('@')[0] || '',
                PERM: (user === null || user === void 0 ? void 0 : user.RESTRICIONES) ? user.RESTRICIONES.split(',') : [],
                sessionId: sessionId,
                jti: uuid.v4(),
            };
            const refreshPayload = {
                tokenId: refreshTokenId,
                userId: user.ID,
                sessionId: sessionId,
                jti: uuid.v4(),
            };
            const accessToken = jwt.sign(accessPayload, this.secretKey, {
                expiresIn: '4h',
                algorithm: 'HS256'
            });
            const refreshToken = jwt.sign(refreshPayload, this.REFRESH_TOKEN_SECRET, {
                expiresIn: '6h',
                algorithm: 'HS256'
            });
            if (this.USE_SQL_SESSIONS) {
                try {
                    if (!bandera) {
                        const activeSessions = await this.getUserActiveSessionsDB(user.ID);
                        if (activeSessions && activeSessions.length > 0) {
                            throw new common_1.BadRequestException({
                                MESSAGE: 'No puede iniciar sesión porque ya tiene otra sesión activa.',
                                STATUS: false,
                                OPTION: 1
                            });
                        }
                    }
                    else {
                        const closedCount = await this.closeAllUserSessionsDB(user.ID);
                    }
                    const sqlResult = await this.createSessionDB(user, sessionId, refreshTokenId, Math.floor(this.REFRESH_TOKEN_EXPIRY / (60 * 1000)), ipAddress || null, userAgent || deviceInfo || null);
                    if (!sqlResult) {
                        throw new Error('No se pudo crear la sesión en SQL Server');
                    }
                }
                catch (sqlError) {
                    if (sqlError instanceof common_1.BadRequestException) {
                        throw sqlError;
                    }
                    console.error('[SQL] Error al crear sesión en BD:', sqlError.message);
                    throw new common_1.BadRequestException({
                        MESSAGE: 'Error al crear sesión en base de datos',
                        STATUS: false,
                    });
                }
            }
            else {
                if (this.activeSessions.has(user.ID.toString())) {
                    const session = this.activeSessions.get(user.ID.toString());
                    if (this.isSessionActive(session) && !bandera) {
                        throw new common_1.BadRequestException({
                            MESSAGE: 'No puede iniciar sesión porque ya tiene otra sesión activa.',
                            STATUS: false,
                            OPTION: 1
                        });
                    }
                    this.activeSessions.delete(user.ID.toString());
                    for (const [key, token] of this.refreshTokens.entries()) {
                        if (token.userId === user.ID) {
                            this.refreshTokens.delete(key);
                        }
                    }
                }
                this.activeSessions.set(sessionId, {
                    sessionId: sessionId,
                    expiresIn: refreshTokenExpiry,
                    userEmail: user.EMAIL,
                    userId: user.ID,
                    userRole: user.IDROLE,
                    userName: user.NOMBRES,
                    userApellido: user.APELLIDO,
                    userIdPln: String(user.IDPLN || 0),
                    userUcrcn: user.EMAIL.split('@')[0] || '',
                    userPerm: (user === null || user === void 0 ? void 0 : user.RESTRICIONES) ? user.RESTRICIONES.split(',') : [],
                });
                this.refreshTokens.set(refreshTokenId, {
                    tokenId: refreshTokenId,
                    userId: user.ID,
                    sessionId: sessionId,
                    expiresAt: refreshTokenExpiry,
                    createdAt: now,
                    lastUsed: now,
                    deviceInfo: deviceInfo || 'unknown',
                });
                this.writeActiveSessionsToFile();
                this.writeRefreshTokensToFile();
            }
            return {
                accessToken,
                refreshToken,
                expiresIn: Math.floor(this.ACCESS_TOKEN_EXPIRY / 1000),
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException({
                MESSAGE: 'Error al generar tokens',
                STATUS: false,
            });
        }
    }
    async generateToken(user, bandera = false) {
        const tokens = await this.generateTokens(user, bandera);
        return tokens.accessToken;
    }
    async refreshAccessToken(refreshToken, deviceInfo) {
        try {
            if (!refreshToken || typeof refreshToken !== 'string') {
                throw new common_1.UnauthorizedException('Refresh token no proporcionado');
            }
            let decoded;
            try {
                decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET, {
                    algorithms: ['HS256'],
                });
            }
            catch (error) {
                if (error.name === 'TokenExpiredError') {
                    throw new common_1.UnauthorizedException('Refresh token expirado');
                }
                throw new common_1.UnauthorizedException('Refresh token inválido');
            }
            if (!decoded.tokenId || !decoded.userId || !decoded.sessionId) {
                throw new common_1.UnauthorizedException('Refresh token inválido');
            }
            const now = Date.now();
            if (this.USE_SQL_SESSIONS) {
                const sessionData = await this.getSessionByRefreshTokenDB(decoded.tokenId);
                if (!sessionData) {
                    throw new common_1.UnauthorizedException('Refresh token revocado o inválido');
                }
                if (!sessionData.IS_ACTIVE) {
                    throw new common_1.UnauthorizedException('Sesión cerrada');
                }
                const expiresAt = new Date(sessionData.EXPIRES_AT).getTime();
                if (expiresAt <= now) {
                    throw new common_1.UnauthorizedException('Sesión expirada');
                }
                const newAccessPayload = {
                    EMAIL: sessionData.USER_EMAIL,
                    ID: sessionData.USER_ID,
                    role: sessionData.USER_ROLE,
                    IDPLN: sessionData.USER_IDPLN,
                    NAME: sessionData.USER_NAME,
                    APELLIDO: sessionData.USER_APELLIDO,
                    UCRCN: sessionData.USER_UCRCN,
                    PERM: sessionData.USER_PERM ? sessionData.USER_PERM.split(',') : [],
                    sessionId: decoded.sessionId,
                    jti: uuid.v4(),
                };
                const newAccessToken = jwt.sign(newAccessPayload, this.secretKey, {
                    expiresIn: '4h',
                    algorithm: 'HS256'
                });
                return {
                    accessToken: newAccessToken,
                    refreshToken: refreshToken,
                    expiresIn: Math.floor(this.ACCESS_TOKEN_EXPIRY / 1000),
                };
            }
            else {
                const storedToken = this.refreshTokens.get(decoded.tokenId);
                if (!storedToken) {
                    throw new common_1.UnauthorizedException('Refresh token revocado o inválido');
                }
                if (storedToken.expiresAt <= now) {
                    this.refreshTokens.delete(decoded.tokenId);
                    this.writeRefreshTokensToFile();
                    throw new common_1.UnauthorizedException('Refresh token expirado');
                }
                const session = this.activeSessions.get(decoded.sessionId);
                if (!session || !this.isSessionActive(session)) {
                    this.revokeRefreshTokensBySession(decoded.sessionId);
                    throw new common_1.UnauthorizedException('Sesión expirada');
                }
                storedToken.lastUsed = now;
                this.refreshTokens.set(decoded.tokenId, storedToken);
                const newRefreshTokenId = uuid.v4();
                const newRefreshTokenExpiry = now + this.REFRESH_TOKEN_EXPIRY;
                const newRefreshPayload = {
                    tokenId: newRefreshTokenId,
                    userId: decoded.userId,
                    sessionId: decoded.sessionId,
                    jti: uuid.v4(),
                };
                const newRefreshToken = jwt.sign(newRefreshPayload, this.REFRESH_TOKEN_SECRET, {
                    expiresIn: '6h',
                    algorithm: 'HS256'
                });
                this.refreshTokens.set(newRefreshTokenId, {
                    tokenId: newRefreshTokenId,
                    userId: decoded.userId,
                    sessionId: decoded.sessionId,
                    expiresAt: newRefreshTokenExpiry,
                    createdAt: now,
                    lastUsed: now,
                    deviceInfo: deviceInfo || storedToken.deviceInfo || 'unknown',
                });
                this.refreshTokens.delete(decoded.tokenId);
                this.writeActiveSessionsToFile();
                this.writeRefreshTokensToFile();
                const newAccessPayload = {
                    EMAIL: session.userEmail,
                    ID: session.userId,
                    role: session.userRole,
                    IDPLN: session.userIdPln,
                    NAME: session.userName,
                    APELLIDO: session.userApellido,
                    UCRCN: session.userUcrcn,
                    PERM: session.userPerm,
                    sessionId: decoded.sessionId,
                    jti: uuid.v4(),
                };
                const newAccessToken = jwt.sign(newAccessPayload, this.secretKey, {
                    expiresIn: '4h',
                    algorithm: 'HS256'
                });
                return {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    expiresIn: Math.floor(this.ACCESS_TOKEN_EXPIRY / 1000),
                };
            }
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            console.error('Error refreshing access token:', error);
            throw new common_1.UnauthorizedException('Error al renovar el token');
        }
    }
    revokeRefreshTokensBySession(sessionId) {
        for (const [key, token] of this.refreshTokens.entries()) {
            if (token.sessionId === sessionId) {
                this.refreshTokens.delete(key);
            }
        }
        this.writeRefreshTokensToFile();
    }
    revokeRefreshTokensByUser(userId) {
        for (const [key, token] of this.refreshTokens.entries()) {
            if (token.userId === userId) {
                this.refreshTokens.delete(key);
            }
        }
        this.writeRefreshTokensToFile();
    }
    refreshToken(token) {
        try {
            const payload = jwt.verify(token, this.secretKey, {
                algorithms: ['HS256'],
            });
            const session = this.activeSessions.get(payload.sessionId);
            if (session && this.isSessionActive(session)) {
                const { exp, iat } = payload, payloadWithoutExp = __rest(payload, ["exp", "iat"]);
                return jwt.sign(payloadWithoutExp, this.secretKey, {
                    expiresIn: '4h',
                    algorithm: 'HS256'
                });
            }
            throw new common_1.UnauthorizedException('Sesión inválida');
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token inválido');
        }
    }
    isSessionActive(session) {
        return session && session.expiresIn > Date.now();
    }
    generateTokenSolicitud(user) {
        try {
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
                jti: uuid.v4(),
            };
            return jwt.sign(payload, this.SECRET_KEY_SOLICITUD, {
                expiresIn: '24h',
                algorithm: 'HS256'
            });
        }
        catch (error) {
            throw new common_1.BadRequestException('Error al generar token de solicitud');
        }
    }
    validateToken(token) {
        try {
            if (!token || typeof token !== 'string') {
                return false;
            }
            jwt.verify(token, this.secretKey, {
                algorithms: ['HS256'],
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    validateTokenSolicitud(token) {
        try {
            if (!token || typeof token !== 'string') {
                return false;
            }
            jwt.verify(token, this.SECRET_KEY_SOLICITUD, {
                algorithms: ['HS256'],
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    validateTokenSolicitudTime(token) {
        try {
            if (!token || typeof token !== 'string') {
                return { MESSAGE: 'Token inválido', STATUS: false };
            }
            const data = jwt.verify(token, this.secretKey, {
                algorithms: ['HS256'],
            });
            return { MESSAGE: 'Token válido', STATUS: true, DATA: data };
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                return { MESSAGE: 'Token expirado', STATUS: false };
            }
            return { MESSAGE: 'Token inválido', STATUS: false };
        }
    }
    generateTokenRecovery(user, tiempo) {
        try {
            if (!user || !user.EMAIL || !user.ID) {
                throw new common_1.BadRequestException('Datos de usuario inválidos');
            }
            if (!tiempo || tiempo < 1 || tiempo > 1440) {
                tiempo = 30;
            }
            const payload = {
                EMAIL: user.EMAIL,
                ID: user.ID,
                jti: uuid.v4(),
            };
            return jwt.sign(payload, this.secretKey, {
                expiresIn: tiempo * 60,
                algorithm: 'HS256'
            });
        }
        catch (error) {
            throw new common_1.BadRequestException('Error al generar token de recuperación');
        }
    }
    getRefreshTokenInfo(tokenId) {
        return this.refreshTokens.get(tokenId);
    }
    getUserRefreshTokens(userId) {
        const userTokens = [];
        for (const token of this.refreshTokens.values()) {
            if (token.userId === userId) {
                userTokens.push(token);
            }
        }
        return userTokens;
    }
    async createSessionDB(user, sessionId, refreshTokenId, expiresInMinutes, ipAddress, userAgent) {
        try {
            const result = await database_service_1.DatabaseService.executeStoredProcedure('JURIS.SP_CREATE_SESSION', [
                { name: 'SESSION_ID', type: sql.UniqueIdentifier, value: sessionId },
                { name: 'USER_ID', type: sql.Int, value: user.ID },
                { name: 'USER_EMAIL', type: sql.NVarChar(255), value: user.EMAIL },
                { name: 'USER_ROLE', type: sql.Int, value: user.IDROLE },
                { name: 'USER_NAME', type: sql.NVarChar(255), value: user.NOMBRES },
                { name: 'USER_APELLIDO', type: sql.NVarChar(255), value: user.APELLIDO || '' },
                { name: 'USER_IDPLN', type: sql.Int, value: user.IDPLN || 0 },
                { name: 'USER_UCRCN', type: sql.NVarChar(50), value: user.EMAIL.split('@')[0] || '' },
                { name: 'USER_PERM', type: sql.NVarChar(sql.MAX), value: user.RESTRICIONES || '' },
                { name: 'REFRESH_TOKEN_ID', type: sql.UniqueIdentifier, value: refreshTokenId },
                { name: 'EXPIRES_IN_MINUTES', type: sql.Int, value: expiresInMinutes },
                { name: 'IP_ADDRESS', type: sql.NVarChar(45), value: ipAddress || null },
                { name: 'USER_AGENT', type: sql.NVarChar(500), value: userAgent || null }
            ]);
            return sessionId;
        }
        catch (error) {
            console.error('❌ [SQL] Error creando sesión en DB:', error.message);
            return null;
        }
    }
    async getSessionDB(sessionId) {
        try {
            const result = await database_service_1.DatabaseService.executeStoredProcedure('JURIS.SP_GET_SESSION', [
                { name: 'SESSION_ID', type: sql.UniqueIdentifier, value: sessionId }
            ]);
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0];
            }
            return null;
        }
        catch (error) {
            console.error('❌ [SQL] Error obteniendo sesión:', error.message);
            return null;
        }
    }
    async getSessionByRefreshTokenDB(refreshTokenId) {
        try {
            const result = await database_service_1.DatabaseService.executeStoredProcedure('JURIS.SP_GET_SESSION_BY_REFRESH_TOKEN', [
                { name: 'REFRESH_TOKEN_ID', type: sql.UniqueIdentifier, value: refreshTokenId }
            ]);
            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0];
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    async closeSessionDB(sessionId) {
        var _a;
        try {
            console.log('🔒 Cerrando sesión en SQL Server, SESSION_ID:', sessionId);
            const result = await database_service_1.DatabaseService.executeStoredProcedure('JURIS.SP_CLOSE_SESSION', [
                { name: 'SESSION_ID', type: sql.UniqueIdentifier, value: sessionId }
            ]);
            return ((_a = result.recordset[0]) === null || _a === void 0 ? void 0 : _a.AFFECTED_ROWS) > 0;
        }
        catch (error) {
            console.error('❌ [SQL] Error cerrando sesión:', error.message);
            return false;
        }
    }
    async closeAllUserSessionsDB(userId) {
        var _a;
        try {
            const result = await database_service_1.DatabaseService.executeStoredProcedure('JURIS.SP_CLOSE_ALL_USER_SESSIONS', [
                { name: 'USER_ID', type: sql.Int, value: userId }
            ]);
            return ((_a = result.recordset[0]) === null || _a === void 0 ? void 0 : _a.AFFECTED_ROWS) || 0;
        }
        catch (error) {
            return 0;
        }
    }
    async getUserActiveSessionsDB(userId) {
        try {
            const result = await database_service_1.DatabaseService.executeStoredProcedure('JURIS.SP_GET_USER_ACTIVE_SESSIONS', [
                { name: 'USER_ID', type: sql.Int, value: userId }
            ]);
            return result.recordset || [];
        }
        catch (error) {
            return [];
        }
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TokenService);
//# sourceMappingURL=token.service.js.map