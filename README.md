# e-zsdk

Unofficial SDK for the E-Z.host API

## Installation

```bash
yarn add e-zsdk

# or

pnpm add e-zsdk
```

## Usage

### Initialize the SDK

```typescript
import { EZHostSDK } from 'e-zsdk';

// Initialize with your API key
const ezhost = new EZHostSDK('YOUR_API_KEY');
```

### URL Shortener

```typescript
// Shorten a URL
const result = await ezhost.shortenUrl('https://example.com');
console.log('Shortened URL:', result.shortenedUrl);
```

### File Upload

```typescript
// Upload a file from buffer
const fileBuffer = Buffer.from('file content');
const uploadResult = await ezhost.uploadFile(fileBuffer, 'filename.txt');
console.log('File URL:', uploadResult.fileUrl);
```

### Create Paste

```typescript
// Create a new text paste
const pasteResult = await ezhost.createPaste('console.log("Hello World!")', {
  title: 'Example Code',
  language: 'javascript'
});
console.log('Paste URL:', pasteResult.pasteUrl);
```

## API Reference

### EZHostSDK

#### Constructor

- `constructor(apiKey: string)`: Initialize the SDK with your E-Z.host API key

#### Methods

- `shortenUrl(url: string, options?: { maxUrlLength?: number; timeout?: number }): Promise<ShortenerResponse>`
- `uploadFile(file: Buffer | Blob | File, filename?: string, options?: { timeout?: number }): Promise<FileUploadResponse>`
- `createPaste(text: string, options?: { title?: string; description?: string; language?: string; timeout?: number }): Promise<PasteResponse>`