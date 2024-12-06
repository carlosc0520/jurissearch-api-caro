/// <reference types="multer" />
import { DataSource } from 'typeorm';
import { Result } from '../../models/result.model';
import { DataTable } from 'src/models/DataTable.model.';
import { FtpService } from 'nestjs-ftp';
import { BoletinModel } from 'src/models/Admin/boletin.model';
export declare class BoletinService {
    private connection;
    private readonly ftpService;
    constructor(connection: DataSource, ftpService: FtpService);
    add(entidad: BoletinModel): Promise<Result>;
    list(entidad: DataTable): Promise<BoletinModel[]>;
    private uploadToFtp;
    upload(basePath: string, file: Express.Multer.File): Promise<string>;
    deleteFile(filePath: string): Promise<void>;
}
