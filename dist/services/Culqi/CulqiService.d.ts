import { HttpService } from '@nestjs/axios';
import { DataSource } from 'typeorm';
export declare class CulqiService {
    private readonly http;
    private connection;
    private readonly CULQI_SECRET_KEY;
    constructor(http: HttpService, connection: DataSource);
    createOrder(body: any): Promise<{
        data: any;
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    chargeWithToken(body: any): Promise<{
        MESSAGE: string;
        STATUS: boolean;
        data: any;
        success: boolean;
        message?: undefined;
        title?: undefined;
    } | {
        MESSAGE: any;
        STATUS: boolean;
        success: boolean;
        data?: undefined;
        message?: undefined;
        title?: undefined;
    } | {
        success: boolean;
        message: string;
        title: any;
        MESSAGE?: undefined;
        STATUS?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        MESSAGE?: undefined;
        STATUS?: undefined;
        data?: undefined;
        message?: undefined;
        title?: undefined;
    }>;
    handleWebhook(payload: any): Promise<{
        received: boolean;
    }>;
}
