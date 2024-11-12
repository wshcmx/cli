import ts, { CompilerOptions } from 'typescript';
import { relative, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { detectContentType, needToBeCompiled, resolveExtname, writeFile } from './util.js';

export function pretransform(code: string) {
  function visitor(node: ts.Node): ts.VisitResult<ts.Node> {
    if (ts.isInterfaceDeclaration(node)) {
      const modifiers = node.modifiers;

      if (modifiers) {
        const updatedModifiers = modifiers.filter((modifier) => modifier.kind !== ts.SyntaxKind.ExportKeyword);

        return ts.factory.updateInterfaceDeclaration(
          node,
          updatedModifiers,
          node.name,
          node.typeParameters,
          node.heritageClauses,
          node.members
        );
      }
    }

    if (ts.isExportDeclaration(node) || ts.isImportDeclaration(node)) {
      return ts.factory.createNotEmittedStatement(node);
    }

    if (ts.isTypeAliasDeclaration(node) && node.modifiers) {
      const modifiers = node.modifiers.filter(mod => mod.kind !== ts.SyntaxKind.ExportKeyword);
      node = ts.factory.updateTypeAliasDeclaration(
        node,
        modifiers,
        node.name,
        node.typeParameters,
        node.type
      );
    }

    if (ts.isFunctionDeclaration(node) && node.modifiers) {
      const modifiers = node.modifiers.filter(mod => mod.kind !== ts.SyntaxKind.ExportKeyword);
      node = ts.factory.updateFunctionDeclaration(
        node,
        modifiers,
        node.asteriskToken,
        node.name,
        node.typeParameters,
        node.parameters,
        node.type,
        node.body
      );
    }

    if (ts.isVariableStatement(node) && node.modifiers) {
      const modifiers = node.modifiers.filter(mod => mod.kind !== ts.SyntaxKind.ExportKeyword);
      node = ts.factory.updateVariableStatement(
        node,
        modifiers,
        node.declarationList
      );
    }

    if (ts.isModuleDeclaration(node) && (node.flags & ts.NodeFlags.Namespace)) {
      if (node.body && ts.isModuleBlock(node.body)) {
        const statements = node.body.statements.map((statement) => ts.visitNode(statement, visitor));
        statements.unshift(
          ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier(`"META:NAMESPACE:${node.name.text}"`),
            undefined,
            undefined,
            undefined
          )
        );
        return statements;
      }

      return undefined as unknown as ts.VisitResult<ts.Node>;
    }

    if (ts.isTemplateExpression(node)) {
      const expressions: ts.Expression[] = [ts.factory.createStringLiteral(node.head.text)];

      node.templateSpans.forEach(span => {
        expressions.push(span.expression);
        expressions.push(ts.factory.createStringLiteral(span.literal.text));
      });

      let concatenated: ts.Expression = expressions[0];

      for (let i = 1; i < expressions.length; i++) {
        concatenated = ts.factory.createBinaryExpression(
          concatenated,
          ts.SyntaxKind.PlusToken,
          expressions[i]
        );
      }

      return concatenated;
    }

    if (ts.isEnumDeclaration(node)) {
      const members = node.members.map((member, index) => {
        const name = member.name;
        const initializer = member.initializer || ts.factory.createNumericLiteral(index);
        return ts.factory.createPropertyAssignment(name, initializer);
      });

      const objectLiteral = ts.factory.createObjectLiteralExpression(members, true);
      const variableStatement = ts.factory.createVariableStatement(
        [],
        [ts.factory.createVariableDeclaration(node.name, undefined, undefined, objectLiteral)]
      );

      return variableStatement;
    }

    return ts.visitEachChild(node, visitor, undefined);
  }

  const sourceFile = ts.createSourceFile('', code, ts.ScriptTarget.ES5, true);
  const result = ts.transform(sourceFile, [() => (rootNode: ts.Node) => ts.visitNode(rootNode, visitor)]);
  const printer = ts.createPrinter();
  return printer.printFile(result.transformed[0].getSourceFile());
}

export function addUtfBom(code: string) {
  return `\ufeff${code}`;
}

export function wrapASP(code: string) {
  return `<%\n\n${code}\n%>\n`;
}

export function transpile(filePath: string, compilerOptions: CompilerOptions) {
  filePath = resolve(compilerOptions.rootDir!, filePath);
  let code = readFileSync(filePath, 'utf-8');
  const contentType = detectContentType(code, filePath);
  const outputFilePath = resolve(compilerOptions.outDir!, relative(compilerOptions.rootDir!, resolveExtname(filePath, contentType)));

  if (!needToBeCompiled(filePath) && contentType === null) {
    writeFile(outputFilePath, code);
    return [ code, filePath, outputFilePath ];
  }

  code = [
    pretransform,
    (code: string) => ts.transpile(code, compilerOptions),
    (code: string) => contentType === 'cwt' ? wrapASP(code) : code,
    addUtfBom
  ].reduce((acc, fn) => fn(acc), code);

  writeFile(outputFilePath, code);

  return [ code, filePath, outputFilePath ];
}