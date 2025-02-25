import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, suite } from 'node:test';

import ts from 'typescript';

import { getTSConfig } from '#dist/core/config.js';
import { removeExports } from '#dist/transformers/remove_exports.js';
import { enumsToObjects } from '#dist/transformers/enums_to_objects.js';
import { convertTemplateStrings } from '#dist/transformers/template_strings.js';
import { transformNamespaces } from '#dist/transformers/transform_namespaces.js';

suite('Suite', () => {
  const code = readFileSync(join(import.meta.dirname, 'case.ts'), 'utf-8');

  test('Test', (t) => {
    const configuration = getTSConfig(join(import.meta.dirname, '..', 'project'));
    const sourceFile = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
    const result = ts.transform(sourceFile, [removeExports(), enumsToObjects(), convertTemplateStrings(), transformNamespaces(),], configuration.options);
    const transformedSourceFile = result.transformed[0];
    const printer = ts.createPrinter();
    const transformedCode = printer.printFile(transformedSourceFile);
    result.dispose();
    t.assert.snapshot(transformedCode);
  });
});