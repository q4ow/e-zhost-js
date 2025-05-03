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

const ezhost = new EZHostSDK('YOUR_API_KEY');
```

### URL Shortener

```typescript
const result = await ezhost.shortenUrl('https://example.com');
console.log('Shortened URL:', result.shortenedUrl);
```

### File Upload

```typescript
const fileBuffer = Buffer.from('file content');
const uploadResult = await ezhost.uploadFile(fileBuffer, 'filename.txt');
console.log('File URL:', uploadResult.fileUrl);
```

### Create Paste

```typescript
const pasteResult = await ezhost.createPaste('console.log("Hello World!")', {
  title: 'Example Code',
  language: 'javascript'
});
console.log('Paste URL:', pasteResult.pasteUrl);
```
