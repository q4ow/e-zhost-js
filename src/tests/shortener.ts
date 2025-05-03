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
            shortenedUrl: 'https://i.e-z.gg/s/xyz123',
            deletionUrl: 'https://i.e-z.gg/shortener/delete?key=random-deletion-key'
        };

        it('should throw error if URL is not provided', async () => {
            await expect(sdk.shortenUrl('')).rejects.toThrow('URL is required');
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
    });
});