import { UserService } from '../services/User/user.service';
import { User } from '../models/admin/user.model';
import { TokenService } from '../services/User/token.service';
export declare class LoginController {
    private readonly userService;
    private readonly tokenService;
    constructor(userService: UserService, tokenService: TokenService);
    autenticarUsuario(entidad: User): Promise<User>;
}
