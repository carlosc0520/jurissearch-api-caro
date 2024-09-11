import {
  Body,
  Controller,
  Get,
  Request,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
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
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  Header,
  Footer,
  WidthType,
} from 'docx';
import recursos from './recursos';
import JSZip from 'jszip';
import { ReporteModelEntrie } from 'src/models/Admin/reporte.model';

@Controller('admin/entries')
export class EntriesController {
  constructor(
    private readonly entriesService: EntriesService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('add')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: './uploads',
        filename: function (req, file, cb) {
          const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
          return cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/pdf$/)) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos PDF'), false);
        }
      },
    }),
  )
  async uploadMultipleFiles(
    @Request() req,
    @Body() entidad: EntriesModel,
    @UploadedFiles() files,
  ): Promise<any> {
    try {
      const table: DataTable = {
        INIT: 0,
        ROWS: 1,
        DESC: null,
        CESTDO: null,
        ID: 0,
      };
      const obtener = await this.entriesService.listV(
        table,
        entidad.TITLE,
        entidad.TYPE,
        entidad.TIPO,
      );
      if (obtener.length > 0) {
        return {
          MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`,
          STATUS: false,
        };
      }

      const pathcaroa = path.join(
        __dirname,
        '..',
        '..',
        'files/files',
        'caroa.png',
      );
      const pathccfirma = path.join(
        __dirname,
        '..',
        '..',
        'files/files',
        'ccfirma.png',
      );
      const pathmarcadeagua = path.join(
        __dirname,
        '..',
        '..',
        'files/files',
        'marcadeagua.png',
      );
      const pathnuevologo = path.join(
        __dirname,
        '..',
        '..',
        'files/files',
        'nuevologo.png',
      );

      const [file1] = files;
      const templatePDFBytes = fs.readFileSync(file1.path);
      const pdfDoc = await PDFDocument.load(templatePDFBytes);

      const caroaImage = await pdfDoc.embedPng(fs.readFileSync(pathcaroa));
      const ccfirmaImage = await pdfDoc.embedPng(fs.readFileSync(pathccfirma));
      const marcadeaguaImage = await pdfDoc.embedPng(
        fs.readFileSync(pathmarcadeagua),
      );
      const nuevologoImage = await pdfDoc.embedPng(
        fs.readFileSync(pathnuevologo),
      );
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        const x = width / 2;
        const y = height / 2;

        await page.drawImage(marcadeaguaImage, {
          x: x - 310,
          y: y - 330,
          width: 620,
          height: 600,
          opacity: 0.7,
        });

        await page.drawImage(caroaImage, {
          x: x - (width < 500 ? 240 : 290),
          y: y + (height < 800 ? 345 : 375),
          width: 95,
          height: 40,
        });

        page.drawText('https://ccfirma.com/', {
          x: x - 290,
          y: y + 395,
          size: 10,
          color: rgb(0, 0, 0),
          opacity: 0.0,
        });

        await page.drawImage(nuevologoImage, {
          x: x - (width < 500 ? 20 : 25),
          y: y + (height < 800 ? 350 : 380),
          width: 50,
          height: 35,
        });

        await page.drawImage(ccfirmaImage, {
          x: x - (width < 500 ? 25 : 30),
          y: y - (height < 800 ? 395 : 415),
          width: 70,
          height: 30,
          opacity: 0.9,
        });

        page.drawText('https://ccfirma.com/', {
          x: x - (width < 500 ? 25 : 30),
          y: y - (height < 800 ? 390 : 415),
          size: 10,
          color: rgb(0, 0, 0),
          opacity: 0.0,
        });
      }

      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(file1.path, pdfBytes);

      const file2 = { filename: null, path: null };
      const keysLocation: string[] = await this.s3Service.uploadFiles(
        entidad,
        file1.filename,
        file1.path,
        file2.filename,
        file2.path,
      );

      // entidad.ENTRIEFILERESUMEN = keysLocation[1];
      entidad.ENTRIEFILE = keysLocation[0];
      entidad.ENTRIEFILERESUMEN = '';
      entidad.UCRCN = req.user.UCRCN;
      const result = await this.entriesService.createEntries(entidad);
      return result;
    } catch (error) {
      return { MESSAGE: error.message, STATUS: false };
    } finally {
      await files.forEach((file) => {
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
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/pdf$/)) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos PDF'), false);
        }
      },
    }),
  )
  async uploadSingleFile(
    @Request() req,
    @Body() entidad: EntriesModel,
    @UploadedFiles() files,
  ): Promise<Result> {
    try {
      const table: DataTable = {
        INIT: 0,
        ROWS: 1,
        DESC: null,
        CESTDO: null,
        ID: 0,
      };

      const obtener = await this.entriesService.listV(
        table,
        entidad.TITLE,
        entidad.TYPE,
        entidad.TIPO,
      );
      if (obtener.length > 0) {
        return {
          MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`,
          STATUS: false,
        };
      }

      const pathcaroa = path.join(
        __dirname,
        '..',
        '..',
        'files/files',
        'caroa.png',
      );
      const pathccfirma = path.join(
        __dirname,
        '..',
        '..',
        'files/files',
        'ccfirma.png',
      );
      const pathmarcadeagua = path.join(
        __dirname,
        '..',
        '..',
        'files/files',
        'marcadeagua.png',
      );
      const pathnuevologo = path.join(
        __dirname,
        '..',
        '..',
        'files/files',
        'nuevologo.png',
      );

      const [file1] = files;
      const templatePDFBytes = fs.readFileSync(file1.path);
      const pdfDoc = await PDFDocument.load(templatePDFBytes);

      const caroaImage = await pdfDoc.embedPng(fs.readFileSync(pathcaroa));
      const ccfirmaImage = await pdfDoc.embedPng(fs.readFileSync(pathccfirma));
      const marcadeaguaImage = await pdfDoc.embedPng(
        fs.readFileSync(pathmarcadeagua),
      );
      const nuevologoImage = await pdfDoc.embedPng(
        fs.readFileSync(pathnuevologo),
      );
      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();

        const x = width / 2;
        const y = height / 2;

        await page.drawImage(marcadeaguaImage, {
          x: x - 310,
          y: y - 330,
          width: 620,
          height: 600,
          opacity: 0.7,
        });

        await page.drawImage(caroaImage, {
          x: x - (width < 500 ? 240 : 290),
          y: y + (height < 800 ? 345 : 375),
          width: 95,
          height: 40,
        });

        page.drawText('https://ccfirma.com/', {
          x: x - 290,
          y: y + 395,
          size: 10,
          color: rgb(0, 0, 0),
          opacity: 0.0,
        });

        await page.drawImage(nuevologoImage, {
          x: x - (width < 500 ? 20 : 25),
          y: y + (height < 800 ? 350 : 380),
          width: 50,
          height: 35,
        });

        await page.drawImage(ccfirmaImage, {
          x: x - (width < 500 ? 25 : 30),
          y: y - (height < 800 ? 395 : 415),
          width: 70,
          height: 30,
          opacity: 0.9,
        });

        page.drawText('https://ccfirma.com/', {
          x: x - (width < 500 ? 25 : 30),
          y: y - (height < 800 ? 390 : 415),
          size: 10,
          color: rgb(0, 0, 0),
          opacity: 0.0,
        });
      }

      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(file1.path, pdfBytes);

      const keysLocation: string = await this.s3Service.uploadFile(
        entidad,
        file1.filename,
        file1.path,
      );

      entidad.ENTRIEFILE = keysLocation;
      entidad.UCRCN = req.user.UCRCN;
      const result = await this.entriesService.createEntries(entidad);
      return result;
    } catch (error) {
      return { MESSAGE: error.message, STATUS: false };
    } finally {
      await files.forEach((file) => {
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
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/pdf$/)) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos PDF'), false);
        }
      },
    }),
  )
  async editMultipleFiles(
    @Request() req,
    @Body() entidad: EntriesModel,
    @UploadedFiles() files?: any[],
  ): Promise<Result> {
    try {
      const table: DataTable = {
        INIT: 0,
        ROWS: 1,
        DESC: null,
        CESTDO: null,
        ID: entidad.ID,
      };

      const obtener = await this.entriesService.listV(
        table,
        entidad.TITLE,
        entidad.TYPE,
        entidad.TIPO,
      );
      if (obtener.length > 0) {
        return {
          MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`,
          STATUS: false,
        };
      }

      const [file1, file2] = files;

      if (![undefined, null].includes(file1)) {
        // await this.s3Service.deleteFile(entidad.ENTRIEFILE);

        const pathcaroa = path.join(
          __dirname,
          '..',
          '..',
          'files/files',
          'caroa.png',
        );
        const pathccfirma = path.join(
          __dirname,
          '..',
          '..',
          'files/files',
          'ccfirma.png',
        );
        const pathmarcadeagua = path.join(
          __dirname,
          '..',
          '..',
          'files/files',
          'marcadeagua.png',
        );
        const pathnuevologo = path.join(
          __dirname,
          '..',
          '..',
          'files/files',
          'nuevologo.png',
        );

        const templatePDFBytes = fs.readFileSync(file1.path);
        const pdfDoc = await PDFDocument.load(templatePDFBytes);

        const caroaImage = await pdfDoc.embedPng(fs.readFileSync(pathcaroa));
        const ccfirmaImage = await pdfDoc.embedPng(
          fs.readFileSync(pathccfirma),
        );
        const marcadeaguaImage = await pdfDoc.embedPng(
          fs.readFileSync(pathmarcadeagua),
        );
        const nuevologoImage = await pdfDoc.embedPng(
          fs.readFileSync(pathnuevologo),
        );

        const pages = pdfDoc.getPages();

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const { width, height } = page.getSize();

          const x = width / 2;
          const y = height / 2;

          await page.drawImage(marcadeaguaImage, {
            x: x - 310,
            y: y - 330,
            width: 620,
            height: 600,
            opacity: 0.7,
          });

          await page.drawImage(caroaImage, {
            x: x - (width < 500 ? 240 : 290),
            y: y + (height < 800 ? 345 : 375),
            width: 95,
            height: 40,
          });

          page.drawText('https://ccfirma.com/', {
            x: x - 290,
            y: y + 395,
            size: 10,
            color: rgb(0, 0, 0),
            opacity: 0.0,
          });

          await page.drawImage(nuevologoImage, {
            x: x - (width < 500 ? 20 : 25),
            y: y + (height < 800 ? 350 : 380),
            width: 50,
            height: 35,
          });

          await page.drawImage(ccfirmaImage, {
            x: x - (width < 500 ? 25 : 30),
            y: y - (height < 800 ? 395 : 415),
            width: 70,
            height: 30,
            opacity: 0.9,
          });

          page.drawText('https://ccfirma.com/', {
            x: x - (width < 500 ? 25 : 30),
            y: y - (height < 800 ? 390 : 415),
            size: 10,
            color: rgb(0, 0, 0),
            opacity: 0.0,
          });
        }

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(file1.path, pdfBytes);

        const keysLocation: string = await this.s3Service.uploadFile(
          entidad,
          file1.filename,
          file1.path,
        );

        entidad.ENTRIEFILE = keysLocation;
      }

      entidad.UCRCN = req.user.UCRCN;
      const result = await this.entriesService.edit(entidad);
      return result;
    } catch (error) {
      return { MESSAGE: error.message, STATUS: false };
    } finally {
      await files.forEach((file) => {
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
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/pdf$/)) {
          cb(null, true);
        } else {
          cb(new Error('Solo se permiten archivos PDF'), false);
        }
      },
    }),
  )
  async editSingleFile(
    @Request() req,
    @Body() entidad: EntriesModel,
    @UploadedFiles() files?: any[],
  ): Promise<Result> {
    try {
      const table: DataTable = {
        INIT: 0,
        ROWS: 1,
        DESC: null,
        CESTDO: null,
        ID: entidad.ID,
      };

      const obtener = await this.entriesService.listV(
        table,
        entidad.TITLE,
        entidad.TYPE,
        entidad.TIPO,
      );
      if (obtener.length > 0) {
        return {
          MESSAGE: `Ya existe una entrada con el mismo título para ${entidad.TYPE} - ${entidad.TIPO}`,
          STATUS: false,
        };
      }

      const [file1] = files;

      if (![undefined, null].includes(file1)) {
        // await this.s3Service.deleteFile(entidad.ENTRIEFILE);

        const pathcaroa = path.join(
          __dirname,
          '..',
          '..',
          'files/files',
          'caroa.png',
        );
        const pathccfirma = path.join(
          __dirname,
          '..',
          '..',
          'files/files',
          'ccfirma.png',
        );
        const pathmarcadeagua = path.join(
          __dirname,
          '..',
          '..',
          'files/files',
          'marcadeagua.png',
        );
        const pathnuevologo = path.join(
          __dirname,
          '..',
          '..',
          'files/files',
          'nuevologo.png',
        );

        const templatePDFBytes = fs.readFileSync(file1.path);
        const pdfDoc = await PDFDocument.load(templatePDFBytes);

        const caroaImage = await pdfDoc.embedPng(fs.readFileSync(pathcaroa));
        const ccfirmaImage = await pdfDoc.embedPng(
          fs.readFileSync(pathccfirma),
        );
        const marcadeaguaImage = await pdfDoc.embedPng(
          fs.readFileSync(pathmarcadeagua),
        );
        const nuevologoImage = await pdfDoc.embedPng(
          fs.readFileSync(pathnuevologo),
        );

        const pages = pdfDoc.getPages();

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const { width, height } = page.getSize();

          const x = width / 2;
          const y = height / 2;

          await page.drawImage(marcadeaguaImage, {
            x: x - 310,
            y: y - 330,
            width: 620,
            height: 600,
            opacity: 0.7,
          });

          await page.drawImage(caroaImage, {
            x: x - (width < 500 ? 240 : 290),
            y: y + (height < 800 ? 345 : 375),
            width: 95,
            height: 40,
          });

          page.drawText('https://ccfirma.com/', {
            x: x - 290,
            y: y + 395,
            size: 10,
            color: rgb(0, 0, 0),
            opacity: 0.0,
          });

          await page.drawImage(nuevologoImage, {
            x: x - (width < 500 ? 20 : 25),
            y: y + (height < 800 ? 350 : 380),
            width: 50,
            height: 35,
          });

          await page.drawImage(ccfirmaImage, {
            x: x - (width < 500 ? 25 : 30),
            y: y - (height < 800 ? 395 : 415),
            width: 70,
            height: 30,
            opacity: 0.9,
          });

          page.drawText('https://ccfirma.com/', {
            x: x - (width < 500 ? 25 : 30),
            y: y - (height < 800 ? 390 : 415),
            size: 10,
            color: rgb(0, 0, 0),
            opacity: 0.0,
          });
        }

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(file1.path, pdfBytes);

        const keysLocation: string = await this.s3Service.uploadFile(
          entidad,
          file1.filename,
          file1.path,
        );

        entidad.ENTRIEFILE = keysLocation;
      }

      entidad.UCRCN = req.user.UCRCN;
      const result = await this.entriesService.edit(entidad);
      return result;
    } catch (error) {
      return { MESSAGE: error.message, STATUS: false };
    } finally {
      await files.forEach((file) => {
        fs.unlinkSync(file.path);
      });
    }
  }

  @Get('list')
  async listUsers(
    @Query() entidad: DataTable,
    @Query('TYPE') TYPE: string,
  ): Promise<EntriesModel[]> {
    return await this.entriesService.list(entidad, entidad.DESC, TYPE, null);
  }

  @Get('list-data')
  async listData(
    @Query() entidad: DataTable,
    @Query('TYPE') TYPE: string,
    @Query('BLOG') BLOG: string,
    @Query('FRESOLUTION') FRESOLUTION: string,
    @Query('TEMA') TEMA: string,
    @Query('RTITLE') RTITLE: string,
  ): Promise<EntriesModel[]> {
    return await this.entriesService.listData(
      entidad,
      entidad.DESC,
      TYPE,
      null,
      BLOG,
      FRESOLUTION,
      TEMA,
      RTITLE,
    );
  }

  @Get('list-search-data')
  async listSearchData(
    @Request() req,
    @Query('RTITLE') RTITLE: string,
    @Query('TYPE') TYPE: string,
    @Res() res,
  ): Promise<any> {
    try {
      let data: EntriesModel[] =
        await this.entriesService.listSearchData(RTITLE, 2, TYPE);

      let zip = new JSZip();

      for (let i = 0; i < data.length; i++) {
        try {
          let file = await this.s3Service.downloadFile(data[i].ENTRIEFILE);
          zip.file(data[i].TITLE + '.pdf', file);
        } catch (error) {
          console.error(
            `Error al descargar el archivo: ${data[i].ENTRIEFILE}`,
            error,
          );
          continue;
        }
      }

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=asistentes.zip`,
      );

      res.status(200).send(zipBuffer);
    } catch (error) {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  @Get('list-search-data-full')
  async listSearchDataFull(
    @Request() req,
    @Query('RTITLE') RTITLE: string,
    @Query('TYPE') TYPE: string,
  ): Promise<any> {
    return await this.entriesService.listSearchData(RTITLE, 1, TYPE);
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
  async downloadFile(
    @Body('PATH') PATH: string,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const file = await this.s3Service.downloadFile(PATH);
      res.set('Content-Type', 'application/pdf');
      res.send(file);
    } catch (error) {
      res.status(500).send('Error al descargar el archivo');
    }
  }

  @Get('busqueda')
  async busqueda(
    @Request() req,
    @Query() busqueda: BusquedaModel,
  ): Promise<EntriesModel[]> {
    busqueda.UEDCN = req.user.UCRCN;
    busqueda.IDUSR = req.user.ID;
    return await this.entriesService.busqueda(busqueda);
  }

  @Get('busqueda-favorites')
  async busquedaFavorites(
    @Request() req,
    @Query() busqueda: BusquedaModel,
  ): Promise<EntriesModel[]> {
    busqueda.UEDCN = req.user.UCRCN;
    busqueda.IDUSR = req.user.ID;
    return await this.entriesService.busquedaFavorites(busqueda);
  }

  @Get('busqueda-favorites-entrie')
  async busquedaFavoritesEntrie(
    @Request() req,
    @Query() busqueda: BusquedaModel,
  ): Promise<EntriesModel[]> {
    busqueda.UEDCN = req.user.UCRCN;
    busqueda.IDUSR = req.user.ID;
    return await this.entriesService.busquedaFavoritesEntrie(busqueda);
  }

  @Post('save-title-entrie')
  async saveTitleEntrie(
    @Request() req,
    @Body() entidad: EntriesModel,
  ): Promise<Result> {
    entidad.UCRCN = req.user.UCRCN;
    return await this.entriesService.saveTitleEntrie(entidad);
  }

  @Post('save-add-directory')
  async saveDirectory(
    @Request() req,
    @Body() entidad: BusquedaModel,
  ): Promise<Result> {
    entidad.ID = req.user.ID;
    return await this.entriesService.saveDirectory(entidad);
  }

  // ** PRUEBA PARA DOC
  @Get('doc')
  async doc(@Res() res: Response, @Query('ID') ID: number): Promise<any> {
    const data: EntriesModel = await this.entriesService.getPrint(ID);

    data.RECURSO = JSON.parse(data.RECURSO)
      .map((item) => item.LABEL)
      .join(', ');
    data.DELITO = JSON.parse(data.DELITO)
      .map((item) => item.LABEL)
      .join(', ');
    data.AMBIT = JSON.parse(data.AMBIT)
      .map((item) => item.LABEL)
      .join(', ');
    data.OJURISDICCIONAL = JSON.parse(data.OJURISDICCIONAL)
      .map((item) => item.LABEL)
      .join(', ');
    data.MAGISTRATES = JSON.parse(data.MAGISTRADOS)
      .map((item) => item.LABEL)
      .join(', ');

    let marginsRows = {
      top: 250,
      right: 250,
      bottom: 250,
      left: 250,
    };

    const doc = new Document({
      sections: [
        {
          properties: {},
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new ImageRun({
                      data: recursos.toCCFirma,
                      transformation: {
                        width: 100,
                        height: 50,
                      },
                    }),
                  ],
                }),
              ],
            }),
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: 'https://ccfirma.com/',
                      color: 'FFFFFF',
                      size: 10,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new ImageRun({
                      data: recursos.nuevoLogoJuris,
                      transformation: {
                        width: 70,
                        height: 50,
                      },
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: recursos.toIMG,
                      transformation: {
                        width: 800,
                        height: 850,
                      },
                      floating: {
                        horizontalPosition: {
                          align: 'center',
                        },
                        verticalPosition: {
                          align: 'center',
                        },
                        behindDocument: true,
                      },
                    }),
                  ],
                }),
              ],
            }),
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${data?.TITLE || ''}`,
                  bold: true,
                  size: 22,
                  font: 'Calibri',
                  color: '000000',
                }),
              ],
              alignment: AlignmentType.LEFT,
            }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'Tipo de Recurso:',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                          bullet: { level: 0 },
                        }),
                      ],
                      shading: { fill: 'FFFFFF' },
                      borders: new Object({
                        top: { color: 'FFFFFF' },
                        bottom: { color: 'FFFFFF' },
                        left: { color: 'FFFFFF' },
                        right: { color: 'FFFFFF' },
                      }),
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${data.RECURSO}`,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                          bullet: { level: 0 },
                        }),
                      ],
                      shading: {
                        fill: 'FFFFFF',
                      },
                      borders: new Object({
                        top: { color: 'FFFFFF' },
                        bottom: { color: 'FFFFFF' },
                        left: { color: 'FFFFFF' },
                        right: { color: 'FFFFFF' },
                      }),
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'Delitos:',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                          bullet: { level: 0 },
                        }),
                      ],
                      shading: {
                        fill: 'FFFFFF',
                      },
                      borders: new Object({
                        top: { color: 'FFFFFF' },
                        bottom: { color: 'FFFFFF' },
                        left: { color: 'FFFFFF' },
                        right: { color: 'FFFFFF' },
                      }),
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${data.DELITO}`,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                          bullet: { level: 0 },
                        }),
                      ],
                      shading: {
                        fill: 'FFFFFF',
                      },
                      borders: new Object({
                        top: { color: 'FFFFFF' },
                        bottom: { color: 'FFFFFF' },
                        left: { color: 'FFFFFF' },
                        right: { color: 'FFFFFF' },
                      }),
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'Vinculante:',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                          bullet: { level: 0 },
                        }),
                      ],
                      shading: {
                        fill: 'FFFFFF',
                      },
                      borders: new Object({
                        top: { color: 'FFFFFF' },
                        bottom: { color: 'FFFFFF' },
                        left: { color: 'FFFFFF' },
                        right: { color: 'FFFFFF' },
                      }),
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${data.ISBINDING ? 'Sí' : 'No'}`,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                          bullet: { level: 0 },
                        }),
                      ],
                      shading: {
                        fill: 'FFFFFF',
                      },
                      borders: new Object({
                        top: { color: 'FFFFFF' },
                        bottom: { color: 'FFFFFF' },
                        left: { color: 'FFFFFF' },
                        right: { color: 'FFFFFF' },
                      }),
                    }),
                  ],
                }),
              ],
              margins: {
                top: 100,
                right: 100,
                bottom: 100,
                left: 100,
              },
            }),
            new Table({
              width: {
                size: 10000,
                type: WidthType.DXA,
              },
              margins: {
                top: 300,
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 10000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'CONTENIDO',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 2,
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 4000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'TEMA',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                    new TableCell({
                      width: {
                        size: 6000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: renderContent(data.TEMA),
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 4000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'SUBTEMA',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                    new TableCell({
                      width: {
                        size: 6000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: renderContent(data.SUBTEMA),
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 4000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'PALABRAS CLAVES',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                    new TableCell({
                      width: {
                        size: 6000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${data?.KEYWORDS?.trim()}`,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 4000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'SÍNTESIS DE LOS FUNDAMENTOS JURÍDICOS RELEVANTES',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                    new TableCell({
                      width: {
                        size: 6000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: renderContent(data.SHORTSUMMARY),
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 4000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'FUNDAMENTOS JURÍDICOS RELEVANTES',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                      shading: {
                        fill: 'FFF2CC',
                      },
                    }),
                    new TableCell({
                      width: {
                        size: 6000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: renderContent(data.RESUMEN),
                      shading: {
                        fill: 'FFF2CC',
                      },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 10000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'IDENTIFICACIÓN',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      columnSpan: 2,
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 4000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'ÁMBITO',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                    new TableCell({
                      width: {
                        size: 6000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${data.AMBIT}`,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 4000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'FECHA DE RESOLUCIÓN',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                    new TableCell({
                      width: {
                        size: 6000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${setFechaLocale(data.FRESOLUTION)}`,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 4000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'ÓRGANO JURISDICCIONAL',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                    new TableCell({
                      width: {
                        size: 6000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${data.OJURISDICCIONAL}`,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 4000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'MAGISTRADOS',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                    new TableCell({
                      width: {
                        size: 6000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${data.MAGISTRATES}`,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 4000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'VOTO DISIDENTE',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                            new TextRun({
                              text: '\n',
                            }),
                            new TextRun({
                              text: 'Voto que discrepa del fallo final adoptado. ',
                              size: 18,
                              font: 'Calibri',
                              color: '000000',
                              italics: true,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                    new TableCell({
                      width: {
                        size: 6000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${data?.VDESIDENTE || '-'}`,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 4000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: 'VOTO CONCURRENTE',
                              bold: true,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                            new TextRun({
                              text: '\n',
                            }),
                            new TextRun({
                              text: 'Voto que disiente de la argumentación jurídica, pero no del fallo final adoptado. ',
                              size: 18,
                              font: 'Calibri',
                              color: '000000',
                              italics: true,
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                    new TableCell({
                      width: {
                        size: 6000,
                        type: WidthType.DXA,
                      },
                      margins: marginsRows,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `${data?.CVOTE || '-'}`,
                              size: 22,
                              font: 'Calibri',
                              color: '000000',
                            }),
                          ],
                          alignment: AlignmentType.LEFT,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Disposition', 'attachment; filename=ejemplo.docx');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.send(buffer);
  }
}

const setFechaLocale = (FRESOLUTION) => {
  try {
    let date = new Date(FRESOLUTION);
    date = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return '';
  }
};

const decodeHtmlEntities = (text) => {
  if (text === null) return '';
  text = text.replace(/&[a-z]+;/g, '');
  try {
    if (text.includes('<ul>')) {
      let t = text
        .split('<li>')
        .map((item) => {
          item = item.replace(/<\/?[^>]+(>|$)/g, '');
          return item;
        })
        .filter((item) => item.trim() !== '');

      return t;
    }

    return text.replace(/<[^>]*>?/gm, '');
  } catch (error) {
    return text.replace(/<[^>]*>?/gm, '');
  }
};

const renderContent = (content): any => {
  let decodedContent = decodeHtmlEntities(content);
  let array = [];

  if (Array.isArray(decodedContent)) {
    decodedContent.map((item) => {
      array.push(
        new Paragraph({
          children: [
            new TextRun({
              text: item,
              size: 22,
              font: 'Calibri',
              color: '000000',
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          bullet: { level: 0 },
        }),
      );
    });

    return array;
  }

  return [
    new Paragraph({
      children: [
        new TextRun({
          text: decodedContent,
          size: 22,
          font: 'Calibri',
          color: '000000',
        }),
      ],
      alignment: AlignmentType.JUSTIFIED,
    }),
  ];
};
