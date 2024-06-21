import { Body, Controller, Get, Request, Post, Query, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { EntriesModel } from 'src/models/Admin/entries.model';
import { EntriesService } from '../../services/Admin/entries.service';
import { Result } from 'src/models/result.model';
import { diskStorage } from 'multer';
import { S3Service } from 'src/services/Aws/aws.service';
import * as fs from 'fs';
import { DataTable } from 'src/models/DataTable.model.';
import { Response } from 'express';
import { BusquedaModel } from 'src/models/Admin/busqueda.model';

@Controller('admin/entries')
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
    async uploadMultipleFiles(@Request() req, @Body() entidad: EntriesModel, @UploadedFiles() files,): Promise<Result> {
        try {
            const table: DataTable = {
                INIT: 0,
                ROWS: 1,
                DESC: null,
                CESTDO: null,
                ID: 0
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
            entidad.UCRCN = req.user.UCRCN;
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

    @Post('add-single')
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
    async uploadSingleFile(@Request() req, @Body() entidad: EntriesModel, @UploadedFiles() files,): Promise<Result> {
        try {
            const table: DataTable = {
                INIT: 0,
                ROWS: 1,
                DESC: null,
                CESTDO: null,
                ID: 0
            };
            const obtener = await this.entriesService.list(table, entidad.TITLE, entidad.TYPE, entidad.TIPO);
            if (obtener.length > 0) {
                return { MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`, STATUS: false };
            }

            const [file1] = files;

            const keysLocation: string = await this.s3Service.uploadFile(
                entidad,
                file1.filename,
                file1.path
            );

            entidad.ENTRIEFILE = keysLocation;
            entidad.UCRCN = req.user.UCRCN;
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

    @Post('edit')
    @UseInterceptors(
        FilesInterceptor('files', 20, {
            storage: diskStorage({
                destination: './uploads',
                filename: function (req, file, cb) {
                    // solo si tiene algo
                    if (file) {
                        const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                        return cb(null, filename);
                    }
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
    async editMultipleFiles(@Request() req, @Body() entidad: EntriesModel, @UploadedFiles() files?: any[]): Promise<Result> {
        try {
            const table: DataTable = {
                INIT: 0,
                ROWS: 1,
                DESC: null,
                CESTDO: null,
                ID: entidad.ID
            };

            const obtener = await this.entriesService.list(table, entidad.TITLE, entidad.TYPE, entidad.TIPO);
            if (obtener.length > 0) {
                return { MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`, STATUS: false };
            }

            const [file1, file2] = files;

            if (![undefined, null].includes(file1)) {
                // await this.s3Service.deleteFile(entidad.ENTRIEFILE);
                const keysLocation: string = await this.s3Service.uploadFile(
                    entidad,
                    file1.filename,
                    file1.path
                );

                entidad.ENTRIEFILE = keysLocation;
            }


            if (![undefined, null].includes(file2)) {
                // await this.s3Service.deleteFile(entidad.ENTRIEFILERESUMEN);
                const keysLocation: string = await this.s3Service.uploadFile(
                    entidad,
                    file2.filename,
                    file2.path
                );

                entidad.ENTRIEFILERESUMEN = keysLocation;
            }

            entidad.UCRCN = req.user.UCRCN;
            const result = await this.entriesService.edit(entidad);
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

    @Post('edit-single')
    @UseInterceptors(
        FilesInterceptor('files', 20, {
            storage: diskStorage({
                destination: './uploads',
                filename: function (req, file, cb) {
                    // solo si tiene algo
                    if (file) {
                        const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                        return cb(null, filename);
                    }
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
    async editSingleFile(@Request() req, @Body() entidad: EntriesModel, @UploadedFiles() files?: any[]): Promise<Result> {
        try {
            const table: DataTable = {
                INIT: 0,
                ROWS: 1,
                DESC: null,
                CESTDO: null,
                ID: entidad.ID
            };

            const obtener = await this.entriesService.list(table, entidad.TITLE, entidad.TYPE, entidad.TIPO);
            if (obtener.length > 0) {
                return { MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`, STATUS: false };
            }

            const [file1] = files;

            if (![undefined, null].includes(file1)) {
                await this.s3Service.deleteFile(entidad.ENTRIEFILE);
                const keysLocation: string = await this.s3Service.uploadFile(
                    entidad,
                    file1.filename,
                    file1.path
                );

                entidad.ENTRIEFILE = keysLocation;
            }

            entidad.UCRCN = req.user.UCRCN;
            const result = await this.entriesService.edit(entidad);
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
    async listUsers(@Query() entidad: DataTable, @Query('TYPE') TYPE: string): Promise<EntriesModel[]> {
        return await this.entriesService.list(entidad, entidad.DESC, TYPE, null);
    }

    @Post('delete')
    async deleteUser(@Request() req, @Body('ID') ID: number): Promise<Result> {
        return await this.entriesService.deleteFilter(ID, req.user.UCRCN);
    }

    @Get('get')
    async Obtener(@Query('ID') ID: number): Promise<EntriesModel> {
        return await this.entriesService.get(ID);
    }

    @Get('getPrint')
    async getPrint(@Query('ID') ID: number): Promise<EntriesModel> {
        return await this.entriesService.getPrint(ID);
    }

    @Post('download-file')
    async downloadFile(@Body('PATH') PATH: string, @Res() res: Response): Promise<any> {
        try {
            const file = await this.s3Service.downloadFile(PATH);
            res.set('Content-Type', 'application/pdf');
            res.send(file);
        } catch (error) {
            res.status(500).send('Error al descargar el archivo');
        }
    }

    @Get("busqueda")
    async busqueda(@Request() req, @Query() busqueda: BusquedaModel): Promise<EntriesModel[]> {
        busqueda.UEDCN = req.user.UCRCN;
        return await this.entriesService.busqueda(busqueda);
    }

    @Get("busqueda-favorites")
    async busquedaFavorites(@Request() req, @Query() busqueda: BusquedaModel): Promise<EntriesModel[]> {
        busqueda.UEDCN = req.user.UCRCN;
        busqueda.IDUSR = req.user.ID;
        return await this.entriesService.busquedaFavorites(busqueda);
    }

    @Post("save-title-entrie")
    async saveTitleEntrie(@Request() req, @Body() entidad: EntriesModel): Promise<Result> {
        entidad.UCRCN = req.user.UCRCN;
        return await this.entriesService.saveTitleEntrie(entidad);
    }
}
