import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import { UserService } from '../../services/User/user.service';
import { User } from '../../models/admin/user.model';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';

@Controller('admin-user')
export class UsuarioController {
    constructor(
        private readonly userService: UserService,
    ) { }

    @Post('add')
    async addUser(@Body() entidad: User): Promise<Result> {
        const admin = "ADMIN";
        entidad.USER = entidad.EMAIL.split('@')?.[0] || entidad.EMAIL;
        return await this.userService.createUser(entidad);
    }

    @Get('list')
    async listUsers(@Query() entidad : DataTable, @Query('IDROLE') IDROLE: string): Promise<User[]> {
        return await this.userService.list(entidad, IDROLE);
    }


}
