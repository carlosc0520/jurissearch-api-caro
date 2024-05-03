// token.service.ts
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from '../../models/Admin/user.model';

@Injectable()
export class TokenService {
    private readonly secretKey = '123456789'; // Cambia esto por tu propia clave secreta

    generateToken(user: User): string {
        const payload = { 
            EMAIL: user.EMAIL, 
            ID: user.ID,
            role: 1,
            NAME: user.NOMBRES,
            APELLIDO: user.APELLIDO
         }; // Puedes agregar más datos al payload si lo deseas
        return jwt.sign(payload, this.secretKey);
    }

    validateToken(token: string): boolean {
        try {
            jwt.verify(token, this.secretKey);
            return true;
        } catch (error) {
            return false;
        }
    }
}
