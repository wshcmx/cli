import { join } from 'node:path';
import { existsSync, readdirSync, readFileSync, renameSync } from 'node:fs';

export function renameNamespaces(outDir: string | undefined) {
  if (outDir === undefined || !existsSync(outDir)) {
    return;
  }

  const files = readdirSync(outDir, { recursive: true });

  files.forEach((file) => {
    const filePath = join(outDir, file.toString());

    if (filePath.endsWith('.js')) {
      let content = readFileSync(filePath, 'utf-8');

      if (content.indexOf('"META:NAMESPACE:') > 0) {
        renameSync(filePath, filePath.replace('.js', '.bs'));
      }
    }
  });
}