// token.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from '../../models/Admin/user.model';
import { SolicitudModel } from 'src/models/Public/Solicitud.model';
import * as uuid from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { DatabaseService } from '../database.service';
import * as sql from 'mssql';

interface Session {
    sessionId: string;
    expiresIn: number;
    // Datos del usuario para reconstruir el access token durante refresh
    userEmail: string;
    userId: number;
    userRole: number;
    userName: string;
    userApellido?: string;
    userIdPln?: string;
    userUcrcn: string;
    userPerm: string[];
}

interface RefreshTokenData {
    tokenId: string;
    userId: number;
    sessionId: string;
    expiresAt: number;
    createdAt: number;
    lastUsed: number;
    deviceInfo?: string;
}

interface SessionDataSQL {
    SESSION_ID: string;
    USER_ID: number;
    USER_EMAIL: string;
    USER_ROLE: number;
    USER_NAME: string;
    USER_APELLIDO: string;
    USER_IDPLN: number;
    USER_UCRCN: string;
    USER_PERM: string;
    REFRESH_TOKEN_ID: string;
    EXPIRES_AT: Date;
    CREATED_AT: Date;
    LAST_ACCESSED_AT: Date;
    IP_ADDRESS?: string;
    USER_AGENT?: string;
    IS_ACTIVE: boolean;
}

interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

const SESSIONS_FILE_PATH = path.join(__dirname, 'active-sessions.json');
const REFRESH_TOKENS_FILE_PATH = path.join(__dirname, 'refresh-tokens.json');


@Injectable()
export class TokenService {
    private readonly secretKey = process.env.SECRET_KEY;
    private readonly SECRET_KEY_SOLICITUD = process.env.SECRET_KEY_SOLICITUD;
    private readonly REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.SECRET_KEY;
    private activeSessions: Map<string, Session>;
    private refreshTokens: Map<string, RefreshTokenData>;

    // Flag para habilitar SQL Server Sessions
    private readonly USE_SQL_SESSIONS = process.env.USE_SQL_SESSIONS !== 'false'; // true por defecto

    // Configuración de tiempos (en milisegundos)
    private readonly ACCESS_TOKEN_EXPIRY = 4 * 60 * 60 * 1000; // 4 horas
    private readonly REFRESH_TOKEN_EXPIRY = 6 * 60 * 60 * 1000; // 6 horas

    constructor() {
        // Validar que SECRET_KEY esté configurada
        if (!this.secretKey || this.secretKey.length < 32) {
            throw new Error('SECRET_KEY no configurada o demasiado corta (mínimo 32 caracteres)');
        }

        if (!this.REFRESH_TOKEN_SECRET || this.REFRESH_TOKEN_SECRET.length < 32) {
            throw new Error('REFRESH_TOKEN_SECRET no configurada o demasiado corta (mínimo 32 caracteres)');
        }

        // *** MODO SQL: NO cargar archivos ***
        if (this.USE_SQL_SESSIONS) {
            // Inicializar Maps vacíos (no se usarán)
            this.activeSessions = new Map();
            this.refreshTokens = new Map();

            // Probar conexión a SQL Server (no bloqueante, fire and forget)
            this.testSQLConnection().catch(() => { });
        }
        // *** MODO ARCHIVOS: cargar desde JSON files ***
        else {
            this.activeSessions = this.readActiveSessionsFromFile();
            this.refreshTokens = this.readRefreshTokensFromFile();

            // Limpiar tokens expirados al iniciar
            this.cleanupExpiredTokens();

        }
    }

    private async testSQLConnection(): Promise<void> {
        try {
            await DatabaseService.testConnection();
        } catch (error) {
            // Silencioso - fallback a JSON
        }
    }

    readActiveSessionsFromFile(): Map<string, Session> {
        try {
            if (!fs.existsSync(SESSIONS_FILE_PATH)) {
                return new Map<string, Session>();
            }

            const sessionsData = fs.readFileSync(SESSIONS_FILE_PATH, 'utf8');
            if (!sessionsData || sessionsData.trim() === '') {
                return new Map<string, Session>();
            }

            const sessions: Session[] = JSON.parse(sessionsData);
            const activeSessions = new Map<string, Session>();

            sessions.forEach(session => {
                if (session.expiresIn > Date.now()) {
                    activeSessions.set(session.sessionId, session);
                }
            });

            return activeSessions;
        } catch (error) {
            console.error('Error reading active sessions:', error);
            return new Map<string, Session>();
        }
    }

    private readRefreshTokensFromFile(): Map<string, RefreshTokenData> {
        try {
            if (!fs.existsSync(REFRESH_TOKENS_FILE_PATH)) {
                return new Map<string, RefreshTokenData>();
            }

            const tokensData = fs.readFileSync(REFRESH_TOKENS_FILE_PATH, 'utf8');
            if (!tokensData || tokensData.trim() === '') {
                return new Map<string, RefreshTokenData>();
            }

            const tokens: RefreshTokenData[] = JSON.parse(tokensData);
            const activeTokens = new Map<string, RefreshTokenData>();

            tokens.forEach(token => {
                if (token.expiresAt > Date.now()) {
                    activeTokens.set(token.tokenId, token);
                }
            });

            return activeTokens;
        } catch (error) {
            console.error('Error reading refresh tokens:', error);
            return new Map<string, RefreshTokenData>();
        }
    }

    private writeRefreshTokensToFile(): void {
        try {
            const tokensArray: RefreshTokenData[] = Array.from(this.refreshTokens.values());
            const tokensData = JSON.stringify(tokensArray, null, 2);
            fs.writeFileSync(REFRESH_TOKENS_FILE_PATH, tokensData, 'utf8');
        } catch (error) {
            console.error('Error writing refresh tokens:', error);
        }
    }

    private cleanupExpiredTokens(): void {
        const now = Date.now();

        // Limpiar sesiones expiradas
        for (const [key, session] of this.activeSessions.entries()) {
            if (session.expiresIn <= now) {
                this.activeSessions.delete(key);
            }
        }

        // Limpiar refresh tokens expirados
        for (const [key, token] of this.refreshTokens.entries()) {
            if (token.expiresAt <= now) {
                this.refreshTokens.delete(key);
            }
        }

        this.writeActiveSessionsToFile();
        this.writeRefreshTokensToFile();
    }

    async removeSession(token: string) {
        try {
            const payload: any = jwt.decode(token);
            if (!payload || !payload.sessionId) {
                return;
            }

            // *** MODO SQL: usar SOLO base de datos ***
            if (this.USE_SQL_SESSIONS) {
                try {
                    await this.closeSessionDB(payload.sessionId);
                } catch (sqlError) {
                    console.error('[SQL] Error al cerrar sesión:', sqlError.message);
                }
            }
            // *** MODO ARCHIVOS: usar SOLO JSON files ***
            else {
                // Actualizar sistema de archivos
                this.activeSessions = await this.readActiveSessionsFromFile();
                this.activeSessions.delete(payload.sessionId);

                // Revocar todos los refresh tokens de esta sesión
                for (const [key, refreshToken] of this.refreshTokens.entries()) {
                    if (refreshToken.sessionId === payload.sessionId) {
                        this.refreshTokens.delete(key);
                    }
                }

                this.writeActiveSessionsToFile();
                this.writeRefreshTokensToFile();
            }
        } catch (error) {
            console.error('Error removing session:', error);
        }
    }

    private writeActiveSessionsToFile(): void {
        try {
            const sessionsArray: Session[] = Array.from(this.activeSessions.values());
            const sessionsData = JSON.stringify(sessionsArray, null, 2);
            fs.writeFileSync(SESSIONS_FILE_PATH, sessionsData, 'utf8');
        } catch (error) {
            console.error('Error writing active sessions:', error);
        }
    }

    // Nuevo método principal: Genera access token + refresh token
    async generateTokens(
        user: User,
        bandera: boolean = false,
        deviceInfo?: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<TokenPair> {
        try {
            // Validar campos requeridos del usuario
            if (!user || !user.ID || !user.EMAIL) {
                throw new BadRequestException({
                    MESSAGE: 'Datos de usuario inválidos',
                    STATUS: false,
                });
            }

            const sessionId = uuid.v4();
            const now = Date.now();
            const accessTokenExpiry = now + this.ACCESS_TOKEN_EXPIRY;
            const refreshTokenExpiry = now + this.REFRESH_TOKEN_EXPIRY;
            const refreshTokenId = uuid.v4();

            // Payload del access token
            const accessPayload = {
                EMAIL: user.EMAIL,
                ID: user.ID,
                role: user.IDROLE,
                IDPLN: user.IDPLN || 0,
                NAME: user.NOMBRES,
                APELLIDO: user.APELLIDO,
                UCRCN: user.EMAIL.split('@')[0] || '',
                PERM: user?.RESTRICIONES ? user.RESTRICIONES.split(',') : [],
                sessionId: sessionId,
                jti: uuid.v4(), // JWT ID único
            };

            // Payload del refresh token (más ligero)
            const refreshPayload = {
                tokenId: refreshTokenId,
                userId: user.ID,
                sessionId: sessionId,
                jti: uuid.v4(),
            };

            // Generar tokens con algoritmo específico
            const accessToken = jwt.sign(accessPayload, this.secretKey, {
                expiresIn: '4h', // 4 horas
                algorithm: 'HS256'
            });

            const refreshToken = jwt.sign(refreshPayload, this.REFRESH_TOKEN_SECRET, {
                expiresIn: '6h', // 6 horas
                algorithm: 'HS256'
            });

            // *** MODO SQL: usar SOLO base de datos ***
            if (this.USE_SQL_SESSIONS) {
                try {
                    // Verificar sesión activa en SQL (solo si bandera=false)
                    if (!bandera) {
                        const activeSessions = await this.getUserActiveSessionsDB(user.ID);
                        if (activeSessions && activeSessions.length > 0) {
                            throw new BadRequestException({
                                MESSAGE: 'No puede iniciar sesión porque ya tiene otra sesión activa.',
                                STATUS: false,
                                OPTION: 1
                            });
                        }
                    } else {
                        // Si bandera=true, cerrar todas las sesiones anteriores
                        const closedCount = await this.closeAllUserSessionsDB(user.ID);
                    }

                    // Crear sesión en SQL Server
                    const sqlResult = await this.createSessionDB(
                        user,
                        sessionId,  // ✅ Enviar el sessionId generado arriba
                        refreshTokenId,
                        Math.floor(this.REFRESH_TOKEN_EXPIRY / (60 * 1000)), // minutos
                        ipAddress || null,
                        userAgent || deviceInfo || null
                    );

                    if (!sqlResult) {
                        throw new Error('No se pudo crear la sesión en SQL Server');
                    }
                } catch (sqlError) {
                    // Si es BadRequestException (ej: OPTION: 1), re-lanzarlo tal cual
                    if (sqlError instanceof BadRequestException) {
                        throw sqlError;
                    }

                    console.error('[SQL] Error al crear sesión en BD:', sqlError.message);
                    throw new BadRequestException({
                        MESSAGE: 'Error al crear sesión en base de datos',
                        STATUS: false,
                    });
                }
            }
            // *** MODO ARCHIVOS: usar SOLO JSON files ***
            else {
                // Verificar sesión activa en memoria
                if (this.activeSessions.has(user.ID.toString())) {
                    const session = this.activeSessions.get(user.ID.toString());
                    if (this.isSessionActive(session) && !bandera) {
                        throw new BadRequestException({
                            MESSAGE: 'No puede iniciar sesión porque ya tiene otra sesión activa.',
                            STATUS: false,
                            OPTION: 1
                        });
                    }

                    // Eliminar sesión anterior y sus refresh tokens
                    this.activeSessions.delete(user.ID.toString());
                    for (const [key, token] of this.refreshTokens.entries()) {
                        if (token.userId === user.ID) {
                            this.refreshTokens.delete(key);
                        }
                    }
                }

                // Guardar sesión con el tiempo de expiración del REFRESH TOKEN y datos del usuario
                this.activeSessions.set(sessionId, {
                    sessionId: sessionId,
                    expiresIn: refreshTokenExpiry,  // Usa refresh token expiry, no access token
                    // Datos del usuario para reconstruir access token en refresh
                    userEmail: user.EMAIL,
                    userId: user.ID,
                    userRole: user.IDROLE,
                    userName: user.NOMBRES,
                    userApellido: user.APELLIDO,
                    userIdPln: String(user.IDPLN || 0),
                    userUcrcn: user.EMAIL.split('@')[0] || '',
                    userPerm: user?.RESTRICIONES ? user.RESTRICIONES.split(',') : [],
                });

                // Guardar refresh token con metadata
                this.refreshTokens.set(refreshTokenId, {
                    tokenId: refreshTokenId,
                    userId: user.ID,
                    sessionId: sessionId,
                    expiresAt: refreshTokenExpiry,
                    createdAt: now,
                    lastUsed: now,
                    deviceInfo: deviceInfo || 'unknown',
                });

                // Guardar en archivo JSON
                this.writeActiveSessionsToFile();
                this.writeRefreshTokensToFile();
            }

            return {
                accessToken,
                refreshToken,
                expiresIn: Math.floor(this.ACCESS_TOKEN_EXPIRY / 1000), // en segundos
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException({
                MESSAGE: 'Error al generar tokens',
                STATUS: false,
            });
        }
    }

    // Método legacy (mantener compatibilidad temporal)
    async generateToken(user: User, bandera: boolean = false): Promise<string> {
        const tokens = await this.generateTokens(user, bandera);
        return tokens.accessToken;
    }

    // Nuevo método: Renovar access token usando refresh token
    async refreshAccessToken(refreshToken: string, deviceInfo?: string): Promise<TokenPair> {
        try {
            // Validar que el refresh token exista
            if (!refreshToken || typeof refreshToken !== 'string') {
                throw new UnauthorizedException('Refresh token no proporcionado');
            }

            // Verificar y decodificar el refresh token
            let decoded: any;
            try {
                decoded = jwt.verify(refreshToken, this.REFRESH_TOKEN_SECRET, {
                    algorithms: ['HS256'],
                });
            } catch (error) {
                if (error.name === 'TokenExpiredError') {
                    throw new UnauthorizedException('Refresh token expirado');
                }
                throw new UnauthorizedException('Refresh token inválido');
            }

            // Validar estructura del payload
            if (!decoded.tokenId || !decoded.userId || !decoded.sessionId) {
                throw new UnauthorizedException('Refresh token inválido');
            }

            const now = Date.now();

            // *** MODO SQL: usar SOLO base de datos ***
            if (this.USE_SQL_SESSIONS) {
                // Obtener sesión de SQL Server
                const sessionData = await this.getSessionByRefreshTokenDB(decoded.tokenId);

                if (!sessionData) {
                    throw new UnauthorizedException('Refresh token revocado o inválido');
                }

                // Verificar que la sesión esté activa
                if (!sessionData.IS_ACTIVE) {
                    throw new UnauthorizedException('Sesión cerrada');
                }

                // Verificar expiración
                const expiresAt = new Date(sessionData.EXPIRES_AT).getTime();
                if (expiresAt <= now) {
                    throw new UnauthorizedException('Sesión expirada');
                }

                // Generar nuevo access token con payload completo usando datos de SQL
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
                    expiresIn: '4h', // 4 horas
                    algorithm: 'HS256'
                });

                // Por ahora, NO hacemos rotación de refresh token en SQL
                // Simplemente retornamos el mismo refresh token
                // TODO: Implementar rotación de refresh token en SQL si es necesario
                return {
                    accessToken: newAccessToken,
                    refreshToken: refreshToken, // Mismo refresh token
                    expiresIn: Math.floor(this.ACCESS_TOKEN_EXPIRY / 1000),
                };
            }
            // *** MODO ARCHIVOS: usar SOLO JSON files ***
            else {
                // Verificar que el refresh token esté en nuestra base de datos
                const storedToken = this.refreshTokens.get(decoded.tokenId);
                if (!storedToken) {
                    throw new UnauthorizedException('Refresh token revocado o inválido');
                }

                // Verificar que no haya expirado según nuestro registro
                if (storedToken.expiresAt <= now) {
                    this.refreshTokens.delete(decoded.tokenId);
                    this.writeRefreshTokensToFile();
                    throw new UnauthorizedException('Refresh token expirado');
                }

                // Verificar que la sesión siga activa
                const session = this.activeSessions.get(decoded.sessionId);
                if (!session || !this.isSessionActive(session)) {
                    // Revocar todos los refresh tokens de esta sesión
                    this.revokeRefreshTokensBySession(decoded.sessionId);
                    throw new UnauthorizedException('Sesión expirada');
                }

                // Actualizar el lastUsed del refresh token
                storedToken.lastUsed = now;
                this.refreshTokens.set(decoded.tokenId, storedToken);

                // ROTACIÓN DE REFRESH TOKEN: Generar nuevo refresh token
                const newRefreshTokenId = uuid.v4();
                const newRefreshTokenExpiry = now + this.REFRESH_TOKEN_EXPIRY;

                const newRefreshPayload = {
                    tokenId: newRefreshTokenId,
                    userId: decoded.userId,
                    sessionId: decoded.sessionId,
                    jti: uuid.v4(),
                };

                const newRefreshToken = jwt.sign(newRefreshPayload, this.REFRESH_TOKEN_SECRET, {
                    expiresIn: '6h', // 6 horas
                    algorithm: 'HS256'
                });

                // Guardar nuevo refresh token
                this.refreshTokens.set(newRefreshTokenId, {
                    tokenId: newRefreshTokenId,
                    userId: decoded.userId,
                    sessionId: decoded.sessionId,
                    expiresAt: newRefreshTokenExpiry,
                    createdAt: now,
                    lastUsed: now,
                    deviceInfo: deviceInfo || storedToken.deviceInfo || 'unknown',
                });

                // Revocar el refresh token anterior (rotación)
                this.refreshTokens.delete(decoded.tokenId);

                // Guardar cambios
                this.writeActiveSessionsToFile();
                this.writeRefreshTokensToFile();

                // Generar nuevo access token con payload completo usando datos de la sesión
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
                    expiresIn: '4h', // 4 horas
                    algorithm: 'HS256'
                });

                return {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    expiresIn: Math.floor(this.ACCESS_TOKEN_EXPIRY / 1000),
                };
            }
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            console.error('Error refreshing access token:', error);
            throw new UnauthorizedException('Error al renovar el token');
        }
    }

    // Método para revocar refresh tokens por sesión
    private revokeRefreshTokensBySession(sessionId: string): void {
        for (const [key, token] of this.refreshTokens.entries()) {
            if (token.sessionId === sessionId) {
                this.refreshTokens.delete(key);
            }
        }
        this.writeRefreshTokensToFile();
    }

    // Método para revocar refresh tokens por usuario
    revokeRefreshTokensByUser(userId: number): void {
        for (const [key, token] of this.refreshTokens.entries()) {
            if (token.userId === userId) {
                this.refreshTokens.delete(key);
            }
        }
        this.writeRefreshTokensToFile();
    }

    // Método legacy mejorado (mantener compatibilidad)
    refreshToken(token: string): string {
        try {
            const payload: any = jwt.verify(token, this.secretKey, {
                algorithms: ['HS256'],
            });

            const session = this.activeSessions.get(payload.sessionId);

            if (session && this.isSessionActive(session)) {
                // NO actualizar el tiempo de expiración de la sesión
                // La sesión ya tiene el tiempo correcto basado en el refresh token

                // Solo generar un nuevo access token
                const { exp, iat, ...payloadWithoutExp } = payload;
                return jwt.sign(payloadWithoutExp, this.secretKey, {
                    expiresIn: '4h', // 4 horas
                    algorithm: 'HS256'
                });
            }

            throw new UnauthorizedException('Sesión inválida');
        } catch (error) {
            throw new UnauthorizedException('Token inválido');
        }
    }

    private isSessionActive(session: Session): boolean {
        return session && session.expiresIn > Date.now();
    }

    generateTokenSolicitud(user: SolicitudModel): string {
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
        } catch (error) {
            throw new BadRequestException('Error al generar token de solicitud');
        }
    }

    validateToken(token: string): boolean {
        try {
            if (!token || typeof token !== 'string') {
                return false;
            }
            jwt.verify(token, this.secretKey, {
                algorithms: ['HS256'],
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    validateTokenSolicitud(token: string): boolean {
        try {
            if (!token || typeof token !== 'string') {
                return false;
            }
            jwt.verify(token, this.SECRET_KEY_SOLICITUD, {
                algorithms: ['HS256'],
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    validateTokenSolicitudTime(token: string): any {
        try {
            if (!token || typeof token !== 'string') {
                return { MESSAGE: 'Token inválido', STATUS: false };
            }

            const data = jwt.verify(token, this.secretKey, {
                algorithms: ['HS256'],
            });
            return { MESSAGE: 'Token válido', STATUS: true, DATA: data };
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return { MESSAGE: 'Token expirado', STATUS: false };
            }
            return { MESSAGE: 'Token inválido', STATUS: false };
        }
    }

    generateTokenRecovery(user: User, tiempo: number): string {
        try {
            if (!user || !user.EMAIL || !user.ID) {
                throw new BadRequestException('Datos de usuario inválidos');
            }

            if (!tiempo || tiempo < 1 || tiempo > 1440) { // máximo 24 horas
                tiempo = 30; // default 30 minutos
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
        } catch (error) {
            throw new BadRequestException('Error al generar token de recuperación');
        }
    }

    // Método para obtener información de un refresh token
    getRefreshTokenInfo(tokenId: string): RefreshTokenData | undefined {
        return this.refreshTokens.get(tokenId);
    }

    // Método para listar todos los refresh tokens activos de un usuario
    getUserRefreshTokens(userId: number): RefreshTokenData[] {
        const userTokens: RefreshTokenData[] = [];
        for (const token of this.refreshTokens.values()) {
            if (token.userId === userId) {
                userTokens.push(token);
            }
        }
        return userTokens;
    }

    // ============================================
    // MÉTODOS PARA SQL SERVER SESSION MANAGEMENT
    // ============================================

    /**
     * CREAR SESIÓN EN SQL SERVER
     * Reemplaza la escritura en archivo JSON
     */
    async createSessionDB(
        user: User,
        sessionId: string,  // ✅ NUEVO: recibe sessionId generado en generateTokens()
        refreshTokenId: string,
        expiresInMinutes: number,
        ipAddress?: string,
        userAgent?: string
    ): Promise<string> {
        try {
            const result = await DatabaseService.executeStoredProcedure(
                'JURIS.SP_CREATE_SESSION',
                [
                    { name: 'SESSION_ID', type: sql.UniqueIdentifier, value: sessionId },  // ✅ NUEVO: enviar sessionId
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
                ]
                // ❌ ELIMINAR parámetros OUTPUT - ya no se necesitan
            );

            return sessionId;
        } catch (error) {
            console.error('❌ [SQL] Error creando sesión en DB:', error.message);
            return null;
        }
    }

    /**
     * OBTENER SESIÓN POR SESSION_ID
     */
    async getSessionDB(sessionId: string): Promise<SessionDataSQL | null> {
        try {
            const result = await DatabaseService.executeStoredProcedure(
                'JURIS.SP_GET_SESSION',
                [
                    { name: 'SESSION_ID', type: sql.UniqueIdentifier, value: sessionId }
                ]
            );

            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0];
            }

            return null;
        } catch (error) {
            console.error('❌ [SQL] Error obteniendo sesión:', error.message);
            return null;
        }
    }

    /**
     * OBTENER SESIÓN POR REFRESH_TOKEN_ID
     */
    async getSessionByRefreshTokenDB(refreshTokenId: string): Promise<SessionDataSQL | null> {
        try {
            const result = await DatabaseService.executeStoredProcedure(
                'JURIS.SP_GET_SESSION_BY_REFRESH_TOKEN',
                [
                    { name: 'REFRESH_TOKEN_ID', type: sql.UniqueIdentifier, value: refreshTokenId }
                ]
            );

            if (result.recordset && result.recordset.length > 0) {
                return result.recordset[0];
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * CERRAR SESIÓN
     */
    async closeSessionDB(sessionId: string): Promise<boolean> {
        try {
            const result = await DatabaseService.executeStoredProcedure(
                'JURIS.SP_CLOSE_SESSION',
                [
                    { name: 'SESSION_ID', type: sql.UniqueIdentifier, value: sessionId }
                ]
            );

            return result.recordset[0]?.AFFECTED_ROWS > 0;
        } catch (error) {
            console.error('❌ [SQL] Error cerrando sesión:', error.message);
            return false;
        }
    }

    /**
     * CERRAR TODAS LAS SESIONES DE UN USUARIO
     */
    async closeAllUserSessionsDB(userId: number): Promise<number> {
        try {
            const result = await DatabaseService.executeStoredProcedure(
                'JURIS.SP_CLOSE_ALL_USER_SESSIONS',
                [
                    { name: 'USER_ID', type: sql.Int, value: userId }
                ]
            );

            return result.recordset[0]?.AFFECTED_ROWS || 0;
        } catch (error) {
            return 0;
        }
    }

    /**
     * OBTENER SESIONES ACTIVAS DE UN USUARIO
     */
    async getUserActiveSessionsDB(userId: number): Promise<any[]> {
        try {
            const result = await DatabaseService.executeStoredProcedure(
                'JURIS.SP_GET_USER_ACTIVE_SESSIONS',
                [
                    { name: 'USER_ID', type: sql.Int, value: userId }
                ]
            );

            return result.recordset || [];
        } catch (error) {
            return [];
        }
    }
}
