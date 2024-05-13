import { Body, Controller, Request, Get, Post, Query } from '@nestjs/common';
import { Result } from 'models/result.model';
import { DataTable } from 'models/DataTable.model.';
import { filtrosService } from 'services/Filtros/filtros.service';
import { FiltrosModel } from 'models/Admin/filtros.model';

@Controller('admin/filtros')
export class FiltrosController {
    constructor(
        private readonly filtrosService: filtrosService,
    ) { }

    @Get('list')
    async listFilters(@Query() entidad: DataTable, @Query('TIPO') TIPO: string): Promise<FiltrosModel[]> {
        return await this.filtrosService.list(entidad, TIPO);
    }

    @Post('add')
    async addUser(@Request() req, @Body() entidad: FiltrosModel): Promise<Result> {
        entidad.UCRCN = req.user.UCRCN;
        return await this.filtrosService.createFilter(entidad);
    }

    @Post('delete')
    async deleteUser(@Request() req, @Body('ID') ID: number): Promise<Result> {
        return await this.filtrosService.deleteFilter(ID, req.user.UCRCN);
    }

    @Post('edit')
    async editUser(@Request() req, @Body() entidad: FiltrosModel): Promise<Result> {
        entidad.UCRCN = req.user.UCRCN;
        return await this.filtrosService.editFilter(entidad);
    }

}
