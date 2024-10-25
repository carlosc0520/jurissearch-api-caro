// token.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from '../../models/Admin/user.model';
import { SolicitudModel } from 'src/models/public/Solicitud.model';
import * as uuid from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

interface Session {
    sessionId: string;
    expiresIn: number;
}

const SESSIONS_FILE_PATH = path.join(__dirname, 'active-sessions.json');


@Injectable()
export class TokenService {
    private readonly secretKey = process.env.SECRET_KEY;
    private readonly SECRET_KEY_SOLICITUD = process.env.SECRET_KEY_SOLICITUD;
    private activeSessions: Map<string, Session>;

    constructor() {
        this.activeSessions = this.readActiveSessionsFromFile();
    }

    readActiveSessionsFromFile(): Map<string, Session> {
        try {
            const sessionsData = fs.readFileSync(SESSIONS_FILE_PATH, 'utf8');
            const sessions: Session[] = JSON.parse(sessionsData);
            const activeSessions = new Map<string, Session>();
            
            sessions.forEach(session => {
                if (session.expiresIn > Date.now()) {
                    activeSessions.set(session.sessionId, session);
                }
            });

            return activeSessions;
        } catch (error) {
            return new Map<string, Session>();
        }
    }

    async removeSession(token: string) {
        const payload: any = jwt.decode(token);
        this.activeSessions = await this.readActiveSessionsFromFile();
        this.activeSessions.delete(payload?.sessionId || '');
        this.writeActiveSessionsToFile();
    }

    private writeActiveSessionsToFile(): void {
        const sessionsArray: Session[] = Array.from(this.activeSessions.values());
        const sessionsData = JSON.stringify(sessionsArray, null, 2);
        fs.writeFileSync(SESSIONS_FILE_PATH, sessionsData, 'utf8');
    }

    generateToken(user: User, bandera: boolean = false): string {
        if (this.activeSessions.has(user.ID.toString())) {
            const session = this.activeSessions.get(user.ID.toString());
            if (this.isSessionActive(session) && !bandera) {
                throw new BadRequestException({
                    MESSAGE: 'No puede iniciar sesión porque ya tiene otra sesión activa.',
                    STATUS: false,
                    OPTION: 1
                });
            } 
            
            this.activeSessions.delete(user.ID.toString());
        }

        const sessionId = uuid.v4(); // Generar un UUID único para la sesió
        // const expiresIn = Date.now() + (60 * 180 * 2 * 1000);
        const expiresIn = Date.now() + (60 * 60 * 2 * 1000);
        const payload = {
            EMAIL: user.EMAIL,
            ID: user.ID,
            role: user.IDROLE,
            NAME: user.NOMBRES,
            APELLIDO: user.APELLIDO,
            UCRCN: user.EMAIL.split('@')[0] || '',
            PERM: user?.RESTRICIONES ? user.RESTRICIONES.split(',') : [],
            sessionId: sessionId,
        };

        // Guardar el ID de sesión y tiempo de expiración en el mapa de sesiones activas
        this.activeSessions.set(user.ID.toString(), { sessionId: sessionId, expiresIn: expiresIn });
        this.writeActiveSessionsToFile(); // Actualizar archivo después de agregar la nueva sesión

        return jwt.sign(payload, this.secretKey, { expiresIn: '1h' });
    }

    private isSessionActive(session: Session): boolean {
        return session && session.expiresIn > Date.now();
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
