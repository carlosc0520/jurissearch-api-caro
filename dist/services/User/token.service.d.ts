import { User } from '../../models/Admin/user.model';
import { SolicitudModel } from 'src/models/Public/Solicitud.model';
interface Session {
    sessionId: string;
    expiresIn: number;
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
export declare class TokenService {
    private readonly secretKey;
    private readonly SECRET_KEY_SOLICITUD;
    private readonly REFRESH_TOKEN_SECRET;
    private activeSessions;
    private refreshTokens;
    private readonly USE_SQL_SESSIONS;
    private readonly ACCESS_TOKEN_EXPIRY;
    private readonly REFRESH_TOKEN_EXPIRY;
    constructor();
    private testSQLConnection;
    readActiveSessionsFromFile(): Map<string, Session>;
    private readRefreshTokensFromFile;
    private writeRefreshTokensToFile;
    private cleanupExpiredTokens;
    removeSession(token: string): Promise<void>;
    private writeActiveSessionsToFile;
    generateTokens(user: User, bandera?: boolean, deviceInfo?: string, ipAddress?: string, userAgent?: string): Promise<TokenPair>;
    generateToken(user: User, bandera?: boolean): Promise<string>;
    refreshAccessToken(refreshToken: string, deviceInfo?: string): Promise<TokenPair>;
    private revokeRefreshTokensBySession;
    revokeRefreshTokensByUser(userId: number): void;
    refreshToken(token: string): string;
    private isSessionActive;
    generateTokenSolicitud(user: SolicitudModel): string;
    validateToken(token: string): boolean;
    validateTokenSolicitud(token: string): boolean;
    validateTokenSolicitudTime(token: string): any;
    generateTokenRecovery(user: User, tiempo: number): string;
    getRefreshTokenInfo(tokenId: string): RefreshTokenData | undefined;
    getUserRefreshTokens(userId: number): RefreshTokenData[];
    createSessionDB(user: User, sessionId: string, refreshTokenId: string, expiresInMinutes: number, ipAddress?: string, userAgent?: string): Promise<string>;
    getSessionDB(sessionId: string): Promise<SessionDataSQL | null>;
    getSessionByRefreshTokenDB(refreshTokenId: string): Promise<SessionDataSQL | null>;
    closeSessionDB(sessionId: string): Promise<boolean>;
    closeAllUserSessionsDB(userId: number): Promise<number>;
    getUserActiveSessionsDB(userId: number): Promise<any[]>;
}
export {};
