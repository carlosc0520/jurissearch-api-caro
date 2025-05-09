import { EmailModel } from 'src/models/acompliance/email.model';
import { Result } from 'src/models/result.model';
export declare class EmailService {
    private transporter;
    private transporter2;
    private transporter3;
    constructor();
    sendEmail(email: EmailModel): Promise<Result>;
    enviarCorreo(destinatario: any, pdfBytes: any): Promise<void>;
    emailBoletines(usuarios: any, entidad: any): Promise<{
        MESSAGE: string;
        STATUS: boolean;
        ERROR?: undefined;
    } | {
        MESSAGE: string;
        STATUS: boolean;
        ERROR: any;
    }>;
    emailNewNoticias(usuarios: any, TITULO: any, ID: any, ENLACE: any, PATH: any): Promise<{
        MESSAGE: string;
        STATUS: boolean;
        ERROR?: undefined;
    } | {
        MESSAGE: string;
        STATUS: boolean;
        ERROR: any;
    }>;
}
