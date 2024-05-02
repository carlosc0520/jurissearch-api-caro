import { Controller, Get } from '@nestjs/common';

@Controller('archivos')
export class LoginController {
    constructor(
        // private readonly appService: AppService
    ) {}

    @Get('listar')
    authenticate(): Boolean {
        return true;
    }

}
