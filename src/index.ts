export { EZHostSDK } from './main';

export type {
    ShortenerResponse,
    ShortenerRequest
} from './types/shortener';

export type {
    FileUploadResponse
} from './types/upload';

export type {
    PasteResponse,
    CreatePasteRequest
} from './types/paste';

export { shortenUrl } from './routes/shortener';
export { uploadFile } from './routes/upload';
export { createPaste } from './routes/paste';