import { basename, join } from 'node:path';
import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';

export function renameNamespaces(outDir: string | undefined) {
  if (outDir === undefined || !existsSync(outDir)) {
    return;
  }

  const files = readdirSync(outDir, { recursive: true });

  files.forEach((file) => {
    const filePath = join(outDir, file.toString());

    if (filePath.endsWith('.js')) {
      let content = readFileSync(filePath, 'utf-8');

      if (content.startsWith('"META:NAMESPACE:')) {
        renameSync(filePath, filePath.replace('.js', '.bs'));
      }
    }
  });
}