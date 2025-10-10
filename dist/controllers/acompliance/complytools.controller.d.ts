import { HttpService } from '@nestjs/axios';
import { HostingerService } from 'src/services/Aws/hostinger.service';
import { Response } from 'express';
export declare class ComplytoolsController {
    private readonly httpService;
    private readonly hostingerService;
    private transporter;
    private AMBIT;
    private CONFIG;
    private Proxys;
    constructor(httpService: HttpService, hostingerService: HostingerService);
    Proxy1(entidad: any, res: any): Promise<void>;
    Proxy2(entidad: any, res: any): Promise<void>;
    Proxy2_2(entidad: any, res: any): Promise<void>;
    Proxy3(entidad: any, res: any): Promise<void>;
    Proxy3_3(entidad: any, res: any): Promise<void>;
    Proxy6(entidad: any, res: any): Promise<void>;
    Proxy7(entidad: any, res: any): Promise<void>;
    Proxy7_7(entidad: any, res: any): Promise<void>;
    Proxy8(entidad: any, res: any): Promise<void>;
    Proxy9(entidad: any, res: any): Promise<void>;
    SendEmail(entidad: any, res: any): Promise<void>;
    Genero(entidad: any, res: any): Promise<void>;
    Translate(entidad: any, res: any): Promise<void>;
    private ObtenerGenero;
    uploadFiles(files: Express.Multer.File[], remotePath: string): Promise<string>;
    downloadFiles(fileNames: string[], res: Response): Promise<void>;
    deleteFiles(filePaths: string[]): Promise<{
        message: string;
    }>;
}
