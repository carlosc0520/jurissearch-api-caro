import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Client } from 'basic-ftp';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class HostingerService {
    private ftpClient: Client;

    private readonly ftpHost = 'jurissearch.com';  
    private readonly ftpUser = 'u551436692.jurisFiles';  
    private readonly ftpPassword = 'jurisFiles123$';  
    private readonly ftpDir = '/uploads/';  

    constructor() {
        this.ftpClient = new Client();
    }

    private async connectFTP() {
        if (!this.ftpClient.closed) {
            await this.ftpClient.close();
        }
        await this.ftpClient.access({
            host: this.ftpHost,
            user: this.ftpUser,
            password: this.ftpPassword,
        });
    }

    async saveFile(file: Express.Multer.File, remote: String): Promise<any> {
        if (!file) {
            throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
        }

        await this.connectFTP();

        const fileName = `${remote}/${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
        const remotePath = path.posix.join(this.ftpDir, fileName);

        try {
            await this.ftpClient.uploadFrom(fs.createReadStream(file.path), remotePath);
            fs.unlinkSync(file.path);
            return { success: true, path: remotePath };
            
        } catch (error) {
            throw new HttpException('Error al subir su archivo al servidor', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteFile(fileName: string): Promise<any> {
        if (!fileName) {
            throw new HttpException('No file name provided', HttpStatus.BAD_REQUEST);
        }

        await this.connectFTP();

        try {
            await this.ftpClient.remove(fileName);

            return { message: 'File deleted successfully from FTP' };
        } catch (error) {

        }
    }

    async getFile(fileName: string): Promise<any> {
        if (!fileName) {
            throw new HttpException('No file name provided', HttpStatus.BAD_REQUEST);
        }

        await this.connectFTP();

        try {
            const tempFilePath = path.join(__dirname, '..', 'temp', fileName);
            await this.ftpClient.downloadTo(tempFilePath, path.join(this.ftpDir, fileName));

            const fileBuffer = fs.readFileSync(tempFilePath);

            return {
                fileName,
                fileBuffer: fileBuffer.toString('base64'),
            };
        } catch (error) {
            throw new HttpException('Error downloading file from FTP', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
