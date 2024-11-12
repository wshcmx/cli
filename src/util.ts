import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { extname, dirname, basename, resolve } from "node:path";

const TEMPLATE_REGEX = /\/{3}\s@template\s(.+)/;
const COMPILED_EXTS_MAP = new Map([
  ['.ts', '.js'],
  ['.tsx', '.html'],
  ['.jsx', '.html'],
  ['.js', '.js'],
]);

export function detectContentType(content: string, filePath: string) {
  const ext = extname(filePath);

  if (ext === ".tsx" || ext === ".jsx") {
    return "cwt";
  }

  const matches = TEMPLATE_REGEX.exec(content);

  if (matches === null) {
    return null;
  }

  return matches[1];
}

export function resolveExtname(filePath: string, contentType: string | null) {
  const ext = extname(filePath);

  if (contentType === 'cwt') {
    return resolve(dirname(filePath), `${basename(filePath, ext)}.html`);
  } else if (contentType === 'namespace') {
    return resolve(dirname(filePath), `${basename(filePath, ext)}.bs`);
  }

  if (COMPILED_EXTS_MAP.has(ext)) {
    return resolve(dirname(filePath), `${basename(filePath, ext)}${COMPILED_EXTS_MAP.get(ext)!}`);
  }

  return filePath;
}

export function writeFile(filePath: string, content: string) {
  const dir = dirname(filePath);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(filePath, content);
}

export function needToBeCompiled(filePath: string) {
  return COMPILED_EXTS_MAP.has(extname(filePath));
}