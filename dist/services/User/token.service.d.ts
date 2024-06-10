import { User } from '../../models/Admin/user.model';
import { SolicitudModel } from 'src/models/public/Solicitud.model';
export declare class TokenService {
    private readonly secretKey;
    private readonly SECRET_KEY_SOLICITUD;
    generateToken(user: User): string;
    generateTokenSolicitud(user: SolicitudModel): string;
    validateToken(token: string): boolean;
    validateTokenSolicitud(token: string): boolean;
}
