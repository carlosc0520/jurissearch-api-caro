import { Body, Controller, Request, Get, Post, Query, Res } from '@nestjs/common';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { AsistenciaModel } from 'src/models/controlAsistencias/asistencia.model';
import { AsistenciaService } from 'src/services/controlAsistencias/asistencia.service';
import { EventosModel } from 'src/models/controlAsistencias/eventos.model';
import { PDFDocument, rgb, StandardFonts  } from 'pdf-lib';
import * as qr from 'qrcode';
import { readFileSync } from 'fs';
import * as uuid from 'uuid';
import * as path from 'path';
import { EmailService } from 'src/services/acompliance/email.service';
import JSZip from 'jszip';

@Controller('control/asistencias')
export class AsistenciaController {
    constructor(
        private readonly asistenciaService: AsistenciaService,
        private readonly emailService: EmailService
    ) { }

    @Get('list')
    async listFilters(@Query() entidad: DataTable): Promise<AsistenciaModel[]> {
        return await this.asistenciaService.list(entidad);
    }


    @Get('eventos')
    async eventos(@Query() entidad: DataTable): Promise<EventosModel[]> {
        return await this.asistenciaService.listEventos(entidad);
    }

    @Post('delete')
    async deleteUser(@Request() req, @Body('ID') ID: number): Promise<Result> {
        return await this.asistenciaService.delete(ID, req.user.UCRCN);
    }

    @Post('add')
    async addUser(@Request() req, @Body() entidad: AsistenciaModel): Promise<Result> {
        entidad.UCRCN = 'ADMIN_ASISTENCIAS'
        return await this.asistenciaService.createOne(entidad);
    }

    @Post('addMasivo')
    async addMasivo(@Request() req, @Body() entidad: AsistenciaModel, @Res() res): Promise<any> {
        try {
            entidad.UCRCN = 'ADMIN_ASISTENCIAS';
            let asistentes = JSON.parse(entidad.ASISTENTES);
            await asistentes.forEach(async asistente => {
                asistente.CODIGO = await uuid.v4().replace(/-/g, '').substring(0, 20);
            });

            entidad.ASISTENTES = JSON.stringify(asistentes);
            let resultado = await this.asistenciaService.create(entidad);

            // let resultado = { STATUS: true, ID: 1 };
            const zip = new JSZip();

            if (resultado.STATUS && resultado.ID > 0) {
                let pdfPath = path.join(__dirname, 'src', 'files', 'asistenciaVirtual.pdf');
                pdfPath = pdfPath.replace('controllers\\controlAsistencias\\src', 'files');

                for (const evento of asistentes) {
                    const qrText = `CODIGO:${evento.CODIGO};NOMBRES:${evento.NOMBRES}`;
                    const qrBuffer = await qr.toBuffer(qrText, { errorCorrectionLevel: 'H' });

                    const templatePDFBytes = readFileSync(pdfPath);
                    const pdfDoc = await PDFDocument.load(templatePDFBytes);
                    
                    const pages = pdfDoc.getPages();
                    const firstPage = pages[0];

                    const qrDims = pdfDoc.embedPng(qrBuffer);
                    firstPage.drawImage(await qrDims, {
                        x: 435,
                        y: 455,
                        width: 100,
                        height: 100,
                    });

                    const fontSize = 12;
                    const nombreLimpio = evento.NOMBRES.normalize("NFD").replace(/[^\x20-\x7E\u00C0-\u017F]/g, '');

                    firstPage.drawText(`${nombreLimpio}`, {
                        x: 48,
                        y: 520,
                        size: fontSize,
                        color: rgb(0, 0, 0), // color en RGB
                    });

                    const modifiedPDFBytes = await pdfDoc.save();
                    const pdfName = `${nombreLimpio.replace(' ', '_')}.pdf`;
                    zip.file(pdfName, modifiedPDFBytes);
                }

                const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

                res.setHeader('Content-Type', 'application/zip');
                res.setHeader('Content-Disposition', `attachment; filename=asistentes.zip`);
                res.status(200).send(zipBuffer);
            } else {
                throw new Error('Error al procesar los asistentes');
            }
        } catch (error) {
            console.error('Error en la generación y envío de PDFs:', error);
            res.status(500).json({ message: 'Error en la generación y envío de PDFs' });
        }
    }
}
