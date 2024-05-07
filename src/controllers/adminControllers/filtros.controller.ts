import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { filtrosService } from '../../services/Filtros/filtros.service';
import { FiltrosModel } from '../../models/Admin/filtros.model';

@Controller('admin-filtros')
export class FiltrosController {
    constructor(
        private readonly filtrosService: filtrosService,
    ) { }

    @Get('list')
    async listFilters(@Query() entidad: DataTable, @Query('TIPO') TIPO: string): Promise<FiltrosModel[]> {
        return await this.filtrosService.list(entidad, TIPO);
    }

    @Post('add')
    async addUser(@Body() entidad: FiltrosModel): Promise<Result> {
        return await this.filtrosService.createFilter(entidad);
    }

    @Post('delete')
    async deleteUser(@Body('ID') ID: number): Promise<Result> {
        return await this.filtrosService.deleteFilter(ID);
    }

    @Post('edit')
    async editUser(@Body() entidad: FiltrosModel): Promise<Result> {
        return await this.filtrosService.editFilter(entidad);
    }

}
