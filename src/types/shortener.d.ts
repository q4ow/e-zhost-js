export interface ShortenerResponse {
    success: boolean;
    message: string;
    shortenedUrl: string;
    deletionUrl: string;
}

export interface ShortenerRequest {
    url: string;
}