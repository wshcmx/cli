import { equal } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, suite } from 'node:test';

import ts from 'typescript';

import { getTSConfig } from '#dist/core/config.js';
import { removeExports } from '#dist/transformers/remove_exports.js';
import { enumsToObjects } from '#dist/transformers/enums_to_objects.js';
import { convertTemplateStrings } from '#dist/transformers/template_strings.js';
import { transformNamespaces } from '#dist/transformers/transform_namespaces.js';
import { noDeclarationInLoop } from '#dist/checks/no-declaration-in-loop.js';

suite('Suite', () => {
  test('Test no-const-declaration-in-loop.ts', (t) => {
    const code = readFileSync(join(import.meta.dirname, 'no-const-declaration-in-loop.ts'), 'utf-8');
    const configuration = getTSConfig(join(import.meta.dirname, '..', 'project'));
    const sourceFile = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);

    try {
      ts.transform(sourceFile, [removeExports(), enumsToObjects(), convertTemplateStrings(), transformNamespaces(), noDeclarationInLoop()], configuration.options);
    } catch (error) {
      equal(error.message, "Variable declaration (const) not allowed inside loop");
    }
  });

  test('Test no-let-declaration-in-loop.ts', (t) => {
    const code = readFileSync(join(import.meta.dirname, 'no-let-declaration-in-loop.ts'), 'utf-8');
    const configuration = getTSConfig(join(import.meta.dirname, '..', 'project'));
    const sourceFile = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);

    try {
      ts.transform(sourceFile, [removeExports(), enumsToObjects(), convertTemplateStrings(), transformNamespaces(), noDeclarationInLoop()], configuration.options);
    } catch (error) {
      equal(error.message, "Variable declaration (let) not allowed inside loop");
    }
  });

  test('Test no-var-declaration-in-loop.ts', (t) => {
    const code = readFileSync(join(import.meta.dirname, 'no-var-declaration-in-loop.ts'), 'utf-8');
    const configuration = getTSConfig(join(import.meta.dirname, '..', 'project'));
    const sourceFile = ts.createSourceFile('', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);

    try {
      ts.transform(sourceFile, [removeExports(), enumsToObjects(), convertTemplateStrings(), transformNamespaces(), noDeclarationInLoop()], configuration.options);
    } catch (error) {
      equal(error.message, "Variable declaration (var) not allowed inside loop");
    }
  });
});