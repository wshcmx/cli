import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { suite, test } from 'node:test';
import { strictEqual } from 'node:assert';

import ts from 'typescript';

import { enumsToObjects } from '#dist/transformers/enums_to_objects.js';
import { removeExports } from '#dist/transformers/remove_exports.js';
import { convertTemplateStrings } from '#dist/transformers/template_strings.js';
import { transformNamespaces } from '#dist/transformers/transform_namespaces.js';

suite('API derived transpilation patterns', () => {
  const casesPath = join(import.meta.dirname, 'cases');
  const expectedPath = join(import.meta.dirname, 'expected');
  const caseNames = readdirSync(casesPath)
    .filter((name) => name.endsWith('.ts'))
    .sort();

  for (const caseName of caseNames) {
    test(caseName, () => {
      const code = readFileSync(join(casesPath, caseName), 'utf-8');
      const expectedCode = readFileSync(join(expectedPath, caseName.replace(/\.ts$/, '.js')), 'utf-8');
      const result = ts.transpileModule(code, {
        compilerOptions: {
          module: ts.ModuleKind.Preserve,
          target: ts.ScriptTarget.ES5,
        },
        transformers: {
          before: [
            removeExports(),
            enumsToObjects(),
            convertTemplateStrings(),
            transformNamespaces(),
          ],
        },
      });

      strictEqual(formatOutput(result.outputText), formatOutput(expectedCode));
    });
  }
});

function formatOutput(outputText) {
  return outputText
    .replaceAll('\r\n', '\n')
    .replace(/\\u[\dA-Fa-f]{4}/g, (match) => String.fromCharCode(parseInt(match.slice(2), 16)))
    .trimEnd();
}
