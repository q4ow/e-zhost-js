import { AxiosInstance, AxiosError } from 'axios';

export interface ShortenerResponse {
  success: boolean;
  message: string;
  shortendUrl: string;
  deletionUrl: string;
}

export interface ShortenerRequest {
  url: string;
}

interface ShortenUrlOptions {
  maxUrlLength?: number;
  timeout?: number;
}

export async function shortenUrl(
  api: AxiosInstance,
  url: string,
  options: ShortenUrlOptions = {}
): Promise<ShortenerResponse> {
  if (!url?.trim()) {
    throw new Error('URL is required and cannot be empty');
  }

  const { maxUrlLength = 2048, timeout = 5000 } = options;

  if (url.length > maxUrlLength) {
    throw new Error(`URL exceeds maximum length of ${maxUrlLength} characters`);
  }

  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  const payload: ShortenerRequest = { url: url.trim() };

  try {
    const response = await api.post<ShortenerResponse>('/shortener', payload, {
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const apiErrorMessage = error.response?.data?.message;
      throw new Error(`Failed to shorten URL: ${apiErrorMessage || error.message}`);
    }
    throw error;
  }
}
