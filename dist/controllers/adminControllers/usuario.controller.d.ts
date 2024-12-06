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
    RESTRICIONES: string;
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
            PERM: string[];
        };
    }>;
    addUser(req: any, entidad: User): Promise<Result>;
    listUsers(entidad: DataTable, IDROLE: string): Promise<User[]>;
    getUser(req: any): Promise<User>;
    deleteUser(req: any, ID: number): Promise<Result>;
    deleteFavoriteDirectory(req: any, IDDIRECTORIO: number, IDENTRIE: number): Promise<Result>;
    editUser(req: any, entidad: User): Promise<Result>;
    editUserForce(req: any, entidad: User): Promise<Result>;
    createDirectory(req: any, entidad: any): Promise<Result>;
    sharedDirectory(req: any, entidad: any): Promise<Result>;
    listDirectory(req: any, DSCRPCN: string, TYPE: string): Promise<any>;
    listDirectoryAll(req: any): Promise<any>;
    addFavoriteUser(req: any, IDENTRIE: number): Promise<any>;
}
export {};
