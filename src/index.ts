export { EZHostSDK } from './main';

export type {
    ShortenerResponse,
    ShortenerRequest
} from '~/routes/shortener';

export type {
    FileUploadResponse
} from '~/routes/upload';

export type {
    PasteResponse,
    CreatePasteRequest
} from '~/routes/paste';

export { shortenUrl } from './routes/shortener';
export { uploadFile } from './routes/upload';
export { createPaste } from './routes/paste';