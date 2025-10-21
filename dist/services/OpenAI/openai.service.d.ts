import OpenAI from 'openai';
export declare class OpenAIService {
    private openai;
    constructor();
    chat(mensaje: string): Promise<OpenAI.Chat.Completions.ChatCompletion & {
        _request_id?: string | null;
    }>;
}
