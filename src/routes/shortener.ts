import { AxiosInstance } from "axios";
import { ShortenerRequest, ShortenerResponse } from "~/types/shortener";

export async function shortenUrl(api: AxiosInstance, url: string): Promise<ShortenerResponse> {
    if (!url) {
        throw new Error('URL is required');
    }

    try {
        new URL(url);
    } catch {
        throw new Error('Invalid URL format');
    }

    const payload: ShortenerRequest = { url };

    const response = await api.post<ShortenerResponse>('/shortener', payload);
    return response.data;
}