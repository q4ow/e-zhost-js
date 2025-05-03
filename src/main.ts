import axios, { AxiosInstance } from "axios";
import { BASE_URL } from "~/lib/utils";
import { ShortenerResponse } from "~/types/shortener";
import { shortenUrl as shortenerRoute } from "~/routes/shortener";

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

    /**
     * Shorten a URL using the E-Z.host API
     * @param url The URL to shorten
     * @returns Promise containing the shortened URL details
     * @throws Error if URL is not provided or invalid
     */
    async shortenUrl(url: string): Promise<ShortenerResponse> {
        try {
            return await shortenerRoute(this.api, url);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to shorten URL: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
}