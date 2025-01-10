import { join } from 'node:path';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

function decodeUnicodeEscapes(str: string): string {
  return str.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
    return String.fromCharCode(parseInt(match.substr(2), 16));
  });
}

export function convertUnicodeFiles(outDir: string | undefined) {
  if (outDir === undefined || !existsSync(outDir)) {
    return;
  }

  const files = readdirSync(outDir, { recursive: true });

  files.forEach((file) => {
    const filePath = join(outDir, file.toString());

    if (filePath.endsWith('.js')) {
      let content = readFileSync(filePath, 'utf-8');

      content = decodeUnicodeEscapes(content);
      writeFileSync(filePath, content, 'utf-8');
    }
  });
}