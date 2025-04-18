"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostingerService = void 0;
const common_1 = require("@nestjs/common");
const basic_ftp_1 = require("basic-ftp");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const archiver_1 = __importDefault(require("archiver"));
const stream_1 = require("stream");
let HostingerService = class HostingerService {
    constructor() {
        this.ftpHost = 'jurissearch.com';
        this.ftpUser = 'u551436692.jurisFiles';
        this.ftpPassword = 'jurisFiles123$';
        this.ftpDir = '/uploads/';
        this.ftpClient = new basic_ftp_1.Client();
    }
    async connectFTP() {
        if (!this.ftpClient.closed) {
            await this.ftpClient.close();
        }
        await this.ftpClient.access({
            host: this.ftpHost,
            user: this.ftpUser,
            password: this.ftpPassword,
        });
    }
    async saveFile(file, remote) {
        if (!file) {
            throw new common_1.HttpException('No file provided', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.connectFTP();
        const fileName = `${remote}/${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
        const remotePath = path.posix.join(this.ftpDir, fileName);
        try {
            await this.ftpClient.uploadFrom(fs.createReadStream(file.path), remotePath);
            fs.unlinkSync(file.path);
            return { success: true, path: remotePath };
        }
        catch (error) {
            throw new common_1.HttpException('Error al subir su archivo al servidor', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteFile(fileName) {
        if (!fileName) {
            throw new common_1.HttpException('No file name provided', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.connectFTP();
        try {
            await this.ftpClient.remove(fileName);
            return { message: 'File deleted successfully from FTP', success: true };
        }
        catch (error) {
            return { message: 'Error deleting file from FTP', success: false };
        }
    }
    async getFile(fileName) {
        if (!fileName) {
            throw new common_1.HttpException('No file name provided', common_1.HttpStatus.BAD_REQUEST);
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
        }
        catch (error) {
            throw new common_1.HttpException('Error downloading file from FTP', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    uploadFiles(files, remotePath) {
        if (!files || files.length === 0) {
            return Promise.reject(new common_1.HttpException('No files provided', common_1.HttpStatus.BAD_REQUEST));
        }
        return this.connectFTP()
            .then(() => {
            const savedPaths = [];
            return files.reduce((prevPromise, file) => {
                return prevPromise.then(() => {
                    const fileName = `${remotePath}/${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                    const remoteFilePath = path.posix.join(fileName);
                    const streamSource = file.path ? fs.createReadStream(file.path) : stream_1.Readable.from(file.buffer);
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
            throw new common_1.HttpException('Error uploading files', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        });
    }
    async downloadFiles(files) {
        if (!files || files.length === 0) {
            throw new common_1.HttpException('No file names provided', common_1.HttpStatus.BAD_REQUEST);
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
                throw new common_1.HttpException(`File not found: ${files[0]}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            const fileBuffer = await fs.promises.readFile(tempFilePath);
            try {
                await fs.promises.unlink(tempFilePath);
            }
            catch (error) {
                console.error(`Error deleting file ${tempFilePath}:`, error);
            }
            return { fileName, fileBuffer: fileBuffer.toString('base64') };
        }
        else {
            const zipFilePath = path.join(tempDir, 'files.zip');
            const output = fs.createWriteStream(zipFilePath);
            const archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
            archive.pipe(output);
            const downloadedFiles = [];
            for (const file of files) {
                const fileName = path.basename(file);
                const tempFilePath = path.join(tempDir, fileName);
                const remoteFilePath = file.replace(/\\/g, '/');
                await this.ftpClient.downloadTo(tempFilePath, remoteFilePath);
                if (!fs.existsSync(tempFilePath)) {
                    throw new common_1.HttpException(`File not found: ${file}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
                downloadedFiles.push(tempFilePath);
                archive.append(fs.createReadStream(tempFilePath), { name: fileName });
            }
            await archive.finalize();
            await new Promise((resolve, reject) => {
                output.on('close', () => resolve());
                output.on('error', (err) => reject(err));
            });
            const zipBuffer = await fs.promises.readFile(zipFilePath);
            for (const filePath of downloadedFiles) {
                try {
                    await fs.promises.unlink(filePath);
                }
                catch (error) {
                    console.error(`Error deleting file ${filePath}:`, error);
                }
            }
            try {
                await fs.promises.unlink(zipFilePath);
            }
            catch (error) {
                console.error(`Error deleting zip file ${zipFilePath}:`, error);
            }
            return { fileName: 'files.zip', fileBuffer: zipBuffer.toString('base64') };
        }
    }
    async deleteFiles(filePaths) {
        if (!filePaths || filePaths.length === 0) {
            throw new common_1.HttpException('No file paths provided', common_1.HttpStatus.BAD_REQUEST);
        }
        await this.connectFTP();
        await Promise.all(filePaths.map(async (filePath) => {
            await this.ftpClient.remove(path.posix.join(filePath));
        }));
        return { message: 'Files deleted successfully from FTP' };
    }
};
exports.HostingerService = HostingerService;
exports.HostingerService = HostingerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], HostingerService);
//# sourceMappingURL=hostinger.service.js.map