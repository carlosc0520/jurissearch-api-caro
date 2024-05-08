import { Body, Controller, Get, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EntriesModel } from 'src/models/Admin/entries.model';
import { EntriesService } from '../../services/Admin/entries.service';
import { Result } from 'src/models/result.model';
import { diskStorage } from 'multer';
import { S3Service } from 'src/services/Aws/aws.service';
import * as fs from 'fs';
import { DataTable } from 'src/models/DataTable.model.';
import { table } from 'console';

@Controller('admin-entries')
export class EntriesController {


    constructor(
        private readonly entriesService: EntriesService,
        private readonly s3Service: S3Service
    ) { }



    @Post('add')
    @UseInterceptors(
        FilesInterceptor('files', 20, {
            storage: diskStorage({
                destination: './uploads',
                filename: function (req, file, cb) {
                    const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                    return cb(null, filename);
                }
            }),
            fileFilter: (req, file, cb) => {
                if (file.mimetype.match(/\/pdf$/)) {
                    cb(null, true);
                } else {
                    cb(new Error('Solo se permiten archivos PDF'), false);
                }
            }
        }),
    )
    async uploadMultipleFiles(@Body() entidad: EntriesModel, @UploadedFiles() files,): Promise<Result> {
        try {

            const table: DataTable = {
                INIT: 0,
                ROWS: 1,
                DESC:  null,
                CESTDO: null,
            };
            const obtener = await this.entriesService.list(table, entidad.TITLE, entidad.TYPE, entidad.TIPO);
            if (obtener.length > 0) {
                return { MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`, STATUS: false };
            }

            const [file1, file2] = files;

            const keysLocation: string[] = await this.s3Service.uploadFiles(
                entidad,
                file1.filename,
                file1.path,
                file2.filename,
                file2.path
            );

            entidad.ENTRIEFILE = keysLocation[0];
            entidad.ENTRIEFILERESUMEN = keysLocation[1];

            const result = await this.entriesService.createEntries(entidad);
            return result
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach(file => {
                fs.unlinkSync(file.path);
            });
        }
    }

    @Get('list')
    async listUsers(@Query() entidad : DataTable, @Query('TYPE') TYPE: string): Promise<EntriesModel[]> {
        return await this.entriesService.list(entidad, entidad.DESC, TYPE, null);
    }

    @Post('delete')
    async deleteUser(@Body('ID') ID: number): Promise<Result> {
        return await this.entriesService.deleteFilter(ID);
    }



}
