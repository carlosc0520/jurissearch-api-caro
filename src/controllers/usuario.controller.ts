import { Controller, Get } from '@nestjs/common';

@Controller('usuario')
export class LoginController {
    constructor(
        // private readonly appService: AppService
    ) {}

    @Get('listar')
    authenticate(): Boolean {
        return true;
    }

    @Get('obtener')
    obtener(): Boolean {
        return true;
    }
}
