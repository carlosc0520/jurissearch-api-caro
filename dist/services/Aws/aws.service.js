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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
    async uploadImage(entidad, file1Key, file1Path) {
        try {
            const params1 = {
                Bucket: `${process.env.AWS_BUCKET_NAME}/noticias/${entidad.TITULO}`,
                Key: file1Key,
                Body: fs.createReadStream(file1Path),
            };
            const result = await this.s3.upload(params1).promise();
            return result.Location;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async downloadFile(PATH) {
        var _a, e_1, _b, _c;
        try {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: PATH,
            };
            const stream = this.s3.getObject(params).createReadStream();
            const chunks = [];
            try {
                for (var _d = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = await stream_1.next(), _a = stream_1_1.done, !_a; _d = true) {
                    _c = stream_1_1.value;
                    _d = false;
                    const chunk = _c;
                    chunks.push(chunk);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = stream_1.return)) await _b.call(stream_1);
                }
                finally { if (e_1) throw e_1.error; }
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