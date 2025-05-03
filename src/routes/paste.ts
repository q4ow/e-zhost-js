import { AxiosInstance } from "axios";
import { PasteResponse, CreatePasteRequest } from "~/types/paste";

export async function createPaste(
    api: AxiosInstance,
    text: string,
    options: {
        title?: string;
        description?: string;
        language?: string;
        timeout?: number;
    } = {}
): Promise<PasteResponse> {
    if (!text?.trim()) {
        throw new Error('Paste text is required and cannot be empty');
    }

    const { timeout = 10000, ...pasteOptions } = options;

    const payload: CreatePasteRequest = {
        text: text.trim(),
        title: pasteOptions.title?.trim() || 'Untitled Paste',
        description: pasteOptions.description?.trim() || 'Created with E-Z SDK',
        language: pasteOptions.language?.trim() || 'text'
    };

    try {
        const response = await api.post('/paste', payload, { timeout });

        if (response.data && response.data.success) {
            return response.data;
        } else {
            throw new Error(`Invalid response: ${JSON.stringify(response.data)}`);
        }
    } catch (error: any) {
        if (error.response) {
            if (error.response.status === 422) {
                throw new Error(`Failed to create paste: Validation error - ${error.response.data?.message || 'Check your input data'}`);
            } else if (error.response.status === 401) {
                throw new Error('Failed to create paste: Authentication error - Check your API key');
            } else {
                throw new Error(`Failed to create paste: ${error.response.data?.message || error.message}`);
            }
        }

        throw error;
    }
}