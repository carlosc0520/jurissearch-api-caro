import { OpenAIService } from '../../services/OpenAI/openai.service';
export declare class OpenAIController {
    private readonly openaiService;
    constructor(openaiService: OpenAIService);
    preguntar(response: any): Promise<import("openai/resources/index").ChatCompletion & {
        _request_id?: string | null;
    }>;
}
