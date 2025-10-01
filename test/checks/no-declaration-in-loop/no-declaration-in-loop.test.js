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
import { logger } from '#dist/core/logger.js';

function reportDiagnostic(diagnostic) {
  if (diagnostic.file) {
    const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    logger.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
  } else {
    logger.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  }
}

suite('Suite', () => {
  test('Test no-const-declaration-in-loop.ts', (t) => {
    const code = readFileSync(join(import.meta.dirname, 'no-const-declaration-in-loop.ts'), 'utf-8');
    const configuration = getTSConfig(join(import.meta.dirname, '..', 'project'));
    const sourceFile = ts.createSourceFile('no-const-declaration-in-loop.ts', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);

    try {
      ts.transform(sourceFile, [removeExports(), enumsToObjects(), convertTemplateStrings(), transformNamespaces(), noDeclarationInLoop(reportDiagnostic)], configuration.options);
    } catch (error) {
      equal(error.message, "no-const-declaration-in-loop.ts(3,5): error: Variable declaration (const) not allowed inside loop");
    }
  });

  test('Test no-let-declaration-in-loop.ts', (t) => {
    const code = readFileSync(join(import.meta.dirname, 'no-let-declaration-in-loop.ts'), 'utf-8');
    const configuration = getTSConfig(join(import.meta.dirname, '..', 'project'));
    const sourceFile = ts.createSourceFile('no-let-declaration-in-loop.ts', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);

    try {
      ts.transform(sourceFile, [removeExports(), enumsToObjects(), convertTemplateStrings(), transformNamespaces(), noDeclarationInLoop(reportDiagnostic)], configuration.options);
    } catch (error) {
      equal(error.message, "no-let-declaration-in-loop.ts(3,5): error: Variable declaration (let) not allowed inside loop");
    }
  });

  test('Test no-var-declaration-in-loop.ts', (t) => {
    const code = readFileSync(join(import.meta.dirname, 'no-var-declaration-in-loop.ts'), 'utf-8');
    const configuration = getTSConfig(join(import.meta.dirname, '..', 'project'));
    const sourceFile = ts.createSourceFile('no-var-declaration-in-loop.ts', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);

    try {
      ts.transform(sourceFile, [removeExports(), enumsToObjects(), convertTemplateStrings(), transformNamespaces(), noDeclarationInLoop(reportDiagnostic)], configuration.options);
    } catch (error) {
      equal(error.message, "no-var-declaration-in-loop.ts(3,5): error: Variable declaration (var) not allowed inside loop");
    }
  });

  test('Test with diagnostic handler', (t) => {
    const code = readFileSync(join(import.meta.dirname, 'no-const-declaration-in-loop.ts'), 'utf-8');
    const configuration = getTSConfig(join(import.meta.dirname, '..', 'project'));
    const sourceFile = ts.createSourceFile('test-diagnostic.ts', code, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);

    const diagnostics = [];
    ts.transform(sourceFile, [removeExports(), enumsToObjects(), convertTemplateStrings(), transformNamespaces(), noDeclarationInLoop((d) => diagnostics.push(d))], configuration.options);

    equal(diagnostics.length, 1);
    equal(diagnostics[0].messageText, 'Variable declaration (const) not allowed inside loop');
    equal(diagnostics[0].category, ts.DiagnosticCategory.Error);
    equal(diagnostics[0].code, 9001);
  });
});