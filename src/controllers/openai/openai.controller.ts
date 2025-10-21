import { Controller, Post, Body } from '@nestjs/common';
import { OpenAIService } from '../../services/OpenAI/openai.service';

@Controller('admin/openai')
export class OpenAIController {
    constructor(private readonly openaiService: OpenAIService) { }

    @Post('preguntar')
    async preguntar(@Body() response: any) {
        const respuesta = await this.openaiService.chat(response?.['message'] || '');
        return respuesta;
    }
}
