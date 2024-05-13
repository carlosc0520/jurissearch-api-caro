import { Request , Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from '../../services/User/user.service';
import { User } from '../../models/admin/user.model';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';

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

    @Post('delete')
    async deleteUser(@Request() req, @Body('ID') ID: number): Promise<Result> {
        return await this.userService.deleteUser(ID, req.user.UCRCN);
    }

    @Post('edit')
    async editUser(@Request() req, @Body() entidad: User): Promise<Result> {
        entidad.USER = req.user.UCRCN;
        return await this.userService.editUser(entidad);
    }


}
