"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const AWS = require("aws-sdk");
const fs = require("fs");
let S3Service = class S3Service {
    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: 'us-east-1'
        });
    }
    async uploadFiles(entidad, file1Key, file1Path, file2Key, file2Path) {
        try {
            const params1 = {
                Bucket: `${process.env.AWS_BUCKET_NAME}/${entidad.TYPE}/${entidad.TIPO}/${entidad.TITLE}`,
                Key: file1Key,
                Body: fs.createReadStream(file1Path),
            };
            const params2 = {
                Bucket: `${process.env.AWS_BUCKET_NAME}/${entidad.TYPE}/${entidad.TIPO}/${entidad.TITLE}`,
                Key: file2Key,
                Body: fs.createReadStream(file2Path),
            };
            const uploadPromises = [
                this.s3.upload(params1).promise(),
                this.s3.upload(params2).promise(),
            ];
            const results = await Promise.all(uploadPromises);
            const keys = results.map(result => result.Key);
            return keys;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async uploadFile(entidad, file1Key, file1Path) {
        try {
            const params1 = {
                Bucket: `${process.env.AWS_BUCKET_NAME}/${entidad.TYPE}/${entidad.TIPO}/${entidad.TITLE}`,
                Key: file1Key,
                Body: fs.createReadStream(file1Path),
            };
            const result = await this.s3.upload(params1).promise();
            console.log(result.Key);
            return result.Key;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async downloadFile(PATH) {
        try {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: PATH,
            };
            const stream = this.s3.getObject(params).createReadStream();
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            return buffer;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async deleteFile(PATH) {
        try {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: PATH,
            };
            await this.s3.deleteObject(params).promise();
        }
        catch (error) {
            throw new Error(error);
        }
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], S3Service);
//# sourceMappingURL=aws.service.js.map