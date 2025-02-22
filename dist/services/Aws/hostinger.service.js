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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostingerService = void 0;
const common_1 = require("@nestjs/common");
const basic_ftp_1 = require("basic-ftp");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
            return { message: 'File deleted successfully from FTP' };
        }
        catch (error) {
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
};
exports.HostingerService = HostingerService;
exports.HostingerService = HostingerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], HostingerService);
//# sourceMappingURL=hostinger.service.js.map