import { EZHostSDK } from '../main';
import * as fs from 'fs/promises';
import * as path from 'path';

if (!process.env.EZHOST_API_KEY) {
  throw new Error('EZHOST_API_KEY environment variable is required');
}

const sdk = new EZHostSDK(process.env.EZHOST_API_KEY);

async function pasteExample() {
  try {
    const simpleText = 'Hello, this is a simple paste!';
    const simplePaste = await sdk.createPaste(simpleText);
    console.log('Simple Paste Created!');
    console.log('Paste URL:', simplePaste.pasteUrl);
    console.log('Raw URL:', simplePaste.rawUrl);
    console.log('Deletion URL:', simplePaste.deletionUrl);

    const codeExample = `function hello() {
    console.log("Hello, World!");
}`;
    const codePaste = await sdk.createPaste(codeExample, {
      title: 'Hello World Function',
      description: 'A simple JavaScript function example',
      language: 'javascript',
    });
    console.log('\nCode Paste Created!');
    console.log('Paste URL:', codePaste.pasteUrl);
    console.log('Raw URL:', codePaste.rawUrl);
    console.log('Deletion URL:', codePaste.deletionUrl);

    try {
      const assetPath = path.join(__dirname, '..', 'assets', 'example-file.txt');
      let fileContent;

      try {
        fileContent = await fs.readFile(assetPath, 'utf-8');
      } catch {
        fileContent =
          'This is example file content.\nIt contains multiple lines.\nCreated as a fallback.';
        console.log('Using fallback content since example-file.txt was not found.');
      }

      const filePaste = await sdk.createPaste(fileContent, {
        title: 'File Content Paste',
        description: 'Content from a file or fallback',
      });
      console.log('\nFile Content Paste Created!');
      console.log('Paste URL:', filePaste.pasteUrl);
      console.log('Raw URL:', filePaste.rawUrl);
      console.log('Deletion URL:', filePaste.deletionUrl);
    } catch (fileError: unknown) {
      console.error(
        'File paste creation failed:',
        fileError instanceof Error ? fileError.message : 'Unknown error'
      );
    }
  } catch (error: unknown) {
    console.error(
      'Paste creation failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

pasteExample();
