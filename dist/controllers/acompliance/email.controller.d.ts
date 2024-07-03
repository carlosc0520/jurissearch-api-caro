import { EmailService } from 'src/services/acompliance/email.service';
import { EmailModel } from 'src/models/acompliance/email.model';
import { Result } from 'src/models/result.model';
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    listaAll(entidad: EmailModel): Promise<Result>;
}
