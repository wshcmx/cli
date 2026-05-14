import { readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const command = process.argv[2];
const distPath = resolve('dist');

if (command === 'clean') {
  rmSync(distPath, { recursive: true, force: true });
  process.exit(0);
}

if (command === 'verify') {
  const typeScriptFiles = [];

  const collectTypeScriptFiles = (directoryPath) => {
    for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
      const entryPath = join(directoryPath, entry.name);

      if (entry.isDirectory()) {
        collectTypeScriptFiles(entryPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.ts')) {
        typeScriptFiles.push(entryPath);
      }
    }
  };

  try {
    collectTypeScriptFiles(distPath);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      process.exit(0);
    }

    throw error;
  }

  if (typeScriptFiles.length > 0) {
    console.error('TypeScript files found in dist:');

    for (const filePath of typeScriptFiles) {
      console.error(filePath);
    }

    process.exit(1);
  }

  process.exit(0);
}

throw new Error(`Unknown command: ${command}`);
