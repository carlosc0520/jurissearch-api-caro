import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async chat(mensaje: string) {
        console.log('Mensaje recibido en el servicio:', mensaje);
        const respuesta = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'Eres un asistente experto en jurisprudencia.' },
                { role: 'user', content: mensaje },
            ],
        });


        console.log('Respuesta del modelo:', respuesta);
        return respuesta;
    }

} 
