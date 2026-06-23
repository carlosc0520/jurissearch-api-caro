import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Client } from 'basic-ftp';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class HostingerService {
    private ftpClient: Client;

    private readonly ftpHost     = process.env.FTP_HOST;
    private readonly ftpUser     = process.env.FTP_USER;
    private readonly ftpPassword = process.env.FTP_PASSWORD;
    private readonly ftpDir = '/uploads/';

    constructor() {
        this.ftpClient = new Client();
    }

    private sanitizeSegment(s: string): string {
        return (s || 'other')
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, '_')
            .replace(/^_+|_+$/g, '');
    }

    // ── Sube un PDF a /uploads/documentos/{tipo}/{subtipo}/{year}/{month}/ ──
    async uploadDocumento(file: Express.Multer.File, tipo: string, subtipo: string): Promise<string> {
        if (!file) throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);

        const now       = new Date();
        const year      = now.getFullYear().toString();
        const month     = String(now.getMonth() + 1).padStart(2, '0');
        const remoteDir = `/uploads/documentos/${this.sanitizeSegment(tipo)}/${this.sanitizeSegment(subtipo)}/${year}/${month}`;
        const remotePath = `${remoteDir}/${uuidv4()}.pdf`;

        try {
            await this.connectFTP();
            await this.ftpClient.ensureDir(remoteDir);
            await this.ftpClient.uploadFrom(fs.createReadStream(file.path), remotePath);
        } catch (error) {
            console.warn(`FTP uploadDocumento failed: ${(error as any)?.message}`);
            throw new HttpException('Error al subir el archivo al servidor', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return remotePath;
    }

    // ── Descarga un PDF desde FTP y retorna Buffer ──
    async downloadDocumento(remotePath: string): Promise<Buffer> {
        const fileName = path.basename(remotePath);
        const tempDir  = path.join(process.cwd(), 'uploads', 'temp');
        const tempFile = path.join(tempDir, fileName);

        fs.mkdirSync(tempDir, { recursive: true });

        try {
            await this.connectFTP();
            await this.ftpClient.downloadTo(tempFile, remotePath);
        } catch (error) {
            const detail = (error as any)?.message ?? String(error);
            console.error('[FTP downloadDocumento]', remotePath, detail);
            throw new HttpException(
                `FTP download failed — path: ${remotePath} — ${detail}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        const buffer = fs.readFileSync(tempFile);
        try { fs.unlinkSync(tempFile); } catch { /* ignora error al limpiar temp */ }
        return buffer;
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
            console.error(`Error uploading file:`, error);
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

    async uploadFromBuffer(buffer: Buffer, ext: string, tipo: string, subtipo: string): Promise<string> {
        const now        = new Date();
        const year       = now.getFullYear().toString();
        const month      = String(now.getMonth() + 1).padStart(2, '0');
        const remoteDir  = `/uploads/documentos/${this.sanitizeSegment(tipo)}/${this.sanitizeSegment(subtipo)}/${year}/${month}`;
        const remotePath = `${remoteDir}/${uuidv4()}.${ext}`;

        const client = new Client();
        try {
            await client.access({ host: this.ftpHost, user: this.ftpUser, password: this.ftpPassword });
            await client.ensureDir(remoteDir);
            await client.uploadFrom(Readable.from(buffer), remotePath);
        } finally {
            client.close();
        }
        return remotePath;
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
