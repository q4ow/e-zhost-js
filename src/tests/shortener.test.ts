import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { EZHostSDK } from '../main';
import { BASE_URL } from '../lib/utils';

describe('EZHostSDK', () => {
    let sdk: EZHostSDK;
    let mock: MockAdapter;
    const API_KEY = 'test-api-key';

    beforeEach(() => {
        mock = new MockAdapter(axios);
        sdk = new EZHostSDK(API_KEY);
    });

    afterEach(() => {
        mock.reset();
    });

    describe('constructor', () => {
        it('should throw error if API key is not provided', () => {
            expect(() => new EZHostSDK('')).toThrow('API key is required');
        });

        it('should create instance with valid API key', () => {
            expect(sdk).toBeInstanceOf(EZHostSDK);
        });
    });

    describe('shortenUrl', () => {
        const testUrl = 'https://example.com';
        const mockResponse = {
            success: true,
            message: 'URL Shortened',
            shortendUrl: 'https://i.e-z.gg/s/xyz123',
            deletionUrl: 'https://i.e-z.gg/shortener/delete?key=random-deletion-key'
        };

        it('should throw error if URL is not provided', async () => {
            await expect(sdk.shortenUrl('')).rejects.toThrow('URL is required');
        });

        it('should throw error if URL format is invalid', async () => {
            await expect(sdk.shortenUrl('invalid-url')).rejects.toThrow('Invalid URL format');
        });

        it('should successfully shorten a URL', async () => {
            mock.onPost(`${BASE_URL}/shortener`).reply(200, mockResponse);
            const response = await sdk.shortenUrl(testUrl);
            expect(response).toEqual(mockResponse);
        });

        it('should send correct request headers', async () => {
            mock.onPost(`${BASE_URL}/shortener`).reply(config => {
                expect(config.headers?.['Content-Type']).toBe('application/json');
                expect(config.headers?.['key']).toBe(API_KEY);
                return [200, mockResponse];
            });

            await sdk.shortenUrl(testUrl);
        });

        it('should send correct request payload', async () => {
            mock.onPost(`${BASE_URL}/shortener`).reply(config => {
                const payload = JSON.parse(config.data);
                expect(payload).toEqual({ url: testUrl });
                return [200, mockResponse];
            });

            await sdk.shortenUrl(testUrl);
        });

        it('should handle API errors', async () => {
            const errorMessage = 'Invalid URL provided';
            mock.onPost(`${BASE_URL}/shortener`).reply(400, {
                success: false,
                message: errorMessage
            });

            await expect(sdk.shortenUrl(testUrl))
                .rejects
                .toThrow(`Failed to shorten URL: ${errorMessage}`);
        });

        it('should handle network errors', async () => {
            mock.onPost(`${BASE_URL}/shortener`).networkError();

            await expect(sdk.shortenUrl(testUrl))
                .rejects
                .toThrow('Failed to shorten URL: Network Error');
        });

        it('should throw error if URL exceeds maximum length', async () => {
            const longUrl = 'https://example.com/' + 'a'.repeat(2048);
            await expect(sdk.shortenUrl(longUrl))
                .rejects
                .toThrow('URL exceeds maximum length of 2048 characters');
        });

        it('should handle custom maxUrlLength option', async () => {
            const longUrl = 'https://example.com/' + 'a'.repeat(100);
            await expect(sdk.shortenUrl(longUrl, { maxUrlLength: 50 }))
                .rejects
                .toThrow('URL exceeds maximum length of 50 characters');
        });

        it('should handle non-Axios errors', async () => {
            mock.onPost(`${BASE_URL}/shortener`).reply(() => {
                throw new Error('Custom error');
            });

            await expect(sdk.shortenUrl(testUrl))
                .rejects
                .toThrow('Custom error');
        });

        it('should pass through non-Axios errors without wrapping them', async () => {
            const customError = new Error('Internal SDK error');
            mock.onPost(`${BASE_URL}/shortener`).reply(() => {
                return Promise.reject(customError);
            });

            await expect(sdk.shortenUrl(testUrl))
                .rejects
                .toBe(customError);
        });

        it('should handle Axios errors with no response data', async () => {
            const axiosError = new axios.AxiosError();
            axiosError.message = '';
            mock.onPost(`${BASE_URL}/shortener`).reply(() => Promise.reject(axiosError));

            await expect(sdk.shortenUrl(testUrl))
                .rejects
                .toThrow('Failed to shorten URL: ');
        });

        it('should handle Axios error with no data or message', async () => {
            const axiosError = new axios.AxiosError();
            Object.defineProperty(axiosError, 'message', { value: undefined });
            Object.defineProperty(axiosError, 'response', { value: undefined });
            mock.onPost(`${BASE_URL}/shortener`).reply(() => Promise.reject(axiosError));

            await expect(sdk.shortenUrl(testUrl))
                .rejects
                .toThrow('Failed to shorten URL: undefined');
        });

        it('should handle Axios error with empty response object', async () => {
            const axiosError = new axios.AxiosError();
            Object.defineProperty(axiosError, 'message', { value: 'Network error' });
            Object.defineProperty(axiosError, 'response', { value: {} });
            mock.onPost(`${BASE_URL}/shortener`).reply(() => Promise.reject(axiosError));

            await expect(sdk.shortenUrl(testUrl))
                .rejects
                .toThrow('Failed to shorten URL: Network error');
        });

        it('should use error.message when response.data.message is empty', async () => {
            const axiosError = new axios.AxiosError();
            axiosError.message = 'Network timeout';
            Object.defineProperty(axiosError, 'response', {
                value: {
                    data: {
                        message: ''
                    }
                }
            });
            mock.onPost(`${BASE_URL}/shortener`).reply(() => Promise.reject(axiosError));

            await expect(sdk.shortenUrl(testUrl))
                .rejects
                .toThrow('Failed to shorten URL: Network timeout');
        });

        it('should handle Axios error with empty response and message', async () => {
            const axiosError = new axios.AxiosError();
            Object.defineProperty(axiosError, 'response', { value: { data: {} } });
            Object.defineProperty(axiosError, 'message', { value: '' });
            mock.onPost(`${BASE_URL}/shortener`).reply(() => Promise.reject(axiosError));

            await expect(sdk.shortenUrl('https://example.com'))
                .rejects
                .toThrow('Failed to shorten URL: ');
        });

        it('should handle custom errors directly from the shortener module', async () => {
            const customError = new Error('Custom module error');
            mock.onPost(`${BASE_URL}/shortener`).reply(() => Promise.reject(customError));

            await expect(sdk.shortenUrl('https://example.com'))
                .rejects
                .toBe(customError);
        });
    });

    describe('uploadFile', () => {
        const mockResponse = {
            success: true,
            message: 'File Uploaded',
            imageUrl: 'https://i.e-z.host/file.jpg',
            rawUrl: 'https://r2.e-z.host/uuid/file.jpg',
            deletionUrl: 'https://api.e-z.host/files/delete?key=random-deletion-key'
        };

        it('should throw error if file is not provided', async () => {
            await expect(sdk.uploadFile(null as any)).rejects.toThrow('File is required');
        });

        it('should successfully upload a file', async () => {
            const file = Buffer.from('test file content');
            mock.onPost(`${BASE_URL}/files`).reply(200, mockResponse);
            const response = await sdk.uploadFile(file);
            expect(response).toEqual(mockResponse);
        });

        it('should send correct request headers for file upload', async () => {
            const file = Buffer.from('test file content');
            mock.onPost(`${BASE_URL}/files`).reply(config => {
                expect(config.headers?.['Content-Type']).toContain('multipart/form-data');
                expect(config.headers?.['key']).toBe(API_KEY);
                return [200, mockResponse];
            });

            await sdk.uploadFile(file);
        });

        it('should handle file upload API errors', async () => {
            const file = Buffer.from('test file content');
            const errorMessage = 'File too large';
            mock.onPost(`${BASE_URL}/files`).reply(400, {
                success: false,
                message: errorMessage
            });

            await expect(sdk.uploadFile(file))
                .rejects
                .toThrow(`Failed to upload file: ${errorMessage}`);
        });
    });

    describe('createPaste', () => {
        const testText = 'Test paste content';
        const mockResponse = {
            success: true,
            message: 'Paste Created',
            pasteUrl: 'https://i.e-z.gg/p/xyz123',
            rawUrl: 'https://i.e-z.gg/p/raw/xyz123',
            deletionUrl: 'https://api.e-z.host/paste/delete?key=random-deletion-key'
        };

        it('should throw error if text is not provided', async () => {
            await expect(sdk.createPaste('')).rejects.toThrow('Paste text is required and cannot be empty');
        });

        it('should successfully create a paste', async () => {
            mock.onPost(`${BASE_URL}/paste`).reply(200, mockResponse);
            const response = await sdk.createPaste(testText);
            expect(response).toEqual(mockResponse);
        });

        it('should send correct request headers for paste creation', async () => {
            mock.onPost(`${BASE_URL}/paste`).reply(config => {
                expect(config.headers?.['Content-Type']).toBe('application/json');
                expect(config.headers?.['key']).toBe(API_KEY);
                return [200, mockResponse];
            });

            await sdk.createPaste(testText);
        });

        it('should send correct paste options', async () => {
            const options = {
                title: 'Test Title',
                description: 'Test Description',
                language: 'javascript'
            };

            mock.onPost(`${BASE_URL}/paste`).reply(config => {
                const payload = JSON.parse(config.data);
                expect(payload).toEqual({
                    text: testText,
                    ...options
                });
                return [200, mockResponse];
            });

            await sdk.createPaste(testText, options);
        });

        it('should handle paste creation API errors', async () => {
            const errorMessage = 'Invalid paste content';
            mock.onPost(`${BASE_URL}/paste`).reply(400, {
                success: false,
                message: errorMessage
            });

            await expect(sdk.createPaste(testText))
                .rejects
                .toThrow(`Failed to create paste: ${errorMessage}`);
        });
    });
});