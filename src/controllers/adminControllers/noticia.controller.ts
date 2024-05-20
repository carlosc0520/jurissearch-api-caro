import { Body, Controller, Request, Get, Post, Query } from '@nestjs/common';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { NoticiaModel } from 'src/models/Admin/noticia.model';
import { NoticiaService } from 'src/services/mantenimiento/noticia.service';

@Controller('admin/noticias')
export class NoticiaController {
    constructor(
        private readonly noticiaService: NoticiaService,
    ) { }

    @Get('list')
    async listaAll(@Query() entidad: DataTable): Promise<NoticiaModel[]> {
        return await this.noticiaService.list(entidad);
    }

    @Post('delete')
    async deleteUser(@Request() req, @Body('ID') ID: number): Promise<Result> {
        return await this.noticiaService.delete(ID, req.user.UCRCN);
    }

    @Post('add')
    async addUser(@Request() req, @Body() entidad: NoticiaModel): Promise<Result> {
        entidad.UCRCN = req.user.UCRCN;
        return await this.noticiaService.create(entidad);
    }

    @Post('edit')
    async editUser(@Request() req, @Body() entidad: NoticiaModel): Promise<Result> {
        entidad.UCRCN = req.user.UCRCN;
        return await this.noticiaService.edit(entidad);
    }
}
