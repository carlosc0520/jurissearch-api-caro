import { Injectable, Query } from '@nestjs/common';
import { DataSource } from 'typeorm';
import procedures from '../configMappers';
import { Result } from '../../models/result.model';
import { EntriesModel } from 'src/models/Admin/entries.model';
import { DataTable } from 'src/models/DataTable.model.';
import { BusquedaModel } from 'src/models/Admin/busqueda.model';
import { FtpService } from 'nestjs-ftp';
import { Inject } from '@nestjs/common';
import { BoletinModel } from 'src/models/Admin/boletin.model';

@Injectable()
export class BoletinService {
  constructor(
    private connection: DataSource,
    @Inject(FtpService) private readonly ftpService: FtpService, // Inyectar el servicio FTP
  ) {}

  async add(entidad: BoletinModel): Promise<Result> {
    let queryAsync = procedures.ADMIN.BOLETINES.CRUD;

    queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify(entidad)}'` : null},`;
    queryAsync += ` @p_cUser = '${entidad.UCRCN}',`;
    queryAsync += ` @p_nTipo = ${1},`;
    queryAsync += ` @p_nId = ${0}`;

    try {
      const result = await this.connection.query(queryAsync);
      const isSuccess = result?.[0]?.RESULT > 0;
      const MESSAGE = isSuccess
        ? 'Boletín agregado correctamente'
        : 'Ocurrió un error al intentar agregar el boletín';
      return { MESSAGE, STATUS: isSuccess };
    } catch (error) {
      const MESSAGE =
        error.originalError?.info?.message ||
        'Ocurrió un error al intentar agregar el boletín';
      return { MESSAGE, STATUS: false };
    }
  }

  async list(entidad: DataTable): Promise<BoletinModel[]> {
    let queryAsync = procedures.ADMIN.BOLETINES.CRUD;
    queryAsync += ` @p_cData = ${entidad ? `'${JSON.stringify({ ...entidad })}'` : null},`;
    queryAsync += ` @p_cUser = ${null},`;
    queryAsync += ` @p_nTipo = ${4},`;
    queryAsync += ` @p_nId = ${entidad.ID || 0}`;

    try {
      const result = await this.connection.query(queryAsync);
      return result;
    } catch (error) {
      return error;
    }
  }

  // FTP
  private async uploadToFtp(
    file: Express.Multer.File,
    remotePath: string,
  ): Promise<string> {
    try {
      let nameSimple = file.originalname
        .normalize('NFD') 
        .replace(/[\u0300-\u036f]/g, '') 
        .replace(/[^a-zA-Z0-9.]/g, '_'); 
      const remoteFilePath = `${remotePath}/${nameSimple}`;

      await this.ftpService.upload(file.path, remoteFilePath); // Subir archivo usando FTP
      console.log('Archivo subido:', remoteFilePath);
      return remoteFilePath; // Retornar la ruta remota
    } catch (error) {
      console.error('Error al subir archivo:', error);
      throw new Error('Error al subir archivo al servidor FTP.');
    }
  }

  public async upload(
    basePath: string,
    file: Express.Multer.File,
  ): Promise<string> {
    if (!file) {
      throw new Error('El archivo es obligatorio.');
    }

    return this.uploadToFtp(file, basePath);
  }

  public async deleteFile(filePath: string): Promise<void> {
    try {
      await this.ftpService.delete(filePath);
    } catch (error) {
      throw new Error('Error al eliminar archivo.');
    }
  }
}
