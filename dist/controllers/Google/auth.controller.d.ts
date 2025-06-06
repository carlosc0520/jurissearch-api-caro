import { Request, Response } from 'express';
import { TokenService } from 'src/services/User/token.service';
import { UserService } from 'src/services/User/user.service';
import { EmailJurisService } from 'src/services/acompliance/emailJurisserivce';
export declare class AuthController {
    private readonly userService;
    private readonly tokenService;
    private readonly emailJurisService;
    redirectURL: string;
    redirectURLAPI: string;
    constructor(userService: UserService, tokenService: TokenService, emailJurisService: EmailJurisService);
    googleAuth(req: any, res: any): Promise<void>;
    googleRegister(req: any, res: any): Promise<void>;
    googleAuthRedirect(req: Request, res: Response): Promise<void>;
    googleAuthRedirectRegister(req: Request, res: Response): Promise<void>;
}
