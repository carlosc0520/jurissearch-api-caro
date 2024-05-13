// token.service.ts
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from 'models/Admin/user.model';

@Injectable()
export class TokenService {
    private readonly secretKey = process.env.SECRET_KEY;

    generateToken(user: User): string {
        const payload = {
            EMAIL: user.EMAIL,
            ID: user.ID,
            role: 1,
            NAME: user.NOMBRES,
            APELLIDO: user.APELLIDO,
            UCRCN: user.EMAIL.split('@')[0] || ""
        };
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
