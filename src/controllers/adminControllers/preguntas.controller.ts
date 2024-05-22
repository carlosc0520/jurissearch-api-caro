import { Body, Controller, Get, Request, Post, Query } from '@nestjs/common';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { PreguntasService } from 'src/services/mantenimiento/preguntas.service';
import { PreguntaModel } from 'src/models/Admin/preguntas.model';

@Controller('admin/preguntas')
export class PreguntasController {
    constructor(
        private readonly preguntasService: PreguntasService
    ) { }

    @Get('list')
    async listaAll(@Query() entidad: DataTable): Promise<PreguntaModel[]> {
        return await this.preguntasService.list(entidad);
    }

    @Post('delete')
    async deleteUser(@Request() req, @Body('ID') ID: number): Promise<Result> {
        return await this.preguntasService.delete(ID, req.user.UCRCN);
    }

    @Post('add')
    async add(@Request() req, @Body() entidad: PreguntaModel): Promise<Result> {
        try {
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.preguntasService.create(entidad);
            return result
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
    }

    @Post('edit')
    async edit(@Request() req, @Body() entidad: PreguntaModel): Promise<Result> {
        try {
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.preguntasService.edit(entidad);
            return result
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
    }
}
