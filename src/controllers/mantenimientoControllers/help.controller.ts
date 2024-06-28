import { Body, Controller, Request, Get, Post, Query } from '@nestjs/common';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { HelpService } from 'src/services/mantenimiento/help.service';
import { HelpModel } from 'src/models/mantenimiento/help.model';
import { PlanesModel } from 'src/models/Admin/planes.model';
import { PlanesService } from 'src/services/mantenimiento/planes.service';

@Controller('settings/help')
export class HelpController {
    constructor(
        private readonly helpService: HelpService,
        private readonly planService: PlanesService
    ) { }

    @Get('list')
    async listFilters(@Query() entidad: DataTable): Promise<HelpModel[]> {
        return await this.helpService.list(entidad);
    }

    @Post('delete')
    async deleteUser(@Request() req, @Body('ID') ID: number): Promise<Result> {
        return await this.helpService.delete(ID, req.user.UCRCN);
    }

    @Post('add')
    async addUser(@Body() entidad: HelpModel): Promise<Result> {
        entidad.UCRCN = entidad.NOMBRES.toString().trim();
        return await this.helpService.create(entidad);
    }

    @Post('edit')
    async editUser(@Request() req, @Body() entidad: HelpModel): Promise<Result> {
        entidad.UCRCN = req.user.UCRCN;
        return await this.helpService.edit(entidad);
    }

    @Get('listPlanes')
    async listaAll(@Query() entidad: DataTable): Promise<PlanesModel[]> {
        return await this.planService.list(entidad);
    }

}
