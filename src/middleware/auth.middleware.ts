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
  private readonly USE_SQL_SESSIONS = process.env.USE_SQL_SESSIONS !== 'false'; // true por defecto
  private activeSessions: Map<string, Session>;

  constructor(private readonly tokenService: TokenService) {
    // Validar que SECRET_KEY esté configurada
    if (!this.secretKey || this.secretKey.length < 32) {
      throw new Error('SECRET_KEY no configurada o demasiado corta');
    }
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Obtener token del header
      let token = req.headers.authorization;

      // Validar que el header de autorización exista
      if (!token || typeof token !== 'string') {
        return res.status(401).json({
          message: 'Acceso no autorizado',
          statusCode: 401
        });
      }

      // Remover el prefijo 'Bearer ' si existe
      token = token.trim();
      if (token.startsWith('Bearer ')) {
        token = token.substring(7).trim();
      }

      // Validar formato básico del token
      if (token.length < 20 || token.length > 2000) {
        return res.status(401).json({
          message: 'Acceso no autorizado',
          statusCode: 401
        });
      }

      // Validar que el token solo contenga caracteres válidos (base64url + puntos)
      const tokenRegex = /^[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+$/;
      if (!tokenRegex.test(token)) {
        return res.status(401).json({
          message: 'Acceso no autorizado',
          statusCode: 401
        });
      }

      // Verificar el token JWT
      const decoded = await jwt.verify(token, this.secretKey, {
        algorithms: ['HS256'], // Especificar algoritmo permitido
        maxAge: '24h', // Validar que no sea más viejo de 24 horas
      });

      // Validar estructura del payload
      if (!decoded || typeof decoded !== 'object') {
        return res.status(401).json({
          message: 'Acceso no autorizado',
          statusCode: 401
        });
      }

      // Validar que tenga sessionId
      if (!decoded['sessionId']) {
        return res.status(401).json({
          message: 'Acceso no autorizado',
          statusCode: 401
        });
      }

      const sessionId = decoded['sessionId'].toString();


      // *** MODO SQL: Validar sesión desde base de datos ***
      if (this.USE_SQL_SESSIONS) {
        try {
          const sessionData = await this.tokenService.getSessionDB(sessionId);

          if (!sessionData) {
            return res.status(401).json({
              message: 'Sesión expirada o inválida',
              statusCode: 401
            });
          }


          // Verificar que la sesión esté activa
          if (!sessionData.IS_ACTIVE) {
            return res.status(401).json({
              message: 'Sesión cerrada',
              statusCode: 401
            });
          }

          // Verificar expiración
          const expiresAt = new Date(sessionData.EXPIRES_AT).getTime();
          if (expiresAt <= Date.now()) {
            return res.status(401).json({
              message: 'Sesión expirada',
              statusCode: 401
            });
          }

        } catch (sqlError) {
          console.error('[AUTH MIDDLEWARE] Error validando sesión:', sqlError.message);
          return res.status(401).json({
            message: 'Error validando sesión',
            statusCode: 401
          });
        }
      }
      // *** MODO ARCHIVOS: Validar sesión desde JSON files ***
      else {
        // Obtener sesiones activas
        this.activeSessions = this.tokenService.readActiveSessionsFromFile();

        // Validar que exista la sesión
        const session = this.activeSessions.get(sessionId);

        if (!this.isSessionActive(session)) {
          return res.status(401).json({
            message: 'Sesión expirada o inválida',
            statusCode: 401
          });
        }
      }

      // Adjuntar información del usuario al request
      req['user'] = decoded;

      // Continuar con la siguiente función middleware
      next();

    } catch (error) {
      // Manejar diferentes tipos de errores JWT de forma segura
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          message: 'Sesión expirada',
          statusCode: 401
        });
      }

      if (error instanceof jwt.JsonWebTokenError) {
        // Log del error para debugging (sin exponer detalles al cliente)
        console.error('JWT Error:', error.message);
        return res.status(401).json({
          message: 'Acceso no autorizado',
          statusCode: 401
        });
      }

      if (error instanceof jwt.NotBeforeError) {
        return res.status(401).json({
          message: 'Acceso no autorizado',
          statusCode: 401
        });
      }

      if (error instanceof UnauthorizedException) {
        return res.status(401).json({
          message: 'Acceso no autorizado',
          statusCode: 401
        });
      }

      // Error interno del servidor (log pero no exponer detalles)
      console.error('Auth Middleware Error:', error);
      return res.status(500).json({
        message: 'Error interno del servidor',
        statusCode: 500
      });
    }
  }

  private isSessionActive(session: Session): boolean {
    if (!session) {
      return false;
    }

    if (!session.expiresIn || typeof session.expiresIn !== 'number') {
      return false;
    }

    // Validar que la sesión no haya expirado
    return session.expiresIn > Date.now();
  }
}
