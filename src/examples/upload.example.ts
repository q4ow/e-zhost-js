import { EZHostSDK } from '../main';
import * as fs from 'fs/promises';

if (!process.env.EZHOST_API_KEY) {
    throw new Error('EZHOST_API_KEY environment variable is required');
}

const sdk = new EZHostSDK(process.env.EZHOST_API_KEY);

async function uploadExample() {
    try {
        const imageBuffer = await fs.readFile('src/assets/example-image.jpg');
        const uploadResult = await sdk.uploadFile(imageBuffer, 'example-image.jpg');
        console.log('Image Upload Success!');
        console.log('Image URL:', uploadResult.imageUrl);
        console.log('Raw URL:', uploadResult.rawUrl);
        console.log('Deletion URL:', uploadResult.deletionUrl);
    } catch (error: any) {
        console.error('Upload failed:', error?.message || 'Unknown error');
    }
}

uploadExample();