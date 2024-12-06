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
import { Result } from 'src/models/result.model';
import { diskStorage } from 'multer';
import { S3Service } from 'src/services/Aws/aws.service';
import * as fs from 'fs';
import { DataTable } from 'src/models/DataTable.model.';
import { Response } from 'express';
import { BusquedaModel } from 'src/models/Admin/busqueda.model';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as path from 'path';
import { BoletinService } from 'src/services/Admin/boletin.service';
import { BoletinModel } from 'src/models/Admin/boletin.model';
import { UserService } from 'src/services/User/user.service';
import { EmailService } from 'src/services/acompliance/email.service';

@Controller('admin/boletin')
export class BoletinController {
  constructor(
    private readonly boletinService: BoletinService,
    private readonly s3Service: S3Service,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
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
      limits: { fileSize: 100 * 1024 * 1024 * 1024 },
    }),
  )
  async uploadMultipleFiles(
    @Request() req,
    @Body() entidad: BoletinModel,
    @UploadedFiles() files,
  ): Promise<any> {
    try {
      const [file1, file2] = files;
      
      entidad.IMAGEN = await this.boletinService.upload('BOLETINES/IMAGENES', file1);
      entidad.BOLETIN  = await this.boletinService.upload('BOLETINES/IMAGENES', file2);

    
      let usuarios =   await this.userService.listUserEmail();
      console.log(usuarios);
      let result =  await this.emailService.emailBoletines(usuarios, entidad);
      if(result.STATUS){
        return await this.boletinService.add(entidad);
      }

      return { MESSAGE: 'errormessage', STATUS: false };

    } catch (error) {
      this.boletinService.deleteFile(entidad.IMAGEN);
      this.boletinService.deleteFile(entidad.BOLETIN);
      return { MESSAGE: error.message, STATUS: false };
    } finally {
      await files.forEach((file) => {
        fs.unlinkSync(file.path);
      });
    }
  }

  @Get('list')
  async list(@Query() entidad: DataTable): Promise<BoletinModel[]> {
      return await this.boletinService.list(entidad);
  }
}
