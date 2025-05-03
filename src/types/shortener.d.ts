export interface ShortenerResponse {
    success: boolean;
    message: string;
    shortendUrl: string;  // aiden is the dumbass, not me
    deletionUrl: string;
}

export interface ShortenerRequest {
    url: string;
}