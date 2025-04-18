import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Client } from 'basic-ftp';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import { Readable } from 'stream';

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

            return { message: 'File deleted successfully from FTP', success: true };
        } catch (error) {
            return { message: 'Error deleting file from FTP', success: false };
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

    // * METODOS
    uploadFiles(files: Express.Multer.File[], remotePath: string): Promise<string> {
        if (!files || files.length === 0) {
            return Promise.reject(new HttpException('No files provided', HttpStatus.BAD_REQUEST));
        }

        return this.connectFTP()
            .then(() => {
                const savedPaths: string[] = [];
                return files.reduce((prevPromise, file) => {
                    return prevPromise.then(() => {
                        const fileName = `${remotePath}/${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                        const remoteFilePath = path.posix.join(fileName);
                        const streamSource = file.path ? fs.createReadStream(file.path) : Readable.from(file.buffer);
                        return this.ftpClient.uploadFrom(streamSource, remoteFilePath)
                            .then(() => {
                                if (file.path) {
                                    fs.unlinkSync(file.path);
                                }
                                savedPaths.push(remoteFilePath);
                            });
                    });
                }, Promise.resolve()).then(() => savedPaths.join(','));
            })
            .catch((error) => {
                console.error(`Error uploading files:`, error);
                throw new HttpException('Error uploading files', HttpStatus.INTERNAL_SERVER_ERROR);
            });
    }


    async downloadFiles(files: string[]): Promise<{ fileName: string; fileBuffer: string }> {
        if (!files || files.length === 0) {
            throw new HttpException('No file names provided', HttpStatus.BAD_REQUEST);
        }

        await this.connectFTP();

        const tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        if (files.length === 1) {
            const fileName = path.basename(files[0]);
            const tempFilePath = path.join(tempDir, fileName);
            const remoteFilePath = files[0].replace(/\\/g, '/');

            await this.ftpClient.downloadTo(tempFilePath, remoteFilePath);

            if (!fs.existsSync(tempFilePath)) {
                throw new HttpException(`File not found: ${files[0]}`, HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const fileBuffer = await fs.promises.readFile(tempFilePath);
            try {
                await fs.promises.unlink(tempFilePath);
            } catch (error) {
                console.error(`Error deleting file ${tempFilePath}:`, error);
            }

            return { fileName, fileBuffer: fileBuffer.toString('base64') };
        } else {
            const zipFilePath = path.join(tempDir, 'files.zip');
            const output = fs.createWriteStream(zipFilePath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(output);

            const downloadedFiles: string[] = [];

            for (const file of files) {
                const fileName = path.basename(file);
                const tempFilePath = path.join(tempDir, fileName);
                const remoteFilePath = file.replace(/\\/g, '/');

                await this.ftpClient.downloadTo(tempFilePath, remoteFilePath);

                if (!fs.existsSync(tempFilePath)) {
                    throw new HttpException(`File not found: ${file}`, HttpStatus.INTERNAL_SERVER_ERROR);
                }

                downloadedFiles.push(tempFilePath);
                archive.append(fs.createReadStream(tempFilePath), { name: fileName });
            }

            await archive.finalize();

            await new Promise<void>((resolve, reject) => {
                output.on('close', () => resolve());
                output.on('error', (err) => reject(err));
            });

            const zipBuffer = await fs.promises.readFile(zipFilePath);

            for (const filePath of downloadedFiles) {
                try {
                    await fs.promises.unlink(filePath);
                } catch (error) {
                    console.error(`Error deleting file ${filePath}:`, error);
                }
            }

            try {
                await fs.promises.unlink(zipFilePath);
            } catch (error) {
                console.error(`Error deleting zip file ${zipFilePath}:`, error);
            }

            return { fileName: 'files.zip', fileBuffer: zipBuffer.toString('base64') };
        }
    }

    async deleteFiles(filePaths: string[]): Promise<{ message: string }> {
        if (!filePaths || filePaths.length === 0) {
            throw new HttpException('No file paths provided', HttpStatus.BAD_REQUEST);
        }

        await this.connectFTP();

        await Promise.all(filePaths.map(async (filePath) => {
            await this.ftpClient.remove(path.posix.join(filePath));
        }));

        return { message: 'Files deleted successfully from FTP' };
    }

}
