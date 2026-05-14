import { deepEqual } from 'node:assert';
import { join, normalize } from 'node:path';
import { test, suite } from 'node:test';

import { collectNonTypescriptFiles } from '#dist/core/build.js';
import { getTSConfig } from '#dist/core/config.js';

suite('collectNonTypescriptFiles', () => {
  test('collects only non-js/ts files relative to the tsconfig directory', () => {
    const fixturePath = join(import.meta.dirname, 'fixture');
    const configuration = getTSConfig(fixturePath);
    const nonTypescriptFiles = collectNonTypescriptFiles(configuration).map(normalize);

    deepEqual(nonTypescriptFiles, [
      join(fixturePath, 'src', 'template.xml'),
    ].map(normalize));
  });
});
