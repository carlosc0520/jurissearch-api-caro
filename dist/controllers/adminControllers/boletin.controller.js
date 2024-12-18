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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoletinController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const aws_service_1 = require("../../services/Aws/aws.service");
const fs = __importStar(require("fs"));
const DataTable_model_1 = require("../../models/DataTable.model.");
const boletin_service_1 = require("../../services/Admin/boletin.service");
const boletin_model_1 = require("../../models/Admin/boletin.model");
const user_service_1 = require("../../services/User/user.service");
const email_service_1 = require("../../services/acompliance/email.service");
let BoletinController = class BoletinController {
    constructor(boletinService, s3Service, userService, emailService) {
        this.boletinService = boletinService;
        this.s3Service = s3Service;
        this.userService = userService;
        this.emailService = emailService;
    }
    async uploadMultipleFiles(req, entidad, files) {
        try {
            const [file1, file2] = files;
            entidad.IMAGEN = await this.boletinService.upload('BOLETINES/IMAGENES', file1);
            entidad.BOLETIN = await this.boletinService.upload('BOLETINES/PDF', file2);
            let usuarios = await this.userService.listUserEmail();
            let result = await this.emailService.emailBoletines(usuarios, entidad);
            if (result.STATUS) {
                entidad.UCRCN = req.user.UCRCN;
                return await this.boletinService.add(entidad);
            }
            return { MESSAGE: 'errormessage', STATUS: false };
        }
        catch (error) {
            this.boletinService.deleteFile(entidad.IMAGEN);
            this.boletinService.deleteFile(entidad.BOLETIN);
            return { MESSAGE: error.message, STATUS: false };
        }
        finally {
            await files.forEach((file) => {
                fs.unlinkSync(file.path);
            });
        }
    }
    async list(entidad) {
        return await this.boletinService.list(entidad);
    }
};
exports.BoletinController = BoletinController;
__decorate([
    (0, common_1.Post)('add'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 20, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: function (req, file, cb) {
                const filename = `${Date.now()}-${file.originalname.replace(/\s/g, '')}`;
                return cb(null, filename);
            },
        }),
        limits: { fileSize: 100 * 1024 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, boletin_model_1.BoletinModel, Object]),
    __metadata("design:returntype", Promise)
], BoletinController.prototype, "uploadMultipleFiles", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTable_model_1.DataTable]),
    __metadata("design:returntype", Promise)
], BoletinController.prototype, "list", null);
exports.BoletinController = BoletinController = __decorate([
    (0, common_1.Controller)('admin/boletin'),
    __metadata("design:paramtypes", [boletin_service_1.BoletinService,
        aws_service_1.S3Service,
        user_service_1.UserService,
        email_service_1.EmailService])
], BoletinController);
//# sourceMappingURL=boletin.controller.js.map