import { DataSource } from 'typeorm';
import { User } from 'models/admin/user.model';
import { Result } from 'models/result.model';
import { DataTable } from 'models/DataTable.model.';
export declare class UserService {
    private connection;
    constructor(connection: DataSource);
    loguearUsuario(entidad: User): Promise<User>;
    createUser(entidad: User): Promise<Result>;
    editUser(entidad: User): Promise<Result>;
    deleteUser(id: number, UCRCN: string): Promise<Result>;
    list(entidad: DataTable, IDROLE: string): Promise<User[]>;
}
