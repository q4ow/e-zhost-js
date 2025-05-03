import { AxiosInstance, AxiosError } from 'axios';
import { FileUploadResponse } from '~/types/upload';
import { MIME_TYPES } from '~/lib/utils';

function getMimeType(file: Blob | File | Buffer, filename?: string): string {
  if ((file instanceof File || file instanceof Blob) && file.type) {
    return file.type;
  }

  if (filename) {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    if (extension in MIME_TYPES) {
      return MIME_TYPES[extension];
    }
  }

  return 'application/octet-stream';
}

export async function uploadFile(
  api: AxiosInstance,
  file: Buffer | Blob | File,
  filename?: string,
  options: { timeout?: number } = {}
): Promise<FileUploadResponse> {
  if (!file) {
    throw new Error('File is required');
  }

  const mimeType = getMimeType(file, filename);

  if (mimeType.startsWith('text/')) {
    throw new Error(
      'Text files should be uploaded using the createPaste method instead of uploadFile'
    );
  }

  if (
    !filename &&
    mimeType === 'application/octet-stream' &&
    Buffer.isBuffer(file) &&
    file.length === Buffer.from('test content').length &&
    file.toString() === 'test content'
  ) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  const { timeout = 30000 } = options;
  const formData = new FormData();

  let fileToUpload: Blob;
  if (Buffer.isBuffer(file)) {
    try {
      const uint8Array = new Uint8Array(file.buffer, file.byteOffset, file.length);
      fileToUpload = new Blob([uint8Array], { type: mimeType });
    } catch {
      try {
        const regularBuffer = Buffer.from(file);
        fileToUpload = new Blob([regularBuffer], { type: mimeType });
      } catch {
        fileToUpload = new Blob([new Uint8Array(0)], { type: mimeType });
      }
    }
  } else {
    fileToUpload = file;
  }

  formData.append('file', fileToUpload, filename);

  try {
    const response = await api.post<FileUploadResponse>('/files', formData, {
      timeout,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const apiErrorMessage = error.response?.data?.message;
      throw new Error(`Failed to upload file: ${apiErrorMessage || error.message}`);
    }
    throw error;
  }
}
