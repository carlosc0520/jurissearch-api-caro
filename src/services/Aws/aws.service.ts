import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import { EntriesModel } from 'src/models/Admin/entries.model';

@Injectable()
export class S3Service {
    private readonly s3: AWS.S3;

    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: 'us-east-1'
        });
    }

    async uploadFiles(entidad: EntriesModel, file1Key: string, file1Path: string, file2Key: string, file2Path: string): Promise<string[]> {
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

        } catch (error) {
            throw new Error(error);
        }
    }
}

