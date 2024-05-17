import { Request , Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from '../../services/User/user.service';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';

class User {
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

@Controller('admin/user')
export class UsuarioController {
    constructor(
        private readonly userService: UserService,
    ) { }

    @Get('validate-token')
    async validateToken(): Promise<boolean> {
        return true;
    }

    @Post('add')
    async addUser(@Request() req, @Body() entidad: User): Promise<Result> {
        entidad.USER = req.user.UCRCN;
        entidad.PASSWORD = entidad.APATERNO;
        return await this.userService.createUser(entidad);
    }

    @Get('list')
    async listUsers(@Query() entidad : DataTable, @Query('IDROLE') IDROLE: string): Promise<User[]> {
        return await this.userService.list(entidad, IDROLE);
    }


    @Get('get')
    async getUser(@Request() req): Promise<User> {
        return await this.userService.getUser(req.user.ID);
    }

    @Post('delete')
    async deleteUser(@Request() req, @Body('ID') ID: number): Promise<Result> {
        return await this.userService.deleteUser(ID, req.user.UCRCN);
    }

    @Post('edit')
    async editUser(@Request() req, @Body() entidad: User): Promise<Result> {
        entidad.USER = req.user.UCRCN;
        return await this.userService.editUser(entidad);
    }

    @Post('edit-force')
    async editUserForce(@Request() req, @Body() entidad: User): Promise<Result> {
        entidad.USER = req.user.UCRCN;
        entidad.ID = req.user.ID;
        return await this.userService.editUser(entidad);
    }

    // **** FAVORITOS ****
    @Get('add-favorite')
    async addFavoriteUser(@Request() req, @Query("IDENTRIE") IDENTRIE: number): Promise<any> {
        return await this.userService.addFavoriteUser(req.user.UCRCN, req.user.ID, IDENTRIE);
    }
}

