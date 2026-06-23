import {
  Body,
  Controller,
  Get,
  Param,
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
import { HostingerService } from 'src/services/Aws/hostinger.service';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import { DataTable } from 'src/models/DataTable.model.';
import { Response } from 'express';
import { BusquedaModel } from 'src/models/Admin/busqueda.model';
import { degrees, PDFDocument, rgb } from 'pdf-lib';
import * as path from 'path';
import recursos from './recursos';
import JSZip from 'jszip';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

interface MigJob {
  status: 'running' | 'done' | 'error';
  total: number; current: number; ok: number; errors: number;
  errMsg?: string;
  results: Array<{ id: number; titulo: string; campo: string; ok: boolean; error?: string }>;
}

@Controller('admin/entries')
export class EntriesController {
  constructor(
    private readonly entriesService: EntriesService,
    private readonly s3Service: S3Service,
    private readonly hostingerService: HostingerService,
  ) { }

  private async downloadEntriefile(filePath: string): Promise<Buffer> {
    if (filePath?.startsWith('/uploads/')) {
      return this.hostingerService.downloadDocumento(filePath);
    }
    return this.s3Service.downloadFile(filePath);
  }

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
      limits: { fileSize: 100 * 1024 * 1024 },
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

      const [file1] = files;
      const templatePDFBytes = fs.readFileSync(file1.path);
      const pdfDoc = await PDFDocument.load(templatePDFBytes);

      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(file1.path, pdfBytes);

      entidad.ENTRIEFILE = await this.hostingerService.uploadDocumento(file1, entidad.TYPE, entidad.TIPO);
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
      limits: { fileSize: 100 * 1024 * 1024 },
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

      const [file1] = files;
      const templatePDFBytes = fs.readFileSync(file1.path);
      const pdfDoc = await PDFDocument.load(templatePDFBytes);

      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(file1.path, pdfBytes);

      entidad.ENTRIEFILE = await this.hostingerService.uploadDocumento(file1, entidad.TYPE, entidad.TIPO);
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

        const templatePDFBytes = fs.readFileSync(file1.path);
        const pdfDoc = await PDFDocument.load(templatePDFBytes);

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(file1.path, pdfBytes);

        entidad.ENTRIEFILE = await this.hostingerService.uploadDocumento(file1, entidad.TYPE, entidad.TIPO);
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

        const templatePDFBytes = fs.readFileSync(file1.path);
        const pdfDoc = await PDFDocument.load(templatePDFBytes);

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(file1.path, pdfBytes);

        entidad.ENTRIEFILE = await this.hostingerService.uploadDocumento(file1, entidad.TYPE, entidad.TIPO);
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
    @Query('FCRCN') FCRCN: string,
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
      FCRCN,
    );
  }

  @Get('list-search-names')
  async listSearchNames(
    @Query() entidad: any): Promise<string[]> {
    return await this.entriesService.listSearchNames(entidad);
  }


  @Get('list-search-data')
  async listSearchData(
    @Request() req,
    @Query('RTITLE') RTITLE: string,
    @Query('TYPE') TYPE: string,
    @Query('BLOG') BLOG: string,
    @Res() res,
  ): Promise<any> {
    try {

      let data: EntriesModel[] = await this.entriesService.listSearchData(
        RTITLE,
        2,
        TYPE,
        BLOG,
      );

      let zip = new JSZip();
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

      let fecha = new Date('2024-11-08');

      const downloadPromises = data.map(async (entry) => {
        try {

          const fileBuffer = await this.downloadEntriefile(entry.ENTRIEFILE);

          let fEntry = new Date(entry.FCRCN);
          let modificar = false;
          if (fEntry > fecha || entry.FLGDOC === '1') {
            modificar = true;
          }
          const pdfDoc = await PDFDocument.load(fileBuffer);

          if (modificar) {
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

            const pages = await pdfDoc.getPages();

            for (const page of pages) {
              let { width, height } = page.getSize();
              let isLandscape = width > height;

              let pageWidth = isLandscape ? height : width;
              let pageHeight = isLandscape ? width : height;

              let centerX = pageWidth / 2;

              let logoTopX = 10;
              let logoTopY = pageHeight - 43;


              if (isLandscape) {
                logoTopX = pageHeight - 43;
                logoTopY = pageWidth - 20;
              }

              await page.drawImage(marcadeaguaImage, {
                x: isLandscape ? (100) : (width / 2 - 310),
                y: isLandscape ? logoTopY + 35 : (height / 2 - 330),
                width: 620,
                height: 600,
                opacity: 0.7,
                rotate: isLandscape ? degrees(-90) : degrees(0),
              });

              await page.drawImage(caroaImage, {
                x: isLandscape ? logoTopX : 10,
                y: isLandscape ? logoTopY : (height - 43),
                width: 95,
                height: 40,
                rotate: isLandscape ? degrees(-90) : degrees(0),
              });

              await page.drawImage(nuevologoImage, {
                x: isLandscape ? logoTopX : (width / 2 - 25),
                y: isLandscape ? ((logoTopY + 42) - centerX) : (height - 43),
                width: 50,
                height: 35,
                rotate: isLandscape ? degrees(-90) : degrees(0),
              });

              await page.drawImage(ccfirmaImage, {
                x: isLandscape ? 10 : (width / 2 - 30),
                y: isLandscape ? ((logoTopY + 47) - centerX) : (5),
                width: 70,
                height: 30,
                opacity: 0.9,
                rotate: isLandscape ? degrees(-90) : degrees(0),
              });

              await page.drawText('https://ccfirma.com/', {
                x: isLandscape ? logoTopX + 10 : 10,
                y: isLandscape ? logoTopY : (pageHeight - 25),
                size: 10,
                color: rgb(0, 0, 0),
                opacity: 0.0,
                rotate: isLandscape ? degrees(-90) : degrees(0),
              });

              await page.drawText('https://jurissearch.com/', {
                x: isLandscape ? pageHeight - 30 : (width / 2 - 25),
                y: isLandscape ? (pageWidth / 2) + 25 : (height - 30),
                size: 10,
                color: rgb(0, 0, 0),
                opacity: 0.0,
                rotate: isLandscape ? degrees(-90) : degrees(0),
              });

              await page.drawText('https://ccfirma.com/', {
                x: isLandscape ? 20 : (width / 2 - 30),
                y: isLandscape ? (pageWidth / 2) + 25 : 10,
                size: 10,
                color: rgb(0, 0, 0),
                opacity: 0.0,
                rotate: isLandscape ? degrees(-90) : degrees(0),
              });

              await page.drawText('https://ccfirma.com/', {
                x: isLandscape ? (pageHeight / 2) + 50 : 5,
                y: isLandscape ? (pageWidth - 20) : height / 2 - 25,
                size: 11,
                color: rgb(0, 0, 0),
                opacity: 0.0,
                rotate: isLandscape ? degrees(0) : degrees(-90),
              });

              await page.drawText('https://ccfirma.com/', {
                x: isLandscape ? (pageHeight / 2) - 70 : 5,
                y: isLandscape ? (pageWidth - 20) : height / 2 - 90,
                size: 11,
                color: rgb(0, 0, 0),
                opacity: 0.0,
                rotate: isLandscape ? degrees(0) : degrees(-90),
              });

              await page.drawText('https://ccfirma.com/', {
                x: isLandscape ? (pageHeight / 2) - 190 : 5,
                y: isLandscape ? (pageWidth - 20) : height / 2 + 90,
                size: 11,
                color: rgb(0, 0, 0),
                opacity: 0.0,
                rotate: isLandscape ? degrees(0) : degrees(-90),
              });
            }
          }

          const pdfBytes = await pdfDoc.save();
          let title = entry.TITLE.replace(/\//g, '-');

          zip.file(`${title}.pdf`, pdfBytes);
        } catch (error) {
          return null;
        }
      });

      await Promise.all(downloadPromises);

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      // Configurar la respuesta HTTP para la descarga del archivo ZIP
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=asistentes.zip`,
      );

      res.status(200).send(zipBuffer);
    } catch (error) {
      // Manejar errores del servidor
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  @Post('list-search-data-allZip')
  async listSearchDataAllZip(
    @Request() req,
    @Body('paths') paths: string,
    @Res() res,
  ) {
    let pathArray = JSON.parse(paths);

    try {
      let zip = new JSZip();
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
      let fecha = new Date('2024-11-08');

      const downloadPromises = pathArray.map(async (entry) => {
        try {
          const fileBuffer = await this.downloadEntriefile(entry.ENTRIEFILE);

          const pdfDoc = await PDFDocument.load(fileBuffer);

          let fEntry = new Date(entry.FCRCN);
          let modificar = false;
          if (fEntry > fecha || entry.FLGDOC === '1') {
            modificar = true;
          }

          if (modificar) {
            const caroaImage = await pdfDoc.embedPng(
              fs.readFileSync(pathcaroa),
            );
            const ccfirmaImage = await pdfDoc.embedPng(
              fs.readFileSync(pathccfirma),
            );
            const marcadeaguaImage = await pdfDoc.embedPng(
              fs.readFileSync(pathmarcadeagua),
            );
            const nuevologoImage = await pdfDoc.embedPng(
              fs.readFileSync(pathnuevologo),
            );

            const pages = await pdfDoc.getPages();

            for (const page of pages) {
              let { width, height } = page.getSize();
              let isLandscape = width > height;

              let pageWidth = isLandscape ? height : width;
              let pageHeight = isLandscape ? width : height;

              let centerX = pageWidth / 2;

              let logoTopX = 10;
              let logoTopY = pageHeight - 43;


              if (isLandscape) {
                logoTopX = pageHeight - 43;
                logoTopY = pageWidth - 20;
              }

              await page.drawImage(marcadeaguaImage, {
                x: isLandscape ? (100) : (width / 2 - 310),
                y: isLandscape ? logoTopY + 35 : (height / 2 - 330),
                width: 620,
                height: 600,
                opacity: 0.7,
                rotate: isLandscape ? degrees(-90) : degrees(0),
              });

              await page.drawImage(caroaImage, {
                x: isLandscape ? logoTopX : 10,
                y: isLandscape ? logoTopY : (height - 43),
                width: 95,
                height: 40,
                rotate: isLandscape ? degrees(-90) : degrees(0),
              });

              await page.drawImage(nuevologoImage, {
                x: isLandscape ? logoTopX : (width / 2 - 25),
                y: isLandscape ? ((logoTopY + 42) - centerX) : (height - 43),
                width: 50,
                height: 35,
                rotate: isLandscape ? degrees(-90) : degrees(0),
              });

              await page.drawImage(ccfirmaImage, {
                x: isLandscape ? 10 : (width / 2 - 30),
                y: isLandscape ? ((logoTopY + 47) - centerX) : (5),
                width: 70,
                height: 30,
                opacity: 0.9,
                rotate: isLandscape ? degrees(-90) : degrees(0),
              });

              await page.drawText('https://ccfirma.com/', {
                x: isLandscape ? logoTopX + 10 : 10,
                y: isLandscape ? logoTopY : (pageHeight - 25),
                size: 10,
                color: rgb(0, 0, 0),
                opacity: 0.0,
                rotate: isLandscape ? degrees(-90) : degrees(0),
              });

              await page.drawText('https://jurissearch.com/', {
                x: isLandscape ? pageHeight - 30 : (width / 2 - 25),
                y: isLandscape ? (pageWidth / 2) + 25 : (height - 30),
                size: 10,
                color: rgb(0, 0, 0),
                opacity: 0.0,
                rotate: isLandscape ? degrees(-90) : degrees(0),
              });

              await page.drawText('https://ccfirma.com/', {
                x: isLandscape ? 20 : (width / 2 - 30),
                y: isLandscape ? (pageWidth / 2) + 25 : 10,
                size: 10,
                color: rgb(0, 0, 0),
                opacity: 0.0,
                rotate: isLandscape ? degrees(-90) : degrees(0),
              });

              await page.drawText('https://ccfirma.com/', {
                x: isLandscape ? (pageHeight / 2) + 50 : 5,
                y: isLandscape ? (pageWidth - 20) : height / 2 - 25,
                size: 11,
                color: rgb(0, 0, 0),
                opacity: 0.0,
                rotate: isLandscape ? degrees(0) : degrees(-90),
              });

              await page.drawText('https://ccfirma.com/', {
                x: isLandscape ? (pageHeight / 2) - 70 : 5,
                y: isLandscape ? (pageWidth - 20) : height / 2 - 90,
                size: 11,
                color: rgb(0, 0, 0),
                opacity: 0.0,
                rotate: isLandscape ? degrees(0) : degrees(-90),
              });

              await page.drawText('https://ccfirma.com/', {
                x: isLandscape ? (pageHeight / 2) - 190 : 5,
                y: isLandscape ? (pageWidth - 20) : height / 2 + 90,
                size: 11,
                color: rgb(0, 0, 0),
                opacity: 0.0,
                rotate: isLandscape ? degrees(0) : degrees(-90),
              });
            }
          }

          const pdfBytes = await pdfDoc.save();
          let title = entry.TITLE.replace(/\//g, '-');

          zip.file(`${title}.pdf`, pdfBytes);
        } catch (error) {
          return null;
        }
      });

      await Promise.all(downloadPromises);

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      // Configurar la respuesta HTTP para la descarga del archivo ZIP
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=asistentes.zip`,
      );

      res.status(200).send(zipBuffer);
    } catch (error) {
      // Manejar errores del servidor
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  @Get('list-search-data-full')
  async listSearchDataFull(
    @Query('RTITLE') RTITLE: string,
    @Query('TYPE') TYPE: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      RTITLE = null;

      let dataArray = await this.entriesService.listSearchData(RTITLE, 1, TYPE);

      dataArray = dataArray.slice(0, 1000);
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
      const zip = new JSZip();
      let margin = [40, 10, 40, 10];
      let totalPages = 0;
      let fontSize = 11;

      const pdfPromises = dataArray.map((data) => {
        // Procesar datos
        let ambit = JSON.parse(data.AMBIT)?.[0]?.LABEL || '';
        ambit = ambit ? ambit.replace(/\s*,/g, ',') : '';
        let magistrados = JSON.parse(data.MAGISTRADOS)?.[0]?.LABEL || '';
        magistrados = magistrados ? magistrados.replace(/\s*,/g, ',') : '';
        let delitos = JSON.parse(data.DELITO)?.[0]?.LABEL || '';
        delitos = delitos ? delitos.replace(/\s*,/g, ',') : '';
        let ojurisdiccional =
          JSON.parse(data.OJURISDICCIONAL)?.[0]?.LABEL || '';
        ojurisdiccional = ojurisdiccional
          ? ojurisdiccional.replace(/\s*,/g, ',')
          : '';
        let recursosEntrie = JSON.parse(data.RECURSO)?.[0]?.LABEL || '';
        recursosEntrie = recursosEntrie
          ? recursosEntrie.replace(/\s*,/g, ',')
          : '';
        let materias = JSON.parse(data.MATERIA)?.[0]?.LABEL || '';
        materias = materias ? materias.replace(/\s*,/g, ',') : '';

        data = {
          ...data,
          ID: data.ID,
          TITLE: data.TITLE,
          AMBIT: ambit,
          FRESOLUTION: data.FRESOLUTION
            ? new Date(data.FRESOLUTION).toLocaleDateString('es-PE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
            : '',
          OJURISDICCIONAL: ojurisdiccional,
          MAGISTRATES: magistrados,
          VDESIDENTE: data.VDESIDENTE,
          CVOTE: data.CVOTE,
          ENTRIEFILE: data.ENTRIEFILE,
          ENTRIEFILERESUMEN: data.ENTRIEFILERESUMEN,
          KEYWORDS: data.KEYWORDS?.replace(/\s*,/g, ', '),
          TEMA: data.TEMA,
          SUBTEMA: data.SUBTEMA,
          SHORTSUMMARY: data.SHORTSUMMARY,
          RESUMEN: data.RESUMEN,
          NENTRIEFILERESUMEN: null,
          NENTRIEFILE: null,
          DELITO: delitos,
          RECURSO: recursosEntrie,
          MATERIA: materias,
        };

        // Configurar documento PDF
        const documentoPDF = {
          header: (currentPage, pageCount) => ({
            style: 'headerStyle',
            columns: [
              {
                width: '*',
                text: '',
                alignment: 'center',
                margin: [40, 40, 40, 40],
              },
              {
                width: 'auto',
                stack: [
                  {
                    image: recursos.nuevoLogoJuris,
                    width: 60,
                    link: 'http://web-juris-search-caro.s3-website-us-east-1.amazonaws.com/',
                    alignment: 'center',
                    margin: [0, 20, 0, 0],
                  },
                ],
              },
              {
                width: '*',
                text: '',
                alignment: 'center',
                margin: [40, 40, 40, 40],
              },
            ],
          }),
          background: [
            {
              image: recursos.toIMG,
              width: 620,
              height: 600,
              absolutePosition: { x: 5, y: 150 },
              alignment: 'center',
              opacity: 0.5,
            },
          ],
          content: [
            {
              text: `${data.TITLE}`,
              style: 'header',
              alignment: 'left',
              margin: [40, -20, 40, 10],
              bold: true,
              fontFace: 'Calibri',
            },
            {
              columns: [
                {
                  ul: [`Caso Emblemático`, `Tipo de Recurso:`, `Delitos:`, `Vinculante:`],
                  margin: [margin[0], 0, 0, 0],
                  fontSize,
                  lineHeight: 1.5,
                  width: '35%',
                  fontFace: 'Calibri',
                },
                {
                  ul: [
                    `${data?.CASO || ''}`,
                    `${data?.RECURSO || ''}`,
                    `${data?.DELITO || ''}`,
                    `${data.ISBINDING ? 'Sí' : 'No'}`,
                  ],
                  margin: [0, 5, margin[0] + 20, 0],
                  fontSize,
                  lineHeight: 1.5,
                  width: '65%',
                  fontFace: 'Calibri',
                },
              ],
            },
            {
              style: 'tableExample',
              table: {
                dontBreakRows: false,
                widths: ['35%', '65%'],
                body: [
                  [
                    {
                      text: 'CONTENIDO',
                      bold: true,
                      colSpan: 2,
                      fontSize,
                      alignment: 'center',
                      margin: [20, 15, 20, 15],
                    },
                    {},
                  ],
                  [
                    {
                      text: 'TEMA',
                      bold: true,
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                    this.renderContent(data.TEMA, fontSize, [10, 15, 10, 15]),
                  ],
                  [
                    {
                      text: 'SUBTEMA',
                      bold: true,
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                    this.renderContent(
                      data.SUBTEMA,
                      fontSize,
                      [10, 15, 10, 15],
                    ),
                  ],
                  [
                    {
                      text: 'PALABRAS CLAVES',
                      bold: true,
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                    {
                      text: data.KEYWORDS,
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                  ],
                  [
                    {
                      text: 'SÍNTESIS',
                      bold: true,
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                    this.renderContent(
                      data.SHORTSUMMARY,
                      fontSize,
                      [10, 15, 10, 15],
                    ),
                  ],
                  [
                    {
                      text: 'FUNDAMENTOS JURÍDICOS RELEVANTES',
                      bold: true,
                      fontSize,
                      margin: [10, 15, 10, 15],
                      fillColor: '#fff2cc',
                    },

                    {
                      ...this.renderContent(
                        data.RESUMEN,
                        fontSize,
                        [10, 15, 10, 15],
                      ),
                      fillColor: '#fff2cc',
                      italics: true,
                    },
                  ],
                  [
                    {
                      text: 'IDENTIFICACIÓN',
                      bold: true,
                      fontSize,
                      colSpan: 2,
                      alignment: 'center',
                      margin: [10, 15, 10, 15],
                    },
                    {},
                  ],
                  [
                    {
                      text: 'ÁMBITO',
                      bold: true,
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                    {
                      text: data.AMBIT,
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                  ],
                  [
                    {
                      text: 'FECHA DE RESOLUCIÓN',
                      bold: true,
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                    {
                      text: data.FRESOLUTION,
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                  ],
                  [
                    {
                      text: 'ÓRGANO JURISDICCIONAL',
                      bold: true,
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                    {
                      text: data.OJURISDICCIONAL,
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                  ],
                  [
                    {
                      text: 'MAGISTRADOS',
                      bold: true,
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                    {
                      text: data.MAGISTRATES,
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                  ],
                  [
                    {
                      text: [
                        'VOTO DEL DESIDENTE\n',
                        {
                          text: 'Voto que discrepa del fallo final adoptado.',
                          fontSize: fontSize - 2,
                          bold: false,
                          italics: true,
                        },
                      ],
                      bold: true,
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                    {
                      text: data?.VDESIDENTE?.replace(/,/g, ', ') || "-",
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                  ],
                  [
                    {
                      text: [
                        'VOTO CONCURRENTE\n',
                        {
                          text: 'Voto que disiente de la argumentación jurídica, pero no del fallo final adoptado.',
                          fontSize: fontSize - 1,
                          bold: false,
                          italics: true,
                        },
                      ],
                      bold: true,
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                    {
                      text: data?.CVOTE?.replace(/,/g, ', ') || '-',
                      fontSize,
                      margin: [10, 15, 10, 15],
                    },
                  ],
                ],
              },
            },
            { text: '\n\n\n' },
          ],
          styles: {
            FontFace: 'Calibri',
            headerStyle: {
              fontSize: 18,
              bold: true,
              margin: [0, 0, 0, 5],
            },
            tableExample: {
              margin: [margin[0], 10, margin[2], 10],
              FontFace: 'Calibri',
            },
            footer: {
              FontFace: 'Calibri',
              fontSize: 10,
              margin: [40, 50, 40, 10],
            },
          },
          footer: function (currentPage, pageCount) {
            if (currentPage > totalPages) {
              totalPages = currentPage;
            }
            return {
              style: 'footer',
              columns: [
                {
                  width: '*',
                  text: ``,
                  alignment: 'left',
                  color: 'transparent',
                },
                {
                  width: 'auto',
                  text: 'www.',
                  alignment: 'center',
                  color: 'gray',
                },
                {
                  width: 'auto',
                  text: 'ccfirma',
                  alignment: 'center',
                  color: '#e81eb2',
                  link: 'https://ccfirma.com/',
                },
                {
                  width: 'auto',
                  text: '.com',
                  alignment: 'center',
                  color: 'gray',
                },
                {
                  width: '*',
                  text: `Página ${currentPage} de ${pageCount}`,
                  alignment: 'right',
                },
              ],
            };
          },

          pageMargins: [40, 100, 40, 80],
        };

        // Generar PDF
        const pdfDoc = pdfMake.createPdf(documentoPDF);
        return new Promise<Buffer>((resolve, reject) => {
          pdfDoc.getBuffer((buffer) => {
            let title = data.TITLE.replace(/\//g, '-');
            const fileName = `${title.toUpperCase()} - RESUMEN EJECUTIVO.pdf`;
            zip.file(fileName, buffer);
            resolve(buffer);
          });
        });
      });

      await Promise.all(pdfPromises);

      // Generar y enviar el ZIP
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=entradas.zip`);
      res.status(200).send(zipBuffer);
    } catch (error) {
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  private renderContent(content, fontSize, margin) {
    let decodedContent = this.decodeHtmlEntities(content);

    if (Array.isArray(decodedContent)) {
      return {
        ul: decodedContent,
        fontSize,
        alignment: 'justify',
        margin,
      };
    }

    return {
      text: decodedContent,
      fontSize,
      alignment: 'justify',
      margin,
    };
  }

  private decodeHtmlEntities(text) {
    if (text === null) return '';

    text = text.replace(/&[a-z]+;/g, ''); // Decodificar entidades HTML básicas

    try {
      // Reemplazar etiquetas HTML que indican saltos de línea
      text = text
        .replace(/<br\s*\/?>/gi, '\n')   // Convertir <br> en saltos de línea
        .replace(/<\/p>/gi, '\n')        // Convertir </p> en saltos de línea
        .replace(/<\/?[^>]+(>|$)/g, ''); // Eliminar cualquier otra etiqueta HTML

      return text;
    } catch (error) {
      return text.replace(/<[^>]*>?/gm, '');
    }

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
      let data = await this.entriesService.getEntriePrint(PATH);

      let fecha = new Date('2024-11-08');
      let modificar = false;

      if (data.FCRCN > fecha || data.FLGDOC === '1') {
        modificar = true;
      }

      const fileBuffer = await this.downloadEntriefile(PATH);

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

      const pdfDoc = await PDFDocument.load(fileBuffer);
      const caroaImage = await pdfDoc.embedPng(fs.readFileSync(pathcaroa));
      const ccfirmaImage = await pdfDoc.embedPng(fs.readFileSync(pathccfirma));
      const marcadeaguaImage = await pdfDoc.embedPng(
        fs.readFileSync(pathmarcadeagua),
      );
      const nuevologoImage = await pdfDoc.embedPng(
        fs.readFileSync(pathnuevologo),
      );

      const pages = pdfDoc.getPages();

      if (modificar) {
        for (const page of pages) {
          let { width, height } = page.getSize();
          let isLandscape = width > height;

          let pageWidth = isLandscape ? height : width;
          let pageHeight = isLandscape ? width : height;

          let centerX = pageWidth / 2;

          let logoTopX = 10;
          let logoTopY = pageHeight - 43;


          if (isLandscape) {
            logoTopX = pageHeight - 43;
            logoTopY = pageWidth - 20;
          }

          page.drawImage(marcadeaguaImage, {
            x: isLandscape ? (100) : (width / 2 - 310),
            y: isLandscape ? logoTopY + 35 : (height / 2 - 330),
            width: 620,
            height: 600,
            opacity: 0.7,
            rotate: isLandscape ? degrees(-90) : degrees(0),
          });

          page.drawImage(caroaImage, {
            x: isLandscape ? logoTopX : 10,
            y: isLandscape ? logoTopY : (height - 43),
            width: 95,
            height: 40,
            rotate: isLandscape ? degrees(-90) : degrees(0),
          });

          page.drawImage(nuevologoImage, {
            x: isLandscape ? logoTopX : (width / 2 - 25),
            y: isLandscape ? ((logoTopY + 42) - centerX) : (height - 43),
            width: 50,
            height: 35,
            rotate: isLandscape ? degrees(-90) : degrees(0),
          });

          page.drawImage(ccfirmaImage, {
            x: isLandscape ? 10 : (width / 2 - 30),
            y: isLandscape ? ((logoTopY + 47) - centerX) : (5),
            width: 70,
            height: 30,
            opacity: 0.9,
            rotate: isLandscape ? degrees(-90) : degrees(0),
          });

          page.drawText('https://ccfirma.com/', {
            x: isLandscape ? logoTopX + 10 : 10,
            y: isLandscape ? logoTopY : (pageHeight - 25),
            size: 10,
            color: rgb(0, 0, 0),
            opacity: 0.0,
            rotate: isLandscape ? degrees(-90) : degrees(0),
          });

          page.drawText('https://jurissearch.com/', {
            x: isLandscape ? pageHeight - 30 : (width / 2 - 25),
            y: isLandscape ? (pageWidth / 2) + 25 : (height - 30),
            size: 10,
            color: rgb(0, 0, 0),
            opacity: 0.0,
            rotate: isLandscape ? degrees(-90) : degrees(0),
          });

          page.drawText('https://ccfirma.com/', {
            x: isLandscape ? 20 : (width / 2 - 30),
            y: isLandscape ? (pageWidth / 2) + 25 : 10,
            size: 10,
            color: rgb(0, 0, 0),
            opacity: 0.0,
            rotate: isLandscape ? degrees(-90) : degrees(0),
          });

          page.drawText('https://ccfirma.com/', {
            x: isLandscape ? (pageHeight / 2) + 50 : 5,
            y: isLandscape ? (pageWidth - 20) : height / 2 - 25,
            size: 11,
            color: rgb(0, 0, 0),
            opacity: 0.0,
            rotate: isLandscape ? degrees(0) : degrees(-90),
          });

          page.drawText('https://ccfirma.com/', {
            x: isLandscape ? (pageHeight / 2) - 70 : 5,
            y: isLandscape ? (pageWidth - 20) : height / 2 - 90,
            size: 11,
            color: rgb(0, 0, 0),
            opacity: 0.0,
            rotate: isLandscape ? degrees(0) : degrees(-90),
          });

          page.drawText('https://ccfirma.com/', {
            x: isLandscape ? (pageHeight / 2) - 190 : 5,
            y: isLandscape ? (pageWidth - 20) : height / 2 + 90,
            size: 11,
            color: rgb(0, 0, 0),
            opacity: 0.0,
            rotate: isLandscape ? degrees(0) : degrees(-90),
          });

        }
      }


      const pdfBytes = await pdfDoc.save();
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="modified-file.pdf"`,
      });
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      res.status(500).send('Error al descargar el archivo');
    }
  }

  @Get('listTopSearch')
  async listTopSearch(
    @Request() req,
    @Query('TYPE') TYPE: string,
  ): Promise<EntriesModel[]> {
    return await this.entriesService.listTopSearch(req.user.UCRCN, TYPE);
  }

  @Post('intercambio-order-search')
  async intercambioOrderSearch(
    @Request() req,
    @Body() entidad: any
  ): Promise<Result> {
    entidad.UCRCN = req.user.UCRCN;
    return await this.entriesService.intercambioOrderSearch(entidad);
  }

  @Post('clearTopSearch')
  async clearTopSearch(
    @Request() req,
    @Body() entidad: any
  ): Promise<Result> {
    entidad.UCRCN = req.user.UCRCN;
    return await this.entriesService.clearTopSearch(entidad);
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

  @Get('filters-busqueda-search')
  async filtersBusquedaSearch(
    @Request() req,
    @Query() busqueda: BusquedaModel,
  ): Promise<EntriesModel[]> {
    busqueda.UEDCN = req.user.UCRCN;
    busqueda.IDUSR = req.user.ID;
    return await this.entriesService.filtersBusquedaSearch(busqueda);
  }

  @Post('save-open-entrie')
  async saveOpenEntrie(
    @Request() req,
    @Body() entidad: BusquedaModel,
  ): Promise<Result> {
    entidad.UEDCN = req.user.UCRCN;
    entidad.IDUSR = req.user.ID;
    return await this.entriesService.saveOpenEntrie(entidad);
  }

  @Get('busqueda-sugges')
  async busquedaSugges(
    @Request() req,
    @Query() busqueda: BusquedaModel,
  ): Promise<EntriesModel[]> {
    busqueda.UEDCN = req.user.UCRCN;
    busqueda.IDUSR = req.user.ID;
    return await this.entriesService.busquedaSugges(busqueda);
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
    entidad.UEDCN = req.user.UCRCN;
    return await this.entriesService.saveDirectory(entidad);
  }

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
      .map((item) => item?.LABEL?.trim())
      .join(', ');
    data.JURISDICCION = JSON.parse(data?.JURISDICCION || '[]')
      .map((item) => item?.LABEL?.trim())
      .join(', ');

    const templatePath = path.join(__dirname, '..', '..', 'files/files', 'template_resumen.docx');
    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '<<', end: '>>' },
    });

    let keywords = "";
    if (data.KEYWORDS) {
      keywords = data.KEYWORDS
        .split(',')
        .map(item => item.trim())
        // .map(item => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
        .join(', ');
    }

    doc.render({
      title_temp: data?.TITLE || "",
      recurso_temp: data?.RECURSO?.replace(/\s*, /g, '\n') || "",
      delitos_temp: data?.DELITO?.replace(/\s*, /g, '\n') || "",
      vinculante_temp: data?.ISBINDING || "" ? 'Sí' : 'No',
      table_tema: renderText(data?.TEMA || ""),
      tabla_subtema: renderText(data?.SUBTEMA || ""),
      tabla_palabras: keywords,
      tabla_sintesis: renderText(data?.SHORTSUMMARY || ""),
      tabla_fundamentos: renderText(data?.RESUMEN || ""),
      tabla_penal: data?.AMBIT || "",
      tabla_fecha: data?.FRESOLUTIONSTRING || "",
      tabla_jurisdiccional: data?.OJURISDICCIONAL || "",
      tabla_magistrados: data?.MAGISTRATES?.replace(/\s*, /g, ', ') || "",
      tabla_voto: data?.VDESIDENTE?.replace(/,/g, ', ') || "-",
      tabla_votoc: data?.CVOTE?.replace(/,/g, ', ') || '-',
      year_footer: new Date().getFullYear(),
      link_text: "Haz clic aquí",
      link_url: "https://ejemplo.com"
    });
    // link_url: "https://api.jurissearch.com/login/download-file?PATH=" + data?.ENTRIEFILE + "&TITLE=" + data?.TITLE,

    const buffer = doc.getZip().generate({ type: 'nodebuffer' });
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${makeSafeContentDisposition(data?.TITLE)}"`,
    });
    res.send(buffer);
  }

  // ── Migración S3 → Hostinger ──────────────────────────────────────────────
  private migJobs = new Map<string, MigJob>();

  @Get('migration/preview')
  async migrationPreview() {
    const conn = this.entriesService['connection'];
    const rows: any[] = await conn.query(
      `SELECT COUNT(*) AS total FROM JURIS.ENTRADA
       WHERE ENTRIEFILE LIKE 'ju%' OR ENTRIEFILE LIKE 'le%'
          OR ENTRIEFILERESUMEN LIKE 'ju%' OR ENTRIEFILERESUMEN LIKE 'le%'`,
    );
    return { total: rows[0]?.total ?? rows[0]?.[''] ?? 0 };
  }

  @Post('migration/start')
  async migrationStart() {
    const jobId = Date.now().toString(36);
    const job: MigJob = { status: 'running', total: 0, current: 0, ok: 0, errors: 0, results: [] };
    this.migJobs.set(jobId, job);
    this.runMigration(job).catch((err) => {
      job.status = 'error';
      job.errMsg = (err as any)?.message ?? String(err);
      console.error('[Migration] Error fatal:', job.errMsg);
    });
    return { jobId };
  }

  private async runMigration(job: MigJob) {
    const conn = this.entriesService['connection'];
    const rows: any[] = await conn.query(
      `SELECT ID, TITULO, ENTRIEFILE, ENTRIEFILERESUMEN FROM JURIS.ENTRADA
       WHERE ENTRIEFILE LIKE 'ju%' OR ENTRIEFILE LIKE 'le%'
          OR ENTRIEFILERESUMEN LIKE 'ju%' OR ENTRIEFILERESUMEN LIKE 'le%'`,
    );
    job.total = rows.length;

    for (const row of rows) {
      job.current++;
      for (const campo of ['ENTRIEFILE', 'ENTRIEFILERESUMEN'] as const) {
        const oldPath: string = row[campo];
        if (!oldPath || (!oldPath.startsWith('ju') && !oldPath.startsWith('le'))) continue;
        try {
          // TYPE y TIPO se extraen del propio path S3: {TYPE}/{TIPO}/{title}/{uuid}.pdf
          const parts   = oldPath.split('/');
          const tipo    = parts[0] ?? 'general';
          const subtipo = parts[1] ?? 'general';

          const buffer  = await this.s3Service.downloadFile(oldPath);
          const newPath = await this.hostingerService.uploadFromBuffer(buffer, 'pdf', tipo, subtipo);
          await conn.query(
            `UPDATE JURIS.ENTRADA SET ${campo} = @0,
             FEDCN = SYSDATETIMEOFFSET() AT TIME ZONE 'SA Pacific Standard Time' WHERE ID = @1`,
            [newPath, row.ID],
          );
          job.ok++;
          job.results.push({ id: row.ID, titulo: row.TITULO, campo, ok: true });
        } catch (err) {
          job.errors++;
          job.results.push({ id: row.ID, titulo: row.TITULO, campo, ok: false, error: (err as any)?.message });
        }
      }
    }
    job.status = 'done';
  }

  @Get('migration/progress/:jobId')
  migrationProgress(@Param('jobId') jobId: string) {
    const job = this.migJobs.get(jobId);
    if (!job) return { status: 'not_found' };
    const { status, total, current, ok, errors, errMsg } = job;
    return { status, total, current, ok, errors, errMsg };
  }

  @Get('migration/excel/:jobId')
  async migrationExcel(@Param('jobId') jobId: string, @Res() res: Response) {
    const job = this.migJobs.get(jobId);
    if (!job || job.status !== 'done') { res.status(400).json({ error: 'Job no disponible' }); return; }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Migración');
    ws.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Título', key: 'titulo', width: 50 },
      { header: 'Campo', key: 'campo', width: 20 },
      { header: 'Estado', key: 'estado', width: 10 },
      { header: 'Error', key: 'error', width: 60 },
    ];
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e3a5f' } };
    ws.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
    for (const r of job.results) {
      ws.addRow({ id: r.id, titulo: r.titulo, campo: r.campo, estado: r.ok ? 'OK' : 'ERROR', error: r.error ?? '' });
    }
    const buffer = await (wb.xlsx.writeBuffer() as unknown as Promise<Buffer>);
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename="migracion.xlsx"' });
    res.send(buffer);
  }

  // ── Sync archivos desde JSON exportado de V2 ─────────────────────────────
  @Post('sync-files')
  async syncFiles(@Body() body: { entries: Array<{ id: number; titulo: string; entriefile: string; entriefileresumen: string }> }) {
    const entries = body?.entries ?? [];
    let subidos = 0, actualizados = 0;
    const conn = this.entriesService['connection'];

    for (const item of entries) {
      const ef     = String(item.entriefile ?? '').trim();
      const efr    = String(item.entriefileresumen ?? '').trim();
      const titulo = String(item.titulo ?? '').trim().toUpperCase();

      // Contar como "subido" si al menos uno de los dos campos tiene path de Hostinger
      if (ef.startsWith('/uploads/') || efr.startsWith('/uploads/')) {
        subidos++;
      } else {
        continue; // sin archivos migrados, no hay nada que actualizar
      }

      // Actualizar solo si coinciden AMBOS: ID y TITULO
      const r: any = await conn.query(
        `UPDATE JURIS.ENTRADA
         SET ENTRIEFILE = @0, ENTRIEFILERESUMEN = @1,
             FEDCN = SYSDATETIMEOFFSET() AT TIME ZONE 'SA Pacific Standard Time'
         WHERE ID = @2 AND UPPER(TITULO) = @3`,
        [ef || null, efr || null, item.id, titulo],
      );
      const affected = r?.[0]?.rowsAffected?.[0] ?? (r as any)?.rowsAffected?.[0] ?? 0;
      if (affected > 0) actualizados++;
    }

    return { total: entries.length, subidos, actualizados };
  }
}

function makeSafeContentDisposition(rawName: string | undefined): string {
  const name = (rawName || 'document').toString();

  // 1) Elimina caracteres de control y saltos de línea
  const cleaned = name.replace(/[\u0000-\u001F\u007F]/g, '').trim();

  // 2) Versión ASCII "segura" (fallback) — reemplaza no ASCII por guion
  const asciiFallback = cleaned
    .normalize('NFD')                      // separa diacríticos
    .replace(/[\u0300-\u036f]/g, '')       // quita marcas de acento
    .replace(/[^\x20-\x7E]/g, '-')        // cualquier no-ASCII -> '-'
    .replace(/["\\]/g, '')                // quita comillas y backslash
    .replace(/\/+/g, '-')                 // evita slashes
    .replace(/[-\s]+/g, '-')              // colapsa espacios/guiones repetidos
    .replace(/^-+|-+$/g, '')              // quita guiones al inicio/fin
    .slice(0, 120) || 'document';

  // 3) Versión UTF-8 encoded para filename* (RFC5987)
  const utf8 = cleaned
    .replace(/["\\]/g, '')               // quita comillas/backslash
    .slice(0, 240);                      // limitar largo por seguridad

  const encodedUtf8 = encodeURIComponent(utf8);

  // 4) Construye header seguro usando filename (ASCII) + filename* (UTF-8)
  return `attachment; filename="${asciiFallback}.docx"; filename*=UTF-8''${encodedUtf8}.docx`;
}


const decodeHtmlEntities = (text) => {
  if (text === null) return '';

  text = text.replace(/&[a-z]+;/g, '');

  try {
    text = text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/?[^>]+(>|$)/g, '');

    return text;
  } catch (error) {
    return text.replace(/<[^>]*>?/gm, '');
  }
};

const renderText = (text): any => {
  let textSalt = decodeHtmlEntities(text);
  text = "";
  if (Array.isArray(textSalt)) {
    textSalt.map((item) => {
      text += item + "\n";
    });
    return text;
  }

  return textSalt;

}

