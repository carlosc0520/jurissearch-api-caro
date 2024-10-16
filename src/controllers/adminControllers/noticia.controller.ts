import { Body, Controller, Get, Request, Post, Query, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { S3Service } from 'src/services/Aws/aws.service';
import * as fs from 'fs';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { NoticiaModel } from 'src/models/Admin/noticia.model';
import { NoticiaService } from 'src/services/mantenimiento/noticia.service';
import { Response } from 'express';

@Controller('admin/noticias')
export class NoticiaController {
    constructor(
        private readonly noticiaService: NoticiaService,
        private readonly s3Service: S3Service
    ) { }

    @Get('list')
    async listaAll(@Query() entidad: DataTable): Promise<NoticiaModel[]> {
        return await this.noticiaService.list(entidad);
    }


    @Post("get-image")
    async downloadFile(@Body('KEY') KEY: string, @Res() res: Response): Promise<any> {
        try {
            const file = await this.s3Service.getImage(KEY);
            res.set('Content-Type', 'application/octet-stream');
            res.send(file);
        } catch (error) {
            res.status(500).send('Error al descargar el archivo');
        }
    }

    @Post('delete')
    async deleteUser(@Request() req, @Body('ID') ID: number): Promise<Result> {
        // const entidad = await this.noticiaService.list({ INIT: 0, ROWS: 1, DESC: null, CESTDO: null, ID });
        // if (entidad.length === 0) {
        //     return { MESSAGE: 'La noticia no existe', STATUS: false };
        // }


        // let IMAGEN = entidad[0].IMAGEN;
        // const deleteFile = await this.s3Service.deleteFile(IMAGEN);
        // if (!deleteFile) {
        //     return { MESSAGE: 'Error al eliminar la imagen', STATUS: false };
        // }

        return await this.noticiaService.delete(ID, req.user.UCRCN);
    }

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
                if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                    cb(null, true);
                } else {
                    cb(new Error('Solo se permiten imagenes'), false);
                }
            }
        }),
    )
    async addNoticia(@Request() req, @Body() entidad: NoticiaModel, @UploadedFiles() files): Promise<Result> {
        entidad.UCRCN = req.user.UCRCN;
        try {

            const table: DataTable = {
                INIT: 0,
                ROWS: 1,
                DESC: entidad.TITULO,
                CESTDO: null,
                ID: 0
            };
            const obtener = await this.noticiaService.list(table);
            if (obtener.length > 0) {
                return {
                    MESSAGE: `Ya existe una noticia con el titulo ${entidad.TITULO}`,
                    STATUS: false
                };
            }

            const [file1] = files;

            const keysLocation: string = await this.s3Service.uploadImage(
                entidad,
                file1.filename,
                file1.path
            );

            entidad.IMAGEN = keysLocation;
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.noticiaService.create(entidad);
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
                    if (file){
                        const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                        return cb(null, filename);
                    }
                }
            }),
            fileFilter: (req, file, cb) => {
                if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                    cb(null, true);
                } else {
                    cb(new Error('Solo se permiten imagenes'), false);
                }
            }
        }),
    )
    async editNoticia(@Request() req, @Body() entidad: NoticiaModel, @UploadedFiles() files?: any[]): Promise<Result> {
        try {
            const table: DataTable = {
                INIT: 0,
                ROWS: 1,
                DESC: entidad.TITULO,
                CESTDO: null,
                ID: entidad.ID
            };

            const obtener = await this.noticiaService.list(table);
            if (obtener.length > 0) {
                return { MESSAGE: `Ya existe una noticia con el titulo ${entidad.TITULO}`, STATUS: false };
            }

            const [file1] = files;
            
            if (![undefined, null].includes(file1)) {
                // const resDelete = await this.s3Service.deleteFile(entidad.IMAGEN);
                const keysLocation: string = await this.s3Service.uploadImage(
                    entidad,
                    file1.filename,
                    file1.path
                );

                entidad.IMAGEN = keysLocation;
            }

            entidad.UCRCN = req.user.UCRCN;
            const result = await this.noticiaService.edit(entidad);
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
}
