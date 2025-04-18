import { Body, Controller, Get, Request, Post, Query, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { S3Service } from 'src/services/Aws/aws.service';
import * as fs from 'fs';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { AutorModel, CategoriaModel, NoticiaModel } from 'src/models/Admin/noticia.model';
import { NoticiaService } from 'src/services/mantenimiento/noticia.service';
import { Response } from 'express';
import { HostingerService } from 'src/services/Aws/hostinger.service';

@Controller('admin/noticias')
export class NoticiaController {
    constructor(
        private readonly noticiaService: NoticiaService,
        private readonly s3Service: S3Service,
        private readonly hostingerService: HostingerService
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
                destination: './uploads/noticias',
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
        try {

            const [file1] = files;

            if (!file1) return { MESSAGE: 'La imagen es requerida', STATUS: false };
            if(file1){
                const resultFile: any = await this.hostingerService.saveFile(file1, 'noticias');
                if (!resultFile.success) return { MESSAGE: 'Error al subir la imagen', STATUS: false };
                entidad.IMAGEN = resultFile.path;
            }

            entidad.UCRCN = req.user.UCRCN;
            const result = await this.noticiaService.create(entidad);
            return result
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                } catch (error) {
                    console.log('Error deleting file:', error);
                }
            });
        }
    }

    @Post('edit')
    @UseInterceptors(
        FilesInterceptor('files', 20, {
            storage: diskStorage({
                destination: './uploads/noticias',
                filename: function (req, file, cb) {
                    if (file) {
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
            if (!entidad.ID) return { MESSAGE: 'El Identificador es requerido', STATUS: false };

            const [file1] = files;
            if (file1) {
                const deleteFile = await this.hostingerService.deleteFile(entidad.IMAGEN);
                const resultFile: any = await this.hostingerService.saveFile(file1, 'noticias');
                if (!resultFile.success) return { MESSAGE: 'Error al subir la imagen', STATUS: false };
                entidad.IMAGEN = resultFile.path;
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
                try{
                    fs.unlinkSync(file.path);
                }catch (error) {
                    console.log('Error deleting file:', error);
                }
            });
        }
    }

    // AUTORES
    @Get('list-autores')
    async listaAutores(@Query() entidad: DataTable): Promise<NoticiaModel[]> {
        return await this.noticiaService.listAutores(entidad);
    }

    @Post('add-autores')
    @UseInterceptors(
        FilesInterceptor('files', 20, {
            storage: diskStorage({
                destination: './uploads/noticias/autores',
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
    async addAutor(@Request() req, @Body() entidad: AutorModel, @UploadedFiles() files): Promise<Result> {
        entidad.UCRCN = req.user.UCRCN;
        try {
            const [file1] = files;

            if(file1){
                const resultFile: any = await this.hostingerService.saveFile(file1, 'noticias/autores');
                console.log(resultFile)
                if (!resultFile.success) return { MESSAGE: 'Error al subir la imagen', STATUS: false };
                entidad.RUTA = resultFile.path;
            }

            entidad.UCRCN = req.user.UCRCN;

            const result = await this.noticiaService.createAutor(entidad);
            return result
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach(file => {
                try {
                    fs.unlinkSync(file.path);
                } catch (error) {
                    console.log('Error deleting file:', error);
                }
            });
        }
    }

    @Post('edit-autores')
    @UseInterceptors(
        FilesInterceptor('files', 20, {
            storage: diskStorage({
                destination: './uploads/noticias/autores',
                filename: function (req, file, cb) {
                    if (file) {
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
    async editAutor(@Request() req, @Body() entidad: AutorModel, @UploadedFiles() files?: any[]): Promise<Result> {
        try {
            if (!entidad.ID) return { MESSAGE: 'El Identificador es requerido', STATUS: false };

            const [file1] = files;

            if (![undefined, null].includes(file1)) {
                const deleteFile = await this.hostingerService.deleteFile(entidad.RUTA);
                const resultFile: any = await this.hostingerService.saveFile(file1, 'noticias/autores');
                if (!resultFile.success) return { MESSAGE: 'Error al subir la imagen', STATUS: false };
                entidad.RUTA = resultFile.path;
            }

            entidad.UCRCN = req.user.UCRCN;
            const result = await this.noticiaService.editAutor(entidad);
            return result
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach(file => {
                try{
                    fs.unlinkSync(file.path);
                }catch (error) {
                    console.log('Error deleting file:', error);
                }
            });
        }
    }

    @Post('delete-autores')
    async deleteAutor(@Request() req, @Body('ID') ID: number): Promise<Result> {
        if (!ID) return { MESSAGE: 'El Identificador es requerido', STATUS: false };
        return await this.noticiaService.deleteAutor(ID, req.user.UCRCN);
    }

    // CATEGORIAS
    @Get('list-categorias')
    async listaCategorias(@Query() entidad: DataTable): Promise<NoticiaModel[]> {
        return await this.noticiaService.listCategorias(entidad);
    }

    @Post('add-categorias')
    async addCategoria(@Request() req, @Body() entidad: CategoriaModel): Promise<Result> {
        entidad.UCRCN = req.user.UCRCN;
        try {
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.noticiaService.createCategoria(entidad);
            return result
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
    }

    @Post('edit-categorias')
    async editCategoria(@Request() req, @Body() entidad: CategoriaModel): Promise<Result> {
        try {
            if (!entidad.ID) return { MESSAGE: 'El Identificador es requerido', STATUS: false };
            entidad.UCRCN = req.user.UCRCN;
            const result = await this.noticiaService.editCategoria(entidad);
            return result
        }
        catch (error) {
            return { MESSAGE: error.message, STATUS: false };
        }
    }

    @Post('delete-categorias')
    async deleteCategoria(@Request() req, @Body('ID') ID: number): Promise<Result> {
        if (!ID) return { MESSAGE: 'El Identificador es requerido', STATUS: false };
        return await this.noticiaService.deleteCategoria(ID, req.user.UCRCN);
    }
}
