import { Body, Controller, Patch, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { EntriesModel } from 'src/models/Admin/entries.model';
import { EntriesService } from '../../services/Admin/entries.service';
import { Result } from 'src/models/result.model';

@Controller('admin-entries')
export class EntriesController {
    constructor(private readonly entriesService: EntriesService) {}

    @Patch('add')
    @UseInterceptors(FilesInterceptor('ENTRIEFILE'), FilesInterceptor('ENTRIEFILERESUMEN'))
    async addEntries(@Body() entidad: EntriesModel, @UploadedFiles() archivos: Array<Express.Multer.File>): Promise<Result> {
        console.log(archivos);
        entidad.ENTRIEFILE = archivos?.[0]; // Guardar el primer archivo en el modelo
        entidad.ENTRIEFILERESUMEN = archivos?.[1]; // Guardar el segundo archivo en el modelo si es necesario
        return await this.entriesService.createEntries(entidad);
    }
}
