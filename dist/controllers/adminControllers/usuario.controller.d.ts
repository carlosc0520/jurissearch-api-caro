import { UserService } from '../../services/User/user.service';
import { User } from '../../models/admin/user.model';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
export declare class UsuarioController {
    private readonly userService;
    constructor(userService: UserService);
    addUser(entidad: User): Promise<Result>;
    listUsers(entidad: DataTable, IDROLE: string): Promise<User[]>;
    deleteUser(ID: number): Promise<Result>;
    editUser(entidad: User): Promise<Result>;
}
