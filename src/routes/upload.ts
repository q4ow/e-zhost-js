import { AxiosInstance, AxiosError } from 'axios';
import { MIME_TYPES } from '../lib/utils';
import { FileUploadResponse } from '../types/upload';
import { Readable } from 'stream';
import { ReadStream } from 'fs';
import { basename } from 'path';

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

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer | string) =>
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    );
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function uploadFile(
  api: AxiosInstance,
  file: Buffer | Blob | File | Readable,
  filename?: string,
  options: { timeout?: number } = {}
): Promise<FileUploadResponse> {
  if (!file) {
    return { success: false, message: 'File is required', error: 'File is required' };
  }

  let fileBuffer: Buffer;
  let resolvedFilename = filename;

  try {
    if (file instanceof Readable) {
      fileBuffer = await streamToBuffer(file);
      if (!resolvedFilename) {
        if (file instanceof ReadStream) {
          const filePath: string | Buffer | undefined = file.path;
          if (typeof filePath === 'string') {
            resolvedFilename = basename(filePath);
          } else if (Buffer.isBuffer(filePath)) {
            resolvedFilename = basename(filePath.toString());
          } else {
            resolvedFilename = 'upload.dat';
          }
        } else {
          resolvedFilename = 'upload.dat';
        }
      }
    } else if (file instanceof File) {
      fileBuffer = Buffer.from(await file.arrayBuffer());
      resolvedFilename = resolvedFilename || file.name;
    } else if (file instanceof Blob) {
      fileBuffer = Buffer.from(await file.arrayBuffer());
      resolvedFilename = resolvedFilename || 'upload.dat';
    } else if (Buffer.isBuffer(file)) {
      fileBuffer = file;
      resolvedFilename = resolvedFilename || 'upload.dat';
    } else {
      return { success: false, message: 'Invalid file type provided.', error: 'Invalid file type' };
    }
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, message: 'Failed to process file input', error: err.message };
  }

  if (!resolvedFilename) {
    resolvedFilename = 'upload.dat';
  }

  const mimeType = getMimeType(
    new Blob([fileBuffer], { type: 'application/octet-stream' }),
    resolvedFilename
  );

  if (mimeType.startsWith('text/')) {
    return {
      success: false,
      message: 'Text files should be uploaded using the createPaste method instead of uploadFile',
      error: 'Invalid file type for uploadFile (text file)',
    };
  }

  const { timeout = 30000 } = options;
  const formData = new FormData();

  const fileToUpload = new Blob([fileBuffer], { type: mimeType });
  formData.append('file', fileToUpload, resolvedFilename);

  try {
    const response = await api.post<FileUploadResponse>('/files', formData, {
      timeout,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.success) {
      return response.data;
    } else {
      return {
        success: false,
        message: response.data?.message || 'Upload failed due to an API error.',
        error: response.data?.message || 'API indicated failure.',
      };
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      const apiErrorMessage = error.response?.data?.message || error.message;
      return {
        success: false,
        message: `Failed to upload file: ${apiErrorMessage}`,
        error: apiErrorMessage,
      };
    }
    const err = error as Error;
    return {
      success: false,
      message: 'An unexpected error occurred during file upload.',
      error: err.message,
    };
  }
}
