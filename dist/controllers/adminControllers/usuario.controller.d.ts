import { UserService } from '../../services/User/user.service';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { ReporteModelEntrie } from 'src/models/Admin/reporte.model';
import { HostingerService } from 'src/services/Aws/hostinger.service';
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
    RTAFTO?: string;
}
export declare class UsuarioController {
    private readonly userService;
    private readonly hostingerService;
    constructor(userService: UserService, hostingerService: HostingerService);
    validateToken(req: any): Promise<{
        STATUS: boolean;
        DATA: {
            IDR: number;
            ROLE: string;
            PERM: string[];
        };
    }>;
    addUser(req: any, entidad: User): Promise<Result>;
    listUsers(entidad: DataTable, IDROLE: string, req: any): Promise<User[]>;
    getUser(req: any): Promise<User>;
    deleteUser(req: any, ID: number): Promise<Result>;
    deleteFavoriteDirectory(req: any, IDDIRECTORIO: number, IDENTRIE: number): Promise<Result>;
    editUser(req: any, entidad: User): Promise<Result>;
    editUserForce(req: any, entidad: User, files: any): Promise<Result>;
    createDirectory(req: any, entidad: any): Promise<Result>;
    editDirectory(req: any, entidad: any): Promise<Result>;
    deleteDirectory(req: any, DIRECTORIOS: string): Promise<Result>;
    sharedDirectory(req: any, entidad: any): Promise<Result>;
    listDirectory(req: any, DSCRPCN: string, TYPE: string): Promise<any>;
    listDirectoryAll(req: any): Promise<any>;
    addFavoriteUser(req: any, IDENTRIE: number): Promise<any>;
    deleteFavoriteUser(req: any, entidad: any): Promise<any>;
    reporteEstadisticos(req: any, entidad: ReporteModelEntrie): Promise<any>;
    getContacts(entidad: DataTable, req: any): Promise<any>;
    addContact(req: any, entidad: any): Promise<Result>;
    editContact(req: any, entidad: any): Promise<Result>;
    deleteContact(req: any, ID: number): Promise<Result>;
    getNotifications(req: any, entidad: DataTable): Promise<any>;
    compartir(req: any, entidad: any): Promise<Result>;
    getContactsSelecteds(req: any, entidad: any): Promise<any>;
}
export {};
