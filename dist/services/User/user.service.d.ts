import { DataSource } from 'typeorm';
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
export declare class UserService {
    private connection;
    constructor(connection: DataSource);
    loguearUsuario(entidad: User): Promise<User>;
    createUser(entidad: User): Promise<Result>;
    editUser(entidad: User): Promise<Result>;
    deleteUser(id: number, UCRCN: string): Promise<Result>;
    list(entidad: DataTable, IDROLE: string): Promise<User[]>;
}
export {};
