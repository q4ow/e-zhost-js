import axios, { AxiosInstance } from "axios";
import { BASE_URL } from "./lib/utils";
import { ShortenerResponse } from "./types/shortener";
import { FileUploadResponse } from "./types/upload";
import { PasteResponse } from "./types/paste";
import { shortenUrl } from "./routes/shortener";
import { uploadFile } from "./routes/upload";
import { createPaste } from "./routes/paste";
import { Readable } from 'stream';

export class EZHostSDK {
    private api: AxiosInstance;

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error('API key is required to initialize the SDK');
        }

        this.api = axios.create({
            baseURL: BASE_URL,
            headers: {
                "Content-Type": "application/json",
                "key": apiKey,
            },
        });
    }

    async shortenUrl(url: string, options?: { maxUrlLength?: number; timeout?: number }): Promise<ShortenerResponse> {
        try {
            return await shortenUrl(this.api, url, options);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to shorten URL: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }

    async uploadFile(
        file: Buffer | Blob | File | Readable,
        filename?: string,
        options?: { timeout?: number }
    ): Promise<FileUploadResponse> {
        return await uploadFile(this.api, file, filename, options);
    }

    async createPaste(
        text: string,
        options?: {
            title?: string;
            description?: string;
            language?: string;
            timeout?: number;
        }
    ): Promise<PasteResponse> {
        try {
            return await createPaste(this.api, text, options);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to create paste: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
}