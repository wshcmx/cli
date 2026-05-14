import { join, normalize } from 'node:path';
import { test, suite } from 'node:test';

import { getTSConfig } from '#dist/core/config.js';

suite('getTSConfig', () => {
  test('resolves include and files relative to the tsconfig directory', (t) => {
    const fixturePath = join(import.meta.dirname, 'fixture');
    const configuration = getTSConfig(fixturePath);
    const normalizedFileNames = configuration.fileNames.map(normalize);

    const expectedFileNames = [
      join(fixturePath, 'src', 'main.ts'),
      join(fixturePath, 'types', 'global.d.ts'),
    ].map(normalize);

    expectedFileNames.forEach((fileName) => {
      t.assert.ok(normalizedFileNames.includes(fileName));
    });
  });
});
