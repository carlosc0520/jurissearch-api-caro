// token.service.ts
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from '../../models/Admin/user.model';
import { SolicitudModel } from 'src/models/public/Solicitud.model';

@Injectable()
export class TokenService {
    private readonly secretKey = process.env.SECRET_KEY;
    private readonly SECRET_KEY_SOLICITUD = process.env.SECRET_KEY_SOLICITUD;

    generateToken(user: User): string {
        const payload = {
            EMAIL: user.EMAIL,
            ID: user.ID,
            role: user.IDROLE,
            NAME: user.NOMBRES,
            APELLIDO: user.APELLIDO,
            UCRCN: user.EMAIL.split('@')[0] || "",
            PERM: user?.RESTRICIONES ? user.RESTRICIONES?.split(',') : [],
        };
        return jwt.sign(payload, this.secretKey);
    }

    generateTokenSolicitud(user: SolicitudModel): string {
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

    validateToken(token: string): boolean {
        try {
            jwt.verify(token, this.secretKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    validateTokenSolicitud(token: string): boolean {
        try {
            jwt.verify(token, this.SECRET_KEY_SOLICITUD);
            return true;
        } catch (error) {
            return false;
        }
    }

    validateTokenSolicitudTime(token: string): any {
        try {
            const data = jwt.verify(token, this.secretKey);
            return { MESSAGE: 'Token valido', STATUS: true, DATA: data };
        } catch (error) {
            if (error.message === 'jwt expired') {
                return { MESSAGE: 'Token expirado', STATUS: false };
            }
        }
    }


    generateTokenRecovery(user: User, tiempo: number): string {
        const payload = {
            EMAIL: user.EMAIL,
            ID: user.ID,
        }

        return jwt.sign(payload, this.secretKey, { expiresIn: tiempo * 60 });
    }
}
