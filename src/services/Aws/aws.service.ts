import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import { EntriesModel } from 'src/models/Admin/entries.model';
import { NoticiaModel } from 'src/models/Admin/noticia.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
    private readonly s3: AWS.S3;

    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: 'us-east-1'
        });
        this.s3.config.update({ signatureVersion: 'v4', region: 'us-east-1' });
    }

    async uploadFiles(entidad: EntriesModel, file1Key: string, file1Path: string, file2Key: string, file2Path: string): Promise<string[]> {
        try {
            let title = entidad.TITLE.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            title = title.replace(/[^a-zA-Z0-9]/g, '_');
            let uniqueKey = uuidv4();

            const params1 = {
                Bucket: `${process.env.AWS_BUCKET_NAME}/${entidad.TYPE}/${entidad.TIPO}/${title}`,
                Key: `${uniqueKey}.pdf`,
                Body: fs.createReadStream(file1Path),
            };

            const uploadPromises = [
                this.s3.upload(params1).promise(),
                // this.s3.upload(params2).promise(),
            ];

            const results = await Promise.all(uploadPromises);
            const keys = results.map(result => result.Key);

            return keys;

        } catch (error) {
            throw new Error(error);
        }
    }

    async uploadFile(entidad: EntriesModel, file1Key: string, file1Path: string): Promise<string> {
        try {
            let title = entidad.TITLE.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            title = title.replace(/[^a-zA-Z0-9]/g, '_');
            let uniqueKey = uuidv4();

            const params1 = {
                Bucket: `${process.env.AWS_BUCKET_NAME}/${entidad.TYPE}/${entidad.TIPO}/${title}`,
                Key: `${uniqueKey}.pdf`,
                Body: fs.createReadStream(file1Path),
            };

            const result = await this.s3.upload(params1).promise();
            return result.Key;

        } catch (error) {
            throw new Error(error);
        }
    }

    async uploadImage(entidad: NoticiaModel, file1Key: string, file1Path: string): Promise<string> {
        try {
            const params1 = {
                Bucket: `${process.env.AWS_BUCKET_NAME}/noticias`,
                Key: file1Key,
                Body: fs.createReadStream(file1Path),
            };

            const result = await this.s3.upload(params1).promise();
            return result.Key;

        } catch (error) {
            throw new Error(error);
        }
    }

    async getImage(key: string): Promise<any> {
        try {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
            };

            const stream = this.s3.getObject(params).createReadStream();

            if (!stream) {
                return null;
            }

            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            return buffer;

        } catch (error) {
            throw new Error(error);
        }
    }

    async downloadFile(PATH: string): Promise<any> {
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

        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteFile(PATH: string): Promise<any> {
        try {
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: PATH,
            };
            const result = await this.s3.deleteObject(params).promise();
            return result;
        } catch (error) {
            throw new Error(error);
        }
    }

}

