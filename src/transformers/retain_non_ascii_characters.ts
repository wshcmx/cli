import { join } from 'node:path';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

function decodeUnicodeEscapes(str: string): string {
  return str.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
    return String.fromCharCode(parseInt(match.substr(2), 16));
  });
}

export function convertUnicodeFiles(outputDir: string | undefined) {
  if (outputDir === undefined) {
    return;
  }

  const files = readdirSync(outputDir);

  files.forEach((file) => {
    const filePath = join(outputDir, file);

    if (filePath.endsWith('.js')) {
      let content = readFileSync(filePath, 'utf-8');

      content = decodeUnicodeEscapes(content);
      writeFileSync(filePath, content, 'utf-8');
      console.log(`Processed: ${filePath}`);
    }
  });
}