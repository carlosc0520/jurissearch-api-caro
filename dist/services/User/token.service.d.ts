import { User } from '../../models/Admin/user.model';
import { SolicitudModel } from 'src/models/public/Solicitud.model';
interface Session {
    sessionId: string;
    expiresIn: number;
}
export declare class TokenService {
    private readonly secretKey;
    private readonly SECRET_KEY_SOLICITUD;
    private activeSessions;
    constructor();
    readActiveSessionsFromFile(): Map<string, Session>;
    removeSession(token: string): Promise<void>;
    private writeActiveSessionsToFile;
    generateToken(user: User, bandera?: boolean): string;
    refreshToken(token: string): string;
    private isSessionActive;
    generateTokenSolicitud(user: SolicitudModel): string;
    validateToken(token: string): boolean;
    validateTokenSolicitud(token: string): boolean;
    validateTokenSolicitudTime(token: string): any;
    generateTokenRecovery(user: User, tiempo: number): string;
}
export {};
