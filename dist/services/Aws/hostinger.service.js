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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const uuid_1 = require("uuid");
let HostingerService = class HostingerService {
    constructor() {
        var _a, _b, _c;
        this.ftpHost = (_a = process.env.FTP_HOST) !== null && _a !== void 0 ? _a : 'jurissearch.com';
        this.ftpUser = (_b = process.env.FTP_USER) !== null && _b !== void 0 ? _b : 'u551436692.jurisFiles';
        this.ftpPassword = (_c = process.env.FTP_PASSWORD) !== null && _c !== void 0 ? _c : 'jurisFiles123$';
        this.ftpDir = '/uploads/';
        this.ftpClient = new basic_ftp_1.Client();
    }
    sanitizeSegment(s) {
        return (s || 'other')
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, '_')
            .replace(/^_+|_+$/g, '');
    }
    async uploadDocumento(file, tipo, subtipo) {
        var _a;
        if (!file)
            throw new common_1.HttpException('No file provided', common_1.HttpStatus.BAD_REQUEST);
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const remoteDir = `/uploads/documentos/${this.sanitizeSegment(tipo)}/${this.sanitizeSegment(subtipo)}/${year}/${month}`;
        const remotePath = `${remoteDir}/${(0, uuid_1.v4)()}.pdf`;
        const publicPath = process.env.HOSTINGER_PUBLIC_PATH;
        if (publicPath) {
            const localDir = path.join(publicPath, remoteDir);
            const localFile = path.join(publicPath, remotePath);
            fs.mkdirSync(localDir, { recursive: true });
            fs.copyFileSync(file.path, localFile);
            console.log(`[FS upload] ${localFile}`);
        }
        else {
            try {
                await this.connectFTP();
                await this.ftpClient.ensureDir(remoteDir);
                await this.ftpClient.uploadFrom(fs.createReadStream(file.path), remotePath);
            }
            catch (error) {
                const detail = (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : String(error);
                console.error(`[FTP uploadDocumento] ${detail}`);
                throw new common_1.HttpException(`Error al subir archivo — ${detail}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return remotePath;
    }
    async downloadDocumento(remotePath) {
        var _a, _b;
        const baseUrl = ((_a = process.env.URL_FRONT) !== null && _a !== void 0 ? _a : 'https://jurissearch.com').replace(/\/$/, '');
        const url = `${baseUrl}${remotePath}`;
        console.log(`[HTTP download] ${url}`);
        try {
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}`);
            }
            return Buffer.from(await res.arrayBuffer());
        }
        catch (error) {
            const detail = (_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : String(error);
            console.error('[HTTP downloadDocumento]', detail);
            throw new common_1.HttpException(`Download failed — ${detail}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
            console.error(`Error uploading file:`, error);
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
    async uploadFromBuffer(buffer, ext, tipo, subtipo) {
        var _a;
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const remoteDir = `/uploads/documentos/${this.sanitizeSegment(tipo)}/${this.sanitizeSegment(subtipo)}/${year}/${month}`;
        const remotePath = `${remoteDir}/${(0, uuid_1.v4)()}.${ext}`;
        const publicPath = process.env.HOSTINGER_PUBLIC_PATH;
        if (publicPath) {
            const localDir = path.join(publicPath, remoteDir);
            const localFile = path.join(publicPath, remotePath);
            fs.mkdirSync(localDir, { recursive: true });
            fs.writeFileSync(localFile, buffer);
            console.log(`[FS uploadFromBuffer] ${localFile}`);
        }
        else {
            const client = new basic_ftp_1.Client();
            try {
                await client.access({ host: this.ftpHost, user: this.ftpUser, password: this.ftpPassword });
                await client.ensureDir(remoteDir);
                await client.uploadFrom(stream_1.Readable.from(buffer), remotePath);
            }
            catch (error) {
                const detail = (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : String(error);
                console.error(`[FTP uploadFromBuffer] ${detail}`);
                throw new common_1.HttpException(`Error al subir archivo — ${detail}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            finally {
                client.close();
            }
        }
        return remotePath;
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