import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { TokenService } from '../services/User/token.service';

interface Session {
  sessionId: string;
  expiresIn: number;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly secretKey = process.env.SECRET_KEY;
  private activeSessions: Map<string, Session>;

  constructor(private readonly tokenService: TokenService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    token = token.replace('Bearer ', '');

    try {
      const decoded = await jwt.verify(token, this.secretKey);
      this.activeSessions = this.tokenService.readActiveSessionsFromFile();
      const session = this.activeSessions.get(decoded['sessionId'].toString());

      if (!this.isSessionActive(session)) {
        return res
          .status(401)
          .json({ message: 'Token inválido o sesión cerrada' });
      }

      req['user'] = decoded;

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Token inválido' });
      }

      if (error instanceof UnauthorizedException) {
        return res.status(401).json({ message: error.message });
      }

      return res.status(500).json({ message: 'Su código de sesión ha expirado o ha sido alterado' });	
    }
  }

  private isSessionActive(session: Session): boolean {
    return session && session.expiresIn > Date.now();
  }
}
