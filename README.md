# e-zhost-js

Unofficial API wrapper for the E-Z.host API

## Installation

```bash
yarn add e-zhost-js

# or

pnpm add e-zhost-js
```

## Usage

### Initialize the SDK

```typescript
import { EZHostSDK } from 'e-zhost-js';

const client = new EZHostSDK('YOUR_API_KEY');
```

### URL Shortener

```typescript
const result = await client.shortenUrl('https://example.com');
console.log('Shortened URL:', result.shortenedUrl);
```

### File Upload

```typescript
const fileBuffer = Buffer.from('file content');
const uploadResult = await client.uploadFile(fileBuffer, 'filename.txt');
console.log('File URL:', uploadResult.fileUrl);
```

### Create Paste

```typescript
const pasteResult = await client.createPaste('console.log("Hello World!")', {
  title: 'Example Code',
  language: 'javascript'
});
console.log('Paste URL:', pasteResult.pasteUrl);
```
