import { Controller, Get, Query } from '@nestjs/common';
import { EmailService } from 'src/services/acompliance/email.service';
import { EmailModel } from 'src/models/acompliance/Email.model';
import { Result } from 'src/models/result.model';

@Controller('acompliance/emailSend')
export class EmailController {
    constructor(
        private readonly emailService: EmailService,
    ) { }

    @Get('sendEmail')
    async listaAll(@Query() entidad: EmailModel): Promise<Result> {
        const result = await this.emailService.sendEmail(entidad);
        return result;
    }

}
