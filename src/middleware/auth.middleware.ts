// auth.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    private readonly secretKey = process.env.SECRET_KEY;

    use(req: Request, res: Response, next: NextFunction) {
        let token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }
        
        token = token.replace('Bearer ', '');

        try {
            const decoded = jwt.verify(token, this.secretKey);
            req['user'] = decoded;
            next();

        } catch (error) {
            return res.status(401).json({ message: 'Token inválido' });
        }
    }
}
