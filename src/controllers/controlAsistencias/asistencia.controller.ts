import { Body, Controller, Request, Get, Post, Query } from '@nestjs/common';
import { Result } from '../../models/result.model';
import { DataTable } from '../../models/DataTable.model.';
import { AsistenciaModel } from 'src/models/controlAsistencias/asistencia.model';
import { AsistenciaService } from 'src/services/controlAsistencias/asistencia.service';
import { EventosModel } from 'src/models/controlAsistencias/eventos.model';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as qr from 'qrcode';
import * as nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import * as uuid from 'uuid';
import * as path from 'path';
import { EmailService } from 'src/services/acompliance/email.service';

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
        entidad.UCRCN = req.user.UCRCN;
        return await this.asistenciaService.create(entidad);
    }

    @Post('addMasivo')
    async addMasivo(@Request() req, @Body() entidad: AsistenciaModel[]): Promise<any> {
        entidad = [
            {
                IDEVENTO: 3,
                EVENTO: 'Evento 3',
                CODIGO: '',
                NOMBRES: 'Carlos',
                APELLIDOS: 'Martínez',
                DNI: '54321678B',
                CORREO: 'ccarbajalmt0520@gmail.com',
                REGISTRADO: true,
            },
        ];


        entidad.forEach(evento => {
            evento.CODIGO = uuid.v4().replace(/-/g, '').substring(0, 30);
        });

        try {
            const pdfPath = path.join(__dirname, 'src', 'files', 'asistenciaVirtual.pdf');

            // Procesar cada evento y enviar el PDF con QR por correo electrónico
            for (const evento of entidad) {
                const qrText = `CODIGO:${evento.CODIGO};NOMBRES:${evento.NOMBRES};APELLIDOS:${evento.APELLIDOS};DNI: ${evento.DNI}`;
                const qrBuffer = await qr.toBuffer(qrText, { errorCorrectionLevel: 'H' });
                console.log(qr)
                const templatePDFBytes = readFileSync(pdfPath);
                const pdfDoc = await PDFDocument.load(templatePDFBytes);
                const pages = pdfDoc.getPages();
                const firstPage = pages[0];
    
                const qrDims = pdfDoc.embedPng(qrBuffer);
                firstPage.drawImage(await qrDims, {
                    x: 450,
                    y: 450,
                    width: 100,
                    height: 100,
                });

                console.log("first")

                const modifiedPDFBytes = await pdfDoc.save();

                await this.emailService.enviarCorreo(evento.CORREO, modifiedPDFBytes);

            }

            

            return await { MESSAGE: 'PDFs enviados correctamente', STATUS: true };
        } catch (err) {
            console.log(err);
            return await { MESSAGE: 'Error al enviar PDFs', STATUS: false };
        }
        // entidad.UCRCN = req.user.UCRCN;
        // return await this.asistenciaService.create(entidad);
    }
}
