import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class AuthMiddleware implements NestMiddleware {
    private readonly secretKey;
    use(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>>;
}
