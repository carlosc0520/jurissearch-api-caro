import { User } from 'models/Admin/user.model';
export declare class TokenService {
    private readonly secretKey;
    generateToken(user: User): string;
    validateToken(token: string): boolean;
}
