export { EZHostSDK } from './main';

export * from '~/types/shortener';
export * from '~/types/upload';
export * from '~/types/paste';

export { shortenUrl } from './routes/shortener';
export { uploadFile } from './routes/upload';
export { createPaste } from './routes/paste';