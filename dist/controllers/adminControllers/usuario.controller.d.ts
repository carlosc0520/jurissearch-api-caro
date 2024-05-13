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
    UCRCN: string;
    FCRCN: Date;
    FEDCN: Date;
    CDESTDO: string;
    TOKEN: string;
}
export declare class UsuarioController {
    private readonly userService;
    constructor(userService: UserService);
    validateToken(): Promise<boolean>;
    addUser(req: any, entidad: User): Promise<Result>;
    listUsers(entidad: DataTable, IDROLE: string): Promise<User[]>;
    deleteUser(req: any, ID: number): Promise<Result>;
    editUser(req: any, entidad: User): Promise<Result>;
}
export {};
