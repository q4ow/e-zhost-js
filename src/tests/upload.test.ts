import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { EZHostSDK } from '../main';
import { BASE_URL } from '../lib/utils';

describe('EZHostSDK Upload', () => {
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

        it('should successfully upload an image file', async () => {
            const file = Buffer.from('fake image content');
            mock.onPost(`${BASE_URL}/files`).reply(200, mockResponse);
            const response = await sdk.uploadFile(file, 'image.jpg');
            expect(response).toEqual(mockResponse);
        });

        it('should successfully upload a video file', async () => {
            const file = Buffer.from('fake video content');
            mock.onPost(`${BASE_URL}/files`).reply(200, mockResponse);
            const response = await sdk.uploadFile(file, 'video.mp4');
            expect(response).toEqual(mockResponse);
        });

        it('should successfully upload an audio file', async () => {
            const file = Buffer.from('fake audio content');
            mock.onPost(`${BASE_URL}/files`).reply(200, mockResponse);
            const response = await sdk.uploadFile(file, 'audio.mp3');
            expect(response).toEqual(mockResponse);
        });

        it('should successfully upload a PDF file', async () => {
            const file = Buffer.from('fake PDF content');
            mock.onPost(`${BASE_URL}/files`).reply(200, mockResponse);
            const response = await sdk.uploadFile(file, 'document.pdf');
            expect(response).toEqual(mockResponse);
        });

        it('should reject text files', async () => {
            const file = Buffer.from('text content');
            await expect(sdk.uploadFile(file, 'text.txt'))
                .rejects
                .toThrow('Text files should be uploaded using the createPaste method instead of uploadFile');
        });

        it('should send correct request headers', async () => {
            const file = Buffer.from('fake image content');
            mock.onPost(`${BASE_URL}/files`).reply(config => {
                expect(config.headers?.['Content-Type']).toContain('multipart/form-data');
                expect(config.headers?.['key']).toBe(API_KEY);
                return [200, mockResponse];
            });

            await sdk.uploadFile(file, 'image.jpg');
        });

        it('should handle API errors', async () => {
            const file = Buffer.from('fake image content');
            const errorMessage = 'File too large';
            mock.onPost(`${BASE_URL}/files`).reply(400, {
                success: false,
                message: errorMessage
            });

            await expect(sdk.uploadFile(file, 'image.jpg'))
                .rejects
                .toThrow(`Failed to upload file: ${errorMessage}`);
        });

        if (typeof window !== 'undefined') {
            it('should handle Blob uploads with correct MIME types', async () => {
                const blob = new Blob(['content'], { type: 'application/pdf' });
                mock.onPost(`${BASE_URL}/files`).reply(200, mockResponse);
                const response = await sdk.uploadFile(blob, 'document.pdf');
                expect(response).toEqual(mockResponse);
            });

            it('should reject Blob uploads with text MIME types', async () => {
                const blob = new Blob(['content'], { type: 'text/plain' });
                await expect(sdk.uploadFile(blob, 'text.txt'))
                    .rejects
                    .toThrow('Text files should be uploaded using the createPaste method instead of uploadFile');
            });

            it('should use type property from Blob or File directly', async () => {
                const customType = 'application/custom-type';
                const blob = new Blob(['content'], { type: customType });
                mock.onPost(`${BASE_URL}/files`).reply(200, mockResponse);

                const response = await sdk.uploadFile(blob);
                expect(response).toEqual(mockResponse);

                mock.onPost(`${BASE_URL}/files`).reply(config => {
                    const formData = config.data;
                    expect(formData.get('file').type).toBe(customType);
                    return [200, mockResponse];
                });

                await sdk.uploadFile(blob);
            });
        }

        it('should handle unsupported MIME types', async () => {
            const file = Buffer.from('test content');
            await expect(sdk.uploadFile(file))
                .rejects
                .toThrow('Unsupported file type: application/octet-stream');
        });

        if (typeof window !== 'undefined') {
            it('should use MIME type from File object', async () => {
                const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
                mock.onPost(`${BASE_URL}/files`).reply(200, mockResponse);
                const response = await sdk.uploadFile(file);
                expect(response).toEqual(mockResponse);
            });

            it('should handle File object without type', async () => {
                const file = new File(['content'], 'test.pdf', { type: '' });
                mock.onPost(`${BASE_URL}/files`).reply(200, mockResponse);
                const response = await sdk.uploadFile(file, 'test.pdf');
                expect(response).toEqual(mockResponse);
            });
        }

        it('should handle Buffer without buffer property', async () => {
            const file = Object.create(Buffer.from('test content'));
            mock.onPost(`${BASE_URL}/files`).reply(200, mockResponse);
            const response = await sdk.uploadFile(file, 'test.pdf');
            expect(response).toEqual(mockResponse);
        });

        it('should handle non-Axios errors', async () => {
            const file = Buffer.from('test content');
            const customError = new Error('Custom error');
            mock.onPost(`${BASE_URL}/files`).reply(() => {
                throw customError;
            });

            await expect(sdk.uploadFile(file, 'test.pdf'))
                .rejects
                .toBe(customError);
        });

        it('should handle Axios error with no response data', async () => {
            const file = Buffer.from('test content');
            const axiosError = new axios.AxiosError();
            axiosError.message = 'Network timeout';
            mock.onPost(`${BASE_URL}/files`).reply(() => Promise.reject(axiosError));

            await expect(sdk.uploadFile(file, 'test.pdf'))
                .rejects
                .toThrow('Failed to upload file: Network timeout');
        });

        it('should handle Axios error with empty response', async () => {
            const file = Buffer.from('test content');
            const axiosError = new axios.AxiosError();
            Object.defineProperty(axiosError, 'response', { value: { data: {} } });
            Object.defineProperty(axiosError, 'message', { value: '' });
            mock.onPost(`${BASE_URL}/files`).reply(() => Promise.reject(axiosError));

            await expect(sdk.uploadFile(file, 'test.pdf'))
                .rejects
                .toThrow('Failed to upload file: ');
        });

        it('should pass through non-Axios errors without wrapping them', async () => {
            const file = Buffer.from('test content');
            const customError = new Error('Internal SDK error');
            mock.onPost(`${BASE_URL}/files`).reply(() => {
                return Promise.reject(customError);
            });

            await expect(sdk.uploadFile(file, 'test.pdf'))
                .rejects
                .toBe(customError);
        });

        it('should handle Buffer with failing Blob creation', async () => {
            const file = Buffer.from('test content');
            const originalBlob = global.Blob;

            let blobCallCount = 0;
            global.Blob = class MockBlob extends originalBlob {
                constructor(...args: any[]) {
                    blobCallCount++;
                    if (blobCallCount <= 2) {
                        throw new Error('Blob creation failed');
                    }
                    super(...args);
                }
            } as any;

            mock.onPost(`${BASE_URL}/files`).reply(200, mockResponse);

            try {
                const response = await sdk.uploadFile(file, 'test.pdf');
                expect(response).toEqual(mockResponse);

                expect(blobCallCount).toBeGreaterThanOrEqual(3);
            } finally {
                global.Blob = originalBlob;
            }
        });
    });
    it('should handle alternative Buffer conversion when primary fails', async () => {
        const file = Buffer.from('test content');
        const originalBlob = global.Blob;
        const expectedResponse = {
            success: true,
            message: 'File Uploaded',
            imageUrl: 'https://i.e-z.host/file.jpg',
            rawUrl: 'https://r2.e-z.host/uuid/file.jpg',
            deletionUrl: 'https://api.e-z.host/files/delete?key=random-deletion-key'
        };

        global.Blob = class MockBlob extends originalBlob {
            static callCount = 0;
            constructor(...args: any[]) {
                MockBlob.callCount++;
                if (MockBlob.callCount === 1) {
                    throw new Error('First conversion failed');
                }
                super(...args);
            }
        } as any;

        mock.onPost(`${BASE_URL}/files`).reply(200, expectedResponse);

        try {
            const response = await sdk.uploadFile(file, 'test.pdf');
            expect(response).toEqual(expectedResponse);
            expect((global.Blob as any)['callCount']).toBe(2);
        } finally {
            global.Blob = originalBlob;
        }
    });
});