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
const AWS = __importStar(require("aws-sdk"));
const fs = __importStar(require("fs"));
let S3Service = class S3Service {
    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: 'us-east-1'
        });
        this.s3.config.update({ signatureVersion: 'v4', region: 'us-east-1' });
    }
    async uploadFiles(entidad, file1Key, file1Path, file2Key, file2Path) {
        try {
            const params1 = {
                Bucket: `${process.env.AWS_BUCKET_NAME}/${entidad.TYPE}/${entidad.TIPO}/${entidad.TITLE}`,
                Key: file1Key,
                Body: fs.createReadStream(file1Path),
            };
            const uploadPromises = [
                this.s3.upload(params1).promise(),
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
            return result.Key;
        }
        catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }
    async uploadImage(entidad, file1Key, file1Path) {
        try {
            const params1 = {
                Bucket: `${process.env.AWS_BUCKET_NAME}/noticias`,
                Key: file1Key,
                Body: fs.createReadStream(file1Path),
            };
            const result = await this.s3.upload(params1).promise();
            return result.Key;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async getImage(key) {
        var _a, e_1, _b, _c;
        try {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
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
    async downloadFile(PATH) {
        var _a, e_2, _b, _c;
        try {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: PATH,
            };
            const stream = this.s3.getObject(params).createReadStream();
            const chunks = [];
            try {
                for (var _d = true, stream_2 = __asyncValues(stream), stream_2_1; stream_2_1 = await stream_2.next(), _a = stream_2_1.done, !_a; _d = true) {
                    _c = stream_2_1.value;
                    _d = false;
                    const chunk = _c;
                    chunks.push(chunk);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = stream_2.return)) await _b.call(stream_2);
                }
                finally { if (e_2) throw e_2.error; }
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
            const result = await this.s3.deleteObject(params).promise();
            return result;
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