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
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt = __importStar(require("jsonwebtoken"));
const uuid = __importStar(require("uuid"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const SESSIONS_FILE_PATH = path.join(__dirname, 'active-sessions.json');
let TokenService = class TokenService {
    constructor() {
        this.secretKey = process.env.SECRET_KEY;
        this.SECRET_KEY_SOLICITUD = process.env.SECRET_KEY_SOLICITUD;
        this.activeSessions = this.readActiveSessionsFromFile();
    }
    readActiveSessionsFromFile() {
        try {
            const sessionsData = fs.readFileSync(SESSIONS_FILE_PATH, 'utf8');
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
            return new Map();
        }
    }
    async removeSession(token) {
        const payload = jwt.decode(token);
        this.activeSessions = await this.readActiveSessionsFromFile();
        this.activeSessions.delete(payload.sessionId);
        this.writeActiveSessionsToFile();
    }
    writeActiveSessionsToFile() {
        const sessionsArray = Array.from(this.activeSessions.values());
        const sessionsData = JSON.stringify(sessionsArray, null, 2);
        fs.writeFileSync(SESSIONS_FILE_PATH, sessionsData, 'utf8');
    }
    generateToken(user, bandera = false) {
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
        }
        const sessionId = uuid.v4();
        const expiresIn = Date.now() + (60 * 60 * 1000);
        const payload = {
            EMAIL: user.EMAIL,
            ID: user.ID,
            role: user.IDROLE,
            NAME: user.NOMBRES,
            APELLIDO: user.APELLIDO,
            UCRCN: user.EMAIL.split('@')[0] || '',
            PERM: (user === null || user === void 0 ? void 0 : user.RESTRICIONES) ? user.RESTRICIONES.split(',') : [],
            sessionId: sessionId,
        };
        this.activeSessions.set(user.ID.toString(), { sessionId: sessionId, expiresIn: expiresIn });
        this.writeActiveSessionsToFile();
        return jwt.sign(payload, this.secretKey, { expiresIn: '1h' });
    }
    isSessionActive(session) {
        return session && session.expiresIn > Date.now();
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
    validateTokenSolicitudTime(token) {
        try {
            const data = jwt.verify(token, this.secretKey);
            return { MESSAGE: 'Token valido', STATUS: true, DATA: data };
        }
        catch (error) {
            if (error.message === 'jwt expired') {
                return { MESSAGE: 'Token expirado', STATUS: false };
            }
        }
    }
    generateTokenRecovery(user, tiempo) {
        const payload = {
            EMAIL: user.EMAIL,
            ID: user.ID,
        };
        return jwt.sign(payload, this.secretKey, { expiresIn: tiempo * 60 });
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TokenService);
//# sourceMappingURL=token.service.js.map