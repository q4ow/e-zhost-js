# e-zhost-js

Unofficial API wrapper for the E-Z.host API

## Installation

```bash
yarn add e-zhost-js

# or

pnpm add e-zhost-js
```

## Usage

### URL Shortener

```typescript
import { EZHostSDK } from 'e-zhost-js';

const client = new EZHostSDK('YOUR_API_KEY');

const result = await client.shortenUrl('https://example.com');
console.log('Shortened URL:', result.shortenedUrl);
```

### Create Paste

```typescript
import { EZHostSDK } from 'e-zhost-js';

const client = new EZHostSDK('YOUR_API_KEY');

const pasteResult = await client.createPaste('console.log("Hello World!")', {
  title: 'Example Code',
  language: 'javascript'
});
console.log('Paste URL:', pasteResult.pasteUrl);
```

### File Upload

```typescript
import { EZHostSDK } from 'e-zhost-js';
import { createReadStream } from 'fs';

const client = new EZHostSDK('YOUR-API-KEY');

async function uploadExample() {
  try {
    const filePath = './src/assets/example-image.jpg'; // update this path
    const fileStream = createReadStream(filePath);
    const streamUploadResult = await client.uploadFile(fileStream, 'example-image.jpg');

    if (streamUploadResult.success) {
      console.log('Stream Upload Successful!');
      console.log('Image URL:', streamUploadResult.imageUrl);
      console.log('Raw URL:', streamUploadResult.rawUrl);
      console.log('Deletion URL:', streamUploadResult.deletionUrl);
    } else {
      console.error('Stream Upload Failed:');
      console.error('Message:', streamUploadResult.message);
      if (streamUploadResult.error) {
        console.error('Error Details:', streamUploadResult.error);
      }
    }
  } catch (err: any) {
    console.error('Upload error:', err.message);
  }
}

uploadExample();
```
