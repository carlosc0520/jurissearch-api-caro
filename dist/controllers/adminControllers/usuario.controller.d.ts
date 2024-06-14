import { UserService } from '../../services/User/user.service';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
declare class User {
    ID: number;
    USER: string;
    IDROLE: number;
    EMAIL: string;
    PASSWORD: string;
    NOMBRES: string;
    APELLIDO: string;
    APATERNO: string;
    AMATERNO: string;
    TELEFONO: string;
    FNACIMIENTO: Date;
    EBLOQUEO: boolean;
    FVCMNTO: Date;
    INTENTOS: number;
    CARGO: string;
    DIRECCION: string;
    PROFESION: string;
    UCRCN: string;
    FCRCN: Date;
    FEDCN: Date;
    CDESTDO: string;
    TOKEN: string;
    DATOS?: string;
}
export declare class UsuarioController {
    private readonly userService;
    constructor(userService: UserService);
    validateToken(req: any): Promise<{
        STATUS: boolean;
        DATA: {
            IDR: number;
            ROLE: string;
        };
    }>;
    addUser(req: any, entidad: User): Promise<Result>;
    listUsers(entidad: DataTable, IDROLE: string): Promise<User[]>;
    getUser(req: any): Promise<User>;
    deleteUser(req: any, ID: number): Promise<Result>;
    editUser(req: any, entidad: User): Promise<Result>;
    editUserForce(req: any, entidad: User): Promise<Result>;
    addFavoriteUser(req: any, IDENTRIE: number): Promise<any>;
}
export {};
