import { Body, Controller, Get, Request, Post, Query } from '@nestjs/common';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { PlanesService } from 'src/services/mantenimiento/planes.service';
import { PlanesModel } from 'src/models/Admin/planes.model';

@Controller('admin/planes')
export class PlanesController {
    constructor(
        private readonly planService: PlanesService
    ) { }

    @Get('list')
    async listaAll(@Query() entidad: DataTable): Promise<PlanesModel[]> {
        return await this.planService.list(entidad);
    }

    @Get('listPlanUser')
    async listPlanUser(@Request() req, @Query() entidad: DataTable): Promise<PlanesModel[]> {
        entidad.IDUSR = req.user.ID;
        return await this.planService.listPlanUser(entidad);
    }

    @Post('delete')
    async deleteUser(@Request() req, @Body('ID') ID: number): Promise<Result> {
        return await this.planService.delete(ID, req.user.UCRCN);
    }

    @Post('add')
    async add(@Request() req, @Body() entidad: PlanesModel): Promise<Result> {
        try {
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.planService.create(entidad);
            return result
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
    }

    @Post('edit')
    async edit(@Request() req, @Body() entidad: PlanesModel): Promise<Result> {
        try {
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.planService.edit(entidad);
            return result
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
    }
}
