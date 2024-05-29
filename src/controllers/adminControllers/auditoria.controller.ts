import { Controller, Get, Query } from '@nestjs/common';
import { DataTable } from '../../models/DataTable.model.';
import { AuditoriaModel } from 'src/models/Admin/auditoria.model';
import { AuditoriaService } from 'src/services/Admin/auditoria.service';

@Controller('admin/auditoria')
export class AuditoriaController {
    constructor(
        private readonly auditoriaService: AuditoriaService,
    ) { }

    @Get('list')
    async listaAll(@Query() entidad: DataTable): Promise<AuditoriaModel[]> {
        return await this.auditoriaService.list(entidad);
    }

}
