import { CulqiService } from '../../services/Culqi/CulqiService';
export declare class CulqiController {
    private readonly culqiService;
    constructor(culqiService: CulqiService);
    createOrder(body: any): Promise<{
        data: any;
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    } | {
        error: any;
    }>;
    chargeWithToken(body: any, req: any): Promise<{
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
    } | {
        error: any;
    }>;
    webhook(payload: any): Promise<{
        received: boolean;
    }>;
}
