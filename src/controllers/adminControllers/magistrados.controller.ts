import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { MagistradosService } from 'src/services/Admin/magistrados.service';
import { MagistradosModel } from 'src/models/Admin/magistrados.model';

@Controller('admin-magistrados')
export class MagistradoController {
    constructor(
        private readonly magistradoService: MagistradosService,
    ) { }

    @Get('list')
    async listFilters(@Query() entidad: DataTable): Promise<MagistradosModel[]> {
        return await this.magistradoService.list(entidad);
    }

    @Post('delete')
    async deleteUser(@Body('ID') ID: number): Promise<Result> {
        return await this.magistradoService.delete(ID);
    }

    @Post('add')
    async addUser(@Body() entidad: MagistradosModel): Promise<Result> {
        return await this.magistradoService.create(entidad);
    }

    @Post('edit')
    async editUser(@Body() entidad: MagistradosModel): Promise<Result> {
        return await this.magistradoService.edit(entidad);
    }

}
