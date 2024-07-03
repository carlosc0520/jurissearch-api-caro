import { EmailModel } from 'src/models/acompliance/email.model';
import { Result } from 'src/models/result.model';
export declare class EmailService {
    private transporter;
    private transporter2;
    private transporter3;
    constructor();
    sendEmail(email: EmailModel): Promise<Result>;
    enviarCorreo(destinatario: any, pdfBytes: any): Promise<void>;
}
