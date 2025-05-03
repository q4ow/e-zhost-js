import { EZHostSDK } from '../main';

if (!process.env.EZHOST_API_KEY) {
  throw new Error('EZHOST_API_KEY environment variable is required');
}

const sdk = new EZHostSDK(process.env.EZHOST_API_KEY);

async function example() {
  try {
    const result = await sdk.shortenUrl('https://example.com/very/long/url/that/needs/shortening');
    console.log('URL Shortened!');
    console.log('Short URL:', result.shortendUrl);
    console.log('Deletion URL:', result.deletionUrl);
  } catch (error: unknown) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

example();
