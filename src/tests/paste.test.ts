import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { EZHostSDK } from '../main';
import { BASE_URL } from '../lib/utils';

describe('EZHostSDK Paste', () => {
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

        it('should handle Axios error with no response data', async () => {
            const axiosError = new axios.AxiosError();
            axiosError.message = 'Network timeout';
            mock.onPost(`${BASE_URL}/paste`).reply(() => Promise.reject(axiosError));

            await expect(sdk.createPaste(testText))
                .rejects
                .toThrow('Failed to create paste: Network timeout');
        });

        it('should handle Axios error with empty response', async () => {
            const axiosError = new axios.AxiosError();
            Object.defineProperty(axiosError, 'response', { value: { data: {} } });
            Object.defineProperty(axiosError, 'message', { value: '' });
            mock.onPost(`${BASE_URL}/paste`).reply(() => Promise.reject(axiosError));

            await expect(sdk.createPaste(testText))
                .rejects
                .toThrow('Failed to create paste: ');
        });

        it('should handle non-Axios errors', async () => {
            const customError = new Error('Custom error');
            mock.onPost(`${BASE_URL}/paste`).reply(() => {
                throw customError;
            });

            await expect(sdk.createPaste(testText))
                .rejects
                .toBe(customError);
        });

        it('should pass through non-Axios errors without wrapping them', async () => {
            const customError = new Error('Internal SDK error');
            mock.onPost(`${BASE_URL}/paste`).reply(() => {
                return Promise.reject(customError);
            });

            await expect(sdk.createPaste(testText))
                .rejects
                .toBe(customError);
        });
    });
});