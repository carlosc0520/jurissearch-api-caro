import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/User/token.service';
export declare class AuthMiddleware implements NestMiddleware {
    private readonly tokenService;
    private readonly secretKey;
    private activeSessions;
    constructor(tokenService: TokenService);
    use(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
    private isSessionActive;
}
